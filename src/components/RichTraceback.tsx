/**
 * <RichTraceback> — formatted error traceback.
 *
 * [LAW:one-source-of-truth] rich-js Traceback owns stack parsing and formatting.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Traceback } from "rich-js";
import type { TracebackOptions } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichTracebackProps extends TracebackOptions {
  /** Error to display. */
  error: Error;
  /** Override available width. */
  width?: number;
}

export function RichTraceback({
  error,
  width,
  ...tracebackOptions
}: RichTracebackProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const tb = new Traceback(error, tracebackOptions);
    return renderToString(tb, { width: effectiveWidth });
  }, [error, effectiveWidth, tracebackOptions]);

  return <Text>{output}</Text>;
}
