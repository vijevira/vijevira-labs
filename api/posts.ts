import { Hono } from "npm:hono";
import { initDatabase, sqlite } from "../lib/db.ts";
import { requireAuth } from "./middleware.ts";

const posts = new Hono();
const CONTENT_TYPES = ["article", "tutorial", "research", "guide", "comparison", "project_log", "note"];
const STATUSES = ["draft", "review", "scheduled", "published", "archived"];

const error = (c: any, status: number, code: string, message: string) =>
  c.json({ error: { code, message } }, status);

function slugify(value: string) {
  return value.trim().toLowerCase().normalize("NFKD").replace(/[^\\w\\s-]/g, "").replace(/[\\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function readingTime(content: string) {
  const words = content.trim().split(/\\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function parseIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
}

async function syncRelations(postId: number, tagIds: number[], technologyIds: number[]) {
  await sqlite.execute("DELETE FROM post_tags WHERE post_id = ?", [postId]);
  await sqlite.execute("DELETE FROM post_technologies WHERE post_id = ?", [postId]);
  for (const id of tagIds) await sqlite.execute("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)", [postId, id]);
  for (const id of technologyIds) await sqlite.execute("INSERT OR IGNORE INTO post_technologies (post_id, technology_id) VALUES (?, ?)", [postId, id]);
}

async function getPost(id: number) {
  const result = await sqlite.execute(`
    SELECT p.*, c.name AS category_name, c.slug AS category_slug,
      m.url AS cover_url, m.url AS cover_secure_url
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN media m ON m.id = p.cover_image_id
    WHERE p.id = ? LIMIT 1
  `, [id]);
  const post = result.rows[0] as any;
  if (!post) return null;
  const tags = await sqlite.execute("SELECT t.id, t.name, t.slug FROM tags t JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = ? ORDER BY t.name", [id]);
  const technologies = await sqlite.execute("SELECT t.id, t.name, t.slug FROM technologies t JOIN post_technologies pt ON pt.technology_id = t.id WHERE pt.post_id = ? ORDER BY t.name", [id]);
  return { ...post, tags: tags.rows, technologies: technologies.rows };
}

posts.get("/", async (c) => {
  await initDatabase();
  const page = Math.max(1, Number(c.req.query("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(c.req.query("limit") || 20)));
  const status = c.req.query("status");
  const type = c.req.query("content_type");
  const categoryId = c.req.query("category_id");
  const q = c.req.query("q");
  const where: string[] = [];
  const params: unknown[] = [];
  if (status) { where.push("p.status = ?"); params.push(status); }
  if (type) { where.push("p.content_type = ?"); params.push(type); }
  if (categoryId) { where.push("p.category_id = ?"); params.push(Number(categoryId)); }
  if (q) { where.push("(p.title LIKE ? OR p.description LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
  const clause = where.length ? "WHERE " + where.join(" AND ") : "";
  const count = await sqlite.execute(`SELECT COUNT(*) AS total FROM posts p ${clause}`, params);
  const total = Number((count.rows[0] as any)?.total || 0);
  const offset = (page - 1) * limit;
  const result = await sqlite.execute(`
    SELECT p.id,p.title,p.slug,p.description,p.content_type,p.status,p.featured,p.reading_time,p.published_at,p.created_at,p.updated_at,
      c.name AS category_name, m.url AS cover_secure_url
    FROM posts p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN media m ON m.id=p.cover_image_id
    ${clause} ORDER BY COALESCE(p.published_at,p.created_at) DESC LIMIT ? OFFSET ?
  `, [...params, limit, offset]);
  return c.json({ data: result.rows, pagination: { page, limit, total } });
});

posts.get("/:id", async (c) => {
  await initDatabase();
  const post = await getPost(Number(c.req.param("id")));
  if (!post) return error(c, 404, "POST_NOT_FOUND", "Post not found");
  return c.json({ data: post });
});

posts.post("/", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const content = String(body.content || "");
  if (!title) return error(c, 400, "INVALID_INPUT", "Title is required.");
  const contentType = String(body.content_type || "article");
  const status = String(body.status || "draft");
  if (!CONTENT_TYPES.includes(contentType)) return error(c, 400, "INVALID_CONTENT_TYPE", "Invalid content type.");
  if (!STATUSES.includes(status)) return error(c, 400, "INVALID_STATUS", "Invalid post status.");
  let slug = slugify(String(body.slug || title));
  if (!slug) return error(c, 400, "INVALID_SLUG", "A valid slug is required.");
  const duplicate = await sqlite.execute("SELECT id FROM posts WHERE slug = ? LIMIT 1", [slug]);
  if (duplicate.rows.length) return error(c, 409, "SLUG_EXISTS", "A post with this slug already exists.");
  const publishedAt = status === "published" ? String(body.published_at || new Date().toISOString()) : (body.published_at ? String(body.published_at) : null);
  const result = await sqlite.execute(
    `INSERT INTO posts (title,slug,description,content,content_type,status,cover_image_id,category_id,featured,seo_title,seo_description,reading_time,published_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [title, slug, body.description ? String(body.description) : null, content, contentType, status, body.cover_image_id ? Number(body.cover_image_id) : null, body.category_id ? Number(body.category_id) : null, body.featured ? 1 : 0, body.seo_title ? String(body.seo_title) : null, body.seo_description ? String(body.seo_description) : null, readingTime(content), publishedAt],
  );
  const id = Number((result.rows[0] as any)?.id);
  await syncRelations(id, parseIds(body.tag_ids), parseIds(body.technology_ids));
  return c.json({ data: await getPost(id) }, 201);
});

posts.put("/:id", requireAuth, async (c) => {
  const id = Number(c.req.param("id"));
  const existing = await getPost(id);
  if (!existing) return error(c, 404, "POST_NOT_FOUND", "Post not found");
  const body = await c.req.json().catch(() => ({}));
  const title = String(body.title ?? existing.title).trim();
  const content = String(body.content ?? existing.content);
  const contentType = String(body.content_type ?? existing.content_type);
  const status = String(body.status ?? existing.status);
  if (!title || !CONTENT_TYPES.includes(contentType) || !STATUSES.includes(status)) return error(c, 400, "INVALID_INPUT", "Invalid title, content type, or status.");
  const slug = slugify(String(body.slug ?? existing.slug));
  const duplicate = await sqlite.execute("SELECT id FROM posts WHERE slug = ? AND id != ? LIMIT 1", [slug, id]);
  if (duplicate.rows.length) return error(c, 409, "SLUG_EXISTS", "A post with this slug already exists.");
  let publishedAt = body.published_at === null ? null : (body.published_at !== undefined ? String(body.published_at) : existing.published_at);
  if (status === "published" && !publishedAt) publishedAt = new Date().toISOString();
  await sqlite.execute(
    `UPDATE posts SET title=?,slug=?,description=?,content=?,content_type=?,status=?,cover_image_id=?,category_id=?,featured=?,seo_title=?,seo_description=?,reading_time=?,published_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [title, slug, body.description !== undefined ? (body.description ? String(body.description) : null) : existing.description, content, contentType, status, body.cover_image_id !== undefined ? (body.cover_image_id ? Number(body.cover_image_id) : null) : existing.cover_image_id, body.category_id !== undefined ? (body.category_id ? Number(body.category_id) : null) : existing.category_id, body.featured !== undefined ? (body.featured ? 1 : 0) : existing.featured, body.seo_title !== undefined ? (body.seo_title ? String(body.seo_title) : null) : existing.seo_title, body.seo_description !== undefined ? (body.seo_description ? String(body.seo_description) : null) : existing.seo_description, readingTime(content), publishedAt, id],
  );
  if (body.tag_ids !== undefined || body.technology_ids !== undefined) {
    await syncRelations(id, body.tag_ids !== undefined ? parseIds(body.tag_ids) : existing.tags.map((x: any) => Number(x.id)), body.technology_ids !== undefined ? parseIds(body.technology_ids) : existing.technologies.map((x: any) => Number(x.id)));
  }
  return c.json({ data: await getPost(id) });
});

posts.delete("/:id", requireAuth, async (c) => {
  await initDatabase();
  const id = Number(c.req.param("id"));
  const result = await sqlite.execute("DELETE FROM posts WHERE id = ?", [id]);
  if (!result.rows.length && Number((result as any).changes || 0) === 0) return error(c, 404, "POST_NOT_FOUND", "Post not found");
  return c.json({ data: { id, deleted: true } });
});

posts.post("/:id/publish", requireAuth, async (c) => {
  await initDatabase();
  const id = Number(c.req.param("id"));
  const result = await sqlite.execute("UPDATE posts SET status='published', published_at=COALESCE(published_at,CURRENT_TIMESTAMP), updated_at=CURRENT_TIMESTAMP WHERE id=?", [id]);
  if (Number((result as any).changes || 0) === 0) return error(c, 404, "POST_NOT_FOUND", "Post not found");
  return c.json({ data: await getPost(id) });
});

posts.post("/:id/unpublish", requireAuth, async (c) => {
  await initDatabase();
  const id = Number(c.req.param("id"));
  const result = await sqlite.execute("UPDATE posts SET status='draft', updated_at=CURRENT_TIMESTAMP WHERE id=?", [id]);
  if (Number((result as any).changes || 0) === 0) return error(c, 404, "POST_NOT_FOUND", "Post not found");
  return c.json({ data: await getPost(id) });
});

export { posts };
