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
async function resolveSeo(c:any){
  const url=new URL(c.req.url);
  const origin=url.origin;
  const path=url.pathname.replace(/\/+$/,"")||"/";
  const seo:any={
    title:"Vijevira Labs — Engineering, Research & Building",
    description:"Practical engineering knowledge, research, developer tools, and project notes.",
    canonical:origin+path,
    robots:"index,follow",
    ogType:"website",
  };
  if(path==="/"){
    seo.jsonLd={"@context":"https://schema.org","@type":"WebSite","name":"Vijevira Labs","url":origin,"description":seo.description};
    return seo;
  }
  if(path==="/blog"){seo.title="Blog — Vijevira Labs";seo.description="Engineering articles, tutorials, guides, comparisons, and build notes from Vijevira Labs.";return seo;}
  if(path==="/research"){seo.title="Research — Vijevira Labs";seo.description="Technical investigations, experiments, findings, and implementation research.";return seo;}
  if(path==="/tools"){seo.title="Developer Tools — Vijevira Labs";seo.description="Useful developer services, infrastructure, APIs, media, and free-tier tools.";return seo;}
  if(path==="/projects"){seo.title="Projects — Vijevira Labs";seo.description="Applications, experiments, architecture work, and projects being built in the lab.";return seo;}
  if(path==="/about"){seo.title="About — Vijevira Labs";seo.description="About Vijevira Labs, an independent engineering lab for building, researching, and documenting software.";return seo;}
  if(path==="/search"){seo.title="Search — Vijevira Labs";seo.description="Search engineering articles and technical notes from Vijevira Labs.";seo.robots="noindex,follow";return seo;}
  if(path.startsWith("/admin")){seo.title="Admin — Vijevira Labs";seo.description="Vijevira Labs administration workspace.";seo.robots="noindex,nofollow";return seo;}
  if(path.startsWith("/blog/")){
    const slug=decodeURIComponent(path.slice(6));
    const row=(await sqlite.execute("SELECT title,description,slug,published_at,updated_at,cover_image_id FROM posts WHERE slug=? AND status='published' LIMIT 1",[slug])).rows[0] as any;
    if(row){
      seo.title=String(row.title)+" — Vijevira Labs";
      seo.description=String(row.description||"Engineering article from Vijevira Labs.");
      seo.ogType="article";
      seo.jsonLd={"@context":"https://schema.org","@type":"Article","headline":row.title,"description":row.description||"","datePublished":row.published_at||undefined,"dateModified":row.updated_at||row.published_at||undefined,"mainEntityOfPage":{"@type":"WebPage","@id":origin+path},"publisher":{"@type":"Organization","name":"Vijevira Labs","url":origin}};
    }
    return seo;
  }
  if(path.startsWith("/tools/")){
    const slug=decodeURIComponent(path.slice(7));
    const row=(await sqlite.execute("SELECT name,description,slug,logo_url FROM tools WHERE slug=? LIMIT 1",[slug])).rows[0] as any;
    if(row){seo.title=String(row.name)+" — Vijevira Labs";seo.description=String(row.description||"Developer tool notes from Vijevira Labs.");if(row.logo_url)seo.image=row.logo_url;}
    return seo;
  }
  if(path.startsWith("/projects/")){
    const slug=decodeURIComponent(path.slice(10));
    const row=(await sqlite.execute("SELECT name,description,slug,cover_image_id FROM projects WHERE slug=? LIMIT 1",[slug])).rows[0] as any;
    if(row){seo.title=String(row.name)+" — Vijevira Labs";seo.description=String(row.description||"Project notes and implementation work from Vijevira Labs.");}
    return seo;
  }
  if(path.startsWith("/research/")){
    const id=Number(path.slice(10));
    const row=(await sqlite.execute("SELECT id,title,description,published_at,updated_at FROM posts WHERE id=? AND status='published' AND content_type='research' LIMIT 1",[id])).rows[0] as any;
    if(row){seo.title=String(row.title)+" — Vijevira Labs";seo.description=String(row.description||"Technical investigation from Vijevira Labs.");seo.ogType="article";seo.jsonLd={"@context":"https://schema.org","@type":"Article","headline":row.title,"description":row.description||"","datePublished":row.published_at||undefined,"dateModified":row.updated_at||undefined,"mainEntityOfPage":{"@type":"WebPage","@id":origin+path},"publisher":{"@type":"Organization","name":"Vijevira Labs","url":origin}};}
    return seo;
  }
  if(path.startsWith("/topics/")){
    const slug=decodeURIComponent(path.slice(8));
    const row=(await sqlite.execute("SELECT name,description,slug FROM categories WHERE slug=? LIMIT 1",[slug])).rows[0] as any;
    if(row){seo.title=String(row.name)+" — Vijevira Labs";seo.description=String(row.description||"Articles about "+row.name+" from Vijevira Labs.");}
    return seo;
  }
  if(path.startsWith("/tags/")){
    const slug=decodeURIComponent(path.slice(6));
    const row=(await sqlite.execute("SELECT name,slug FROM tags WHERE slug=? LIMIT 1",[slug])).rows[0] as any;
    if(row){seo.title=String(row.name)+" — Vijevira Labs";seo.description="Articles tagged "+row.name+" from Vijevira Labs.";}
    return seo;
  }
  seo.robots="noindex,follow";
  return seo;
}
app.get("*", async (c) => {
  await initDatabase();
  return c.html(Root(await resolveSeo(c)));
});

app.onError((err) => Promise.reject(err));
export default app.fetch;