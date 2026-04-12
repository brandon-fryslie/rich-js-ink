/**
 * useRichRenderable — convenience hook to construct and render a rich-js
 * renderable inline.
 *
 * Returns the ANSI string for use inside Ink's <Text>.
 *
 * [LAW:one-source-of-truth] rich-js owns rendering; this hook only serializes.
 */

import { useMemo } from "react";
import { useWindowSize } from "ink";
import type { Renderable } from "rich-js";
import { renderToString } from "../render-to-string.js";
import { useRichTheme } from "./useRichTheme.js";

export function useRichRenderable(
  factory: (width: number) => Renderable,
  deps: React.DependencyList,
): string {
  const windowSize = useWindowSize();
  const { colorSystem } = useRichTheme();
  const width = windowSize.columns;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderable = useMemo(() => factory(width), [width, ...deps]);

  return useMemo(
    () => renderToString(renderable, { width, colorSystem }),
    [renderable, width, colorSystem],
  );
}
