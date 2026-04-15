/**
 * Playground controller — wires the 3-column layout:
 *   Column 1: Demo selector
 *   Column 2: CodeMirror editor
 *   Column 3: xterm.js live terminal
 *
 * When a demo is selected, the editor populates with its code.
 * When the editor changes, the terminal re-renders the component.
 */

import { Terminal } from "@xterm/xterm";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import { transform } from "sucrase";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { render as inkRender, Box, Text, useInput } from "ink";
import {
  RichPanel,
  RichTable,
  RichTree,
  RichMarkup,
  RichRule,
  RichSyntax,
  RichMarkdown,
  RichJSON,
  RichPretty,
  RichColumns,
  RichTraceback,
  RichSpinner,
  RichProgressBar,
  RichStatus,
  RichProgress,
  RichPrompt,
  RichConfirm,
  RichSelect,
  RichThemeProvider,
  useProgress,
  useSpinnerFrame,
  useRichRenderable,
  renderToString,
  Style,
  RichText,
  renderMarkup,
  ColorSystem,
  SPINNERS,
  DEFAULT_SPINNER,
  ROUNDED,
  DOUBLE,
  HEAVY,
  ASCII,
  SQUARE,
  MINIMAL,
  MARKDOWN,
  HORIZONTALS,
  SIMPLE,
  ASCII2,
} from "rich-js-ink";
import { XtermWriteStream, XtermReadStream } from "./xterm-ink-adapter.js";
import { demos, type Demo } from "./demos.js";

// --- Scope for eval'd code ---
// All exports available inside the editor code
const evalScope: Record<string, unknown> = {
  React,
  useState,
  useEffect,
  useCallback,
  useRef,
  Box,
  Text,
  useInput,
  RichPanel,
  RichTable,
  RichTree,
  RichMarkup,
  RichRule,
  RichSyntax,
  RichMarkdown,
  RichJSON,
  RichPretty,
  RichColumns,
  RichTraceback,
  RichSpinner,
  RichProgressBar,
  RichStatus,
  RichProgress,
  RichPrompt,
  RichConfirm,
  RichSelect,
  RichThemeProvider,
  useProgress,
  useSpinnerFrame,
  useRichRenderable,
  renderToString,
  Style,
  RichText,
  renderMarkup,
  ColorSystem,
  SPINNERS,
  DEFAULT_SPINNER,
  ROUNDED,
  DOUBLE,
  HEAVY,
  ASCII,
  SQUARE,
  MINIMAL,
  MARKDOWN,
  HORIZONTALS,
  SIMPLE,
  ASCII2,
};

const TERM_COLS = 60;

export class Playground {
  private selectorEl: HTMLElement;
  private editorEl: HTMLElement;
  private terminalEl: HTMLElement;
  private errorEl: HTMLElement;

  private editor: EditorView | null = null;
  private terminal: Terminal | null = null;
  private currentInk: { unmount: () => void; cleanup: () => void } | null = null;
  private selectedIndex = -1;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    selectorEl: HTMLElement,
    editorEl: HTMLElement,
    terminalEl: HTMLElement,
    errorEl: HTMLElement,
  ) {
    this.selectorEl = selectorEl;
    this.editorEl = editorEl;
    this.terminalEl = terminalEl;
    this.errorEl = errorEl;
  }

  init(): void {
    this.buildSelector();
    this.initEditor();
    this.initTerminal();
    this.selectDemo(0);
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
      li.addEventListener("click", () => this.selectDemo(i));
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
      cols: TERM_COLS,
      rows: 12,
      cursorBlink: true,
      cursorStyle: "bar",
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
    this.terminal.open(this.terminalEl);
  }

  selectDemo(index: number): void {
    const demo = demos[index];
    if (!demo) return;

    // Update selector highlight
    const items = this.selectorEl.querySelectorAll(".demo-item");
    items.forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });

    this.selectedIndex = index;

    // Resize terminal for this demo
    this.terminal?.resize(TERM_COLS, demo.rows);

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

    // Render immediately (don't wait for debounce)
    this.renderCode(demo.code);

    // Focus the terminal so keyboard input works immediately
    this.terminal?.focus();
  }

  private onCodeChange(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const code = this.editor?.state.doc.toString() ?? "";
      this.renderCode(code);
    }, 300);
  }

  private renderCode(jsxCode: string): void {
    // Unmount previous Ink app
    if (this.currentInk) {
      try {
        this.currentInk.unmount();
        this.currentInk.cleanup();
      } catch {
        // ignore cleanup errors
      }
      this.currentInk = null;
    }

    // Clear terminal
    this.terminal?.reset();
    this.errorEl.textContent = "";
    this.errorEl.style.display = "none";

    try {
      // Detect whether code defines its own component (has a top-level `return`)
      // or is just JSX that needs wrapping.
      const isComponentDef = /^(?:function|const|let|var)\s/.test(jsxCode.trim()) ||
        jsxCode.trim().startsWith("return ");

      const wrappedCode = isComponentDef
        ? `
          ${jsxCode}
        `
        : `
          function __PlaygroundComponent() {
            return (
              <RichThemeProvider>
                ${jsxCode}
              </RichThemeProvider>
            );
          }
          return __PlaygroundComponent;
        `;

      // Transform JSX → JS
      const { code: jsCode } = transform(wrappedCode, {
        transforms: ["jsx"],
        jsxRuntime: "classic",
        jsxPragma: "React.createElement",
        jsxFragmentPragma: "React.Fragment",
        production: true,
      });

      // Build the eval function with all scope vars as params
      const scopeKeys = Object.keys(evalScope);
      const scopeValues = scopeKeys.map((k) => (evalScope as Record<string, unknown>)[k]);
      const factory = new Function(...scopeKeys, jsCode);
      const Component = factory(...scopeValues) as React.FC;

      // Render into xterm.js via Ink
      const stdout = new XtermWriteStream(this.terminal!) as unknown as NodeJS.WriteStream;
      const stdin = new XtermReadStream(this.terminal!) as unknown as NodeJS.ReadStream;
      const stderr = new XtermWriteStream(this.terminal!) as unknown as NodeJS.WriteStream;

      // Always wrap in RichThemeProvider
      const wrapped = React.createElement(RichThemeProvider, null,
        React.createElement(Component));

      this.currentInk = inkRender(wrapped, {
        stdout,
        stdin,
        stderr,
        exitOnCtrlC: false,
        patchConsole: false,
        interactive: true,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.errorEl.textContent = msg;
      this.errorEl.style.display = "block";
    }
  }

  destroy(): void {
    if (this.currentInk) {
      this.currentInk.unmount();
      this.currentInk.cleanup();
    }
    this.editor?.destroy();
    this.terminal?.dispose();
  }
}
