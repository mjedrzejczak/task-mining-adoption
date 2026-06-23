import type { NextConfig } from "next";

// GitHub Pages serves a project site under https://<owner>.github.io/<repo>/,
// so production assets/routes must be prefixed with the repo path. Local dev
// keeps the root path. Override REPO if you rename the repository.
const repo = process.env.PAGES_BASE_PATH ?? "task-mining-adoption";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // This dashboard is a static snapshot (no backend), so export it as a fully
  // static site. Makes it trivial to host on any static file server / Pages.
  output: "export",
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : "",
  // Emit directory-style URLs (folder/index.html) which resolve reliably on
  // GitHub Pages without a server rewrite layer.
  trailingSlash: true,
};

export default nextConfig;
