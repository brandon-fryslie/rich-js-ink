/**
 * <RichMarkup> — renders a Rich markup string as styled terminal text.
 *
 * The simplest way to use rich-js styling in Ink without constructing
 * renderables manually.
 *
 * [LAW:one-source-of-truth] rich-js's renderMarkup owns markup parsing.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { renderMarkup } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichMarkupProps {
  /** Rich markup string (e.g. "[bold cyan]Hello[/]"). */
  children: string;
  /** Override available width. */
  width?: number;
}

export function RichMarkup({ children, width }: RichMarkupProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const renderable = renderMarkup(children);
    return renderToString(renderable, { width: effectiveWidth });
  }, [children, effectiveWidth]);

  return <Text>{output}</Text>;
}
