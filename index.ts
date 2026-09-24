import { parseVal, serveImmutableFile } from "https://esm.town/v/std/utils/index.ts";
import { Hono } from "npm:hono";
import { Root } from "./frontend/root.tsx";
import { api } from "./api/index.ts";
import { initDatabase, sqlite } from "./lib/db.ts";

const app = new Hono();

app.route("/api", api);
app.get("/__immutable/*", (c) => serveImmutableFile(c.req.path));
app.get("/source", (c) => c.redirect(parseVal().links.self.val));
app.get("/rss.xml", async (c) => {
  await initDatabase();
  const rows = await sqlite.execute("SELECT title,slug,description,published_at,updated_at FROM posts WHERE status='published' ORDER BY published_at DESC LIMIT 50");
  const escXml = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  const origin = new URL(c.req.url).origin;
  const items = (rows.rows as any[]).map((p) => "<item><title>" + escXml(p.title) + "</title><link>" + origin + "/blog/" + encodeURIComponent(p.slug) + "</link><guid>" + origin + "/blog/" + encodeURIComponent(p.slug) + "</guid><description>" + escXml(p.description) + "</description><pubDate>" + new Date(p.published_at || p.updated_at).toUTCString() + "</pubDate></item>").join("");
  return c.body('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Vijevira Labs</title><link>' + origin + '</link><description>Engineering, Research &amp; Building.</description>' + items + "</channel></rss>", 200, {"Content-Type":"application/rss+xml; charset=UTF-8"});
});
app.get("/robots.txt", (c) => c.body("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: " + new URL("/sitemap.xml", c.req.url).href + "\n", 200, {"Content-Type":"text/plain; charset=UTF-8"}));
app.get("/sitemap.xml", async (c) => {
  await initDatabase();
  const origin = new URL(c.req.url).origin;
  const urls = new Set<string>(["/","/blog","/research","/tools","/projects","/about"]);
  const [posts,toolsRows,projectRows,researchRows,categories,tags] = await Promise.all([
    sqlite.execute("SELECT slug,updated_at FROM posts WHERE status='published' AND content_type!='research'"),
    sqlite.execute("SELECT slug,updated_at FROM tools"),
    sqlite.execute("SELECT slug,updated_at FROM projects"),
    sqlite.execute("SELECT id,updated_at FROM posts WHERE status='published' AND content_type='research'"),
    sqlite.execute("SELECT slug,updated_at FROM categories"),
    sqlite.execute("SELECT slug,created_at FROM tags")
  ]);
  for(const p of posts.rows as any[]) urls.add("/blog/"+encodeURIComponent(p.slug));
  for(const x of toolsRows.rows as any[]) urls.add("/tools/"+encodeURIComponent(x.slug));
  for(const x of projectRows.rows as any[]) urls.add("/projects/"+encodeURIComponent(x.slug));
  for(const x of researchRows.rows as any[]) urls.add("/research/"+encodeURIComponent(String(x.id)));
  for(const x of categories.rows as any[]) urls.add("/topics/"+encodeURIComponent(x.slug));
  for(const x of tags.rows as any[]) urls.add("/tags/"+encodeURIComponent(x.slug));
  const lastByPath = new Map<string,string>();
  for(const p of posts.rows as any[]) lastByPath.set("/blog/"+encodeURIComponent(p.slug),p.updated_at);
  for(const x of toolsRows.rows as any[]) lastByPath.set("/tools/"+encodeURIComponent(x.slug),x.updated_at);
  for(const x of projectRows.rows as any[]) lastByPath.set("/projects/"+encodeURIComponent(x.slug),x.updated_at);
  for(const x of researchRows.rows as any[]) lastByPath.set("/research/"+encodeURIComponent(String(x.id)),x.updated_at);
  for(const x of categories.rows as any[]) lastByPath.set("/topics/"+encodeURIComponent(x.slug),x.updated_at);
  const xml=[...urls].map(path=>"<url><loc>"+origin+path+"</loc>"+(lastByPath.get(path)?"<lastmod>"+new Date(lastByPath.get(path) as string).toISOString()+"</lastmod>":"")+"</url>").join("");
  return c.body('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+xml+"</urlset>",200,{"Content-Type":"application/xml; charset=UTF-8"});
});
app.get("*", async (c) => {
  await initDatabase();
  return c.html(Root());
});

app.onError((err) => Promise.reject(err));
export default app.fetch;