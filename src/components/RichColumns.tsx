/**
 * <RichColumns> — multi-column layout of renderables.
 *
 * [LAW:one-source-of-truth] rich-js Columns owns layout computation.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Columns } from "rich-js";
import type { ColumnsOptions } from "rich-js";
import type { Renderable } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichColumnsProps extends ColumnsOptions {
  /** Items to arrange in columns — strings or rich-js Renderables. */
  items: (string | Renderable)[];
  /** Override available width. */
  width?: number;
}

export function RichColumns({
  items,
  width,
  ...columnsOptions
}: RichColumnsProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const columns = new Columns(items, columnsOptions);
    return renderToString(columns, { width: effectiveWidth });
  }, [items, effectiveWidth, columnsOptions]);

  return <Text>{output}</Text>;
}
