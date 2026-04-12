/**
 * <RichStatus> — spinner + status message combination.
 *
 * Composes <RichSpinner> + styled <Text> for the message.
 * Does NOT use rich-js's Status class (which owns a Live instance).
 *
 * [LAW:single-enforcer] Ink owns the render loop — no Live needed.
 */

import React from "react";
import { Text } from "ink";
import { Style, ColorSystem } from "rich-js";
import { useSpinnerFrame } from "../hooks/useSpinnerFrame.js";
import { useRichTheme } from "../hooks/useRichTheme.js";

export interface RichStatusProps {
  /** Status message to display. */
  message: string;
  /** Spinner name. Defaults to "dots". */
  spinner?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** Style for the status message. */
  style?: string;
}

export function RichStatus({
  message,
  spinner,
  speed,
  style,
}: RichStatusProps): React.JSX.Element {
  const { colorSystem } = useRichTheme();
  const cs = colorSystem ?? ColorSystem.TRUECOLOR;
  const frame = useSpinnerFrame(spinner, speed ? Math.round(80 / speed) : undefined);

  const styledMessage = style
    ? Style.parse(style).render(message, cs)
    : message;

  return <Text>{frame} {styledMessage}</Text>;
}
