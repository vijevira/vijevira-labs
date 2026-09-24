/** @jsxImportSource npm:hono@4/jsx */
import { raw } from "npm:hono@4/html";
import { immutableFileUrl } from "https://esm.town/v/std/utils/index.ts";

export function Root() {
  return (
    <>
      {raw("<!DOCTYPE html>")}
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="Vijevira Labs — Engineering, Research & Building. Practical engineering knowledge, research, developer tools, and project notes." />
          <meta name="robots" content="index,follow" />
          <meta property="og:site_name" content="Vijevira Labs" />
          <meta property="og:title" content="Vijevira Labs — Engineering, Research & Building" />
          <meta property="og:description" content="Practical engineering knowledge, research, developer tools, and project notes." />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="theme-color" content="#ffffff" />
          <title>Vijevira Labs — Engineering, Research &amp; Building</title>
          <link rel="icon" href={immutableFileUrl("/frontend/favicon.svg")} type="image/svg+xml" />
          <script src="https://cdn.twind.style" crossOrigin="" />
        </head>
        <body className="font-sans">
          <main><div id="root"></div></main>
          <script src="https://esm.town/v/std/catch"></script>
          <script src={immutableFileUrl("/frontend/index.tsx")} type="module"></script>
        </body>
      </html>
    </>
  );
}