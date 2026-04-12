/**
 * <RichAlign> — horizontal alignment wrapper.
 *
 * [LAW:one-source-of-truth] rich-js Align owns alignment computation.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Align } from "rich-js";
import type { Alignment, Renderable } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichAlignProps {
  /** Horizontal alignment. */
  align: Alignment;
  /** The renderable to align. */
  children: Renderable;
  /** Override available width. */
  width?: number;
}

export function RichAlign({ align, children, width }: RichAlignProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const aligned = new Align(children, align);
    return renderToString(aligned, { width: effectiveWidth });
  }, [align, children, effectiveWidth]);

  return <Text>{output}</Text>;
}
