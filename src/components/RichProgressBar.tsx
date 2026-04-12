/**
 * <RichProgressBar> — progress bar (single bar).
 *
 * Animation comes from the parent updating the `completed` prop.
 * This component is statically rendered each frame.
 *
 * [LAW:one-source-of-truth] rich-js ProgressBar owns bar rendering.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { ProgressBar } from "rich-js";
import type { ProgressBarOptions } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichProgressBarProps extends ProgressBarOptions {
  /** Override available width. */
  width?: number;
}

export function RichProgressBar({
  width,
  ...barOptions
}: RichProgressBarProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const bar = new ProgressBar(barOptions);
    return renderToString(bar, { width: effectiveWidth });
  }, [effectiveWidth, barOptions]);

  return <Text>{output}</Text>;
}
