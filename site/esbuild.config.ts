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

/**
 * Transform JSX → plain JS using host esbuild.
 * Output: a string that's valid JS with React.createElement calls.
 */
function compileJSX(code: string): string {
  const result = esbuild.transformSync(code, {
    loader: "tsx",
    jsx: "automatic",
    jsxImportSource: "react",
    target: "esnext",
    format: "esm",
  });
  return result.code;
}

console.log("Building WebContainer prebuild snapshot...");

// Set up prebuild dir
if (existsSync(prebuildDir)) {
  rmSync(prebuildDir, { recursive: true });
}
mkdirSync(prebuildDir, { recursive: true });

writeFileSync(
  resolve(prebuildDir, "package.json"),
  JSON.stringify(
    {
      name: "rich-js-ink-playground",
      private: true,
      type: "module",
      dependencies: {
        ink: "^7.0.0",
        react: "^19.2.5",
        "rich-js-ink": `file:${resolve(__dirname, "..")}`,
      },
    },
    null,
    2,
  ),
);

// Write initial demo (pre-compiled to .js) and all demos as .js
writeFileSync(resolve(prebuildDir, "demo.js"), compileJSX(wrapDemo(demos[0]!.code)));
mkdirSync(resolve(prebuildDir, "demos"), { recursive: true });
for (const demo of demos) {
  writeFileSync(
    resolve(prebuildDir, "demos", `${demoFilename(demo.title)}.js`),
    compileJSX(wrapDemo(demo.code)),
  );
}

// Install ONLY runtime deps (no tsx — we pre-compile).
// --install-links: resolve file: deps by copying files instead of symlinks.
// --no-bin-links: skip .bin/ symlinks (snapshot can't handle symlinks).
console.log("  Running npm install (runtime deps only)...");
execSync(
  "npm install --install-links --no-bin-links --prefer-offline --no-audit --no-fund --silent",
  { cwd: prebuildDir, stdio: "inherit" },
);

// Strip symlinks + bloat
const STRIPPABLE_DIRS = new Set([
  "test",
  "tests",
  "__tests__",
  "docs",
  "example",
  "examples",
]);
const STRIPPABLE_FILE_EXTS = [".map", ".md", ".markdown"];
const STRIPPABLE_FILES = new Set([
  "LICENSE",
  "LICENCE",
  "CHANGELOG.md",
  "CHANGELOG",
  "HISTORY.md",
]);

function stripBloat(dir: string): void {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isSymbolicLink()) {
      unlinkSync(full);
    } else if (entry.isDirectory()) {
      if (STRIPPABLE_DIRS.has(entry.name)) {
        rmSync(full, { recursive: true, force: true });
      } else {
        stripBloat(full);
      }
    } else if (entry.isFile()) {
      if (
        STRIPPABLE_FILES.has(entry.name) ||
        STRIPPABLE_FILE_EXTS.some((ext) => entry.name.endsWith(ext))
      ) {
        unlinkSync(full);
      }
    }
  }
}
stripBloat(prebuildDir);

// Snapshot
console.log("  Creating snapshot...");
const snap = await snapshot(prebuildDir);
writeFileSync(resolve(outDir, "prebuild.bin"), snap);

console.log(`  Snapshot: ${(snap.length / 1024 / 1024).toFixed(1)} MB`);
console.log("Demo site built to", outDir);
