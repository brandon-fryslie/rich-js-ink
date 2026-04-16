/**
 * Playground controller — 3-column live playground with real terminal.
 *
 *   Column 1: Demo selector
 *   Column 2: CodeMirror editor
 *   Column 3: xterm.js terminal connected to WebContainer shell
 *
 * WebContainer provides a real Node.js runtime in the browser.
 * Users get a real shell prompt and can run demos with `node demo.js`.
 */

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebContainer } from "@webcontainer/api";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import * as esbuildWasm from "esbuild-wasm";
import { demos } from "./demos.js";

let esbuildReady: Promise<void> | null = null;
function initEsbuild(): Promise<void> {
  if (!esbuildReady) {
    esbuildReady = esbuildWasm.initialize({
      wasmURL: "esbuild.wasm",
    });
  }
  return esbuildReady;
}

export class Playground {
  private selectorEl: HTMLElement;
  private editorEl: HTMLElement;
  private terminalEl: HTMLElement;
  private statusEl: HTMLElement;

  private editor: EditorView | null = null;
  private terminal: Terminal | null = null;
  private fitAddon: FitAddon | null = null;
  private webcontainer: WebContainer | null = null;
  private shellWriter: WritableStreamDefaultWriter<string> | null = null;
  private selectedIndex = -1;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isReady = false;

  constructor(
    selectorEl: HTMLElement,
    editorEl: HTMLElement,
    terminalEl: HTMLElement,
    statusEl: HTMLElement,
  ) {
    this.selectorEl = selectorEl;
    this.editorEl = editorEl;
    this.terminalEl = terminalEl;
    this.statusEl = statusEl;
  }

  async init(): Promise<void> {
    this.buildSelector();
    this.initEditor();
    this.initTerminal();
    this.selectDemo(0, false); // Load first demo into editor, don't run yet

    // Teardown WebContainer on navigation to prevent stale SharedWorker state
    // across page refreshes (which otherwise breaks the next boot).
    window.addEventListener("beforeunload", () => {
      try {
        this.webcontainer?.teardown();
      } catch {
        // ignore
      }
    });

    await this.bootWebContainer();
  }

  private buildSelector(): void {
    const ul = document.createElement("ul");
    ul.className = "demo-list";

    for (let i = 0; i < demos.length; i++) {
      const demo = demos[i]!;
      const li = document.createElement("li");
      li.className = "demo-item";
      li.dataset.idx = String(i);
      li.innerHTML = `<span class="demo-title">${demo.title}</span><span class="demo-desc">${demo.description}</span>`;
      li.addEventListener("click", () => this.selectDemo(i, true));
      ul.appendChild(li);
    }

    this.selectorEl.appendChild(ul);
  }

  private initEditor(): void {
    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        this.onCodeChange();
      }
    });

    this.editor = new EditorView({
      state: EditorState.create({
        doc: "",
        extensions: [
          basicSetup,
          javascript({ jsx: true, typescript: true }),
          oneDark,
          updateListener,
          EditorView.lineWrapping,
          EditorView.theme({
            "&": { height: "100%", fontSize: "13px" },
            ".cm-scroller": { overflow: "auto" },
            ".cm-content": { fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace" },
            ".cm-gutters": { fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace" },
          }),
        ],
      }),
      parent: this.editorEl,
    });
  }

  private initTerminal(): void {
    this.terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: "bar",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', Consolas, monospace",
      fontSize: 13,
      lineHeight: 1.2,
      theme: {
        background: "#0d1117",
        foreground: "#c9d1d9",
        cursor: "#c9d1d9",
        cursorAccent: "#0d1117",
        selectionBackground: "#264f78",
        black: "#484f58",
        red: "#ff7b72",
        green: "#3fb950",
        yellow: "#d29922",
        blue: "#58a6ff",
        magenta: "#bc8cff",
        cyan: "#39c5cf",
        white: "#c9d1d9",
        brightBlack: "#6e7681",
        brightRed: "#ffa198",
        brightGreen: "#56d364",
        brightYellow: "#e3b341",
        brightBlue: "#79c0ff",
        brightMagenta: "#d2a8ff",
        brightCyan: "#56d4dd",
        brightWhite: "#f0f6fc",
      },
    });

    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(this.terminalEl);
    this.fitAddon.fit();

    // Re-fit on window resize
    const resizeObserver = new ResizeObserver(() => {
      this.fitAddon?.fit();
    });
    resizeObserver.observe(this.terminalEl);

    this.terminal.writeln("\x1b[1;36mrich-js-ink playground\x1b[0m");
    this.terminal.writeln("\x1b[2mBooting WebContainer...\x1b[0m");
  }

  private setStatus(msg: string): void {
    this.statusEl.textContent = msg;
  }

  private async bootWebContainer(): Promise<void> {
    try {
      // Start fetching the prebuilt snapshot in parallel with WebContainer.boot()
      this.setStatus("Fetching prebuilt environment...");
      this.terminal?.writeln("\x1b[2mFetching prebuilt environment + booting...\x1b[0m");

      const [snapshotBuf, wc] = await Promise.all([
        fetch("prebuild.bin").then((r) => {
          if (!r.ok) throw new Error(`Failed to fetch prebuild.bin: ${r.status}`);
          return r.arrayBuffer();
        }),
        WebContainer.boot(),
      ]);

      this.webcontainer = wc;

      this.setStatus("Mounting prebuilt environment...");
      this.terminal?.writeln("\x1b[2mMounting prebuilt node_modules + demos...\x1b[0m");
      // Pass ArrayBuffer directly — WebContainer transfers (not clones) it.
      await this.webcontainer.mount(snapshotBuf);

      this.terminal?.writeln("\r\n\x1b[1;32mReady!\x1b[0m Run demos with: \x1b[1mnode demo.js\x1b[0m\r\n");

      // Start shell
      await this.startShell();

      this.isReady = true;
      this.setStatus("Ready — select a demo and press Run");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : "";
      this.terminal?.writeln(`\r\n\x1b[1;31mError: ${msg}\x1b[0m`);
      if (stack) {
        this.terminal?.writeln(`\x1b[2m${stack.split("\n").slice(0, 5).join("\r\n")}\x1b[0m`);
      }
      this.terminal?.writeln(
        `\r\n\x1b[1;33mTry: hard refresh (Cmd/Ctrl+Shift+R) to clear service worker cache\x1b[0m`,
      );
      this.setStatus(`Error — see terminal`);
    }
  }

  private async startShell(): Promise<void> {
    const shellProcess = await this.webcontainer!.spawn("jsh", {
      terminal: {
        cols: this.terminal!.cols,
        rows: this.terminal!.rows,
      },
    });

    // Pipe shell output → xterm.js
    shellProcess.output.pipeTo(
      new WritableStream({
        write: (data) => {
          this.terminal?.write(data);
        },
      }),
    );

    // Pipe xterm.js input → shell
    const input = shellProcess.input.getWriter();
    this.shellWriter = input;
    this.terminal!.onData((data) => {
      input.write(data);
    });

    // Resize shell when terminal resizes
    this.terminal!.onResize(({ cols, rows }) => {
      shellProcess.resize({ cols, rows });
    });
  }

  selectDemo(index: number, run: boolean): void {
    const demo = demos[index];
    if (!demo) return;

    // Update selector highlight
    const items = this.selectorEl.querySelectorAll(".demo-item");
    items.forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });

    this.selectedIndex = index;

    // Update editor content
    if (this.editor) {
      this.editor.dispatch({
        changes: {
          from: 0,
          to: this.editor.state.doc.length,
          insert: demo.code,
        },
      });
    }

    // Write demo file and run it
    if (run && this.isReady) {
      this.runCurrentDemo();
    }

    this.terminal?.focus();
  }

  private onCodeChange(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.writeDemoFile();
    }, 500);
  }

  private async writeDemoFile(): Promise<void> {
    if (!this.webcontainer || !this.editor) return;

    const code = this.editor.state.doc.toString();
    const demo = demos[this.selectedIndex];
    if (!demo) return;

    // Build the wrapped JSX source from the editor code
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

    const jsxSource = isComponentDef
      ? `${imports}
const Component = (() => { ${code} })();
render(React.createElement(RichThemeProvider, null, React.createElement(Component)));
`
      : `${imports}
function App() {
  return (
    <RichThemeProvider>
      ${code}
    </RichThemeProvider>
  );
}
render(React.createElement(App));
`;

    // Rewrite third-party imports → "./lib.js" (matches build-time layout)
    const rewritten = jsxSource
      .replace(/from ["']react["']/g, 'from "./lib.js"')
      .replace(/from ["']react\/[^"']+["']/g, 'from "./lib.js"')
      .replace(/from ["']ink["']/g, 'from "./lib.js"')
      .replace(/from ["']rich-js-ink["']/g, 'from "./lib.js"');

    // Compile JSX → plain JS via esbuild-wasm
    await initEsbuild();
    const result = await esbuildWasm.transform(rewritten, {
      loader: "tsx",
      jsx: "transform",
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
      target: "esnext",
      format: "esm",
    });

    await this.webcontainer.fs.writeFile("demo.js", result.code);
  }

  async runCurrentDemo(): Promise<void> {
    try {
      await this.writeDemoFile();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.terminal?.writeln(`\r\n\x1b[1;31mCompile error: ${msg}\x1b[0m`);
      return;
    }

    // Send Ctrl+C to kill any running process, then run the demo
    if (this.shellWriter) {
      this.shellWriter.write("\x03"); // Ctrl+C
      await new Promise((r) => setTimeout(r, 100));
      this.shellWriter.write("node demo.js\n");
    }
  }

  destroy(): void {
    this.editor?.destroy();
    this.terminal?.dispose();
    this.webcontainer?.teardown();
  }
}
