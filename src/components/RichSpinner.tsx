/**
 * <RichSpinner> — animated spinner with optional text label.
 *
 * Uses Ink's useAnimation for timing, indexes into SPINNERS frame data.
 * Does NOT use rich-js Spinner's internal timer.
 *
 * [LAW:single-enforcer] Ink's useAnimation is the single timing authority.
 */

import React from "react";
import { Text } from "ink";
import { Style, ColorSystem } from "rich-js";
import { useSpinnerFrame } from "../hooks/useSpinnerFrame.js";
import { useRichTheme } from "../hooks/useRichTheme.js";

export interface RichSpinnerProps {
  /** Spinner name (e.g. "dots", "line"). Defaults to "dots". */
  name?: string;
  /** Text to display next to the spinner. */
  text?: string;
  /** Style for the spinner character. */
  style?: string;
  /** Animation speed multiplier. */
  speed?: number;
}

export function RichSpinner({
  name,
  text,
  style,
  speed,
}: RichSpinnerProps): React.JSX.Element {
  const { colorSystem } = useRichTheme();
  const cs = colorSystem ?? ColorSystem.TRUECOLOR;

  // Compute effective interval based on speed multiplier
  const frame = useSpinnerFrame(name, speed ? Math.round(80 / speed) : undefined);

  const styledFrame = style
    ? Style.parse(style).render(frame, cs)
    : frame;

  const label = text ? ` ${text}` : "";

  return <Text>{styledFrame}{label}</Text>;
}
