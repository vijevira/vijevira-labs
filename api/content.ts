import { Hono } from "npm:hono";
import { initDatabase, sqlite } from "../lib/db.ts";
import { requireAuth } from "./middleware.ts";

const router = new Hono();

const err = (c:any,status:number,code:string,message:string) =>
  c.json({error:{code,message}}, status);

const slugify = (v:string) => v.trim().toLowerCase().normalize("NFKD")
  .replace(/[^a-z0-9\s-]/g,"").replace(/[\s_-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,120);

function parseBool(v:any){ return v===true || v===1 || v==="1" || v==="true" ? 1 : 0; }

async function listTable(c:any, table:"tools"|"projects"){
  await initDatabase();
  const q=c.req.query("q");
  const where=q ? "WHERE name LIKE ? OR description LIKE ?" : "";
  const params=q ? [`%${q}%`,`%${q}%`] : [];
  const r=await sqlite.execute(`SELECT * FROM ${table} ${where} ORDER BY featured DESC, updated_at DESC, name ASC`,params);
  return c.json({data:r.rows});
}

async function getTable(table:string,id:number){
  const r=await sqlite.execute(`SELECT * FROM ${table} WHERE id=? LIMIT 1`,[id]);
  return r.rows[0] as any;
}

router.get("/settings",async c=>{await initDatabase();const r=await sqlite.execute("SELECT key,value FROM settings");const data:any={};for(const row of r.rows as any[])data[row.key]=row.value;return c.json({data});});
router.put("/settings",requireAuth,async c=>{await initDatabase();const b=await c.req.json().catch(()=>({}));for(const [key,value] of Object.entries(b)){if(typeof value==="string")await sqlite.execute("INSERT INTO settings(key,value,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP",[key,value]);}return c.json({data:b});});

router.get("/tools",c=>listTable(c,"tools"));
router.get("/projects",c=>listTable(c,"projects"));

router.get("/tools/:id",async c=>{
  await initDatabase(); const row=await getTable("tools",Number(c.req.param("id")));
  return row?c.json({data:row}):err(c,404,"TOOL_NOT_FOUND","Tool not found.");
});
router.get("/projects/:id",async c=>{
  await initDatabase(); const row=await getTable("projects",Number(c.req.param("id")));
  return row?c.json({data:row}):err(c,404,"PROJECT_NOT_FOUND","Project not found.");
});

router.post("/tools",requireAuth,async c=>{
  await initDatabase(); const b=await c.req.json().catch(()=>({}));
  const name=String(b.name||"").trim(); if(!name)return err(c,400,"INVALID_NAME","Name is required.");
  const slug=slugify(String(b.slug||name)); if(!slug)return err(c,400,"INVALID_SLUG","A valid slug is required.");
  try{
    const r=await sqlite.execute("INSERT INTO tools (name,slug,description,long_description,website_url,category,pricing_type,free_tier,logo_url,my_experience,limitations,featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      [name,slug,b.description||null,b.long_description||null,b.website_url||null,b.category||null,b.pricing_type||null,b.free_tier||null,b.logo_url||null,b.my_experience||null,b.limitations||null,parseBool(b.featured)]);
    const id=Number(((await sqlite.execute("SELECT last_insert_rowid() AS id")).rows[0] as any)?.id); return c.json({data:await getTable("tools",id)},201);
  }catch{return err(c,409,"TOOL_EXISTS","Tool name or slug already exists.");}
});

router.put("/tools/:id",requireAuth,async c=>{
  await initDatabase(); const id=Number(c.req.param("id")); const old=await getTable("tools",id);
  if(!old)return err(c,404,"TOOL_NOT_FOUND","Tool not found."); const b=await c.req.json().catch(()=>({}));
  const name=String(b.name??old.name).trim(), slug=slugify(String(b.slug??old.slug));
  try{
    await sqlite.execute("UPDATE tools SET name=?,slug=?,description=?,long_description=?,website_url=?,category=?,pricing_type=?,free_tier=?,logo_url=?,my_experience=?,limitations=?,featured=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [name,slug,b.description??old.description,b.long_description??old.long_description,b.website_url??old.website_url,b.category??old.category,b.pricing_type??old.pricing_type,b.free_tier??old.free_tier,b.logo_url??old.logo_url,b.my_experience??old.my_experience,b.limitations??old.limitations, b.featured===undefined?old.featured:parseBool(b.featured),id]);
    return c.json({data:await getTable("tools",id)});
  }catch{return err(c,409,"TOOL_EXISTS","Tool name or slug already exists.");}
});
router.delete("/tools/:id",requireAuth,async c=>{
  await initDatabase(); const id=Number(c.req.param("id")); const r=await sqlite.execute("DELETE FROM tools WHERE id=?",[id]);
  if(!(r as any).rowsAffected)return err(c,404,"TOOL_NOT_FOUND","Tool not found."); return c.json({data:{deleted:true}});
});

router.post("/projects",requireAuth,async c=>{
  await initDatabase(); const b=await c.req.json().catch(()=>({}));
  const name=String(b.name||"").trim(); if(!name)return err(c,400,"INVALID_NAME","Name is required.");
  const slug=slugify(String(b.slug||name));
  try{
    const r=await sqlite.execute("INSERT INTO projects (name,slug,description,content,status,repository_url,demo_url,cover_image_id,featured) VALUES (?,?,?,?,?,?,?,?,?)",
      [name,slug,b.description||null,b.content||"",b.status||"building",b.repository_url||null,b.demo_url||null,b.cover_image_id?Number(b.cover_image_id):null,parseBool(b.featured)]);
    const id=Number(((await sqlite.execute("SELECT last_insert_rowid() AS id")).rows[0] as any)?.id); return c.json({data:await getTable("projects",id)},201);
  }catch{return err(c,409,"PROJECT_EXISTS","Project name or slug already exists.");}
});
router.put("/projects/:id",requireAuth,async c=>{
  await initDatabase(); const id=Number(c.req.param("id")); const old=await getTable("projects",id);
  if(!old)return err(c,404,"PROJECT_NOT_FOUND","Project not found."); const b=await c.req.json().catch(()=>({}));
  const name=String(b.name??old.name).trim(), slug=slugify(String(b.slug??old.slug));
  try{
    await sqlite.execute("UPDATE projects SET name=?,slug=?,description=?,content=?,status=?,repository_url=?,demo_url=?,cover_image_id=?,featured=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [name,slug,b.description??old.description,b.content??old.content,b.status??old.status,b.repository_url??old.repository_url,b.demo_url??old.demo_url,b.cover_image_id===undefined?old.cover_image_id:(b.cover_image_id?Number(b.cover_image_id):null),b.featured===undefined?old.featured:parseBool(b.featured),id]);
    return c.json({data:await getTable("projects",id)});
  }catch{return err(c,409,"PROJECT_EXISTS","Project name or slug already exists.");}
});
router.delete("/projects/:id",requireAuth,async c=>{
  await initDatabase(); const id=Number(c.req.param("id")); const r=await sqlite.execute("DELETE FROM projects WHERE id=?",[id]);
  if(!(r as any).rowsAffected)return err(c,404,"PROJECT_NOT_FOUND","Project not found."); return c.json({data:{deleted:true}});
});

router.get("/research",async c=>{
  await initDatabase();
  const r=await sqlite.execute("SELECT id,title,slug,description,content,content_type,status,published_at,reading_time,category_id,featured,seo_title,seo_description,cover_image_id,created_at,updated_at FROM posts WHERE status='published' AND content_type='research' ORDER BY published_at DESC");
  return c.json({data:r.rows});
});
router.get("/research/:id",async c=>{
  await initDatabase(); const id=Number(c.req.param("id"));
  const r=await sqlite.execute("SELECT * FROM posts WHERE id=? AND status='published' AND content_type='research' LIMIT 1",[id]);
  return r.rows.length?c.json({data:r.rows[0]}):err(c,404,"RESEARCH_NOT_FOUND","Research item not found.");
});
router.get("/admin/research-notes",requireAuth,async c=>{
  await initDatabase(); const r=await sqlite.execute("SELECT * FROM research_notes ORDER BY updated_at DESC"); return c.json({data:r.rows});
});
router.post("/admin/research-notes",requireAuth,async c=>{
  await initDatabase(); const b=await c.req.json().catch(()=>({}));
  const title=String(b.title||"").trim(); if(!title)return err(c,400,"INVALID_TITLE","Title is required.");
  const slug=slugify(String(b.slug||title));
  try{const r=await sqlite.execute("INSERT INTO research_notes (title,slug,content,status,related_post_id,related_project_id) VALUES (?,?,?,?,?,?)",[title,slug,b.content||"",b.status||"active",b.related_post_id?Number(b.related_post_id):null,b.related_project_id?Number(b.related_project_id):null]);const id=Number(((await sqlite.execute("SELECT last_insert_rowid() AS id")).rows[0] as any)?.id);return c.json({data:(await sqlite.execute("SELECT * FROM research_notes WHERE id=?",[id])).rows[0]},201);}
  catch{return err(c,409,"RESEARCH_NOTE_EXISTS","Research note slug already exists.");}
});
router.put("/admin/research-notes/:id",requireAuth,async c=>{
  await initDatabase(); const id=Number(c.req.param("id")); const old=(await sqlite.execute("SELECT * FROM research_notes WHERE id=?",[id])).rows[0] as any;
  if(!old)return err(c,404,"RESEARCH_NOTE_NOT_FOUND","Research note not found."); const b=await c.req.json().catch(()=>({}));
  const title=String(b.title??old.title).trim(),slug=slugify(String(b.slug??old.slug));
  try{await sqlite.execute("UPDATE research_notes SET title=?,slug=?,content=?,status=?,related_post_id=?,related_project_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",[title,slug,b.content??old.content,b.status??old.status,b.related_post_id===undefined?old.related_post_id:(b.related_post_id?Number(b.related_post_id):null),b.related_project_id===undefined?old.related_project_id:(b.related_project_id?Number(b.related_project_id):null),id]);return c.json({data:(await sqlite.execute("SELECT * FROM research_notes WHERE id=?",[id])).rows[0]});}
  catch{return err(c,409,"RESEARCH_NOTE_EXISTS","Research note slug already exists.");}
});
router.post("/admin/research-notes/:id/convert",requireAuth,async c=>{
  await initDatabase(); const id=Number(c.req.param("id")); const note=(await sqlite.execute("SELECT * FROM research_notes WHERE id=?",[id])).rows[0] as any;
  if(!note)return err(c,404,"RESEARCH_NOTE_NOT_FOUND","Research note not found.");
  if(note.related_post_id)return err(c,409,"ALREADY_CONVERTED","Research note is already linked to a post.");
  const duplicate=await sqlite.execute("SELECT id FROM posts WHERE slug=? LIMIT 1",[note.slug]); if(duplicate.rows.length)return err(c,409,"SLUG_EXISTS","A post with this slug already exists.");
  await sqlite.execute("INSERT INTO posts (title,slug,description,content,content_type,status,featured,reading_time) VALUES (?,?,?,?,?,?,0,?)",[note.title,note.slug,null,note.content,"research","draft",Math.max(1,Math.ceil(String(note.content||"").trim().split(/\s+/).filter(Boolean).length/220))]);
  const postId=Number(((await sqlite.execute("SELECT last_insert_rowid() AS id")).rows[0] as any)?.id);
  await sqlite.execute("UPDATE research_notes SET status='converted',related_post_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",[postId,id]);
  return c.json({data:{post_id:postId,note_id:id}});
});

router.delete("/admin/research-notes/:id",requireAuth,async c=>{await initDatabase();const id=Number(c.req.param("id"));const r=await sqlite.execute("DELETE FROM research_notes WHERE id=?",[id]);if(!(r as any).rowsAffected)return err(c,404,"RESEARCH_NOTE_NOT_FOUND","Research note not found.");return c.json({data:{deleted:true}});});

router.post("/media",requireAuth,async c=>{
  await initDatabase();
  const cloud= Deno.env.get("CLOUDINARY_CLOUD_NAME"), key=Deno.env.get("CLOUDINARY_API_KEY"), secret=Deno.env.get("CLOUDINARY_API_SECRET");
  if(!cloud||!key||!secret)return err(c,503,"MEDIA_NOT_CONFIGURED","Cloudinary is not configured.");
  const form=await c.req.formData(); const file=form.get("file");
  if(!(file instanceof File))return err(c,400,"FILE_REQUIRED","Select a file.");
  if(file.size>15*1024*1024)return err(c,413,"FILE_TOO_LARGE","Maximum file size is 15 MB.");
  const resource=file.type.startsWith("video/")?"video":file.type.startsWith("image/")?"image":"raw";
  if(resource!=="image")return err(c,400,"UNSUPPORTED_MEDIA","Only images are supported for the media library.");
  const upload=new FormData(); upload.append("file",file); upload.append("folder","vijevira-labs"); upload.append("use_filename","true"); upload.append("unique_filename","true");
  const auth64=btoa(key+":"+secret);
  const response=await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resource}/upload`,{method:"POST",headers:{Authorization:"Basic "+auth64},body:upload});
  if(!response.ok)return err(c,502,"CLOUDINARY_ERROR","Cloudinary upload failed.");
  const data=await response.json();
  const r=await sqlite.execute("INSERT INTO media (filename,original_filename,public_id,resource_type,url,secure_url,mime_type,format,size,width,height,alt_text,caption) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [data.original_filename||file.name,file.name,data.public_id,data.resource_type||resource,data.url,data.secure_url,file.type,data.format||null,file.size,data.width||null,data.height||null,String(form.get("alt_text")||"")||null,String(form.get("caption")||"")||null]);
  const id=Number(((await sqlite.execute("SELECT last_insert_rowid() AS id")).rows[0] as any)?.id); return c.json({data:(await sqlite.execute("SELECT * FROM media WHERE id=?",[id])).rows[0]},201);
});
router.get("/media",requireAuth,async c=>{await initDatabase();const r=await sqlite.execute("SELECT * FROM media ORDER BY created_at DESC");return c.json({data:r.rows});});
router.delete("/media/:id",requireAuth,async c=>{await initDatabase();const id=Number(c.req.param("id"));const row=(await sqlite.execute("SELECT * FROM media WHERE id=?",[id])).rows[0] as any;if(!row)return err(c,404,"MEDIA_NOT_FOUND","Media not found.");await sqlite.execute("DELETE FROM media WHERE id=?",[id]);return c.json({data:{deleted:true,id}});});

export const content=router;
