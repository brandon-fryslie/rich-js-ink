/**
 * <RichRule> — horizontal divider with optional title.
 *
 * [LAW:one-source-of-truth] rich-js Rule owns rendering semantics.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Rule } from "rich-js";
import type { RuleOptions } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichRuleProps extends RuleOptions {
  /** Optional title text displayed in the rule. */
  title?: string;
  /** Override available width. */
  width?: number;
}

export function RichRule({ title, width, ...ruleOptions }: RichRuleProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const rule = new Rule(title, ruleOptions);
    return renderToString(rule, { width: effectiveWidth });
  }, [title, effectiveWidth, ruleOptions]);

  return <Text>{output}</Text>;
}
