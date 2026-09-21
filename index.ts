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
app.get("*", async (c) => {
  await initDatabase();
  return c.html(Root());
});

app.onError((err) => Promise.reject(err));
export default app.fetch;