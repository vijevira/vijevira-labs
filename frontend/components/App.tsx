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

function EnhancedPosts(){
  const path=location.pathname, edit=path.match(/^\/admin\/posts\/(\d+)\/edit$/), id=edit?.[1];
  const [items,setItems]=useState<any[]>([]),[cats,setCats]=useState<any[]>([]),[tags,setTags]=useState<any[]>([]),[techs,setTechs]=useState<any[]>([]),[tools,setTools]=useState<any[]>([]),[projects,setProjects]=useState<any[]>([]),[media,setMedia]=useState<any[]>([]),[post,setPost]=useState<any>({title:"",slug:"",description:"",content:"",content_type:"article",status:"draft",featured:false,category_id:"",tag_ids:[],technology_ids:[],cover_image_id:"",seo_title:"",seo_description:""}),[error,setError]=useState("");
  useEffect(()=>{Promise.all([apiFetch("/api/taxonomy/categories"),apiFetch("/api/taxonomy/tags"),apiFetch("/api/taxonomy/technologies"),apiFetch("/api/content/tools"),apiFetch("/api/content/projects"),apiFetch("/api/content/media").catch(()=>[])]).then(([c,t,te,to,pr,m])=>{setCats(c);setTags(t);setTechs(te);setTools(to);setProjects(pr);setMedia(m)});if(!id) return;apiFetch("/api/posts/"+id).then((p:any)=>setPost({...p,tag_ids:(p.tags||[]).map((x:any)=>Number(x.id)),technology_ids:(p.technologies||[]).map((x:any)=>Number(x.id)),tool_ids:(p.tools||[]).map((x:any)=>Number(x.id)),project_ids:(p.projects||[]).map((x:any)=>Number(x.id))})).catch((e:any)=>setError(e.message))},[id]);
  const load=()=>apiFetch("/api/posts?limit=100").then(setItems).catch(()=>{});
  useEffect(()=>{if(!id)load()},[id]);
  if(path==="/admin/posts"||path==="/admin/posts/"){
    return <AdminShell><div className="flex items-center justify-between"><div><h1 className="text-3xl font-semibold">Posts</h1><p className="mt-2 text-gray-500">Articles, tutorials, research, guides and notes.</p></div><a href="/admin/posts/new" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">New post</a></div><div className="mt-8 rounded-xl border bg-white divide-y">{items.length?items.map(p=><div className="p-5 flex items-center justify-between gap-4" key={p.id}><div><div className="font-medium">{p.title}</div><div className="text-xs text-gray-500 mt-1">{p.status} · {p.content_type} · {p.category_name||"Uncategorized"}</div></div><div className="flex gap-3 text-sm"><button onClick={async()=>{await apiFetch("/api/posts/"+p.id+"/"+(p.status==="published"?"unpublish":"publish"),{method:"POST"});load()}} className="text-gray-600">{p.status==="published"?"Unpublish":"Publish"}</button><a href={"/admin/posts/"+p.id+"/edit"} className="text-gray-600">Edit</a><button onClick={async()=>{if(confirm("Delete this post?")){await apiFetch("/api/posts/"+p.id,{method:"DELETE"});load()}}} className="text-red-600">Delete</button></div></div>):<div className="p-10 text-center text-gray-500">No posts yet.</div>}</div></AdminShell>
  }
  const toggle=(key:string,n:number)=>setPost((p:any)=>({...p,[key]:p[key].includes(n)?p[key].filter((x:number)=>x!==n):[...p[key],n]}));
  const save=async(e:any)=>{e.preventDefault();setError("");try{await apiFetch(id?"/api/posts/"+id:"/api/posts",{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(post)});location.href="/admin/posts"}catch(e:any){setError(e.message)}};
  return <AdminShell><div className="flex justify-between mb-6"><div><h1 className="text-3xl font-semibold">{id?"Edit post":"New post"}</h1><p className="mt-2 text-gray-500">Markdown editor with structured taxonomy and media.</p></div><a href="/admin/posts" className="text-sm text-gray-500">Back</a></div><form onSubmit={save} className="grid xl:grid-cols-[1fr_340px] gap-6"><section className="rounded-xl border bg-white p-6 space-y-4"><input value={post.title} onChange={e=>setPost({...post,title:e.target.value})} placeholder="Title" required className="w-full text-3xl font-semibold border-b pb-3 outline-none"/><input value={post.slug||""} onChange={e=>setPost({...post,slug:e.target.value})} placeholder="Slug" className="w-full rounded-lg border px-3 py-2"/><textarea value={post.description||""} onChange={e=>setPost({...post,description:e.target.value})} placeholder="Description" rows={3} className="w-full rounded-lg border px-3 py-2"/><textarea value={post.content||""} onChange={e=>setPost({...post,content:e.target.value})} placeholder="Write in Markdown..." rows={28} className="w-full rounded-lg border px-4 py-3 font-mono text-sm"/></section><aside className="rounded-xl border bg-white p-5 space-y-4"><label className="block text-sm font-medium">Status<select value={post.status} onChange={e=>setPost({...post,status:e.target.value})} className="mt-2 w-full rounded-lg border px-3 py-2">{STATES.map(x=><option key={x}>{x}</option>)}</select></label><label className="block text-sm font-medium">Content type<select value={post.content_type} onChange={e=>setPost({...post,content_type:e.target.value})} className="mt-2 w-full rounded-lg border px-3 py-2">{TYPES.map(x=><option key={x}>{x}</option>)}</select></label><label className="block text-sm font-medium">Category<select value={post.category_id||""} onChange={e=>setPost({...post,category_id:e.target.value?Number(e.target.value):null})} className="mt-2 w-full rounded-lg border px-3 py-2"><option value="">Uncategorized</option>{cats.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><div><div className="text-sm font-medium mb-2">Tags</div><div className="max-h-36 overflow-auto space-y-1">{tags.map(x=><label key={x.id} className="block text-sm text-gray-600"><input type="checkbox" checked={(post.tag_ids||[]).includes(Number(x.id))} onChange={()=>toggle("tag_ids",Number(x.id))}/> {x.name}</label>)}</div></div><div><div className="text-sm font-medium mb-2">Technologies</div><div className="max-h-36 overflow-auto space-y-1">{techs.map(x=><label key={x.id} className="block text-sm text-gray-600"><input type="checkbox" checked={(post.technology_ids||[]).includes(Number(x.id))} onChange={()=>toggle("technology_ids",Number(x.id))}/> {x.name}</label>)}</div></div><div><div className="text-sm font-medium mb-2">Tools</div><div className="max-h-28 overflow-auto space-y-1">{tools.map(x=><label key={x.id} className="block text-sm text-gray-600"><input type="checkbox" checked={(post.tool_ids||[]).includes(Number(x.id))} onChange={()=>toggle("tool_ids",Number(x.id))}/> {x.name}</label>)}</div></div><div><div className="text-sm font-medium mb-2">Projects</div><div className="max-h-28 overflow-auto space-y-1">{projects.map(x=><label key={x.id} className="block text-sm text-gray-600"><input type="checkbox" checked={(post.project_ids||[]).includes(Number(x.id))} onChange={()=>toggle("project_ids",Number(x.id))}/> {x.name}</label>)}</div></div><label className="block text-sm font-medium">Cover image<select value={post.cover_image_id||""} onChange={e=>setPost({...post,cover_image_id:e.target.value?Number(e.target.value):null})} className="mt-2 w-full rounded-lg border px-3 py-2"><option value="">No cover</option>{media.map(x=><option key={x.id} value={x.id}>{x.filename}</option>)}</select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!post.featured} onChange={e=>setPost({...post,featured:e.target.checked})}/> Featured</label><input value={post.seo_title||""} onChange={e=>setPost({...post,seo_title:e.target.value})} placeholder="SEO title" className="w-full rounded-lg border px-3 py-2"/><textarea value={post.seo_description||""} onChange={e=>setPost({...post,seo_description:e.target.value})} placeholder="SEO description" rows={3} className="w-full rounded-lg border px-3 py-2"/>{error&&<p className="text-sm text-red-600">{error}</p>}<button className="w-full rounded-lg bg-gray-900 py-2.5 text-sm text-white">Save post</button></aside></form></AdminShell>
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


function siteShell(children:any){return <div className="min-h-screen bg-white text-gray-900"><header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur"><nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between"><a href="/" className="font-semibold text-lg">Vijevira Labs</a><div className="flex items-center gap-4 md:gap-6 text-sm text-gray-600"><a href="/blog">Blog</a><a href="/tools">Tools</a><a href="/projects">Projects</a><a href="/research">Research</a><a href="/search">Search</a><a href="/about">About</a></div></nav></header>{children}<footer className="border-t mt-20"><div className="max-w-6xl mx-auto px-5 py-10 flex justify-between text-sm text-gray-500"><span>Vijevira Labs — Engineering, Research &amp; Building.</span><a href="/rss.xml">RSS</a></div></footer></div>}
function Md({value}:{value:string}){let s=String(value||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");s=s.replace(/^### (.*)$/gm,"<h3>$1</h3>").replace(/^## (.*)$/gm,"<h2>$1</h2>").replace(/^# (.*)$/gm,"<h1>$1</h1>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n\n+/g,"</p><p>");return <div className="prose max-w-none" dangerouslySetInnerHTML={{__html:"<p>"+s.replace(/\n/g,"<br/>")+"</p>"}}/>}
function HomePublic(){const [posts,setPosts]=useState<any[]>([]);useEffect(()=>{apiFetch("/api/posts?status=published&limit=4").then(setPosts).catch(()=>{})},[]);return siteShell(<><main className="max-w-6xl mx-auto px-5 py-24"><p className="text-sm font-medium text-gray-500">Engineering, Research &amp; Building.</p><h1 className="mt-4 text-5xl md:text-6xl font-bold tracking-tight">Vijevira Labs</h1><p className="mt-6 max-w-2xl text-xl leading-8 text-gray-600">Practical engineering notes, research, production lessons, developer tools, and projects built around useful, real-world systems.</p><div className="mt-10 flex gap-3"><a href="/blog" className="rounded-lg bg-gray-900 px-5 py-3 text-white">Read the blog</a><a href="/projects" className="rounded-lg border px-5 py-3">Projects</a></div></main>{posts.length>0&&<section className="max-w-6xl mx-auto px-5 pb-16"><h2 className="text-2xl font-semibold">Latest writing</h2><div className="mt-5 grid md:grid-cols-2 gap-5">{posts.map(p=><a key={p.id} href={"/blog/"+p.slug} className="rounded-2xl border p-6"><div className="text-xs text-gray-500">{p.content_type} · {p.category_name||"Uncategorized"}</div><div className="mt-2 text-xl font-semibold">{p.title}</div><p className="mt-2 text-gray-600">{p.description}</p></a>)}</div></section>}</>)}
function BlogPublic(){const [rows,setRows]=useState<any[]>([]);useEffect(()=>{apiFetch("/api/posts?status=published&limit=100").then(setRows).catch(()=>{})},[]);return siteShell(<main className="max-w-4xl mx-auto px-5 py-16"><h1 className="text-4xl font-bold">Blog</h1><p className="mt-3 text-gray-600">Engineering articles, tutorials, guides, comparisons and build notes.</p><div className="mt-10 space-y-5">{rows.map(p=><article key={p.id} className="rounded-2xl border p-6"><div className="text-xs text-gray-500">{p.content_type} · {p.category_name||"Uncategorized"} · {dateFmt(p.published_at)}</div><h2 className="mt-2 text-2xl font-semibold"><a href={"/blog/"+p.slug}>{p.title}</a></h2><p className="mt-2 text-gray-600">{p.description}</p></article>)}{rows.length===0&&<div className="rounded-xl border p-10 text-center text-gray-500">No published posts yet.</div>}</div></main>)}
function PostPublic({slug}:{slug:string}){const [p,setP]=useState<any>(null);useEffect(()=>{apiFetch("/api/posts/slug/"+encodeURIComponent(slug)).then(setP).catch(()=>setP(false))},[slug]);if(p===false)return siteShell(<main className="max-w-3xl mx-auto px-5 py-20"><h1 className="text-3xl font-bold">Post not found</h1></main>);if(!p)return siteShell(<main className="max-w-3xl mx-auto px-5 py-20 text-gray-500">Loading…</main>);return siteShell(<article className="max-w-3xl mx-auto px-5 py-16"><div className="text-sm text-gray-500">{p.content_type} · {p.category_name||"Uncategorized"} · {dateFmt(p.published_at)}</div><h1 className="mt-3 text-4xl md:text-5xl font-bold">{p.title}</h1>{p.description&&<p className="mt-5 text-xl leading-8 text-gray-600">{p.description}</p>}{p.cover_secure_url&&<img src={p.cover_secure_url} className="mt-8 w-full rounded-2xl"/>}<div className="mt-10"><Md value={p.content}/></div><div className="mt-10 flex flex-wrap gap-2">{(p.tags||[]).map((x:any)=><a href={"/tags/"+x.slug} className="rounded-full bg-gray-100 px-3 py-1 text-xs" key={x.id}>{x.name}</a>)}</div></article>)}
function dateFmt(s:any){return s?new Date(s).toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}):""}
function CollectionPublic({kind}:{kind:"tools"|"projects"|"research"}){const [rows,setRows]=useState<any[]>([]);useEffect(()=>{apiFetch(kind==="research"?"/api/content/research":"/api/content/"+kind).then(setRows).catch(()=>{})},[kind]);return siteShell(<main className="max-w-5xl mx-auto px-5 py-16"><h1 className="text-4xl font-bold">{kind[0].toUpperCase()+kind.slice(1)}</h1><div className="mt-10 grid md:grid-cols-2 gap-5">{rows.map(x=><article className="rounded-2xl border p-6" key={x.id}><div className="text-xs text-gray-500">{kind==="tools"?(x.pricing_type||"Tool"):(kind==="projects"?x.status:"Research")}</div><h2 className="mt-2 text-xl font-semibold"><a href={kind==="research"?"/research/"+x.id:"/"+kind+"/"+x.slug}>{x.name||x.title}</a></h2><p className="mt-2 text-gray-600">{x.description}</p></article>)}{!rows.length&&<div className="rounded-xl border p-10 text-center text-gray-500">Nothing published here yet.</div>}</div></main>)}
function DetailPublic({kind,slug}:{kind:"tools"|"projects",slug:string}){const [x,setX]=useState<any>(null);useEffect(()=>{apiFetch("/api/content/"+kind).then((rows:any[])=>setX(rows.find(r=>r.slug===slug)||false)).catch(()=>setX(false))},[kind,slug]);if(!x)return siteShell(<main className="max-w-3xl mx-auto px-5 py-20 text-gray-500">{x===false?"Not found":"Loading…"}</main>);return siteShell(<main className="max-w-3xl mx-auto px-5 py-16"><div className="text-xs uppercase tracking-wider text-gray-500">{kind}</div><h1 className="mt-3 text-4xl font-bold">{x.name}</h1><p className="mt-4 text-xl text-gray-600">{x.description}</p>{x.website_url&&<p className="mt-5"><a className="underline" href={x.website_url} target="_blank" rel="noreferrer">Website</a></p>}{kind==="projects"&&(x.repository_url||x.demo_url)&&<div className="mt-5 flex gap-4 text-sm">{x.repository_url&&<a className="underline" href={x.repository_url} target="_blank" rel="noreferrer">Repository</a>}{x.demo_url&&<a className="underline" href={x.demo_url} target="_blank" rel="noreferrer">Demo</a>}</div>}<div className="mt-10"><Md value={x.content||x.long_description||""}/></div></main>)}
function ResearchPublic(){const [rows,setRows]=useState<any[]>([]);useEffect(()=>{apiFetch("/api/content/research").then(setRows).catch(()=>{})},[]);return siteShell(<main className="max-w-5xl mx-auto px-5 py-16"><h1 className="text-4xl font-bold">Research</h1><p className="mt-3 text-gray-600">Published technical research and investigations.</p><div className="mt-10 grid md:grid-cols-2 gap-5">{rows.map(x=><a href={"/research/"+x.id} className="rounded-2xl border p-6" key={x.id}><div className="text-xs text-gray-500">{dateFmt(x.published_at)}</div><h2 className="mt-2 text-xl font-semibold">{x.title}</h2><p className="mt-2 text-gray-600">{x.description}</p></a>)}</div></main>)}
function ResearchDetailPublic({id}:{id:string}){const [x,setX]=useState<any>(null);useEffect(()=>{apiFetch("/api/content/research/"+id).then(setX).catch(()=>setX(false))},[id]);if(!x)return siteShell(<main className="max-w-3xl mx-auto px-5 py-20 text-gray-500">{x===false?"Not found":"Loading…"}</main>);return siteShell(<article className="max-w-3xl mx-auto px-5 py-16"><div className="text-xs text-gray-500">Research · {dateFmt(x.published_at)}</div><h1 className="mt-3 text-4xl font-bold">{x.title}</h1><p className="mt-4 text-xl text-gray-600">{x.description}</p><div className="mt-10"><Md value={x.content}/></div></article>)}
function SearchPublic(){const [rows,setRows]=useState<any[]>([]),[q,setQ]=useState("");const run=async(e:any)=>{e.preventDefault();setRows(await apiFetch("/api/posts?status=published&limit=100&q="+encodeURIComponent(q)))};return siteShell(<main className="max-w-4xl mx-auto px-5 py-16"><h1 className="text-4xl font-bold">Search</h1><form onSubmit={run} className="mt-6 flex gap-2"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search posts..." className="flex-1 rounded-lg border px-3 py-2"/><button className="rounded-lg bg-gray-900 px-4 text-white">Search</button></form><div className="mt-8 space-y-4">{rows.map(x=><a key={x.id} href={"/blog/"+x.slug} className="block rounded-xl border p-5"><div className="font-medium">{x.title}</div><p className="mt-1 text-sm text-gray-600">{x.description}</p></a>)}</div></main>)}
function AboutPublic(){return siteShell(<main className="max-w-3xl mx-auto px-5 py-16"><h1 className="text-4xl font-bold">About Vijevira Labs</h1><div className="mt-8 space-y-5 text-lg leading-8 text-gray-700"><p>Vijevira Labs is an independent engineering lab for building, researching, documenting, and sharing practical software systems.</p><p>Content connects with tools, technologies, projects, experiments, and production lessons so technical knowledge stays useful beyond a single post.</p></div></main>)}
function TaxonomyPublic({slug}:{slug:string}){const [data,setData]=useState<any[]>([]),[posts,setPosts]=useState<any[]>([]);useEffect(()=>{Promise.all([apiFetch("/api/taxonomy/categories"),apiFetch("/api/posts?status=published&limit=100")]).then(([c,p])=>{const row=c.find((x:any)=>x.slug===slug);setData(row?[row]:[]);setPosts(row?p.filter((x:any)=>Number(x.category_id)===Number(row.id)):[])}).catch(()=>{})},[slug]);const c=data[0];return siteShell(<main className="max-w-4xl mx-auto px-5 py-16"><div className="text-sm text-gray-500">Topic</div><h1 className="mt-2 text-4xl font-bold">{c?.name||slug}</h1><p className="mt-3 text-gray-600">{c?.description}</p><div className="mt-8 space-y-4">{posts.map(x=><a className="block rounded-xl border p-5" href={"/blog/"+x.slug} key={x.id}><div className="font-medium">{x.title}</div><p className="mt-1 text-sm text-gray-600">{x.description}</p></a>)}</div></main>)}

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