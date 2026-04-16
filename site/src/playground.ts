/**
 * Playground controller — 3-column live playground with real terminal.
 *
 *   Column 1: Demo selector
 *   Column 2: CodeMirror editor
 *   Column 3: xterm.js terminal connected to WebContainer shell
 *
 * WebContainer provides a real Node.js runtime in the browser.
 * The runtime bundle (React + Ink + rich-js-ink) is pre-built and
 * mounted directly — no npm install needed.
 */

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebContainer } from "@webcontainer/api";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import { demos } from "./demos.js";
import { loadRuntime, buildFileSystem, wrapDemoCode } from "./webcontainer-fs.js";

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
    this.selectDemo(0, false);
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

    const resizeObserver = new ResizeObserver(() => {
      this.fitAddon?.fit();
    });
    resizeObserver.observe(this.terminalEl);

    this.terminal.writeln("\x1b[1;36mrich-js-ink playground\x1b[0m");
    this.terminal.writeln("\x1b[2mStarting...\x1b[0m");
  }

  private setStatus(msg: string): void {
    this.statusEl.textContent = msg;
  }

  private async bootWebContainer(): Promise<void> {
    try {
      // WebContainer requires cross-origin isolation (for SharedArrayBuffer).
      // coi-serviceworker provides this on GitHub Pages, but needs a reload
      // on first visit to activate.
      if (!self.crossOriginIsolated) {
        this.terminal?.writeln("\x1b[1;33mFirst visit: activating service worker...\x1b[0m");
        this.terminal?.writeln("\x1b[2mThe page will reload once automatically.\x1b[0m");
        this.setStatus("Waiting for service worker — reload if stuck");
        // coi-serviceworker will reload automatically; if it doesn't, give up after 5s
        setTimeout(() => {
          this.setStatus("Not cross-origin isolated. Reload the page.");
          this.terminal?.writeln("\r\n\x1b[1;31mReload the page to activate the service worker.\x1b[0m");
        }, 5000);
        return;
      }

      this.setStatus("Loading runtime + booting WebContainer...");

      const [wc] = await Promise.all([
        WebContainer.boot(),
        loadRuntime(),
      ]);

      this.webcontainer = wc;

      this.setStatus("Mounting files...");
      await this.webcontainer.mount(buildFileSystem());

      // Start shell immediately — no npm install needed
      await this.startShell();

      this.isReady = true;
      this.setStatus("Ready");
      this.terminal?.writeln("\x1b[1;32mReady!\x1b[0m Type \x1b[1mnode demo.mjs\x1b[0m or click a demo + Run\r\n");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.terminal?.writeln(`\r\n\x1b[1;31mError: ${msg}\x1b[0m`);
      if (msg.includes("cloned") || msg.includes("SharedArrayBuffer")) {
        this.terminal?.writeln(`\x1b[2mTry reloading the page — the service worker may need to activate.\x1b[0m`);
      }
      this.setStatus(`Error: ${msg}`);
    }
  }

  private async startShell(): Promise<void> {
    const shellProcess = await this.webcontainer!.spawn("jsh", {
      terminal: {
        cols: this.terminal!.cols,
        rows: this.terminal!.rows,
      },
    });

    shellProcess.output.pipeTo(
      new WritableStream({
        write: (data) => {
          this.terminal?.write(data);
        },
      }),
    );

    const input = shellProcess.input.getWriter();
    this.shellWriter = input;
    this.terminal!.onData((data) => {
      input.write(data);
    });

    this.terminal!.onResize(({ cols, rows }) => {
      shellProcess.resize({ cols, rows });
    });
  }

  selectDemo(index: number, run: boolean): void {
    const demo = demos[index];
    if (!demo) return;

    const items = this.selectorEl.querySelectorAll(".demo-item");
    items.forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });

    this.selectedIndex = index;

    if (this.editor) {
      this.editor.dispatch({
        changes: {
          from: 0,
          to: this.editor.state.doc.length,
          insert: demo.code,
        },
      });
    }

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
    const fullCode = wrapDemoCode(code);
    await this.webcontainer.fs.writeFile("demo.mjs", fullCode);
  }

  async runCurrentDemo(): Promise<void> {
    await this.writeDemoFile();

    if (this.shellWriter) {
      this.shellWriter.write("\x03"); // Ctrl+C to kill previous
      await new Promise((r) => setTimeout(r, 100));
      this.shellWriter.write("node demo.mjs\n");
    }
  }

  destroy(): void {
    this.editor?.destroy();
    this.terminal?.dispose();
    this.webcontainer?.teardown();
  }
}
