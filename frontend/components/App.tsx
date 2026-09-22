/** @jsxImportSource https://esm.sh/react@18.2.0 */
import { useEffect, useState } from "https://esm.sh/react@18.2.0";

const nav = [
  ["/admin", "Dashboard"], ["/admin/posts", "Posts"], ["/admin/research", "Research"],
  ["/admin/tools", "Tools"], ["/admin/projects", "Projects"], ["/admin/media", "Media"],
  ["/admin/categories", "Categories"], ["/admin/tags", "Tags"], ["/admin/technologies", "Technologies"], ["/admin/settings", "Settings"],
];

function AdminShell({ children }: { children: any }) {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error?.message || "Unauthenticated");
        return d.data;
      })
      .then((data) => {
        setUser(data);
        setChecking(false);
      })
      .catch(() => {
        window.location.replace("/admin/login");
      });
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      window.location.replace("/admin/login");
    }
  };

  if (checking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">Checking session…</div>;
  }

  return <div className="min-h-screen bg-gray-50 text-gray-900">
    <aside className="fixed inset-y-0 left-0 w-60 border-r border-gray-200 bg-white p-5 flex flex-col">
      <a href="/admin" className="block text-lg font-semibold mb-8">Vijevira Labs</a>
      <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Admin</p>
      <nav className="space-y-1 flex-1">{nav.map(([href,label]) => <a key={href} href={href} className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">{label}</a>)}</nav>
      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 truncate mb-3">{user?.email}</p>
        <button type="button" onClick={logout} className="text-sm text-red-600 hover:text-red-700">Sign out</button>
        <a href="/" className="block mt-3 text-sm text-gray-500">← View site</a>
      </div>
    </aside>
    <main className="ml-60 min-h-screen p-8">{children}</main>
  </div>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error?.message || "Sign in failed");
      window.location.replace("/admin");
    } catch (e: any) {
      setError(e.message || "Sign in failed");
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
      <h1 className="text-2xl font-semibold">Vijevira Labs</h1>
      <p className="mt-1 text-sm text-gray-500">Admin sign in</p>
      <label className="block mt-7 text-sm font-medium">Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" />
      </label>
      <label className="block mt-4 text-sm font-medium">Password
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" />
      </label>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  </div>;
}

function Dashboard(){return <AdminShell><h1 class="text-3xl font-semibold">Dashboard</h1><p class="mt-2 text-gray-500">Manage your engineering content and research.</p><div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5"><a href="/admin/posts" class="rounded-xl border bg-white p-5"><p class="text-sm text-gray-500">Content</p><p class="mt-2 text-xl font-semibold">Posts</p></a><a href="/admin/research" class="rounded-xl border bg-white p-5"><p class="text-sm text-gray-500">Knowledge</p><p class="mt-2 text-xl font-semibold">Research</p></a><a href="/admin/media" class="rounded-xl border bg-white p-5"><p class="text-sm text-gray-500">Assets</p><p class="mt-2 text-xl font-semibold">Media</p></a></div></AdminShell>}

const TYPES=["article","tutorial","research","guide","comparison","project_log","note"];
const STATES=["draft","review","scheduled","published","archived"];

function MultiSelectField({label,items,selected,onToggle,emptyText,createHref}:{label:string,items:any[],selected:number[],onToggle:(id:number)=>void,emptyText:string,createHref:string}){
  return <div>
    <div className="flex items-center justify-between gap-3 mb-2">
      <div className="text-sm font-medium">{label}</div>
      <span className="text-xs text-gray-400">{selected.length} selected</span>
    </div>
    {selected.length>0&&<div className="flex flex-wrap gap-1.5 mb-2">{selected.map(id=>{const x=items.find((v:any)=>Number(v.id)===id);return x?<button type="button" key={id} onClick={()=>onToggle(id)} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-200">{x.name} ×</button>:null})}</div>}
    {items.length>0?<div className="max-h-44 overflow-auto rounded-lg border divide-y">
      {items.map((x:any)=><label key={x.id} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50">
        <input type="checkbox" checked={selected.includes(Number(x.id))} onChange={()=>onToggle(Number(x.id))} className="h-4 w-4 rounded"/>
        <span className="flex-1">{x.name}</span>
        {selected.includes(Number(x.id))&&<span className="text-xs text-gray-400">Selected</span>}
      </label>)}
    </div>:<div className="rounded-lg border border-dashed p-3 text-sm text-gray-500">{emptyText} <a href={createHref} className="font-medium text-gray-900 underline underline-offset-2">Create one</a></div>}
  </div>
}

function EnhancedPosts(){
  const path=location.pathname, edit=path.match(/^\/admin\/posts\/(\d+)\/edit$/), id=edit?.[1];
  const [items,setItems]=useState<any[]>([]),[cats,setCats]=useState<any[]>([]),[tags,setTags]=useState<any[]>([]),[techs,setTechs]=useState<any[]>([]),[tools,setTools]=useState<any[]>([]),[projects,setProjects]=useState<any[]>([]),[media,setMedia]=useState<any[]>([]);
  const [post,setPost]=useState<any>({title:"",slug:"",description:"",content:"",content_type:"article",status:"draft",featured:false,category_ids:[],tag_ids:[],technology_ids:[],tool_ids:[],project_ids:[],related_post_ids:[],cover_image_id:"",seo_title:"",seo_description:""});
  const [error,setError]=useState(""),[loading,setLoading]=useState(false);
  const load=()=>apiFetch("/api/posts?limit=100").then(setItems).catch(()=>{});
  useEffect(()=>{
    Promise.all([
      apiFetch("/api/taxonomy/categories"),
      apiFetch("/api/taxonomy/tags"),
      apiFetch("/api/taxonomy/technologies"),
      apiFetch("/api/content/tools"),
      apiFetch("/api/content/projects"),
      apiFetch("/api/content/media").catch(()=>[]),
      apiFetch("/api/posts?limit=100").catch(()=>[])
    ]).then(([c,t,te,to,pr,m,p])=>{setCats(c);setTags(t);setTechs(te);setTools(to);setProjects(pr);setMedia(m);setItems(p)})
      .catch((e:any)=>setError(e.message));
    if(!id)return;
    apiFetch("/api/posts/"+id)
      .then((p:any)=>setPost({...p,
        category_ids:(p.categories||[]).map((x:any)=>Number(x.id)),
        tag_ids:(p.tags||[]).map((x:any)=>Number(x.id)),
        technology_ids:(p.technologies||[]).map((x:any)=>Number(x.id)),
        tool_ids:(p.tools||[]).map((x:any)=>Number(x.id)),
        project_ids:(p.projects||[]).map((x:any)=>Number(x.id)),
        related_post_ids:(p.related_posts||[]).map((x:any)=>Number(x.id))
      }))
      .catch((e:any)=>setError(e.message))
  },[id]);

  const toggle=(key:string,n:number)=>setPost((p:any)=>({...p,[key]:(p[key]||[]).includes(n)?p[key].filter((x:number)=>x!==n):[...(p[key]||[]),n]}));
  const save=async(e:any)=>{
    e.preventDefault();setError("");setLoading(true);
    try{
      await apiFetch(id?"/api/posts/"+id:"/api/posts",{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(post)});
      location.href="/admin/posts";
    }catch(e:any){setError(e.message);setLoading(false)}
  };

  if(path==="/admin/posts"||path==="/admin/posts/"){
    return <AdminShell><div className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold">Posts</h1><p className="mt-2 text-gray-500">Articles, tutorials, research, guides and notes.</p></div><a href="/admin/posts/new" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">New post</a></div><div className="mt-8 rounded-xl border bg-white divide-y">{items.length?items.map(p=><div className="p-5 flex items-center justify-between gap-4" key={p.id}><div><div className="font-medium">{p.title}</div><div className="text-xs text-gray-500 mt-1">{p.status} · {p.content_type} · {p.category_name||"Uncategorized"}</div></div><div className="flex gap-3 text-sm"><button onClick={async()=>{await apiFetch("/api/posts/"+p.id+"/"+(p.status==="published"?"unpublish":"publish"),{method:"POST"});load()}} className="text-gray-600">{p.status==="published"?"Unpublish":"Publish"}</button><a href={"/admin/posts/"+p.id+"/edit"} className="text-gray-600">Edit</a><button onClick={async()=>{if(confirm("Delete this post?")){await apiFetch("/api/posts/"+p.id,{method:"DELETE"});load()}}} className="text-red-600">Delete</button></div></div>):<div className="p-10 text-center text-gray-500">No posts yet.</div>}</div></AdminShell>
  }

  return <AdminShell>
    <div className="flex justify-between gap-4 mb-6">
      <div><h1 className="text-3xl font-semibold">{id?"Edit post":"New post"}</h1><p className="mt-2 text-gray-500">Markdown editor with structured taxonomy, media, and relationships.</p></div>
      <a href="/admin/posts" className="text-sm text-gray-500">Back</a>
    </div>
    <form onSubmit={save} className="grid xl:grid-cols-[minmax(0,1fr)_380px] gap-6">
      <section className="rounded-xl border bg-white p-6 space-y-4">
        <input value={post.title} onChange={e=>setPost({...post,title:e.target.value})} placeholder="Title" required className="w-full text-3xl font-semibold border-b pb-3 outline-none"/>
        <input value={post.slug||""} onChange={e=>setPost({...post,slug:e.target.value})} placeholder="Slug" className="w-full rounded-lg border px-3 py-2"/>
        <textarea value={post.description||""} onChange={e=>setPost({...post,description:e.target.value})} placeholder="Description" rows={3} className="w-full rounded-lg border px-3 py-2"/>
        <textarea value={post.content||""} onChange={e=>setPost({...post,content:e.target.value})} placeholder="Write in Markdown..." rows={28} className="w-full rounded-lg border px-4 py-3 font-mono text-sm"/>
      </section>
      <aside className="rounded-xl border bg-white p-5 space-y-5">
        <label className="block text-sm font-medium">Status<select value={post.status} onChange={e=>setPost({...post,status:e.target.value})} className="mt-2 w-full rounded-lg border px-3 py-2">{STATES.map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="block text-sm font-medium">Content type<select value={post.content_type} onChange={e=>setPost({...post,content_type:e.target.value})} className="mt-2 w-full rounded-lg border px-3 py-2">{TYPES.map(x=><option key={x}>{x}</option>)}</select></label>

        <MultiSelectField label="Categories" items={cats} selected={post.category_ids||[]} onToggle={n=>toggle("category_ids",n)} emptyText="No categories available." createHref="/admin/categories"/>
        <MultiSelectField label="Tags" items={tags} selected={post.tag_ids||[]} onToggle={n=>toggle("tag_ids",n)} emptyText="No tags available." createHref="/admin/tags"/>
        <MultiSelectField label="Technologies" items={techs} selected={post.technology_ids||[]} onToggle={n=>toggle("technology_ids",n)} emptyText="No technologies available." createHref="/admin/technologies"/>
        <MultiSelectField label="Tools" items={tools} selected={post.tool_ids||[]} onToggle={n=>toggle("tool_ids",n)} emptyText="No tools available." createHref="/admin/tools"/>
        <MultiSelectField label="Projects" items={projects} selected={post.project_ids||[]} onToggle={n=>toggle("project_ids",n)} emptyText="No projects available." createHref="/admin/projects"/>
        <MultiSelectField label="Related posts" items={items.filter((x:any)=>Number(x.id)!==Number(id))} selected={post.related_post_ids||[]} onToggle={n=>toggle("related_post_ids",n)} emptyText="No other posts available yet." createHref="/admin/posts/new"/>

        <div>
          <label className="block text-sm font-medium">Cover image<select value={post.cover_image_id||""} onChange={e=>setPost({...post,cover_image_id:e.target.value?Number(e.target.value):null})} className="mt-2 w-full rounded-lg border px-3 py-2"><option value="">No cover</option>{media.map(x=><option key={x.id} value={x.id}>{x.filename}</option>)}</select></label>
          {post.cover_image_id&&media.find(x=>Number(x.id)===Number(post.cover_image_id))&&<img src={media.find(x=>Number(x.id)===Number(post.cover_image_id)).secure_url||media.find(x=>Number(x.id)===Number(post.cover_image_id)).url} className="mt-3 aspect-video w-full rounded-lg object-cover" />}
          <a href="/admin/media" className="mt-2 inline-block text-xs text-gray-500 underline">Manage media</a>
        </div>

        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!post.featured} onChange={e=>setPost({...post,featured:e.target.checked})}/> Featured</label>
        <input value={post.seo_title||""} onChange={e=>setPost({...post,seo_title:e.target.value})} placeholder="SEO title" className="w-full rounded-lg border px-3 py-2"/>
        <textarea value={post.seo_description||""} onChange={e=>setPost({...post,seo_description:e.target.value})} placeholder="SEO description" rows={3} className="w-full rounded-lg border px-3 py-2"/>
        {error&&<p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-gray-900 py-2.5 text-sm text-white disabled:opacity-50">{loading?"Saving…":"Save post"}</button>
      </aside>
    </form>
  </AdminShell>
}
function apiFetch(path:string,opts:any={}):Promise<any>{return fetch(path,{credentials:"include",...opts}).then(async r=>{const d=await r.json().catch(()=>({}));if(r.status===401){location.href="/admin/login";throw Error("Unauthenticated")}if(!r.ok)throw Error(d.error?.message||"Request failed");return d.data})}



function TaxonomyManager({kind}:{kind:"categories"|"tags"|"technologies"}){
  const [rows,setRows]=useState<any[]>([]),[editing,setEditing]=useState<any>(null),[name,setName]=useState(""),[slug,setSlug]=useState(""),[description,setDescription]=useState(""),[website,setWebsite]=useState(""),[logo,setLogo]=useState(""),[error,setError]=useState("");
  const load=()=>apiFetch("/api/taxonomy/"+kind).then(setRows).catch(()=>{});
  useEffect(load,[]);
  const reset=()=>{setEditing(null);setName("");setSlug("");setDescription("");setWebsite("");setLogo("");setError("")};
  const save=async(e:any)=>{e.preventDefault();try{const body:any={name,slug};if(kind!=="tags")body.description=description;if(kind==="technologies"){body.website_url=website;body.logo_url=logo}await apiFetch(editing?"/api/taxonomy/"+kind+"/"+editing.id:"/api/taxonomy/"+kind,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});reset();load()}catch(e:any){setError(e.message)}};
  const edit=(x:any)=>{setEditing(x);setName(x.name);setSlug(x.slug);setDescription(x.description||"");setWebsite(x.website_url||"");setLogo(x.logo_url||"")};
  return <AdminShell><h1 className="text-3xl font-semibold">{kind[0].toUpperCase()+kind.slice(1)}</h1><div className="mt-8 grid lg:grid-cols-[340px_1fr] gap-6"><form onSubmit={save} className="rounded-xl border bg-white p-5 space-y-3"><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full rounded-lg border px-3 py-2"/><input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="Slug (optional)" className="w-full rounded-lg border px-3 py-2"/>{kind!=="tags"&&<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full rounded-lg border px-3 py-2"/>}{kind==="technologies"&&<><input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="Website URL" className="w-full rounded-lg border px-3 py-2"/><input value={logo} onChange={e=>setLogo(e.target.value)} placeholder="Logo URL" className="w-full rounded-lg border px-3 py-2"/></>}{error&&<p className="text-sm text-red-600">{error}</p>}<div className="flex gap-2"><button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">{editing?"Update":"Add"}</button>{editing&&<button type="button" onClick={reset} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>}</div></form><div className="rounded-xl border bg-white divide-y">{rows.map(x=><div key={x.id} className="p-4 flex justify-between gap-4"><div><div className="font-medium">{x.name}</div><div className="text-xs text-gray-500">{x.slug}</div></div><div className="flex gap-3 text-sm"><button onClick={()=>edit(x)} className="text-gray-600">Edit</button><button onClick={async()=>{if(confirm("Delete this item?")){await apiFetch("/api/taxonomy/"+kind+"/"+x.id,{method:"DELETE"});load()}}} className="text-red-600">Delete</button></div></div>)}</div></div></AdminShell>
}

function EntityManager({kind}:{kind:"tools"|"projects"}){
  const [rows,setRows]=useState<any[]>([]),[editing,setEditing]=useState<any>(null),[form,setForm]=useState<any>({name:"",slug:"",description:"",long_description:"",website_url:"",category:"",pricing_type:"",free_tier:"",logo_url:"",my_experience:"",limitations:"",content:"",status:"building",repository_url:"",demo_url:"",cover_image_id:"",featured:false}),[error,setError]=useState("");
  const tool=kind==="tools", routeId=(location.pathname.match(new RegExp("^/admin/"+kind+"/(\\d+)/edit$"))||[])[1], load=()=>apiFetch("/api/content/"+kind).then((data:any[])=>{setRows(data);if(routeId){const item=data.find(x=>String(x.id)===String(routeId));if(item){setEditing(item);setForm((v:any)=>({...v,...item}))}}}).catch(()=>{}); useEffect(load,[kind,routeId]);
  const set=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v})); const reset=()=>{setEditing(null);setForm({name:"",slug:"",description:"",long_description:"",website_url:"",category:"",pricing_type:"",free_tier:"",logo_url:"",my_experience:"",limitations:"",content:"",status:"building",repository_url:"",demo_url:"",cover_image_id:"",featured:false});setError("")};
  const save=async(e:any)=>{e.preventDefault();try{await apiFetch(editing?"/api/content/"+kind+"/"+editing.id:"/api/content/"+kind,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});reset();load()}catch(e:any){setError(e.message)}};
  const fields=tool?[["description","Description",true],["long_description","Long description",true],["website_url","Website URL"],["category","Category"],["pricing_type","Pricing type"],["free_tier","Free tier",true],["logo_url","Logo URL"],["my_experience","My experience",true],["limitations","Limitations",true]]:[["description","Description",true],["content","Content",true],["status","Status"],["repository_url","Repository URL"],["demo_url","Demo URL"],["cover_image_id","Cover image ID"]];
  return <AdminShell><div className="flex justify-between"><div><h1 className="text-3xl font-semibold">{kind[0].toUpperCase()+kind.slice(1)}</h1><p className="mt-2 text-gray-500">Manage {kind}.</p></div></div><div className="mt-8 grid lg:grid-cols-[380px_1fr] gap-6"><form onSubmit={save} className="rounded-xl border bg-white p-5 space-y-3"><input required value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Name" className="w-full rounded-lg border px-3 py-2"/><input value={form.slug} onChange={e=>set("slug",e.target.value)} placeholder="Slug" className="w-full rounded-lg border px-3 py-2"/>{fields.map((x:any)=>x[2]?<textarea key={x[0]} value={form[x[0]]||""} onChange={e=>set(x[0],e.target.value)} placeholder={x[1]} rows={x[0]==="content"?10:3} className="w-full rounded-lg border px-3 py-2"/>:<input key={x[0]} value={form[x[0]]||""} onChange={e=>set(x[0],e.target.value)} placeholder={x[1]} className="w-full rounded-lg border px-3 py-2"/>)}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.featured} onChange={e=>set("featured",e.target.checked)}/> Featured</label>{error&&<p className="text-sm text-red-600">{error}</p>}<div className="flex gap-2"><button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">{editing?"Update":"Add"}</button>{editing&&<button type="button" onClick={reset} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>}</div></form><div className="rounded-xl border bg-white divide-y">{rows.map(x=><div key={x.id} className="p-4 flex justify-between gap-4"><div><div className="font-medium">{x.name}</div><div className="text-xs text-gray-500">{x.slug}</div></div><div className="flex gap-3 text-sm"><button onClick={()=>{setEditing(x);setForm((v:any)=>({...v,...x}))}} className="text-gray-600">Edit</button><button onClick={async()=>{if(confirm("Delete this item?")){await apiFetch("/api/content/"+kind+"/"+x.id,{method:"DELETE"});load()}}} className="text-red-600">Delete</button></div></div>)}</div></div></AdminShell>
}

function ResearchManager(){
  const [rows,setRows]=useState<any[]>([]),[editing,setEditing]=useState<any>(null),[form,setForm]=useState<any>({title:"",slug:"",content:"",status:"active"});const routeId=(location.pathname.match(/^\/admin\/research\/(\d+)\/edit$/)||[])[1];const load=()=>apiFetch("/api/content/admin/research-notes").then((data:any[])=>{setRows(data);if(routeId){const item=data.find(x=>String(x.id)===String(routeId));if(item){setEditing(item);setForm({...item})}}}).catch(()=>{});useEffect(load,[routeId]);
  const save=async(e:any)=>{e.preventDefault();await apiFetch(editing?"/api/content/admin/research-notes/"+editing.id:"/api/content/admin/research-notes",{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});setEditing(null);setForm({title:"",slug:"",content:"",status:"active"});load()};
  return <AdminShell><h1 className="text-3xl font-semibold">Research</h1><p className="mt-2 text-gray-500">Private research notes; promote finished work to a research post.</p><div className="mt-8 grid lg:grid-cols-[380px_1fr] gap-6"><form onSubmit={save} className="rounded-xl border bg-white p-5 space-y-3"><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className="w-full rounded-lg border px-3 py-2"/><input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="Slug" className="w-full rounded-lg border px-3 py-2"/><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full rounded-lg border px-3 py-2"><option>active</option><option>completed</option><option>converted</option><option>archived</option></select><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={15} placeholder="Research notes..." className="w-full rounded-lg border px-3 py-2 font-mono text-sm"/><button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">{editing?"Update note":"Add note"}</button></form><div className="rounded-xl border bg-white divide-y">{rows.map(x=><div key={x.id} className="p-4 flex justify-between"><div><div className="font-medium">{x.title}</div><div className="text-xs text-gray-500">{x.status} · {new Date(x.updated_at).toLocaleDateString()}</div></div><div className="flex gap-3"><button className="text-sm text-gray-600" onClick={()=>{setEditing(x);setForm({...x})}}>Edit</button>{x.status!=="converted"&&<button className="text-sm text-gray-600" onClick={async()=>{if(confirm("Convert this note into a draft research post?")){await apiFetch("/api/content/admin/research-notes/"+x.id+"/convert",{method:"POST"});load()}}}>Convert</button>}</div></div>)}</div></div></AdminShell>
}

function MediaManager(){
 const [rows,setRows]=useState<any[]>([]),[error,setError]=useState("");const load=()=>apiFetch("/api/content/media").then(setRows).catch((e:any)=>setError(e.message));useEffect(load,[]);
 const upload=async(e:any)=>{e.preventDefault();const f=(document.getElementById("media-file") as HTMLInputElement).files?.[0];if(!f)return;const fd=new FormData();fd.append("file",f);try{await apiFetch("/api/content/media",{method:"POST",body:fd});load()}catch(e:any){setError(e.message)}};
 return <AdminShell><h1 className="text-3xl font-semibold">Media</h1><p className="mt-2 text-gray-500">Cloudinary-backed image library.</p><form onSubmit={upload} className="mt-8 rounded-xl border bg-white p-5 flex gap-3"><input id="media-file" type="file" accept="image/*" className="flex-1"/><button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Upload</button></form>{error&&<p className="mt-3 text-sm text-red-600">{error}</p>}<div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">{rows.map(x=><div key={x.id} className="rounded-xl border overflow-hidden bg-white"><img src={x.secure_url||x.url} className="aspect-video object-cover w-full"/><p className="p-3 text-sm truncate">{x.filename}</p></div>)}</div></AdminShell>
}

function SettingsManager(){const [s,setS]=useState<any>({site_title:"Vijevira Labs",site_tagline:"Engineering, Research & Building.",site_description:"",github_url:"",author_name:"Vijevira Labs"}),[saved,setSaved]=useState(false);useEffect(()=>{apiFetch("/api/content/settings").then((x:any)=>setS((v:any)=>({...v,...x}))).catch(()=>{})},[]);const save=async(e:any)=>{e.preventDefault();await apiFetch("/api/content/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});setSaved(true);setTimeout(()=>setSaved(false),1500)};return <AdminShell><h1 className="text-3xl font-semibold">Settings</h1><form onSubmit={save} className="mt-8 max-w-2xl rounded-xl border bg-white p-6 space-y-4">{Object.entries(s).map(([k,v]:any)=><label key={k} className="block text-sm font-medium">{k.replaceAll("_"," ")}<input value={v||""} onChange={e=>setS((x:any)=>({...x,[k]:e.target.value}))} className="mt-2 w-full rounded-lg border px-3 py-2"/></label>)}<button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Save</button>{saved&&<span className="ml-3 text-sm text-green-700">Saved.</span>}</form></AdminShell>}


const ARTICLE_STYLES = `
.vl-article{font-size:1.08rem;line-height:1.85;color:#334155}
.vl-article p{margin:1.25rem 0}
.vl-article h2{margin:3rem 0 1rem;font-size:1.9rem;line-height:1.25;letter-spacing:-.02em;color:#0f172a;scroll-margin-top:6rem}
.vl-article h3{margin:2.25rem 0 .8rem;font-size:1.35rem;line-height:1.35;color:#0f172a;scroll-margin-top:6rem}
.vl-article h2:first-child,.vl-article h3:first-child{margin-top:0}
.vl-article strong{font-weight:700;color:#0f172a}
.vl-article em{font-style:italic}
.vl-article a{color:#0f766e;text-decoration:underline;text-decoration-color:#99f6e4;text-underline-offset:3px}
.vl-article a:hover{text-decoration-color:#0f766e}
.vl-article ul,.vl-article ol{margin:1.25rem 0;padding-left:1.55rem}
.vl-article li{margin:.5rem 0;padding-left:.25rem}
.vl-article li::marker{color:#64748b}
.vl-article blockquote{margin:1.75rem 0;padding:.9rem 1.2rem;border-left:4px solid #cbd5e1;background:#f8fafc;border-radius:0 12px 12px 0;color:#475569}
.vl-article hr{margin:2.75rem 0;border:0;border-top:1px solid #e2e8f0}
.vl-article .vl-inline-code{padding:.16rem .4rem;border-radius:.4rem;background:#f1f5f9;color:#0f172a;font:500 .9em ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
.vl-code-shell{margin:1.5rem 0;border:1px solid #1e293b;border-radius:14px;overflow:hidden;background:#0f172a;box-shadow:0 12px 28px rgba(15,23,42,.08)}
.vl-code-label{padding:.55rem .85rem;background:#111827;border-bottom:1px solid #1e293b;color:#94a3b8;font:600 .72rem/1 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;text-transform:uppercase;letter-spacing:.08em}
.vl-article pre{margin:0;overflow:auto;padding:1.1rem 1.2rem;color:#e2e8f0;font:500 .9rem/1.75 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
.vl-table-wrap{margin:1.5rem 0;overflow-x:auto;border:1px solid #e2e8f0;border-radius:14px}
.vl-article table{width:100%;border-collapse:collapse;min-width:520px;background:#fff}
.vl-article th,.vl-article td{padding:.8rem 1rem;text-align:left;border-bottom:1px solid #e2e8f0}
.vl-article th{background:#f8fafc;color:#0f172a;font-size:.9rem;font-weight:700}
.vl-article tr:last-child td{border-bottom:0}
.vl-article img{display:block;max-width:100%;height:auto;margin:1.5rem auto;border-radius:14px}
.vl-toc{position:sticky;top:6.5rem}
.vl-toc a{display:block;padding:.35rem 0;color:#64748b;text-decoration:none;font-size:.82rem;line-height:1.4}
.vl-toc a:hover{color:#0f172a}
.vl-article .vl-lead{font-size:1.18rem;line-height:1.8;color:#475569}
`;
function siteShell(children:any){return <div className="min-h-screen bg-white text-gray-900"><style>{ARTICLE_STYLES}</style><header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur"><nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between"><a href="/" className="font-semibold text-lg">Vijevira Labs</a><div className="flex items-center gap-4 md:gap-6 text-sm text-gray-600"><a href="/blog">Blog</a><a href="/tools">Tools</a><a href="/projects">Projects</a><a href="/research">Research</a><a href="/search">Search</a><a href="/about">About</a></div></nav></header>{children}<footer className="border-t mt-20"><div className="max-w-6xl mx-auto px-5 py-10 flex justify-between text-sm text-gray-500"><span>Vijevira Labs — Engineering, Research &amp; Building.</span><a href="/rss.xml">RSS</a></div></footer></div>}
function escapeHtml(value:string){
  return String(value||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

function safeUrl(value:string){
  const url=String(value||"").trim();
  if(/^https?:\/\//i.test(url) || url.startsWith("/") || url.startsWith("#")) return url;
  return "#";
}

function headingId(value:string,index:number){
  const base=String(value||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"") || "section";
  return index ? `${base}-${index+1}` : base;
}

function inlineMd(value:string){
  let s=escapeHtml(value);
  const protectedParts:string[]=[];
  s=s.replace(/`([^\`]+)`/g,(_,code)=>{const i=protectedParts.push(`<code class="vl-inline-code">${code}</code>`)-1;return `@@INLINE${i}@@`;});
  s=s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_,alt,url)=>`<img src="${safeUrl(url)}" alt="${alt}" loading="lazy">`);
  s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>`<a href="${safeUrl(url)}"${/^https?:\/\//i.test(String(url))?' target="_blank" rel="noreferrer"':''}>${label}</a>`);
  s=s.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/__(.*?)__/g,"<strong>$1</strong>");
  s=s.replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/_([^_]+)_/g,"<em>$1</em>");
  s=s.replace(/~~(.*?)~~/g,"<del>$1</del>");
  s=s.replace(/@@INLINE(\d+)@@/g,(_,i)=>protectedParts[Number(i)]);
  return s;
}

function parseTableRow(line:string){
  const cleaned=line.trim().replace(/^\|/,"").replace(/\|$/,"");
  return cleaned.split("|").map(x=>x.trim());
}

function renderMarkdown(value:string){
  const raw=String(value||"").replace(/\r\n?/g,"\n");
  const codeBlocks:string[]=[];
  const protectedText=raw.replace(/\`\`\`([a-zA-Z0-9_+-]*)\n([\s\S]*?)\`\`\`/g,(_,lang,code)=>{
    const i=codeBlocks.push({lang:lang||"text",code:escapeHtml(code.replace(/\n$/,""))} as any)-1;
    return `@@BLOCK${i}@@`;
  });
  const lines=protectedText.split("\n");
  const html:string[]=[];
  const headings:{id:string,label:string,level:number}[]=[];
  let i=0;

  while(i<lines.length){
    const line=lines[i];

    if(!line.trim()){i++;continue;}

    const block= line.match(/^@@BLOCK(\d+)@@$/);
    if(block){
      const item=codeBlocks[Number(block[1])] as any;
      html.push(`<div class="vl-code-shell"><div class="vl-code-label">${escapeHtml(item.lang)}</div><pre><code>${item.code}</code></pre></div>`);
      i++;continue;
    }

    const h=line.match(/^(#{1,3})\s+(.+)$/);
    if(h){
      const level=h[1].length;
      const label=h[2].trim();
      const id=headingId(label,headings.length);
      headings.push({id,label,level});
      html.push(`<h${level} id="${id}">${inlineMd(label)}</h${level}>`);
      i++;continue;
    }

    if(/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)){html.push("<hr>");i++;continue;}

    if(/^\|.*\|$/.test(line) && i+1<lines.length && /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(lines[i+1].trim())){
      const header=parseTableRow(line);
      i+=2;
      const rows:string[][]=[];
      while(i<lines.length && /^\|.*\|$/.test(lines[i].trim())){rows.push(parseTableRow(lines[i]));i++;}
      html.push(`<div class="vl-table-wrap"><table><thead><tr>${header.map(x=>`<th>${inlineMd(x)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${header.map((_,j)=>`<td>${inlineMd(r[j]||"")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }

    if(/^\s*[-*+]\s+/.test(line)){
      const items:string[]=[];
      while(i<lines.length && /^\s*[-*+]\s+/.test(lines[i])){items.push(lines[i].replace(/^\s*[-*+]\s+/,""));i++;}
      html.push(`<ul>${items.map(x=>`<li>${inlineMd(x)}</li>`).join("")}</ul>`);
      continue;
    }

    if(/^\s*\d+\.\s+/.test(line)){
      const items:string[]=[];
      while(i<lines.length && /^\s*\d+\.\s+/.test(lines[i])){items.push(lines[i].replace(/^\s*\d+\.\s+/,""));i++;}
      html.push(`<ol>${items.map(x=>`<li>${inlineMd(x)}</li>`).join("")}</ol>`);
      continue;
    }

    if(/^\s*>\s?/.test(line)){
      const items:string[]=[];
      while(i<lines.length && /^\s*>\s?/.test(lines[i])){items.push(lines[i].replace(/^\s*>\s?/,""));i++;}
      html.push(`<blockquote>${items.map(x=>inlineMd(x)).join("<br>")}</blockquote>`);
      continue;
    }

    const paragraph:string[]=[line];
    i++;
    while(i<lines.length && lines[i].trim() && !/^#{1,3}\s+/.test(lines[i]) && !/^@@BLOCK\d+@@$/.test(lines[i]) && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) && !/^\s*>\s?/.test(lines[i]) && !/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(lines[i])){
      paragraph.push(lines[i]);i++;
    }
    html.push(`<p>${paragraph.map(x=>inlineMd(x.trim())).join(" ")}</p>`);
  }

  return {html:html.join(""),headings};
}

function Md({value,article=false}:{value:string,article?:boolean}){
  const source=article ? String(value||"").replace(/^#\s+.+(?:\r?\n|$)/,"") : value;
  const rendered=renderMarkdown(source);
  return <div className={article ? "grid lg:grid-cols-[minmax(0,1fr)_220px] gap-12 items-start" : ""}>
    <div className="vl-article" dangerouslySetInnerHTML={{__html:rendered.html}}/>
    {article && rendered.headings.length>1 && <aside className="hidden lg:block vl-toc rounded-xl border border-gray-200 bg-gray-50/70 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">On this page</div>
      <nav>{rendered.headings.filter(x=>x.level<=2).map(x=><a key={x.id} href={"#"+x.id} className={x.level===3?"pl-3":""}>{x.label}</a>)}</nav>
    </aside>}
  </div>;
}
function HomePublic(){const [posts,setPosts]=useState<any[]>([]);useEffect(()=>{apiFetch("/api/posts?status=published&limit=4").then(setPosts).catch(()=>{})},[]);return siteShell(<><main className="max-w-6xl mx-auto px-5 py-24"><p className="text-sm font-medium text-gray-500">Engineering, Research &amp; Building.</p><h1 className="mt-4 text-5xl md:text-6xl font-bold tracking-tight">Vijevira Labs</h1><p className="mt-6 max-w-2xl text-xl leading-8 text-gray-600">Practical engineering notes, research, production lessons, developer tools, and projects built around useful, real-world systems.</p><div className="mt-10 flex gap-3"><a href="/blog" className="rounded-lg bg-gray-900 px-5 py-3 text-white">Read the blog</a><a href="/projects" className="rounded-lg border px-5 py-3">Projects</a></div></main>{posts.length>0&&<section className="max-w-6xl mx-auto px-5 pb-16"><h2 className="text-2xl font-semibold">Latest writing</h2><div className="mt-5 grid md:grid-cols-2 gap-5">{posts.map(p=><a key={p.id} href={"/blog/"+p.slug} className="rounded-2xl border p-6"><div className="text-xs text-gray-500">{p.content_type} · {p.category_name||"Uncategorized"}</div><div className="mt-2 text-xl font-semibold">{p.title}</div><p className="mt-2 text-gray-600">{p.description}</p></a>)}</div></section>}</>)}
function BlogPublic(){const [rows,setRows]=useState<any[]>([]);useEffect(()=>{apiFetch("/api/posts?status=published&limit=100").then(setRows).catch(()=>{})},[]);return siteShell(<main className="max-w-4xl mx-auto px-5 py-16"><h1 className="text-4xl font-bold">Blog</h1><p className="mt-3 text-gray-600">Engineering articles, tutorials, guides, comparisons and build notes.</p><div className="mt-10 space-y-5">{rows.map(p=><article key={p.id} className="rounded-2xl border p-6"><div className="text-xs text-gray-500">{p.content_type} · {p.category_name||"Uncategorized"} · {dateFmt(p.published_at)}</div><h2 className="mt-2 text-2xl font-semibold"><a href={"/blog/"+p.slug}>{p.title}</a></h2><p className="mt-2 text-gray-600">{p.description}</p></article>)}{rows.length===0&&<div className="rounded-xl border p-10 text-center text-gray-500">No published posts yet.</div>}</div></main>)}
function PostPublic({slug}:{slug:string}){
  const [p,setP]=useState<any>(null);
  useEffect(()=>{apiFetch("/api/posts/slug/"+encodeURIComponent(slug)).then(setP).catch(()=>setP(false))},[slug]);
  if(p===false)return siteShell(<main className="max-w-3xl mx-auto px-5 py-20"><h1 className="text-3xl font-bold">Post not found</h1></main>);
  if(!p)return siteShell(<main className="max-w-3xl mx-auto px-5 py-20 text-gray-500">Loading…</main>);

  const cats=p.categories||[];
  const tags=p.tags||[];

  return siteShell(
    <main className="max-w-6xl mx-auto px-5 py-12 md:py-16">
      <div className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
          <a href="/blog" className="hover:text-gray-900">Blog</a>
          <span>/</span>
          <span className="uppercase tracking-wider">{p.content_type}</span>
          {cats.slice(0,3).map((x:any)=><a key={x.id} href={"/topics/"+x.slug} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-600">{x.name}</a>)}
        </div>

        <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-gray-950">{p.title}</h1>

        {p.description&&<p className="vl-lead mt-6 max-w-3xl">{p.description}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
          {p.published_at&&<span>{dateFmt(p.published_at)}</span>}
          {p.reading_time&&<span>{p.reading_time} min read</span>}
          <span>{p.content_type}</span>
        </div>
      </div>

      {p.cover_secure_url&&<figure className="mt-10 md:mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
        <img src={p.cover_secure_url} alt={p.title} className="w-full max-h-[560px] object-cover"/>
      </figure>}

      <div className="mt-12 md:mt-16 max-w-5xl">
        <Md value={p.content} article/>
      </div>

      {tags.length>0&&<div className="mt-14 max-w-3xl border-t border-gray-200 pt-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Tags</div>
        <div className="flex flex-wrap gap-2">
          {tags.map((x:any)=><a href={"/tags/"+x.slug} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200" key={x.id}>{x.name}</a>)}
        </div>
      </div>}

      <div className="mt-12 max-w-3xl">
        <a href="/blog" className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">← Back to all posts</a>
      </div>
    </main>
  );
}
function dateFmt(s:any){return s?new Date(s).toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}):""}
function CollectionPublic({kind}:{kind:"tools"|"projects"|"research"}){const [rows,setRows]=useState<any[]>([]);useEffect(()=>{apiFetch(kind==="research"?"/api/content/research":"/api/content/"+kind).then(setRows).catch(()=>{})},[kind]);return siteShell(<main className="max-w-5xl mx-auto px-5 py-16"><h1 className="text-4xl font-bold">{kind[0].toUpperCase()+kind.slice(1)}</h1><div className="mt-10 grid md:grid-cols-2 gap-5">{rows.map(x=><article className="rounded-2xl border p-6" key={x.id}><div className="text-xs text-gray-500">{kind==="tools"?(x.pricing_type||"Tool"):(kind==="projects"?x.status:"Research")}</div><h2 className="mt-2 text-xl font-semibold"><a href={kind==="research"?"/research/"+x.id:"/"+kind+"/"+x.slug}>{x.name||x.title}</a></h2><p className="mt-2 text-gray-600">{x.description}</p></article>)}{!rows.length&&<div className="rounded-xl border p-10 text-center text-gray-500">Nothing published here yet.</div>}</div></main>)}
function DetailPublic({kind,slug}:{kind:"tools"|"projects",slug:string}){const [x,setX]=useState<any>(null);useEffect(()=>{apiFetch("/api/content/"+kind).then((rows:any[])=>setX(rows.find(r=>r.slug===slug)||false)).catch(()=>setX(false))},[kind,slug]);if(!x)return siteShell(<main className="max-w-3xl mx-auto px-5 py-20 text-gray-500">{x===false?"Not found":"Loading…"}</main>);return siteShell(<main className="max-w-3xl mx-auto px-5 py-16"><div className="text-xs uppercase tracking-wider text-gray-500">{kind}</div><h1 className="mt-3 text-4xl font-bold">{x.name}</h1><p className="mt-4 text-xl text-gray-600">{x.description}</p>{x.website_url&&<p className="mt-5"><a className="underline" href={x.website_url} target="_blank" rel="noreferrer">Website</a></p>}{kind==="projects"&&(x.repository_url||x.demo_url)&&<div className="mt-5 flex gap-4 text-sm">{x.repository_url&&<a className="underline" href={x.repository_url} target="_blank" rel="noreferrer">Repository</a>}{x.demo_url&&<a className="underline" href={x.demo_url} target="_blank" rel="noreferrer">Demo</a>}</div>}<div className="mt-10"><Md value={x.content||x.long_description||""}/></div></main>)}
function ResearchPublic(){const [rows,setRows]=useState<any[]>([]);useEffect(()=>{apiFetch("/api/content/research").then(setRows).catch(()=>{})},[]);return siteShell(<main className="max-w-5xl mx-auto px-5 py-16"><h1 className="text-4xl font-bold">Research</h1><p className="mt-3 text-gray-600">Published technical research and investigations.</p><div className="mt-10 grid md:grid-cols-2 gap-5">{rows.map(x=><a href={"/research/"+x.id} className="rounded-2xl border p-6" key={x.id}><div className="text-xs text-gray-500">{dateFmt(x.published_at)}</div><h2 className="mt-2 text-xl font-semibold">{x.title}</h2><p className="mt-2 text-gray-600">{x.description}</p></a>)}</div></main>)}
function ResearchDetailPublic({id}:{id:string}){const [x,setX]=useState<any>(null);useEffect(()=>{apiFetch("/api/content/research/"+id).then(setX).catch(()=>setX(false))},[id]);if(!x)return siteShell(<main className="max-w-3xl mx-auto px-5 py-20 text-gray-500">{x===false?"Not found":"Loading…"}</main>);return siteShell(<article className="max-w-3xl mx-auto px-5 py-16"><div className="text-xs text-gray-500">Research · {dateFmt(x.published_at)}</div><h1 className="mt-3 text-4xl font-bold">{x.title}</h1><p className="mt-4 text-xl text-gray-600">{x.description}</p><div className="mt-10"><Md value={x.content}/></div></article>)}
function SearchPublic(){const [rows,setRows]=useState<any[]>([]),[q,setQ]=useState("");const run=async(e:any)=>{e.preventDefault();setRows(await apiFetch("/api/posts?status=published&limit=100&q="+encodeURIComponent(q)))};return siteShell(<main className="max-w-4xl mx-auto px-5 py-16"><h1 className="text-4xl font-bold">Search</h1><form onSubmit={run} className="mt-6 flex gap-2"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search posts..." className="flex-1 rounded-lg border px-3 py-2"/><button className="rounded-lg bg-gray-900 px-4 text-white">Search</button></form><div className="mt-8 space-y-4">{rows.map(x=><a key={x.id} href={"/blog/"+x.slug} className="block rounded-xl border p-5"><div className="font-medium">{x.title}</div><p className="mt-1 text-sm text-gray-600">{x.description}</p></a>)}</div></main>)}
function AboutPublic(){return siteShell(<main className="max-w-3xl mx-auto px-5 py-16"><h1 className="text-4xl font-bold">About Vijevira Labs</h1><div className="mt-8 space-y-5 text-lg leading-8 text-gray-700"><p>Vijevira Labs is an independent engineering lab for building, researching, documenting, and sharing practical software systems.</p><p>Content connects with tools, technologies, projects, experiments, and production lessons so technical knowledge stays useful beyond a single post.</p></div></main>)}
function TaxonomyPublic({slug}:{slug:string}){const [data,setData]=useState<any[]>([]),[posts,setPosts]=useState<any[]>([]);useEffect(()=>{apiFetch("/api/taxonomy/categories").then((c:any[])=>{const row=c.find((x:any)=>x.slug===slug);setData(row?[row]:[]);if(row)return apiFetch("/api/posts?status=published&limit=100&category_id="+encodeURIComponent(row.id)).then(setPosts);setPosts([])}).catch(()=>{})},[slug]);const c=data[0];return siteShell(<main className="max-w-4xl mx-auto px-5 py-16"><div className="text-sm text-gray-500">Topic</div><h1 className="mt-2 text-4xl font-bold">{c?.name||slug}</h1><p className="mt-3 text-gray-600">{c?.description}</p><div className="mt-8 space-y-4">{posts.map(x=><a className="block rounded-xl border p-5" href={"/blog/"+x.slug} key={x.id}><div className="font-medium">{x.title}</div><p className="mt-1 text-sm text-gray-600">{x.description}</p></a>)}</div>{!posts.length&&c&&<p className="mt-8 text-gray-500">No published posts in this topic yet.</p>}</main>)}

function TagPublic({slug}:{slug:string}){
  const [data,setData]=useState<any>(null);
  useEffect(()=>{apiFetch("/api/taxonomy/tags/"+encodeURIComponent(slug)+"/posts").then(setData).catch(()=>setData(false))},[slug]);
  if(data===false)return siteShell(<main className="max-w-3xl mx-auto px-5 py-20"><h1 className="text-3xl font-bold">Tag not found</h1></main>);
  if(!data)return siteShell(<main className="max-w-3xl mx-auto px-5 py-20 text-gray-500">Loading…</main>);
  return siteShell(<main className="max-w-4xl mx-auto px-5 py-16"><div className="text-sm text-gray-500">Tag</div><h1 className="mt-2 text-4xl font-bold">{data.tag.name}</h1><div className="mt-8 space-y-4">{data.posts.map((p:any)=><a key={p.id} href={"/blog/"+p.slug} className="block rounded-xl border p-5"><div className="font-medium">{p.title}</div><p className="mt-1 text-sm text-gray-600">{p.description}</p></a>)}</div>{!data.posts.length&&<p className="mt-8 text-gray-500">No published posts use this tag yet.</p>}</main>);
}

export function App(){
  const path=window.location.pathname;
  if(path==="/admin/login") return <Login/>;
  if(path==="/admin/posts"||path==="/admin/posts/"||path==="/admin/posts/new"||/^\/admin\/posts\/\d+\/edit$/.test(path)) return <EnhancedPosts/>;
  if(path==="/admin/categories") return <TaxonomyManager kind="categories"/>;
  if(path==="/admin/tags") return <TaxonomyManager kind="tags"/>;
  if(path==="/admin/technologies") return <TaxonomyManager kind="technologies"/>;
  if(path==="/admin/tools"||path==="/admin/tools/new"||/^\/admin\/tools\/\d+\/edit$/.test(path)) return <EntityManager kind="tools"/>;
  if(path==="/admin/projects"||path==="/admin/projects/new"||/^\/admin\/projects\/\d+\/edit$/.test(path)) return <EntityManager kind="projects"/>;
  if(path==="/admin/research"||path==="/admin/research/new"||/^\/admin\/research\/\d+\/edit$/.test(path)) return <ResearchManager/>;
  if(path==="/admin/media") return <MediaManager/>;
  if(path==="/admin/settings") return <SettingsManager/>;
  if(path==="/admin"||path.startsWith("/admin/")) return <Dashboard/>;
  if(path==="/") return <HomePublic/>;
  if(path==="/blog"||path==="/blog/") return <BlogPublic/>;
  if(path.startsWith("/blog/")) return <PostPublic slug={decodeURIComponent(path.slice(6))}/>;
  if(path==="/tools"||path==="/tools/") return <CollectionPublic kind="tools"/>;
  if(path.startsWith("/tools/")) return <DetailPublic kind="tools" slug={decodeURIComponent(path.slice(7))}/>;
  if(path==="/projects"||path==="/projects/") return <CollectionPublic kind="projects"/>;
  if(path.startsWith("/projects/")) return <DetailPublic kind="projects" slug={decodeURIComponent(path.slice(10))}/>;
  if(path==="/research"||path==="/research/") return <ResearchPublic/>;
  if(path.startsWith("/research/")) return <ResearchDetailPublic id={path.slice(10)}/>;
  if(path==="/search") return <SearchPublic/>;
  if(path==="/about") return <AboutPublic/>;
  if(path.startsWith("/tags/")) return <TagPublic slug={decodeURIComponent(path.slice(6))}/>;
  if(path.startsWith("/topics/")) return <TaxonomyPublic slug={decodeURIComponent(path.slice(8))}/>;
  return <div class="min-h-screen bg-white text-gray-900"><header class="border-b border-gray-200"><nav class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"><a href="/" class="font-semibold text-lg">Vijevira Labs</a><div class="flex items-center gap-6 text-sm text-gray-600"><a href="/blog">Blog</a><a href="/tools">Tools</a><a href="/projects">Projects</a><a href="/research">Research</a><a href="/about">About</a><a href="/admin/login">Admin</a></div></nav></header><main class="max-w-6xl mx-auto px-6 py-20"><p class="text-sm font-medium text-gray-500 mb-4">Engineering, Research &amp; Building.</p><h1 class="text-5xl font-bold tracking-tight mb-6">Vijevira Labs</h1><p class="max-w-2xl text-xl leading-8 text-gray-600">Practical engineering notes, research, production lessons, developer tools, and projects built with a focus on useful, real-world systems.</p></main></div>;
}