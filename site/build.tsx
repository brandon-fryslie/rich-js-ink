/**
 * Demo site builder — renders rich-js-ink components to a static HTML page.
 *
 * Each component is rendered via Ink's renderToString (synchronous, no terminal),
 * then ANSI output is converted to styled HTML spans via ansi-to-html.
 *
 * Usage: node --import tsx site/build.tsx
 */

import React from "react";
import { renderToString, Box, Text } from "ink";
import Convert from "ansi-to-html";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Components
import { RichPanel } from "../src/components/RichPanel.js";
import { RichTable } from "../src/components/RichTable.js";
import { RichTree } from "../src/components/RichTree.js";
import { RichMarkup } from "../src/components/RichMarkup.js";
import { RichRule } from "../src/components/RichRule.js";
import { RichSyntax } from "../src/components/RichSyntax.js";
import { RichMarkdown } from "../src/components/RichMarkdown.js";
import { RichJSON } from "../src/components/RichJSON.js";
import { RichPretty } from "../src/components/RichPretty.js";
import { RichColumns } from "../src/components/RichColumns.js";
import { RichProgressBar } from "../src/components/RichProgressBar.js";
import { RichThemeProvider } from "../src/hooks/useRichTheme.js";
import { ROUNDED, DOUBLE, HEAVY } from "rich-js";

// --- ANSI → HTML converter ---

const convert = new Convert({
  fg: "#c9d1d9",
  bg: "#0d1117",
  newline: true,
  escapeXML: true,
});

function ansiToHtml(ansi: string): string {
  return convert.toHtml(ansi);
}

// --- Render a component to ANSI string ---

const COLS = 72;

function renderComponent(node: React.ReactNode): string {
  return renderToString(node, { columns: COLS });
}

// --- Demo sections ---

interface DemoSection {
  title: string;
  description: string;
  code: string;
  rendered: string;
}

const sections: DemoSection[] = [];

function addDemo(title: string, description: string, code: string, node: React.ReactNode): void {
  const ansi = renderComponent(node);
  sections.push({ title, description, code, rendered: ansiToHtml(ansi) });
}

// Tier 1: Foundation

addDemo(
  "RichPanel",
  "Bordered box with title, supporting Rich markup in content.",
  `<RichPanel title="Hello" box={ROUNDED} style="cyan">
  {"This is a [bold magenta]rich-js[/] Panel\\nrendered inside Ink!"}
</RichPanel>`,
  <RichPanel title="Hello" box={ROUNDED} style="cyan" width={COLS}>
    {"This is a [bold magenta]rich-js[/] Panel\nrendered inside Ink!"}
  </RichPanel>,
);

addDemo(
  "RichTable",
  "Declarative table from column definitions and row data.",
  `<RichTable
  columns={[
    { header: "Name", style: "bold" },
    { header: "Language" },
    { header: "Stars", justify: "right" },
  ]}
  rows={[
    ["Rich", "Python", "50k"],
    ["rich-js", "TypeScript", "new"],
    ["Ink", "TypeScript", "28k"],
  ]}
  box={DOUBLE}
/>`,
  <RichTable
    columns={[
      { header: "Name", style: "bold" },
      { header: "Language" },
      { header: "Stars", justify: "right" },
    ]}
    rows={[
      ["Rich", "Python", "50k"],
      ["rich-js", "TypeScript", "new"],
      ["Ink", "TypeScript", "28k"],
    ]}
    box={DOUBLE}
    width={COLS}
  />,
);

addDemo(
  "RichTree",
  "Tree from nested data structure with styled guides.",
  `<RichTree
  root={{
    label: "src/",
    children: [
      { label: "core/", children: [
        { label: "color.ts" },
        { label: "style.ts" },
        { label: "segment.ts" },
      ]},
      { label: "renderables/", children: [
        { label: "panel.ts" },
        { label: "table.ts" },
      ]},
    ],
  }}
  guide_style="dim cyan"
/>`,
  <RichTree
    root={{
      label: "src/",
      children: [
        { label: "core/", children: [{ label: "color.ts" }, { label: "style.ts" }, { label: "segment.ts" }] },
        { label: "renderables/", children: [{ label: "panel.ts" }, { label: "table.ts" }] },
      ],
    }}
    guide_style="dim cyan"
    width={COLS}
  />,
);

// Tier 2: Static Renderables

addDemo(
  "RichMarkup",
  "Render Rich markup strings with inline styling — the simplest bridge.",
  `<RichMarkup>{"[bold cyan]Hello[/] [dim]world[/] [italic green]from rich-js![/]"}</RichMarkup>`,
  <RichMarkup width={COLS}>{"[bold cyan]Hello[/] [dim]world[/] [italic green]from rich-js![/]"}</RichMarkup>,
);

addDemo(
  "RichRule",
  "Horizontal divider with optional centered title.",
  `<RichRule title="Section Divider" style="blue" />`,
  <RichRule title="Section Divider" style="blue" width={COLS} />,
);

addDemo(
  "RichSyntax",
  "Syntax-highlighted source code with line numbers.",
  `<RichSyntax language="typescript" lineNumbers>
  {\`function greet(name: string): string {
  return \\\`Hello, \\\${name}!\\\`;
}\`}
</RichSyntax>`,
  <RichSyntax language="typescript" lineNumbers width={COLS}>
    {`function greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}`}
  </RichSyntax>,
);

addDemo(
  "RichMarkdown",
  "Rendered Markdown with headings, bold, and inline code.",
  `<RichMarkdown>{"# Welcome\\n\\nThis is **bold** and \`inline code\`."}</RichMarkdown>`,
  <RichMarkdown width={COLS}>{"# Welcome\n\nThis is **bold** and `inline code`."}</RichMarkdown>,
);

addDemo(
  "RichJSON",
  "Syntax-highlighted, formatted JSON display.",
  `<RichJSON
  data={{ name: "rich-js-ink", version: "0.0.1", features: ["panels", "tables", "spinners"] }}
  indent={2}
/>`,
  <RichJSON
    data={{ name: "rich-js-ink", version: "0.0.1", features: ["panels", "tables", "spinners"] }}
    indent={2}
    width={COLS}
  />,
);

addDemo(
  "RichPretty",
  "Pretty-printed JavaScript data structures with highlighting.",
  `<RichPretty data={{ users: [{ name: "Alice", role: "admin" }, { name: "Bob", role: "user" }] }} expandAll />`,
  <RichPretty
    data={{ users: [{ name: "Alice", role: "admin" }, { name: "Bob", role: "user" }] }}
    expandAll
    width={COLS}
  />,
);

addDemo(
  "RichColumns",
  "Multi-column layout from a flat list of items.",
  `<RichColumns items={["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"]} equal />`,
  <RichColumns items={["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"]} equal width={COLS} />,
);

// Tier 4: Animated (static frame)

addDemo(
  "RichProgressBar",
  "Progress bar driven by completed/total props. Animated by parent state updates.",
  `<RichProgressBar completed={65} total={100} style="green" />`,
  <RichProgressBar completed={65} total={100} style="green" width={COLS} />,
);

// Compound demo

addDemo(
  "Compound: Panel + Table + Rule",
  "Rich-js-ink components compose naturally inside Ink's flexbox layout.",
  `<Box flexDirection="column" gap={1}>
  <RichPanel title="Dashboard" box={HEAVY} style="magenta">
    {"[bold]System Status[/]: [green]Operational[/]"}
  </RichPanel>
  <RichRule title="Metrics" style="dim" />
  <RichTable
    columns={[{ header: "Metric" }, { header: "Value", justify: "right" }]}
    rows={[["Uptime", "99.97%"], ["Latency", "12ms"], ["Throughput", "1.2k/s"]]}
    box={ROUNDED}
  />
</Box>`,
  <Box flexDirection="column" gap={1}>
    <RichPanel title="Dashboard" box={HEAVY} style="magenta" width={COLS}>
      {"[bold]System Status[/]: [green]Operational[/]"}
    </RichPanel>
    <RichRule title="Metrics" style="dim" width={COLS} />
    <RichTable
      columns={[{ header: "Metric" }, { header: "Value", justify: "right" }]}
      rows={[["Uptime", "99.97%"], ["Latency", "12ms"], ["Throughput", "1.2k/s"]]}
      box={ROUNDED}
      width={COLS}
    />
  </Box>,
);

// --- Generate HTML ---

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function generateSectionHtml(section: DemoSection): string {
  return `
    <section class="demo-section">
      <h2>${escapeHtml(section.title)}</h2>
      <p class="description">${escapeHtml(section.description)}</p>
      <div class="demo-grid">
        <div class="code-panel">
          <div class="panel-label">JSX</div>
          <pre><code>${escapeHtml(section.code)}</code></pre>
        </div>
        <div class="output-panel">
          <div class="panel-label">Output</div>
          <pre class="terminal-output">${section.rendered}</pre>
        </div>
      </div>
    </section>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>rich-js-ink — Component Gallery</title>
  <style>
    :root {
      --bg: #0d1117;
      --bg-surface: #161b22;
      --bg-elevated: #1c2129;
      --border: #30363d;
      --text: #c9d1d9;
      --text-muted: #8b949e;
      --accent: #58a6ff;
      --accent-subtle: #1f6feb33;
      --green: #3fb950;
      --purple: #bc8cff;
      --orange: #f0883e;
      --font-mono: "JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", Consolas, monospace;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.6;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }

    /* Header */
    header {
      text-align: center;
      padding: 3rem 0 2rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 3rem;
    }

    header h1 {
      font-family: var(--font-mono);
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent), var(--purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    header .tagline {
      color: var(--text-muted);
      font-size: 1.15rem;
      max-width: 600px;
      margin: 0 auto 1.5rem;
    }

    .badges {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 500;
    }

    .badge-components { background: var(--accent-subtle); color: var(--accent); border: 1px solid var(--accent); }
    .badge-hooks { background: #3fb95022; color: var(--green); border: 1px solid var(--green); }
    .badge-animated { background: #f0883e22; color: var(--orange); border: 1px solid var(--orange); }

    /* Architecture block */
    .architecture {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 3rem;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      line-height: 1.8;
      color: var(--text-muted);
      text-align: center;
    }

    .architecture .flow {
      color: var(--text);
    }

    .architecture .arrow {
      color: var(--accent);
    }

    /* Demo sections */
    .demo-section {
      margin-bottom: 3rem;
    }

    .demo-section h2 {
      font-family: var(--font-mono);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }

    .description {
      color: var(--text-muted);
      margin-bottom: 1rem;
      font-size: 0.95rem;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      align-items: start;
    }

    @media (max-width: 900px) {
      .demo-grid {
        grid-template-columns: 1fr;
      }
    }

    .panel-label {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      padding: 0.5rem 1rem 0;
    }

    .code-panel, .output-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .code-panel pre, .output-panel pre {
      padding: 0.75rem 1rem 1rem;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.82rem;
      line-height: 1.5;
    }

    .code-panel code {
      color: var(--text);
    }

    .terminal-output {
      background: var(--bg) !important;
      border-top: 1px solid var(--border);
      color: var(--text);
      white-space: pre;
    }

    .output-panel .terminal-output {
      border-top: none;
    }

    /* Footer */
    footer {
      text-align: center;
      padding: 2rem 0;
      border-top: 1px solid var(--border);
      margin-top: 2rem;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    footer a {
      color: var(--accent);
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>rich-js-ink</h1>
      <p class="tagline">Rich terminal renderables as declarative React components for Ink</p>
      <div class="badges">
        <span class="badge badge-components">16 components</span>
        <span class="badge badge-hooks">4 hooks</span>
        <span class="badge badge-animated">animated + interactive</span>
      </div>
    </header>

    <div class="architecture">
      <span class="flow">Props</span>
      <span class="arrow"> &rarr; </span>
      <span class="flow">rich-js Renderable</span>
      <span class="arrow"> &rarr; </span>
      <span class="flow">Segment[]</span>
      <span class="arrow"> &rarr; </span>
      <span class="flow">ANSI string</span>
      <span class="arrow"> &rarr; </span>
      <span class="flow">&lt;Text&gt;{ansi}&lt;/Text&gt;</span>
    </div>

${sections.map(generateSectionHtml).join("\n")}

    <footer>
      <p>
        <a href="https://github.com/brandon-fryslie/rich-js-ink">GitHub</a>
        &nbsp;&middot;&nbsp;
        <a href="https://github.com/brandon-fryslie/rich-js">rich-js</a>
        &nbsp;&middot;&nbsp;
        <a href="https://github.com/vadimdemedes/ink">Ink</a>
      </p>
    </footer>
  </div>
</body>
</html>`;

// --- Write output ---

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "dist");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html, "utf-8");

console.log(`Demo site built: ${join(outDir, "index.html")} (${sections.length} sections)`);
