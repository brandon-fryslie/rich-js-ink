/**
 * <RichConfirm> — yes/no confirmation prompt.
 *
 * [LAW:single-enforcer] Ink useInput is the single input handler.
 */

import React, { useState, useCallback } from "react";
import { Text, useInput } from "ink";

export interface RichConfirmProps {
  /** Confirmation message. */
  message: string;
  /** Default value (true = yes, false = no). */
  defaultValue?: boolean;
  /** Called when the user confirms or denies. */
  onConfirm: (confirmed: boolean) => void;
}

export function RichConfirm({
  message,
  defaultValue,
  onConfirm,
}: RichConfirmProps): React.JSX.Element {
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<boolean | undefined>(undefined);

  useInput(
    useCallback(
      (input: string, key) => {
        if (answered) return;

        const lower = input.toLowerCase();
        if (lower === "y") {
          setAnswered(true);
          setResult(true);
          onConfirm(true);
        } else if (lower === "n") {
          setAnswered(true);
          setResult(false);
          onConfirm(false);
        } else if (key.return && defaultValue !== undefined) {
          setAnswered(true);
          setResult(defaultValue);
          onConfirm(defaultValue);
        }
      },
      [answered, defaultValue, onConfirm],
    ),
    { isActive: !answered },
  );

  const hint =
    defaultValue === true
      ? " [Y/n]"
      : defaultValue === false
        ? " [y/N]"
        : " [y/n]";

  const suffix = answered ? (result ? " Yes" : " No") : "";

  return (
    <Text>
      {message}{hint}{suffix}
    </Text>
  );
}
