/**
 * esbuild config for the demo site.
 *
 * Bundles the playground UI (xterm.js + CodeMirror + WebContainer API).
 * The actual React/Ink/rich-js-ink code runs inside WebContainer's
 * Node.js runtime, not in the browser — no Node polyfills needed.
 */

import * as esbuild from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFileSync, mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "dist");

mkdirSync(outDir, { recursive: true });

// Copy static assets to dist
copyFileSync(
  resolve(__dirname, "node_modules/@xterm/xterm/css/xterm.css"),
  resolve(outDir, "xterm.css"),
);
copyFileSync(resolve(__dirname, "index.html"), resolve(outDir, "index.html"));
copyFileSync(
  resolve(__dirname, "src/coi-serviceworker.js"),
  resolve(outDir, "coi-serviceworker.js"),
);

await esbuild.build({
  entryPoints: [resolve(__dirname, "src/main.ts")],
  bundle: true,
  outfile: resolve(outDir, "main.js"),
  format: "esm",
  platform: "browser",
  target: "es2022",
  logLevel: "info",
});

console.log("Demo site built to", outDir);
