
import { initDatabase, sqlite } from "../lib/db.ts";

type Row = Record<string, any>;
const slugify = (v:string) => v.trim().toLowerCase().normalize("NFKD")
  .replace(/[^a-z0-9\s-]/g,"").replace(/[\s_-]+/g,"-")
  .replace(/^-+|-+$/g,"").slice(0,120);
const readTime = (v:string) => Math.max(1, Math.ceil(v.trim().split(" ").filter(Boolean).length / 120));
const idBy = async (table:string, slug:string) => {
  const r = await sqlite.execute("SELECT id FROM " + table + " WHERE slug=? LIMIT 1",[slug]);
  return r.rows[0] ? Number((r.rows[0] as Row).id) : null;
};

async function taxonomy() {
  const cats = [
    ["Engineering","Production engineering, software development, and practical systems work."],
    ["Research","Technical research, experiments, and evidence-driven exploration."],
    ["Tutorials","Step-by-step guides for building and shipping software."],
    ["DevOps","Infrastructure, deployment, observability, and operations."],
    ["AI","AI engineering, LLMs, agents, and applied machine intelligence."],
    ["Architecture","System design, architecture patterns, and engineering trade-offs."],
    ["Free Tools","Free and low-cost developer tools, platforms, and services."]
  ];
  for (const x of cats) await sqlite.execute("INSERT OR IGNORE INTO categories(name,slug,description) VALUES(?,?,?)",[x[0],slugify(x[0]),x[1]]);
  for (const name of ["PostgreSQL","Redis","Node.js","Python","Serverless","DevOps","System Design","AI Agents","Observability","Cron Jobs","Databases","Time Zones"])
    await sqlite.execute("INSERT OR IGNORE INTO tags(name,slug) VALUES(?,?)",[name,slugify(name)]);
  const techs = [
    ["Node.js","JavaScript runtime for backend services and automation.","https://nodejs.org/"],
    ["PostgreSQL","Relational database for transactional application data.","https://www.postgresql.org/"],
    ["Redis","In-memory data store commonly used for caching and coordination.","https://redis.io/"],
    ["Hono","Small web framework for server and edge runtimes.","https://hono.dev/"],
    ["Cloudflare","Network and edge platform for routing, security, and developer infrastructure.","https://www.cloudflare.com/"],
    ["GitHub Actions","Workflow automation built into GitHub repositories.","https://github.com/features/actions"],
    ["Python","General-purpose language used for scripting, automation, and data work.","https://www.python.org/"]
  ];
  for (const x of techs) await sqlite.execute("INSERT OR IGNORE INTO technologies(name,slug,description,website_url) VALUES(?,?,?,?)",[x[0],slugify(x[0]),x[1],x[2]]);
}

async function tool(x:any) {
  const s=slugify(x.name);
  if (!(await sqlite.execute("SELECT id FROM tools WHERE slug=?",[s])).rows.length)
    await sqlite.execute("INSERT INTO tools(name,slug,description,long_description,website_url,category,pricing_type,free_tier,my_experience,limitations,featured) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
      [x.name,s,x.description,x.long_description,x.website_url,x.category,x.pricing_type,x.free_tier,x.my_experience,x.limitations,x.featured||0]);
  return Number(await idBy("tools",s));
}

async function project(x:any) {
  const s=slugify(x.name);
  if (!(await sqlite.execute("SELECT id FROM projects WHERE slug=?",[s])).rows.length)
    await sqlite.execute("INSERT INTO projects(name,slug,description,content,status,repository_url,demo_url,featured) VALUES(?,?,?,?,?,?,?,?)",
      [x.name,s,x.description,x.content,x.status,x.repository_url||null,x.demo_url||null,x.featured||0]);
  return Number(await idBy("projects",s));
}

async function post(x:any) {
  const s=slugify(x.title);
  const found=await sqlite.execute("SELECT id FROM posts WHERE slug=?",[s]);
  let id:number;
  if(found.rows.length) id=Number((found.rows[0] as Row).id);
  else {
    const cid=Number(await idBy("categories",x.categories[0]));
    await sqlite.execute("INSERT INTO posts(title,slug,description,content,content_type,status,category_id,featured,seo_title,seo_description,reading_time,published_at) VALUES(?,?,?,?,?,'published',?,?,?,?,?,?)",
      [x.title,s,x.description,x.content,x.type,cid,x.featured||0,x.title,x.description,readTime(x.content),x.publishedAt]);
    id=Number((await sqlite.execute("SELECT id FROM posts WHERE slug=?",[s])).rows[0].id);
  }
  for(const t of ["post_categories","post_tags","post_technologies","post_tools","post_projects","related_posts"])
    await sqlite.execute("DELETE FROM "+t+" WHERE post_id=?",[id]);
  for(const c of x.categories){const cid=await idBy("categories",c);if(cid)await sqlite.execute("INSERT OR IGNORE INTO post_categories(post_id,category_id) VALUES(?,?)",[id,cid]);}
  for(const t of x.tags){const tid=await idBy("tags",slugify(t));if(tid)await sqlite.execute("INSERT OR IGNORE INTO post_tags(post_id,tag_id) VALUES(?,?)",[id,tid]);}
  for(const t of x.technologies){const tid=await idBy("technologies",slugify(t));if(tid)await sqlite.execute("INSERT OR IGNORE INTO post_technologies(post_id,technology_id) VALUES(?,?)",[id,tid]);}
  for(const s2 of x.tools||[]){const tid=await idBy("tools",s2);if(tid)await sqlite.execute("INSERT OR IGNORE INTO post_tools(post_id,tool_id) VALUES(?,?)",[id,tid]);}
  for(const s2 of x.projects||[]){const pid=await idBy("projects",s2);if(pid)await sqlite.execute("INSERT OR IGNORE INTO post_projects(post_id,project_id) VALUES(?,?)",[id,pid]);}
  for(const s2 of x.related||[]){const rid=await idBy("posts",s2);if(rid&&rid!==id)await sqlite.execute("INSERT OR IGNORE INTO related_posts(post_id,related_post_id) VALUES(?,?)",[id,rid]);}
  await sqlite.execute("UPDATE posts SET category_id=?,featured=1,status='published' WHERE id=?",[Number(await idBy("categories",x.categories[0])),id]);
  if(!x.featured) await sqlite.execute("UPDATE posts SET featured=0 WHERE id=?",[id]);
  return id;
}

await initDatabase();

async function cleanupSeed() {
  const toolNames=["Val Town","Cloudinary","Upstash","GitHub Actions","Cloudflare Tunnel"];
  const projectNames=["CronDeck","WatchTower","Vijevira Labs"];
  const postTitles=[
    "The Small-App Architecture: When Less Infrastructure Is More",
    "AI-Assisted Debugging: A Workflow That Keeps the Engineer in Control",
    "SQLite in Production: A Practical Boundary-Setting Guide",
    "Designing Reliable Scheduled Jobs: Retries, Idempotency, and Observability",
    "UTC in the Backend, Local Time in the Browser",
    "What Changes When a Cron Job Runs Every Minute?",
    "Can SQLite Carry a Small SaaS?",
    "Time Semantics in Web Applications"
  ];
  const pMarks=postTitles.map(()=>"?").join(",");
  const tMarks=toolNames.map(()=>"?").join(",");
  const prMarks=projectNames.map(()=>"?").join(",");
  for(const table of ["post_categories","post_tags","post_technologies","post_tools","post_projects","related_posts"])
    await sqlite.execute("DELETE FROM "+table+" WHERE post_id IN (SELECT id FROM posts WHERE title IN ("+pMarks+"))",postTitles);
  await sqlite.execute("DELETE FROM post_tools WHERE tool_id IN (SELECT id FROM tools WHERE name IN ("+tMarks+"))",toolNames);
  await sqlite.execute("DELETE FROM post_projects WHERE project_id IN (SELECT id FROM projects WHERE name IN ("+prMarks+"))",projectNames);
  await sqlite.execute("DELETE FROM research_notes WHERE slug IN (?,?,?)",["cron-overlap-semantics","sqlite-workload-boundary","utc-storage-local-presentation"]);
  await sqlite.execute("DELETE FROM posts WHERE title IN ("+pMarks+")",postTitles);
  await sqlite.execute("DELETE FROM tools WHERE name IN ("+tMarks+")",toolNames);
  await sqlite.execute("DELETE FROM projects WHERE name IN ("+prMarks+")",projectNames);
  const tagFix=[
    ["PostgreSQL","postgresql"],["Redis","redis"],["Node.js","node-js"],["Python","python"],
    ["Serverless","serverless"],["DevOps","devops"],["System Design","system-design"],
    ["AI Agents","ai-agents"],["Observability","observability"],["Cron Jobs","cron-jobs"],
    ["Databases","databases"],["Time Zones","time-zones"]
  ];
  for(const x of tagFix) await sqlite.execute("UPDATE tags SET slug=? WHERE name=?",[x[1],x[0]]);
  const techFix=[
    ["Node.js","node-js"],["PostgreSQL","postgresql"],["Redis","redis"],["Hono","hono"],
    ["Cloudflare","cloudflare"],["GitHub Actions","github-actions"],["Python","python"]
  ];
  for(const x of techFix) await sqlite.execute("UPDATE technologies SET slug=? WHERE name=?",[x[1],x[0]]);
}
await cleanupSeed();
await taxonomy();

const toolList=[
 {name:"Val Town",description:"A browser-first place to write, run, schedule, and share small TypeScript and JavaScript programs.",long_description:"Useful for compact services, scheduled tasks, webhooks, experiments, and tiny internal tools. The workflow keeps code, execution, and a public endpoint close together.",website_url:"https://www.val.town/",category:"Serverless / Developer Platform",pricing_type:"Free to start",free_tier:"A free entry point is available; verify current execution, storage, and scheduling limits before critical use.",my_experience:"The main advantage is iteration speed. A small endpoint or scheduled function can move from idea to prototype quickly.",limitations:"Long-running workloads, high-volume processing, and infrastructure-heavy applications can outgrow the model.",featured:1},
 {name:"Cloudinary",description:"Media platform for storing, transforming, and delivering images and other assets.",long_description:"A useful media abstraction for upload, transformation, optimization, and delivery while application data stays focused on metadata.",website_url:"https://cloudinary.com/",category:"Media Infrastructure",pricing_type:"Usage-based / Free to start",free_tier:"A free entry point is available; verify current quotas before relying on it for sustained traffic.",my_experience:"For a small publication, centralized media delivery avoids building a custom image pipeline too early.",limitations:"Transformations and delivery become an independent cost and configuration surface.",featured:0},
 {name:"Upstash",description:"Serverless-friendly Redis and Kafka services for low-friction cloud workloads.",long_description:"Useful for rate limiting, short-lived caching, queues, counters, and lightweight coordination without maintaining a dedicated Redis server.",website_url:"https://upstash.com/",category:"Data / Caching",pricing_type:"Usage-based / Free to start",free_tier:"A free entry point is available; verify current request and storage limits for your workload.",my_experience:"The serverless-friendly model is convenient for bursty applications where an always-on cache adds operational overhead.",limitations:"A remote cache is a network dependency, so design for misses, timeouts, and degraded operation.",featured:0},
 {name:"GitHub Actions",description:"Repository-native automation for tests, builds, releases, and scheduled workflows.",long_description:"Putting automation next to source code makes verification and release behavior visible in the repository.",website_url:"https://github.com/features/actions",category:"CI / Automation",pricing_type:"Usage-based",free_tier:"Public repositories include GitHub-hosted runner capacity; verify current allowances for private repositories.",my_experience:"A short workflow can enforce repeatable verification steps on every change.",limitations:"Complex pipelines can become difficult to reason about, so prefer small workflows and explicit permissions.",featured:0},
 {name:"Cloudflare Tunnel",description:"An outbound tunnel for publishing local services without opening inbound firewall ports.",long_description:"Useful during development and for private services that need controlled network access.",website_url:"https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/",category:"Networking / DevOps",pricing_type:"Free to start",free_tier:"An entry-level tunnel option is available; verify current Zero Trust features and account limits.",my_experience:"For local webhooks and integrations, a tunnel removes the friction of a publicly reachable development server.",limitations:"A tunnel is a network path, not a complete security boundary. Authentication and process hardening still matter.",featured:0}
];
const toolIds:any={};for(const x of toolList)toolIds[slugify(x.name)]=await tool(x);

const projectList=[
 {name:"CronDeck",description:"A multi-user cron scheduling and monitoring service focused on clear execution history and practical job operations.",status:"building",repository_url:"https://github.com/vijevira/CronDeck",demo_url:"https://crondeck.val.run/",featured:1,content:"# CronDeck\n\nCronDeck treats scheduling as only half the problem; operators also need to know what happened.\n\n## Current direction\n\n- Create and manage scheduled HTTP jobs.\n- Reuse existing cron jobs when creating monitors.\n- Keep execution history visible.\n- Add monitors and public status pages.\n- Present timestamps in the viewer's local timezone while keeping UTC canonical.\n\n## Engineering focus\n\nIdempotent execution, retries, observability, time semantics, and a UI that makes failures understandable."},
 {name:"WatchTower",description:"An application monitoring and webhook-oriented project exploring lightweight queueing, Redis coordination, and production deployment.",status:"active",repository_url:"https://github.com/vijevira/WatchTower",featured:0,content:"# WatchTower\n\nWatchTower is an application-level monitoring project for alerting and job coordination experiments.\n\nThe focus is answering a small set of operational questions reliably: Did a job run? Did the endpoint respond? Can failures be retried safely? Can an operator see enough context to debug the problem?"},
 {name:"Vijevira Labs",description:"An engineering publication and research workspace for documenting practical software experiments and free-tool workflows.",status:"live",repository_url:"https://github.com/vijevira/vijevira-labs",demo_url:"https://vijevira-labs.val.run/",featured:0,content:"# Vijevira Labs\n\nVijevira Labs combines a public engineering site with an admin knowledge workbench.\n\nThe platform stores structured content in SQLite and keeps media metadata separate from article bodies. The goal is to document what it actually takes to turn small building blocks into maintainable software."}
];
const projectIds:any={};for(const x of projectList)projectIds[slugify(x.name)]=await project(x);

const posts=[
 {title:"The Small-App Architecture: When Less Infrastructure Is More",description:"A practical way to decide how much infrastructure a small application actually needs, from a single runtime and database to queues, caches, and workers.",type:"guide",categories:["architecture","engineering"],tags:["System Design","DevOps","Serverless","Databases","Observability"],technologies:["Node.js","PostgreSQL","Redis","Hono"],tools:["val-town","upstash","github-actions"],projects:["vijevira-labs","crondeck","watchtower"],related:["ai-assisted-debugging-a-workflow-that-keeps-the-engineer-in-control","sqlite-in-production-a-practical-boundary-setting-guide","designing-reliable-scheduled-jobs-retries-idempotency-and-observability"],publishedAt:"2026-09-24T18:15:00.000Z",featured:1,content:"# The Small-App Architecture: When Less Infrastructure Is More\n\nA small application does not become production-ready by collecting infrastructure services. It becomes production-ready when every component has a clear job, failure behavior, and operational owner.\n\n## Start with one executable boundary\n\nFor many internal tools, content sites, APIs, dashboards, and automation products, one application boundary is enough. Fewer moving parts make the first debugging loop shorter.\n\n## Add a queue when work becomes asynchronous\n\nQueues become valuable when work no longer needs to finish inside the user's request. Examples include email, asset processing, multi-step API calls, and retries. Once background work has its own lifecycle, model it explicitly as queued, running, succeeded, retrying, or permanently failed.\n\n## Add Redis when it solves a specific problem\n\nA cache should exist because reads are expensive or latency matters. Shared ephemeral state can support rate limits, locks, counters, and short-lived coordination. Do not turn a coordination layer into the database of record.\n\n## Keep observability proportional\n\nA small app still needs logs and an understandable error boundary. At minimum, capture operation name, timing, outcome, error category, and retry count when relevant.\n\n## The architecture should explain itself\n\nA good repository should answer where state is stored, where background work happens, what happens when a dependency fails, and how a release is verified. Add infrastructure when a real failure mode justifies it, not because a larger stack looks more professional."},
 {title:"AI-Assisted Debugging: A Workflow That Keeps the Engineer in Control",description:"A practical workflow for using coding models to reproduce bugs, inspect evidence, propose changes, and verify fixes without treating AI output as proof.",type:"article",categories:["ai","engineering"],tags:["AI Coding","AI Agents","JavaScript","Observability"],technologies:["Node.js","Python","Hono"],tools:["val-town","github-actions"],projects:["vijevira-labs","watchtower"],related:["the-small-app-architecture-when-less-infrastructure-is-more","utc-in-the-backend-local-time-in-the-browser","designing-reliable-scheduled-jobs-retries-idempotency-and-observability"],publishedAt:"2026-09-24T12:30:00.000Z",content:"# AI-Assisted Debugging: A Workflow That Keeps the Engineer in Control\n\nA coding model can produce a plausible patch long before a system demonstrates that the bug is gone. The reliable loop is evidence, hypothesis, small change, verification, and regression check.\n\n## Start with the observed failure\n\nGive the model the exact symptom, route, status, and visible result. A constrained prompt is a falsifiable claim rather than an invitation to rewrite the application.\n\n## Separate evidence from guesses\n\nKeep three buckets: observed behavior, facts established by code or traces, and unknowns that still need to be tested. Models naturally fill gaps, so leave those gaps visible.\n\n## Reproduce at the narrowest layer\n\nInspect the network request before changing the database. If an API returns an ID but the browser navigates to a missing value, the defect may be in response handling rather than persistence.\n\n## Verify the original symptom\n\nA patch is incomplete until the exact failing flow works again. Repeat it with another record, refresh the destination, and check the stored state. For background jobs, verify retries, final status, and execution history.\n\n## Closing thought\n\nAI can compress the distance between a hypothesis and an implementation. Engineers still own the distance between an implementation and trustworthy evidence."},
 {title:"SQLite in Production: A Practical Boundary-Setting Guide",description:"How to decide when SQLite is a sensible production database, when to move to PostgreSQL, and which workload characteristics matter more than database fashion.",type:"comparison",categories:["architecture","engineering"],tags:["Databases","System Design","Serverless","PostgreSQL"],technologies:["PostgreSQL","Node.js"],tools:["val-town"],projects:["vijevira-labs"],related:["the-small-app-architecture-when-less-infrastructure-is-more","designing-reliable-scheduled-jobs-retries-idempotency-and-observability","utc-in-the-backend-local-time-in-the-browser"],publishedAt:"2026-09-23T15:20:00.000Z",content:"# SQLite in Production: A Practical Boundary-Setting Guide\n\nSQLite is not merely a prototype database. The useful question is whether an application's workload matches SQLite's operational model.\n\n## What SQLite gives you\n\nA file-backed relational database removes the need to operate a separate database service for many workloads. Transactions, SQL, and a compact operational surface can be strong advantages for small applications.\n\n## The boundary is workload\n\nReconsider the model when many independent writers need high coordination, multiple application instances create sustained write contention, or the database needs independent managed scaling. Those are concrete reasons to evaluate PostgreSQL.\n\n## Keep content and media separate\n\nFor a publication, store article metadata and media references in the relational database while a media provider handles asset delivery and transformations. This keeps the data model focused.\n\n## Migration is a product decision\n\nBefore moving databases, write the concrete reason. Sustained contention, independent scaling, or required database capabilities are useful signals. Technology should follow the workload rather than prestige.\n\n## Closing thought\n\nSQLite and PostgreSQL are different operational models. For the right workload, the lack of a separate database server is the feature."},
 {title:"Designing Reliable Scheduled Jobs: Retries, Idempotency, and Observability",description:"A practical guide to building scheduled jobs that can fail, retry, and recover without accidentally repeating the business operation.",type:"guide",categories:["devops","engineering","architecture"],tags:["Cron Jobs","Observability","System Design","Redis","DevOps"],technologies:["Node.js","Redis","PostgreSQL"],tools:["upstash","github-actions","cloudflare-tunnel"],projects:["crondeck","watchtower"],related:["the-small-app-architecture-when-less-infrastructure-is-more","ai-assisted-debugging-a-workflow-that-keeps-the-engineer-in-control","utc-in-the-backend-local-time-in-the-browser"],publishedAt:"2026-09-23T09:10:00.000Z",content:"# Designing Reliable Scheduled Jobs: Retries, Idempotency, and Observability\n\nA scheduled job is easy to start and surprisingly hard to make trustworthy.\n\n## Separate scheduling from execution\n\nA schedule answers when work becomes eligible. Execution answers what happens when that work actually runs. Keeping them separate makes the system easier to reason about.\n\n## Make retries safe\n\nRetries are only safe when repeating an operation does not create an unintended duplicate effect. Give business actions a stable idempotency identity and make the operation safe to repeat.\n\n## Retry the right failures\n\nTemporary network failures, rate limiting, and upstream server errors often deserve retry. Invalid input usually does not. Authentication failures may require intervention rather than repeated attempts.\n\n## Record execution history\n\nFor each run, preserve the job, scheduled time, start time, finish time, attempt, status, and useful error information. Monitoring becomes much more useful when the history explains what actually happened.\n\n## Keep UTC canonical\n\nStore execution instants unambiguously and convert them for display. Keep recurring calendar rules separate from one-off execution timestamps."},
 {title:"UTC in the Backend, Local Time in the Browser",description:"A practical pattern for storing unambiguous timestamps while giving every visitor a time display that matches their own local timezone.",type:"article",categories:["engineering","devops"],tags:["Time Zones","JavaScript","Web Development","DevOps"],technologies:["JavaScript","Node.js"],projects:["crondeck","vijevira-labs"],related:["designing-reliable-scheduled-jobs-retries-idempotency-and-observability","ai-assisted-debugging-a-workflow-that-keeps-the-engineer-in-control","the-small-app-architecture-when-less-infrastructure-is-more"],publishedAt:"2026-09-22T18:45:00.000Z",content:"# UTC in the Backend, Local Time in the Browser\n\nA server-generated timestamp can be correct and still be a poor user experience if every visitor sees the same clock zone.\n\n## Store an instant, not a formatted sentence\n\nAn unambiguous timestamp represents an instant. A formatted sentence already contains presentation choices. Keep presentation decisions out of durable state whenever possible.\n\n## Let the browser own the default\n\nThe browser already knows the visitor's locale and timezone. A date formatter can use those defaults so the application presents a natural local time without a profile setting first.\n\n## Provide an explicit override\n\nMonitoring products may also need UTC or named timezone choices. Avoid redundant offset labels when the selected zone is already clear.\n\n## Separate timestamps from schedules\n\nAn execution instant is not the same thing as a recurring rule such as every weekday at a local hour. Persist the rule and its timezone rather than reducing it to one UTC timestamp too early.\n\n## Closing thought\n\nUTC is a strong storage boundary because it is unambiguous. Local time is a strong presentation boundary because it is familiar."}
];

const postIds:any={};
for(const x of posts) postIds[slugify(x.title)]=await post(x);

const research=[
 {title:"What Changes When a Cron Job Runs Every Minute?",description:"An exploratory note on overlap, retry storms, backlog pressure, and the operational signals a scheduler should expose.",categories:["research","devops"],tags:["Cron Jobs","Observability","System Design","DevOps"],technologies:["Node.js","Redis","PostgreSQL"],tools:["upstash"],projects:["crondeck","watchtower"],related:["designing-reliable-scheduled-jobs-retries-idempotency-and-observability"],publishedAt:"2026-09-21T16:10:00.000Z",type:"research",content:"# What Changes When a Cron Job Runs Every Minute?\n\nA frequent schedule compresses operational mistakes. A slow dependency, overlap, or retry storm can become the dominant system behavior.\n\n## Questions\n\n- Can one run overlap the next?\n- Should the next run be skipped, queued, or executed concurrently?\n- What happens during an outage?\n- What should missed mean in execution history?\n\n## Useful signals\n\nTrack scheduled time, start time, finish time, attempt, status, and error. A monitor can summarize success rate, failure streak, average duration, last success, and next scheduled run.\n\nThe useful experiment is to compare the same job under normal conditions and a controlled dependency outage."},
 {title:"Can SQLite Carry a Small SaaS?",description:"A research note exploring the workload boundary where SQLite remains simple and the signals that indicate a move to PostgreSQL.",categories:["research","architecture"],tags:["Databases","PostgreSQL","System Design","Serverless"],technologies:["PostgreSQL","Node.js"],tools:["val-town"],projects:["vijevira-labs"],related:["sqlite-in-production-a-practical-boundary-setting-guide"],publishedAt:"2026-09-20T12:00:00.000Z",type:"research",content:"# Can SQLite Carry a Small SaaS?\n\nThe useful research question is whether the application's write pattern matches SQLite's operational model.\n\n## Measurements\n\nTrack application instances, read/write ratio, peak writes, transaction duration, lock contention, database size, and backup duration.\n\n## Working hypothesis\n\nFor a small application with modest write concurrency, relational transactions, and one clear application owner, SQLite can keep the architecture simple. The boundary moves when the application needs sustained multi-writer coordination, independent managed scaling, or database capabilities that the existing model does not provide."},
 {title:"Time Semantics in Web Applications",description:"An investigation into instants, calendar schedules, browser-local presentation, and explicit timezone preferences.",categories:["research","engineering"],tags:["Time Zones","JavaScript","Web Development","System Design"],technologies:["JavaScript","Node.js"],projects:["crondeck"],related:["utc-in-the-backend-local-time-in-the-browser"],publishedAt:"2026-09-19T10:30:00.000Z",type:"research",content:"# Time Semantics in Web Applications\n\nTime bugs usually begin when one value is forced to represent several concepts. Separate an instant, a recurring calendar rule, a chosen timezone, and localized presentation.\n\n## Research questions\n\n- Which values should be persisted?\n- Which values should be derived?\n- Where should timezone conversion happen?\n- How should browser defaults interact with explicit choices?\n- How should daylight-saving transitions be represented?\n\nA useful test suite should assert both the underlying instant and the presentation behavior."}
];
for(const x of research) await post(x);

const notes=[
 {title:"Cron overlap semantics",slug:"cron-overlap-semantics",status:"active",project:projectIds["crondeck"],post:postIds[slugify("Designing Reliable Scheduled Jobs: Retries, Idempotency, and Observability")],content:"Hypothesis: every scheduler needs an explicit overlap policy.\n\nQuestions:\n- What happens when a run is still active at the next scheduled time?\n- Should the UI distinguish skipped, delayed, and queued executions?\n- What metrics expose recurring overlap?\n\nNext experiment: compare skip, queue, and concurrent policies with a synthetic long-running job."},
 {title:"SQLite workload boundary",slug:"sqlite-workload-boundary",status:"completed",project:projectIds["vijevira-labs"],post:postIds[slugify("SQLite in Production: A Practical Boundary-Setting Guide")],content:"Conclusion note: SQLite remains compelling while one application boundary owns writes, write contention is modest, and the database can be operated as durable application state.\n\nMigration signals include sustained write contention, independent scaling needs, multiple heavy writers, and required database capabilities."},
 {title:"UTC storage and local presentation",slug:"utc-storage-local-presentation",status:"converted",project:projectIds["crondeck"],post:postIds[slugify("UTC in the Backend, Local Time in the Browser")],content:"Converted into the public article track.\n\nCore rule: store instants unambiguously, render them in the chosen timezone, and keep recurring calendar rules separate from one-off timestamps.\n\nRemaining checks: browser default timezone, explicit override, UTC option, and daylight-saving cases."}
];
for(const n of notes){
  const e=await sqlite.execute("SELECT id FROM research_notes WHERE slug=?",[n.slug]);
  if(!e.rows.length) await sqlite.execute("INSERT INTO research_notes(title,slug,content,status,related_post_id,related_project_id) VALUES(?,?,?,?,?,?)",[n.title,n.slug,n.content,n.status,n.post,n.project]);
  else await sqlite.execute("UPDATE research_notes SET title=?,content=?,status=?,related_post_id=?,related_project_id=?,updated_at=CURRENT_TIMESTAMP WHERE slug=?",[n.title,n.content,n.status,n.post,n.project,n.slug]);
}

await sqlite.execute("UPDATE posts SET featured=0 WHERE slug<>?",[slugify("The Small-App Architecture: When Less Infrastructure Is More")]);
await sqlite.execute("UPDATE posts SET featured=1 WHERE slug=?",[slugify("The Small-App Architecture: When Less Infrastructure Is More")]);

const count=async(sql:string)=>Number(((await sqlite.execute(sql)).rows[0] as Row).n);
console.log(JSON.stringify({
  posts:await count("SELECT COUNT(*) n FROM posts"),
  published:await count("SELECT COUNT(*) n FROM posts WHERE status='published'"),
  tools:await count("SELECT COUNT(*) n FROM tools"),
  projects:await count("SELECT COUNT(*) n FROM projects"),
  researchPosts:await count("SELECT COUNT(*) n FROM posts WHERE status='published' AND content_type='research'"),
  researchNotes:await count("SELECT COUNT(*) n FROM research_notes"),
  tags:await count("SELECT COUNT(*) n FROM tags"),
  technologies:await count("SELECT COUNT(*) n FROM technologies")
}));
