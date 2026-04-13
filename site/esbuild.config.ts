/**
 * esbuild config for the demo site.
 *
 * Bundles React + Ink + rich-js + rich-js-ink + xterm.js into a single
 * browser-compatible JS file with Node built-in polyfills.
 */

import * as esbuild from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFileSync, mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "dist");
const emptyShim = resolve(__dirname, "src/empty-module.ts");
const fsShim = resolve(__dirname, "src/shims/fs.ts");
const ttyShim = resolve(__dirname, "src/shims/tty.ts");
const cpShim = resolve(__dirname, "src/shims/child_process.ts");

mkdirSync(outDir, { recursive: true });

// Copy xterm.css to dist
const xtermCssPath = resolve(__dirname, "node_modules/@xterm/xterm/css/xterm.css");
copyFileSync(xtermCssPath, resolve(outDir, "xterm.css"));

// Copy index.html to dist
copyFileSync(resolve(__dirname, "index.html"), resolve(outDir, "index.html"));

// Mapping of node: protocol imports to their browser polyfills
const nodeProtocolMapping: Record<string, string> = {
  "node:events": "events",
  "node:buffer": "buffer",
  "node:stream": "readable-stream",
  "node:string_decoder": "string_decoder",
  "node:process": resolve(__dirname, "src/process-shim.ts"),
  "node:fs": fsShim,
  "node:tty": ttyShim,
  "node:child_process": cpShim,
  "node:os": emptyShim,
  "node:readline": emptyShim,
  "node:path": emptyShim,
  "node:util": emptyShim,
};

/**
 * esbuild plugin that rewrites `node:*` imports to browser polyfills.
 * esbuild's `alias` option doesn't handle `node:` prefixed imports.
 */
const nodePolyfillPlugin: esbuild.Plugin = {
  name: "node-polyfill",
  setup(build) {
    // Intercept node: protocol imports
    build.onResolve({ filter: /^node:/ }, (args) => {
      const mapped = nodeProtocolMapping[args.path];
      if (mapped) {
        // If it's an absolute path (shim file), return directly
        if (mapped.startsWith("/")) {
          return { path: mapped };
        }
        // Otherwise it's a package name — let esbuild resolve it
        return build.resolve(mapped, {
          resolveDir: args.resolveDir,
          kind: args.kind,
        });
      }
      // Unknown node: import — shim to empty
      return { path: emptyShim };
    });

    // Shim react-devtools-core (optional Ink dev dep)
    build.onResolve({ filter: /^react-devtools-core$/ }, () => {
      return { path: emptyShim };
    });

    // Shim module (used by stack-utils)
    build.onResolve({ filter: /^module$/ }, () => {
      return { path: emptyShim };
    });
  },
};

await esbuild.build({
  entryPoints: [resolve(__dirname, "src/main.ts")],
  bundle: true,
  outfile: resolve(outDir, "main.js"),
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  define: {
    "process.env": "{}",
    "process.env.NODE_ENV": '"production"',
    "process.platform": '"browser"',
    "process.argv": "[]",
    "process.stdin": "undefined",
    "process.stdout": "undefined",
    "process.stderr": "undefined",
    "process.versions": "{}",
    "process.version": '""',
    global: "globalThis",
  },
  alias: {
    // Dedupe React + Ink — prevent multiple copies from file: symlinks.
    // Without this, components from rich-js-ink resolve to ../node_modules/
    // copies while render() uses ./node_modules/ — different context objects.
    react: resolve(__dirname, "node_modules/react"),
    "react/jsx-runtime": resolve(__dirname, "node_modules/react/jsx-runtime.js"),
    "react/jsx-dev-runtime": resolve(__dirname, "node_modules/react/jsx-dev-runtime.js"),
    ink: resolve(__dirname, "node_modules/ink/build/index.js"),
    // Bare module polyfills (non-node: prefix)
    events: "events",
    buffer: "buffer",
    string_decoder: "string_decoder",
    stream: "readable-stream",
    "readable-stream": "readable-stream",
    fs: fsShim,
    tty: ttyShim,
    child_process: cpShim,
    os: emptyShim,
    readline: emptyShim,
    path: emptyShim,
    util: emptyShim,
    module: emptyShim,
    assert: emptyShim,
  },
  plugins: [nodePolyfillPlugin],
  inject: [resolve(__dirname, "src/process-shim-inject.ts")],
  logLevel: "info",
});

console.log("Demo site built to", outDir);
