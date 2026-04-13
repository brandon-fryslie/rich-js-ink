/**
 * Demo site entry point — mounts real Ink apps into xterm.js terminals.
 *
 * Each demo section gets its own xterm.js Terminal instance, and Ink's
 * render() writes directly into it via the XtermWriteStream adapter.
 * Spinners spin, progress bars animate, interactive components accept input.
 */

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { render } from "ink";
import React from "react";
import { XtermWriteStream, XtermReadStream } from "./xterm-ink-adapter.js";
import { demos } from "./demos.js";

const TERM_COLS = 80;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mountDemo(container: HTMLElement, idx: number): void {
  const demo = demos[idx]!;
  const termRows = demo.rows ?? 8;

  // Create terminal container
  const termEl = container.querySelector<HTMLElement>(".terminal-mount")!;

  const terminal = new Terminal({
    cols: TERM_COLS,
    rows: termRows,
    cursorBlink: false,
    cursorStyle: "bar",
    cursorInactiveStyle: "none",
    disableStdin: false,
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

  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(termEl);

  // Create Ink-compatible stream adapters
  const stdout = new XtermWriteStream(terminal) as unknown as NodeJS.WriteStream;
  const stdin = new XtermReadStream(terminal) as unknown as NodeJS.ReadStream;
  const stderr = new XtermWriteStream(terminal) as unknown as NodeJS.WriteStream;

  // Render the real Ink app into the xterm.js terminal
  render(React.createElement(demo.component), {
    stdout,
    stdin,
    stderr,
    exitOnCtrlC: false,
    patchConsole: false,
  });
}

// --- Build the page ---

function buildPage(): void {
  const container = document.getElementById("app")!;

  let html = `
    <header>
      <h1>rich-js-ink</h1>
      <p class="tagline">Rich terminal renderables as declarative React components for Ink</p>
      <p class="tagline-sub">Every terminal below is a <strong>live Ink app</strong> rendering into <a href="https://xtermjs.org">xterm.js</a></p>
      <div class="badges">
        <span class="badge badge-components">16 components</span>
        <span class="badge badge-hooks">4 hooks</span>
        <span class="badge badge-animated">animated + interactive</span>
      </div>
    </header>

    <div class="architecture">
      <span class="flow">Props</span>
      <span class="arrow"> → </span>
      <span class="flow">rich-js Renderable</span>
      <span class="arrow"> → </span>
      <span class="flow">Segment[]</span>
      <span class="arrow"> → </span>
      <span class="flow">ANSI string</span>
      <span class="arrow"> → </span>
      <span class="flow">&lt;Text&gt;{ansi}&lt;/Text&gt;</span>
      <span class="arrow"> → </span>
      <span class="flow">xterm.js</span>
    </div>
  `;

  for (let i = 0; i < demos.length; i++) {
    const demo = demos[i]!;
    html += `
    <section class="demo-section">
      <h2>${escapeHtml(demo.title)}</h2>
      <p class="description">${escapeHtml(demo.description)}</p>
      <div class="demo-grid">
        <div class="code-panel">
          <div class="panel-label">JSX</div>
          <pre><code>${escapeHtml(demo.code)}</code></pre>
        </div>
        <div class="output-panel" data-demo-idx="${i}">
          <div class="panel-label">Live Output</div>
          <div class="terminal-mount"></div>
        </div>
      </div>
    </section>`;
  }

  html += `
    <footer>
      <p>
        <a href="https://github.com/brandon-fryslie/rich-js-ink">GitHub</a>
        ·
        <a href="https://github.com/brandon-fryslie/rich-js">rich-js</a>
        ·
        <a href="https://github.com/vadimdemedes/ink">Ink</a>
        ·
        <a href="https://xtermjs.org">xterm.js</a>
      </p>
    </footer>
  `;

  container.innerHTML = html;

  // Mount each demo's Ink app into its xterm.js terminal
  const panels = container.querySelectorAll<HTMLElement>(".output-panel[data-demo-idx]");
  for (const panel of panels) {
    const idx = parseInt(panel.dataset.demoIdx!, 10);
    mountDemo(panel, idx);
  }
}

buildPage();
