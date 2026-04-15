/**
 * Demo site entry point — creates the 3-column playground
 * with a real terminal backed by WebContainer.
 */

import { Playground } from "./playground.js";

const app = document.getElementById("app")!;
app.innerHTML = `
  <header>
    <h1>rich-js-ink</h1>
    <p class="tagline">Rich terminal renderables as declarative React components for Ink</p>
    <p class="tagline-sub">Live playground with a real Node.js terminal — edit code, click Run, interact</p>
  </header>
  <div class="playground">
    <div class="col col-selector" id="selector">
      <div class="col-header">Components</div>
    </div>
    <div class="col col-editor" id="editor-col">
      <div class="col-header">JSX Editor</div>
      <div id="editor-mount"></div>
      <div class="editor-actions">
        <button id="run-btn" class="run-btn" disabled>Run</button>
        <span id="status" class="status">Booting...</span>
      </div>
    </div>
    <div class="col col-terminal" id="terminal-col">
      <div class="col-header">Terminal</div>
      <div id="terminal-mount"></div>
    </div>
  </div>
  <footer>
    <a href="https://github.com/brandon-fryslie/rich-js-ink">GitHub</a>
    ·
    <a href="https://github.com/brandon-fryslie/rich-js">rich-js</a>
    ·
    <a href="https://github.com/vadimdemedes/ink">Ink</a>
    ·
    Powered by <a href="https://webcontainers.io">WebContainers</a>
  </footer>
`;

const runBtn = document.getElementById("run-btn") as HTMLButtonElement;

const playground = new Playground(
  document.getElementById("selector")!,
  document.getElementById("editor-mount")!,
  document.getElementById("terminal-mount")!,
  document.getElementById("status")!,
);

runBtn.addEventListener("click", () => {
  playground.runCurrentDemo();
});

playground.init().then(() => {
  runBtn.disabled = false;
});
