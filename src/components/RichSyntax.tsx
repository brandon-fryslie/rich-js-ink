/**
 * <RichSyntax> — syntax-highlighted source code.
 *
 * [LAW:one-source-of-truth] rich-js Syntax owns tokenization and highlighting.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Syntax } from "rich-js";
import type { SyntaxOptions } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichSyntaxProps extends SyntaxOptions {
  /** Source code to display. */
  children: string;
  /** Language for syntax highlighting. */
  language?: string;
  /** Override available width. */
  width?: number;
}

export function RichSyntax({
  children,
  language,
  width,
  ...syntaxOptions
}: RichSyntaxProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const syntax = new Syntax(children, language, syntaxOptions);
    return renderToString(syntax, { width: effectiveWidth });
  }, [children, language, effectiveWidth, syntaxOptions]);

  return <Text>{output}</Text>;
}
