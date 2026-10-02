   1|/** @jsxImportSource https://esm.sh/react@18.2.0 */
   2|import { useEffect, useRef, useState } from "https://esm.sh/react@18.2.0";
   3|
   4|const nav = [
   5|  ["/admin", "Dashboard"], ["/admin/posts", "Posts"], ["/admin/research", "Research"],
   6|  ["/admin/tools", "Tools"], ["/admin/projects", "Projects"], ["/admin/media", "Media"],
   7|  ["/admin/categories", "Categories"], ["/admin/tags", "Tags"], ["/admin/technologies", "Technologies"], ["/admin/settings", "Settings"],
   8|];
   9|
  10|function AdminShell({ children }: { children: any }) {
  11|  const [user,setUser]=useState<any>(null),[checking,setChecking]=useState(true),[menu,setMenu]=useState(false);
  12|  const path=location.pathname;
  13|  const sections=[
  14|    {title:"Content",items:[["/admin","Dashboard"],["/admin/posts","Posts"],["/admin/research","Research"]]},
  15|    {title:"Resources",items:[["/admin/tools","Tools"],["/admin/projects","Projects"],["/admin/media","Media"]]},
  16|    {title:"Taxonomy",items:[["/admin/clusters","Topic clusters"],["/admin/categories","Categories"],["/admin/tags","Tags"],["/admin/technologies","Technologies"]]},
  17|  ];
  18|  useEffect(()=>{
  19|    fetch("/api/auth/me",{credentials:"include"})
  20|      .then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error?.message||"Unauthenticated");return d.data})
  21|      .then(data=>{setUser(data);setChecking(false)})
  22|      .catch(()=>window.location.replace("/admin/login"));
  23|  },[]);
  24|  const logout=async()=>{try{await fetch("/api/auth/logout",{method:"POST",credentials:"include"})}finally{window.location.replace("/admin/login")}};
  25|  const isActive=(href:string)=>href==="/admin"?path==="/admin":path===href||path.startsWith(href+"/");
  26|  if(checking)return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Checking session…</div>;
  27|  return <div className="min-h-screen bg-slate-50 text-slate-900"><Seo title="Admin — Vijevira Labs" description="Vijevira Labs administration workspace." path={location.pathname} robots="noindex,nofollow"/>
  28|    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">
  29|      <div className="px-5 pt-5">
  30|        <a href="/admin" className="flex items-center gap-3">
  31|          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-[11px] font-bold text-white">VL</span>
  32|          <span><span className="block text-sm font-semibold tracking-tight">Vijevira Labs</span><span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400">Admin workspace</span></span>
  33|        </a>
  34|      </div>
  35|      <nav className="mt-8 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-5">
  36|        {sections.map(s=><div key={s.title} className="mb-6">
  37|          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{s.title}</div>
  38|          <div className="space-y-1">{s.items.map(([href,label])=><a key={href} href={href} className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition ${isActive(href)?"bg-slate-950 font-medium text-white shadow-sm":"text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>{label}</a>)}</div>
  39|        </div>)}
  40|        <div><div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">System</div><a href="/admin/settings" className={`flex items-center rounded-lg px-3 py-2.5 text-sm ${isActive("/admin/settings")?"bg-slate-950 font-medium text-white":"text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>Settings</a></div>
  41|      </nav>
  42|      <div className="border-t border-slate-200 p-4">
  43|        <div className="rounded-xl bg-slate-50 p-3"><p className="truncate text-xs font-medium text-slate-700">{user?.email}</p><div className="mt-3 flex items-center justify-between gap-3"><a href="/" className="text-xs text-slate-500 hover:text-slate-950">View site ↗</a><button type="button" onClick={logout} className="text-xs font-medium text-red-600 hover:text-red-700">Sign out</button></div></div>
  44|      </div>
  45|    </aside>
  46|    <div className="md:hidden sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
  47|      <div className="flex h-14 items-center justify-between px-4">
  48|        <a href="/admin" className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-[10px] font-bold text-white">VL</span><span className="text-sm font-semibold">Vijevira Labs</span></a>
  49|        <button type="button" onClick={()=>setMenu(v=>!v)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200">{menu?"×":"☰"}</button>
  50|      </div>
  51|      {menu&&<div className="border-t border-slate-200 bg-white px-3 py-3">{sections.flatMap(s=>s.items).map(([href,label])=><a key={href} href={href} onClick={()=>setMenu(false)} className={`block rounded-lg px-3 py-2.5 text-sm ${isActive(href)?"bg-slate-100 font-medium text-slate-950":"text-slate-600"}`}>{label}</a>)}<a href="/admin/settings" onClick={()=>setMenu(false)} className={`block rounded-lg px-3 py-2.5 text-sm ${isActive("/admin/settings")?"bg-slate-100 font-medium text-slate-950":"text-slate-600"}`}>Settings</a><div className="mt-2 border-t pt-2"><a href="/" className="block px-3 py-2 text-sm text-slate-500">View site ↗</a><button type="button" onClick={logout} className="px-3 py-2 text-sm text-red-600">Sign out</button></div></div>}
  52|    </div>
  53|    <main className="min-h-screen min-w-0 px-4 py-6 md:ml-64 md:px-8 md:py-8"><div className="mx-auto max-w-[1400px] min-w-0">{children}</div></main>
  54|  </div>;
  55|}
  56|
  57|function Login() {
  58|  const [email, setEmail] = useState("");
  59|  const [password, setPassword] = useState("");
  60|  const [error, setError] = useState("");
  61|  const [loading, setLoading] = useState(false);
  62|
  63|  const submit = async (e: any) => {
  64|    e.preventDefault();
  65|    setError("");
  66|    setLoading(true);
  67|    try {
  68|      const r = await fetch("/api/auth/login", {
  69|        method: "POST",
  70|        credentials: "include",
  71|        headers: { "Content-Type": "application/json" },
  72|        body: JSON.stringify({ email, password }),
  73|      });
  74|      const d = await r.json().catch(() => ({}));
  75|      if (!r.ok) throw new Error(d.error?.message || "Sign in failed");
  76|      window.location.replace("/admin");
  77|    } catch (e: any) {
  78|      setError(e.message || "Sign in failed");
  79|      setLoading(false);
  80|    }
  81|  };
  82|
  83|  return <div className="min-h-screen bg-slate-50 px-5"><Seo title="Sign in — Vijevira Labs" description="Vijevira Labs administration workspace." path="/admin/login" robots="noindex,nofollow"/>
  84|    <div className="mx-auto flex min-h-screen max-w-md items-center">
  85|      <form onSubmit={submit} className="w-full rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 md:p-8">
  86|        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-[11px] font-bold text-white">VL</span><div><div className="text-sm font-semibold tracking-tight text-slate-950">Vijevira Labs</div><div className="text-[10px] uppercase tracking-[0.17em] text-slate-400">Admin workspace</div></div></div>
  87|        <div className="mt-9"><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Sign in</h1><p className="mt-1 text-sm text-slate-500">Manage publishing, research, tools, and projects.</p></div>
  88|        <label className="mt-7 block text-sm font-medium text-slate-700">Email
  89|          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-slate-400" />
  90|        </label>
  91|        <label className="mt-4 block text-sm font-medium text-slate-700">Password
  92|          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-slate-400" />
  93|        </label>
  94|        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
  95|        <button type="submit" disabled={loading} className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">
  96|          {loading ? "Signing in…" : "Sign in"}
  97|        </button>
  98|      </form>
  99|    </div>
 100|  </div>;
 101|}
 102|
 103|function Dashboard(){
 104|  const [stats,setStats]=useState<any>({posts:0,drafts:0,published:0,research:0,tools:0,projects:0,media:0});
 105|  useEffect(()=>{
 106|    Promise.all([
 107|      apiFetch("/api/posts?limit=100").catch(()=>[]),
 108|      apiFetch("/api/content/research").catch(()=>[]),
 109|      apiFetch("/api/content/tools").catch(()=>[]),
 110|      apiFetch("/api/content/projects").catch(()=>[]),
 111|      apiFetch("/api/content/media").catch(()=>[])
 112|    ]).then(([posts,research,tools,projects,media])=>{
 113|      setStats({posts:posts.length,drafts:posts.filter((x:any)=>x.status==="draft").length,published:posts.filter((x:any)=>x.status==="published").length,research:research.length,tools:tools.length,projects:projects.length,media:media.length});
 114|    });
 115|  },[]);
 116|  return <AdminShell>
 117|    <div className="flex flex-wrap items-end justify-between gap-4">
 118|      <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Workspace</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1><p className="mt-2 text-sm leading-6 text-slate-500">A quick view of your publishing and research workspace.</p></div>
 119|      <a href="/admin/posts/new" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">New post</a>
 120|    </div>
 121|    <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
 122|      {[[stats.posts,"Posts","/admin/posts"],[stats.published,"Published","/admin/posts"],[stats.drafts,"Drafts","/admin/posts"],[stats.media,"Media","/admin/media"]].map(([value,label,href])=><a key={label} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md"><div className="text-2xl font-semibold tracking-tight text-slate-950">{value}</div><div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{label}</div></a>)}
 123|    </section>
 124|    <section className="mt-8 grid lg:grid-cols-3 gap-5">
 125|      <a href="/admin/research" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Research</div><div className="mt-3 text-xl font-semibold text-slate-950">{stats.research} investigations</div><p className="mt-2 text-sm leading-6 text-slate-500">Track questions, experiments, and findings.</p></a>
 126|      <a href="/admin/tools" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Resources</div><div className="mt-3 text-xl font-semibold text-slate-950">{stats.tools} tools</div><p className="mt-2 text-sm leading-6 text-slate-500">Maintain the developer tools directory.</p></a>
 127|      <a href="/admin/projects" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Build log</div><div className="mt-3 text-xl font-semibold text-slate-950">{stats.projects} projects</div><p className="mt-2 text-sm leading-6 text-slate-500">Keep project documentation connected to the lab.</p></a>
 128|    </section>
 129|  </AdminShell>;
 130|}
 131|
 132|const TYPES=["article","tutorial","research","guide","comparison","project_log","note"];
 133|const STATES=["draft","review","scheduled","published","archived"];
 134|const EMPTY_POST={title:"",slug:"",description:"",content:"",content_type:"article",status:"draft",featured:false,category_ids:[],tag_ids:[],technology_ids:[],tool_ids:[],project_ids:[],related_post_ids:[],cover_image_id:"",seo_title:"",seo_description:""};
 135|
 136|function MultiSelectField({label,items,selected,onToggle,emptyText,createHref}:{label:string,items:any[],selected:number[],onToggle:(id:number)=>void,emptyText:string,createHref:string}){
 137|  return <div>
 138|    <div className="flex items-center justify-between gap-3 mb-2">
 139|      <div className="text-sm font-medium">{label}</div>
 140|      <span className="text-xs text-gray-400">{selected.length} selected</span>
 141|    </div>
 142|    {selected.length>0&&<div className="flex flex-wrap gap-1.5 mb-2">{selected.map(id=>{const x=items.find((v:any)=>Number(v.id)===id);return x?<button type="button" key={id} onClick={()=>onToggle(id)} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-200">{x.name} ×</button>:null})}</div>}
 143|    {items.length>0?<div className="max-h-44 overflow-auto rounded-lg border divide-y">
 144|      {items.map((x:any)=><label key={x.id} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50">
 145|        <input type="checkbox" checked={selected.includes(Number(x.id))} onChange={()=>onToggle(Number(x.id))} className="h-4 w-4 rounded"/>
 146|        <span className="flex-1">{x.name}</span>
 147|        {selected.includes(Number(x.id))&&<span className="text-xs text-gray-400">Selected</span>}
 148|      </label>)}
 149|    </div>:<div className="rounded-lg border border-dashed p-3 text-sm text-gray-500">{emptyText} <a href={createHref} className="font-medium text-gray-900 underline underline-offset-2">Create one</a></div>}
 150|  </div>
 151|}
 152|
 153|function AdminPostPreview({post,media,cats,tags}:{post:any,media:any[],cats:any[],tags:any[]}){
 154|  const selectedCategoryIds=post.category_ids||[];
 155|  const selectedTagIds=post.tag_ids||[];
 156|  const cover=post.cover_image_id ? media.find((x:any)=>Number(x.id)===Number(post.cover_image_id)) : null;
 157|  const catNames=cats.filter((x:any)=>selectedCategoryIds.includes(Number(x.id))).map((x:any)=>x.name);
 158|  const tagNames=tags.filter((x:any)=>selectedTagIds.includes(Number(x.id))).map((x:any)=>x.name);
 159|  return <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
 160|    <div className="border-b bg-amber-50 px-5 py-3 flex items-center justify-between gap-4">
 161|      <div><div className="text-xs font-semibold uppercase tracking-wider text-amber-800">Draft preview</div><div className="mt-1 text-xs text-amber-700">This preview includes unsaved editor changes.</div></div>
 162|      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">{post.status||"draft"}</span>
 163|    </div>
 164|    <div className="px-5 py-10 md:px-10 md:py-12">
 165|      <div className="max-w-4xl">
 166|        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
 167|          <span className="uppercase tracking-wider">{post.content_type||"article"}</span>
 168|          {catNames.map((x:string)=><span key={x} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">{x}</span>)}
 169|        </div>
 170|        <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.08] text-gray-950">{post.title||"Untitled post"}</h1>
 171|        {post.description&&<p className="vl-lead mt-5 max-w-3xl">{post.description}</p>}
 172|      </div>
 173|      {cover&&<figure className="mt-9 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"><img src={cover.secure_url||cover.url} alt={post.title||"Cover image"} className="w-full max-h-[520px] object-cover"/></figure>}
 174|      <div className="mt-12"><Md value={post.content||""} article/></div>
 175|      {tagNames.length>0&&<div className="mt-12 border-t border-gray-200 pt-5"><div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Tags</div><div className="flex flex-wrap gap-2">{tagNames.map((x:string)=><span key={x} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">{x}</span>)}</div></div>}
 176|    </div>
 177|  </div>;
 178|}
 179|function InternalLinkSuggestions({post,items,cats,tags,techs,onInsert}:{post:any,items:any[],cats:any[],tags:any[],techs:any[],onInsert:(markdown:string)=>void}){
 180|  const stop=new Set(["about","after","again","also","build","building","can","from","have","into","more","that","than","the","their","this","using","with","your","you","how","what","when","where","why","and","for","not","are","was","were","will","our"]);
 181|  const tokens=(value:string)=>String(value||"").toLowerCase().replace(/[^a-z0-9\\s-]/g," ").split(/\\s+/).filter((x)=>x.length>2&&!stop.has(x));
 182|  const base=[...tokens(post.title),...tokens(post.description),...(post.category_ids||[]).map((id:number)=>cats.find((x:any)=>Number(x.id)===id)?.name||"").flatMap(tokens),...(post.tag_ids||[]).map((id:number)=>tags.find((x:any)=>Number(x.id)===id)?.name||"").flatMap(tokens),...(post.technology_ids||[]).map((id:number)=>techs.find((x:any)=>Number(x.id)===id)?.name||"").flatMap(tokens)];
 183|  const frequency=new Map<string,number>(); for(const t of base) frequency.set(t,(frequency.get(t)||0)+1);
 184|  const related=new Set((post.related_post_ids||[]).map(Number));
 185|  const suggestions=items.filter((x:any)=>Number(x.id)!==Number(post.id)&&x.status==="published").map((x:any)=>{
 186|    const candidate=tokens(String(x.title||"")+" "+String(x.description||""));
 187|    const overlap=[...new Set(candidate)].reduce((sum,t)=>sum+(frequency.has(t)?frequency.get(t)!*2:0),0);
 188|    const titleOverlap=[...new Set(tokens(x.title))].reduce((sum,t)=>sum+(frequency.has(t)?4:0),0);
 189|    const sameCategory=post.category_ids?.length&&String(x.category_name||"").split(", ").some((name:string)=>post.category_ids.some((id:number)=>cats.find((c:any)=>Number(c.id)===id)?.name===name))?5:0;
 190|    const alreadyLinked=String(post.content||"").includes("/blog/"+String(x.slug||""));
 191|    return {...x,score:overlap+titleOverlap+sameCategory+(related.has(Number(x.id))?2:0),alreadyLinked};
 192|  }).filter((x:any)=>x.score>0).sort((a:any,b:any)=>b.score-a.score).slice(0,5);
 193|  if(!suggestions.length)return null;
 194|  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
 195|    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Internal link suggestions</div>
 196|    <p className="mt-1 text-xs leading-5 text-slate-500">Potentially relevant published articles from your library. Suggestions use local title, description, and taxonomy overlap.</p>
 197|    <div className="mt-3 space-y-2">
 198|      {suggestions.map((x:any)=><div key={x.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
 199|        <div className="flex items-start gap-3">
 200|          <div className="min-w-0 flex-1"><div className="text-xs font-medium leading-5 text-slate-800">{x.title}</div><div className="mt-1 text-[10px] text-slate-400">{x.category_name||"Uncategorized"}{x.alreadyLinked?" · Already linked":related.has(Number(x.id))?" · Related":""}</div></div>
 201|          <button type="button" disabled={x.alreadyLinked} onClick={()=>onInsert("["+String(x.title).replace(/\\]/g,"\\\\]")+"](/blog/"+encodeURIComponent(String(x.slug||""))+")")} className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-700 hover:border-slate-300 disabled:cursor-default disabled:opacity-40">{x.alreadyLinked?"Added":"Insert link"}</button>
 202|        </div>
 203|      </div>)}
 204|    </div>
 205|  </section>;
 206|}
 207|function SeoQualityPanel({post,items,media}:{post:any,items:any[],media:any[]}){
 208|  const title=String(post.title||"").trim();
 209|  const seoTitle=String(post.seo_title||title).trim();
 210|  const description=String(post.seo_description||post.description||"").trim();
 211|  const slug=String(post.slug||"").trim();
 212|  const content=String(post.content||"");
 213|  const wordCount=content.trim()?content.trim().split(/\s+/).filter(Boolean).length:0;
 214|  const h2Count=(content.match(/^##\s+/gm)||[]).length;
 215|  const internalLinks=(content.match(/\]\(\/(?:blog|tools|projects|research|topics|tags)(?:\/|[?#)])/g)||[]).length;
 216|  const relatedCount=(post.related_post_ids||[]).length;
 217|  const categoryCount=(post.category_ids||[]).length;
 218|  const tagCount=(post.tag_ids||[]).length;
 219|  const selectedMedia=post.cover_image_id?media.find(x=>Number(x.id)===Number(post.cover_image_id)):null;
 220|  const duplicateTitle=title&&items.some((x:any)=>Number(x.id)!==Number(post.id)&&String(x.title||"").trim().toLowerCase()===title.toLowerCase());
 221|  const checks=[
 222|    {
 223|      label:"Article title",
 224|      ok:title.length>=20&&title.length<=70,
 225|      warn:title.length>0,
 226|      detail:title?String(title.length)+" chars":"Add a clear descriptive title"
 227|    },
 228|    {
 229|      label:"Search title",
 230|      ok:seoTitle.length>=30&&seoTitle.length<=58,
 231|      warn:seoTitle.length>0&&seoTitle.length<30,
 232|      detail:seoTitle?String(seoTitle.length)+"/58 chars":"Uses article title until you add one"
 233|    },
 234|    {
 235|      label:"Meta description",
 236|      ok:description.length>=120&&description.length<=165,
 237|      warn:description.length>0,
 238|      detail:description?String(description.length)+"/170 chars":"Add a useful search description"
 239|    },
 240|    {
 241|      label:"Clean URL slug",
 242|      ok:/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)&&slug.length<=100,
 243|      warn:!slug,
 244|      detail:slug?slug:"Generate a short lowercase slug"
 245|    },
 246|    {
 247|      label:"Content structure",
 248|      ok:h2Count>=2,
 249|      warn:h2Count===1,
 250|      detail:h2Count+" H2 sections"
 251|    },
 252|    {
 253|      label:"Content depth",
 254|      ok:wordCount>=700,
 255|      warn:wordCount>=400,
 256|      detail:wordCount+" words"
 257|    },
 258|    {
 259|      label:"Internal links",
 260|      ok:internalLinks>=2,
 261|      warn:internalLinks===1,
 262|      detail:internalLinks+" internal link"+(internalLinks===1?"":"s")
 263|    },
 264|    {
 265|      label:"Related content",
 266|      ok:relatedCount>=2,
 267|      warn:relatedCount===1,
 268|      detail:relatedCount+" related article"+(relatedCount===1?"":"s")
 269|    },
 270|    {
 271|      label:"Taxonomy",
 272|      ok:categoryCount>=1&&tagCount>=2,
 273|      warn:categoryCount>=1||tagCount>=1,
 274|      detail:categoryCount+" categor"+(categoryCount===1?"y":"ies")+" · "+tagCount+" tags"
 275|    },
 276|    {
 277|      label:"Share image",
 278|      ok:!!(selectedMedia&&String(selectedMedia.alt_text||"").trim()),
 279|      warn:!!selectedMedia,
 280|      detail:selectedMedia?(selectedMedia.alt_text?"Alt text set":"Add alt text to the selected image"):"Add a cover image for sharing"
 281|    },
 282|    {
 283|      label:"Unique title",
 284|      ok:!duplicateTitle,
 285|      warn:false,
 286|      detail:duplicateTitle?"Another post has the same title":"No duplicate title found"
 287|    }
 288|  ];
 289|  const weighted=checks.reduce((sum,x)=>sum+(x.ok?1:(x.warn?0.6:0)),0);
 290|  const score=Math.round((weighted/checks.length)*100);
 291|  const tone=score>=85?"text-emerald-700 bg-emerald-50 border-emerald-200":score>=65?"text-amber-700 bg-amber-50 border-amber-200":"text-red-700 bg-red-50 border-red-200";
 292|  const recommendations=checks.filter(x=>!x.ok).slice(0,4);
 293|  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
 294|    <div className="flex items-start justify-between gap-4">
 295|      <div>
 296|        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">SEO & content quality</div>
 297|        <p className="mt-1 text-xs leading-5 text-slate-500">A local publishing checklist. It is a heuristic, not a Google ranking score.</p>
 298|      </div>
 299|      <div className={`shrink-0 rounded-xl border px-3 py-2 text-center ${tone}`}>
 300|        <div className="text-xl font-semibold leading-none">{score}</div>
 301|        <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em]">readiness</div>
 302|      </div>
 303|    </div>
 304|    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900 transition-all" style={{width:score+"%"}}/></div>
 305|    <div className="mt-4 space-y-2">
 306|      {checks.map((x:any)=><div key={x.label} className="flex items-start gap-2.5">
 307|        <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold ${x.ok?"bg-emerald-100 text-emerald-700":x.warn?"bg-amber-100 text-amber-700":"bg-red-100 text-red-700"}`}>{x.ok?"✓":x.warn?"!":"×"}</span>
 308|        <div className="min-w-0 flex-1"><div className="text-xs font-medium text-slate-800">{x.label}</div><div className="truncate text-[10px] text-slate-400">{x.detail}</div></div>
 309|      </div>)}
 310|    </div>
 311|    {recommendations.length>0&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
 312|      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800">Suggested fixes</div>
 313|      <div className="mt-2 space-y-1.5">
 314|        {recommendations.map((x:any)=><div key={x.label} className="text-[11px] leading-5 text-amber-900">• {x.label}: {x.warn?x.detail:"needs attention"}</div>)}
 315|      </div>
 316|    </div>}
 317|  </section>;
 318|}
 319|
 320|function EnhancedPosts(){
 321|  const path=location.pathname, edit=path.match(/^\/admin\/posts\/(\d+)\/edit$/), id=edit?.[1];
 322|  const [items,setItems]=useState<any[]>([]),[cats,setCats]=useState<any[]>([]),[tags,setTags]=useState<any[]>([]),[techs,setTechs]=useState<any[]>([]),[tools,setTools]=useState<any[]>([]),[projects,setProjects]=useState<any[]>([]),[media,setMedia]=useState<any[]>([]);
 323|  const [post,setPost]=useState<any>({...EMPTY_POST});
 324|  const [error,setError]=useState(""),[loading,setLoading]=useState(false),[statusAction,setStatusAction]=useState<number|null>(null),[statusError,setStatusError]=useState(""),[showPreview,setShowPreview]=useState(false),[listQuery,setListQuery]=useState(""),[listStatus,setListStatus]=useState("all");
 325|  const [initialSnapshot,setInitialSnapshot]=useState(JSON.stringify(EMPTY_POST));
 326|  const [saveState,setSaveState]=useState<"saved"|"dirty"|"saving"|"error">("saved");
 327|  const [lastSavedAt,setLastSavedAt]=useState<number|null>(null);
 328|  const [mediaQuery,setMediaQuery]=useState("");
 329|  const contentRef=useRef<HTMLTextAreaElement|null>(null);
 330|  const snapshot=JSON.stringify(post);
 331|  const dirty=snapshot!==initialSnapshot;
 332|  useEffect(()=>{setSaveState(dirty?"dirty":"saved")},[dirty]);
 333|  useEffect(()=>{
 334|    const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue=""}};
 335|    window.addEventListener("beforeunload",warn);
 336|    return()=>window.removeEventListener("beforeunload",warn);
 337|  },[dirty]);
 338|  useEffect(()=>{
 339|    if(!id || !dirty || post.status==="published" || post.status==="archived") return;
 340|    const timer=setTimeout(async()=>{
 341|      setSaveState("saving");
 342|      try{
 343|        await apiFetch("/api/posts/"+id,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(post)});
 344|        setInitialSnapshot(JSON.stringify(post));
 345|        setSaveState("saved");
 346|        setLastSavedAt(Date.now());
 347|      }catch(e:any){
 348|        setSaveState("error");
 349|        setError(e.message||"Autosave failed");
 350|      }
 351|    },2200);
 352|    return()=>clearTimeout(timer);
 353|  },[id,dirty,post.title,post.slug,post.description,post.content,post.content_type,post.status,post.featured,post.cover_image_id,post.seo_title,post.seo_description,JSON.stringify(post.category_ids||[]),JSON.stringify(post.tag_ids||[]),JSON.stringify(post.technology_ids||[]),JSON.stringify(post.tool_ids||[]),JSON.stringify(post.project_ids||[]),JSON.stringify(post.related_post_ids||[])]);
 354|
 355|  const load=()=>apiFetch("/api/posts?limit=100").then(setItems).catch((e:any)=>setError(e.message));
 356|  useEffect(()=>{
 357|    Promise.all([
 358|      apiFetch("/api/taxonomy/categories"),
 359|      apiFetch("/api/taxonomy/tags"),
 360|      apiFetch("/api/taxonomy/technologies"),
 361|      apiFetch("/api/content/tools"),
 362|      apiFetch("/api/content/projects"),
 363|      apiFetch("/api/content/media").catch(()=>[]),
 364|      apiFetch("/api/posts?limit=100").catch(()=>[])
 365|    ]).then(([c,t,te,to,pr,m,p])=>{setCats(c);setTags(t);setTechs(te);setTools(to);setProjects(pr);setMedia(m);setItems(p)})
 366|      .catch((e:any)=>setError(e.message));
 367|    if(!id){setInitialSnapshot(JSON.stringify(EMPTY_POST));return}
 368|    apiFetch("/api/posts/"+id)
 369|      .then((p:any)=>{
 370|        const next={...p,
 371|          category_ids:(p.categories||[]).map((x:any)=>Number(x.id)),
 372|          tag_ids:(p.tags||[]).map((x:any)=>Number(x.id)),
 373|          technology_ids:(p.technologies||[]).map((x:any)=>Number(x.id)),
 374|          tool_ids:(p.tools||[]).map((x:any)=>Number(x.id)),
 375|          project_ids:(p.projects||[]).map((x:any)=>Number(x.id)),
 376|          related_post_ids:(p.related_posts||[]).map((x:any)=>Number(x.id))
 377|        };
 378|        setPost(next);
 379|        setInitialSnapshot(JSON.stringify(next));
 380|        setSaveState("saved");
 381|        setLastSavedAt(null);
 382|      })
 383|      .catch((e:any)=>setError(e.message))
 384|  },[id]);
 385|
 386|  const toggle=(key:string,n:number)=>setPost((p:any)=>({...p,[key]:(p[key]||[]).includes(n)?p[key].filter((x:number)=>x!==n):[...(p[key]||[]),n]}));
 387|  const changeStatus=async(p:any)=>{
 388|    setStatusError("");
 389|    setStatusAction(Number(p.id));
 390|    try{
 391|      const next=p.status==="published"?"unpublish":"publish";
 392|      const updated=await apiFetch("/api/posts/"+p.id+"/"+next,{method:"POST"});
 393|      setItems(xs=>xs.map(x=>Number(x.id)===Number(p.id)?{...x,status:updated.status,published_at:updated.published_at}:x));
 394|    }catch(e:any){
 395|      setStatusError(e.message||"Unable to change post status.");
 396|    }finally{
 397|      setStatusAction(null);
 398|    }
 399|  };
 400|  const persist=async(redirect=true)=>{
 401|    setError("");setLoading(true);setSaveState("saving");
 402|    try{
 403|      const saved=await apiFetch(id?"/api/posts/"+id:"/api/posts",{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(post)});
 404|      const next=id?{...post,...saved}:{...post,...saved};
 405|      if(id){
 406|        setPost(next);
 407|        setInitialSnapshot(JSON.stringify(next));
 408|        setLastSavedAt(Date.now());
 409|      }
 410|      setSaveState("saved");
 411|      if(redirect) location.href="/admin/posts";
 412|      return saved;
 413|    }catch(e:any){
 414|      setError(e.message||"Save failed");
 415|      setSaveState("error");
 416|      throw e;
 417|    }finally{setLoading(false)}
 418|  };
 419|  const save=async(e:any)=>{e.preventDefault();try{await persist(true)}catch{}};
 420|  const insertInternalLink=(markdown:string)=>{
 421|    const node=contentRef.current;
 422|    const value=String(post.content||"");
 423|    if(!node){setPost((p:any)=>({...p,content:value+(value?"\\n\\n":"")+markdown}));return}
 424|    const start=node.selectionStart??value.length;
 425|    const end=node.selectionEnd??start;
 426|    const next=value.slice(0,start)+markdown+value.slice(end);
 427|    setPost((p:any)=>({...p,content:next}));
 428|    requestAnimationFrame(()=>{node.focus();const cursor=start+markdown.length;node.setSelectionRange(cursor,cursor)});
 429|  };
 430|  const goBack=()=>{if(dirty){if(confirm("You have unsaved changes. Leave without saving?")) location.href="/admin/posts"}else location.href="/admin/posts"};
 431|  const visibleItems=items.filter(p=>(listStatus==="all"||p.status===listStatus)&&(!listQuery.trim()||String(p.title||"").toLowerCase().includes(listQuery.trim().toLowerCase())));
 432|  const filteredMedia=media.filter((x:any)=>!mediaQuery.trim()||String(x.filename||x.public_id||"").toLowerCase().includes(mediaQuery.trim().toLowerCase()));
 433|
 434|  if(path==="/admin/posts"||path==="/admin/posts/"){
 435|    return <AdminShell>
 436|      <div className="flex flex-wrap items-end justify-between gap-4">
 437|        <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Publishing</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Posts</h1><p className="mt-2 text-sm text-slate-500">Articles, tutorials, guides, comparisons, and build notes.</p></div>
 438|        <a href="/admin/posts/new" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">New post</a>
 439|      </div>
 440|      {statusError&&<div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{statusError}</div>}
 441|      <div className="mt-7 flex flex-col gap-3 md:flex-row">
 442|        <input value={listQuery} onChange={e=>setListQuery(e.target.value)} placeholder="Search posts…" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-400"/>
 443|        <div className="flex gap-2 overflow-x-auto">
 444|          {["all","draft","published","review","scheduled","archived"].map(s=><button key={s} type="button" onClick={()=>setListStatus(s)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium capitalize ${listStatus===s?"border-slate-950 bg-slate-950 text-white":"border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{s}</button>)}
 445|        </div>
 446|      </div>
 447|      <div className="mt-5 rounded-2xl border border-slate-200 bg-white overflow-hidden">
 448|        {visibleItems.length?visibleItems.map(p=><div className="p-5 md:p-6 border-b last:border-0 border-slate-100" key={p.id}>
 449|          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
 450|            <div className="min-w-0">
 451|              <div className="flex flex-wrap items-center gap-2">
 452|                <h2 className="font-semibold tracking-tight text-slate-950">{p.title}</h2>
 453|                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${p.status==="published"?"bg-emerald-50 text-emerald-700":p.status==="draft"?"bg-slate-100 text-slate-600":"bg-amber-50 text-amber-700"}`}>{p.status}</span>
 454|              </div>
 455|              <div className="mt-1.5 text-xs text-slate-400">{p.content_type} · {p.category_name||"Uncategorized"}{p.published_at?" · "+dateFmt(p.published_at):""}</div>
 456|            </div>
 457|            <div className="flex items-center gap-3 text-sm">
 458|              <button type="button" disabled={statusAction===Number(p.id)} onClick={()=>changeStatus(p)} className="font-medium text-slate-600 hover:text-slate-950 disabled:opacity-50">{statusAction===Number(p.id)?"Saving…":p.status==="published"?"Unpublish":"Publish"}</button>
 459|              <a href={"/admin/posts/"+p.id+"/edit"} className="text-slate-500 hover:text-slate-950">Edit</a>
 460|              <button type="button" onClick={async()=>{if(confirm("Delete this post?")){await apiFetch("/api/posts/"+p.id,{method:"DELETE"});load()}}} className="text-red-600 hover:text-red-700">Delete</button>
 461|            </div>
 462|          </div>
 463|        </div>):<div className="p-12"><EmptyState title="No matching posts." description={items.length?"Try a different search or status filter.":"Create your first post to start publishing."}/></div>}
 464|      </div>
 465|    </AdminShell>
 466|  }
 467|
 468|  return <AdminShell>
 469|    <div className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
 470|      <div className="flex flex-wrap items-center justify-between gap-4">
 471|        <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">{id?"Editing":"Drafting"}</div><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{id?"Edit post":"New post"}</h1><p className="mt-1 text-xs text-slate-500">{showPreview?"Rendered preview of the current editor state.":"Write, structure, optimize, then publish."}</p></div>
 472|        <div className="flex items-center gap-3">
 473|          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500" aria-live="polite"><span className={`h-2 w-2 rounded-full ${saveState==="saved"?"bg-emerald-500":saveState==="saving"?"bg-amber-500 animate-pulse":saveState==="error"?"bg-red-500":"bg-slate-400"}`}></span><span>{saveState==="saved"?(lastSavedAt?"Saved just now":"Saved"):saveState==="saving"?"Saving…":saveState==="error"?"Save error":"Unsaved changes"}</span></div>
 474|          <button type="button" onClick={()=>setShowPreview(v=>!v)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-slate-300">{showPreview?"Back to editor":"Preview"}</button>
 475|          {!showPreview&&<button type="submit" form="post-editor" disabled={loading} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading?"Saving…":"Save post"}</button>}
 476|          <button type="button" onClick={goBack} className="hidden sm:inline-flex rounded-xl px-3 py-2 text-sm text-slate-500 hover:text-slate-950">Back</button>
 477|        </div>
 478|      </div>
 479|    </div>
 480|    {showPreview ? <AdminPostPreview post={post} media={media} cats={cats} tags={tags}/> : <form id="post-editor" onSubmit={save} className="mt-6 grid xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
 481|      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7 space-y-5">
 482|        <input value={post.title} onChange={e=>setPost({...post,title:e.target.value})} placeholder="Title" required className="w-full text-3xl font-semibold border-b pb-3 outline-none"/>
 483|        <input value={post.slug||""} onChange={e=>setPost({...post,slug:e.target.value})} placeholder="Slug" className="w-full rounded-lg border px-3 py-2"/>
 484|        <textarea value={post.description||""} onChange={e=>setPost({...post,description:e.target.value})} placeholder="Description" rows={3} className="w-full rounded-lg border px-3 py-2"/>
 485|        <textarea ref={contentRef} value={post.content||""} onChange={e=>setPost({...post,content:e.target.value})} placeholder="Write in Markdown..." rows={28} className="w-full rounded-lg border px-4 py-3 font-mono text-sm"/>
 486|      </section>
 487|      <aside className="xl:sticky xl:top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
 488|        <div className="border-b border-slate-200 pb-4"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Publishing</div>
 489|          <div className="mt-4 space-y-4">
 490|            <label className="block text-sm font-medium text-slate-700">Status<select value={post.status} onChange={e=>setPost({...post,status:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5">{STATES.map(x=><option key={x}>{x}</option>)}</select></label>
 491|            <label className="block text-sm font-medium text-slate-700">Content type<select value={post.content_type} onChange={e=>setPost({...post,content_type:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5">{TYPES.map(x=><option key={x}>{x}</option>)}</select></label>
 492|          </div>
 493|        </div>
 494|        <div className="border-b border-slate-200 pb-4"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 mb-4">Taxonomy</div>
 495|
 496|        <MultiSelectField label="Categories" items={cats} selected={post.category_ids||[]} onToggle={n=>toggle("category_ids",n)} emptyText="No categories available." createHref="/admin/categories"/>
 497|        <MultiSelectField label="Tags" items={tags} selected={post.tag_ids||[]} onToggle={n=>toggle("tag_ids",n)} emptyText="No tags available." createHref="/admin/tags"/>
 498|        <MultiSelectField label="Technologies" items={techs} selected={post.technology_ids||[]} onToggle={n=>toggle("technology_ids",n)} emptyText="No technologies available." createHref="/admin/technologies"/>
 499|        <MultiSelectField label="Tools" items={tools} selected={post.tool_ids||[]} onToggle={n=>toggle("tool_ids",n)} emptyText="No tools available." createHref="/admin/tools"/>
 500|        <MultiSelectField label="Projects" items={projects} selected={post.project_ids||[]} onToggle={n=>toggle("project_ids",n)} emptyText="No projects available." createHref="/admin/projects"/>
 501|        <MultiSelectField label="Related posts" items={items.filter((x:any)=>Number(x.id)!==Number(id))} selected={post.related_post_ids||[]} onToggle={n=>toggle("related_post_ids",n)} emptyText="No other posts available yet." createHref="/admin/posts/new"/>
 502|        </div>
 503|
 504|        <div className="border-b border-slate-200 pb-4"><div className="flex items-center justify-between gap-3 mb-4"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Media</div><a href="/admin/media" className="text-xs text-gray-500 underline underline-offset-2">Manage</a></div>
 505|          <label className="block text-sm font-medium text-slate-700">Cover image
 506|            <input type="search" value={mediaQuery} onChange={e=>setMediaQuery(e.target.value)} placeholder="Find an image…" aria-label="Search media" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
 507|          </label>
 508|          <div className="mt-3 grid grid-cols-3 gap-2 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
 509|            <button type="button" onClick={()=>setPost({...post,cover_image_id:null})} className={`overflow-hidden rounded-lg border bg-white p-1 text-left ${!post.cover_image_id?"border-slate-950 ring-2 ring-slate-950/10":"border-slate-200"}`}><div className="aspect-video grid place-items-center bg-slate-50 text-[10px] text-slate-400">No cover</div><div className="px-1 py-1 text-[10px] text-slate-500">None</div></button>
 510|            {filteredMedia.map(x=>{const src=x.secure_url||x.url;const selected=Number(post.cover_image_id)===Number(x.id);return <button type="button" key={x.id} onClick={()=>setPost({...post,cover_image_id:Number(x.id)})} className={`overflow-hidden rounded-lg border bg-white p-1 text-left ${selected?"border-teal-600 ring-2 ring-teal-600/15":"border-slate-200 hover:border-slate-300"}`}><img src={src} alt="" className="aspect-video w-full rounded-md object-cover"/><div className="truncate px-1 py-1 text-[10px] text-slate-500">{x.filename||x.public_id||("Image "+x.id)}</div></button>})}
 511|          </div>
 512|          {post.cover_image_id&&<p className="mt-2 text-xs text-slate-500">Selected: {media.find(x=>Number(x.id)===Number(post.cover_image_id))?.filename||"image"}</p>}
 513|        </div>
 514|        <InternalLinkSuggestions post={post} items={items} cats={cats} tags={tags} techs={techs} onInsert={insertInternalLink}/>
 515|        <div className="space-y-4">
 516|          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Publishing options</div>
 517|          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!post.featured} onChange={e=>setPost({...post,featured:e.target.checked})}/> Featured</label>
 518|        </div>
 519|        <div className="space-y-4">
 520|          <div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">SEO</div><p className="mt-1 text-xs leading-5 text-slate-500">Control search snippets and the page title without changing the article headline.</p></div>
 521|          <label className="block text-sm font-medium text-slate-700">SEO title
 522|            <input value={post.seo_title||""} onChange={e=>setPost({...post,seo_title:e.target.value})} placeholder="Defaults to post title" maxLength={70} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
 523|            <div className="mt-1 text-right text-[10px] text-slate-400">{String(post.seo_title||"").length}/70</div>
 524|          </label>
 525|          <label className="block text-sm font-medium text-slate-700">SEO description
 526|            <textarea value={post.seo_description||""} onChange={e=>setPost({...post,seo_description:e.target.value})} placeholder="Defaults to the post description" rows={3} maxLength={170} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
 527|            <div className="mt-1 text-right text-[10px] text-slate-400">{String(post.seo_description||"").length}/170</div>
 528|          </label>
 529|          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
 530|            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Search preview</div>
 531|            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
 532|              <div className="truncate text-sm font-medium text-blue-700">{post.seo_title||post.title||"Your article title"}</div>
 533|              <div className="mt-1 truncate text-[11px] text-emerald-700">{location.origin}/blog/{post.slug||"your-post-slug"}</div>
 534|              <div className="mt-1 text-xs leading-5 text-slate-600">{post.seo_description||post.description||"Your search description will appear here."}</div>
 535|            </div>
 536|          </div>
 537|          <SeoQualityPanel post={post} items={items} media={media}/>
 538|          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
 539|            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Social preview</div>
 540|            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
 541|              {post.cover_image_id&&media.find(x=>Number(x.id)===Number(post.cover_image_id))?<img src={media.find(x=>Number(x.id)===Number(post.cover_image_id)).secure_url||media.find(x=>Number(x.id)===Number(post.cover_image_id)).url} alt="" className="aspect-[1.91/1] w-full object-cover"/>:<div className="aspect-[1.91/1] grid place-items-center bg-slate-100 text-xs text-slate-400">No social image selected</div>}
 542|              <div className="p-3"><div className="text-xs text-slate-400">{location.hostname}</div><div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">{post.seo_title||post.title||"Article title"}</div><div className="mt-1 text-xs text-slate-500 line-clamp-2">{post.seo_description||post.description||"Article description"}</div></div>
 543|            </div>
 544|          </div>
 545|        </div>
 546|        {error&&<p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
 547|        <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-950 py-3 text-sm font-medium text-white disabled:opacity-50">{loading?"Saving…":"Save post"}</button>
 548|      </aside>
 549|    </form>}
 550|  </AdminShell>
 551|}
 552|function apiFetch(path:string,opts:any={}):Promise<any>{return fetch(path,{credentials:"include",...opts}).then(async r=>{const d=await r.json().catch(()=>({}));if(r.status===401){location.href="/admin/login";throw Error("Unauthenticated")}if(!r.ok)throw Error(d.error?.message||"Request failed");return d.data})}
 553|
 554|
 555|
 556|function TaxonomyManager({kind}:{kind:"categories"|"tags"|"technologies"}){
 557|  const [rows,setRows]=useState<any[]>([]),[editing,setEditing]=useState<any>(null),[name,setName]=useState(""),[slug,setSlug]=useState(""),[description,setDescription]=useState(""),[website,setWebsite]=useState(""),[logo,setLogo]=useState(""),[error,setError]=useState("");
 558|  const load=()=>apiFetch("/api/taxonomy/"+kind).then(setRows).catch(()=>{});
 559|  useEffect(load,[]);
 560|  const reset=()=>{setEditing(null);setName("");setSlug("");setDescription("");setWebsite("");setLogo("");setError("")};
 561|  const save=async(e:any)=>{e.preventDefault();try{const body:any={name,slug};if(kind!=="tags")body.description=description;if(kind==="technologies"){body.website_url=website;body.logo_url=logo}await apiFetch(editing?"/api/taxonomy/"+kind+"/"+editing.id:"/api/taxonomy/"+kind,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});reset();load()}catch(e:any){setError(e.message)}};
 562|  const edit=(x:any)=>{setEditing(x);setName(x.name);setSlug(x.slug);setDescription(x.description||"");setWebsite(x.website_url||"");setLogo(x.logo_url||"")};
 563|  return <AdminShell>
 564|    <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Taxonomy</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{kind[0].toUpperCase()+kind.slice(1)}</h1><p className="mt-2 text-sm text-slate-500">Keep labels and technology metadata consistent across the publication.</p></div>
 565|    <div className="mt-7 grid lg:grid-cols-[340px_1fr] gap-6 items-start">
 566|      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
 567|        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{editing?"Edit item":"Add item"}</div>
 568|        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
 569|        <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="Slug (optional)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
 570|        {kind!=="tags"&&<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>}
 571|        {kind==="technologies"&&<><input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="Website URL" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><input value={logo} onChange={e=>setLogo(e.target.value)} placeholder="Logo URL" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/></>}
 572|        {error&&<p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
 573|        <div className="flex gap-2 pt-1"><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">{editing?"Update":"Add"}</button>{editing&&<button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Cancel</button>}</div>
 574|      </form>
 575|      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{rows.length} {rows.length===1?"item":"items"}</div>{rows.length?rows.map(x=><div key={x.id} className="p-5 flex items-center justify-between gap-4 border-b last:border-0 border-slate-100"><div><div className="font-medium text-slate-950">{x.name}</div><div className="mt-1 text-xs text-slate-400">{x.slug}</div></div><div className="flex gap-3 text-sm"><button onClick={()=>edit(x)} className="text-slate-600 hover:text-slate-950">Edit</button><button onClick={async()=>{if(confirm("Delete this item?")){await apiFetch("/api/taxonomy/"+kind+"/"+x.id,{method:"DELETE"});load()}}} className="text-red-600">Delete</button></div></div>):<div className="p-10"><EmptyState title="Nothing here yet." /></div>}</div>
 576|    </div>
 577|  </AdminShell>
 578|}
 579|
 580|function ClusterManager(){
 581|  const [rows,setRows]=useState<any[]>([]),[posts,setPosts]=useState<any[]>([]),[projects,setProjects]=useState<any[]>([]),[editing,setEditing]=useState<any>(null),[form,setForm]=useState<any>({name:"",slug:"",description:"",intro:""}),[selected,setSelected]=useState<Record<string,boolean>>({}),[roles,setRoles]=useState<Record<string,string>>({}),[error,setError]=useState(""),[saving,setSaving]=useState(false);
 582|  const load=async()=>{
 583|    try{
 584|      const [clusters,postRows,projectRows]=await Promise.all([apiFetch("/api/content/clusters"),apiFetch("/api/posts?status=published&limit=100"),apiFetch("/api/content/projects")]);
 585|      setRows(clusters);setPosts(postRows);setProjects(projectRows);
 586|    }catch(e:any){setError(e.message||"Could not load clusters.")}
 587|  };
 588|  useEffect(()=>{load()},[]);
 589|  const reset=()=>{setEditing(null);setForm({name:"",slug:"",description:"",intro:""});setSelected({});setRoles({});setError("")};
 590|  const edit=async(x:any)=>{
 591|    setEditing(x);setForm({name:x.name,slug:x.slug,description:x.description||"",intro:x.intro||""});setError("");
 592|    try{
 593|      const detail=await apiFetch("/api/content/clusters/"+x.slug);
 594|      const next:any={},nextRoles:any={};
 595|      (detail.posts||[]).forEach((p:any)=>{const k="post:"+p.id;next[k]=true;nextRoles[k]=p.role||"supporting"});
 596|      (detail.projects||[]).forEach((p:any)=>{const k="project:"+p.id;next[k]=true;nextRoles[k]=p.role||"supporting"});
 597|      setSelected(next);setRoles(nextRoles);
 598|    }catch(e:any){setSelected({});setRoles({});setError(e.message||"Could not load cluster items.")}
 599|  };
 600|  const toggle=(type:string,id:number)=>setSelected(v=>{const k=type+":"+id;const next={...v};if(next[k]){delete next[k];setRoles(r=>{const nr={...r};delete nr[k];return nr})}else{next[k]=true;setRoles(r=>({...r,[k]:"supporting"}))}return next});
 601|  const save=async(e:any)=>{
 602|    e.preventDefault();setSaving(true);setError("");
 603|    try{
 604|      const saved=await apiFetch(editing?"/api/content/clusters/"+editing.id:"/api/content/clusters",{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
 605|      const cluster=saved;
 606|      const items=Object.keys(selected).map((key,index)=>{const [item_type,id]=key.split(":");return {item_type,item_id:Number(id),role:roles[key]==="pillar"?"pillar":"supporting",position:index+1}});
 607|      await apiFetch("/api/content/clusters/"+cluster.id+"/items",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({items})});
 608|      reset();await load();
 609|    }catch(e:any){setError(e.message||"Could not save cluster.");}finally{setSaving(false)}
 610|  };
 611|  return <AdminShell>
 612|    <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Content strategy</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Topic clusters</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Build durable topic paths from pillar articles to supporting notes and projects. These relationships also power public topic hubs.</p></div>
 613|    <div className="mt-7 grid lg:grid-cols-[360px_1fr] gap-6 items-start">
 614|      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
 615|        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{editing?"Edit cluster":"Add cluster"}</div>
 616|        <input required value={form.name} onChange={e=>setForm((v:any)=>({...v,name:e.target.value}))} placeholder="Cluster name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
 617|        <input value={form.slug} onChange={e=>setForm((v:any)=>({...v,slug:e.target.value}))} placeholder="Slug (optional)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
 618|        <textarea required value={form.description} onChange={e=>setForm((v:any)=>({...v,description:e.target.value}))} placeholder="Description" rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
 619|        <textarea value={form.intro} onChange={e=>setForm((v:any)=>({...v,intro:e.target.value}))} placeholder="Intro shown on the public hub" rows={5} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
 620|        <div className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Assign content</div>
 621|        <div className="max-h-[460px] overflow-y-auto rounded-xl border border-slate-200 p-2">
 622|          <div className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Articles</div>
 623|          {posts.map((p:any)=>{const k="post:"+p.id,checked=!!selected[k];return <label key={k} className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-slate-50"><input type="checkbox" checked={checked} onChange={()=>toggle("post",p.id)} className="mt-1"/><span className="min-w-0 flex-1 text-sm text-slate-700">{p.title}{checked&&<select value={roles[k]||"supporting"} onChange={e=>setRoles(v=>({...v,[k]:e.target.value}))} onClick={e=>e.stopPropagation()} className="ml-2 rounded-md border border-slate-200 px-1.5 py-1 text-[11px] text-slate-600"><option value="pillar">Pillar</option><option value="supporting">Supporting</option></select>}</span></label>})}
 624|          <div className="mt-2 border-t border-slate-100 px-2 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Projects</div>
 625|          {projects.map((p:any)=>{const k="project:"+p.id,checked=!!selected[k];return <label key={k} className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-slate-50"><input type="checkbox" checked={checked} onChange={()=>toggle("project",p.id)} className="mt-1"/><span className="min-w-0 flex-1 text-sm text-slate-700">{p.name}{checked&&<select value={roles[k]||"supporting"} onChange={e=>setRoles(v=>({...v,[k]:e.target.value}))} onClick={e=>e.stopPropagation()} className="ml-2 rounded-md border border-slate-200 px-1.5 py-1 text-[11px] text-slate-600"><option value="pillar">Pillar</option><option value="supporting">Supporting</option></select>}</span></label>})}
 626|        </div>
 627|        {error&&<p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
 628|        <div className="flex gap-2 pt-1"><button disabled={saving} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving?"Saving…":editing?"Update cluster":"Create cluster"}</button>{editing&&<button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Cancel</button>}</div>
 629|      </form>
 630|      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
 631|        <div className="border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{rows.length} {rows.length===1?"cluster":"clusters"}</div>
 632|        {rows.length?rows.map((x:any)=><div key={x.id} className="border-b border-slate-100 p-5 last:border-0"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="font-medium text-slate-950">{x.name}</div><div className="mt-1 text-xs text-slate-400">/topics/{x.slug}</div><p className="mt-2 text-sm leading-6 text-slate-600">{x.description}</p></div><div className="flex shrink-0 gap-3 text-sm"><button onClick={()=>edit(x)} className="text-slate-600 hover:text-slate-950">Edit</button><button onClick={async()=>{if(confirm("Delete this cluster?")){await apiFetch("/api/content/clusters/"+x.id,{method:"DELETE"});load()}}} className="text-red-600">Delete</button></div></div></div>):<div className="p-10"><EmptyState title="No topic clusters yet." description="Create a cluster to connect related articles and projects." /></div>}
 633|      </div>
 634|    </div>
 635|  </AdminShell>
 636|}
 637|
 638|function EntityManager({kind}:{kind:"tools"|"projects"}){
 639|  const [rows,setRows]=useState<any[]>([]),[editing,setEditing]=useState<any>(null),[form,setForm]=useState<any>({name:"",slug:"",description:"",long_description:"",website_url:"",category:"",pricing_type:"",free_tier:"",logo_url:"",my_experience:"",limitations:"",content:"",status:"building",repository_url:"",demo_url:"",cover_image_id:"",featured:false}),[error,setError]=useState("");
 640|  const tool=kind==="tools", routeId=(location.pathname.match(new RegExp("^/admin/"+kind+"/(\\d+)/edit$"))||[])[1], load=()=>apiFetch("/api/content/"+kind).then((data:any[])=>{setRows(data);if(routeId){const item=data.find(x=>String(x.id)===String(routeId));if(item){setEditing(item);setForm((v:any)=>({...v,...item}))}}}).catch(()=>{}); useEffect(load,[kind,routeId]);
 641|  const set=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v})); const reset=()=>{setEditing(null);setForm({name:"",slug:"",description:"",long_description:"",website_url:"",category:"",pricing_type:"",free_tier:"",logo_url:"",my_experience:"",limitations:"",content:"",status:"building",repository_url:"",demo_url:"",cover_image_id:"",featured:false});setError("")};
 642|  const save=async(e:any)=>{e.preventDefault();try{await apiFetch(editing?"/api/content/"+kind+"/"+editing.id:"/api/content/"+kind,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});reset();load()}catch(e:any){setError(e.message)}};
 643|  const fields=tool?[["description","Description",true],["long_description","Long description",true],["website_url","Website URL"],["category","Category"],["pricing_type","Pricing type"],["free_tier","Free tier",true],["logo_url","Logo URL"],["my_experience","My experience",true],["limitations","Limitations",true]]:[["description","Description",true],["content","Content",true],["status","Status"],["repository_url","Repository URL"],["demo_url","Demo URL"],["cover_image_id","Cover image ID"]];
 644|  return <AdminShell>
 645|    <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Resources</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{kind[0].toUpperCase()+kind.slice(1)}</h1><p className="mt-2 text-sm text-slate-500">Manage the structured directory and project records.</p></div>
 646|    <div className="mt-7 grid lg:grid-cols-[380px_1fr] gap-6 items-start">
 647|      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
 648|        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{editing?"Edit item":"Add item"}</div>
 649|        <input required value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
 650|        <input value={form.slug} onChange={e=>set("slug",e.target.value)} placeholder="Slug" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>
 651|        {fields.map((x:any)=>x[2]?<textarea key={x[0]} value={form[x[0]]||""} onChange={e=>set(x[0],e.target.value)} placeholder={x[1]} rows={x[0]==="content"?10:3} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>:<input key={x[0]} value={form[x[0]]||""} onChange={e=>set(x[0],e.target.value)} placeholder={x[1]} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/>)}
 652|        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!form.featured} onChange={e=>set("featured",e.target.checked)}/> Featured</label>
 653|        {error&&<p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
 654|        <div className="flex gap-2 pt-1"><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">{editing?"Update":"Add"}</button>{editing&&<button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Cancel</button>}</div>
 655|      </form>
 656|      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{rows.length?rows.map(x=><div key={x.id} className="p-5 flex items-center justify-between gap-4 border-b last:border-0 border-slate-100"><div><div className="font-medium text-slate-950">{x.name}</div><div className="mt-1 text-xs text-slate-400">{x.slug}</div></div><div className="flex gap-3 text-sm"><button onClick={()=>{setEditing(x);setForm((v:any)=>({...v,...x}))}} className="text-slate-600 hover:text-slate-950">Edit</button><button onClick={async()=>{if(confirm("Delete this item?")){await apiFetch("/api/content/"+kind+"/"+x.id,{method:"DELETE"});load()}}} className="text-red-600">Delete</button></div></div>):<div className="p-10"><EmptyState title={`No ${kind} yet.`} /></div>}</div>
 657|    </div>
 658|  </AdminShell>
 659|}
 660|
 661|function ResearchManager(){
 662|  const [rows,setRows]=useState<any[]>([]),[editing,setEditing]=useState<any>(null),[form,setForm]=useState<any>({title:"",slug:"",content:"",status:"active"});const routeId=(location.pathname.match(/^\/admin\/research\/(\d+)\/edit$/)||[])[1];const load=()=>apiFetch("/api/content/admin/research-notes").then((data:any[])=>{setRows(data);if(routeId){const item=data.find(x=>String(x.id)===String(routeId));if(item){setEditing(item);setForm({...item})}}}).catch(()=>{});useEffect(load,[routeId]);
 663|  const save=async(e:any)=>{e.preventDefault();await apiFetch(editing?"/api/content/admin/research-notes/"+editing.id:"/api/content/admin/research-notes",{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});setEditing(null);setForm({title:"",slug:"",content:"",status:"active"});load()};
 664|  return <AdminShell><div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Knowledge workbench</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Research</h1><p className="mt-2 text-sm text-slate-500">Capture investigations privately, then convert finished work into publishable research.</p></div><div className="mt-7 grid lg:grid-cols-[380px_1fr] gap-6 items-start"><form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{editing?"Edit note":"New note"}</div><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="Slug" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"><option>active</option><option>completed</option><option>converted</option><option>archived</option></select><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={15} placeholder="Research notes…" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm"/><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">{editing?"Update note":"Add note"}</button></form><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{rows.length?rows.map(x=><div key={x.id} className="p-5 flex items-center justify-between gap-4 border-b last:border-0 border-slate-100"><div><div className="font-medium text-slate-950">{x.title}</div><div className="mt-1 text-xs text-slate-400">{x.status} · {new Date(x.updated_at).toLocaleDateString()}</div></div><div className="flex gap-3"><button className="text-sm text-slate-600 hover:text-slate-950" onClick={()=>{setEditing(x);setForm({...x})}}>Edit</button>{x.status!=="converted"&&<button className="text-sm text-slate-600 hover:text-slate-950" onClick={async()=>{if(confirm("Convert this note into a draft research post?")){await apiFetch("/api/content/admin/research-notes/"+x.id+"/convert",{method:"POST"});load()}}}>Convert</button>}</div></div>):<div className="p-10"><EmptyState title="No research notes yet." /></div>}</div></div></AdminShell>
 665|}
 666|
 667|function MediaManager(){
 668| const [rows,setRows]=useState<any[]>([]),[error,setError]=useState("");const load=()=>apiFetch("/api/content/media").then(setRows).catch((e:any)=>setError(e.message));useEffect(load,[]);
 669| const upload=async(e:any)=>{e.preventDefault();const f=(document.getElementById("media-file") as HTMLInputElement).files?.[0];if(!f)return;const fd=new FormData();fd.append("file",f);try{await apiFetch("/api/content/media",{method:"POST",body:fd});load()}catch(e:any){setError(e.message)}};
 670| return <AdminShell><div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Assets</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Media</h1><p className="mt-2 text-sm text-slate-500">Cloudinary-backed image library for covers and article content.</p></div><form onSubmit={upload} className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center"><input id="media-file" type="file" accept="image/*" className="min-w-0 flex-1 text-sm text-slate-600"/><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">Upload image</button></form>{error&&<p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}{rows.length?<div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{rows.map(x=><div key={x.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><img src={x.secure_url||x.url} className="aspect-video w-full object-cover"/><p className="truncate border-t border-slate-100 p-3 text-sm text-slate-600">{x.filename}</p></div>)}</div>:<div className="mt-6"><EmptyState title="No media uploaded yet." description="Upload an image to use it in articles and project pages." /></div>}</AdminShell>
 671|}
 672|
 673|function SettingsManager(){
 674|  const [s,setS]=useState<any>({
 675|    site_title:"Vijevira Labs",
 676|    site_tagline:"Engineering, Research & Building.",
 677|    site_description:"Practical engineering articles, technical research, developer tools, and real-world software projects from Vijevira Labs.",
 678|    github_url:"",
 679|    author_type:"Organization",
 680|    author_name:"Vijevira Labs",
 681|    author_job_title:"",
 682|    author_bio:"An independent engineering lab for building, researching, and documenting practical software systems.",
 683|    author_url:"",
 684|    author_image:"",
 685|    author_same_as:"",
 686|    ga_measurement_id:"",
 687|    google_site_verification:""
 688|  }),[saved,setSaved]=useState(false);
 689|  useEffect(()=>{apiFetch("/api/content/settings").then((x:any)=>setS((v:any)=>({...v,...x}))).catch(()=>{})},[]);
 690|  const save=async(e:any)=>{e.preventDefault();await apiFetch("/api/content/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});setSaved(true);setTimeout(()=>setSaved(false),1500)};
 691|  const field=(key:string,label:string,description:string,opts:any={})=><label className="block">
 692|    <span className="text-sm font-medium text-slate-800">{label}</span>
 693|    <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
 694|    {opts.select?<select value={s[key]||""} onChange={e=>setS((x:any)=>({...x,[key]:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">{opts.select.map((x:string)=><option key={x}>{x}</option>)}</select>:
 695|    opts.multiline?<textarea rows={opts.rows||4} value={s[key]||""} onChange={e=>setS((x:any)=>({...x,[key]:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"/>:
 696|    <input value={s[key]||""} onChange={e=>setS((x:any)=>({...x,[key]:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"/>}
 697|  </label>;
 698|  return <AdminShell><div className="max-w-3xl"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">System</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Settings</h1><p className="mt-2 text-sm leading-6 text-slate-500">Control publication identity, site metadata, and the public creator profile used by article authorship and structured data.</p></div>
 699|    <form onSubmit={save} className="mt-7 max-w-3xl space-y-6">
 700|      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="text-sm font-semibold text-slate-950">Site identity</div><p className="mt-1 text-xs leading-5 text-slate-500">These values describe the publication itself.</p><div className="mt-5 space-y-5">{field("site_title","Site title","Primary publication name.")}{field("site_tagline","Tagline","Short phrase used around the site.")}{field("site_description","Site description","Default description used when a page does not provide one.",{multiline:true,rows:3})}{field("github_url","GitHub URL","Optional public repository/profile link.")}</div></section>
 701|      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="text-sm font-semibold text-slate-950">Search & analytics</div><p className="mt-1 text-xs leading-5 text-slate-500">Optional integrations. Nothing is loaded until you enter a value and save.</p><div className="mt-5 space-y-5">{field("ga_measurement_id","Google Analytics 4 Measurement ID","Optional web stream ID, usually in the G-XXXXXXXXXX format. Leave blank to keep Google Analytics disabled.")}{field("google_site_verification","Google Search Console verification token","Paste the exact token value from Search Console for HTML-tag verification. It is public metadata, not a secret.")}</div></section>
 702|      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="text-sm font-semibold text-slate-950">Creator profile</div><p className="mt-1 text-xs leading-5 text-slate-500">This is public information. It powers the About profile and article author metadata.</p><div className="mt-5 space-y-5">{field("author_type","Creator type","Choose Person when the content is authored by an individual; choose Organization for a lab/company publication.",{select:["Organization","Person"]})}{field("author_name","Public name","Name shown publicly and used as the structured-data creator name.")}{s.author_type==="Person"&&field("author_job_title","Job title","Optional public role, separate from the creator name.")}{field("author_bio","Bio","Short public description of the creator.",{multiline:true,rows:4})}{field("author_url","Creator URL","Optional canonical public profile URL. Defaults to this site's About page when blank.")}{field("author_image","Creator image URL","Optional public, crawlable image URL. Leave blank when you do not have one.")}{field("author_same_as","Profile links","Optional public profile URLs, one per line (for example GitHub or LinkedIn).")}</div></section>
 703|      <div className="flex flex-wrap items-center gap-3"><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800">Save settings</button>{saved&&<span className="text-sm text-emerald-700">Saved.</span>}</div>
 704|    </form>
 705|  </AdminShell>
 706|}
 707|
 708|
 709|const SITE_ORIGIN = location.origin;
 710|function upsertMeta(attribute:string, value:string, content:string){
 711|  let el=document.head.querySelector('meta['+attribute+'="'+value+'"]') as HTMLMetaElement|null;
 712|  if(!el){el=document.createElement("meta");el.setAttribute(attribute,value);document.head.appendChild(el)}
 713|  el.setAttribute("content",content);
 714|}
 715|function Seo({title,description,path,image,imageAlt,type="website",robots="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",publishedTime,modifiedTime,jsonLd}:{title:string,description:string,path:string,image?:string,imageAlt?:string,type?:string,robots?:string,publishedTime?:string,modifiedTime?:string,jsonLd?:any}){
 716|  useEffect(()=>{
 717|    const canonical=new URL(path||"/",SITE_ORIGIN).href;
 718|    document.title=title;
 719|    upsertMeta("name","description",description);
 720|    upsertMeta("name","robots",robots);
 721|    upsertMeta("property","og:title",title);
 722|    upsertMeta("property","og:description",description);
 723|    upsertMeta("property","og:type",type);
 724|    upsertMeta("property","og:url",canonical);
 725|    upsertMeta("property","og:site_name","Vijevira Labs");
 726|    if(image) upsertMeta("property","og:image",image);
 727|    if(image&&imageAlt) upsertMeta("property","og:image:alt",imageAlt);
 728|    if(publishedTime) upsertMeta("property","article:published_time",publishedTime);
 729|    if(modifiedTime) upsertMeta("property","article:modified_time",modifiedTime);
 730|    upsertMeta("name","twitter:card",image?"summary_large_image":"summary");
 731|    upsertMeta("name","twitter:title",title);
 732|    upsertMeta("name","twitter:description",description);
 733|    if(image) upsertMeta("name","twitter:image",image);
 734|    if(image&&imageAlt) upsertMeta("name","twitter:image:alt",imageAlt);
 735|    let link=document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement|null;
 736|    if(!link){link=document.createElement("link");link.rel="canonical";document.head.appendChild(link)}
 737|    link.href=canonical;
 738|    const oldJson=document.head.querySelectorAll('script[data-vijevira-jsonld]');
 739|    oldJson.forEach((node)=>node.remove());
 740|    if(jsonLd){
 741|      const script=document.createElement("script");
 742|      script.type="application/ld+json";
 743|      script.dataset.vijeviraJsonld="true";
 744|      script.textContent=JSON.stringify(jsonLd);
 745|      document.head.appendChild(script);
 746|    }
 747|    return()=>{document.head.querySelectorAll('script[data-vijevira-jsonld]').forEach((node)=>node.remove())};
 748|  },[title,description,path,image,imageAlt,type,robots,publishedTime,modifiedTime,JSON.stringify(jsonLd)]);
 749|  return null;
 750|}
 751|function schemaDate(value:unknown){
 752|  const s=String(value||"").trim();
 753|  if(!s)return undefined;
 754|  if(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s))return s.replace(" ","T")+"Z";
 755|  const d=new Date(s);
 756|  return Number.isNaN(d.getTime())?undefined:d.toISOString();
 757|}
 758|function creatorLdClient(settings:any={}){
 759|  const type=String(settings.author_type||"Organization")==="Person"?"Person":"Organization";
 760|  const name=String(settings.author_name||"Vijevira Labs").trim()||"Vijevira Labs";
 761|  const url=String(settings.author_url||"").trim()||SITE_ORIGIN+"/about";
 762|  const data:any={"@type":type,"@id":SITE_ORIGIN+"/about#creator","name":name,"url":url};
 763|  if(String(settings.author_bio||"").trim())data.description=String(settings.author_bio).trim();
 764|  const sameAs=String(settings.author_same_as||"").split(/[\n,]+/).map((x:string)=>x.trim()).filter((x:string)=>/^https?:\/\//i.test(x));
 765|  if(sameAs.length)data.sameAs=[...new Set(sameAs)];
 766|  if(String(settings.author_image||"").trim())data.image=String(settings.author_image).trim();
 767|  if(type==="Person"&&String(settings.author_job_title||"").trim())data.jobTitle=String(settings.author_job_title).trim();
 768|  return data;
 769|}
 770|function publisherLdClient(){
 771|  return {"@type":"Organization","@id":SITE_ORIGIN+"/about#organization","name":"Vijevira Labs","url":SITE_ORIGIN+"/about"};
 772|}
 773|
 774|const ARTICLE_STYLES = `
 775|:focus-visible{outline:3px solid rgba(13,148,136,.35);outline-offset:2px}
 776|html{scroll-behavior:smooth;overflow-x:hidden}
 777|body{margin:0;overflow-x:hidden;background:#fff}
 778|img,svg,video,canvas{max-width:100%}
 779|button,a,input,textarea,select,summary{touch-action:manipulation}
 780|.vl-skip{position:fixed;left:1rem;top:.75rem;z-index:100;transform:translateY(-180%);border-radius:.7rem;background:#0f172a;color:#fff;padding:.65rem .9rem;font-size:.8rem;font-weight:600;box-shadow:0 12px 24px rgba(15,23,42,.18)}
 781|.vl-skip:focus{transform:translateY(0)}
 782|.vl-main{min-height:40vh}
 783|.vl-article{font-size:1.08rem;line-height:1.85;color:#334155;overflow-wrap:anywhere}
 784|.vl-article p{margin:1.25rem 0}
 785|.vl-article h2{margin:3rem 0 1rem;font-size:1.9rem;line-height:1.25;letter-spacing:-.02em;color:#0f172a;scroll-margin-top:6rem}
 786|.vl-article h3{margin:2.25rem 0 .8rem;font-size:1.35rem;line-height:1.35;color:#0f172a;scroll-margin-top:6rem}
 787|.vl-article h2:first-child,.vl-article h3:first-child{margin-top:0}
 788|.vl-article strong{font-weight:700;color:#0f172a}
 789|.vl-article em{font-style:italic}
 790|.vl-article a{color:#0f766e;text-decoration:underline;text-decoration-color:#99f6e4;text-underline-offset:3px;overflow-wrap:anywhere}
 791|.vl-article a:hover{text-decoration-color:#0f766e}
 792|.vl-article ul,.vl-article ol{margin:1.25rem 0;padding-left:1.55rem}
 793|.vl-article li{margin:.5rem 0;padding-left:.25rem}
 794|.vl-article li::marker{color:#64748b}
 795|.vl-article blockquote{margin:1.75rem 0;padding:.9rem 1.2rem;border-left:4px solid #cbd5e1;background:#f8fafc;border-radius:0 12px 12px 0;color:#475569}
 796|.vl-article hr{margin:2.75rem 0;border:0;border-top:1px solid #e2e8f0}
 797|.vl-article .vl-inline-code{padding:.16rem .4rem;border-radius:.4rem;background:#f1f5f9;color:#0f172a;font:500 .9em ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
 798|.vl-code-shell{margin:1.5rem 0;border:1px solid #1e293b;border-radius:14px;overflow:hidden;background:#0f172a;box-shadow:0 12px 28px rgba(15,23,42,.08)}
 799|.vl-code-label{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.55rem .85rem;background:#111827;border-bottom:1px solid #1e293b;color:#94a3b8;font:600 .72rem/1 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;text-transform:uppercase;letter-spacing:.08em}
 800|.vl-code-copy{border:1px solid #334155;border-radius:7px;padding:.3rem .55rem;background:#1e293b;color:#cbd5e1;font:600 .68rem/1 ui-sans-serif,system-ui,sans-serif;text-transform:none;letter-spacing:0;cursor:pointer}
 801|.vl-code-copy:hover{background:#334155;color:#fff}
 802|.vl-tok-comment{color:#64748b;font-style:italic}.vl-tok-string{color:#a7f3d0}.vl-tok-keyword{color:#c4b5fd}.vl-tok-number{color:#fcd34d}.vl-tok-function{color:#67e8f9}.vl-tok-property{color:#93c5fd}.vl-tok-operator{color:#fda4af}
 803|.vl-article pre{margin:0;overflow:auto;-webkit-overflow-scrolling:touch;padding:1.1rem 1.2rem;color:#e2e8f0;font:500 .9rem/1.75 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
 804|.vl-table-wrap{margin:1.5rem 0;overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #e2e8f0;border-radius:14px}
 805|.vl-article table{width:100%;border-collapse:collapse;min-width:520px;background:#fff}
 806|.vl-article th,.vl-article td{padding:.8rem 1rem;text-align:left;border-bottom:1px solid #e2e8f0}
 807|.vl-article th{background:#f8fafc;color:#0f172a;font-size:.9rem;font-weight:700}
 808|.vl-article tr:last-child td{border-bottom:0}
 809|.vl-article img{display:block;max-width:100%;height:auto;margin:1.5rem auto;border-radius:14px}
 810|.vl-toc{position:sticky;top:4.75rem;align-self:start;max-height:calc(100vh - 6rem);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#cbd5e1 transparent}
 811|.vl-toc a{display:block;padding:.35rem 0;color:#64748b;text-decoration:none;font-size:.82rem;line-height:1.4}
 812|.vl-toc a:hover{color:#0f172a}
 813|.vl-article .vl-lead{font-size:1.18rem;line-height:1.8;color:#475569}
 814|.vl-progress{position:fixed;top:68px;left:0;z-index:35;height:2px;background:#0f766e;transform-origin:left center}
 815|@media(max-width:767px){
 816|  .vl-progress{top:60px}
 817|  .vl-article{font-size:1rem;line-height:1.8}
 818|  .vl-article p{margin:1.1rem 0}
 819|  .vl-article h2{margin:2.35rem 0 .85rem;font-size:1.55rem;line-height:1.3}
 820|  .vl-article h3{margin:1.8rem 0 .7rem;font-size:1.18rem}
 821|  .vl-article blockquote{margin:1.35rem 0;padding:.8rem .95rem}
 822|  .vl-code-shell{margin:1.2rem 0;border-radius:12px}
 823|  .vl-code-label{padding:.5rem .7rem;font-size:.64rem}
 824|  .vl-code-copy{padding:.32rem .5rem}
 825|  .vl-article pre{padding:.9rem .85rem;font-size:.76rem;line-height:1.65}
 826|  .vl-table-wrap{margin:1.2rem 0;border-radius:12px}
 827|  .vl-article th,.vl-article td{padding:.7rem .8rem}
 828|  .vl-article .vl-lead{font-size:1.05rem;line-height:1.7}
 829|}
 830|.vl-action{display:inline-flex;align-items:center;gap:.45rem;border:1px solid #e2e8f0;border-radius:10px;padding:.5rem .7rem;background:#fff;color:#475569;font:500 .78rem/1 ui-sans-serif,system-ui,sans-serif}
 831|.vl-action:hover{border-color:#cbd5e1;color:#0f172a}
 832|@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.transition,.duration-500{transition:none!important;transition-duration:0ms!important}}
 833|`;
 834|function navIsActive(path:string,href:string){
 835|  if(href==="/blog") return path==="/blog" || path.startsWith("/blog/") || path.startsWith("/topics/") || path.startsWith("/tags/");
 836|  if(href==="/tools") return path==="/tools" || path.startsWith("/tools/");
 837|  if(href==="/projects") return path==="/projects" || path.startsWith("/projects/");
 838|  if(href==="/research") return path==="/research" || path.startsWith("/research/");
 839|  return path===href;
 840|}
 841|function SiteHeader(){
 842|  const [open,setOpen]=useState(false);
 843|  const path=location.pathname;
 844|  const links=[
 845|    ["/blog","Blog"],["/research","Research"],["/tools","Tools"],["/projects","Projects"],["/search","Search"],["/about","About"]
 846|  ];
 847|  useEffect(()=>{
 848|    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};
 849|    window.addEventListener("keydown",onKey);
 850|    document.body.style.overflow=open?"hidden":"";
 851|    return()=>{window.removeEventListener("keydown",onKey);document.body.style.overflow=""};
 852|  },[open]);
 853|  return <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
 854|    <nav className="max-w-6xl mx-auto px-4 sm:px-5 h-[60px] sm:h-[68px] flex items-center justify-between gap-3">
 855|      <a href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
 856|        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-950 text-[11px] font-bold tracking-tight text-white shadow-sm">VL</span>
 857|        <span className="hidden sm:block min-w-0">
 858|          <span className="block text-[15px] font-semibold tracking-tight text-slate-950">Vijevira Labs</span>
 859|          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Engineering · Research · Building</span>
 860|        </span>
 861|      </a>
 862|      <div className="hidden md:flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/70 p-1">
 863|        {links.map(([href,label])=><a key={href} href={href} aria-current={navIsActive(path,href)?"page":undefined} className={`rounded-full px-3.5 py-1.5 text-sm transition ${navIsActive(path,href)?"bg-white text-slate-950 shadow-sm":"text-slate-500 hover:text-slate-950"}`}>{label}</a>)}
 864|      </div>
 865|      <div className="md:hidden flex items-center gap-1.5">
 866|        <a href="/search" aria-label="Search" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
 867|          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
 868|        </a>
 869|        <button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={()=>setOpen(v=>!v)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50">{open?"×":"☰"}</button>
 870|      </div>
 871|    </nav>
 872|    {open&&<div className="md:hidden fixed inset-x-0 top-[60px] bottom-0 border-t border-slate-200 bg-white shadow-xl shadow-slate-900/5 overflow-y-auto">
 873|      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-4 grid gap-1">
 874|        <div className="mb-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">Explore engineering articles, technical research, developer tools, and projects.</div>
 875|        {links.map(([href,label])=><a key={href} href={href} aria-current={navIsActive(path,href)?"page":undefined} onClick={()=>setOpen(false)} className={`rounded-xl px-4 py-3 text-sm ${navIsActive(path,href)?"bg-slate-100 font-medium text-slate-950":"text-slate-600 hover:bg-slate-50"}`}>{label}</a>)}
 876|      </div>
 877|    </div>}
 878|  </header>;
 879|}
 880|function SectionHeader({eyebrow,title,description,href,linkLabel}:{eyebrow?:string,title:string,description?:string,href?:string,linkLabel?:string}){
 881|  return <div className="flex flex-wrap items-end justify-between gap-4">
 882|    <div>
 883|      {eyebrow&&<div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</div>}
 884|      <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{title}</h2>
 885|      {description&&<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
 886|    </div>
 887|    {href&&<a href={href} className="text-sm font-medium text-slate-600 hover:text-slate-950">{linkLabel||"View all"} →</a>}
 888|  </div>;
 889|}
 890|function Meta({children,className=""}:{children:any,className?:string}){return <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.08em] text-slate-400 ${className}`}>{children}</div>}
 891|function PostCard({post,featured=false}:{post:any,featured?:boolean}){
 892|  return <a href={"/blog/"+post.slug} className={`group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 ${featured?"md:grid md:grid-cols-[1.15fr_.85fr]":""}`}>
 893|    {post.cover_secure_url&&<div className={`overflow-hidden bg-slate-100 ${featured?"md:min-h-full":"aspect-[16/9]"}`}><img src={post.cover_secure_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"/></div>}
 894|    <div className={`flex h-full flex-col p-5 ${featured?"md:p-7 lg:p-8":"md:p-6"}`}>
 895|      <Meta><span>{post.content_type||"article"}</span><span>·</span><span>{post.category_name||"Uncategorized"}</span>{post.published_at&&<><span>·</span><span>{dateFmt(post.published_at)}</span></>}</Meta>
 896|      <h3 className={`mt-3 font-semibold tracking-tight text-slate-950 group-hover:text-teal-800 ${featured?"text-2xl leading-tight md:text-3xl lg:text-4xl":"text-xl leading-snug"}`}>{post.title}</h3>
 897|      {post.description&&<p className={`mt-3 leading-7 text-slate-600 ${featured?"text-base md:text-lg":"text-sm"}`}>{post.description}</p>}
 898|      <div className="mt-auto pt-5 text-sm font-medium text-slate-500">{post.reading_time?post.reading_time+" min read":"Read article"} <span className="transition-transform group-hover:translate-x-0.5 inline-block">→</span></div>
 899|    </div>
 900|  </a>;
 901|}
 902|function CollectionCard({item,kind}:{item:any,kind:"tools"|"projects"|"research"}){
 903|  const title=item.name||item.title;
 904|  const href=kind==="research"?"/research/"+item.id:"/"+kind+"/"+item.slug;
 905|  return <a href={href} className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5">
 906|    {kind==="projects"&&item.cover_secure_url&&<div className="aspect-[16/8] overflow-hidden bg-slate-100"><img src={item.cover_secure_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"/></div>}
 907|    <div className="flex h-full flex-col p-5 sm:p-6">
 908|      {kind==="tools"&&item.logo_url&&<img src={item.logo_url} alt="" loading="lazy" className="mb-5 h-11 w-11 rounded-xl border border-slate-200 bg-white object-contain p-1.5"/>}
 909|      <Meta><span>{kind==="tools"?(item.pricing_type||"Tool"):(kind==="projects"?(item.status||"Project"):"Research")}</span>{kind==="tools"&&item.category&&<><span>·</span><span>{item.category}</span></>}</Meta>
 910|      <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 group-hover:text-teal-800">{title}</h3>
 911|      {item.description&&<p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>}
 912|      {kind==="tools"&&item.free_tier&&<div className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800"><span className="font-semibold">Free tier:</span> {item.free_tier}</div>}
 913|      <span className="mt-auto pt-5 inline-block text-sm font-medium text-slate-500">Explore →</span>
 914|    </div>
 915|  </a>;
 916|}
 917|function EmptyState({title,description}:{title:string,description?:string}){return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center"><div className="text-sm font-medium text-slate-700">{title}</div>{description&&<p className="mt-2 text-sm text-slate-500">{description}</p>}</div>}
 918|function ArticleToc({headings}:{headings:any[]}){
 919|  const [active,setActive]=useState(headings[0]?.id||"");
 920|  useEffect(()=>{
 921|    const observer=new IntersectionObserver(entries=>{
 922|      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
 923|      if(visible[0]?.target?.id)setActive(visible[0].target.id);
 924|    },{rootMargin:"-96px 0px -62% 0px",threshold:[0,0.2,0.5,1]});
 925|    const els=headings.map(x=>document.getElementById(x.id)).filter(Boolean) as HTMLElement[];
 926|    els.forEach(el=>observer.observe(el));
 927|    return ()=>observer.disconnect();
 928|  },[headings.map(x=>x.id).join("|")]);
 929|  const links=headings;
 930|  return <>
 931|    <aside className="hidden lg:block vl-toc rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
 932|      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">On this page</div>
 933|      <nav className="mt-3">{links.map(x=><a key={x.id} href={"#"+x.id} className={`block rounded-lg border-l-2 py-1.5 text-[13px] leading-5 no-underline transition ${x.level===3?"pl-6":"pl-3"} ${active===x.id?"border-teal-600 bg-white font-medium text-slate-950":"border-transparent text-slate-500 hover:text-slate-900"}`}>{x.label}</a>)}</nav>
 934|    </aside>
 935|    <details className="lg:hidden rounded-xl border border-slate-200 bg-slate-50/75">
 936|      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-700">On this page</summary>
 937|      <nav className="border-t border-slate-200 px-3 py-2">{links.map(x=><a key={x.id} href={"#"+x.id} className="block px-2 py-2 text-sm text-slate-600">{x.label}</a>)}</nav>
 938|    </details>
 939|  </>;
 940|}
 941|function RouteSeo(){
 942|  const path=location.pathname;
 943|  const clean=path.replace(/\/+$/,"")||"/";
 944|  const defaults:any={
 945|    "/":["Vijevira Labs — Engineering, Research & Building","Practical engineering knowledge, research, developer tools, and project notes.","/"],
 946|    "/blog":["Blog — Vijevira Labs","Engineering articles, tutorials, guides, comparisons, and build notes from Vijevira Labs.","/blog"],
 947|    "/research":["Research — Vijevira Labs","Technical investigations, experiments, findings, and implementation research.","/research"],
 948|    "/tools":["Developer Tools — Vijevira Labs","Useful developer services, infrastructure, APIs, media, and free-tier tools.","/tools"],
 949|    "/projects":["Projects — Vijevira Labs","Applications, experiments, architecture work, and projects being built in the lab.","/projects"],
 950|    "/search":["Search — Vijevira Labs","Search engineering articles and technical notes from Vijevira Labs.","/search"],
 951|    "/about":["About — Vijevira Labs","About Vijevira Labs, an independent engineering lab for building, researching, and documenting software.","/about"]
 952|  };
 953|  let [title,description,canonical]=defaults[clean]||["Vijevira Labs — Engineering, Research & Building","Practical engineering knowledge, research, tools, and projects.","/"];
 954|  let robots=clean==="/search"?"noindex,follow":"index,follow";
 955|  if(clean.startsWith("/admin")){title="Admin — Vijevira Labs";robots="noindex,nofollow"}
 956|  if(clean.startsWith("/tags/")){title="Tag — Vijevira Labs";robots="index,follow"}
 957|  if(clean.startsWith("/topics/")){title="Topic — Vijevira Labs";robots="index,follow"}
 958|  if(clean.startsWith("/blog/")){title="Article — Vijevira Labs";description="Engineering article from Vijevira Labs.";canonical=clean}
 959|  if(clean.startsWith("/tools/")){title="Tool — Vijevira Labs";description="Developer tool notes from Vijevira Labs.";canonical=clean}
 960|  if(clean.startsWith("/projects/")){title="Project — Vijevira Labs";description="Project notes and implementation work from Vijevira Labs.";canonical=clean}
 961|  if(clean.startsWith("/research/")){title="Research — Vijevira Labs";description="Technical investigation from Vijevira Labs.";canonical=clean}
 962|  const jsonLd=clean==="/" ? {"@context":"https://schema.org","@type":"WebSite","name":"Vijevira Labs","url":SITE_ORIGIN,"description":description} : undefined;
 963|  return <Seo title={title} description={description} path={canonical} robots={robots} jsonLd={jsonLd}/>;
 964|}
 965|function siteShell(children:any){return <div className="min-h-screen bg-white text-slate-900"><style>{ARTICLE_STYLES}</style><a href="#main-content" className="vl-skip">Skip to content</a><RouteSeo/><SiteHeader/><div id="main-content" tabIndex={-1} className="vl-main">{children}</div><footer className="mt-20 border-t border-slate-200"><div className="max-w-6xl mx-auto px-5 py-10"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><div className="text-sm font-semibold text-slate-900">Vijevira Labs</div><div className="mt-1 text-sm text-slate-500">Engineering, Research &amp; Building.</div></div><div className="flex flex-wrap items-center gap-4 text-sm text-slate-500"><a href="/rss.xml" className="hover:text-slate-900">RSS</a><a href="/source" className="hover:text-slate-900">Source</a></div></div><div className="mt-6 text-xs text-slate-400">Practical engineering knowledge, research, tools, and projects.</div></div></footer></div>}
 966|function escapeHtml(value:string){
 967|  return String(value||"")
 968|    .replaceAll("&","&amp;")
 969|    .replaceAll("<","&lt;")
 970|    .replaceAll(">","&gt;")
 971|    .replaceAll('"',"&quot;")
 972|    .replaceAll("'","&#39;");
 973|}
 974|
 975|function safeUrl(value:string){
 976|  const url=String(value||"").trim();
 977|  if(/^https?:\/\//i.test(url) || url.startsWith("/") || url.startsWith("#")) return url;
 978|  return "#";
 979|}
 980|
 981|function headingId(value:string,index:number){
 982|  const base=String(value||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"") || "section";
 983|  return index ? `${base}-${index+1}` : base;
 984|}
 985|
 986|function inlineMd(value:string){
 987|  let s=escapeHtml(value);
 988|  const protectedParts:string[]=[];
 989|  s=s.replace(/`([^\`]+)`/g,(_,code)=>{const i=protectedParts.push(`<code class="vl-inline-code">${code}</code>`)-1;return `@@INLINE${i}@@`;});
 990|  s=s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_,alt,url)=>`<img src="${safeUrl(url)}" alt="${alt}" loading="lazy">`);
 991|  s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>`<a href="${safeUrl(url)}"${/^https?:\/\//i.test(String(url))?' target="_blank" rel="noreferrer"':''}>${label}</a>`);
 992|  s=s.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/__(.*?)__/g,"<strong>$1</strong>");
 993|  s=s.replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/_([^_]+)_/g,"<em>$1</em>");
 994|  s=s.replace(/~~(.*?)~~/g,"<del>$1</del>");
 995|  s=s.replace(/@@INLINE(\d+)@@/g,(_,i)=>protectedParts[Number(i)]);
 996|  return s;
 997|}
 998|
 999|function highlightCode(value:string,lang:string){
1000|  const language=String(lang||"text").toLowerCase();
1001|  let s=String(value||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
1002|  const tokens:string[]=[];
1003|  const protect=(cls:string,raw:string)=>{const i=tokens.push(`<span class="vl-tok vl-tok-${cls}">${raw}</span>`)-1;return `__VL_TOKEN_${i}__`;};
1004|  const commentPatterns=language==="python"||language==="py"?[/#[^\n]*/g]:language==="sql"?[/--[^\n]*/g,/\/\*[\s\S]*?\*\//g]:language==="css"||language==="scss"?[/\/\*[\s\S]*?\*\//g]:language==="html"||language==="xml"?[/&lt;!--[\s\S]*?--&gt;/g]:[/\/\/[^\n]*/g,/\/\*[\s\S]*?\*\//g];
1005|  for(const pattern of commentPatterns)s=s.replace(pattern,(m)=>protect("comment",m));
1006|  s=s.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\`(?:\\.|[^\`\\])*\`/g,m=>protect("string",m));
1007|  let keywordRe="";
1008|  if(language==="js"||language==="javascript"||language==="jsx"||language==="ts"||language==="typescript"||language==="tsx") keywordRe="as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|of|private|protected|public|return|set|static|super|switch|this|throw|try|type|typeof|undefined|var|void|while|with|yield";
1009|  else if(language==="python"||language==="py") keywordRe="and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|match|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield";
1010|  else if(language==="sql") keywordRe="SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|NULL|ORDER|BY|GROUP|LIMIT|OFFSET|UNION|DISTINCT";
1011|  else if(language==="bash"||language==="sh"||language==="shell") keywordRe="if|then|else|elif|fi|for|in|do|done|case|esac|function|select|while|until";
1012|  else if(language==="json") keywordRe="true|false|null";
1013|  if(keywordRe)s=s.replace(new RegExp(`\\b(${keywordRe})\\b`,language==="sql"?"g":"g"),m=>protect("keyword",m));
1014|  s=s.replace(/\b\d+(?:\.\d+)?\b/g,m=>protect("number",m));
1015|  s=s.replace(/\b[A-Za-z_$][\w$]*(?=\s*\()/g,m=>protect("function",m));
1016|  if(language==="json")s=s.replace(/(__VL_TOKEN_\d+__\s*:)/g,m=>protect("property",m));
1017|  s=s.replace(/(===|!==|==|!=|=>|<=|>=|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|[=+*\-/%<>!])/g,m=>protect("operator",m));
1018|  return s.replace(/__VL_TOKEN_(\d+)__/g,(_,i)=>tokens[Number(i)]);
1019|}
1020|function parseTableRow(line:string){
1021|  const cleaned=line.trim().replace(/^\|/,"").replace(/\|$/,"");
1022|  return cleaned.split("|").map(x=>x.trim());
1023|}
1024|
1025|function renderMarkdown(value:string){
1026|  const raw=String(value||"").replace(/\r\n?/g,"\n");
1027|  const codeBlocks:any[]=[];
1028|  const protectedText=raw.replace(/\`\`\`([a-zA-Z0-9_+-]*)\n([\s\S]*?)\`\`\`/g,(_,lang,code)=>{
1029|    const i=codeBlocks.push({lang:lang||"text",code:code.replace(/\n$/,"")} as any)-1;
1030|    return `@@BLOCK${i}@@`;
1031|  });
1032|  const lines=protectedText.split("\n");
1033|  const html:string[]=[];
1034|  const headings:{id:string,label:string,level:number}[]=[];
1035|  let i=0;
1036|
1037|  while(i<lines.length){
1038|    const line=lines[i];
1039|
1040|    if(!line.trim()){i++;continue;}
1041|
1042|    if(/^    |^\t/.test(line)){
1043|      const code:string[]=[];
1044|      while(i<lines.length && (/^    /.test(lines[i]) || /^\t/.test(lines[i]) || lines[i].trim()==="")){
1045|        code.push(lines[i].startsWith("    ")?lines[i].slice(4):lines[i].startsWith("\t")?lines[i].slice(1):"");
1046|        i++;
1047|      }
1048|      while(code.length && !code[code.length-1])code.pop();
1049|      html.push('<div class="vl-code-shell"><div class="vl-code-label"><span>text</span><button type="button" class="vl-code-copy">Copy</button></div><pre><code>'+highlightCode(code.join("\n"),"text")+'</code></pre></div>');
1050|      continue;
1051|    }
1052|
1053|    const block= line.match(/^@@BLOCK(\d+)@@$/);
1054|    if(block){
1055|      const item=codeBlocks[Number(block[1])] as any;
1056|      html.push(`<div class="vl-code-shell"><div class="vl-code-label"><span>${escapeHtml(item.lang)}</span><button type="button" class="vl-code-copy">Copy</button></div><pre><code>${highlightCode(item.code,item.lang)}</code></pre></div>`);
1057|      i++;continue;
1058|    }
1059|
1060|    const h=line.match(/^(#{1,3})\s+(.+)$/);
1061|    if(h){
1062|      const level=h[1].length;
1063|      const label=h[2].trim();
1064|      const id=headingId(label,headings.length);
1065|      headings.push({id,label,level});
1066|      html.push(`<h${level} id="${id}">${inlineMd(label)}</h${level}>`);
1067|      i++;continue;
1068|    }
1069|
1070|    if(/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)){html.push("<hr>");i++;continue;}
1071|
1072|    if(/^\|.*\|$/.test(line) && i+1<lines.length && /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(lines[i+1].trim())){
1073|      const header=parseTableRow(line);
1074|      i+=2;
1075|      const rows:string[][]=[];
1076|      while(i<lines.length && /^\|.*\|$/.test(lines[i].trim())){rows.push(parseTableRow(lines[i]));i++;}
1077|      html.push(`<div class="vl-table-wrap"><table><thead><tr>${header.map(x=>`<th>${inlineMd(x)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${header.map((_,j)=>`<td>${inlineMd(r[j]||"")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
1078|      continue;
1079|    }
1080|
1081|    if(/^\s*[-*+]\s+/.test(line)){
1082|      const items:string[]=[];
1083|      while(i<lines.length && /^\s*[-*+]\s+/.test(lines[i])){items.push(lines[i].replace(/^\s*[-*+]\s+/,""));i++;}
1084|      html.push(`<ul>${items.map(x=>`<li>${inlineMd(x)}</li>`).join("")}</ul>`);
1085|      continue;
1086|    }
1087|
1088|    if(/^\s*\d+\.\s+/.test(line)){
1089|      const items:string[]=[];
1090|      while(i<lines.length && /^\s*\d+\.\s+/.test(lines[i])){items.push(lines[i].replace(/^\s*\d+\.\s+/,""));i++;}
1091|      html.push(`<ol>${items.map(x=>`<li>${inlineMd(x)}</li>`).join("")}</ol>`);
1092|      continue;
1093|    }
1094|
1095|    if(/^\s*>\s?/.test(line)){
1096|      const items:string[]=[];
1097|      while(i<lines.length && /^\s*>\s?/.test(lines[i])){items.push(lines[i].replace(/^\s*>\s?/,""));i++;}
1098|      html.push(`<blockquote>${items.map(x=>inlineMd(x)).join("<br>")}</blockquote>`);
1099|      continue;
1100|    }
1101|
1102|    const paragraph:string[]=[line];
1103|    i++;
1104|    while(i<lines.length && lines[i].trim() && !/^#{1,3}\s+/.test(lines[i]) && !/^@@BLOCK\d+@@$/.test(lines[i]) && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) && !/^\s*>\s?/.test(lines[i]) && !/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(lines[i])){
1105|      paragraph.push(lines[i]);i++;
1106|    }
1107|    html.push(`<p>${paragraph.map(x=>inlineMd(x.trim())).join(" ")}</p>`);
1108|  }
1109|
1110|  return {html:html.join(""),headings};
1111|}
1112|
1113|function Md({value,article=false,toc=true}:{value:string,article?:boolean,toc?:boolean}){
1114|  const rootRef=useRef<HTMLDivElement>(null);
1115|  const source=article ? String(value||"").replace(/^#\s+.+(?:\r?\n|$)/,"") : value;
1116|  const rendered=renderMarkdown(source);
1117|  useEffect(()=>{
1118|    const buttons=Array.from(rootRef.current?.querySelectorAll(".vl-code-copy")||[]);
1119|    const cleanups=buttons.map(button=>{
1120|      const handler=async()=>{
1121|        const code=button.parentElement?.parentElement?.querySelector("pre")?.textContent||"";
1122|        try{await navigator.clipboard.writeText(code);button.textContent="Copied";setTimeout(()=>{button.textContent="Copy"},1200)}catch{button.textContent="Copy failed";setTimeout(()=>{button.textContent="Copy"},1200)}
1123|      };
1124|      button.addEventListener("click",handler);
1125|      return ()=>button.removeEventListener("click",handler);
1126|    });
1127|    return()=>cleanups.forEach(cleanup=>cleanup());
1128|  },[rendered.html]);
1129|  if(!article || !toc) return <div ref={rootRef} className="vl-article min-w-0" dangerouslySetInnerHTML={{__html:rendered.html}}/>;
1130|  const headings=rendered.headings.filter((x:any)=>x.level>=2 && x.level<=3);
1131|  return <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
1132|    {headings.length>0&&<ArticleToc headings={headings}/>}
1133|    <div ref={rootRef} className="vl-article min-w-0" dangerouslySetInnerHTML={{__html:rendered.html}}/>
1134|  </div>;
1135|}
1136|function useCreatorSettings(){
1137|  const [settings,setSettings]=useState<any>({
1138|    author_type:"Organization",
1139|    author_name:"Vijevira Labs",
1140|    author_job_title:"",
1141|    author_bio:"An independent engineering lab for building, researching, and documenting practical software systems.",
1142|    author_url:"",
1143|    author_image:"",
1144|    author_same_as:""
1145|  });
1146|  useEffect(()=>{apiFetch("/api/content/settings").then((x:any)=>setSettings((v:any)=>({...v,...x}))).catch(()=>{})},[]);
1147|  return settings;
1148|}
1149|function creatorSameAs(settings:any){
1150|  return String(settings.author_same_as||"").split(/[\n,]+/).map((x:string)=>x.trim()).filter((x:string)=>/^https?:\/\//i.test(x));
1151|}
1152|function HomePublic(){
1153|  const [posts,setPosts]=useState<any[]>([]);
1154|  useEffect(()=>{apiFetch("/api/posts?status=published&limit=6").then(setPosts).catch(()=>{})},[]);
1155|  const featured=posts.find(p=>!!p.featured)||posts[0],latest=posts.filter(p=>Number(p.id)!==Number(featured?.id)).slice(0,4);
1156|  return siteShell(<>
1157|    <main className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,.10),_transparent_38%),linear-gradient(180deg,#f8fafc_0%,#fff_74%)]">
1158|      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-14 sm:py-20 md:py-28">
1159|        <Meta><span>Vijevira Labs</span><span>·</span><span>Engineering · Research · Building</span></Meta>
1160|        <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl md:text-7xl md:leading-[1.02]">Practical engineering knowledge for people who build.</h1>
1161|        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">Technical articles, research, developer tools, and project notes drawn from real-world software systems, experiments, and implementation work.</p>
1162|        <div className="mt-9 flex flex-wrap gap-3">
1163|          <a href="/blog" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:w-auto">Read the blog →</a>
1164|          <a href="/projects" className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950 sm:w-auto">Explore projects</a>
1165|        </div>
1166|      </div>
1167|    </main>
1168|    {featured&&<section className="max-w-6xl mx-auto px-4 sm:px-5 pt-10 sm:pt-14 md:pt-20">
1169|      <SectionHeader eyebrow="Featured" title="Start here" description="The latest long-form work from Vijevira Labs."/>
1170|      <div className="mt-6"><PostCard post={featured} featured/></div>
1171|    </section>}
1172|    {latest.length>0&&<section className="max-w-6xl mx-auto px-4 sm:px-5 pt-12 sm:pt-16">
1173|      <SectionHeader eyebrow="Writing" title="Latest articles" href="/blog" linkLabel="View all articles"/>
1174|      <div className="mt-6 grid items-stretch md:grid-cols-2 gap-4 sm:gap-5">{latest.slice(0,4).map(p=><PostCard key={p.id} post={p}/>)}</div>
1175|    </section>}
1176|    <section className="max-w-6xl mx-auto px-4 sm:px-5 pt-12 sm:pt-16 pb-4">
1177|      <SectionHeader eyebrow="Explore" title="Inside the lab" description="Follow the work beyond articles."/>
1178|      <div className="mt-6 grid items-stretch md:grid-cols-3 gap-4 sm:gap-5">
1179|        <a href="/research" className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition hover:bg-white hover:shadow-lg hover:shadow-slate-900/5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Research</div><h3 className="mt-3 text-xl font-semibold text-slate-950">Investigations & experiments</h3><p className="mt-2 text-sm leading-6 text-slate-600">Technical questions, experiments, findings, and unfinished ideas.</p><span className="mt-5 inline-block text-sm font-medium text-slate-500">Explore research →</span></a>
1180|        <a href="/tools" className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition hover:bg-white hover:shadow-lg hover:shadow-slate-900/5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Tools</div><h3 className="mt-3 text-xl font-semibold text-slate-950">Developer tools & services</h3><p className="mt-2 text-sm leading-6 text-slate-600">Curated infrastructure, utilities, APIs, storage, AI tools, and free tiers.</p><span className="mt-5 inline-block text-sm font-medium text-slate-500">Explore tools →</span></a>
1181|        <a href="/projects" className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition hover:bg-white hover:shadow-lg hover:shadow-slate-900/5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Projects</div><h3 className="mt-3 text-xl font-semibold text-slate-950">Things being built</h3><p className="mt-2 text-sm leading-6 text-slate-600">Applications, experiments, architecture notes, and build logs.</p><span className="mt-5 inline-block text-sm font-medium text-slate-500">Explore projects →</span></a>
1182|      </div>
1183|    </section>
1184|  </>);
1185|}
1186|function BlogPublic(){
1187|  const [rows,setRows]=useState<any[]>([]),[clusters,setClusters]=useState<any[]>([]),[filter,setFilter]=useState("All"),[query,setQuery]=useState(""),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false);
1188|  useEffect(()=>{
1189|    setLoading(true);
1190|    Promise.all([
1191|      apiFetch("/api/posts?status=published&limit=100"),
1192|      apiFetch("/api/content/clusters")
1193|    ]).then(([posts,topicHubs])=>{setRows(posts);setClusters(topicHubs)}).catch(()=>setFailed(true)).finally(()=>setLoading(false));
1194|  },[]);
1195|  const categories=["All",...Array.from(new Set(rows.map(x=>x.category_name).filter(Boolean)))];
1196|  const filtered=rows.filter(x=>{const filterOk=filter==="All"||x.category_name===filter;const haystack=String(x.title||"")+" "+String(x.description||"")+" "+String(x.category_name||"");return filterOk&&(!query.trim()||haystack.toLowerCase().includes(query.trim().toLowerCase()))});
1197|  return siteShell(<main className="max-w-6xl mx-auto px-4 sm:px-5 py-10 sm:py-14 md:py-20">
1198|    <div className="max-w-3xl">
1199|      <Meta><span>Publication</span><span>·</span><span>{rows.length} {rows.length===1?"article":"articles"}</span></Meta>
1200|      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Blog</h1>
1201|      <p className="mt-3 text-lg leading-7 text-slate-600">Engineering articles, tutorials, guides, comparisons, and build notes.</p>
1202|    </div>
1203|    {!loading&&!failed&&clusters.length>0&&<section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><Meta><span>Topic hubs</span></Meta><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Follow a connected subject</h2><p className="mt-1 text-sm leading-6 text-slate-600">Start with a pillar article, then move through related implementation notes and projects.</p></div><a href="/search" className="text-sm font-medium text-teal-700 hover:text-teal-800">Search the lab →</a></div><div className="mt-5 grid gap-3 md:grid-cols-2">{clusters.map((x:any)=><a key={x.id} href={"/topics/"+x.slug} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><h3 className="font-semibold text-slate-950 group-hover:text-teal-800">{x.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{x.description}</p><span className="mt-4 inline-block text-sm font-medium text-slate-500">Explore hub →</span></a>)}</div></section>}
1204|    {!loading&&!failed&&rows.length>0&&<div className="mt-8 flex flex-col gap-3"><label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 shadow-sm focus-within:border-slate-400 focus-within:bg-white"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search articles, topics, or technologies…" aria-label="Search blog" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"/></label><div className="flex gap-2 overflow-x-auto pb-1">{categories.map(c=><button key={c} type="button" aria-pressed={filter===c} onClick={()=>setFilter(c)} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${filter===c?"border-slate-950 bg-slate-950 text-white":"border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"}`}>{c}</button>)}</div></div>}
1205|    {failed&&<div className="mt-8"><EmptyState title="Could not load articles." description="Please refresh the page and try again." /></div>}
1206|    {loading&&<div className="mt-8 space-y-3">{[1,2,3].map(i=><div key={i} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"/>)}</div>}
1207|    {!loading&&!failed&&filtered.length===0&&<div className="mt-8"><EmptyState title={rows.length?"No matching articles.":"No published articles yet."} description={rows.length?"Try a different search or category.":"New engineering writing will appear here."} /></div>}
1208|    {!loading&&!failed&&filtered.length>0&&<div className="mt-8 space-y-5">{filtered.map(p=><PostCard key={p.id} post={p}/>)}</div>}
1209|  </main>);
1210|}
1211|function ReadingProgress(){
1212|  const [progress,setProgress]=useState(0);
1213|  useEffect(()=>{
1214|    const update=()=>{const scrollable=document.documentElement.scrollHeight-window.innerHeight;setProgress(scrollable>0?Math.min(1,Math.max(0,window.scrollY/scrollable)):0)};
1215|    update();window.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);
1216|    return()=>{window.removeEventListener("scroll",update);window.removeEventListener("resize",update)};
1217|  },[]);
1218|  return <div className="vl-progress" aria-hidden="true" style={{width:(progress*100)+"%"}}/>;
1219|}
1220|function ArticleActions(){
1221|  const [copied,setCopied]=useState(false);
1222|  const copy=async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),1400)}catch{}};
1223|  const share=async()=>{if((navigator as any).share)try{await (navigator as any).share({title:document.title,url:location.href})}catch{}else copy()};
1224|  return <div className="mt-5 flex flex-wrap gap-2"><button type="button" className="vl-action" onClick={copy}>{copied?"Copied link":"Copy link"}</button><button type="button" className="vl-action" onClick={share}>Share</button></div>;
1225|}
1226|function PostPublic({slug}:{slug:string}){
1227|  const [p,setP]=useState<any>(null),[clusters,setClusters]=useState<any[]>([]);
1228|  const creatorSettings=useCreatorSettings();
1229|  useEffect(()=>{
1230|    apiFetch("/api/posts/slug/"+encodeURIComponent(slug)).then(async(row:any)=>{
1231|      setP(row);
1232|      try{setClusters(await apiFetch("/api/content/posts/"+row.id+"/clusters"))}catch{setClusters([])}
1233|    }).catch(()=>setP(false));
1234|  },[slug]);
1235|  if(p===false)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24"><EmptyState title="Post not found" description="The article may have moved or is no longer published." /></main>);
1236|  if(!p)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24 text-sm text-slate-500">Loading article…</main>);
1237|
1238|  const cats=p.categories||[];
1239|  const tags=p.tags||[];
1240|  const headings=renderMarkdown(String(p.content||"")).headings.filter((x:any)=>x.level>=2 && x.level<=3);
1241|  const seoTitle=p.seo_title||p.title+" — Vijevira Labs";
1242|  const seoDescription=p.seo_description||p.description||"Engineering article from Vijevira Labs.";
1243|  const articleUrl=SITE_ORIGIN+"/blog/"+encodeURIComponent(p.slug);
1244|  const publishedTime=schemaDate(p.published_at);
1245|  const modifiedTime=schemaDate(p.updated_at||p.published_at);
1246|  const jsonLd={"@context":"https://schema.org","@graph":[
1247|    {"@type":"BlogPosting","headline":p.title,"description":seoDescription,"datePublished":publishedTime,"dateModified":modifiedTime,"mainEntityOfPage":{"@type":"WebPage","@id":articleUrl},"author":creatorLdClient(creatorSettings),"publisher":publisherLdClient(),"url":articleUrl,"image":p.cover_secure_url?[p.cover_secure_url]:undefined,"inLanguage":"en"},
1248|    {"@type":"BreadcrumbList","itemListElement":[
1249|      {"@type":"ListItem","position":1,"name":"Home","item":SITE_ORIGIN+"/"},
1250|      {"@type":"ListItem","position":2,"name":"Blog","item":SITE_ORIGIN+"/blog"},
1251|      {"@type":"ListItem","position":3,"name":p.title,"item":articleUrl}
1252|    ]}
1253|  ]};
1254|
1255|  return siteShell(
1256|    <><Seo title={seoTitle} description={seoDescription} path={"/blog/"+p.slug} image={p.cover_secure_url||undefined} imageAlt={p.title} type="article" publishedTime={publishedTime} modifiedTime={modifiedTime} jsonLd={jsonLd}/><ReadingProgress/><main className="max-w-6xl mx-auto px-4 sm:px-5 pt-5 sm:pt-7 pb-14 sm:pb-16 md:pt-10 md:pb-24">
1257|      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-7 lg:gap-12 items-start">
1258|        {headings.length>0&&<ArticleToc headings={headings}/>} 
1259|        <article className="min-w-0">
1260|          <header className="max-w-4xl">
1261|            <a href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition hover:text-teal-700"><span aria-hidden="true">←</span> All articles</a>
1262|            <Meta className="mt-4">
1263|              <a href="/blog" className="text-teal-700 hover:text-teal-800">Blog</a>
1264|              <span>·</span>
1265|              <span>{p.content_type||"article"}</span>
1266|              {cats.slice(0,3).map((x:any)=><a key={x.id} href={"/topics/"+x.slug} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 normal-case tracking-normal text-slate-600 hover:border-slate-300 hover:text-slate-950">{x.name}</a>)}
1267|            </Meta>
1268|            <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] leading-[1.08] text-slate-950 sm:text-5xl sm:leading-[1.06] md:text-5xl lg:text-6xl">{p.title}</h1>
1269|            {p.description&&<p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">{p.description}</p>}
1270|            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
1271|              {p.published_at&&<time dateTime={publishedTime||p.published_at}>{dateFmt(p.published_at)}</time>}
1272|              {p.updated_at&&publishedTime&&modifiedTime&&modifiedTime!==publishedTime&&<><span>•</span><span>Updated {dateFmt(p.updated_at)}</span></>}
1273|              {p.reading_time&&<><span>•</span><span>{p.reading_time} min read</span></>}
1274|              {<><span>•</span><a href="/about" className="font-medium text-slate-600 hover:text-teal-700">By {creatorSettings.author_name||"Vijevira Labs"}</a></>}
1275|            </div>
1276|            <ArticleActions/>
1277|          </header>
1278|
1279|          {p.cover_secure_url&&<figure className="mt-7 sm:mt-9 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
1280|            <img src={p.cover_secure_url} alt={p.title} className="w-full max-h-[600px] object-cover"/>
1281|          </figure>}
1282|
1283|          <div className="mt-9 sm:mt-10 md:mt-14 max-w-3xl">
1284|            <Md value={p.content} article toc={false}/>
1285|          </div>
1286|
1287|          {tags.length>0&&<div className="mt-12 sm:mt-14 max-w-3xl border-t border-slate-200 pt-6">
1288|            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Topics & tags</div>
1289|            <div className="mt-3 flex flex-wrap gap-2">
1290|              {tags.map((x:any)=><a href={"/tags/"+x.slug} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-950" key={x.id}>{x.name}</a>)}
1291|            </div>
1292|          </div>}
1293|
1294|          {clusters.length>0&&<section className="mt-10 sm:mt-12 max-w-3xl border-t border-slate-200 pt-7">
1295|            <SectionHeader eyebrow="Part of a topic hub" title="Continue through the subject" description="This article is part of a connected reading path."/>
1296|            <div className="mt-4 grid gap-3 sm:grid-cols-2">{clusters.map((x:any)=><a key={x.id} href={"/topics/"+x.slug} className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-white hover:border-slate-300"><div className="text-sm font-semibold text-slate-950 group-hover:text-teal-800">{x.name}</div><p className="mt-1 text-xs leading-5 text-slate-500">{x.description}</p><span className="mt-3 inline-block text-xs font-semibold text-slate-500">Open topic hub →</span></a>)}</div>
1297|          </section>}
1298|
1299|          {p.related_posts?.length>0&&<section className="mt-12 sm:mt-14 border-t border-slate-200 pt-8">
1300|            <SectionHeader eyebrow="Continue reading" title="Related articles"/>
1301|            <div className="mt-5 grid md:grid-cols-2 gap-5">{p.related_posts.slice(0,2).map((x:any)=><PostCard key={x.id} post={x}/>)}</div>
1302|          </section>}
1303|
1304|          <div className="mt-10 flex flex-wrap gap-3">
1305|            <a href="/blog" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950">← All articles</a>
1306|            <a href="/search" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Search the lab</a>
1307|          </div>
1308|        </article>
1309|      </div>
1310|    </main></>
1311|  );
1312|}
1313|
1314|function dateFmt(s:any){return s?new Date(s).toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}):""}
1315|function CollectionPublic({kind}:{kind:"tools"|"projects"|"research"}){
1316|  const [rows,setRows]=useState<any[]>([]),[query,setQuery]=useState(""),[filter,setFilter]=useState("All"),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false);
1317|  useEffect(()=>{setLoading(true);setFailed(false);apiFetch(kind==="research"?"/api/content/research":"/api/content/"+kind).then(setRows).catch(()=>setFailed(true)).finally(()=>setLoading(false))},[kind]);
1318|  const meta=kind==="tools"?["Developer directory","Discover useful services, infrastructure, APIs, and free tiers."]:kind==="projects"?["Build log","Applications, experiments, architecture, and things being built."]:["Technical investigations","Experiments, findings, and research notes worth sharing."];
1319|  const filters=kind==="tools"?["All",...Array.from(new Set(rows.map(x=>x.category).filter(Boolean)))]:kind==="projects"?["All",...Array.from(new Set(rows.map(x=>x.status).filter(Boolean)))]:["All"];
1320|  const filtered=rows.filter(x=>{const haystack=String(x.name||x.title||"")+" "+String(x.description||"")+" "+String(x.category||"")+" "+String(x.status||"");const filterOk=filter==="All"||(kind==="tools"?x.category===filter:x.status===filter);return filterOk&&(!query.trim()||haystack.toLowerCase().includes(query.trim().toLowerCase()))});
1321|  return siteShell(<><Seo title={(kind==="tools"?"Developer Tools":kind==="projects"?"Projects":"Research")+" — Vijevira Labs"} description={meta[1]} path={"/"+kind} type="CollectionPage"/><main className="max-w-6xl mx-auto px-4 sm:px-5 py-10 sm:py-14 md:py-20">
1322|    <div className="max-w-3xl"><Meta><span>{meta[0]}</span>{!loading&&!failed&&<><span>·</span><span>{rows.length} {rows.length===1?kind==="research"?"note":kind.slice(0,-1):kind}</span></>}</Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{kind[0].toUpperCase()+kind.slice(1)}</h1><p className="mt-3 text-lg leading-7 text-slate-600">{meta[1]}</p></div>
1323|    {!loading&&!failed&&rows.length>0&&<div className="mt-8 flex flex-col gap-3 md:flex-row"><div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-2"><div className="flex items-center gap-2 px-1"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={kind==="tools"?"Search tools, services, and infrastructure…":"Search projects…"} aria-label={"Search "+kind} className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-slate-400"/></div></div>{filters.length>1&&<div className="flex gap-2 overflow-x-auto pb-1">{filters.map(f=><button key={f} type="button" aria-pressed={filter===f} onClick={()=>setFilter(f)} className={filter===f?"shrink-0 rounded-full border border-slate-950 bg-slate-950 px-3.5 py-2 text-xs font-medium text-white":"shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:border-slate-300"}>{f}</button>)}</div>}</div>}
1324|    {!loading&&!failed&&kind==="research"&&rows.length>0&&<div className="mt-8"><label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 shadow-sm focus-within:border-slate-400 focus-within:bg-white"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search research notes…" aria-label="Search research" className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-slate-400"/></label></div>}
1325|    {failed&&<div className="mt-9"><EmptyState title={"Could not load "+kind+"."} description="Please refresh the page and try again." /></div>}
1326|    {loading&&<div className="mt-9 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><div key={i} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"/> )}</div>}
1327|    {!loading&&!failed&&filtered.length>0&&<div className="mt-7 grid items-stretch gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map(x=><CollectionCard key={x.id} item={x} kind={kind}/>)}</div>}
1328|    {!loading&&!failed&&filtered.length===0&&<div className="mt-9"><EmptyState title={rows.length?"No matching "+kind+".":"No published "+kind+" yet."} description={rows.length?"Try a different search or filter.":"New work will appear here as it is published."} /></div>}
1329|  </main></>);
1330|}
1331|function DetailPublic({kind,slug}:{kind:"tools"|"projects",slug:string}){
1332|  const [x,setX]=useState<any>(null),[clusters,setClusters]=useState<any[]>([]);
1333|  useEffect(()=>{
1334|    apiFetch("/api/content/"+kind).then(async(rows:any[])=>{
1335|      const found=rows.find(r=>r.slug===slug);
1336|      if(!found){setX(false);return}
1337|      if(kind==="projects"){
1338|        const project=await apiFetch("/api/content/projects/"+found.id);
1339|        setX(project);
1340|        try{setClusters(await apiFetch("/api/content/projects/"+found.id+"/clusters"))}catch{setClusters([])}
1341|      } else setX(found);
1342|    }).catch(()=>setX(false));
1343|  },[kind,slug]);
1344|  if(!x)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24 text-slate-500">{x===false?<EmptyState title="Not found" description="This item may have moved or is no longer published."/>:"Loading…"}</main>);
1345|  const detailLd=kind==="projects"?{"@context":"https://schema.org","@type":"SoftwareApplication","name":x.name,"description":x.description||"","url":SITE_ORIGIN+"/"+kind+"/"+x.slug,"applicationCategory":"DeveloperApplication","operatingSystem":"Web","isPartOf":{"@type":"WebSite","name":"Vijevira Labs","url":SITE_ORIGIN}}:{"@context":"https://schema.org","@type":"WebPage","name":x.name,"description":x.description||"","url":SITE_ORIGIN+"/"+kind+"/"+x.slug,"isPartOf":{"@type":"WebSite","name":"Vijevira Labs","url":SITE_ORIGIN}};
1346|  if(kind==="tools") return siteShell(<><Seo title={x.name+" — Vijevira Labs"} description={x.description||""} path={"/tools/"+x.slug} jsonLd={detailLd}/><main className="max-w-5xl mx-auto px-4 sm:px-5 py-10 sm:py-14 md:py-20"><article className="max-w-4xl">
1347|    <Meta><a href="/tools" className="text-teal-700 hover:text-teal-800">tools</a><span>·</span><span>{x.pricing_type||"Developer tool"}</span></Meta>
1348|    {x.logo_url&&<img src={x.logo_url} alt="" className="mt-6 h-14 w-14 rounded-2xl border border-slate-200 bg-white object-contain p-2"/>}
1349|    <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{x.name}</h1>
1350|    {x.description&&<p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{x.description}</p>}
1351|    <div className="mt-6 flex flex-wrap gap-2">{x.website_url&&<a className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white" href={x.website_url} target="_blank" rel="noreferrer">Website ↗</a>}</div>
1352|    <div className="mt-10 grid sm:grid-cols-2 gap-4"><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Category</div><div className="mt-2 text-sm font-medium text-slate-900">{x.category||"—"}</div></div><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Pricing</div><div className="mt-2 text-sm font-medium text-slate-900">{x.pricing_type||"—"}</div></div></div>
1353|    {x.free_tier&&<section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Free tier</div><p className="mt-2 text-sm leading-6 text-emerald-900">{x.free_tier}</p></section>}
1354|    {x.my_experience&&<section className="mt-10 border-t border-slate-200 pt-8"><SectionHeader eyebrow="Field notes" title="My experience"/><div className="mt-4 max-w-3xl"><Md value={x.my_experience}/></div></section>}
1355|    {x.limitations&&<section className="mt-10 border-t border-slate-200 pt-8"><SectionHeader eyebrow="Caveats" title="Limitations"/><div className="mt-4 max-w-3xl"><Md value={x.limitations}/></div></section>}
1356|    {x.long_description&&<section className="mt-10 border-t border-slate-200 pt-8"><SectionHeader eyebrow="Overview" title="More about this tool"/><div className="mt-4 max-w-3xl"><Md value={x.long_description}/></div></section>}
1357|    <div className="mt-10"><a href="/tools" className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">← All tools</a></div>
1358|  </article></main></>);
1359|
1360|  const stack=["Val Town","SQLite","Deno","Val Town OAuth"];
1361|  const security=["Public URL validation","Private/reserved address blocking","30s outbound timeout","No automatic redirect following"];
1362|  const roadmap=[["Folders","Organize scheduled work into durable project contexts."],["Notifications","Surface failures without requiring the dashboard to be open."],["Failure rules","Automatically disable or react to repeatedly failing jobs."],["Status pages","Expose monitored service health as a shareable surface."],["API access","Add API keys and a REST API for automation."],["Shorter intervals","Move scheduler cadence beyond the current Val Town Free constraint."]];
1363|  return siteShell(<><Seo title="CronDeck — A Developer-Focused Cron Scheduler & Monitor — Vijevira Labs" description={x.description||""} path="/projects/crondeck" jsonLd={detailLd}/>
1364|    <main className="max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-10 md:py-16">
1365|      <article>
1366|        <Meta><a href="/projects" className="text-teal-700 hover:text-teal-800">Projects</a><span>·</span><span>Flagship project</span><span>·</span><span className="capitalize">{x.status||"building"}</span></Meta>
1367|        <div className="mt-5 max-w-4xl rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-7 md:p-8">
1368|          <h1 className="text-4xl font-bold tracking-[-0.03em] text-slate-950 sm:text-5xl md:text-6xl">CronDeck</h1>
1369|          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{x.description}</p>
1370|          <div className="mt-6 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
1371|            <a href={x.demo_url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-medium text-white shadow-sm">Open live demo ↗</a>
1372|            <a href={x.repository_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700">Read source ↗</a>
1373|          </div>
1374|        </div>
1375|
1376|        <div className="mt-7 sm:mt-10 grid gap-3 grid-cols-2 lg:grid-cols-4">
1377|          {[["Scheduler","15 min","V1 cadence on Val Town Free"],["Database","SQLite","Small shared relational model"],["Auth","OAuth","Val Town OAuth in V1"],["Runtime","Val Town","Production deployment"]].map(([label,value,sub])=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div><div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{value}</div><div className="mt-1 text-xs leading-5 text-slate-500">{sub}</div></div>)}
1378|        </div>
1379|
1380|        {x.cover_secure_url?<figure className="mt-7 sm:mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100"><img src={x.cover_secure_url} alt={x.cover_alt||x.name} className="w-full max-h-[600px] object-cover"/></figure>:
1381|        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-6 md:p-10">
1382|          <div className="flex items-center justify-between"><div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-300">Architecture at a glance</div><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">A deliberately small V1: one web application, one scheduled worker, and one SQLite boundary.</p></div><span className="rounded-full border border-slate-700 px-3 py-1 text-[10px] font-medium text-slate-300">V1</span></div>
1383|          <div className="mt-8 grid gap-3 md:grid-cols-5 md:items-center">
1384|            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4"><div className="text-xs font-semibold text-white">Browser</div><div className="mt-1 text-[10px] text-slate-400">Dashboard + job controls</div></div>
1385|            <div className="hidden md:block text-center text-slate-500">→</div>
1386|            <div className="rounded-2xl border border-teal-500/40 bg-teal-500/10 p-4"><div className="text-xs font-semibold text-teal-200">Val Town app</div><div className="mt-1 text-[10px] text-slate-300">HTTP routes + auth</div></div>
1387|            <div className="hidden md:block text-center text-slate-500">↕</div>
1388|            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4"><div className="text-xs font-semibold text-white">SQLite</div><div className="mt-1 text-[10px] text-slate-400">Jobs + executions</div></div>
1389|          </div>
1390|          <div className="mt-3 grid gap-3 md:grid-cols-3 md:items-center">
1391|            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:col-start-2"><div className="text-xs font-semibold text-white">Scheduler interval</div><div className="mt-1 text-[10px] text-slate-400">Find → claim → execute → record → schedule next run</div></div>
1392|            <div className="hidden md:block text-center text-slate-500">→</div>
1393|            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4"><div className="text-xs font-semibold text-white">Target HTTP service</div><div className="mt-1 text-[10px] text-slate-400">Validated outbound request</div></div>
1394|          </div>
1395|        </section>}
1396|
1397|        <div className="mt-10 sm:mt-12 grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
1398|          <div>
1399|            {x.content&&<div className="vl-prose"><Md value={x.content}/></div>}
1400|          </div>
1401|          <aside className="order-first lg:order-none space-y-4 lg:sticky lg:top-24">
1402|            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Project state</div><div className="mt-2 text-lg font-semibold capitalize text-slate-950">{x.status||"building"}</div><p className="mt-2 text-xs leading-5 text-slate-500">This page documents the implementation as it evolves.</p></div>
1403|            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Built with</div><div className="mt-3 flex flex-wrap gap-2">{stack.map(s=><span key={s} className="rounded-full bg-slate-100 px-2.5 py-1.5 text-xs text-slate-700">{s}</span>)}</div></div>
1404|            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Source</div><a href={x.repository_url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-xs font-medium text-teal-700 hover:text-teal-800">{x.repository_url}</a></div>
1405|          </aside>
1406|        </div>
1407|
1408|        <section className="mt-14 border-t border-slate-200 pt-10">
1409|          <SectionHeader eyebrow="Security boundary" title="Outbound requests are the hard part"/>
1410|          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">CronDeck executes HTTP requests on behalf of users, so target validation is treated as a product boundary rather than a UI-only check.</p>
1411|          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{security.map(s=><div key={s} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm font-medium text-slate-800">{s}</div>)}</div>
1412|        </section>
1413|
1414|        <section className="mt-14 border-t border-slate-200 pt-10">
1415|          <SectionHeader eyebrow="Connected knowledge" title="Read the engineering trail"/>
1416|          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">The project is connected to implementation articles and research notes so product decisions can be read alongside the code.</p>
1417|          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{(x.articles||[]).map((a:any)=><a key={a.id} href={"/blog/"+a.slug} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"><Meta><span>{a.content_type||"article"}</span>{a.published_at&&<><span>·</span><span>{dateFmt(a.published_at)}</span></>}</Meta><h3 className="mt-2 text-base font-semibold leading-6 text-slate-950 group-hover:text-teal-800">{a.title}</h3>{a.description&&<p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-3">{a.description}</p>}</a>)}</div>
1418|        </section>
1419|
1420|        {(x.research||[]).length>0&&<section className="mt-14 border-t border-slate-200 pt-10">
1421|          <SectionHeader eyebrow="Research" title="Questions still being investigated"/>
1422|          <div className="mt-6 grid gap-4 md:grid-cols-2">{x.research.map((r:any)=><a key={r.id} href={"/research/"+r.id} className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-slate-300"><Meta><span className="capitalize">{r.status}</span></Meta><h3 className="mt-2 text-base font-semibold text-slate-950 group-hover:text-teal-800">{r.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-4">{String(r.content||"").split("\n")[0]}</p></a>)}</div>
1423|        </section>}
1424|
1425|        <section className="mt-14 border-t border-slate-200 pt-10">
1426|          <SectionHeader eyebrow="Roadmap" title="Where CronDeck goes next"/>
1427|          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{roadmap.map(([name,copy])=><div key={name} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm font-semibold text-slate-950">{name}</div><p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p></div>)}</div>
1428|        </section>
1429|
1430|        {clusters.length>0&&<section className="mt-14 border-t border-slate-200 pt-10">
1431|          <SectionHeader eyebrow="Topic coverage" title="CronDeck in the wider lab" description="Follow the engineering notes connected to this project."/>
1432|          <div className="mt-5 grid gap-3 sm:grid-cols-2">{clusters.map((x:any)=><a key={x.id} href={"/topics/"+x.slug} className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 hover:bg-white hover:border-slate-300"><Meta><span>{x.role==="pillar"?"Pillar project":"Related project"}</span></Meta><h2 className="mt-2 font-semibold text-slate-950 group-hover:text-teal-800">{x.name}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{x.description}</p><span className="mt-4 inline-block text-xs font-semibold text-slate-500">Explore topic hub →</span></a>)}</div>
1433|        </section>}
1434|
1435|        <div className="mt-14 flex flex-wrap gap-3 border-t border-slate-200 pt-8">
1436|          <a href={x.demo_url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">Open CronDeck ↗</a>
1437|          <a href={x.repository_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">View repository ↗</a>
1438|          <a href="/projects" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">← All projects</a>
1439|        </div>
1440|      </article>
1441|    </main>
1442|  </>);
1443|}
1444|function ResearchPublic(){
1445|  const [rows,setRows]=useState<any[]>([]);
1446|  useEffect(()=>{apiFetch("/api/content/research").then(setRows).catch(()=>{})},[]);
1447|  return siteShell(<><Seo title="Research — Vijevira Labs" description="Technical investigations, experiments, findings, and implementation research." path="/research" type="CollectionPage"/><main className="max-w-6xl mx-auto px-5 py-14 md:py-20">
1448|    <div className="max-w-3xl"><Meta><span>Technical investigations</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Research</h1><p className="mt-3 text-lg leading-7 text-slate-600">Questions, experiments, implementation findings, and technical investigations.</p></div>
1449|    {rows.length>0?<div className="mt-9 grid md:grid-cols-2 lg:grid-cols-3 gap-5">{rows.map(x=><CollectionCard key={x.id} item={x} kind="research"/>)}</div>:<div className="mt-9"><EmptyState title="No published research yet." description="Research notes will appear here as investigations are completed." /></div>}
1450|  </main></>);
1451|}
1452|function ResearchDetailPublic({id}:{id:string}){
1453|  const [x,setX]=useState<any>(null);
1454|  const creatorSettings=useCreatorSettings();
1455|  useEffect(()=>{apiFetch("/api/content/research/"+id).then(setX).catch(()=>setX(false))},[id]);
1456|  if(!x)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24 text-slate-500">{x===false?<EmptyState title="Research not found" description="This investigation may have moved or is not published yet."/>:"Loading…"}</main>);
1457|  const publishedTime=schemaDate(x.published_at);
1458|  const modifiedTime=schemaDate(x.updated_at||x.published_at);
1459|  const researchLd={"@context":"https://schema.org","@type":"BlogPosting","headline":x.title,"description":x.description||"","datePublished":publishedTime,"dateModified":modifiedTime,"mainEntityOfPage":{"@type":"WebPage","@id":SITE_ORIGIN+"/research/"+x.id},"author":creatorLdClient(creatorSettings),"publisher":publisherLdClient(),"url":SITE_ORIGIN+"/research/"+x.id,"image":x.cover_secure_url?[x.cover_secure_url]:undefined,"inLanguage":"en"};
1460|  return siteShell(<><Seo title={x.title+" — Vijevira Labs"} description={x.description||""} path={"/research/"+x.id} image={x.cover_secure_url||undefined} imageAlt={x.title} type="article" publishedTime={publishedTime} modifiedTime={modifiedTime} jsonLd={researchLd}/><main className="max-w-5xl mx-auto px-4 sm:px-5 py-10 sm:py-14 md:py-20"><article className="max-w-4xl">
1461|    <Meta><a href="/research" className="text-teal-700 hover:text-teal-800">Research</a>{x.published_at&&<><span>·</span><time dateTime={publishedTime||x.published_at}>{dateFmt(x.published_at)}</time></>}{modifiedTime&&publishedTime&&modifiedTime!==publishedTime&&<><span>·</span><span>Updated {dateFmt(x.updated_at)}</span></>}</Meta>
1462|    <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{x.title}</h1>
1463|    {x.description&&<p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{x.description}</p>}
1464|    <div className="mt-12 border-t border-slate-200 pt-10"><Md value={x.content} article/></div>
1465|    <a href="/research" className="mt-10 inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950">← All research</a>
1466|  </article></main></>);
1467|}
1468|function SearchPublic(){
1469|  const [rows,setRows]=useState<any[]>([]),[q,setQ]=useState(new URLSearchParams(location.search).get("q")||""),[loading,setLoading]=useState(false),[failed,setFailed]=useState(false),[searched,setSearched]=useState(Boolean(new URLSearchParams(location.search).get("q")));
1470|  const run=async(e:any)=>{e.preventDefault();const term=q.trim();if(!term){setRows([]);setSearched(false);history.replaceState(null,"","/search");return}setLoading(true);setFailed(false);setSearched(true);history.replaceState(null,"","/search?q="+encodeURIComponent(term));try{setRows(await apiFetch("/api/posts?status=published&limit=100&q="+encodeURIComponent(term)))}catch{setRows([]);setFailed(true)}finally{setLoading(false)}};
1471|  return siteShell(<><Seo title="Search — Vijevira Labs" description="Search engineering articles and technical notes from Vijevira Labs." path="/search" robots="noindex,follow"/><main className="max-w-5xl mx-auto px-5 py-14 md:py-20">
1472|    <div className="max-w-3xl"><Meta><span>Knowledge search</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Search the lab</h1><p className="mt-3 text-lg leading-7 text-slate-600">Find articles across Vijevira Labs.</p></div>
1473|    <form onSubmit={run} className="mt-8 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-2 shadow-sm sm:flex-row">
1474|      <div className="flex min-w-0 flex-1 items-center gap-2 px-2"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search engineering topics, articles, and guides…" aria-label="Search articles" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"/></div>
1475|      <button disabled={loading} className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{loading?"Searching…":"Search"}</button>
1476|    </form>
1477|    {searched&&!loading&&!failed&&<div aria-live="polite" className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500"><span>{rows.length} {rows.length===1?"result":"results"} for <span className="font-medium text-slate-900">“{q}”</span></span><button type="button" onClick={()=>{setQ("");setRows([]);setSearched(false);history.replaceState(null,"","/search")}} className="font-medium text-teal-700 hover:text-teal-800">Clear search</button></div>}
1478|    {failed&&<div className="mt-8"><EmptyState title="Search could not be completed." description="Please try again in a moment." /></div>}
1479|    {loading&&<div className="mt-5 space-y-3">{[1,2,3].map(i=><div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"/>)}</div>}
1480|    {!loading&&!failed&&rows.length>0&&<div className="mt-5 space-y-3">{rows.map(x=><a key={x.id} href={"/blog/"+x.slug} className="group block rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-slate-300 hover:shadow-md"><Meta><span>{x.content_type||"article"}</span><span>·</span><span>{x.category_name||"Uncategorized"}</span>{x.published_at&&<><span>·</span><span>{dateFmt(x.published_at)}</span></>}{x.reading_time&&<><span>·</span><span>{x.reading_time} min read</span></>}</Meta><h2 className="mt-2 text-lg font-semibold leading-6 text-slate-950 group-hover:text-teal-800 sm:text-xl">{x.title}</h2>{x.description&&<p className="mt-2 text-sm leading-6 text-slate-600">{x.description}</p>}<span className="mt-4 inline-block text-sm font-medium text-slate-500">Read article →</span></a>)}</div>}
1481|    {!loading&&!failed&&searched&&rows.length===0&&<div className="mt-6"><EmptyState title="No matching articles." description="Try a broader term, a technology name, or a concept such as scheduling, databases, or DNS." /></div>}
1482|    {!searched&&!loading&&<div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 sm:p-8"><div className="text-sm font-semibold text-slate-900">Search across the lab</div><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Search published engineering articles and jump directly into the long-form knowledge base.</p><div className="mt-4 flex flex-wrap gap-2">{["Cron jobs","SQLite","AI","DNS","PostgreSQL","Redis"].map(term=><button key={term} type="button" onClick={()=>{setQ(term);setTimeout(()=>document.querySelector("form")?.requestSubmit(),0)}} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-950">{term}</button>)}</div></div>}
1483|  </main></>);
1484|}
1485|function AboutPublic(){
1486|  const creatorSettings=useCreatorSettings();
1487|  const name=creatorSettings.author_name||"Vijevira Labs";
1488|  const type=creatorSettings.author_type||"Organization";
1489|  const bio=creatorSettings.author_bio||"An independent engineering lab for building, researching, and documenting practical software systems.";
1490|  const links=creatorSameAs(creatorSettings);
1491|  const creator=creatorLdClient(creatorSettings);
1492|  const aboutLd={"@context":"https://schema.org","@graph":[
1493|    {"@type":"AboutPage","name":"About Vijevira Labs","description":"About Vijevira Labs and its public creator profile.","url":SITE_ORIGIN+"/about","mainEntity":{"@id":SITE_ORIGIN+"/about#creator"}},
1494|    {"@type":"ProfilePage","@id":SITE_ORIGIN+"/about#profile","name":name+" — Creator Profile","description":bio,"url":SITE_ORIGIN+"/about",mainEntity:creator}
1495|  ]};
1496|  return siteShell(<><Seo title={name==="Vijevira Labs"?"About Vijevira Labs — Engineering, Research & Building":"About "+name+" — Vijevira Labs"} description={bio} path="/about" type="AboutPage" jsonLd={aboutLd}/>
1497|    <main className="max-w-4xl mx-auto px-4 sm:px-5 py-12 sm:py-16 md:py-20">
1498|      <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 md:p-10">
1499|        <Meta><span>Creator profile</span><span>·</span><span>{type}</span></Meta>
1500|        {creatorSettings.author_image&&<img src={creatorSettings.author_image} alt={name} className="mt-6 h-20 w-20 rounded-2xl border border-slate-200 bg-white object-cover shadow-sm"/>}
1501|        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{name}</h1>
1502|        {creatorSettings.author_job_title&&<p className="mt-2 text-sm font-medium text-teal-700">{creatorSettings.author_job_title}</p>}
1503|        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{bio}</p>
1504|        {(creatorSettings.author_url||links.length>0)&&<div className="mt-6 flex flex-wrap gap-2">
1505|          {creatorSettings.author_url&&<a href={creatorSettings.author_url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">Creator profile ↗</a>}
1506|          {links.map((url:string)=><a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-950">{new URL(url).hostname.replace(/^www\./,"")} ↗</a>)}
1507|        </div>}
1508|      </section>
1509|      <section className="mt-12 sm:mt-14">
1510|        <div className="max-w-3xl"><Meta><span>About the lab</span></Meta><h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">What happens here</h2><div className="mt-6 space-y-5 text-base leading-7 text-slate-600"><p>Vijevira Labs is an independent engineering lab for building, researching, documenting, and sharing practical software systems.</p><p>Content connects tools, technologies, projects, experiments, and production lessons so technical knowledge stays useful beyond a single post.</p></div></div>
1511|        <div className="mt-10 grid gap-4 md:grid-cols-3">
1512|          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Build</div><h3 className="mt-3 font-semibold text-slate-950">Projects & implementation</h3><p className="mt-2 text-sm leading-6 text-slate-600">Projects and implementation notes from systems being built and tested.</p></div>
1513|          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Investigate</div><h3 className="mt-3 font-semibold text-slate-950">Research & experiments</h3><p className="mt-2 text-sm leading-6 text-slate-600">Technical questions, experiments, trade-offs, and findings.</p></div>
1514|          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Document</div><h3 className="mt-3 font-semibold text-slate-950">Durable engineering notes</h3><p className="mt-2 text-sm leading-6 text-slate-600">Articles designed to remain useful after the original problem is solved.</p></div>
1515|        </div>
1516|      </section>
1517|    </main>
1518|  </>);
1519|}
1520|function TopicPublic({slug}:{slug:string}){
1521|  const [cluster,setCluster]=useState<any>(null),[category,setCategory]=useState<any>(null),[posts,setPosts]=useState<any[]>([]),[loading,setLoading]=useState(true);
1522|  useEffect(()=>{
1523|    setLoading(true);setCluster(null);setCategory(null);setPosts([]);
1524|    apiFetch("/api/content/clusters/"+encodeURIComponent(slug))
1525|      .then(setCluster)
1526|      .catch(()=>apiFetch("/api/taxonomy/categories").then((rows:any[])=>{
1527|        const row=rows.find((x:any)=>x.slug===slug);
1528|        if(!row)throw new Error("not-found");
1529|        setCategory(row);
1530|        return apiFetch("/api/posts?status=published&limit=100&category_id="+encodeURIComponent(row.id)).then(setPosts);
1531|      }))
1532|      .catch(()=>{setCluster(false);setCategory(false)})
1533|      .finally(()=>setLoading(false));
1534|  },[slug]);
1535|  if(loading)return siteShell(<main className="max-w-5xl mx-auto px-5 py-24 text-sm text-slate-500">Loading topic…</main>);
1536|  if(cluster===false&&category===false)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24"><EmptyState title="Topic not found" /></main>);
1537|  if(category){
1538|    return siteShell(<><Seo title={category.name+" — Vijevira Labs"} description={category.description||("Articles about "+category.name+" from Vijevira Labs.")} path={"/topics/"+category.slug} type="CollectionPage"/><main className="max-w-5xl mx-auto px-5 py-14 md:py-20">
1539|      <div className="max-w-3xl"><Meta><span>Topic</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{category.name}</h1>{category.description&&<p className="mt-3 text-lg leading-7 text-slate-600">{category.description}</p>}</div>
1540|      {posts.length>0?<div className="mt-9 space-y-5">{posts.map(x=><PostCard key={x.id} post={x}/>)}</div>:<div className="mt-9"><EmptyState title="No published articles in this topic yet." /></div>}
1541|    </main></>);
1542|  }
1543|  const pillars=(cluster?.posts||[]).filter((x:any)=>x.role==="pillar"),supporting=(cluster?.posts||[]).filter((x:any)=>x.role!=="pillar");
1544|  return siteShell(<><Seo title={cluster.name+" — Vijevira Labs"} description={cluster.description||cluster.intro||""} path={"/topics/"+cluster.slug} type="CollectionPage"/><main className="max-w-6xl mx-auto px-4 sm:px-5 py-10 sm:py-14 md:py-20">
1545|    <div className="max-w-3xl"><Meta><span>Topic hub</span><span>·</span><span>{(cluster.posts||[]).length} articles</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{cluster.name}</h1><p className="mt-4 text-lg leading-8 text-slate-600">{cluster.intro||cluster.description}</p></div>
1546|    {pillars.length>0&&<section className="mt-10"><Meta><span>Pillar reading</span></Meta><div className="mt-4 grid gap-5 lg:grid-cols-2">{pillars.map((p:any)=><PostCard key={p.id} post={p} featured/>)}</div></section>}
1547|    {supporting.length>0&&<section className="mt-12"><SectionHeader eyebrow="Continue" title="Supporting articles" description="Follow the adjacent concepts and implementation details."/><div className="mt-6 space-y-5">{supporting.map((p:any)=><PostCard key={p.id} post={p}/>)}</div></section>}
1548|    {(cluster.projects||[]).length>0&&<section className="mt-12"><SectionHeader eyebrow="Built alongside the topic" title="Projects"/><div className="mt-6 grid gap-5 md:grid-cols-2">{cluster.projects.map((p:any)=><a key={p.id} href={"/projects/"+p.slug} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><Meta><span>{p.status||"project"}</span></Meta><h2 className="mt-3 text-xl font-semibold text-slate-950 group-hover:text-teal-800">{p.name}</h2>{p.description&&<p className="mt-2 text-sm leading-6 text-slate-600">{p.description}</p>}<span className="mt-5 inline-block text-sm font-medium text-slate-500">View project →</span></a>)}</div></section>}
1549|    {(cluster.tags||[]).length>0&&<section className="mt-12"><Meta><span>Concepts in this cluster</span></Meta><div className="mt-4 flex flex-wrap gap-2">{cluster.tags.map((t:any)=><a key={t.id} href={"/tags/"+t.slug} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300 hover:text-slate-950">{t.name}</a>)}</div></section>}
1550|    {(cluster.technologies||[]).length>0&&<section className="mt-9"><Meta><span>Technologies</span></Meta><div className="mt-4 flex flex-wrap gap-2">{cluster.technologies.map((t:any)=><span key={t.id} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600">{t.name}</span>)}</div></section>}
1551|    {(cluster.related_clusters||[]).length>0&&<section className="mt-14 border-t border-slate-200 pt-10"><Meta><span>Related topic hubs</span></Meta><div className="mt-4 grid gap-3 sm:grid-cols-2">{cluster.related_clusters.map((x:any)=><a key={x.id} href={"/topics/"+x.slug} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 hover:bg-white hover:border-slate-300"><h2 className="font-semibold text-slate-950">{x.name}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{x.description}</p></a>)}</div></section>}
1552|  </main></>);
1553|}
1554|
1555|function NotFoundPublic(){
1556|  const path=window.location.pathname;
1557|  return siteShell(<><Seo title="Page not found — Vijevira Labs" description="The page you requested could not be found." path={path} robots="noindex,follow"/><main className="max-w-3xl mx-auto px-5 py-20 sm:py-24">
1558|    <Meta><span>404</span><span>·</span><span>Page not found</span></Meta>
1559|    <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">That page doesn’t exist.</h1>
1560|    <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">The address may be outdated, or the page may have moved. Use the links below to continue exploring Vijevira Labs.</p>
1561|    <div className="mt-8 flex flex-wrap gap-3">
1562|      <a href="/" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">Go home</a>
1563|      <a href="/blog" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950">Browse articles</a>
1564|      <a href="/projects" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950">View projects</a>
1565|    </div>
1566|  </main></>);
1567|}
1568|function TagPublic({slug}:{slug:string}){
1569|  const [data,setData]=useState<any>(null);
1570|  useEffect(()=>{apiFetch("/api/taxonomy/tags/"+encodeURIComponent(slug)+"/posts").then(setData).catch(()=>setData(false))},[slug]);
1571|  if(data===false)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24"><EmptyState title="Tag not found" /></main>);
1572|  if(!data)return siteShell(<main className="max-w-3xl mx-auto px-5 py-24 text-sm text-slate-500">Loading tag…</main>);
1573|  return siteShell(<><Seo title={data.tag.name+" — Vijevira Labs"} description={"Articles tagged "+data.tag.name+" from Vijevira Labs."} path={"/tags/"+data.tag.slug} type="CollectionPage"/><main className="max-w-5xl mx-auto px-5 py-14 md:py-20">
1574|    <div className="max-w-3xl"><Meta><span>Tag</span></Meta><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{data.tag.name}</h1><p className="mt-3 text-slate-600">{data.posts.length} {data.posts.length===1?"article":"articles"}</p></div>
1575|    {data.posts.length>0?<div className="mt-9 space-y-5">{data.posts.map((p:any)=><PostCard key={p.id} post={p}/>)}</div>:<div className="mt-9"><EmptyState title="No published articles use this tag yet." /></div>}
1576|  </main></>);
1577|}
1578|
1579|export function App(){
1580|  const path=window.location.pathname;
1581|  if(path==="/admin/login") return <Login/>;
1582|  if(path==="/admin/posts"||path==="/admin/posts/"||path==="/admin/posts/new"||/^\/admin\/posts\/\d+\/edit$/.test(path)) return <EnhancedPosts/>;
1583|  if(path==="/admin/categories") return <TaxonomyManager kind="categories"/>;
1584|  if(path==="/admin/tags") return <TaxonomyManager kind="tags"/>;
1585|  if(path==="/admin/technologies") return <TaxonomyManager kind="technologies"/>;
1586|  if(path==="/admin/tools"||path==="/admin/tools/new"||/^\/admin\/tools\/\d+\/edit$/.test(path)) return <EntityManager kind="tools"/>;
1587|  if(path==="/admin/projects"||path==="/admin/projects/new"||/^\/admin\/projects\/\d+\/edit$/.test(path)) return <EntityManager kind="projects"/>;
1588|  if(path==="/admin/research"||path==="/admin/research/new"||/^\/admin\/research\/\d+\/edit$/.test(path)) return <ResearchManager/>;
1589|  if(path==="/admin/clusters") return <ClusterManager/>;
1590|  if(path==="/admin/media") return <MediaManager/>;
1591|  if(path==="/admin/settings") return <SettingsManager/>;
1592|  if(path==="/admin"||path.startsWith("/admin/")) return <Dashboard/>;
1593|  if(path==="/") return <HomePublic/>;
1594|  if(path==="/blog"||path==="/blog/") return <BlogPublic/>;
1595|  if(path.startsWith("/blog/")) return <PostPublic slug={decodeURIComponent(path.slice(6))}/>;
1596|  if(path==="/tools"||path==="/tools/") return <CollectionPublic kind="tools"/>;
1597|  if(path.startsWith("/tools/")) return <DetailPublic kind="tools" slug={decodeURIComponent(path.slice(7))}/>;
1598|  if(path==="/projects"||path==="/projects/") return <CollectionPublic kind="projects"/>;
1599|  if(path.startsWith("/projects/")) return <DetailPublic kind="projects" slug={decodeURIComponent(path.slice(10))}/>;
1600|  if(path==="/research"||path==="/research/") return <ResearchPublic/>;
1601|  if(path.startsWith("/research/")) return <ResearchDetailPublic id={path.slice(10)}/>;
1602|  if(path==="/search") return <SearchPublic/>;
1603|  if(path==="/about") return <AboutPublic/>;
1604|  if(path.startsWith("/tags/")) return <TagPublic slug={decodeURIComponent(path.slice(6))}/>;
1605|  if(path.startsWith("/topics/")) return <TopicPublic slug={decodeURIComponent(path.slice(8))}/>;
1606|  return <NotFoundPublic/>;
1607|}