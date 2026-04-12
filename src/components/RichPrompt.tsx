/**
 * <RichPrompt> — inline prompt for user input, rendered with rich-js styling.
 *
 * Uses Ink's useInput for keystroke handling.
 *
 * [LAW:single-enforcer] Ink useInput is the single input handler.
 */

import React, { useState, useCallback } from "react";
import { Text, useInput } from "ink";
import { Style, ColorSystem } from "rich-js";
import { useRichTheme } from "../hooks/useRichTheme.js";

export interface RichPromptProps {
  /** Prompt message. */
  message: string;
  /** Default value. */
  defaultValue?: string;
  /** Called when the user submits (Enter). */
  onSubmit: (value: string) => void;
  /** Style for the prompt message. */
  style?: string;
}

export function RichPrompt({
  message,
  defaultValue = "",
  onSubmit,
  style,
}: RichPromptProps): React.JSX.Element {
  const [value, setValue] = useState(defaultValue);
  const [submitted, setSubmitted] = useState(false);
  const { colorSystem } = useRichTheme();
  const cs = colorSystem ?? ColorSystem.TRUECOLOR;

  useInput(
    useCallback(
      (input: string, key) => {
        if (submitted) return;

        if (key.return) {
          setSubmitted(true);
          onSubmit(value);
          return;
        }
        if (key.backspace || key.delete) {
          setValue((prev) => prev.slice(0, -1));
          return;
        }
        if (!key.ctrl && !key.meta && input) {
          setValue((prev) => prev + input);
        }
      },
      [value, submitted, onSubmit],
    ),
    { isActive: !submitted },
  );

  const styledMessage = style
    ? Style.parse(style).render(message, cs)
    : message;

  const cursor = submitted ? "" : "█";

  return (
    <Text>
      {styledMessage}: {value}{cursor}
    </Text>
  );
}
