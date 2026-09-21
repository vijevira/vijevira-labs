/** @jsxImportSource https://esm.sh/react@18.2.0 */

const nav = [
  ["/admin", "Dashboard"],
  ["/admin/posts", "Posts"],
  ["/admin/research", "Research"],
  ["/admin/tools", "Tools"],
  ["/admin/projects", "Projects"],
  ["/admin/media", "Media"],
  ["/admin/categories", "Categories"],
  ["/admin/tags", "Tags"],
  ["/admin/technologies", "Technologies"],
  ["/admin/settings", "Settings"],
];

function AdminShell({ children }: { children: any }) {
  return (
    <div class="min-h-screen bg-gray-50 text-gray-900">
      <aside class="fixed inset-y-0 left-0 w-60 border-r border-gray-200 bg-white p-5">
        <a href="/admin" class="block text-lg font-semibold mb-8">Vijevira Labs</a>
        <p class="text-xs uppercase tracking-wider text-gray-400 mb-3">Admin</p>
        <nav class="space-y-1">
          {nav.map(([href, label]) => (
            <a href={href} class="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900">{label}</a>
          ))}
        </nav>
        <a href="/" class="absolute bottom-5 left-5 text-sm text-gray-500 hover:text-gray-900">← View site</a>
      </aside>
      <main class="ml-60 min-h-screen p-8">{children}</main>
    </div>
  );
}

function Login() {
  return (
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <form id="login-form" class="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
        <h1 class="text-2xl font-semibold">Vijevira Labs</h1>
        <p class="mt-1 text-sm text-gray-500">Admin sign in</p>
        <label class="block mt-7 text-sm font-medium">Email<input id="email" type="email" required class="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
        <label class="block mt-4 text-sm font-medium">Password<input id="password" type="password" required class="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
        <p id="error" class="hidden mt-4 text-sm text-red-600"></p>
        <button class="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700">Sign in</button>
      </form>
      <script dangerouslySetInnerHTML={{__html: `
        document.getElementById("login-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const error = document.getElementById("error");
          error.classList.add("hidden");
          const r = await fetch("/api/auth/login", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:document.getElementById("email").value,password:document.getElementById("password").value})});
          const data = await r.json();
          if (!r.ok) { error.textContent = data.error?.message || "Sign in failed"; error.classList.remove("hidden"); return; }
          location.href = "/admin";
        });
      `}} />
    </div>
  );
}

function Dashboard() {
  return <AdminShell><h1 class="text-3xl font-semibold">Dashboard</h1><p class="mt-2 text-gray-500">Manage your engineering content and research.</p><div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5"><a href="/admin/posts" class="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-400"><p class="text-sm text-gray-500">Content</p><p class="mt-2 text-xl font-semibold">Posts</p></a><a href="/admin/research" class="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-400"><p class="text-sm text-gray-500">Knowledge</p><p class="mt-2 text-xl font-semibold">Research</p></a><a href="/admin/media" class="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-400"><p class="text-sm text-gray-500">Assets</p><p class="mt-2 text-xl font-semibold">Media</p></a></div></AdminShell>;
}

export function App() {
  const path = window.location.pathname;
  if (path === "/admin/login") return <Login />;
  if (path === "/admin" || path.startsWith("/admin/")) return <Dashboard />;
  return (
    <div class="min-h-screen bg-white text-gray-900">
      <header class="border-b border-gray-200"><nav class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"><a href="/" class="font-semibold text-lg">Vijevira Labs</a><div class="flex items-center gap-6 text-sm text-gray-600"><a href="/blog">Blog</a><a href="/tools">Tools</a><a href="/projects">Projects</a><a href="/research">Research</a><a href="/about">About</a><a href="/admin/login">Admin</a></div></nav></header>
      <main class="max-w-6xl mx-auto px-6 py-20"><p class="text-sm font-medium text-gray-500 mb-4">Engineering, Research &amp; Building.</p><h1 class="text-5xl font-bold tracking-tight mb-6">Vijevira Labs</h1><p class="max-w-2xl text-xl leading-8 text-gray-600">Practical engineering notes, research, production lessons, developer tools, and projects built with a focus on useful, real-world systems.</p></main>
    </div>
  );
}