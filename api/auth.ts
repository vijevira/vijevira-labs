import { Hono } from "npm:hono";
import { initDatabase, sqlite } from "../lib/db.ts";

const auth = new Hono();
const COOKIE = "vl_session";
const SESSION_DAYS = 7;

function jsonError(c: any, status: number, code: string, message: string) {
  return c.json({ error: { code, message } }, status);
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, key, 256);
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

async function verifyPassword(password: string, stored: string) {
  const [salt64, hash64] = stored.split(":");
  if (!salt64 || !hash64) return false;
  return (await hashPassword(password, base64ToBytes(salt64))) === hash64;
}

async function ensureAdmin() {
  const email = Deno.env.get("ADMIN_EMAIL")?.trim().toLowerCase();
  const password = Deno.env.get("ADMIN_PASSWORD");
  if (!email || !password) return false;
  const existing = await sqlite.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  if (existing.rows.length) return true;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const stored = bytesToBase64(salt) + ":" + await hashPassword(password, salt);
  await sqlite.execute("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)", [email, stored, "Vijevira Labs Admin"]);
  return true;
}

auth.post("/login", async (c) => {
  await initDatabase();
  if (!(await ensureAdmin())) return jsonError(c, 503, "AUTH_NOT_CONFIGURED", "Admin credentials are not configured.");
  const body = await c.req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return jsonError(c, 400, "INVALID_INPUT", "Email and password are required.");
  const result = await sqlite.execute("SELECT id, email, name, password_hash FROM users WHERE email = ? LIMIT 1", [email]);
  const user = result.rows[0] as any;
  if (!user || !(await verifyPassword(password, user.password_hash))) return jsonError(c, 401, "INVALID_CREDENTIALS", "Invalid email or password.");
  const sessionId = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await sqlite.execute("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [sessionId, user.id, expires]);
  c.header("Set-Cookie", COOKIE + "=" + sessionId + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + (SESSION_DAYS * 86400));
  return c.json({ data: { id: user.id, email: user.email, name: user.name } });
});

auth.post("/logout", async (c) => {
  await initDatabase();
  const session = c.req.header("Cookie")?.match(new RegExp(COOKIE + "=([^;]+)"))?.[1];
  if (session) await sqlite.execute("DELETE FROM sessions WHERE id = ?", [session]);
  c.header("Set-Cookie", COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  return c.json({ data: { ok: true } });
});

auth.get("/me", async (c) => {
  await initDatabase();
  const session = c.req.header("Cookie")?.match(new RegExp(COOKIE + "=([^;]+)"))?.[1];
  if (!session) return jsonError(c, 401, "UNAUTHENTICATED", "Not signed in.");
  const result = await sqlite.execute("SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP LIMIT 1", [session]);
  if (!result.rows.length) return jsonError(c, 401, "UNAUTHENTICATED", "Session expired.");
  return c.json({ data: result.rows[0] });
});

export { auth };
