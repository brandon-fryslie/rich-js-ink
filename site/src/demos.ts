/**
 * Demo definitions — title, description, and default JSX code.
 * The code strings are eval'd at runtime with React/Ink/rich-js-ink in scope.
 */

export interface Demo {
  title: string;
  description: string;
  code: string;
  /** Terminal height in rows. */
  rows: number;
}

export const demos: Demo[] = [
  {
    title: "RichPanel",
    description: "Bordered box with title, supporting Rich markup.",
    rows: 6,
    code: `<RichPanel title="Hello" box={ROUNDED} style="cyan">
  {"This is a [bold magenta]rich-js[/] Panel\\nrendered inside Ink!"}
</RichPanel>`,
  },
  {
    title: "RichTable",
    description: "Declarative table from columns and rows.",
    rows: 8,
    code: `<RichTable
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
  },
  {
    title: "RichTree",
    description: "Tree from nested data structure.",
    rows: 10,
    code: `<RichTree
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
  },
  {
    title: "RichMarkup",
    description: "Rich markup strings with inline styling.",
    rows: 3,
    code: `<RichMarkup>
  {"[bold cyan]Hello[/] [dim]world[/] [italic green]from rich-js![/]"}
</RichMarkup>`,
  },
  {
    title: "RichRule",
    description: "Horizontal divider with optional title.",
    rows: 3,
    code: `<RichRule title="Section Divider" style="blue" />`,
  },
  {
    title: "RichSyntax",
    description: "Syntax-highlighted source code.",
    rows: 5,
    code: `<RichSyntax language="typescript" lineNumbers>
  {\`function greet(name: string): string {
  return \\\`Hello, \\\${name}!\\\`;
}\`}
</RichSyntax>`,
  },
  {
    title: "RichMarkdown",
    description: "Rendered Markdown content.",
    rows: 5,
    code: `<RichMarkdown>
  {"# Welcome\\n\\nThis is **bold** and \`inline code\`."}
</RichMarkdown>`,
  },
  {
    title: "RichJSON",
    description: "Syntax-highlighted JSON display.",
    rows: 10,
    code: `<RichJSON
  data={{
    name: "rich-js-ink",
    version: "0.0.1",
    features: ["panels", "tables", "spinners"],
  }}
  indent={2}
/>`,
  },
  {
    title: "RichPretty",
    description: "Pretty-printed data structures.",
    rows: 8,
    code: `<RichPretty
  data={{
    users: [
      { name: "Alice", role: "admin" },
      { name: "Bob", role: "user" },
    ],
  }}
  expandAll
/>`,
  },
  {
    title: "RichColumns",
    description: "Multi-column layout from items.",
    rows: 3,
    code: `<RichColumns
  items={["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"]}
  equal
/>`,
  },
  {
    title: "RichSpinner",
    description: "Animated spinners (live!).",
    rows: 5,
    code: `<Box flexDirection="column">
  <RichSpinner name="dots" text="Loading resources..." style="cyan" />
  <RichSpinner name="line" text="Compiling..." style="yellow" />
  <RichSpinner name="dots2" text="Deploying..." style="green" />
</Box>`,
  },
  {
    title: "RichStatus",
    description: "Spinner + status message.",
    rows: 3,
    code: `<RichStatus message="Installing dependencies..." spinner="dots" style="bold blue" />`,
  },
  {
    title: "RichProgressBar",
    description: "Animated progress bar (try changing completed).",
    rows: 3,
    code: `<RichProgressBar completed={65} total={100} style="green" />`,
  },
  {
    title: "Compound",
    description: "Components compose inside Ink's flexbox.",
    rows: 12,
    code: `<Box flexDirection="column" gap={1}>
  <RichPanel title="Dashboard" box={HEAVY} style="magenta">
    {"[bold]System Status[/]: [green]Operational[/]"}
  </RichPanel>
  <RichRule title="Metrics" style="dim" />
  <RichTable
    columns={[
      { header: "Metric" },
      { header: "Value", justify: "right" },
    ]}
    rows={[
      ["Uptime", "99.97%"],
      ["Latency", "12ms"],
      ["Throughput", "1.2k/s"],
    ]}
    box={ROUNDED}
  />
</Box>`,
  },
];
