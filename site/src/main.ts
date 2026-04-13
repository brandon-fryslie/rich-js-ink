/**
 * Demo site entry point — creates the 3-column playground.
 */

import { Playground } from "./playground.js";

const app = document.getElementById("app")!;
app.innerHTML = `
  <header>
    <h1>rich-js-ink</h1>
    <p class="tagline">Rich terminal renderables as declarative React components for Ink</p>
    <p class="tagline-sub">Live playground — edit the JSX and watch the terminal update in real time</p>
  </header>
  <div class="playground">
    <div class="col col-selector" id="selector">
      <div class="col-header">Components</div>
    </div>
    <div class="col col-editor" id="editor-col">
      <div class="col-header">JSX Editor</div>
      <div id="editor-mount"></div>
    </div>
    <div class="col col-terminal" id="terminal-col">
      <div class="col-header">Live Output</div>
      <div id="terminal-mount"></div>
      <div id="error-display" class="error-display" style="display:none"></div>
    </div>
  </div>
  <footer>
    <a href="https://github.com/brandon-fryslie/rich-js-ink">GitHub</a>
    ·
    <a href="https://github.com/brandon-fryslie/rich-js">rich-js</a>
    ·
    <a href="https://github.com/vadimdemedes/ink">Ink</a>
    ·
    <a href="https://xtermjs.org">xterm.js</a>
  </footer>
`;

const playground = new Playground(
  document.getElementById("selector")!,
  document.getElementById("editor-mount")!,
  document.getElementById("terminal-mount")!,
  document.getElementById("error-display")!,
);

playground.init();
