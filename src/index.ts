// Bridge
export { renderToString } from "./render-to-string.js";
export type { RenderToStringOptions } from "./render-to-string.js";

// --- Tier 1: Foundation ---

export { Rich } from "./components/Rich.js";
export type { RichProps } from "./components/Rich.js";

export { RichPanel } from "./components/RichPanel.js";
export type { RichPanelProps } from "./components/RichPanel.js";

export { RichTable } from "./components/RichTable.js";
export type { RichTableProps } from "./components/RichTable.js";

export { RichTree } from "./components/RichTree.js";
export type { RichTreeProps, TreeNode } from "./components/RichTree.js";

// --- Tier 2: Static Renderables ---

export { RichMarkup } from "./components/RichMarkup.js";
export type { RichMarkupProps } from "./components/RichMarkup.js";

export { RichRule } from "./components/RichRule.js";
export type { RichRuleProps } from "./components/RichRule.js";

export { RichSyntax } from "./components/RichSyntax.js";
export type { RichSyntaxProps } from "./components/RichSyntax.js";

export { RichMarkdown } from "./components/RichMarkdown.js";
export type { RichMarkdownProps } from "./components/RichMarkdown.js";

export { RichJSON } from "./components/RichJSON.js";
export type { RichJSONProps } from "./components/RichJSON.js";

export { RichPretty } from "./components/RichPretty.js";
export type { RichPrettyProps } from "./components/RichPretty.js";

export { RichColumns } from "./components/RichColumns.js";
export type { RichColumnsProps } from "./components/RichColumns.js";

export { RichTraceback } from "./components/RichTraceback.js";
export type { RichTracebackProps } from "./components/RichTraceback.js";

// --- Tier 3: Context and Hooks ---

export { RichThemeProvider, useRichTheme } from "./hooks/useRichTheme.js";
export type {
  RichThemeProviderProps,
  RichThemeContextValue,
} from "./hooks/useRichTheme.js";

export { useRichRenderable } from "./hooks/useRichRenderable.js";

// --- Tier 4: Animated ---

export { useSpinnerFrame } from "./hooks/useSpinnerFrame.js";

export { RichSpinner } from "./components/RichSpinner.js";
export type { RichSpinnerProps } from "./components/RichSpinner.js";

export { RichProgressBar } from "./components/RichProgressBar.js";
export type { RichProgressBarProps } from "./components/RichProgressBar.js";

export { RichStatus } from "./components/RichStatus.js";
export type { RichStatusProps } from "./components/RichStatus.js";

// --- Tier 5: Multi-Task Progress ---

export { useProgress } from "./hooks/useProgress.js";
export type {
  TaskState,
  TaskOptions,
  TaskUpdateOptions,
  UseProgressResult,
} from "./hooks/useProgress.js";

export { RichProgress } from "./components/RichProgress.js";
export type { RichProgressProps, ProgressColumnDef } from "./components/RichProgress.js";

// --- Tier 6: Interactive ---

export { RichPrompt } from "./components/RichPrompt.js";
export type { RichPromptProps } from "./components/RichPrompt.js";

export { RichConfirm } from "./components/RichConfirm.js";
export type { RichConfirmProps } from "./components/RichConfirm.js";

export { RichSelect } from "./components/RichSelect.js";
export type { RichSelectProps } from "./components/RichSelect.js";

// --- §7: Utility Re-exports from rich-js ---

// Box styles
export {
  ASCII,
  ASCII2,
  ASCII_DOUBLE_HEAD,
  SQUARE,
  SQUARE_DOUBLE_HEAD,
  MINIMAL,
  MINIMAL_HEAVY_HEAD,
  MINIMAL_DOUBLE_HEAD,
  SIMPLE,
  SIMPLE_HEAD,
  SIMPLE_HEAVY,
  HORIZONTALS,
  ROUNDED,
  HEAVY,
  HEAVY_EDGE,
  HEAVY_HEAD,
  DOUBLE,
  DOUBLE_EDGE,
  MARKDOWN,
} from "rich-js";

// Style parsing
export { Style, NULL_STYLE, RichText, renderMarkup } from "rich-js";

// Spinner data
export { SPINNERS, DEFAULT_SPINNER } from "rich-js";
export type { SpinnerData } from "rich-js";

// Color system
export { ColorSystem } from "rich-js";
