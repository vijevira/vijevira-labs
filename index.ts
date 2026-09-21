import { parseVal, serveImmutableFile } from "https://esm.town/v/std/utils/index.ts";
import { Hono } from "npm:hono";
import { Root } from "./frontend/root.tsx";
import { api } from "./api/index.ts";
import { initDatabase } from "./lib/db.ts";

const app = new Hono();

app.route("/api", api);
app.get("/__immutable/*", (c) => serveImmutableFile(c.req.path));
app.get("/source", (c) => c.redirect(parseVal().links.self.val));
app.get("*", async (c) => {
  await initDatabase();
  return c.html(Root());
});

app.onError((err) => Promise.reject(err));
export default app.fetch;