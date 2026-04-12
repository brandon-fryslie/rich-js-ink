/**
 * <RichSelect> — scrollable selection list with rich-js styling.
 *
 * No direct rich-js equivalent — a new interactive component that uses
 * rich-js for styling.
 *
 * [LAW:single-enforcer] Ink useInput is the single input handler.
 */

import React, { useState, useCallback } from "react";
import { Text, Box, useInput } from "ink";
import { Style, ColorSystem } from "rich-js";
import { useRichTheme } from "../hooks/useRichTheme.js";

export interface RichSelectProps {
  /** Items to select from. */
  items: string[];
  /** Called when the user selects an item (Enter). */
  onSelect: (item: string, index: number) => void;
  /** Style for unselected items. */
  style?: string;
  /** Style for the highlighted (selected) item. */
  highlightStyle?: string;
}

export function RichSelect({
  items,
  onSelect,
  style,
  highlightStyle = "bold cyan",
}: RichSelectProps): React.JSX.Element {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState(false);
  const { colorSystem } = useRichTheme();
  const cs = colorSystem ?? ColorSystem.TRUECOLOR;

  const parsedStyle = style ? Style.parse(style) : undefined;
  const parsedHighlight = Style.parse(highlightStyle);

  useInput(
    useCallback(
      (_input: string, key) => {
        if (selected) return;

        if (key.upArrow) {
          setCursor((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        } else if (key.downArrow) {
          setCursor((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        } else if (key.return) {
          setSelected(true);
          onSelect(items[cursor]!, cursor);
        }
      },
      [selected, items, cursor, onSelect],
    ),
    { isActive: !selected },
  );

  return (
    <Box flexDirection="column">
      {items.map((item, i) => {
        const isHighlighted = i === cursor;
        const prefix = isHighlighted ? "❯ " : "  ";
        const styledItem = isHighlighted
          ? parsedHighlight.render(item, cs)
          : parsedStyle
            ? parsedStyle.render(item, cs)
            : item;

        return (
          <Text key={i}>
            {prefix}{styledItem}
          </Text>
        );
      })}
    </Box>
  );
}
