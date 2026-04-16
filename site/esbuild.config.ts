/**
 * esbuild config for the demo site.
 *
 * Builds:
 * 1. main.js         — browser playground (xterm.js + CodeMirror + WebContainer)
 * 2. prebuild.bin    — WebContainer snapshot with node_modules + pre-compiled demos
 *
 * Demos are pre-compiled from JSX to plain JS at build time (host esbuild).
 * WebContainer just runs `node demo.js` — no tsx, no runtime JSX transform.
 * For live edits, esbuild-wasm in the browser recompiles on the fly.
 */

import * as esbuild from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  copyFileSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  rmSync,
  readdirSync,
  unlinkSync,
} from "node:fs";
import { execSync } from "node:child_process";
import { snapshot } from "@webcontainer/snapshot";
import { demos } from "./src/demos.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "dist");
const prebuildDir = resolve(__dirname, ".prebuild");

mkdirSync(outDir, { recursive: true });

// --- 1. Copy static assets ---
copyFileSync(
  resolve(__dirname, "node_modules/@xterm/xterm/css/xterm.css"),
  resolve(outDir, "xterm.css"),
);
copyFileSync(resolve(__dirname, "index.html"), resolve(outDir, "index.html"));
copyFileSync(
  resolve(__dirname, "src/coi-serviceworker.js"),
  resolve(outDir, "coi-serviceworker.js"),
);

// Copy esbuild-wasm WASM binary for browser-side JSX compilation
copyFileSync(
  resolve(__dirname, "node_modules/esbuild-wasm/esbuild.wasm"),
  resolve(outDir, "esbuild.wasm"),
);

// --- 2. Build browser bundle ---
await esbuild.build({
  entryPoints: [resolve(__dirname, "src/main.ts")],
  bundle: true,
  outfile: resolve(outDir, "main.js"),
  format: "esm",
  platform: "browser",
  target: "es2022",
  logLevel: "info",
});

// --- 3. Build WebContainer prebuild snapshot ---

function wrapDemo(code: string): string {
  const isComponentDef =
    /^(?:function|const|let|var)\s/.test(code.trim()) ||
    code.trim().startsWith("return ");

  const imports = `import React, { useState, useEffect, useCallback, useRef } from "react";
import { render, Box, Text, useInput } from "ink";
import {
  RichPanel, RichTable, RichTree, RichMarkup, RichRule,
  RichSyntax, RichMarkdown, RichJSON, RichPretty, RichColumns,
  RichTraceback, RichSpinner, RichProgressBar, RichStatus,
  RichProgress, RichPrompt, RichConfirm, RichSelect,
  RichThemeProvider, useProgress, useSpinnerFrame, useRichRenderable,
  renderToString, Style, RichText, renderMarkup, ColorSystem,
  SPINNERS, DEFAULT_SPINNER,
  ROUNDED, DOUBLE, HEAVY, ASCII, SQUARE, MINIMAL, MARKDOWN, HORIZONTALS, SIMPLE, ASCII2,
} from "rich-js-ink";
`;

  if (isComponentDef) {
    return `${imports}
const Component = (() => { ${code} })();
render(React.createElement(RichThemeProvider, null, React.createElement(Component)));
`;
  }

  return `${imports}
function App() {
  return (
    <RichThemeProvider>
      ${code}
    </RichThemeProvider>
  );
}
render(React.createElement(App));
`;
}

function demoFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "");
}

const NODE_BUILTINS_EXTERNAL = [
  "node:*", "fs", "path", "os", "process", "stream", "tty", "util",
  "events", "buffer", "string_decoder", "readline", "child_process",
  "module", "url", "assert",
];

const STUB_DEVTOOLS_PLUGIN: esbuild.Plugin = {
  name: "stub-devtools",
  setup(b) {
    b.onResolve({ filter: /^react-devtools-core$/ }, () => ({
      path: "react-devtools-core", namespace: "stub",
    }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
      contents: "export function connectToDevTools(){};export default { connectToDevTools(){} };",
      loader: "js",
    }));
  },
};

/**
 * Build the shared lib.js that re-exports everything a demo needs.
 * All demos import from "./lib.js" instead of "ink"/"react"/"rich-js-ink",
 * so React/Ink are initialized once and shared.
 */
async function buildSharedLib(outPath: string): Promise<void> {
  const libSource = `
import * as ReactStar from "react";
const React = ReactStar.default ?? ReactStar;
export default React;
export { React };
export * from "react";
export { render, Box, Text, useInput } from "ink";
export * from "rich-js-ink";
`;
  const tempLibEntry = resolve(prebuildDir, "__lib.tsx");
  writeFileSync(tempLibEntry, libSource);
  await esbuild.build({
    entryPoints: [tempLibEntry],
    bundle: true,
    outfile: outPath,
    format: "esm",
    platform: "node",
    target: "node20",
    external: NODE_BUILTINS_EXTERNAL,
    plugins: [STUB_DEVTOOLS_PLUGIN],
    loader: { ".tsx": "tsx", ".ts": "ts", ".js": "js" },
    jsx: "automatic",
    jsxImportSource: "react",
    resolveExtensions: [".tsx", ".ts", ".mjs", ".js"],
    nodePaths: [resolve(__dirname, "node_modules")],
    mainFields: ["module", "main"],
    // Dedupe React/Ink: force all import paths to resolve to our single copy,
    // even the nested ones from rich-js-ink/node_modules. Multiple copies
    // cause "Invalid hook call" errors.
    alias: {
      react: resolve(__dirname, "node_modules/react"),
      "react/jsx-runtime": resolve(__dirname, "node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": resolve(__dirname, "node_modules/react/jsx-dev-runtime.js"),
      ink: resolve(__dirname, "node_modules/ink/build/index.js"),
    },
    // Inject real require() from Node's module module so bundled CJS modules
    // that do require("assert") etc. work at runtime.
    banner: {
      js: `import { createRequire as __esbuildCreateRequire } from "node:module"; const require = __esbuildCreateRequire(import.meta.url);`,
    },
  });
  unlinkSync(tempLibEntry);
}

/**
 * Bundle a demo against the shared lib.js.
 * Demos are tiny (~1KB each) since all deps are in lib.js.
 */
async function bundleDemo(source: string, tempPath: string): Promise<string> {
  // Rewrite all third-party imports to ./lib.js
  const rewritten = source
    .replace(/from ["']react["']/g, 'from "./lib.js"')
    .replace(/from ["']react\/[^"']+["']/g, 'from "./lib.js"')
    .replace(/from ["']ink["']/g, 'from "./lib.js"')
    .replace(/from ["']rich-js-ink["']/g, 'from "./lib.js"');

  writeFileSync(tempPath, rewritten);
  const result = await esbuild.transform(rewritten, {
    loader: "tsx",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    format: "esm",
    target: "esnext",
  });
  return result.code;
}

console.log("Building WebContainer prebuild snapshot...");

// Set up prebuild dir — only needs bundled demo files + package.json (no node_modules!)
if (existsSync(prebuildDir)) {
  rmSync(prebuildDir, { recursive: true });
}
mkdirSync(prebuildDir, { recursive: true });

// Minimal package.json (type: module for ESM imports)
writeFileSync(
  resolve(prebuildDir, "package.json"),
  JSON.stringify({ name: "playground", private: true, type: "module" }, null, 2),
);

// Build the shared lib.js (react + ink + rich-js-ink bundled together).
// All demos import from "./lib.js" instead of the packages directly.
console.log("  Building shared lib.js...");
await buildSharedLib(resolve(prebuildDir, "lib.js"));

// Bundle each demo — tiny files that just import from ./lib.js
console.log("  Bundling demos...");
const tempEntry = resolve(prebuildDir, "__entry.tsx");
writeFileSync(
  resolve(prebuildDir, "demo.js"),
  await bundleDemo(wrapDemo(demos[0]!.code), tempEntry),
);
// Put all demos at top level so they can all `import from "./lib.js"`
for (const demo of demos) {
  writeFileSync(
    resolve(prebuildDir, `${demoFilename(demo.title)}.js`),
    await bundleDemo(wrapDemo(demo.code), tempEntry),
  );
}
unlinkSync(tempEntry);

// Snapshot
console.log("  Creating snapshot...");
const snap = await snapshot(prebuildDir);
writeFileSync(resolve(outDir, "prebuild.bin"), snap);

console.log(`  Snapshot: ${(snap.length / 1024 / 1024).toFixed(1)} MB`);
console.log("Demo site built to", outDir);
