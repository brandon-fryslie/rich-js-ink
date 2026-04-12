/**
 * <RichLayout> — split-pane layout (horizontal/vertical regions).
 *
 * Declarative props interface over rich-js Layout's imperative splitRow/splitColumn API.
 *
 * [LAW:one-source-of-truth] rich-js Layout owns space distribution and rendering.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Layout } from "rich-js";
import type { Renderable } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface SplitDef {
  name?: string;
  ratio?: number;
  size?: number;
  content: string | Renderable;
}

export interface RichLayoutProps {
  /** Split direction. */
  direction: "row" | "column";
  /** Split definitions. */
  splits: SplitDef[];
  /** Override available width. */
  width?: number;
  /** Available height (for column layouts). */
  height?: number;
}

export function RichLayout({
  direction,
  splits,
  width,
  height,
}: RichLayoutProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const root = new Layout();
    const children = splits.map(
      (s) =>
        new Layout(s.content, {
          name: s.name,
          ratio: s.ratio,
          size: s.size,
        }),
    );

    if (direction === "row") {
      root.splitRow(...children);
    } else {
      root.splitColumn(...children);
    }

    return renderToString(root, { width: effectiveWidth });
  }, [direction, splits, effectiveWidth, height]);

  return <Text>{output}</Text>;
}
