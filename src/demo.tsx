/**
 * Demo — showcases rich-js components inside Ink.
 */

import React from "react";
import { render, Box, Text } from "ink";
import { RichPanel } from "./components/RichPanel.js";
import { RichTable } from "./components/RichTable.js";
import { RichTree } from "./components/RichTree.js";
import { ROUNDED, DOUBLE } from "rich-js";

function Demo(): React.JSX.Element {
  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>rich-js-ink Demo</Text>

      <RichPanel title="Hello" box={ROUNDED} style="cyan">
        {"This is a [bold magenta]rich-js[/] Panel\nrendered inside Ink!"}
      </RichPanel>

      <RichTable
        columns={[
          { header: "Name", style: "bold" },
          { header: "Language" },
          { header: "Stars", justify: "right" },
        ]}
        rows={[
          ["Rich", "Python", "50k"],
          ["rich-js", "TypeScript", "new"],
          ["Ink", "TypeScript", "28k"],
        ]}
        box={DOUBLE}
      />

      <RichTree
        root={{
          label: "src/",
          children: [
            {
              label: "core/",
              children: [
                { label: "color.ts" },
                { label: "style.ts" },
                { label: "segment.ts" },
              ],
            },
            {
              label: "renderables/",
              children: [
                { label: "panel.ts" },
                { label: "table.ts" },
                { label: "tree.ts" },
              ],
            },
          ],
        }}
        guide_style="dim cyan"
      />
    </Box>
  );
}

render(<Demo />);
