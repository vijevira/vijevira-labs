import { Context, Next } from "npm:hono";
import { initDatabase, sqlite } from "../lib/db.ts";

export const COOKIE = "vl_session";

function getSessionId(c: Context) {
  return c.req.header("Cookie")?.match(new RegExp(COOKIE + "=([^;]+)"))?.[1];
}

export async function requireAuth(c: Context, next: Next) {
  await initDatabase();
  const sessionId = getSessionId(c);
  if (!sessionId) return c.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in." } }, 401);

  const result = await sqlite.execute(
    "SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP LIMIT 1",
    [sessionId],
  );
  if (!result.rows.length) return c.json({ error: { code: "UNAUTHENTICATED", message: "Session expired." } }, 401);

  c.set("user", result.rows[0]);
  await next();
}

export function getUser(c: Context) {
  return c.get("user") as { id: number; email: string; name: string; role: string } | undefined;
}
