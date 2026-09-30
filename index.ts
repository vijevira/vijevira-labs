import { parseVal, serveImmutableFile } from "https://esm.town/v/std/utils/index.ts";
import { Hono } from "npm:hono";
import { Root } from "./frontend/root.tsx";
import { api } from "./api/index.ts";
import { initDatabase, sqlite } from "./lib/db.ts";

const app = new Hono();
const SITE_NAME = "Vijevira Labs";
const DEFAULT_TITLE = "Vijevira Labs — Practical Engineering, Research & Developer Tools";
const DEFAULT_DESCRIPTION = "Practical engineering articles, technical research, developer tools, and real-world software projects from Vijevira Labs.";

function breadcrumbLd(origin:string, items:{name:string;path:string}[]){
  return {
    "@type":"BreadcrumbList",
    itemListElement:items.map((item,index)=>({
      "@type":"ListItem",
      position:index+1,
      name:item.name,
      item:origin+item.path
    }))
  };
}

function pageLd(origin:string,name:string,description:string,path:string,type:string="WebPage"){
  return {
    "@type":type,
    name,
    description,
    url:origin+path,
    isPartOf:{"@type":"WebSite",name:SITE_NAME,url:origin},
    inLanguage:"en"
  };
}

function schemaDate(value:unknown){
  const s=String(value||"").trim();
  if(!s)return undefined;
  if(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s))return s.replace(" ","T")+"Z";
  const d=new Date(s);
  return Number.isNaN(d.getTime())?undefined:d.toISOString();
}

function creatorLd(origin:string,settings:any={}){
  const type=String(settings.author_type||"Organization")==="Person"?"Person":"Organization";
  const name=String(settings.author_name||SITE_NAME).trim()||SITE_NAME;
  const url=String(settings.author_url||"").trim()||origin+"/about";
  const bio=String(settings.author_bio||"").trim();
  const sameAs=String(settings.author_same_as||"").split(/[\n,]+/).map((x:string)=>x.trim()).filter((x:string)=>/^https?:\/\//i.test(x));
  const data:any={"@type":type,"@id":origin+"/about#creator","name":name,"url":url};
  if(bio)data.description=bio;
  if(sameAs.length)data.sameAs=[...new Set(sameAs)];
  if(String(settings.author_image||"").trim())data.image=String(settings.author_image).trim();
  if(type==="Person"&&String(settings.author_job_title||"").trim())data.jobTitle=String(settings.author_job_title).trim();
  return data;
}

function publisherLd(origin:string){
  return {"@type":"Organization","@id":origin+"/about#organization",name:SITE_NAME,url:origin+"/about"};
}

function articleLd(origin:string,row:any,path:string,image?:string,creator?:any){
  const data:any={
    "@type":"BlogPosting",
    headline:row.title,
    description:row.seo_description||row.description||"",
    datePublished:schemaDate(row.published_at),
    dateModified:schemaDate(row.updated_at||row.published_at),
    mainEntityOfPage:{"@type":"WebPage","@id":origin+path},
    author:creator||creatorLd(origin),
    publisher:publisherLd(origin),
    url:origin+path,
    inLanguage:"en"
  };
  if(image) data.image=[image];
  return data;
}

app.use("/api/*", async (c,next)=>{
  await next();
  c.header("X-Robots-Tag","noindex, nofollow");
});
app.route("/api", api);
app.get("/__immutable/*", (c) => serveImmutableFile(c.req.path));
app.get("/source", (c) => c.redirect(parseVal().links.self.val));
app.get("/rss.xml", async (c) => {
  await initDatabase();
  const rows = await sqlite.execute("SELECT title,slug,description,published_at,updated_at FROM posts WHERE status='published' ORDER BY published_at DESC LIMIT 50");
  const escXml = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  const origin = new URL(c.req.url).origin;
  const items = (rows.rows as any[]).map((p) => "<item><title>" + escXml(p.title) + "</title><link>" + origin + "/blog/" + encodeURIComponent(p.slug) + "</link><guid isPermaLink=\"true\">" + origin + "/blog/" + encodeURIComponent(p.slug) + "</guid><description>" + escXml(p.description) + "</description><pubDate>" + new Date(p.published_at || p.updated_at).toUTCString() + "</pubDate></item>").join("");
  return c.body('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Vijevira Labs</title><link>' + origin + '</link><description>Engineering, Research &amp; Building.</description>' + items + "</channel></rss>", 200, {"Content-Type":"application/rss+xml; charset=UTF-8"});
});
app.get("/robots.txt", (c) => c.body("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: " + new URL("/sitemap.xml", c.req.url).href + "\n", 200, {"Content-Type":"text/plain; charset=UTF-8"}));
app.get("/sitemap.xml", async (c) => {
  await initDatabase();
  const origin = new URL(c.req.url).origin;
  const urls = new Set<string>(["/","/blog","/research","/tools","/projects","/about"]);
  const [posts,toolsRows,projectRows,researchRows,categories,tags] = await Promise.all([
    sqlite.execute("SELECT slug,updated_at FROM posts WHERE status='published' AND content_type!='research'"),
    sqlite.execute("SELECT slug,updated_at FROM tools"),
    sqlite.execute("SELECT slug,updated_at FROM projects"),
    sqlite.execute("SELECT id,updated_at FROM posts WHERE status='published' AND content_type='research'"),
    sqlite.execute("SELECT c.slug,c.updated_at FROM categories c WHERE EXISTS (SELECT 1 FROM post_categories pc JOIN posts p ON p.id=pc.post_id WHERE pc.category_id=c.id AND p.status='published')"),
    sqlite.execute("SELECT t.slug FROM tags t WHERE EXISTS (SELECT 1 FROM post_tags pt JOIN posts p ON p.id=pt.post_id WHERE pt.tag_id=t.id AND p.status='published')")
  ]);
  for(const p of posts.rows as any[]) urls.add("/blog/"+encodeURIComponent(p.slug));
  for(const x of toolsRows.rows as any[]) urls.add("/tools/"+encodeURIComponent(x.slug));
  for(const x of projectRows.rows as any[]) urls.add("/projects/"+encodeURIComponent(x.slug));
  for(const x of researchRows.rows as any[]) urls.add("/research/"+encodeURIComponent(String(x.id)));
  for(const x of categories.rows as any[]) urls.add("/topics/"+encodeURIComponent(x.slug));
  for(const x of tags.rows as any[]) urls.add("/tags/"+encodeURIComponent(x.slug));

  const lastByPath = new Map<string,string>();
  for(const p of posts.rows as any[]) lastByPath.set("/blog/"+encodeURIComponent(p.slug),p.updated_at);
  for(const x of toolsRows.rows as any[]) lastByPath.set("/tools/"+encodeURIComponent(x.slug),x.updated_at);
  for(const x of projectRows.rows as any[]) lastByPath.set("/projects/"+encodeURIComponent(x.slug),x.updated_at);
  for(const x of researchRows.rows as any[]) lastByPath.set("/research/"+encodeURIComponent(String(x.id)),x.updated_at);
  for(const x of categories.rows as any[]) lastByPath.set("/topics/"+encodeURIComponent(x.slug),x.updated_at);

  const xml=[...urls].map(path=>"<url><loc>"+origin+path+"</loc>"+(lastByPath.get(path)?"<lastmod>"+new Date(lastByPath.get(path) as string).toISOString()+"</lastmod>":"")+"</url>").join("");
  return c.body('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+xml+"</urlset>",200,{"Content-Type":"application/xml; charset=UTF-8"});
});

async function resolveSeo(c:any){
  const url=new URL(c.req.url);
  const origin=url.origin;
  const path=url.pathname.replace(/\/+$/,"")||"/";
  const settingsRows=await sqlite.execute("SELECT key,value FROM settings");
  const publicSettings:any={};
  for(const row of settingsRows.rows as any[])publicSettings[row.key]=row.value;
  const creator=creatorLd(origin,publicSettings);

  const seo:any={
    title:DEFAULT_TITLE,
    description:DEFAULT_DESCRIPTION,
    canonical:origin+path,
    robots:"index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    ogType:"website"
  };
  seo.author=creator.name;
  const ga=String(publicSettings.ga_measurement_id||"").trim().toUpperCase();
  if(/^G-[A-Z0-9]+$/.test(ga))seo.gaMeasurementId=ga;
  const verification=String(publicSettings.google_site_verification||"").trim();
  if(verification&&path==="/")seo.googleSiteVerification=verification;

  if(path==="/"){
    seo.title=DEFAULT_TITLE;
    seo.description=DEFAULT_DESCRIPTION;
    seo.jsonLd={
      "@context":"https://schema.org",
      "@graph":[
        {
          "@type":"WebSite",
          name:SITE_NAME,
          url:origin,
          description:DEFAULT_DESCRIPTION,
          inLanguage:"en"
        },
        {...publisherLd(origin),...(creator["@type"]==="Organization"?{description:creator.description,sameAs:creator.sameAs,image:creator.image}:{})}
      ]
    };
    return seo;
  }

  if(path==="/blog"){
    seo.title="Engineering Blog — Vijevira Labs";
    seo.description="Engineering articles, tutorials, guides, comparisons, and build notes about software development, DevOps, AI, architecture, and developer tools.";
    seo.jsonLd=pageLd(origin,seo.title,seo.description,path,"CollectionPage");
    return seo;
  }

  if(path==="/research"){
    seo.title="Technical Research & Experiments — Vijevira Labs";
    seo.description="Technical investigations, experiments, implementation findings, and research notes about software systems, databases, scheduling, AI, and web engineering.";
    seo.jsonLd=pageLd(origin,seo.title,seo.description,path,"CollectionPage");
    return seo;
  }

  if(path==="/tools"){
    seo.title="Developer Tools & Free-Tier Services — Vijevira Labs";
    seo.description="Practical notes on developer tools, APIs, infrastructure, hosting, storage, automation, and useful free-tier services.";
    seo.jsonLd=pageLd(origin,seo.title,seo.description,path,"CollectionPage");
    return seo;
  }

  if(path==="/projects"){
    seo.title="Software Projects & Build Logs — Vijevira Labs";
    seo.description="Software projects, architecture experiments, build logs, and implementation work from Vijevira Labs.";
    seo.jsonLd=pageLd(origin,seo.title,seo.description,path,"CollectionPage");
    return seo;
  }

  if(path==="/about"){
    seo.title=creator.name===SITE_NAME?"About Vijevira Labs — Engineering, Research & Building":"About "+creator.name+" — Vijevira Labs";
    seo.description=creator.description||"Vijevira Labs is an independent engineering lab for building, researching, and documenting practical software systems.";
    seo.jsonLd={
      "@context":"https://schema.org",
      "@graph":[
        pageLd(origin,seo.title,seo.description,path,"AboutPage"),
        {
          "@type":"ProfilePage",
          "@id":origin+"/about#profile",
          name:creator.name+" — Creator Profile",
          description:seo.description,
          url:origin+"/about",
          mainEntity:creator
        }
      ]
    };
    return seo;
  }

  if(path==="/search"){
    seo.title="Search — Vijevira Labs";
    seo.description="Search engineering articles and technical notes from Vijevira Labs.";
    seo.robots="noindex,follow";
    return seo;
  }

  if(path.startsWith("/admin")){
    seo.title="Admin — Vijevira Labs";
    seo.description="Vijevira Labs administration workspace.";
    seo.robots="noindex,nofollow";
    return seo;
  }

  if(path.startsWith("/blog/")){
    const slug=decodeURIComponent(path.slice(6));
    const row=(await sqlite.execute(
      "SELECT p.title,p.description,p.slug,p.published_at,p.updated_at,p.seo_title,p.seo_description,m.secure_url,m.alt_text FROM posts p LEFT JOIN media m ON m.id=p.cover_image_id WHERE p.slug=? AND p.status='published' LIMIT 1",
      [slug]
    )).rows[0] as any;
    if(row){
      const title=String(row.seo_title||row.title)+" — Vijevira Labs";
      const description=String(row.seo_description||row.description||"Engineering article from Vijevira Labs.");
      seo.title=title;
      seo.description=description;
      seo.ogType="article";
      seo.image=row.secure_url||undefined;
      seo.imageAlt=row.alt_text||row.title;
      seo.publishedTime=schemaDate(row.published_at);
      seo.modifiedTime=schemaDate(row.updated_at||row.published_at);
      seo.jsonLd={
        "@context":"https://schema.org",
        "@graph":[
          articleLd(origin,row,path,row.secure_url||undefined,creator),
          breadcrumbLd(origin,[{name:"Home",path:"/"},{name:"Blog",path:"/blog"},{name:row.title,path}])
        ]
      };
    }
    return seo;
  }

  if(path.startsWith("/tools/")){
    const slug=decodeURIComponent(path.slice(7));
    const row=(await sqlite.execute("SELECT name,description,slug,logo_url FROM tools WHERE slug=? LIMIT 1",[slug])).rows[0] as any;
    if(row){
      seo.title=String(row.name)+" — Vijevira Labs";
      seo.description=String(row.description||"Developer tool notes from Vijevira Labs.");
      seo.image=row.logo_url||undefined;
      seo.imageAlt=row.name;
      seo.jsonLd={
        "@context":"https://schema.org",
        "@graph":[
          pageLd(origin,row.name,row.description||"",path),
          breadcrumbLd(origin,[{name:"Home",path:"/"},{name:"Tools",path:"/tools"},{name:row.name,path}])
        ]
      };
    }
    return seo;
  }

  if(path.startsWith("/projects/")){
    const slug=decodeURIComponent(path.slice(10));
    const row=(await sqlite.execute("SELECT p.name,p.description,p.slug,p.repository_url,p.demo_url,p.cover_image_id,m.secure_url AS cover_secure_url,m.alt_text AS cover_alt_text FROM projects p LEFT JOIN media m ON m.id=p.cover_image_id WHERE p.slug=? LIMIT 1",[slug])).rows[0] as any;
    if(row){
      seo.title=String(row.name)+" — Vijevira Labs";
      seo.description=String(row.description||"Project notes and implementation work from Vijevira Labs.");
      if(row.cover_secure_url)seo.image=row.cover_secure_url;
      seo.imageAlt=row.name;
      seo.jsonLd={
        "@context":"https://schema.org",
        "@graph":[
          {
            "@type":"SoftwareApplication",
            name:row.name,
            description:seo.description,
            url:origin+path,
            applicationCategory:"DeveloperApplication",
            operatingSystem:"Web",
            ...(row.repository_url?{codeRepository:row.repository_url}:{}),
            ...(row.demo_url?{sameAs:[row.demo_url]}:{}),
          },
          breadcrumbLd(origin,[{name:"Home",path:"/"},{name:"Projects",path:"/projects"},{name:row.name,path}])
        ]
      };
    }
    return seo;
  }

  if(path.startsWith("/research/")){
    const id=Number(path.slice(10));
    const row=(await sqlite.execute("SELECT p.id,p.title,p.description,p.published_at,p.updated_at,p.seo_title,p.seo_description,m.secure_url,m.alt_text FROM posts p LEFT JOIN media m ON m.id=p.cover_image_id WHERE p.id=? AND p.status='published' AND p.content_type='research' LIMIT 1",[id])).rows[0] as any;
    if(row){
      const title=String(row.seo_title||row.title)+" — Vijevira Labs";
      const description=String(row.seo_description||row.description||"Technical investigation from Vijevira Labs.");
      seo.title=title;
      seo.description=description;
      seo.ogType="article";
      seo.image=row.secure_url||undefined;
      seo.imageAlt=row.alt_text||row.title;
      seo.publishedTime=schemaDate(row.published_at);
      seo.modifiedTime=schemaDate(row.updated_at||row.published_at);
      seo.jsonLd={
        "@context":"https://schema.org",
        "@graph":[
          articleLd(origin,{...row,title:row.title},path,undefined,creator),
          breadcrumbLd(origin,[{name:"Home",path:"/"},{name:"Research",path:"/research"},{name:row.title,path}])
        ]
      };
    }
    return seo;
  }

  if(path.startsWith("/topics/")){
    const slug=decodeURIComponent(path.slice(8));
    const row=(await sqlite.execute("SELECT name,description,slug FROM categories WHERE slug=? LIMIT 1",[slug])).rows[0] as any;
    if(row){
      seo.title=String(row.name)+" — Vijevira Labs";
      seo.description=String(row.description||"Articles about "+row.name+" from Vijevira Labs.");
      seo.jsonLd={
        "@context":"https://schema.org",
        "@graph":[
          pageLd(origin,row.name,seo.description,path,"CollectionPage"),
          breadcrumbLd(origin,[{name:"Home",path:"/"},{name:"Topics",path:"/blog"},{name:row.name,path}])
        ]
      };
    }
    return seo;
  }

  if(path.startsWith("/tags/")){
    const slug=decodeURIComponent(path.slice(6));
    const row=(await sqlite.execute("SELECT name,slug FROM tags WHERE slug=? LIMIT 1",[slug])).rows[0] as any;
    if(row){
      seo.title=String(row.name)+" — Vijevira Labs";
      seo.description="Articles tagged "+row.name+" from Vijevira Labs.";
      seo.jsonLd={
        "@context":"https://schema.org",
        "@graph":[
          pageLd(origin,row.name,seo.description,path,"CollectionPage"),
          breadcrumbLd(origin,[{name:"Home",path:"/"},{name:"Tags",path:"/blog"},{name:row.name,path}])
        ]
      };
    }
    return seo;
  }

  seo.robots="noindex,follow";
  return seo;
}

app.get("*", async (c) => {
  await initDatabase();
  return c.html(Root(await resolveSeo(c)));
});

app.onError((err) => Promise.reject(err));
export default app.fetch;