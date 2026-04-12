# rich-js-ink — Component Specification

Bridge layer between [rich-js](https://github.com/user/rich-js) (terminal rendering primitives) and [Ink](https://github.com/vadimdemedes/ink) (React for CLIs). Every rich-js renderable gets a declarative React component with a props-driven API.

## Architecture

```
rich-js                           rich-js-ink
───────────                       ──────────────────────
Renderable.render(opts)           React component (props)
    → Segment[]                       → constructs Renderable
         → Style.render(text, cs)     → renderToString()
              → ANSI string               → <Text>{ansi}</Text>
```

**Rendering ownership:** rich-js owns all rendering semantics. rich-js-ink never reinterprets segments — it serializes them to ANSI and hands the string to Ink's `<Text>`.

**Animation ownership:** rich-js uses `setInterval` for animation (Live, Spinner, Progress). In Ink, React owns the render loop. Animated rich-js-ink components use Ink's `useAnimation` hook to drive frame advancement, then render the underlying rich-js renderable at that frame. They do NOT use rich-js's timer-based animation.

**Layout ownership:** Ink owns layout via Yoga (flexbox). rich-js-ink components report their width needs but don't fight Ink's layout system. Terminal width flows from Ink's `useWindowSize` into rich-js `RenderOptions.maxWidth`.

---

## 1. Bridge Layer

### 1.1 `renderToString(renderable, options)` ✅ DONE

Core bridge function. Takes a rich-js `Renderable`, runs its segment pipeline, serializes each segment to ANSI via `Style.render()`, returns a single string.

```ts
function renderToString(renderable: Renderable, options: RenderToStringOptions): string
```

### 1.2 `<Rich>` ✅ DONE

Generic wrapper — render any rich-js `Renderable` as an Ink component.

```tsx
<Rich renderable={someRenderable} width={80} />
```

Props: `renderable`, `width?`, `colorSystem?`

### 1.3 `useRichRenderable(factory, deps)` — Hook

Convenience hook that constructs a rich-js renderable from a factory function, memoized on deps. Returns the ANSI string. Useful for one-off inline renderables without creating a dedicated component.

```ts
const output = useRichRenderable(
  (width) => new Panel(new RichText("hello"), { box: ROUNDED }),
  []
);
return <Text>{output}</Text>;
```

### 1.4 `<RichMarkup>` — Markup Text Component

Renders a Rich markup string (`[bold red]text[/]`) as styled terminal text.

```tsx
<RichMarkup>{"[bold cyan]Hello[/] [dim]world[/]"}</RichMarkup>
```

Props: `children: string`, `style?`, `highlight?`, `justify?`

This is the simplest way to use rich-js styling in Ink without constructing renderables manually.

---

## 2. Static Renderable Components

These wrap rich-js renderables that produce static output — no animation, no timers. Each re-renders when props change.

### 2.1 `<RichPanel>` ✅ DONE

Bordered box with optional title/subtitle. String children are parsed as Rich markup.

```tsx
<RichPanel title="Config" box={ROUNDED} borderStyle="blue">
  {"[bold]key[/]: value"}
</RichPanel>
```

Props mirror `PanelOptions` + `children: string | Renderable`, `width?`

### 2.2 `<RichTable>` ✅ DONE

Declarative table from column definitions and row data.

```tsx
<RichTable
  columns={[{ header: "Name" }, { header: "Value", justify: "right" }]}
  rows={[["host", "localhost"], ["port", "3000"]]}
  box={ROUNDED}
/>
```

Props mirror `TableOptions` + `columns: ColumnOptions[]`, `rows: unknown[][]`, `width?`

### 2.3 `<RichTree>` ✅ DONE

Tree from nested data structure.

```tsx
<RichTree root={{ label: "src/", children: [{ label: "index.ts" }] }} guide_style="dim" />
```

Props mirror `TreeOptions` + `root: TreeNode`, `width?`

### 2.4 `<RichRule>`

Horizontal divider with optional title.

```tsx
<RichRule title="Section" style="blue" align="center" />
```

Props mirror `RuleOptions` + `title?: string`, `width?`

### 2.5 `<RichSyntax>`

Syntax-highlighted source code.

```tsx
<RichSyntax language="typescript" lineNumbers theme="monokai">
  {sourceCode}
</RichSyntax>
```

Props mirror `SyntaxOptions` + `children: string`, `language?: string`, `width?`

### 2.6 `<RichMarkdown>`

Rendered Markdown content.

```tsx
<RichMarkdown>{"# Heading\n\nSome **bold** text"}</RichMarkdown>
```

Props mirror `MarkdownOptions` + `children: string`, `width?`

### 2.7 `<RichJSON>`

Syntax-highlighted JSON display.

```tsx
<RichJSON data={{ name: "rich-js", version: "0.0.1" }} indent={2} sortKeys />
```

Props: `data: unknown`, `indent?`, `sortKeys?`, `highlight?`, `width?`

### 2.8 `<RichPretty>`

Pretty-printed JavaScript data structures.

```tsx
<RichPretty data={complexObject} expandAll indentGuides />
```

Props mirror `PrettyOptions` + `data: unknown`, `width?`

### 2.9 `<RichColumns>`

Multi-column layout of renderables.

```tsx
<RichColumns items={["one", "two", "three", "four"]} equal expand />
```

Props mirror `ColumnsOptions` + `items: (string | Renderable)[]`, `width?`

### 2.10 `<RichTraceback>`

Formatted error traceback.

```tsx
<RichTraceback error={caughtError} maxFrames={10} showLocals />
```

Props mirror `TracebackOptions` + `error: Error`, `width?`

### 2.11 `<RichLayout>`

Split-pane layout (horizontal/vertical regions).

```tsx
<RichLayout
  direction="row"
  splits={[
    { name: "left", ratio: 1, content: leftRenderable },
    { name: "right", ratio: 2, content: rightRenderable },
  ]}
/>
```

Props: `direction: "row" | "column"`, `splits: SplitDef[]`, `width?`, `height?`

Where `SplitDef = { name?: string, ratio?: number, size?: number, content: string | Renderable }`

### 2.12 `<RichAlign>`

Horizontal alignment wrapper.

```tsx
<RichAlign align="center">
  <RichPanel>{"centered content"}</RichPanel>
</RichAlign>
```

Props: `align: "left" | "center" | "right"`, `children: Renderable`, `width?`

### 2.13 `<RichPadding>`

Padding wrapper.

```tsx
<RichPadding padding={[1, 2]}>
  <RichPanel>{"padded"}</RichPanel>
</RichPadding>
```

Props: `padding: PaddingDimensions`, `style?`, `expand?`, `children: Renderable`, `width?`

### 2.14 `<RichGroup>`

Sequential rendering of multiple renderables (no visual chrome).

```tsx
<RichGroup>
  {[panelRenderable, tableRenderable, ruleRenderable]}
</RichGroup>
```

Props: `children: Renderable[]`, `width?`

---

## 3. Animated Components

These wrap rich-js renderables that animate. They use Ink's `useAnimation` hook for timing instead of rich-js's `setInterval`-based approach.

### 3.1 `<RichSpinner>`

Animated spinner with optional text label.

```tsx
<RichSpinner name="dots" text="Loading..." style="cyan" />
```

Props mirror `SpinnerOptions` + `name?: string`, `text?: string`

Implementation: Uses `useAnimation({ interval: spinner.interval })` to get `frame`, indexes into `SPINNERS[name].frames[frame % length]`. Does not use rich-js Spinner's internal timer.

### 3.2 `<RichProgressBar>`

Animated progress bar (single bar, not the multi-task Progress display).

```tsx
<RichProgressBar completed={42} total={100} style="green" />
```

Props mirror `ProgressBarOptions` + `width?`

Implementation: Constructs `ProgressBar` with current completed/total, renders statically each frame. Animation comes from parent updating `completed` prop.

### 3.3 `<RichStatus>`

Spinner + status message combination.

```tsx
<RichStatus message="Downloading..." spinner="dots" style="bold blue" />
```

Props: `message: string`, `spinner?: string`, `speed?: number`, `style?`

Implementation: Composes `<RichSpinner>` + styled `<Text>` for the message. Does not use rich-js's Status class (which owns a Live instance).

### 3.4 `<RichProgress>`

Multi-task progress display with configurable columns.

```tsx
const { tasks, addTask, updateTask } = useProgress();

<RichProgress tasks={tasks} columns={["text", "bar", "percentage", "time"]} />
```

This is the most complex animated component. It needs a companion hook.

Props: `tasks: TaskState[]`, `columns?: ProgressColumnDef[]`, `expand?`, `width?`

---

## 4. Hooks

### 4.1 `useRichRenderable(factory, deps)` (§1.3)

Memoized renderable → ANSI string.

### 4.2 `useProgress()`

State manager for multi-task progress tracking. Returns task state and mutation functions. Designed to pair with `<RichProgress>`.

```ts
const { tasks, addTask, updateTask, removeTask, startTask } = useProgress();

const id = addTask("Downloading", { total: 100 });
updateTask(id, { advance: 10 });
```

Returns:
```ts
{
  tasks: TaskState[];
  addTask(description: string, options?: TaskOptions): number;
  updateTask(id: number, options: TaskUpdateOptions): void;
  startTask(id: number): void;
  removeTask(id: number): void;
}
```

### 4.3 `useSpinnerFrame(name?, interval?)`

Low-level hook returning the current spinner frame string. For building custom spinner UIs without `<RichSpinner>`.

```ts
const frame = useSpinnerFrame("dots");
return <Text>{frame} Loading...</Text>;
```

### 4.4 `useRichTheme(theme?)`

Context provider + hook for setting the rich-js color system and theme across a component tree. Avoids prop-drilling `colorSystem` to every component.

```tsx
<RichThemeProvider colorSystem={ColorSystem.TRUECOLOR} theme={customTheme}>
  <App />
</RichThemeProvider>

// In any child:
const { colorSystem, theme } = useRichTheme();
```

---

## 5. Context Providers

### 5.1 `<RichThemeProvider>`

Sets color system and theme for all descendant rich-js-ink components.

```tsx
<RichThemeProvider colorSystem={ColorSystem.EIGHT_BIT}>
  <RichPanel>{"auto-downgraded colors"}</RichPanel>
</RichThemeProvider>
```

Props: `colorSystem?: ColorSystem`, `theme?: Theme`, `children: ReactNode`

---

## 6. Interactive Components

These leverage Ink's input handling (`useInput`, `useFocus`) combined with rich-js rendering.

### 6.1 `<RichPrompt>`

Inline prompt for user input, rendered with rich-js styling.

```tsx
<RichPrompt
  message="Enter your name"
  defaultValue="world"
  onSubmit={(value) => setState(value)}
/>
```

Props: `message: string`, `defaultValue?`, `choices?`, `onSubmit: (value: string) => void`, `style?`

Implementation: Uses Ink's `useInput` for keystroke handling, renders prompt text with rich-js markup/styling.

### 6.2 `<RichConfirm>`

Yes/no confirmation prompt.

```tsx
<RichConfirm message="Continue?" onConfirm={(yes) => { ... }} />
```

Props: `message: string`, `defaultValue?: boolean`, `onConfirm: (confirmed: boolean) => void`

### 6.3 `<RichSelect>`

Scrollable selection list with rich-js styling.

```tsx
<RichSelect
  items={["Option A", "Option B", "Option C"]}
  onSelect={(item) => { ... }}
  style="bold"
  highlightStyle="bold cyan"
/>
```

Props: `items: string[]`, `onSelect: (item: string, index: number) => void`, `style?`, `highlightStyle?`

This has no direct rich-js equivalent — it's a new interactive component that uses rich-js for styling.

---

## 7. Utility Exports

Re-exports from rich-js that users will commonly need alongside components, so they don't need to depend on rich-js directly for basic usage.

### 7.1 Box Styles

Re-export all box constants: `ASCII`, `ROUNDED`, `HEAVY`, `DOUBLE`, `SQUARE`, `MINIMAL`, etc.

### 7.2 Style Parsing

Re-export `Style.parse`, `NULL_STYLE`, `RichText`, `renderMarkup` for users who construct renderables inline.

### 7.3 Spinner Names

Re-export `SPINNERS`, `DEFAULT_SPINNER` for use with `<RichSpinner>` and `useSpinnerFrame`.

### 7.4 Color System

Re-export `ColorSystem` enum for use with `<RichThemeProvider>`.

---

## Implementation Order

The components are grouped by dependency and complexity. Each tier builds on the previous.

### Tier 1 — Foundation (done)
- [x] `renderToString`
- [x] `<Rich>`
- [x] `<RichPanel>`
- [x] `<RichTable>`
- [x] `<RichTree>`

### Tier 2 — Static Renderables
- [ ] `<RichMarkup>`
- [ ] `<RichRule>`
- [ ] `<RichSyntax>`
- [ ] `<RichMarkdown>`
- [ ] `<RichJSON>`
- [ ] `<RichPretty>`
- [ ] `<RichColumns>`
- [ ] `<RichTraceback>`

### Tier 3 — Wrappers and Context
- [ ] `<RichAlign>`
- [ ] `<RichPadding>`
- [ ] `<RichGroup>`
- [ ] `<RichLayout>`
- [ ] `<RichThemeProvider>` + `useRichTheme`
- [ ] `useRichRenderable`
- [ ] Re-exports (§7)

### Tier 4 — Animated
- [ ] `useSpinnerFrame`
- [ ] `<RichSpinner>`
- [ ] `<RichProgressBar>`
- [ ] `<RichStatus>`

### Tier 5 — Multi-Task Progress
- [ ] `useProgress`
- [ ] `<RichProgress>`

### Tier 6 — Interactive
- [ ] `<RichPrompt>`
- [ ] `<RichConfirm>`
- [ ] `<RichSelect>`

---

## Non-Goals

**`<RichLive>`** — Not implemented as a component. Ink's React reconciler IS the live rendering system. There is no need to wrap rich-js's `Live` class, which manages its own `setInterval` and cursor control. Any component that re-renders on state change is already "live" in Ink.

**`<RichConsole>`** — Not implemented. The `Console` class is rich-js's orchestrator for imperative stdout writing. In Ink, React owns the render loop. Using Console would bypass Ink's rendering entirely and corrupt the display.

**`Constrain`** — Not exposed as a standalone component. Width constraining is a prop (`width?`) on every component, which is more idiomatic in React than a wrapper component. The underlying `Constrain` class is used internally when needed.
