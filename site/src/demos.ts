/**
 * Demo definitions — title, description, and default JSX code.
 * The code strings are eval'd at runtime with React/Ink/rich-js-ink in scope.
 *
 * Every component and hook in the library is represented here.
 */

export interface Demo {
  title: string;
  description: string;
  code: string;
  /** Terminal height in rows. */
  rows: number;
}

export const demos: Demo[] = [
  // --- Panels ---
  {
    title: "Panel — Box Styles",
    description: "Panels with different box styles. Try HEAVY, ASCII, SQUARE, MINIMAL, DOUBLE.",
    rows: 18,
    code: `<Box flexDirection="column" gap={1}>
  <RichPanel title="Rounded" box={ROUNDED} style="cyan">
    {"[bold]ROUNDED[/] — the default, soft corners"}
  </RichPanel>
  <RichPanel title="Heavy" box={HEAVY} style="magenta">
    {"[bold]HEAVY[/] — thick borders for emphasis"}
  </RichPanel>
  <RichPanel title="Double" box={DOUBLE} style="yellow">
    {"[bold]DOUBLE[/] — classic double-line border"}
  </RichPanel>
</Box>`,
  },
  {
    title: "Panel — Rich Markup",
    description: "Panel content is parsed as Rich markup. Supports bold, italic, colors, and nesting.",
    rows: 8,
    code: `<RichPanel title="[bold cyan]Styled Title[/]" box={ROUNDED} style="green">
  {"[bold red]Error:[/] Connection to [underline]db.example.com[/] [dim]timed out[/]\\n"}
</RichPanel>`,
  },

  // --- Tables ---
  {
    title: "Table — Full Featured",
    description: "Tables with styled headers, right-aligned columns, and different box styles.",
    rows: 12,
    code: `<RichTable
  columns={[
    { header: "Package", style: "bold cyan" },
    { header: "Version", justify: "center" },
    { header: "Size", justify: "right" },
    { header: "Status", style: "bold" },
  ]}
  rows={[
    ["react", "19.2.5", "8.2 kB", "[green]up to date[/]"],
    ["ink", "7.0.0", "42 kB", "[green]up to date[/]"],
    ["rich-js", "0.0.1", "120 kB", "[yellow]patch available[/]"],
    ["typescript", "6.0.2", "35 MB", "[red]major update[/]"],
  ]}
  box={ROUNDED}
/>`,
  },

  // --- Tree ---
  {
    title: "Tree — Deep Nesting",
    description: "Trees render nested data with styled guide lines.",
    rows: 14,
    code: `<RichTree
  root={{
    label: "[bold]project/[/]",
    children: [
      { label: "[cyan]src/[/]", children: [
        { label: "[cyan]core/[/]", children: [
          { label: "color.ts" },
          { label: "style.ts" },
          { label: "segment.ts" },
        ]},
        { label: "[cyan]components/[/]", children: [
          { label: "RichPanel.tsx" },
          { label: "RichTable.tsx" },
          { label: "RichSpinner.tsx" },
        ]},
        { label: "index.ts" },
      ]},
      { label: "[yellow]tests/[/]", children: [
        { label: "bridge.test.ts" },
        { label: "components.test.tsx" },
      ]},
      { label: "[dim]package.json[/]" },
      { label: "[dim]tsconfig.json[/]" },
    ],
  }}
  guide_style="dim blue"
/>`,
  },

  // --- Markup ---
  {
    title: "Rich Markup",
    description: "Inline styled text using Rich markup syntax. Supports all style attributes.",
    rows: 6,
    code: `<Box flexDirection="column">
  <RichMarkup>{"[bold]Bold[/] [italic]Italic[/] [underline]Underline[/] [strikethrough]Strike[/]"}</RichMarkup>
  <RichMarkup>{"[red]Red[/] [green]Green[/] [blue]Blue[/] [yellow]Yellow[/] [magenta]Magenta[/] [cyan]Cyan[/]"}</RichMarkup>
  <RichMarkup>{"[bold red on white] ALERT [/] [bold green on black] SUCCESS [/] [bold yellow on black] WARNING [/]"}</RichMarkup>
  <RichMarkup>{"[dim]Dim text[/] and [bright_cyan]bright cyan[/] and [bold italic magenta]bold italic magenta[/]"}</RichMarkup>
</Box>`,
  },

  // --- Rule ---
  {
    title: "Rule — Dividers",
    description: "Horizontal rules with titles and alignment options.",
    rows: 8,
    code: `<Box flexDirection="column">
  <RichRule style="cyan" />
  <RichRule title="Center (default)" style="green" />
  <RichRule title="Left Aligned" style="yellow" align="left" />
  <RichRule title="Right Aligned" style="magenta" align="right" />
  <RichRule title="Custom Chars" style="blue" characters="=" />
</Box>`,
  },

  // --- Syntax ---
  {
    title: "Syntax Highlighting",
    description: "Source code with syntax highlighting and line numbers.",
    rows: 14,
    code: `<RichSyntax language="typescript" lineNumbers>
  {\`interface Config {
  host: string;
  port: number;
  debug: boolean;
}

async function connect(config: Config): Promise<void> {
  const url = \\\`http://\\\${config.host}:\\\${config.port}\\\`;
  console.log("Connecting to", url);
  // TODO: implement retry logic
  await fetch(url);
}\`}
</RichSyntax>`,
  },

  // --- Markdown ---
  {
    title: "Markdown Rendering",
    description: "Rendered Markdown with headings, lists, code blocks, and emphasis.",
    rows: 12,
    code: `<RichMarkdown>
  {"# rich-js-ink\\n\\nA **bridge** between rich-js and Ink.\\n\\n## Features\\n\\n- Panels, tables, and trees\\n- *Animated* spinners and progress bars\\n- Interactive prompts\\n\\n> Built with love for the terminal."}
</RichMarkdown>`,
  },

  // --- JSON ---
  {
    title: "JSON Display",
    description: "Syntax-highlighted JSON with sorting and indentation options.",
    rows: 16,
    code: `<RichJSON
  data={{
    name: "rich-js-ink",
    version: "0.0.1",
    description: "Ink components for rich-js",
    dependencies: {
      ink: "^7.0.0",
      react: "^19.2.5",
      "rich-js": "^0.0.1",
    },
    keywords: ["terminal", "rich", "ink", "react", "tui"],
    license: "MIT",
  }}
  indent={2}
  sortKeys
/>`,
  },

  // --- Pretty ---
  {
    title: "Pretty Print",
    description: "Pretty-printed JavaScript data structures with type highlighting.",
    rows: 14,
    code: `<RichPretty
  data={{
    users: [
      { id: 1, name: "Alice", role: "admin", active: true },
      { id: 2, name: "Bob", role: "user", active: false },
      { id: 3, name: "Charlie", role: "user", active: true },
    ],
    metadata: {
      total: 3,
      page: 1,
      timestamp: "2026-04-13T00:00:00Z",
    },
  }}
  expandAll
  indentGuides
/>`,
  },

  // --- Columns ---
  {
    title: "Columns Layout",
    description: "Multi-column layout arranging items automatically.",
    rows: 4,
    code: `<Box flexDirection="column">
  <RichColumns items={["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta"]} equal />
</Box>`,
  },

  // --- Traceback ---
  {
    title: "Error Traceback",
    description: "Formatted error display with stack trace.",
    rows: 10,
    code: `<RichTraceback error={(() => {
  try {
    throw new Error("Cannot read property 'id' of undefined");
  } catch (e) {
    return e;
  }
})()} maxFrames={5} />`,
  },

  // --- Spinners ---
  {
    title: "Spinners — All Styles",
    description: "Live animated spinners. Each uses Ink's useAnimation for timing.",
    rows: 8,
    code: `<Box flexDirection="column">
  <RichSpinner name="dots" text="dots — the classic" style="cyan" />
  <RichSpinner name="dots2" text="dots2 — braille variant" style="green" />
  <RichSpinner name="dots3" text="dots3 — another braille" style="yellow" />
  <RichSpinner name="line" text="line — ascii spinner" style="magenta" />
  <RichSpinner name="pipe" text="pipe — box drawing" style="blue" />
  <RichSpinner name="simpleDots" text="simpleDots — minimal" style="red" />
</Box>`,
  },

  // --- Status ---
  {
    title: "Status Messages",
    description: "Spinner + styled status text. Try changing the spinner name and style.",
    rows: 5,
    code: `<Box flexDirection="column">
  <RichStatus message="Downloading packages..." spinner="dots" style="bold cyan" />
  <RichStatus message="Compiling TypeScript..." spinner="line" style="bold yellow" />
  <RichStatus message="Running tests..." spinner="dots2" style="bold green" />
</Box>`,
  },

  // --- Progress Bar ---
  {
    title: "Progress Bar — Animated",
    description: "Animated progress bar. Uses React state to drive animation.",
    rows: 5,
    code: `function AnimatedBar() {
  const [completed, setCompleted] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCompleted(c => c >= 100 ? 0 : c + 2), 100);
    return () => clearInterval(id);
  }, []);
  return (
    <Box flexDirection="column">
      <RichProgressBar completed={completed} total={100} style="green" />
      <Text>  {completed}% complete</Text>
    </Box>
  );
}
return AnimatedBar;`,
  },

  // --- Multi-Task Progress ---
  {
    title: "Multi-Task Progress",
    description: "Multiple progress tasks with useProgress() hook. Columns: spinner, text, bar, percentage.",
    rows: 6,
    code: `function MultiProgress() {
  const { tasks, addTask, updateTask } = useProgress();
  useEffect(() => {
    const t1 = addTask("Downloading packages", { total: 100 });
    const t2 = addTask("Building assets", { total: 50 });
    const t3 = addTask("Running tests", { total: 200 });
    const id = setInterval(() => {
      updateTask(t1, { advance: 3 });
      updateTask(t2, { advance: 1 });
      updateTask(t3, { advance: 5 });
    }, 200);
    return () => clearInterval(id);
  }, []);
  return <RichProgress tasks={tasks} columns={["spinner", "text", "bar", "percentage"]} />;
}
return MultiProgress;`,
  },

  // --- useSpinnerFrame ---
  {
    title: "useSpinnerFrame Hook",
    description: "Low-level hook returning the current spinner frame string for custom UIs.",
    rows: 5,
    code: `function CustomSpinner() {
  const frame = useSpinnerFrame("dots");
  const frame2 = useSpinnerFrame("line");
  return (
    <Box flexDirection="column">
      <Text>{frame}  Custom spinner UI with useSpinnerFrame</Text>
      <Text>{frame2}  Mix different spinner styles freely</Text>
    </Box>
  );
}
return CustomSpinner;`,
  },

  // --- useRichRenderable ---
  {
    title: "useRichRenderable Hook",
    description: "Construct renderables inline without a dedicated component.",
    rows: 6,
    code: `function InlineRenderable() {
  const output = useRichRenderable(
    (width) => new RichText("[bold cyan]Built with[/] useRichRenderable\\n[dim]Width: " + width + " columns[/]"),
    []
  );
  return <Text>{output}</Text>;
}
return InlineRenderable;`,
  },

  // --- Interactive: Prompt ---
  {
    title: "RichPrompt — Text Input",
    description: "Interactive text input. Type in the terminal and press Enter.",
    rows: 4,
    code: `function PromptDemo() {
  const [result, setResult] = useState(null);
  if (result !== null) {
    return <Text>You entered: <Text bold color="green">{result}</Text></Text>;
  }
  return <RichPrompt message="Enter your name" defaultValue="World" onSubmit={setResult} style="bold cyan" />;
}
return PromptDemo;`,
  },

  // --- Interactive: Confirm ---
  {
    title: "RichConfirm — Yes/No",
    description: "Yes/no confirmation prompt. Press y or n.",
    rows: 4,
    code: `function ConfirmDemo() {
  const [result, setResult] = useState(null);
  if (result !== null) {
    return <Text>{result ? "Confirmed!" : "Cancelled."}</Text>;
  }
  return <RichConfirm message="Deploy to production?" defaultValue={false} onConfirm={setResult} />;
}
return ConfirmDemo;`,
  },

  // --- Interactive: Select ---
  {
    title: "RichSelect — Selection List",
    description: "Arrow keys to navigate, Enter to select.",
    rows: 8,
    code: `function SelectDemo() {
  const [selected, setSelected] = useState(null);
  if (selected !== null) {
    return <Text>Selected: <Text bold color="cyan">{selected}</Text></Text>;
  }
  return <RichSelect
    items={["Create new project", "Open existing", "Import from Git", "View documentation", "Exit"]}
    onSelect={(item) => setSelected(item)}
    highlightStyle="bold cyan"
  />;
}
return SelectDemo;`,
  },

  // --- Theme Provider ---
  {
    title: "Theme — Color Systems",
    description: "RichThemeProvider sets color system for all children. Try ColorSystem.EIGHT_BIT.",
    rows: 6,
    code: `<Box flexDirection="column">
  <RichPanel title="Truecolor (default)" box={ROUNDED} style="rgb(100,200,255)">
    {"[rgb(255,100,50)]Custom RGB colors[/] with [rgb(50,255,150)]truecolor support[/]"}
  </RichPanel>
</Box>`,
  },

  // --- Compound: Dashboard ---
  {
    title: "Dashboard — Compound Demo",
    description: "Multiple components composed with Ink's flexbox layout.",
    rows: 16,
    code: `<Box flexDirection="column" gap={1}>
  <RichPanel title="System Dashboard" box={HEAVY} style="cyan">
    {"[bold green]All systems operational[/] — [dim]Last checked: just now[/]"}
  </RichPanel>
  <RichRule title="Services" style="dim" />
  <RichTable
    columns={[
      { header: "Service", style: "bold" },
      { header: "Status" },
      { header: "Latency", justify: "right" },
      { header: "Uptime", justify: "right" },
    ]}
    rows={[
      ["API Gateway", "[green]healthy[/]", "12ms", "99.99%"],
      ["Database", "[green]healthy[/]", "3ms", "99.97%"],
      ["Cache", "[yellow]degraded[/]", "45ms", "99.5%"],
      ["Worker Queue", "[green]healthy[/]", "8ms", "99.98%"],
    ]}
    box={ROUNDED}
  />
  <RichSpinner name="dots" text="Monitoring..." style="dim cyan" />
</Box>`,
  },

  // --- Compound: File Explorer ---
  {
    title: "File Explorer — Compound",
    description: "Tree + panel + syntax highlighting composed together.",
    rows: 18,
    code: `<Box flexDirection="column" gap={1}>
  <RichTree
    root={{
      label: "[bold]my-app/[/]",
      children: [
        { label: "[cyan]src/[/]", children: [
          { label: "[green]App.tsx[/]" },
          { label: "index.ts" },
        ]},
        { label: "[yellow]package.json[/]" },
      ],
    }}
    guide_style="dim"
  />
  <RichRule title="App.tsx" style="dim green" />
  <RichSyntax language="typescript" lineNumbers>
    {\`import React from 'react';
import { render } from 'ink';

function App() {
  return <Text>Hello, world!</Text>;
}

render(<App />);\`}
  </RichSyntax>
</Box>`,
  },
];
