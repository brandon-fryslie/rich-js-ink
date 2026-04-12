/**
 * <RichPretty> — pretty-printed JavaScript data structures.
 *
 * [LAW:one-source-of-truth] rich-js Pretty owns formatting and highlighting.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Pretty } from "rich-js";
import type { PrettyOptions } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichPrettyProps extends PrettyOptions {
  /** Data to pretty-print. */
  data: unknown;
  /** Override available width. */
  width?: number;
}

export function RichPretty({
  data,
  width,
  ...prettyOptions
}: RichPrettyProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const pretty = new Pretty(data, prettyOptions);
    return renderToString(pretty, { width: effectiveWidth });
  }, [data, effectiveWidth, prettyOptions]);

  return <Text>{output}</Text>;
}
