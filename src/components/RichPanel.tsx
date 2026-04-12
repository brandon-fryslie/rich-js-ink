/**
 * <RichPanel> — Ink component wrapping rich-js Panel.
 *
 * Provides a React-friendly props interface for the Panel renderable.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Panel } from "rich-js";
import type { PanelOptions } from "rich-js";
import type { Renderable } from "rich-js";
import { renderMarkup } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichPanelProps extends PanelOptions {
  /** Panel body content — string or rich-js Renderable. */
  children: string | Renderable;
  /** Override available width. */
  width?: number;
}

export function RichPanel({ children, width, ...panelOptions }: RichPanelProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const content: Renderable =
    typeof children === "string" ? renderMarkup(children) : children;

  const output = useMemo(() => {
    const panel = new Panel(content, panelOptions);
    return renderToString(panel, { width: effectiveWidth });
  }, [content, effectiveWidth, panelOptions]);

  return <Text>{output}</Text>;
}
