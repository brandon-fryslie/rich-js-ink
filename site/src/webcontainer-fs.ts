/**
 * WebContainer filesystem tree — demo files mounted at boot.
 *
 * Each demo is a standalone .tsx file that can be run with:
 *   npx tsx demos/<name>.tsx
 */

import type { FileSystemTree } from "@webcontainer/api";
import { demos } from "./demos.js";

function wrapDemo(code: string): string {
  // Detect if the code defines its own component function
  const isComponentDef =
    /^(?:function|const|let|var)\s/.test(code.trim()) ||
    code.trim().startsWith("return ");

  if (isComponentDef) {
    // Code defines a component and returns it — wrap in render()
    return `import React, { useState, useEffect, useCallback, useRef } from "react";
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

${code}

const Component = (() => { ${code} })();
render(React.createElement(RichThemeProvider, null, React.createElement(Component)));
`;
  }

  // Plain JSX — wrap in a component + render
  return `import React, { useState, useEffect, useCallback, useRef } from "react";
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

export function buildFileSystem(): FileSystemTree {
  const demoFiles: FileSystemTree = {};

  for (const demo of demos) {
    const filename = demo.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "");
    demoFiles[`${filename}.tsx`] = {
      file: { contents: wrapDemo(demo.code) },
    };
  }

  return {
    "package.json": {
      file: {
        contents: JSON.stringify(
          {
            name: "rich-js-ink-playground",
            private: true,
            type: "module",
            dependencies: {
              "rich-js-ink": "latest",
              ink: "^7.0.0",
              react: "^19.2.5",
              tsx: "^4.21.0",
            },
          },
          null,
          2,
        ),
      },
    },
    demos: { directory: demoFiles },
    "demo.tsx": {
      file: {
        contents: wrapDemo(demos[0]!.code),
      },
    },
  };
}

export function getDemoFilename(index: number): string {
  const demo = demos[index]!;
  return demo.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "");
}
