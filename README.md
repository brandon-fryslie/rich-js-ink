# rich-js-ink

Ink components for [rich-js](https://github.com/brandon-fryslie/rich-js) — Rich terminal renderables as declarative React components.

```tsx
import { render, Box } from "ink";
import { RichPanel, RichTable, RichSpinner, ROUNDED } from "rich-js-ink";

function App() {
  return (
    <Box flexDirection="column" gap={1}>
      <RichPanel title="Status" box={ROUNDED} style="cyan">
        {"[bold green]All systems operational[/]"}
      </RichPanel>

      <RichTable
        columns={[{ header: "Service" }, { header: "Status" }]}
        rows={[["API", "running"], ["DB", "running"]]}
      />

      <RichSpinner name="dots" text="Checking..." style="yellow" />
    </Box>
  );
}

render(<App />);
```

## How It Works

rich-js-ink is a bridge between two systems:

- **[rich-js](https://github.com/brandon-fryslie/rich-js)** — terminal rendering primitives (panels, tables, syntax highlighting, progress bars)
- **[Ink](https://github.com/vadimdemedes/ink)** — React for CLIs (component model, layout, input handling)

Each component constructs a rich-js renderable from props, serializes it to ANSI via `renderToString`, and hands the result to Ink's `<Text>`. rich-js owns rendering semantics. Ink owns layout and the React lifecycle.

```
Props → rich-js Renderable → Segment[] → ANSI string → <Text>{ansi}</Text>
```

**Animated components** (spinners, progress) use Ink's `useAnimation` for timing instead of rich-js's `setInterval`-based approach. React owns the render loop.

**Interactive components** (prompts, select) use Ink's `useInput` for keystrokes and rich-js for styling only.

## Install

```bash
npm install rich-js-ink rich-js ink react
```

## Components

### Bridge Layer

#### `renderToString(renderable, options)`

Core bridge function. Takes any rich-js `Renderable`, serializes to ANSI.

```ts
import { renderToString } from "rich-js-ink";
import { Panel, RichText, ROUNDED } from "rich-js-ink";

const panel = new Panel(new RichText("hello"), { box: ROUNDED });
const ansi = renderToString(panel, { width: 80 });
```

#### `<Rich>`

Generic wrapper — render any rich-js `Renderable` as an Ink component.

```tsx
<Rich renderable={someRenderable} width={80} />
```

Props: `renderable: Renderable`, `width?`, `colorSystem?`

#### `<RichMarkup>`

Render Rich markup strings with inline styling.

```tsx
<RichMarkup>{"[bold cyan]Hello[/] [dim]world[/]"}</RichMarkup>
```

Props: `children: string`, `width?`

#### `useRichRenderable(factory, deps)`

Convenience hook for inline renderables.

```tsx
const output = useRichRenderable(
  (width) => new Panel(new RichText("hello"), { box: ROUNDED }),
  [],
);
return <Text>{output}</Text>;
```

---

### Static Renderables

#### `<RichPanel>`

Bordered box with optional title/subtitle. String children are parsed as Rich markup.

```tsx
<RichPanel title="Config" box={ROUNDED} style="blue">
  {"[bold]key[/]: value"}
</RichPanel>
```

Props: extends `PanelOptions` + `children: string | Renderable`, `width?`

#### `<RichTable>`

Declarative table from column definitions and row data.

```tsx
<RichTable
  columns={[{ header: "Name" }, { header: "Value", justify: "right" }]}
  rows={[["host", "localhost"], ["port", "3000"]]}
  box={ROUNDED}
/>
```

Props: extends `TableOptions` + `columns: ColumnOptions[]`, `rows: unknown[][]`, `width?`

#### `<RichTree>`

Tree from nested data structure.

```tsx
<RichTree
  root={{
    label: "src/",
    children: [
      { label: "core/", children: [{ label: "style.ts" }] },
      { label: "index.ts" },
    ],
  }}
  guide_style="dim cyan"
/>
```

Props: extends `TreeOptions` + `root: TreeNode`, `width?`

#### `<RichRule>`

Horizontal divider with optional title.

```tsx
<RichRule title="Section" style="blue" align="center" />
```

Props: extends `RuleOptions` + `title?`, `width?`

#### `<RichSyntax>`

Syntax-highlighted source code.

```tsx
<RichSyntax language="typescript" lineNumbers>
  {sourceCode}
</RichSyntax>
```

Props: extends `SyntaxOptions` + `children: string`, `language?`, `width?`

#### `<RichMarkdown>`

Rendered Markdown content.

```tsx
<RichMarkdown>{"# Heading\n\nSome **bold** text"}</RichMarkdown>
```

Props: extends `MarkdownOptions` + `children: string`, `width?`

#### `<RichJSON>`

Syntax-highlighted JSON display.

```tsx
<RichJSON data={{ name: "rich-js", version: "0.0.1" }} indent={2} sortKeys />
```

Props: extends `JSONOptions` + `data: unknown`, `width?`

#### `<RichPretty>`

Pretty-printed JavaScript data structures.

```tsx
<RichPretty data={complexObject} expandAll indentGuides />
```

Props: extends `PrettyOptions` + `data: unknown`, `width?`

#### `<RichColumns>`

Multi-column layout of renderables.

```tsx
<RichColumns items={["one", "two", "three", "four"]} equal expand />
```

Props: extends `ColumnsOptions` + `items: (string | Renderable)[]`, `width?`

#### `<RichTraceback>`

Formatted error traceback.

```tsx
<RichTraceback error={caughtError} maxFrames={10} showLocals />
```

Props: extends `TracebackOptions` + `error: Error`, `width?`

---

### Animated Components

#### `<RichSpinner>`

Animated spinner with optional text label.

```tsx
<RichSpinner name="dots" text="Loading..." style="cyan" />
```

Props: `name?`, `text?`, `style?`, `speed?`

#### `<RichProgressBar>`

Progress bar. Animation comes from the parent updating the `completed` prop.

```tsx
<RichProgressBar completed={42} total={100} style="green" />
```

Props: extends `ProgressBarOptions` + `width?`

#### `<RichStatus>`

Spinner + status message combination.

```tsx
<RichStatus message="Downloading..." spinner="dots" style="bold blue" />
```

Props: `message: string`, `spinner?`, `speed?`, `style?`

#### `<RichProgress>`

Multi-task progress display with configurable columns.

```tsx
const { tasks, addTask, updateTask } = useProgress();

<RichProgress tasks={tasks} columns={["text", "bar", "percentage", "time"]} />
```

Column types: `"text"`, `"bar"`, `"percentage"`, `"time"`, `"elapsed"`, `"spinner"`, `"mofn"`

Props: `tasks: TaskState[]`, `columns?`, `expand?`, `width?`

---

### Interactive Components

#### `<RichPrompt>`

Inline text input prompt.

```tsx
<RichPrompt
  message="Enter your name"
  defaultValue="world"
  onSubmit={(value) => setState(value)}
/>
```

Props: `message: string`, `defaultValue?`, `onSubmit: (value: string) => void`, `style?`

#### `<RichConfirm>`

Yes/no confirmation.

```tsx
<RichConfirm message="Continue?" onConfirm={(yes) => { ... }} />
```

Props: `message: string`, `defaultValue?: boolean`, `onConfirm: (confirmed: boolean) => void`

#### `<RichSelect>`

Scrollable selection list.

```tsx
<RichSelect
  items={["Option A", "Option B", "Option C"]}
  onSelect={(item, index) => { ... }}
  highlightStyle="bold cyan"
/>
```

Props: `items: string[]`, `onSelect: (item: string, index: number) => void`, `style?`, `highlightStyle?`

---

### Hooks

#### `useSpinnerFrame(name?, interval?)`

Low-level hook returning the current spinner frame string.

```ts
const frame = useSpinnerFrame("dots");
return <Text>{frame} Loading...</Text>;
```

#### `useProgress()`

State manager for multi-task progress. Pairs with `<RichProgress>`.

```ts
const { tasks, addTask, updateTask, startTask, removeTask } = useProgress();
const id = addTask("Downloading", { total: 100 });
updateTask(id, { advance: 10 });
```

#### `useRichTheme()`

Access the color system and theme from context.

```ts
const { colorSystem, theme } = useRichTheme();
```

---

### Context Providers

#### `<RichThemeProvider>`

Sets color system for all descendant components. Avoids prop-drilling.

```tsx
<RichThemeProvider colorSystem={ColorSystem.EIGHT_BIT}>
  <App />
</RichThemeProvider>
```

Props: `colorSystem?`, `theme?`, `children`

---

### Re-exports

Common rich-js utilities are re-exported so you don't need to depend on rich-js directly for basic usage:

```ts
// Box styles
import { ROUNDED, DOUBLE, HEAVY, ASCII, SQUARE, MINIMAL, ... } from "rich-js-ink";

// Style utilities
import { Style, NULL_STYLE, RichText, renderMarkup } from "rich-js-ink";

// Spinner data
import { SPINNERS, DEFAULT_SPINNER } from "rich-js-ink";

// Color system
import { ColorSystem } from "rich-js-ink";
```

## Architecture

The components fall into three bridge patterns:

| Pattern | Components | rich-js role | Ink role |
|---------|-----------|-------------|---------|
| **Static bridge** | Panel, Table, Tree, Rule, Syntax, Markdown, JSON, Pretty, Columns, Traceback | Constructs renderable, renders segments, serializes to ANSI | Layout, React lifecycle |
| **Animation bridge** | Spinner, ProgressBar, Status, Progress | Frame data (`SPINNERS`), bar rendering (`ProgressBar`) | Timing (`useAnimation`), state |
| **Input bridge** | Prompt, Confirm, Select | Styling (`Style.parse().render()`) | Input (`useInput`), layout |

### What's NOT bridged (and why)

- **`Live`** — Ink's React reconciler IS the live rendering system
- **`Console`** — Would bypass Ink's rendering and corrupt the display
- **`Constrain`** — Exposed as `width?` prop on every component instead
- **`Align`, `Padding`, `Group`, `Layout`** — Ink owns layout via Yoga flexbox. Wrapping these would produce double-layout bugs (rich-js bakes spacing into the string as literal characters, then Yoga applies its own spacing around it). Use Ink's `<Box>` instead — see the [migration guide](SPEC.md#8-coming-from-python-rich--layout-migration-guide)

## License

MIT
