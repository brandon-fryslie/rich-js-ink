/**
 * <RichGroup> — sequential rendering of multiple renderables.
 *
 * [LAW:one-source-of-truth] rich-js Group owns sequencing.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Group } from "rich-js";
import type { Renderable } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichGroupProps {
  /** Renderables to display in sequence. */
  children: Renderable[];
  /** Override available width. */
  width?: number;
}

export function RichGroup({ children, width }: RichGroupProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const group = new Group(...children);
    return renderToString(group, { width: effectiveWidth });
  }, [children, effectiveWidth]);

  return <Text>{output}</Text>;
}
