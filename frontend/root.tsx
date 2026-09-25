/** @jsxImportSource npm:hono@4/jsx */
import { raw } from "npm:hono@4/html";
import { immutableFileUrl } from "https://esm.town/v/std/utils/index.ts";

type RootSeo = {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  ogType?: string;
  image?: string;
  imageAlt?: string;
  jsonLd?: any;
};

export function Root(seo: RootSeo = {}) {
  const title=seo.title||"Vijevira Labs — Practical Engineering, Research & Developer Tools";
  const description=seo.description||"Practical engineering articles, technical research, developer tools, and real-world software projects from Vijevira Labs.";
  const robots=seo.robots||"index,follow";
  const canonical=seo.canonical||"";
  const ogType=seo.ogType||"website";
  return (
    <>
      {raw("<!DOCTYPE html>")}
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content={description} />
          <meta name="author" content="Vijevira Labs" />
          <meta name="robots" content={robots} />
          <meta property="og:site_name" content="Vijevira Labs" />
          <meta property="og:locale" content="en_IN" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content={ogType} />
          {seo.image&&<meta property="og:image" content={seo.image} />}
          {seo.image&&seo.imageAlt&&<meta property="og:image:alt" content={seo.imageAlt} />}
          <meta property="og:url" content={canonical||undefined} />
          <meta name="twitter:card" content={seo.image?"summary_large_image":"summary"} />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          {seo.image&&<meta name="twitter:image" content={seo.image} />}
          {seo.image&&seo.imageAlt&&<meta name="twitter:image:alt" content={seo.imageAlt} />}
          <meta name="theme-color" content="#ffffff" />
          <title>{title}</title>
          {canonical&&<link rel="canonical" href={canonical} />}
          <link rel="alternate" type="application/rss+xml" title="Vijevira Labs RSS" href={(canonical?new URL("/rss.xml",canonical).href:"/rss.xml")} />
          {seo.jsonLd&&<script type="application/ld+json">{raw(JSON.stringify(seo.jsonLd).replace(/</g,"\\u003c"))}</script>}
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