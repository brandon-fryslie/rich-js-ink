/**
 * <RichTable> — Ink component wrapping rich-js Table.
 *
 * Provides a declarative API for creating tables.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Table } from "rich-js";
import type { TableOptions, ColumnOptions } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichTableProps extends TableOptions {
  /** Column definitions. */
  columns: ColumnOptions[];
  /** Row data — each row is an array of cell values matching column order. */
  rows: unknown[][];
  /** Override available width. */
  width?: number;
}

export function RichTable({
  columns: columnDefs,
  rows,
  width,
  ...tableOptions
}: RichTableProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const table = new Table(tableOptions);
    for (const colDef of columnDefs) {
      table.addColumn(colDef.header as string | undefined, colDef);
    }
    for (const row of rows) {
      table.addRow(...row);
    }
    return renderToString(table, { width: effectiveWidth });
  }, [columnDefs, rows, effectiveWidth, tableOptions]);

  return <Text>{output}</Text>;
}
