/**
 * esbuild config for the demo site.
 *
 * Two builds:
 * 1. Browser bundle: xterm.js + CodeMirror + WebContainer API (the playground UI)
 * 2. Node runtime bundle: React + Ink + rich-js + rich-js-ink (runs inside WebContainer)
 *
 * The runtime bundle is mounted into WebContainer's filesystem so demos
 * can `require("rich-js-ink-runtime")` without npm install.
 */

import * as esbuild from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFileSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "dist");
const emptyShim = resolve(__dirname, "src/empty-module.ts");
const fsShim = resolve(__dirname, "src/shims/fs.ts");
const ttyShim = resolve(__dirname, "src/shims/tty.ts");
const cpShim = resolve(__dirname, "src/shims/child_process.ts");

mkdirSync(outDir, { recursive: true });

// --- Build 1: Node runtime bundle ---
// This gets mounted inside WebContainer as a pre-built package.
// Demos import from it — no npm install needed for the core libs.

console.log("Building Node runtime bundle...");

const runtimeEntry = resolve(__dirname, "src/runtime-entry.ts");

// Create the runtime entry point that re-exports everything
writeFileSync(
  runtimeEntry,
  `// Auto-generated runtime entry — re-exports everything demos need
export * from "rich-js-ink";
export { render, Box, Text, useInput, useAnimation, Newline, Spacer } from "ink";
export { default as React } from "react";
export { useState, useEffect, useCallback, useRef, useMemo } from "react";
`,
);

await esbuild.build({
  entryPoints: [runtimeEntry],
  bundle: true,
  outfile: resolve(outDir, "runtime.mjs"),
  format: "esm",
  platform: "node",
  target: "es2022",
  jsx: "automatic",
  // Dedupe to single copies
  alias: {
    react: resolve(__dirname, "node_modules/react"),
    "react/jsx-runtime": resolve(__dirname, "node_modules/react/jsx-runtime.js"),
    ink: resolve(__dirname, "node_modules/ink/build/index.js"),
  },
  // Optional deps that aren't needed at runtime
  external: ["react-devtools-core"],
  logLevel: "info",
});

const runtimeSize = readFileSync(resolve(outDir, "runtime.mjs")).length;
console.log(`Runtime bundle: ${(runtimeSize / 1024).toFixed(0)} KB`);

// --- Build 2: Browser playground UI ---

console.log("Building browser UI...");

// Copy static assets
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

// Clean up generated file
try {
  (await import("node:fs/promises")).unlink(runtimeEntry);
} catch {}

console.log("Demo site built to", outDir);
