/**
 * Demo definitions — each demo is a React component that renders
 * rich-js-ink components inside Ink.
 */

import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
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
  RichThemeProvider,
  useProgress,
  ROUNDED,
  DOUBLE,
  HEAVY,
} from "rich-js-ink";

export interface Demo {
  title: string;
  description: string;
  code: string;
  component: React.FC;
  /** Terminal height in rows (auto-sized if omitted). */
  rows?: number;
}

// --- Demo Components ---

function PanelDemo() {
  return (
    <RichThemeProvider>
      <RichPanel title="Hello" box={ROUNDED} style="cyan">
        {"This is a [bold magenta]rich-js[/] Panel\nrendered inside Ink!"}
      </RichPanel>
    </RichThemeProvider>
  );
}

function TableDemo() {
  return (
    <RichThemeProvider>
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
      />
    </RichThemeProvider>
  );
}

function TreeDemo() {
  return (
    <RichThemeProvider>
      <RichTree
        root={{
          label: "src/",
          children: [
            {
              label: "core/",
              children: [
                { label: "color.ts" },
                { label: "style.ts" },
                { label: "segment.ts" },
              ],
            },
            {
              label: "renderables/",
              children: [
                { label: "panel.ts" },
                { label: "table.ts" },
              ],
            },
          ],
        }}
        guide_style="dim cyan"
      />
    </RichThemeProvider>
  );
}

function MarkupDemo() {
  return (
    <RichThemeProvider>
      <RichMarkup>
        {"[bold cyan]Hello[/] [dim]world[/] [italic green]from rich-js![/]"}
      </RichMarkup>
    </RichThemeProvider>
  );
}

function RuleDemo() {
  return (
    <RichThemeProvider>
      <RichRule title="Section Divider" style="blue" />
    </RichThemeProvider>
  );
}

function SyntaxDemo() {
  return (
    <RichThemeProvider>
      <RichSyntax language="typescript" lineNumbers>
        {`function greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}`}
      </RichSyntax>
    </RichThemeProvider>
  );
}

function MarkdownDemo() {
  return (
    <RichThemeProvider>
      <RichMarkdown>{"# Welcome\n\nThis is **bold** and `inline code`."}</RichMarkdown>
    </RichThemeProvider>
  );
}

function JSONDemo() {
  return (
    <RichThemeProvider>
      <RichJSON
        data={{
          name: "rich-js-ink",
          version: "0.0.1",
          features: ["panels", "tables", "spinners"],
        }}
        indent={2}
      />
    </RichThemeProvider>
  );
}

function PrettyDemo() {
  return (
    <RichThemeProvider>
      <RichPretty
        data={{
          users: [
            { name: "Alice", role: "admin" },
            { name: "Bob", role: "user" },
          ],
        }}
        expandAll
      />
    </RichThemeProvider>
  );
}

function ColumnsDemo() {
  return (
    <RichThemeProvider>
      <RichColumns
        items={["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"]}
        equal
      />
    </RichThemeProvider>
  );
}

function SpinnerDemo() {
  return (
    <RichThemeProvider>
      <Box flexDirection="column">
        <RichSpinner name="dots" text="Loading resources..." style="cyan" />
        <RichSpinner name="line" text="Compiling..." style="yellow" />
        <RichSpinner name="dots2" text="Deploying..." style="green" />
      </Box>
    </RichThemeProvider>
  );
}

function StatusDemo() {
  return (
    <RichThemeProvider>
      <RichStatus message="Installing dependencies..." spinner="dots" style="bold blue" />
    </RichThemeProvider>
  );
}

function ProgressBarDemo() {
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCompleted((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <RichThemeProvider>
      <RichProgressBar completed={completed} total={100} style="green" />
    </RichThemeProvider>
  );
}

function MultiProgressDemo() {
  const { tasks, addTask, updateTask } = useProgress();

  useEffect(() => {
    const t1 = addTask("Downloading packages", { total: 100 });
    const t2 = addTask("Building assets", { total: 50 });
    const t3 = addTask("Running tests", { total: 200 });

    const interval = setInterval(() => {
      updateTask(t1, { advance: 3 });
      updateTask(t2, { advance: 1 });
      updateTask(t3, { advance: 5 });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <RichThemeProvider>
      <RichProgress
        tasks={tasks}
        columns={["spinner", "text", "bar", "percentage"]}
      />
    </RichThemeProvider>
  );
}

function CompoundDemo() {
  return (
    <RichThemeProvider>
      <Box flexDirection="column" gap={1}>
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
      </Box>
    </RichThemeProvider>
  );
}

// --- Export all demos ---

export const demos: Demo[] = [
  {
    title: "RichPanel",
    description: "Bordered box with title, supporting Rich markup in content.",
    code: `<RichPanel title="Hello" box={ROUNDED} style="cyan">
  {"This is a [bold magenta]rich-js[/] Panel\\nrendered inside Ink!"}
</RichPanel>`,
    component: PanelDemo,
    rows: 6,
  },
  {
    title: "RichTable",
    description: "Declarative table from column definitions and row data.",
    code: `<RichTable
  columns={[
    { header: "Name", style: "bold" },
    { header: "Language" },
    { header: "Stars", justify: "right" },
  ]}
  rows={[["Rich", "Python", "50k"], ...]}
  box={DOUBLE}
/>`,
    component: TableDemo,
    rows: 8,
  },
  {
    title: "RichTree",
    description: "Tree from nested data structure with styled guides.",
    code: `<RichTree
  root={{
    label: "src/",
    children: [
      { label: "core/", children: [...] },
      { label: "renderables/", children: [...] },
    ],
  }}
  guide_style="dim cyan"
/>`,
    component: TreeDemo,
    rows: 10,
  },
  {
    title: "RichMarkup",
    description: "Render Rich markup strings with inline styling.",
    code: `<RichMarkup>{"[bold cyan]Hello[/] [dim]world[/] [italic green]from rich-js![/]"}</RichMarkup>`,
    component: MarkupDemo,
    rows: 3,
  },
  {
    title: "RichRule",
    description: "Horizontal divider with optional centered title.",
    code: `<RichRule title="Section Divider" style="blue" />`,
    component: RuleDemo,
    rows: 3,
  },
  {
    title: "RichSyntax",
    description: "Syntax-highlighted source code with line numbers.",
    code: `<RichSyntax language="typescript" lineNumbers>
  {\`function greet(name: string) { ... }\`}
</RichSyntax>`,
    component: SyntaxDemo,
    rows: 5,
  },
  {
    title: "RichMarkdown",
    description: "Rendered Markdown with headings, bold, and inline code.",
    code: `<RichMarkdown>{"# Welcome\\n\\nThis is **bold** and \`inline code\`."}</RichMarkdown>`,
    component: MarkdownDemo,
    rows: 5,
  },
  {
    title: "RichJSON",
    description: "Syntax-highlighted, formatted JSON display.",
    code: `<RichJSON data={{ name: "rich-js-ink", ... }} indent={2} />`,
    component: JSONDemo,
    rows: 10,
  },
  {
    title: "RichPretty",
    description: "Pretty-printed JavaScript data structures.",
    code: `<RichPretty data={{ users: [...] }} expandAll />`,
    component: PrettyDemo,
    rows: 8,
  },
  {
    title: "RichColumns",
    description: "Multi-column layout from a flat list of items.",
    code: `<RichColumns items={["Alpha", "Beta", "Gamma", ...]} equal />`,
    component: ColumnsDemo,
    rows: 3,
  },
  {
    title: "RichSpinner (animated)",
    description: "Animated spinners driven by Ink's useAnimation hook. These are running live.",
    code: `<RichSpinner name="dots" text="Loading..." style="cyan" />`,
    component: SpinnerDemo,
    rows: 5,
  },
  {
    title: "RichStatus (animated)",
    description: "Spinner + status message combination.",
    code: `<RichStatus message="Installing..." spinner="dots" style="bold blue" />`,
    component: StatusDemo,
    rows: 3,
  },
  {
    title: "RichProgressBar (animated)",
    description: "Progress bar animated by React state updates.",
    code: `const [completed, setCompleted] = useState(0);
<RichProgressBar completed={completed} total={100} style="green" />`,
    component: ProgressBarDemo,
    rows: 3,
  },
  {
    title: "RichProgress (multi-task)",
    description: "Multi-task progress with configurable columns, driven by useProgress().",
    code: `const { tasks, addTask, updateTask } = useProgress();
<RichProgress tasks={tasks} columns={["spinner", "text", "bar", "percentage"]} />`,
    component: MultiProgressDemo,
    rows: 5,
  },
  {
    title: "Compound: Panel + Table + Rule",
    description: "Rich-js-ink components compose naturally inside Ink's flexbox layout.",
    code: `<Box flexDirection="column" gap={1}>
  <RichPanel title="Dashboard" box={HEAVY} style="magenta">
    {"[bold]System Status[/]: [green]Operational[/]"}
  </RichPanel>
  <RichRule title="Metrics" style="dim" />
  <RichTable columns={[...]} rows={[...]} box={ROUNDED} />
</Box>`,
    component: CompoundDemo,
    rows: 12,
  },
];
