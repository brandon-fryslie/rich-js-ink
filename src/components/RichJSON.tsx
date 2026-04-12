/**
 * <RichJSON> — syntax-highlighted JSON display.
 *
 * [LAW:one-source-of-truth] rich-js JSONRenderable owns formatting and highlighting.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { JSONRenderable } from "rich-js";
import type { JSONOptions } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichJSONProps extends JSONOptions {
  /** Data to display as formatted JSON. */
  data: unknown;
  /** Override available width. */
  width?: number;
}

export function RichJSON({
  data,
  width,
  ...jsonOptions
}: RichJSONProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const json = JSONRenderable.fromData(data, jsonOptions);
    return renderToString(json, { width: effectiveWidth });
  }, [data, effectiveWidth, jsonOptions]);

  return <Text>{output}</Text>;
}
