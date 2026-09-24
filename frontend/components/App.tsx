/** @jsxImportSource https://esm.sh/react@18.2.0 */
import { useEffect, useRef, useState } from "https://esm.sh/react@18.2.0";

const nav = [
  ["/admin", "Dashboard"], ["/admin/posts", "Posts"], ["/admin/research", "Research"],
  ["/admin/tools", "Tools"], ["/admin/projects", "Projects"], ["/admin/media", "Media"],
  ["/admin/categories", "Categories"], ["/admin/tags", "Tags"], ["/admin/technologies", "Technologies"], ["/admin/settings", "Settings"],
];

function AdminShell({ children }: { children: any }) {
  const [user,setUser]=useState<any>(null),[checking,setChecking]=useState(true),[menu,setMenu]=useState(false);
  const path=location.pathname;
  const sections=[
    {title:"Content",items:[["/admin","Dashboard"],["/admin/posts","Posts"],["/admin/research","Research"]]},
    {title:"Resources",items:[["/admin/tools","Tools"],["/admin/projects","Projects"],["/admin/media","Media"]]},
    {title:"Taxonomy",items:[["/admin/categories","Categories"],["/admin/tags","Tags"],["/admin/technologies","Technologies"]]},
  ];
  useEffect(()=>{
    fetch("/api/auth/me",{credentials:"include"})
      .then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error?.message||"Unauthenticated");return d.data})
      .then(data=>{setUser(data);setChecking(false)})
      .catch(()=>window.location.replace("/admin/login"));
  },[]);
  const logout=async()=>{try{await fetch("/api/auth/logout",{method:"POST",credentials:"include"})}finally{window.location.replace("/admin/login")}};
  const isActive=(href:string)=>href==="/admin"?path==="/admin":path===href||path.startsWith(href+"/");
  if(checking)return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Checking session…</div>;
  return <div className="min-h-screen bg-slate-50 text-slate-900"><Seo title="Admin — Vijevira Labs" description="Vijevira Labs administration workspace." path={location.pathname} robots="noindex,nofollow"/>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="px-5 pt-5">
        <a href="/admin" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-[11px] font-bold text-white">VL</span>
          <span><span className="block text-sm font-semibold tracking-tight">Vijevira Labs</span><span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400">Admin workspace</span></span>
        </a>
      </div>
      <nav className="mt-8 flex-1 overflow-y-auto px-3 pb-5">
        {sections.map(s=><div key={s.title} className="mb-6">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{s.title}</div>
          <div className="space-y-1">{s.items.map(([href,label])=><a key={href} href={href} className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition ${isActive(href)?"bg-slate-950 font-medium text-white shadow-sm":"text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>{label}</a>)}</div>
        </div>)}
        <div><div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">System</div><a href="/admin/settings" className={`flex items-center rounded-lg px-3 py-2.5 text-sm ${isActive("/admin/settings")?"bg-slate-950 font-medium text-white":"text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>Settings</a></div>
      </nav>
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 p-3"><p className="truncate text-xs font-medium text-slate-700">{user?.email}</p><div className="mt-3 flex items-center justify-between gap-3"><a href="/" className="text-xs text-slate-500 hover:text-slate-950">View site ↗</a><button type="button" onClick={logout} className="text-xs font-medium text-red-600 hover:text-red-700">Sign out</button></div></div>
      </div>
    </aside>
    <div className="md:hidden sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <a href="/admin" className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-[10px] font-bold text-white">VL</span><span className="text-sm font-semibold">Vijevira Labs</span></a>
        <button type="button" onClick={()=>setMenu(v=>!v)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200">{menu?"×":"☰"}</button>
      </div>
      {menu&&<div className="border-t border-slate-200 bg-white px-3 py-3">{sections.flatMap(s=>s.items).map(([href,label])=><a key={href} href={href} onClick={()=>setMenu(false)} className={`block rounded-lg px-3 py-2.5 text-sm ${isActive(href)?"bg-slate-100 font-medium text-slate-950":"text-slate-600"}`}>{label}</a>)}<a href="/admin/settings" onClick={()=>setMenu(false)} className={`block rounded-lg px-3 py-2.5 text-sm ${isActive("/admin/settings")?"bg-slate-100 font-medium text-slate-950":"text-slate-600"}`}>Settings</a><div className="mt-2 border-t pt-2"><a href="/" className="block px-3 py-2 text-sm text-slate-500">View site ↗</a><button type="button" onClick={logout} className="px-3 py-2 text-sm text-red-600">Sign out</button></div></div>}
    </div>
    <main className="min-h-screen px-4 py-6 md:ml-64 md:px-8 md:py-8"><div className="mx-auto max-w-[1400px]">{children}</div></main>
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

  return <div className="min-h-screen bg-slate-50 px-5"><Seo title="Sign in — Vijevira Labs" description="Vijevira Labs administration workspace." path="/admin/login" robots="noindex,nofollow"/>
    <div className="mx-auto flex min-h-screen max-w-md items-center">
      <form onSubmit={submit} className="w-full rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 md:p-8">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-[11px] font-bold text-white">VL</span><div><div className="text-sm font-semibold tracking-tight text-slate-950">Vijevira Labs</div><div className="text-[10px] uppercase tracking-[0.17em] text-slate-400">Admin workspace</div></div></div>
        <div className="mt-9"><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Sign in</h1><p className="mt-1 text-sm text-slate-500">Manage publishing, research, tools, and projects.</p></div>
        <label className="mt-7 block text-sm font-medium text-slate-700">Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-slate-400" />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-slate-400" />
        </label>
        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  </div>;
}

function Dashboard(){
  const [stats,setStats]=useState<any>({posts:0,drafts:0,published:0,research:0,tools:0,projects:0,media:0});
  useEffect(()=>{
    Promise.all([
      apiFetch("/api/posts?limit=100").catch(()=>[]),
      apiFetch("/api/content/research").catch(()=>[]),
      apiFetch("/api/content/tools").catch(()=>[]),
      apiFetch("/api/content/projects").catch(()=>[]),
      apiFetch("/api/content/media").catch(()=>[])
    ]).then(([posts,research,tools,projects,media])=>{
      setStats({posts:posts.length,drafts:posts.filter((x:any)=>x.status==="draft").length,published:posts.filter((x:any)=>x.status==="published").length,research:research.length,tools:tools.length,projects:projects.length,media:media.length});
    });
  },[]);
  return <AdminShell>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Workspace</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1><p className="mt-2 text-sm leading-6 text-slate-500">A quick view of your publishing and research workspace.</p></div>
      <a href="/admin/posts/new" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">New post</a>
    </div>
    <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[[stats.posts,"Posts","/admin/posts"],[stats.published,"Published","/admin/posts"],[stats.drafts,"Drafts","/admin/posts"],[stats.media,"Media","/admin/media"]].map(([value,label,href])=><a key={label} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md"><div className="text-2xl font-semibold tracking-tight text-slate-950">{value}</div><div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{label}</div></a>)}
    </section>
    <section className="mt-8 grid lg:grid-cols-3 gap-5">
      <a href="/admin/research" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Research</div><div className="mt-3 text-xl font-semibold text-slate-950">{stats.research} investigations</div><p className="mt-2 text-sm leading-6 text-slate-500">Track questions, experiments, and findings.</p></a>
      <a href="/admin/tools" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Resources</div><div className="mt-3 text-xl font-semibold text-slate-950">{stats.tools} tools</div><p className="mt-2 text-sm leading-6 text-slate-500">Maintain the developer tools directory.</p></a>
      <a href="/admin/projects" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Build log</div><div className="mt-3 text-xl font-semibold text-slate-950">{stats.projects} projects</div><p className="mt-2 text-sm leading-6 text-slate-500">Keep project documentation connected to the lab.</p></a>
    </section>
  </AdminShell>;
}

const TYPES=["article","tutorial","research","guide","comparison","project_log","note"];
const STATES=["draft","review","scheduled","published","archived"];
const EMPTY_POST={title:"",slug:"",description:"",content:"",content_type:"article",status:"draft",featured:false,category_ids:[],tag_ids:[],technology_ids:[],tool_ids:[],project_ids:[],related_post_ids:[],cover_image_id:"",seo_title:"",seo_description:""};

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

function AdminPostPreview({post,media,cats,tags}:{post:any,media:any[],cats:any[],tags:any[]}){
  const selectedCategoryIds=post.category_ids||[];
  const selectedTagIds=post.tag_ids||[];
  const cover=post.cover_image_id ? media.find((x:any)=>Number(x.id)===Number(post.cover_image_id)) : null;
  const catNames=cats.filter((x:any)=>selectedCategoryIds.includes(Number(x.id))).map((x:any)=>x.name);
  const tagNames=tags.filter((x:any)=>selectedTagIds.includes(Number(x.id))).map((x:any)=>x.name);
  return <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
    <div className="border-b bg-amber-50 px-5 py-3 flex items-center justify-between gap-4">
      <div><div className="text-xs font-semibold uppercase tracking-wider text-amber-800">Draft preview</div><div className="mt-1 text-xs text-amber-700">This preview includes unsaved editor changes.</div></div>
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">{post.status||"draft"}</span>
    </div>
    <div className="px-5 py-10 md:px-10 md:py-12">
      <div className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
          <span className="uppercase tracking-wider">{post.content_type||"article"}</span>
          {catNames.map((x:string)=><span key={x} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">{x}</span>)}
        </div>
        <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.08] text-gray-950">{post.title||"Untitled post"}</h1>
        {post.description&&<p className="vl-lead mt-5 max-w-3xl">{post.description}</p>}
      </div>
      {cover&&<figure className="mt-9 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"><img src={cover.secure_url||cover.url} alt={post.title||"Cover image"} className="w-full max-h-[520px] object-cover"/></figure>}
      <div className="mt-12"><Md value={post.content||""} article/></div>
      {tagNames.length>0&&<div className="mt-12 border-t border-gray-200 pt-5"><div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Tags</div><div className="flex flex-wrap gap-2">{tagNames.map((x:string)=><span key={x} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">{x}</span>)}</div></div>}
    </div>
  </div>;
}
function EnhancedPosts(){
  const path=location.pathname, edit=path.match(/^\/admin\/posts\/(\d+)\/edit$/), id=edit?.[1];
  const [items,setItems]=useState<any[]>([]),[cats,setCats]=useState<any[]>([]),[tags,setTags]=useState<any[]>([]),[techs,setTechs]=useState<any[]>([]),[tools,setTools]=useState<any[]>([]),[projects,setProjects]=useState<any[]>([]),[media,setMedia]=useState<any[]>([]);
  const [post,setPost]=useState<any>({...EMPTY_POST});
  const [error,setError]=useState(""),[loading,setLoading]=useState(false),[statusAction,setStatusAction]=useState<number|null>(null),[statusError,setStatusError]=useState(""),[showPreview,setShowPreview]=useState(false),[listQuery,setListQuery]=useState(""),[listStatus,setListStatus]=useState("all");
  const [initialSnapshot,setInitialSnapshot]=useState(JSON.stringify(EMPTY_POST));
  const [saveState,setSaveState]=useState<"saved"|"dirty"|"saving"|"error">("saved");
  const [lastSavedAt,setLastSavedAt]=useState<number|null>(null);
  const [mediaQuery,setMediaQuery]=useState("");
  const snapshot=JSON.stringify(post);
  const dirty=snapshot!==initialSnapshot;
  useEffect(()=>{setSaveState(dirty?"dirty":"saved")},[dirty]);
  useEffect(()=>{
    const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue=""}};
    window.addEventListener("beforeunload",warn);
    return()=>window.removeEventListener("beforeunload",warn);
  },[dirty]);
  useEffect(()=>{
    if(!id || !dirty || post.status==="published" || post.status==="archived") return;
    const timer=setTimeout(async()=>{
      setSaveState("saving");
      try{
        await apiFetch("/api/posts/"+id,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(post)});
        setInitialSnapshot(JSON.stringify(post));
        setSaveState("saved");
        setLastSavedAt(Date.now());
      }catch(e:any){
        setSaveState("error");
        setError(e.message||"Autosave failed");
      }
    },2200);
    return()=>clearTimeout(timer);
  },[id,dirty,post.title,post.slug,post.description,post.content,post.content_type,post.status,post.featured,post.cover_image_id,post.seo_title,post.seo_description,JSON.stringify(post.category_ids||[]),JSON.stringify(post.tag_ids||[]),JSON.stringify(post.technology_ids||[]),JSON.stringify(post.tool_ids||[]),JSON.stringify(post.project_ids||[]),JSON.stringify(post.related_post_ids||[])]);

  const load=()=>apiFetch("/api/posts?limit=100").then(setItems).catch((e:any)=>setError(e.message));
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
    if(!id){setInitialSnapshot(JSON.stringify(EMPTY_POST));return}
    apiFetch("/api/posts/"+id)
      .then((p:any)=>{
        const next={...p,
          category_ids:(p.categories||[]).map((x:any)=>Number(x.id)),
          tag_ids:(p.tags||[]).map((x:any)=>Number(x.id)),
          technology_ids:(p.technologies||[]).map((x:any)=>Number(x.id)),
          tool_ids:(p.tools||[]).map((x:any)=>Number(x.id)),
          project_ids:(p.projects||[]).map((x:any)=>Number(x.id)),
          related_post_ids:(p.related_posts||[]).map((x:any)=>Number(x.id))
        };
        setPost(next);
        setInitialSnapshot(JSON.stringify(next));
        setSaveState("saved");
        setLastSavedAt(null);
      })
      .catch((e:any)=>setError(e.message))
  },[id]);

  const toggle=(key:string,n:number)=>setPost((p:any)=>({...p,[key]:(p[key]||[]).includes(n)?p[key].filter((x:number)=>x!==n):[...(p[key]||[]),n]}));
  const changeStatus=async(p:any)=>{
    setStatusError("");
    setStatusAction(Number(p.id));
    try{
      const next=p.status==="published"?"unpublish":"publish";
      const updated=await apiFetch("/api/posts/"+p.id+"/"+next,{method:"POST"});
      setItems(xs=>xs.map(x=>Number(x.id)===Number(p.id)?{...x,status:updated.status,published_at:updated.published_at}:x));
    }catch(e:any){
      setStatusError(e.message||"Unable to change post status.");
    }finally{
      setStatusAction(null);
    }
  };
  const persist=async(redirect=true)=>{
    setError("");setLoading(true);setSaveState("saving");
    try{
      const saved=await apiFetch(id?"/api/posts/"+id:"/api/posts",{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(post)});
      const next=id?{...post,...saved}:{...post,...saved};
      if(id){
        setPost(next);
        setInitialSnapshot(JSON.stringify(next));
        setLastSavedAt(Date.now());
      }
      setSaveState("saved");
      if(redirect) location.href="/admin/posts";
      return saved;
    }catch(e:any){
      setError(e.message||"Save failed");
      setSaveState("error");
      throw e;
    }finally{setLoading(false)}
  };
  const save=async(e:any)=>{e.preventDefault();try{await persist(true)}catch{}};
  const goBack=()=>{if(dirty){if(confirm("You have unsaved changes. Leave without saving?")) location.href="/admin/posts"}else location.href="/admin/posts"};
  const visibleItems=items.filter(p=>(listStatus==="all"||p.status===listStatus)&&(!listQuery.trim()||String(p.title||"").toLowerCase().includes(listQuery.trim().toLowerCase())));
  const filteredMedia=media.filter((x:any)=>!mediaQuery.trim()||String(x.filename||x.public_id||"").toLowerCase().includes(mediaQuery.trim().toLowerCase()));

  if(path==="/admin/posts"||path==="/admin/posts/"){
    return <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Publishing</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Posts</h1><p className="mt-2 text-sm text-slate-500">Articles, tutorials, guides, comparisons, and build notes.</p></div>
        <a href="/admin/posts/new" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">New post</a>
      </div>
      {statusError&&<div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{statusError}</div>}
      <div className="mt-7 flex flex-col gap-3 md:flex-row">
        <input value={listQuery} onChange={e=>setListQuery(e.target.value)} placeholder="Search posts…" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-400"/>
        <div className="flex gap-2 overflow-x-auto">
          {["all","draft","published","review","scheduled","archived"].map(s=><button key={s} type="button" onClick={()=>setListStatus(s)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium capitalize ${listStatus===s?"border-slate-950 bg-slate-950 text-white":"border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{s}</button>)}
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {visibleItems.length?visibleItems.map(p=><div className="p-5 md:p-6 border-b last:border-0 border-slate-100" key={p.id}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold tracking-tight text-slate-950">{p.title}</h2>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${p.status==="published"?"bg-emerald-50 text-emerald-700":p.status==="draft"?"bg-slate-100 text-slate-600":"bg-amber-50 text-amber-700"}`}>{p.status}</span>
              </div>
              <div className="mt-1.5 text-xs text-slate-400">{p.content_type} · {p.category_name||"Uncategorized"}{p.published_at?" · "+dateFmt(p.published_at):""}</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <button type="button" disabled={statusAction===Number(p.id)} onClick={()=>changeStatus(p)} className="font-medium text-slate-600 hover:text-slate-950 disabled:opacity-50">{statusAction===Number(p.id)?"Saving…":p.status==="published"?"Unpublish":"Publish"}</button>
              <a href={"/admin/posts/"+p.id+"/edit"} className="text-slate-500 hover:text-slate-950">Edit</a>
              <button type="button" onClick={async()=>{if(confirm("Delete this post?")){await apiFetch("/api/posts/"+p.id,{method:"DELETE"});load()}}} className="text-red-600 hover:text-red-700">Delete</button>
            </div>
          </div>
        </div>):<div className="p-12"><EmptyState title="No matching posts." description={items.length?"Try a different search or status filter.":"Create your first post to start publishing."}/></div>}
      </div>
    </AdminShell>
  }

  return <AdminShell>
    <div className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">{id?"Editing":"Drafting"}</div><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{id?"Edit post":"New post"}</h1><p className="mt-1 text-xs text-slate-500">{showPreview?"Rendered preview of the current editor state.":"Write, structure, optimize, then publish."}</p></div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500" aria-live="polite"><span className={`h-2 w-2 rounded-full ${saveState==="saved"?"bg-emerald-500":saveState==="saving"?"bg-amber-500 animate-pulse":saveState==="error"?"bg-red-500":"bg-slate-400"}`}></span><span>{saveState==="saved"?(lastSavedAt?"Saved just now":"Saved"):saveState==="saving"?"Saving…":saveState==="error"?"Save error":"Unsaved changes"}</span></div>
          <button type="button" onClick={()=>setShowPreview(v=>!v)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-slate-300">{showPreview?"Back to editor":"Preview"}</button>
          {!showPreview&&<button type="submit" form="post-editor" disabled={loading} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading?"Saving…":"Save post"}</button>}
          <button type="button" onClick={goBack} className="hidden sm:inline-flex rounded-xl px-3 py-2 text-sm text-slate-500 hover:text-slate-950">Back</button>
        </div>
      </div>
    </div>
    {showPreview ? <AdminPostPreview post={post} media={media} cats={cats} tags={tags}/> : <form id="post-editor" onSubmit={save} className="mt-6 grid xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7 space-y-5">
        <input value={post.title} onChange={e=>setPost({...post,title:e.target.value})} placeholder="Title" required className="w-full text-3xl font-semibold border-b pb-3 outline-none"/>
        <input value={post.slug||""} onChange={e=>setPost({...post,slug:e.target.value})} placeholder="Slug" className="w-full rounded-lg border px-3 py-2"/>
        <textarea value={post.description||""} onChange={e=>setPost({...post,description:e.target.value})} placeholder="Description" rows={3} className="w-full rounded-lg border px-3 py-2"/>
        <textarea value={post.content||""} onChange={e=>setPost({...post,content:e.target.value})} placeholder="Write in Markdown..." rows={28} className="w-full rounded-lg border px-4 py-3 font-mono text-sm"/>
      </section>
      <aside className="xl:sticky xl:top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <div className="border-b border-slate-200 pb-4"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Publishing</div>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-slate-700">Status<select value={post.status} onChange={e=>setPost({...post,status:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5">{STATES.map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700">Content type<select value={post.content_type} onChange={e=>setPost({...post,content_type:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5">{TYPES.map(x=><option key={x}>{x}</option>)}</select></label>
          </div>
        </div>
        <div className="border-b border-slate-200 pb-4"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 mb-4">Taxonomy</div>

        <MultiSelectField label="Categories" items={cats} selected={post.category_ids||[]} onToggle={n=>toggle("category_ids",n)} emptyText="No categories available." createHref="/admin/categories"/>
        <MultiSelectField label="Tags" items={tags} selected={post.tag_ids||[]} onToggle={n=>toggle("tag_ids",n)} emptyText="No tags available." createHref="/admin/tags"/>
        <MultiSelectField label="Technologies" items={techs} selected={post.technology_ids||[]} onToggle={n=>toggle("technology_ids",n)} emptyText="No technologies available." createHref="/admin/technologies"/>
        <MultiSelectField label="Tools" items={tools} selected={post.tool_ids||[]} onToggle={n=>toggle("tool_ids",n)} emptyText="No tools available." createHref="/admin/tools"/>
        <MultiSelectField label="Projects" items={projects} selected={post.project_ids||[]} onToggle={n=>toggle("project_ids",n)} emptyText="No projects available." createHref="/admin/projects"/>
        <MultiSelectField label="Related posts" items={items.filter((x:any)=>Number(x.id)!==Number(id))} selected={post.related_post_ids||[]} onToggle={n=>toggle("related_post_ids",n)} emptyText="No other posts available yet." createHref="/admin/posts/new"/>
        </div>

        <div className="border-b border-slate-200 pb-4"><div className="flex items-center justify-between gap-3 mb-4"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Media</div><a href="/admin/media" className="text-xs text-gray-500 underline underline-offset-2">Manage</a></div>
          <label className="block text-sm font-medium text-slate-700">Cover image
            <input type="search" value={mediaQuery} onChange={e=>setMediaQuery(e.target.value)} placeholder="Find an image…" aria-label="Search media" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
          </label>
          <div className="mt-3 grid grid-cols-3 gap-2 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
            <button type="button" onClick={()=>setPost({...post,cover_image_id:null})} className={`overflow-hidden rounded-lg border bg-white p-1 text-left ${!post.cover_image_id?"border-slate-950 ring-2 ring-slate-950/10":"border-slate-200"}`}><div className="aspect-video grid place-items-center bg-slate-50 text-[10px] text-slate-400">No cover</div><div className="px-1 py-1 text-[10px] text-slate-500">None</div></button>
            {filteredMedia.map(x=>{const src=x.secure_url||x.url;const selected=Number(post.cover_image_id)===Number(x.id);return <button type="button" key={x.id} onClick={()=>setPost({...post,cover_image_id:Number(x.id)})} className={`overflow-hidden rounded-lg border bg-white p-1 text-left ${selected?"border-teal-600 ring-2 ring-teal-600/15":"border-slate-200 hover:border-slate-300"}`}><img src={src} alt="" className="aspect-video w-full rounded-md object-cover"/><div className="truncate px-1 py-1 text-[10px] text-slate-500">{x.filename||x.public_id||("Image "+x.id)}</div></button>})}
          </div>
          {post.cover_image_id&&<p className="mt-2 text-xs text-slate-500">Selected: {media.find(x=>Number(x.id)===Number(post.cover_image_id))?.filename||"image"}</p>}
        </div>
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Publishing options</div>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!post.featured} onChange={e=>setPost({...post,featured:e.target.checked})}/> Featured</label>
        </div>
        <div className="space-y-4">
          <div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">SEO</div><p className="mt-1 text-xs leading-5 text-slate-500">Control search snippets and the page title without changing the article headline.</p></div>
          <label className="block text-sm font-medium text-slate-700">SEO title
            <input value={post.seo_title||""} onChange={e=>setPost({...post,seo_title:e.target.value})} placeholder="Defaults to post title" maxLength={70} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
            <div className="mt-1 text-right text-[10px] text-slate-400">{String(post.seo_title||"").length}/70</div>
          </label>
          <label className="block text-sm font-medium text-slate-700">SEO description
            <textarea value={post.seo_description||""} onChange={e=>setPost({...post,seo_description:e.target.value})} placeholder="Defaults to the post description" rows={3} maxLength={170} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
            <div className="mt-1 text-right text-[10px] text-slate-400">{String(post.seo_description||"").length}/170</div>
          </label>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Search preview</div>
            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="truncate text-sm font-medium text-blue-700">{post.seo_title||post.title||"Your article title"}</div>
              <div className="mt-1 truncate text-[11px] text-emerald-700">{location.origin}/blog/{post.slug||"your-post-slug"}</div>
              <div className="mt-1 text-xs leading-5 text-slate-600">{post.seo_description||post.description||"Your search description will appear here."}</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Social preview</div>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {post.cover_image_id&&media.find(x=>Number(x.id)===Number(post.cover_image_id))?<img src={media.find(x=>Number(x.id)===Number(post.cover_image_id)).secure_url||media.find(x=>Number(x.id)===Number(post.cover_image_id)).url} alt="" className="aspect-[1.91/1] w-full object-cover"/>:<div className="aspect-[1.91/1] grid place-items-center bg-slate-100 text-xs text-slate-400">No social image selected</div>}
              <div className="p-3"><div className="text-xs text-slate-400">{location.hostname}</div><div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">{post.seo_title||post.title||"Article title"}</div><div className="mt-1 text-xs text-slate-500 line-clamp-2">{post.seo_description||post.description||"Article description"}</div></div>
            </div>
          </div>
        </div>
        {error&&<p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-950 py-3 text-sm font-medium text-white disabled:opacity-50">{loading?"Saving…":"Save post"}</button>
      </aside>
    </form>}
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
  return <AdminShell>
    <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Taxonomy</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{kind[0].toUpperCase()+kind.slice(1)}</h1><p className="mt-2 text-sm text-slate-500">Keep labels and technology metadata consistent across the publication.</p></div>
    <div className="mt-7 grid lg:grid-cols-[340px_1fr] gap-6 items-start">
      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{editing?"Edit item":"Add item"}</div>
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
        <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="Slug (optional)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
        {kind!=="tags"&&<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>}
        {kind==="technologies"&&<><input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="Website URL" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><input value={logo} onChange={e=>setLogo(e.target.value)} placeholder="Logo URL" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/></>}
        {error&&<p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1"><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">{editing?"Update":"Add"}</button>{editing&&<button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Cancel</button>}</div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{rows.length} {rows.length===1?"item":"items"}</div>{rows.length?rows.map(x=><div key={x.id} className="p-5 flex items-center justify-between gap-4 border-b last:border-0 border-slate-100"><div><div className="font-medium text-slate-950">{x.name}</div><div className="mt-1 text-xs text-slate-400">{x.slug}</div></div><div className="flex gap-3 text-sm"><button onClick={()=>edit(x)} className="text-slate-600 hover:text-slate-950">Edit</button><button onClick={async()=>{if(confirm("Delete this item?")){await apiFetch("/api/taxonomy/"+kind+"/"+x.id,{method:"DELETE"});load()}}} className="text-red-600">Delete</button></div></div>):<div className="p-10"><EmptyState title="Nothing here yet." /></div>}</div>
    </div>
  </AdminShell>
}

function EntityManager({kind}:{kind:"tools"|"projects"}){
  const [rows,setRows]=useState<any[]>([]),[editing,setEditing]=useState<any>(null),[form,setForm]=useState<any>({name:"",slug:"",description:"",long_description:"",website_url:"",category:"",pricing_type:"",free_tier:"",logo_url:"",my_experience:"",limitations:"",content:"",status:"building",repository_url:"",demo_url:"",cover_image_id:"",featured:false}),[error,setError]=useState("");
  const tool=kind==="tools", routeId=(location.pathname.match(new RegExp("^/admin/"+kind+"/(\\d+)/edit$"))||[])[1], load=()=>apiFetch("/api/content/"+kind).then((data:any[])=>{setRows(data);if(routeId){const item=data.find(x=>String(x.id)===String(routeId));if(item){setEditing(item);setForm((v:any)=>({...v,...item}))}}}).catch(()=>{}); useEffect(load,[kind,routeId]);
  const set=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v})); const reset=()=>{setEditing(null);setForm({name:"",slug:"",description:"",long_description:"",website_url:"",category:"",pricing_type:"",free_tier:"",logo_url:"",my_experience:"",limitations:"",content:"",status:"building",repository_url:"",demo_url:"",cover_image_id:"",featured:false});setError("")};
  const save=async(e:any)=>{e.preventDefault();try{await apiFetch(editing?"/api/content/"+kind+"/"+editing.id:"/api/content/"+kind,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});reset();load()}catch(e:any){setError(e.message)}};
  const fields=tool?[["description","Description",true],["long_description","Long description",true],["website_url","Website URL"],["category","Category"],["pricing_type","Pricing type"],["free_tier","Free tier",true],["logo_url","Logo URL"],["my_experience","My experience",true],["limitations","Limitations",true]]:[["description","Description",true],["content","Content",true],["status","Status"],["repository_url","Repository URL"],["demo_url","Demo URL"],["cover_image_id","Cover image ID"]];
  return <AdminShell>
    <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Resources</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{kind[0].toUpperCase()+kind.slice(1)}</h1><p className="mt-2 text-sm text-slate-500">Manage the structured directory and project records.</p></div>
    <div className="mt-7 grid lg:grid-cols-[380px_1fr] gap-6 items-start">
      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{editing?"Edit item":"Add item"}</div>
        <input required value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
        <input value={form.slug} onChange={e=>set("slug",e.target.value)} placeholder="Slug" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
        {fields.map((x:any)=>x[2]?<textarea key={x[0]} value={form[x[0]]||""} onChange={e=>set(x[0],e.target.value)} placeholder={x[1]} rows={x[0]==="content"?10:3} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>:<input key={x[0]} value={form[x[0]]||""} onChange={e=>set(x[0],e.target.value)} placeholder={x[1]} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>)}
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!form.featured} onChange={e=>set("featured",e.target.checked)}/> Featured</label>
        {error&&<p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1"><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">{editing?"Update":"Add"}</button>{editing&&<button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Cancel</button>}</div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{rows.length?rows.map(x=><div key={x.id} className="p-5 flex items-center justify-between gap-4 border-b last:border-0 border-slate-100"><div><div className="font-medium text-slate-950">{x.name}</div><div className="mt-1 text-xs text-slate-400">{x.slug}</div></div><div className="flex gap-3 text-sm"><button onClick={()=>{setEditing(x);setForm((v:any)=>({...v,...x}))}} className="text-slate-600 hover:text-slate-950">Edit</button><button onClick={async()=>{if(confirm("Delete this item?")){await apiFetch("/api/content/"+kind+"/"+x.id,{method:"DELETE"});load()}}} className="text-red-600">Delete</button></div></div>):<div className="p-10"><EmptyState title={`No ${kind} yet.`} /></div>}</div>
    </div>
  </AdminShell>
}

function ResearchManager(){
  const [rows,setRows]=useState<any[]>([]),[editing,setEditing]=useState<any>(null),[form,setForm]=useState<any>({title:"",slug:"",content:"",status:"active"});const routeId=(location.pathname.match(/^\/admin\/research\/(\d+)\/edit$/)||[])[1];const load=()=>apiFetch("/api/content/admin/research-notes").then((data:any[])=>{setRows(data);if(routeId){const item=data.find(x=>String(x.id)===String(routeId));if(item){setEditing(item);setForm({...item})}}}).catch(()=>{});useEffect(load,[routeId]);
  const save=async(e:any)=>{e.preventDefault();await apiFetch(editing?"/api/content/admin/research-notes/"+editing.id:"/api/content/admin/research-notes",{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});setEditing(null);setForm({title:"",slug:"",content:"",status:"active"});load()};
  return <AdminShell><div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Knowledge workbench</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Research</h1><p className="mt-2 text-sm text-slate-500">Capture investigations privately, then convert finished work into publishable research.</p></div><div className="mt-7 grid lg:grid-cols-[380px_1fr] gap-6 items-start"><form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{editing?"Edit note":"New note"}</div><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="Slug" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"><option>active</option><option>completed</option><option>converted</option><option>archived</option></select><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={15} placeholder="Research notes…" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm"/><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">{editing?"Update note":"Add note"}</button></form><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{rows.length?rows.map(x=><div key={x.id} className="p-5 flex items-center justify-between gap-4 border-b last:border-0 border-slate-100"><div><div className="font-medium text-slate-950">{x.title}</div><div className="mt-1 text-xs text-slate-400">{x.status} · {new Date(x.updated_at).toLocaleDateString()}</div></div><div className="flex gap-3"><button className="text-sm text-slate-600 hover:text-slate-950" onClick={()=>{setEditing(x);setForm({...x})}}>Edit</button>{x.status!=="converted"&&<button className="text-sm text-slate-600 hover:text-slate-950" onClick={async()=>{if(confirm("Convert this note into a draft research post?")){await apiFetch("/api/content/admin/research-notes/"+x.id+"/convert",{method:"POST"});load()}}}>Convert</button>}</div></div>):<div className="p-10"><EmptyState title="No research notes yet." /></div>}</div></div></AdminShell>
}

function MediaManager(){
 const [rows,setRows]=useState<any[]>([]),[error,setError]=useState("");const load=()=>apiFetch("/api/content/media").then(setRows).catch((e:any)=>setError(e.message));useEffect(load,[]);
 const upload=async(e:any)=>{e.preventDefault();const f=(document.getElementById("media-file") as HTMLInputElement).files?.[0];if(!f)return;const fd=new FormData();fd.append("file",f);try{await apiFetch("/api/content/media",{method:"POST",body:fd});load()}catch(e:any){setError(e.message)}};
 return <AdminShell><div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Assets</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Media</h1><p className="mt-2 text-sm text-slate-500">Cloudinary-backed image library for covers and article content.</p></div><form onSubmit={upload} className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center"><input id="media-file" type="file" accept="image/*" className="min-w-0 flex-1 text-sm text-slate-600"/><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">Upload image</button></form>{error&&<p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}{rows.length?<div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{rows.map(x=><div key={x.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><img src={x.secure_url||x.url} className="aspect-video w-full object-cover"/><p className="truncate border-t border-slate-100 p-3 text-sm text-slate-600">{x.filename}</p></div>)}</div>:<div className="mt-6"><EmptyState title="No media uploaded yet." description="Upload an image to use it in articles and project pages." /></div>}</AdminShell>
}

function SettingsManager(){const [s,setS]=useState<any>({site_title:"Vijevira Labs",site_tagline:"Engineering, Research & Building.",site_description:"",github_url:"",author_name:"Vijevira Labs"}),[saved,setSaved]=useState(false);useEffect(()=>{apiFetch("/api/content/settings").then((x:any)=>setS((v:any)=>({...v,...x}))).catch(()=>{})},[]);const save=async(e:any)=>{e.preventDefault();await apiFetch("/api/content/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});setSaved(true);setTimeout(()=>setSaved(false),1500)};return <AdminShell><div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">System</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Settings</h1><p className="mt-2 text-sm text-slate-500">Control the publication identity and global site metadata.</p></div><form onSubmit={save} className="mt-7 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">{Object.entries(s).map(([k,v]:any)=><label key={k} className="block text-sm font-medium capitalize text-slate-700">{k.replaceAll("_"," ")}<input value={v||""} onChange={e=>setS((x:any)=>({...x,[k]:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"/></label>)}<div className="flex items-center gap-3"><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">Save settings</button>{saved&&<span className="text-sm text-emerald-700">Saved.</span>}</div></form></AdminShell>}


const SITE_ORIGIN = location.origin;
function upsertMeta(attribute:string, value:string, content:string){
  let el=document.head.querySelector('meta['+attribute+'="'+value+'"]') as HTMLMetaElement|null;
  if(!el){el=document.createElement("meta");el.setAttribute(attribute,value);document.head.appendChild(el)}
  el.setAttribute("content",content);
}
function Seo({title,description,path,image,type="website",robots="index,follow",jsonLd}:{title:string,description:string,path:string,image?:string,type?:string,robots?:string,jsonLd?:any}){
  useEffect(()=>{
    const canonical=new URL(path||"/",SITE_ORIGIN).href;
    document.title=title;
    upsertMeta("name","description",description);
    upsertMeta("name","robots",robots);
    upsertMeta("property","og:title",title);
    upsertMeta("property","og:description",description);
    upsertMeta("property","og:type",type);
    upsertMeta("property","og:url",canonical);
    upsertMeta("property","og:site_name","Vijevira Labs");
    if(image) upsertMeta("property","og:image",image);
    upsertMeta("name","twitter:card",image?"summary_large_image":"summary");
    upsertMeta("name","twitter:title",title);
    upsertMeta("name","twitter:description",description);
    let link=document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement|null;
    if(!link){link=document.createElement("link");link.rel="canonical";document.head.appendChild(link)}
    link.href=canonical;
    const oldJson=document.head.querySelector('script[data-vijevira-jsonld]');oldJson?.remove();
    if(jsonLd){
      const script=document.createElement("script");
      script.type="application/ld+json";
      script.dataset.vijeviraJsonld="true";
      script.textContent=JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return()=>{document.head.querySelector('script[data-vijevira-jsonld]')?.remove()};
  },[title,description,path,image,type,robots,JSON.stringify(jsonLd)]);
  return null;
}
const ARTICLE_STYLES = `
:focus-visible{outline:3px solid rgba(13,148,136,.35);outline-offset:2px}
html{scroll-behavior:smooth}
body{margin:0}
button,a,input,textarea,select,summary{touch-action:manipulation}
.vl-skip{position:fixed;left:1rem;top:.75rem;z-index:100;transform:translateY(-180%);border-radius:.7rem;background:#0f172a;color:#fff;padding:.65rem .9rem;font-size:.8rem;font-weight:600;box-shadow:0 12px 24px rgba(15,23,42,.18)}
.vl-skip:focus{transform:translateY(0)}
.vl-main{min-height:40vh}
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
.vl-code-label{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.55rem .85rem;background:#111827;border-bottom:1px solid #1e293b;color:#94a3b8;font:600 .72rem/1 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;text-transform:uppercase;letter-spacing:.08em}
.vl-code-copy{border:1px solid #334155;border-radius:7px;padding:.3rem .55rem;background:#1e293b;color:#cbd5e1;font:600 .68rem/1 ui-sans-serif,system-ui,sans-serif;text-transform:none;letter-spacing:0;cursor:pointer}
.vl-code-copy:hover{background:#334155;color:#fff}
.vl-tok-comment{color:#64748b;font-style:italic}.vl-tok-string{color:#a7f3d0}.vl-tok-keyword{color:#c4b5fd}.vl-tok-number{color:#fcd34d}.vl-tok-function{color:#67e8f9}.vl-tok-property{color:#93c5fd}.vl-tok-operator{color:#fda4af}
.vl-article pre{margin:0;overflow:auto;padding:1.1rem 1.2rem;color:#e2e8f0;font:500 .9rem/1.75 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
.vl-table-wrap{margin:1.5rem 0;overflow-x:auto;border:1px solid #e2e8f0;border-radius:14px}
.vl-article table{width:100%;border-collapse:collapse;min-width:520px;background:#fff}
.vl-article th,.vl-article td{padding:.8rem 1rem;text-align:left;border-bottom:1px solid #e2e8f0}
.vl-article th{background:#f8fafc;color:#0f172a;font-size:.9rem;font-weight:700}
.vl-article tr:last-child td{border-bottom:0}
.vl-article img{display:block;max-width:100%;height:auto;margin:1.5rem auto;border-radius:14px}
.vl-toc{position:sticky;top:4.75rem;align-self:start;max-height:calc(100vh - 6rem);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#cbd5e1 transparent}
.vl-toc a{display:block;padding:.35rem 0;color:#64748b;text-decoration:none;font-size:.82rem;line-height:1.4}
.vl-toc a:hover{color:#0f172a}
.vl-article .vl-lead{font-size:1.18rem;line-height:1.8;color:#475569}
.vl-progress{position:fixed;top:68px;left:0;z-index:35;height:2px;background:#0f766e;transform-origin:left center}
@media(max-width:767px){.vl-progress{top:56px}}
.vl-action{display:inline-flex;align-items:center;gap:.45rem;border:1px solid #e2e8f0;border-radius:10px;padding:.5rem .7rem;background:#fff;color:#475569;font:500 .78rem/1 ui-sans-serif,system-ui,sans-serif}
.vl-action:hover{border-color:#cbd5e1;color:#0f172a}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.transition,.duration-500{transition:none!important;transition-duration:0ms!important}}
`;
function navIsActive(path:string,href:string){
  if(href==="/blog") return path==="/blog" || path.startsWith("/blog/") || path.startsWith("/topics/") || path.startsWith("/tags/");
  if(href==="/tools") return path==="/tools" || path.startsWith("/tools/");
  if(href==="/projects") return path==="/projects" || path.startsWith("/projects/");
  if(href==="/research") return path==="/research" || path.startsWith("/research/");
  return path===href;
}
function SiteHeader(){
  const [open,setOpen]=useState(false);
  const path=location.pathname;
  const links=[
    ["/blog","Blog"],["/research","Research"],["/tools","Tools"],["/projects","Projects"],["/search","Search"],["/about","About"]
  ];
  return <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/92 backdrop-blur-xl">
    <nav className="max-w-6xl mx-auto px-5 h-[68px] flex items-center justify-between gap-5">
      <a href="/" className="flex items-center gap-3 shrink-0">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-[11px] font-bold tracking-tight text-white shadow-sm">VL</span>
        <span className="hidden sm:block">
          <span className="block text-[15px] font-semibold tracking-tight text-slate-950">Vijevira Labs</span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Engineering · Research · Building</span>
        </span>
      </a>
      <div className="hidden md:flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/70 p-1">
        {links.map(([href,label])=><a key={href} href={href} aria-current={navIsActive(path,href)?"page":undefined} className={`rounded-full px-3.5 py-1.5 text-sm transition ${navIsActive(path,href)?"bg-white text-slate-950 shadow-sm":"text-slate-500 hover:text-slate-950"}`}>{label}</a>)}
      </div>
      <div className="md:hidden flex items-center gap-2">
        <a href="/search" aria-label="Search" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">⌕</a>
        <button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={()=>setOpen(v=>!v)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">{open?"×":"☰"}</button>
      </div>
    </nav>
    {open&&<div className="md:hidden border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-5 py-3 grid gap-1">
        {links.map(([href,label])=><a key={href} href={href} aria-current={navIsActive(path,href)?"page":undefined} onClick={()=>setOpen(false)} className={`rounded-lg px-3 py-2.5 text-sm ${navIsActive(path,href)?"bg-slate-100 font-medium text-slate-950":"text-slate-600 hover:bg-slate-50"}`}>{label}</a>)}
      </div>
    </div>}
  </header>;
}
function SectionHeader({eyebrow,title,description,href,linkLabel}:{eyebrow?:string,title:string,description?:string,href?:string,linkLabel?:string}){
  return <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow&&<div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</div>}
      <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{title}</h2>
      {description&&<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
    </div>
    {href&&<a href={href} className="text-sm font-medium text-slate-600 hover:text-slate-950">{linkLabel||"View all"} →</a>}
  </div>;
}
function Meta({children}:{children:any}){return <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{children}</div>}
function PostCard({post,featured=false}:{post:any,featured?:boolean}){
  return <a href={"/blog/"+post.slug} className={`group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 ${featured?"md:grid md:grid-cols-[1.15fr_.85fr]":""}`}>
    {post.cover_secure_url&&<div className={`overflow-hidden bg-slate-100 ${featured?"md:min-h-full":"aspect-[16/9]"}`}><img src={post.cover_secure_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"/></div>}
    <div className={`p-5 ${featured?"md:p-7 lg:p-8":"md:p-6"}`}>
      <Meta><span>{post.content_type||"article"}</span><span>·</span><span>{post.category_name||"Uncategorized"}</span>{post.published_at&&<><span>·</span><span>{dateFmt(post.published_at)}</span></>}</Meta>
      <h3 className={`mt-3 font-semibold tracking-tight text-slate-950 group-hover:text-teal-800 ${featured?"text-2xl leading-tight md:text-3xl lg:text-4xl":"text-xl leading-snug"}`}>{post.title}</h3>
      {post.description&&<p className={`mt-3 leading-7 text-slate-600 ${featured?"text-base md:text-lg":"text-sm"}`}>{post.description}</p>}
      <div className="mt-5 text-sm font-medium text-slate-500">{post.reading_time?post.reading_time+" min read":"Read article"} <span className="transition-transform group-hover:translate-x-0.5 inline-block">→</span></div>
    </div>
  </a>;
}
function CollectionCard({item,kind}:{item:any,kind:"tools"|"projects"|"research"}){
  const title=item.name||item.title;
  const href=kind==="research"?"/research/"+item.id:"/"+kind+"/"+item.slug;
  return <a href={href} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5">
    {kind==="projects"&&item.cover_secure_url&&<div className="aspect-[16/8] overflow-hidden bg-slate-100"><img src={item.cover_secure_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"/></div>}
    <div className="p-6">
      {kind==="tools"&&item.logo_url&&<img src={item.logo_url} alt="" loading="lazy" className="mb-5 h-11 w-11 rounded-xl border border-slate-200 bg-white object-contain p-1.5"/>}
      <Meta><span>{kind==="tools"?(item.pricing_type||"Tool"):(kind==="projects"?(item.status||"Project"):"Research")}</span>{kind==="tools"&&item.category&&<><span>·</span><span>{item.category}</span></>}</Meta>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 group-hover:text-teal-800">{title}</h3>
      {item.description&&<p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>}
      {kind==="tools"&&item.free_tier&&<div className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800"><span className="font-semibold">Free tier:</span> {item.free_tier}</div>}
      <span className="mt-5 inline-block text-sm font-medium text-slate-500">Explore →</span>
    </div>
  </a>;
}
function EmptyState({title,description}:{title:string,description?:string}){return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center"><div className="text-sm font-medium text-slate-700">{title}</div>{description&&<p className="mt-2 text-sm text-slate-500">{description}</p>}</div>}
function ArticleToc({headings}:{headings:any[]}){
  const [active,setActive]=useState(headings[0]?.id||"");
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if(visible[0]?.target?.id)setActive(visible[0].target.id);
    },{rootMargin:"-88px 0px -65% 0px",threshold:[0,0.25,1]});
    const els=headings.map(x=>document.getElementById(x.id)).filter(Boolean) as HTMLElement[];
    els.forEach(el=>observer.observe(el));
    return ()=>observer.disconnect();
  },[headings.map(x=>x.id).join("|")]);
  const links=headings;
  return <>
    <aside className="hidden lg:block vl-toc rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">On this page</div>
      <nav className="mt-3">{links.map(x=><a key={x.id} href={"#"+x.id} className={`block rounded-lg border-l-2 py-1.5 text-[13px] leading-5 no-underline transition ${x.level===3?"pl-6":"pl-3"} ${active===x.id?"border-teal-600 bg-white font-medium text-slate-950":"border-transparent text-slate-500 hover:text-slate-900"}`}>{x.label}</a>)}</nav>
    </aside>
    <details className="lg:hidden rounded-xl border border-slate-200 bg-slate-50/75">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-700">On this page</summary>
      <nav className="border-t border-slate-200 px-3 py-2">{links.map(x=><a key={x.id} href={"#"+x.id} className="block px-2 py-2 text-sm text-slate-600">{x.label}</a>)}</nav>
    </details>
  </>;
}
function RouteSeo(){
  const path=location.pathname;
  const clean=path.replace(/\/+$/,"")||"/";
  const defaults:any={
    "/":["Vijevira Labs — Engineering, Research & Building","Practical engineering knowledge, research, developer tools, and project notes.","/"],
    "/blog":["Blog — Vijevira Labs","Engineering articles, tutorials, guides, comparisons, and build notes from Vijevira Labs.","/blog"],
    "/research":["Research — Vijevira Labs","Technical investigations, experiments, findings, and implementation research.","/research"],
    "/tools":["Developer Tools — Vijevira Labs","Useful developer services, infrastructure, APIs, media, and free-tier tools.","/tools"],
    "/projects":["Projects — Vijevira Labs","Applications, experiments, architecture work, and projects being built in the lab.","/projects"],
    "/search":["Search — Vijevira Labs","Search engineering articles and technical notes from Vijevira Labs.","/search"],
    "/about":["About — Vijevira Labs","About Vijevira Labs, an independent engineering lab for building, researching, and documenting software.","/about"]
  };
  let [title,description,canonical]=defaults[clean]||["Vijevira Labs — Engineering, Research & Building","Practical engineering knowledge, research, tools, and projects.","/"];
  let robots=clean==="/search"?"noindex,follow":"index,follow";
  if(clean.startsWith("/admin")){title="Admin — Vijevira Labs";robots="noindex,nofollow"}
  if(clean.startsWith("/tags/")){title="Tag — Vijevira Labs";robots="index,follow"}
  if(clean.startsWith("/topics/")){title="Topic — Vijevira Labs";robots="index,follow"}
  if(clean.startsWith("/blog/")){title="Article — Vijevira Labs";description="Engineering article from Vijevira Labs.";canonical=clean}
  if(clean.startsWith("/tools/")){title="Tool — Vijevira Labs";description="Developer tool notes from Vijevira Labs.";canonical=clean}
  if(clean.startsWith("/projects/")){title="Project — Vijevira Labs";description="Project notes and implementation work from Vijevira Labs.";canonical=clean}
  if(clean.startsWith("/research/")){title="Research — Vijevira Labs";description="Technical investigation from Vijevira Labs.";canonical=clean}
  const jsonLd=clean==="/" ? {"@context":"https://schema.org","@type":"WebSite","name":"Vijevira Labs","url":SITE_ORIGIN,"description":description} : undefined;
  return <Seo title={title} description={description} path={canonical} robots={robots} jsonLd={jsonLd}/>;
}
function siteShell(children:any){return <div className="min-h-screen bg-white text-slate-900"><style>{ARTICLE_STYLES}</style><a href="#main-content" className="vl-skip">Skip to content</a><RouteSeo/><SiteHeader/><div id="main-content" tabIndex={-1} className="vl-main">{children}</div><footer className="mt-20 border-t border-slate-200"><div className="max-w-6xl mx-auto px-5 py-10"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><div className="text-sm font-semibold text-slate-900">Vijevira Labs</div><div className="mt-1 text-sm text-slate-500">Engineering, Research &amp; Building.</div></div><div className="flex flex-wrap items-center gap-4 text-sm text-slate-500"><a href="/rss.xml" className="hover:text-slate-900">RSS</a><a href="/source" className="hover:text-slate-900">Source</a></div></div><div className="mt-6 text-xs text-slate-400">Practical engineering knowledge, research, tools, and projects.</div></div></footer></div>}
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

function highlightCode(value:string,lang:string){
  const language=String(lang||"text").toLowerCase();
  let s=String(value||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const tokens:string[]=[];
  const protect=(cls:string,raw:string)=>{const i=tokens.push(`<span class="vl-tok vl-tok-${cls}">${raw}</span>`)-1;return `__VL_TOKEN_${i}__`;};
  const commentPatterns=language==="python"||language==="py"?[/#[^\n]*/g]:language==="sql"?[/--[^\n]*/g,/\/\*[\s\S]*?\*\//g]:language==="css"||language==="scss"?[/\/\*[\s\S]*?\*\//g]:language==="html"||language==="xml"?[/&lt;!--[\s\S]*?--&gt;/g]:[/\/\/[^\n]*/g,/\/\*[\s\S]*?\*\//g];
  for(const pattern of commentPatterns)s=s.replace(pattern,(m)=>protect("comment",m));
  s=s.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\`(?:\\.|[^\`\\])*\`/g,m=>protect("string",m));
  let keywordRe="";
  if(language==="js"||language==="javascript"||language==="jsx"||language==="ts"||language==="typescript"||language==="tsx") keywordRe="as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|of|private|protected|public|return|set|static|super|switch|this|throw|try|type|typeof|undefined|var|void|while|with|yield";
  else if(language==="python"||language==="py") keywordRe="and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|match|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield";
  else if(language==="sql") keywordRe="SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|NULL|ORDER|BY|GROUP|LIMIT|OFFSET|UNION|DISTINCT";
  else if(language==="bash"||language==="sh"||language==="shell") keywordRe="if|then|else|elif|fi|for|in|do|done|case|esac|function|select|while|until";
  else if(language==="json") keywordRe="true|false|null";
  if(keywordRe)s=s.replace(new RegExp(`\\b(${keywordRe})\\b`,language==="sql"?"g":"g"),m=>protect("keyword",m));
  s=s.replace(/\b\d+(?:\.\d+)?\b/g,m=>protect("number",m));
  s=s.replace(/\b[A-Za-z_$][\w$]*(?=\s*\()/g,m=>protect("function",m));
  if(language==="json")s=s.replace(/(__VL_TOKEN_\d+__\s*:)/g,m=>protect("property",m));
  s=s.replace(/(===|!==|==|!=|=>|<=|>=|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|[=+*\-/%<>!])/g,m=>protect("operator",m));
  return s.replace(/__VL_TOKEN_(\d+)__/g,(_,i)=>tokens[Number(i)]);
}
function parseTableRow(line:string){
  const cleaned=line.trim().replace(/^\|/,"").replace(/\|$/,"");
  return cleaned.split("|").map(x=>x.trim());
}

function renderMarkdown(value:string){
  const raw=String(value||"").replace(/\r\n?/g,"\n");
  const codeBlocks:string[]=[];
  const protectedText=raw.replace(/\`\`\`([a-zA-Z0-9_+-]*)\n([\s\S]*?)\`\`\`/g,(_,lang,code)=>{
    const i=codeBlocks.push({lang:lang||"text",code:code.replace(/\n$/,"")} as any)-1;
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
      html.push(`<div class="vl-code-shell"><div class="vl-code-label"><span>${escapeHtml(item.lang)}</span><button type="button" class="vl-code-copy">Copy</button></div><pre><code>${highlightCode(item.code,item.lang)}</code></pre></div>`);
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

function Md({value,article=false,toc=true}:{value:string,article?:boolean,toc?:boolean}){
  const rootRef=useRef<HTMLDivElement>(null);
  const source=article ? String(value||"").replace(/^#\s+.+(?:\r?\n|$)/,"") : value;
  const rendered=renderMarkdown(source);
  useEffect(()=>{
    const buttons=Array.from(rootRef.current?.querySelectorAll(".vl-code-copy")||[]);
    const cleanups=buttons.map(button=>{
      const handler=async()=>{
        const code=button.parentElement?.parentElement?.querySelector("pre")?.textContent||"";
        try{await navigator.clipboard.writeText(code);button.textContent="Copied";setTimeout(()=>{button.textContent="Copy"},1200)}catch{button.textContent="Copy failed";setTimeout(()=>{button.textContent="Copy"},1200)}
      };
      button.addEventListener("click",handler);
      return ()=>button.removeEventListener("click",handler);
    });
    return()=>cleanups.forEach(cleanup=>cleanup());
  },[rendered.html]);
  if(!article || !toc) return <div ref={rootRef} className="vl-article min-w-0" dangerouslySetInnerHTML={{__html:rendered.html}}/>;
  const headings=rendered.headings.filter((x:any)=>x.level>=2 && x.level<=3);
  return <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
    {headings.length>0&&<ArticleToc headings={headings}/>}
    <div ref={rootRef} className="vl-article min-w-0" dangerouslySetInnerHTML={{__html:rendered.html}}/>
  </div>;
}
function HomePublic(){
  const [posts,setPosts]=useState<any[]>([]);
  useEffect(()=>{apiFetch("/api/posts?status=published&limit=6").then(setPosts).catch(()=>{})},[]);
  const featured=posts.find(p=>!!p.featured)||posts[0],latest=posts.filter(p=>Number(p.id)!==Number(featured?.id)).slice(0,4);
  return siteShell(<>
    <main className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,.10),_transparent_38%),linear-gradient(180deg,#f8fafc_0%,#fff_74%)]">
      <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <Meta><span>Vijevira Labs</span><span>·</span><span>Engineering · Research · Building</span></Meta>
        <h1 className="mt-5 max-w-4xl text-5xl font-bold tracking-[-0.04em] text-slate-950 md:text-7xl md:leading-[1.02]">Practical engineering knowledge for people who build.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">Technical articles, research, developer tools, and project notes drawn from real-world software systems, experiments, and implementation work.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="/blog" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">Read the blog →</a>
          <a href="/projects" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950">Explore projects</a>
        </div>
      </div>
    </main>
    {featured&&<section className="max-w-6xl mx-auto px-5 pt-14 md:pt-20">
      <SectionHeader eyebrow="Featured" title="Start here" description="The latest long-form work from Vijevira Labs."/>
      <div className="mt-6"><PostCard post={featured} featured/></div>
    </section>}
    {latest.length>0&&<section className="max-w-6xl mx-auto px-5 pt-16">
      <SectionHeader eyebrow="Writing" title="Latest articles" href="/blog" linkLabel="View all articles"/>
      <div className="mt-6 grid md:grid-cols-2 gap-5">{latest.slice(0,4).map(p=><PostCard key={p.id} post={p}/>)}</div>
    </section>}
    <section className="max-w-6xl mx-auto px-5 pt-16 pb-4">
      <SectionHeader eyebrow="Explore" title="Inside the lab" description="Follow the work beyond articles."/>
      <div className="mt-6 grid md:grid-cols-3 gap-5">
        <a href="/research" className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition hover:bg-white hover:shadow-lg hover:shadow-slate-900/5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Research</div><h3 className="mt-3 text-xl font-semibold text-slate-950">Investigations & experiments</h3><p className="mt-2 text-sm leading-6 text-slate-600">Technical questions, experiments, findings, and unfinished ideas.</p><span className="mt-5 inline-block text-sm font-medium text-slate-500">Explore research →</span></a>
        <a href="/tools" className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition hover:bg-white hover:shadow-lg hover:shadow-slate-900/5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Tools</div><h3 className="mt-3 text-xl font-semibold text-slate-950">Developer tools & services</h3><p className="mt-2 text-sm leading-6 text-slate-600">Curated infrastructure, utilities, APIs, storage, AI tools, and free tiers.</p><span className="mt-5 inline-block text-sm font-medium text-slate-500">Explore tools →</span></a>
        <a href="/projects" className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition hover:bg-white hover:shadow-lg hover:shadow-slate-900/5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Projects</div><h3 className="mt-3 text-xl font-semibold text-slate-950">Things being built</h3><p className="mt-2 text-sm leading-6 text-slate-600">Applications, experiments, architecture notes, and build logs.</p><span className="mt-5 inline-block text-sm font-medium text-slate-500">Explore projects →</span></a>
      </div>
    </section>
  </>);
}
function BlogPublic(){
  const [rows,setRows]=useState<any[]>([]),[filter,setFilter]=useState("All");
  useEffect(()=>{apiFetch("/api/posts?status=published&limit=100").then(setRows).catch(()=>{})},[]);
  const categories=["All",...Array.from(new Set(rows.map(x=>x.category_name).filter(Boolean)))];
  const filtered=filter==="All"?rows:rows.filter(x=>x.category_name===filter);
  return siteShell(<main className="max-w-6xl mx-auto px-5 py-14 md:py-20">
    <div className="max-w-3xl">
      <Meta><span>Publication</span><span>·</span><span>{rows.length} {rows.length===1?"article":"articles"}</span></Meta>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Blog</h1>
      <p className="mt-3 text-lg leading-7 text-slate-600">Engineering articles, tutorials, guides, comparisons, and build notes.</p>
    </div>
    <div className="mt-8 flex gap-2 overflow-x-auto pb-1">{categories.map(c=><button key={c} type="button" aria-pressed={filter===c} onClick={()=>setFilter(c)} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${filter===c?"border-slate-950 bg-slate-950 text-white":"border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"}`}>{c}</button>)}</div>
    {filtered.length>0?<div className="mt-8 space-y-5">{filtered.map(p=><PostCard key={p.id} post={p}/>)}</div>:<div className="mt-8"><EmptyState title="No published articles yet." description="New engineering writing will appear here." /></div>}
  </main>);
}
function ReadingProgress(){
  const [progress,setProgress]=useState(0);
  useEffect(()=>{
    const update=()=>{const scrollable=document.documentElement.scrollHeight-window.innerHeight;setProgress(scrollable>0?Math.min(1,Math.max(0,window.scrollY/scrollable)):0)};
    update();window.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);
    return()=>{window.removeEventListener("scroll",update);window.removeEventListener("resize",update)};
  },[]);
  return <div className="vl-progress" aria-hidden="true" style={{width:(progress*100)+"%"}}/>;
}
function ArticleActions(){
  const [copied,setCopied]=useState(false);
  const copy=async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),1400)}catch{}};
  const share=async()=>{if((navigator as any).share)try{await (navigator as any).share({title:document.title,url:location.href})}catch{}else copy()};
  return <div className="mt-5 flex flex-wrap gap-2"><button type="button" className="vl-action" onClick={copy}>{copied?"Copied link":"Copy link"}</button><button type="button" className="vl-action" onClick={share}>Share</button></div>;
}
function PostPublic({slug}:{slug:string}){
  const [p,setP]=useState<any>(null);
  useEffect(()=>{apiFetch("/api/posts/slug/"+encodeURIComponent(slug)).then(setP).catch(()=>setP(false))},[slug]);
  if(p===false)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24"><EmptyState title="Post not found" description="The article may have moved or is no longer published." /></main>);
  if(!p)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24 text-sm text-slate-500">Loading article…</main>);

  const cats=p.categories||[];
  const tags=p.tags||[];
  const headings=renderMarkdown(String(p.content||"")).headings.filter((x:any)=>x.level>=2 && x.level<=3);
  const jsonLd={"@context":"https://schema.org","@type":"Article","headline":p.title,"description":p.description||"","datePublished":p.published_at||undefined,"dateModified":p.updated_at||p.published_at||undefined,"mainEntityOfPage":{"@type":"WebPage","@id":SITE_ORIGIN+"/blog/"+encodeURIComponent(p.slug)},"publisher":{"@type":"Organization","name":"Vijevira Labs","url":SITE_ORIGIN}};

  return siteShell(
    <><Seo title={p.title+" — Vijevira Labs"} description={p.description||"Engineering article from Vijevira Labs."} path={"/blog/"+p.slug} image={p.cover_secure_url||undefined} type="article" jsonLd={jsonLd}/><ReadingProgress/><main className="max-w-6xl mx-auto px-5 pt-7 pb-16 md:pt-10 md:pb-24">
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-7 lg:gap-12 items-start">
        {headings.length>0&&<ArticleToc headings={headings}/>} 
        <article className="min-w-0">
          <header className="max-w-4xl">
            <Meta>
              <a href="/blog" className="text-teal-700 hover:text-teal-800">Blog</a>
              <span>·</span>
              <span>{p.content_type||"article"}</span>
              {cats.slice(0,3).map((x:any)=><a key={x.id} href={"/topics/"+x.slug} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 normal-case tracking-normal text-slate-600 hover:border-slate-300 hover:text-slate-950">{x.name}</a>)}
            </Meta>
            <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] leading-[1.06] text-slate-950 md:text-5xl lg:text-6xl">{p.title}</h1>
            {p.description&&<p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">{p.description}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
              {p.published_at&&<time dateTime={p.published_at}>{dateFmt(p.published_at)}</time>}
              {p.reading_time&&<><span>•</span><span>{p.reading_time} min read</span></>}
              {p.author_name&&<><span>•</span><span>By {p.author_name}</span></>}
            </div>
            <ArticleActions/>
          </header>

          {p.cover_secure_url&&<figure className="mt-9 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <img src={p.cover_secure_url} alt={p.title} className="w-full max-h-[600px] object-cover"/>
          </figure>}

          <div className="mt-10 md:mt-14 max-w-3xl">
            <Md value={p.content} article toc={false}/>
          </div>

          {tags.length>0&&<div className="mt-14 max-w-3xl border-t border-slate-200 pt-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Topics & tags</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((x:any)=><a href={"/tags/"+x.slug} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-950" key={x.id}>{x.name}</a>)}
            </div>
          </div>}

          {p.related_posts?.length>0&&<section className="mt-14 border-t border-slate-200 pt-8">
            <SectionHeader eyebrow="Continue reading" title="Related articles"/>
            <div className="mt-5 grid md:grid-cols-2 gap-5">{p.related_posts.slice(0,2).map((x:any)=><PostCard key={x.id} post={x}/>)}</div>
          </section>}

          <div className="mt-10 flex flex-wrap gap-3">
            <a href="/blog" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950">← All articles</a>
            <a href="/search" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Search the lab</a>
          </div>
        </article>
      </div>
    </main></>
  );
}

function dateFmt(s:any){return s?new Date(s).toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}):""}
function CollectionPublic({kind}:{kind:"tools"|"projects"|"research"}){
  const [rows,setRows]=useState<any[]>([]),[query,setQuery]=useState(""),[filter,setFilter]=useState("All");
  useEffect(()=>{apiFetch(kind==="research"?"/api/content/research":"/api/content/"+kind).then(setRows).catch(()=>{})},[kind]);
  const meta=kind==="tools"?["Developer directory","Discover useful services, infrastructure, APIs, and free tiers."]:kind==="projects"?["Build log","Applications, experiments, architecture, and things being built."]:["Technical investigations","Experiments, findings, and research notes worth sharing."];
  const filters=kind==="tools"?["All",...Array.from(new Set(rows.map(x=>x.category).filter(Boolean)))]:kind==="projects"?["All",...Array.from(new Set(rows.map(x=>x.status).filter(Boolean)))]:["All"];
  const filtered=rows.filter(x=>{const haystack=String(x.name||x.title||"")+" "+String(x.description||"")+" "+String(x.category||"");const filterOk=filter==="All"||(kind==="tools"?x.category===filter:x.status===filter);return filterOk&&(!query.trim()||haystack.toLowerCase().includes(query.trim().toLowerCase()))});
  return siteShell(<><Seo title={(kind==="tools"?"Developer Tools":kind==="projects"?"Projects":"Research")+" — Vijevira Labs"} description={meta[1]} path={"/"+kind} type="CollectionPage"/><main className="max-w-6xl mx-auto px-5 py-14 md:py-20">
    <div className="max-w-3xl"><Meta><span>{meta[0]}</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{kind[0].toUpperCase()+kind.slice(1)}</h1><p className="mt-3 text-lg leading-7 text-slate-600">{meta[1]}</p></div>
    {rows.length>0&&kind!=="research"&&<div className="mt-8 flex flex-col gap-3 md:flex-row"><div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-2"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={kind==="tools"?"Search tools, services, and infrastructure…":"Search projects…"} aria-label={"Search "+kind} className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"/></div>{filters.length>1&&<div className="flex gap-2 overflow-x-auto pb-1">{filters.map(f=><button key={f} type="button" aria-pressed={filter===f} onClick={()=>setFilter(f)} className={filter===f?"shrink-0 rounded-full border border-slate-950 bg-slate-950 px-3.5 py-2 text-xs font-medium text-white":"shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:border-slate-300"}>{f}</button>)}</div>}</div>}
    {filtered.length>0?<div className="mt-9 grid md:grid-cols-2 lg:grid-cols-3 gap-5">{filtered.map(x=><CollectionCard key={x.id} item={x} kind={kind}/>)}</div>:<div className="mt-9"><EmptyState title={rows.length?"No matching "+kind+".":"No published "+kind+" yet."} description={rows.length?"Try a different search or filter.":"New work will appear here as it is published."} /></div>}
  </main></>);
}
function DetailPublic({kind,slug}:{kind:"tools"|"projects",slug:string}){
  const [x,setX]=useState<any>(null);
  useEffect(()=>{apiFetch("/api/content/"+kind).then((rows:any[])=>setX(rows.find(r=>r.slug===slug)||false)).catch(()=>setX(false))},[kind,slug]);
  if(!x)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24 text-slate-500">{x===false?<EmptyState title="Not found" description="This item may have moved or is no longer published."/>:"Loading…"}</main>);
  const detailLd={"@context":"https://schema.org","@type":"WebPage","name":x.name,"description":x.description||"","url":SITE_ORIGIN+"/"+kind+"/"+x.slug,"isPartOf":{"@type":"WebSite","name":"Vijevira Labs","url":SITE_ORIGIN}};
  return siteShell(<><Seo title={x.name+" — Vijevira Labs"} description={x.description||""} path={"/"+kind+"/"+x.slug} jsonLd={detailLd}/><main className="max-w-5xl mx-auto px-5 py-14 md:py-20"><article className="max-w-4xl">
    <Meta><a href={"/"+kind} className="text-teal-700 hover:text-teal-800">{kind}</a><span>·</span><span>{kind==="tools"?(x.pricing_type||"Developer tool"):(x.status||"Project")}</span></Meta>
    {x.logo_url&&kind==="tools"&&<img src={x.logo_url} alt="" className="mt-6 h-14 w-14 rounded-2xl border border-slate-200 bg-white object-contain p-2"/>}
    <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{x.name}</h1>
    {x.description&&<p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{x.description}</p>}
    <div className="mt-6 flex flex-wrap gap-2">{x.website_url&&<a className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white" href={x.website_url} target="_blank" rel="noreferrer">Website ↗</a>}{kind==="projects"&&x.repository_url&&<a className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700" href={x.repository_url} target="_blank" rel="noreferrer">Repository ↗</a>}{kind==="projects"&&x.demo_url&&<a className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700" href={x.demo_url} target="_blank" rel="noreferrer">Live demo ↗</a>}</div>
    {kind==="tools"&&<div className="mt-10 grid sm:grid-cols-2 gap-4"><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Category</div><div className="mt-2 text-sm font-medium text-slate-900">{x.category||"—"}</div></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Pricing</div><div className="mt-2 text-sm font-medium text-slate-900">{x.pricing_type||"—"}</div></div></div>}
    {kind==="tools"&&x.free_tier&&<section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Free tier</div><p className="mt-2 text-sm leading-6 text-emerald-900">{x.free_tier}</p></section>}
    {kind==="tools"&&x.my_experience&&<section className="mt-10 border-t border-slate-200 pt-8"><SectionHeader eyebrow="Field notes" title="My experience"/><div className="mt-4 max-w-3xl"><Md value={x.my_experience}/></div></section>}
    {kind==="tools"&&x.limitations&&<section className="mt-10 border-t border-slate-200 pt-8"><SectionHeader eyebrow="Caveats" title="Limitations"/><div className="mt-4 max-w-3xl"><Md value={x.limitations}/></div></section>}
    {kind==="tools"&&x.long_description&&<section className="mt-10 border-t border-slate-200 pt-8"><SectionHeader eyebrow="Overview" title="More about this tool"/><div className="mt-4 max-w-3xl"><Md value={x.long_description}/></div></section>}
    {kind==="projects"&&x.cover_secure_url&&<figure className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"><img src={x.cover_secure_url} alt={x.name} className="w-full max-h-[560px] object-cover"/></figure>}
    {kind==="projects"&&<section className="mt-10 grid sm:grid-cols-2 gap-4"><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Status</div><div className="mt-2 text-sm font-medium capitalize text-slate-900">{x.status||"—"}</div></div>{x.featured&&<div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Featured project</div><div className="mt-2 text-sm font-medium text-slate-900">Highlighted in the lab</div></div>}</section>}
    {kind==="projects"&&x.content&&<div className="mt-12 border-t border-slate-200 pt-10"><Md value={x.content}/></div>}
    <div className="mt-10"><a href={"/"+kind} className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950">← All {kind}</a></div>
  </article></main></>);
}
function ResearchPublic(){
  const [rows,setRows]=useState<any[]>([]);
  useEffect(()=>{apiFetch("/api/content/research").then(setRows).catch(()=>{})},[]);
  return siteShell(<><Seo title="Research — Vijevira Labs" description="Technical investigations, experiments, findings, and implementation research." path="/research" type="CollectionPage"/><main className="max-w-6xl mx-auto px-5 py-14 md:py-20">
    <div className="max-w-3xl"><Meta><span>Technical investigations</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Research</h1><p className="mt-3 text-lg leading-7 text-slate-600">Questions, experiments, implementation findings, and technical investigations.</p></div>
    {rows.length>0?<div className="mt-9 grid md:grid-cols-2 lg:grid-cols-3 gap-5">{rows.map(x=><CollectionCard key={x.id} item={x} kind="research"/>)}</div>:<div className="mt-9"><EmptyState title="No published research yet." description="Research notes will appear here as investigations are completed." /></div>}
  </main></>);
}
function ResearchDetailPublic({id}:{id:string}){
  const [x,setX]=useState<any>(null);
  useEffect(()=>{apiFetch("/api/content/research/"+id).then(setX).catch(()=>setX(false))},[id]);
  if(!x)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24 text-slate-500">{x===false?<EmptyState title="Research not found" description="This investigation may have moved or is not published yet."/>:"Loading…"}</main>);
  const researchLd={"@context":"https://schema.org","@type":"Article","headline":x.title,"description":x.description||"","datePublished":x.published_at||undefined,"dateModified":x.updated_at||undefined,"mainEntityOfPage":{"@type":"WebPage","@id":SITE_ORIGIN+"/research/"+x.id},"publisher":{"@type":"Organization","name":"Vijevira Labs","url":SITE_ORIGIN}};
  return siteShell(<><Seo title={x.title+" — Vijevira Labs"} description={x.description||""} path={"/research/"+x.id} type="article" jsonLd={researchLd}/><main className="max-w-5xl mx-auto px-5 py-14 md:py-20"><article className="max-w-4xl">
    <Meta><a href="/research" className="text-teal-700 hover:text-teal-800">Research</a>{x.published_at&&<><span>·</span><time dateTime={x.published_at}>{dateFmt(x.published_at)}</time></>}</Meta>
    <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{x.title}</h1>
    {x.description&&<p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{x.description}</p>}
    <div className="mt-12 border-t border-slate-200 pt-10 max-w-3xl"><Md value={x.content}/></div>
    <a href="/research" className="mt-10 inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950">← All research</a>
  </article></main></>);
}
function SearchPublic(){
  const [rows,setRows]=useState<any[]>([]),[q,setQ]=useState(""),[loading,setLoading]=useState(false);
  const run=async(e:any)=>{e.preventDefault();if(!q.trim())return;setLoading(true);try{setRows(await apiFetch("/api/posts?status=published&limit=100&q="+encodeURIComponent(q.trim())))}finally{setLoading(false)}};
  return siteShell(<><Seo title="Search — Vijevira Labs" description="Search engineering articles and technical notes from Vijevira Labs." path="/search" robots="noindex,follow"/><main className="max-w-5xl mx-auto px-5 py-14 md:py-20">
    <div className="max-w-3xl"><Meta><span>Knowledge search</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Search the lab</h1><p className="mt-3 text-lg leading-7 text-slate-600">Find articles across Vijevira Labs.</p></div>
    <form onSubmit={run} className="mt-8 flex gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-2 shadow-sm">
      <input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search engineering topics, articles, and guides…" aria-label="Search articles" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"/>
      <button disabled={loading} className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{loading?"Searching…":"Search"}</button>
    </form>
    {q&&<div aria-live="polite" className="mt-8 text-sm text-slate-500">{rows.length} {rows.length===1?"result":"results"} for <span className="font-medium text-slate-900">“{q}”</span></div>}
    <div className="mt-4 space-y-4">{rows.map(x=><a key={x.id} href={"/blog/"+x.slug} className="group block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md"><Meta><span>{x.content_type||"article"}</span><span>·</span><span>{x.category_name||"Uncategorized"}</span></Meta><h2 className="mt-2 text-lg font-semibold text-slate-950 group-hover:text-teal-800">{x.title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{x.description}</p></a>)}</div>
    {!rows.length&&q&&<div className="mt-6"><EmptyState title="No matching articles." description="Try a broader term or search another concept." /></div>}
  </main></>);
}
function AboutPublic(){return siteShell(<><Seo title="About — Vijevira Labs" description="About Vijevira Labs, an independent engineering lab for building, researching, and documenting software." path="/about" type="AboutPage"/><main className="max-w-4xl mx-auto px-5 py-16 md:py-20"><div className="max-w-3xl"><Meta><span>About the lab</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">About Vijevira Labs</h1><div className="mt-8 space-y-6 text-lg leading-8 text-slate-600"><p>Vijevira Labs is an independent engineering lab for building, researching, documenting, and sharing practical software systems.</p><p>Content connects with tools, technologies, projects, experiments, and production lessons so technical knowledge stays useful beyond a single post.</p></div></div><div className="mt-14 grid md:grid-cols-3 gap-5"><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="font-semibold text-slate-950">Build</div><p className="mt-2 text-sm leading-6 text-slate-600">Projects and implementation notes from things that are actually being built.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="font-semibold text-slate-950">Investigate</div><p className="mt-2 text-sm leading-6 text-slate-600">Research, experiments, trade-offs, and technical findings.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="font-semibold text-slate-950">Document</div><p className="mt-2 text-sm leading-6 text-slate-600">Articles designed to stay useful after the original problem is solved.</p></div></div></main></>)}
function TaxonomyPublic({slug}:{slug:string}){
  const [c,setC]=useState<any>(null),[posts,setPosts]=useState<any[]>([]);
  useEffect(()=>{apiFetch("/api/taxonomy/categories").then((rows:any[])=>{const row=rows.find((x:any)=>x.slug===slug);if(!row){setC(false);return}setC(row);return apiFetch("/api/posts?status=published&limit=100&category_id="+encodeURIComponent(row.id)).then(setPosts)}).catch(()=>setC(false))},[slug]);
  if(c===false)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24"><EmptyState title="Topic not found" /></main>);
  if(!c)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24 text-sm text-slate-500">Loading topic…</main>);
  return siteShell(<><Seo title={c.name+" — Vijevira Labs"} description={c.description||("Articles about "+c.name+" from Vijevira Labs.")} path={"/topics/"+c.slug} type="CollectionPage"/><main className="max-w-5xl mx-auto px-5 py-14 md:py-20">
    <div className="max-w-3xl"><Meta><span>Topic</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{c.name}</h1>{c.description&&<p className="mt-3 text-lg leading-7 text-slate-600">{c.description}</p>}</div>
    {posts.length>0?<div className="mt-9 space-y-5">{posts.map(x=><PostCard key={x.id} post={x}/>)}</div>:<div className="mt-9"><EmptyState title="No published articles in this topic yet." /></div>}
  </main></>);
}

function TagPublic({slug}:{slug:string}){
  const [data,setData]=useState<any>(null);
  useEffect(()=>{apiFetch("/api/taxonomy/tags/"+encodeURIComponent(slug)+"/posts").then(setData).catch(()=>setData(false))},[slug]);
  if(data===false)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24"><EmptyState title="Tag not found" /></main>);
  if(!data)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24 text-sm text-slate-500">Loading tag…</main>);
  return siteShell(<><Seo title={data.tag.name+" — Vijevira Labs"} description={"Articles tagged "+data.tag.name+" from Vijevira Labs."} path={"/tags/"+data.tag.slug} type="CollectionPage"/><main className="max-w-5xl mx-auto px-5 py-14 md:py-20">
    <div className="max-w-3xl"><Meta><span>Tag</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{data.tag.name}</h1><p className="mt-3 text-slate-600">{data.posts.length} {data.posts.length===1?"article":"articles"}</p></div>
    {data.posts.length>0?<div className="mt-9 space-y-5">{data.posts.map((p:any)=><PostCard key={p.id} post={p}/>)}</div>:<div className="mt-9"><EmptyState title="No published articles use this tag yet." /></div>}
  </main></>);
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