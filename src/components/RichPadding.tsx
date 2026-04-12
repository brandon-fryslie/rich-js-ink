/**
 * <RichPadding> — padding wrapper.
 *
 * [LAW:one-source-of-truth] rich-js Padding owns padding computation.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Padding } from "rich-js";
import type { PaddingDimensions, Renderable } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichPaddingProps {
  /** Padding dimensions: number, [v,h], or [top,right,bottom,left]. */
  padding: PaddingDimensions;
  /** Optional style for the padding area. */
  style?: string;
  /** Whether to expand to fill available width. */
  expand?: boolean;
  /** The renderable to pad. */
  children: Renderable;
  /** Override available width. */
  width?: number;
}

export function RichPadding({
  padding,
  style,
  expand,
  children,
  width,
}: RichPaddingProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const padded = new Padding(children, padding, { style, expand });
    return renderToString(padded, { width: effectiveWidth });
  }, [children, padding, style, expand, effectiveWidth]);

  return <Text>{output}</Text>;
}
