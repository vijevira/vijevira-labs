import { Hono } from "npm:hono";
import { initDatabase, sqlite } from "../lib/db.ts";
import { requireAuth } from "./middleware.ts";

const router = new Hono();
const slugify = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
const validName = (b: any) => typeof b?.name === "string" && b.name.trim().length > 0;

async function list(c: any, table: string) {
10|  await initDatabase();
11|  const result = await sqlite.execute(`SELECT * FROM ${table} ORDER BY name ASC`);
12|  return c.json({ data: result.rows });
13|}
14|
15|router.get("/categories", c => list(c, "categories"));
16|router.get("/tags", c => list(c, "tags"));
17|router.get("/technologies", c => list(c, "technologies"));
18|
19|router.post("/categories", requireAuth, async c => {
20|  await initDatabase(); const b = await c.req.json();
21|  if (!validName(b)) return c.json({ error: { code: "INVALID_NAME", message: "Name is required." } }, 400);
22|  const name=b.name.trim(), slug=slugify(b.slug||name);
23|  try { const r=await sqlite.execute("INSERT INTO categories (name,slug,description) VALUES (?,?,?)",[name,slug,b.description?.trim()||null]); return c.json({data:{id:Number(r.lastInsertRowid),name,slug,description:b.description?.trim()||null}},201); }
24|  catch { return c.json({error:{code:"CATEGORY_EXISTS",message:"Category name or slug already exists."}},409); }
25|});
26|router.post("/tags", requireAuth, async c => {
27|  await initDatabase(); const b = await c.req.json();
28|  if (!validName(b)) return c.json({ error: { code: "INVALID_NAME", message: "Name is required." } }, 400);
29|  const name=b.name.trim(), slug=slugify(b.slug||name);
30|  try { const r=await sqlite.execute("INSERT INTO tags (name,slug) VALUES (?,?)",[name,slug]); return c.json({data:{id:Number(r.lastInsertRowid),name,slug}},201); }
31|  catch { return c.json({error:{code:"TAG_EXISTS",message:"Tag name or slug already exists."}},409); }
32|});
33|router.post("/technologies", requireAuth, async c => {
34|  await initDatabase(); const b = await c.req.json();
35|  if (!validName(b)) return c.json({ error: { code: "INVALID_NAME", message: "Name is required." } }, 400);
36|  const name=b.name.trim(), slug=slugify(b.slug||name);
37|  try { const r=await sqlite.execute("INSERT INTO technologies (name,slug,description,website_url,logo_url) VALUES (?,?,?,?,?)",[name,slug,b.description?.trim()||null,b.website_url?.trim()||null,b.logo_url?.trim()||null]); return c.json({data:{id:Number(r.lastInsertRowid),name,slug,description:b.description?.trim()||null,website_url:b.website_url?.trim()||null,logo_url:b.logo_url?.trim()||null}},201); }
38|  catch { return c.json({error:{code:"TECHNOLOGY_EXISTS",message:"Technology name or slug already exists."}},409); }
39|});
40|async function remove(c:any, table:string) {
41|  await initDatabase(); const id=Number(c.req.param("id"));
42|  if (!Number.isInteger(id)||id<1) return c.json({error:{code:"INVALID_ID",message:"Invalid id."}},400);
43|  const r=await sqlite.execute(`DELETE FROM ${table} WHERE id=?`,[id]);
44|  if (!r.rowsAffected) return c.json({error:{code:"NOT_FOUND",message:"Item not found."}},404);
45|  return c.json({data:{deleted:true}});
46|}
47|router.delete("/categories/:id",requireAuth,c=>remove(c,"categories"));
48|router.delete("/tags/:id",requireAuth,c=>remove(c,"tags"));
49|router.delete("/technologies/:id",requireAuth,c=>remove(c,"technologies"));
50|export const taxonomy = router;
51|