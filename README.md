# Vijevira Labs

**Engineering, Research & Building.**

A practical engineering and research platform for technical articles, tutorials, production lessons, developer tools, projects, and ongoing research.

## Stack
- Val Town
- Hono
- React
- SQLite (Val-scoped)
- Cloudinary for media storage and delivery

## Structure
```
/
├── index.ts
├── api/index.ts
├── lib/db.ts
├── frontend/root.tsx
├── frontend/index.tsx
└── frontend/components/App.tsx
```

## Routes
Public: /, /blog, /blog/:slug, /tools, /tools/:slug, /projects, /projects/:slug, /research, /research/:slug, /topics/:slug, /tags/:slug, /search, /about, /rss.xml

Admin: /admin, /admin/login, /admin/posts, /admin/posts/new, /admin/posts/:id/edit, /admin/research, /admin/research/new, /admin/research/:id/edit, /admin/tools, /admin/tools/new, /admin/tools/:id/edit, /admin/projects, /admin/projects/new, /admin/projects/:id/edit, /admin/technologies, /admin/categories, /admin/tags, /admin/media, /admin/settings

## Media
Val Town's per-val SQLite database stores structured application data and media metadata. Cloudinary stores and delivers the actual media assets. Credentials are kept in Val Town environment variables and are never committed to GitHub.

Required environment variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
