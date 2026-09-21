import { Hono } from "npm:hono";
import { initDatabase, sqlite } from "../lib/db.ts";

export const api = new Hono();

api.get("/health", async (c) => {
  await initDatabase();
  const result = await sqlite.execute("SELECT 1 AS ok");
  return c.json({ data: { status: "ok", database: result.rows[0]?.ok === 1 ? "ok" : "error" } });
});
