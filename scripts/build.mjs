import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(rootDir, "dist");
const serverDistDir = path.join(rootDir, "server-dist");
const staticDir = path.join(rootDir, "static");

const packageJson = JSON.parse(await readFile(path.join(rootDir, "package.json"), "utf8"));

await rm(distDir, { force: true, recursive: true });
await rm(serverDistDir, { force: true, recursive: true });
await mkdir(distDir, { recursive: true });
await mkdir(serverDistDir, { recursive: true });

const sharedConfig = {
  bundle: true,
  minify: false,
  platform: "browser",
  sourcemap: false,
  target: "chrome120",
  logLevel: "info"
};

await Promise.all([
  build({
    ...sharedConfig,
    entryPoints: [path.join(rootDir, "src/background.ts")],
    outfile: path.join(distDir, "background.js"),
    format: "esm"
  }),
  build({
    ...sharedConfig,
    entryPoints: [path.join(rootDir, "src/popup.ts")],
    outfile: path.join(distDir, "popup.js"),
    format: "esm"
  }),
  build({
    ...sharedConfig,
    entryPoints: [path.join(rootDir, "src/options.ts")],
    outfile: path.join(distDir, "options.js"),
    format: "esm"
  }),
  build({
    ...sharedConfig,
    entryPoints: [path.join(rootDir, "src/content.ts")],
    outfile: path.join(distDir, "content.js"),
    format: "iife"
  }),
  build({
    bundle: true,
    minify: false,
    platform: "node",
    sourcemap: false,
    target: "node24",
    logLevel: "info",
    entryPoints: [path.join(rootDir, "src/api/server.ts")],
    outfile: path.join(serverDistDir, "api.cjs"),
    format: "cjs"
  })
]);

await Promise.all([
  cp(path.join(staticDir, "popup.html"), path.join(distDir, "popup.html")),
  cp(path.join(staticDir, "options.html"), path.join(distDir, "options.html")),
  cp(path.join(staticDir, "styles.css"), path.join(distDir, "styles.css"))
]);

const manifest = {
  manifest_version: 3,
  name: "Receptenvanger MVP",
  version: packageJson.version,
  description: "Leg recepten van websites vast als gestructureerde JSON via OpenAI.",
  permissions: ["activeTab", "storage"],
  host_permissions: ["https://api.openai.com/*", "http://*/*", "https://*/*"],
  background: {
    service_worker: "background.js",
    type: "module"
  },
  action: {
    default_popup: "popup.html",
    default_title: "Receptenvanger"
  },
  options_page: "options.html",
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["content.js"],
      run_at: "document_idle"
    }
  ]
};

await writeFile(path.join(distDir, "manifest.json"), JSON.stringify(manifest, null, 2));
