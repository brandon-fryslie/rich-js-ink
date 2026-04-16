/**
 * WebContainer filesystem tree — pre-built runtime + demo files.
 *
 * The runtime.mjs bundle (built by esbuild at build time) contains
 * React + Ink + rich-js + rich-js-ink pre-bundled. Demos import from it
 * directly — no npm install needed.
 *
 * Each demo runs with: node demo.mjs
 */

import type { FileSystemTree } from "@webcontainer/api";
import { transform } from "sucrase";
import { demos } from "./demos.js";

// The runtime bundle content is fetched at page load time from runtime.mjs
// (served alongside main.js). We store it here after fetch.
let runtimeContent = "";

export async function loadRuntime(): Promise<void> {
  const resp = await fetch("runtime.mjs");
  runtimeContent = await resp.text();
}

const IMPORT_HEADER = `import {
  React, useState, useEffect, useCallback, useRef, useMemo,
  render, Box, Text, useInput,
  RichPanel, RichTable, RichTree, RichMarkup, RichRule,
  RichSyntax, RichMarkdown, RichJSON, RichPretty, RichColumns,
  RichTraceback, RichSpinner, RichProgressBar, RichStatus,
  RichProgress, RichPrompt, RichConfirm, RichSelect,
  RichThemeProvider, useProgress, useSpinnerFrame, useRichRenderable,
  renderToString, Style, RichText, renderMarkup, ColorSystem,
  SPINNERS, DEFAULT_SPINNER,
  ROUNDED, DOUBLE, HEAVY, ASCII, SQUARE, MINIMAL, MARKDOWN, HORIZONTALS, SIMPLE, ASCII2,
} from "./runtime.mjs";
`;

export function wrapDemoCode(code: string): string {
  const isComponentDef =
    /^(?:function|const|let|var)\s/.test(code.trim()) ||
    code.trim().startsWith("return ");

  // Build the full source (including JSX), then transform JSX → React.createElement.
  // Node.js can't parse JSX natively; sucrase transforms it in the browser.
  let source: string;
  if (isComponentDef) {
    source = `${IMPORT_HEADER}
const Component = (() => { ${code} })();
render(React.createElement(RichThemeProvider, null, React.createElement(Component)));
`;
  } else {
    source = `${IMPORT_HEADER}
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

  // Transform JSX to React.createElement calls
  const { code: transformed } = transform(source, {
    transforms: ["jsx"],
    jsxRuntime: "classic",
    jsxPragma: "React.createElement",
    jsxFragmentPragma: "React.Fragment",
    production: true,
  });

  return transformed;
}

export function buildFileSystem(): FileSystemTree {
  return {
    "package.json": {
      file: {
        contents: JSON.stringify({
          name: "playground",
          private: true,
          type: "module",
        }),
      },
    },
    "runtime.mjs": {
      file: { contents: runtimeContent },
    },
    "demo.mjs": {
      file: { contents: wrapDemoCode(demos[0]!.code) },
    },
  };
}
