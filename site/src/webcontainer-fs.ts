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

  if (isComponentDef) {
    return `${IMPORT_HEADER}
const Component = (() => { ${code} })();
render(React.createElement(RichThemeProvider, null, React.createElement(Component)));
`;
  }

  return `${IMPORT_HEADER}
function App() {
  return React.createElement(RichThemeProvider, null,
    ${code.includes("<") ? `(() => { return (${code}); })()` : code}
  );
}

render(React.createElement(App));
`;
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
