import { sqlite } from "https://esm.town/v/std/sqlite/main.ts";

let initialized: Promise<void> | undefined;

const schema = [
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, description TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS technologies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, description TEXT, website_url TEXT, logo_url TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, original_filename TEXT NOT NULL, public_id TEXT, resource_type TEXT NOT NULL DEFAULT 'image', url TEXT NOT NULL, secure_url TEXT NOT NULL, mime_type TEXT NOT NULL, format TEXT, size INTEGER NOT NULL DEFAULT 0, width INTEGER, height INTEGER, alt_text TEXT, caption TEXT, storage_provider TEXT NOT NULL DEFAULT 'cloudinary', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, content TEXT NOT NULL DEFAULT '', content_type TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('article','tutorial','research','guide','comparison','project_log','note')), status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','scheduled','published','archived')), cover_image_id INTEGER REFERENCES media(id) ON DELETE SET NULL, category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0,1)), seo_title TEXT, seo_description TEXT, reading_time INTEGER, published_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS post_categories (post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE, category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE, PRIMARY KEY (post_id, category_id))`,
  `CREATE TABLE IF NOT EXISTS post_tags (post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE, tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (post_id, tag_id))`,
  `CREATE TABLE IF NOT EXISTS post_technologies (post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE, technology_id INTEGER NOT NULL REFERENCES technologies(id) ON DELETE CASCADE, PRIMARY KEY (post_id, technology_id))`,
  `CREATE TABLE IF NOT EXISTS tools (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, description TEXT, long_description TEXT, website_url TEXT, category TEXT, pricing_type TEXT, free_tier TEXT, logo_url TEXT, my_experience TEXT, limitations TEXT, featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0,1)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS post_tools (post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE, tool_id INTEGER NOT NULL REFERENCES tools(id) ON DELETE CASCADE, PRIMARY KEY (post_id, tool_id))`,
  `CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, description TEXT, content TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'building', repository_url TEXT, demo_url TEXT, cover_image_id INTEGER REFERENCES media(id) ON DELETE SET NULL, featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0,1)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS post_projects (post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE, project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE, PRIMARY KEY (post_id, project_id))`,
  `CREATE TABLE IF NOT EXISTS related_posts (post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE, related_post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE, PRIMARY KEY (post_id, related_post_id), CHECK (post_id != related_post_id))`,
  `CREATE TABLE IF NOT EXISTS research_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, content TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','converted','archived')), related_post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL, related_project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `INSERT OR IGNORE INTO post_categories (post_id, category_id) SELECT id, category_id FROM posts WHERE category_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_research_notes_status ON research_notes(status)`,
  `INSERT OR IGNORE INTO categories (name, slug, description) VALUES ('Engineering','engineering','Production engineering, software development, and practical systems work.')`,
  `INSERT OR IGNORE INTO categories (name, slug, description) VALUES ('Research','research','Technical research, experiments, and evidence-driven exploration.')`,
  `INSERT OR IGNORE INTO categories (name, slug, description) VALUES ('Tutorials','tutorials','Step-by-step guides for building and shipping software.')`,
  `INSERT OR IGNORE INTO categories (name, slug, description) VALUES ('DevOps','devops','Infrastructure, deployment, observability, and operations.')`,
  `INSERT OR IGNORE INTO categories (name, slug, description) VALUES ('AI','ai','AI engineering, LLMs, agents, and applied machine intelligence.')`,
  `INSERT OR IGNORE INTO categories (name, slug, description) VALUES ('Architecture','architecture','System design, architecture patterns, and engineering trade-offs.')`,
  `INSERT OR IGNORE INTO categories (name, slug, description) VALUES ('Free Tools','free-tools','Free and low-cost developer tools, platforms, and services.')`,
  `INSERT OR IGNORE INTO tags (name, slug) VALUES ('Val Town','val-town')`,
  `INSERT OR IGNORE INTO tags (name, slug) VALUES ('ChatGPT','chatgpt')`,
  `INSERT OR IGNORE INTO tags (name, slug) VALUES ('AI Coding','ai-coding')`,
  `INSERT OR IGNORE INTO tags (name, slug) VALUES ('JavaScript','javascript')`,
  `INSERT OR IGNORE INTO tags (name, slug) VALUES ('Web Development','web-development')`,
  `INSERT OR IGNORE INTO tags (name, slug) VALUES ('Developer Tools','developer-tools')`,
  `INSERT OR IGNORE INTO tags (name, slug) VALUES ('Free Tools','free-tools')`,
  `INSERT OR IGNORE INTO technologies (name, slug, description) VALUES ('JavaScript','javascript','JavaScript runtime and language used for web development.')`,
  `INSERT OR IGNORE INTO technologies (name, slug, description) VALUES ('Deno','deno','Secure JavaScript and TypeScript runtime used by Val Town.')`,
  `INSERT OR IGNORE INTO technologies (name, slug, description) VALUES ('TypeScript','typescript','Typed superset of JavaScript for application development.')`,
  `INSERT OR IGNORE INTO technologies (name, slug, description) VALUES ('React','react','Component-based UI library for web interfaces.')`,
  `INSERT OR IGNORE INTO technologies (name, slug, description) VALUES ('Hono','hono','Lightweight web framework for edge and server runtimes.')`,
  `INSERT OR IGNORE INTO technologies (name, slug, description) VALUES ('SQLite','sqlite','Lightweight SQL database for application data.')`
];

async function migrateDatabase() {
  const mediaInfo = await sqlite.execute("PRAGMA table_info(media)");
  const mediaColumns = new Set((mediaInfo.rows as any[]).map((x) => String(x.name)));

  const migrations = [
    ["public_id", "TEXT"],
    ["resource_type", "TEXT NOT NULL DEFAULT 'image'"],
    ["secure_url", "TEXT"],
    ["format", "TEXT"],
    ["caption", "TEXT"],
    ["updated_at", "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP"],
  ] as const;

  for (const [name, definition] of migrations) {
    if (!mediaColumns.has(name)) {
      await sqlite.execute(`ALTER TABLE media ADD COLUMN ${name} ${definition}`);
    }
  }

  await sqlite.execute("UPDATE media SET secure_url = url WHERE secure_url IS NULL OR secure_url = ''");
}

export function initDatabase(): Promise<void> {
  if (!initialized) {
    initialized = sqlite.batch(schema.map((sql) => ({ sql }))).then(async () => {
      await migrateDatabase();
    });
  }
  return initialized;
}

export { sqlite };
