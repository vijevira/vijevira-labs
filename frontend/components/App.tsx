/** @jsxImportSource https://esm.sh/react@18.2.0 */

export function App() {
  return (
    <div class="min-h-screen bg-white text-gray-900">
      <header class="border-b border-gray-200">
        <nav class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" class="font-semibold text-lg">Vijevira Labs</a>
          <div class="flex items-center gap-6 text-sm text-gray-600">
            <a href="/blog" class="hover:text-gray-900">Blog</a>
            <a href="/tools" class="hover:text-gray-900">Tools</a>
            <a href="/projects" class="hover:text-gray-900">Projects</a>
            <a href="/research" class="hover:text-gray-900">Research</a>
            <a href="/about" class="hover:text-gray-900">About</a>
          </div>
        </nav>
      </header>
      <main class="max-w-6xl mx-auto px-6 py-20">
        <p class="text-sm font-medium text-gray-500 mb-4">Engineering, Research &amp; Building.</p>
        <h1 class="text-5xl font-bold tracking-tight mb-6">Vijevira Labs</h1>
        <p class="max-w-2xl text-xl leading-8 text-gray-600">
          Practical engineering notes, research, production lessons, developer tools,
          and projects built with a focus on useful, real-world systems.
        </p>
      </main>
    </div>
  );
}