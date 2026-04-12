/**
 * <RichMarkdown> — rendered Markdown content.
 *
 * [LAW:one-source-of-truth] rich-js Markdown owns parsing and rendering.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Markdown } from "rich-js";
import type { MarkdownOptions } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichMarkdownProps extends MarkdownOptions {
  /** Markdown content string. */
  children: string;
  /** Override available width. */
  width?: number;
}

export function RichMarkdown({
  children,
  width,
  ...markdownOptions
}: RichMarkdownProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const md = new Markdown(children, markdownOptions);
    return renderToString(md, { width: effectiveWidth });
  }, [children, effectiveWidth, markdownOptions]);

  return <Text>{output}</Text>;
}
