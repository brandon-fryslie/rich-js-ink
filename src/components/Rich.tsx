/**
 * <Rich> — the core bridge component.
 *
 * Accepts any rich-js Renderable and renders it as pre-styled ANSI text
 * inside an Ink <Text> node.
 *
 * [LAW:one-source-of-truth] Rendering logic lives in rich-js.
 * This component only serializes and displays.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import type { Renderable } from "rich-js";
import { ColorSystem } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface RichProps {
  /** The rich-js Renderable to display. */
  renderable: Renderable;
  /** Override the available width (defaults to terminal width). */
  width?: number;
  /** Color system override. */
  colorSystem?: ColorSystem;
}

export function Rich({ renderable, width, colorSystem }: RichProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(
    () =>
      renderToString(renderable, {
        width: effectiveWidth,
        colorSystem,
      }),
    [renderable, effectiveWidth, colorSystem],
  );

  return <Text>{output}</Text>;
}
