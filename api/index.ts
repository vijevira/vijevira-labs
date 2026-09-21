import { Hono } from "npm:hono";
import { initDatabase, sqlite } from "../lib/db.ts";
import { auth } from "./auth.ts";
import { posts } from "./posts.ts";
import { taxonomy } from "./taxonomy.ts";

export const api = new Hono();
api.route("/auth", auth);
api.route("/posts", posts);
10|api.route("/taxonomy", taxonomy);
11|
12|api.get("/health", async (c) => {
13|  await initDatabase();
14|  const result = await sqlite.execute("SELECT 1 AS ok");
15|  return c.json({ data: { status: "ok", database: result.rows[0]?.ok === 1 ? "ok" : "error" } });
16|});
17|