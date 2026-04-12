/**
 * Demo — showcases rich-js-ink components inside Ink.
 */

import React from "react";
import { render, Box, Text } from "ink";
import { RichPanel } from "./components/RichPanel.js";
import { RichTable } from "./components/RichTable.js";
import { RichTree } from "./components/RichTree.js";
import { RichMarkup } from "./components/RichMarkup.js";
import { RichRule } from "./components/RichRule.js";
import { RichSyntax } from "./components/RichSyntax.js";
import { RichJSON } from "./components/RichJSON.js";
import { RichColumns } from "./components/RichColumns.js";
import { RichSpinner } from "./components/RichSpinner.js";
import { RichStatus } from "./components/RichStatus.js";
import { RichProgressBar } from "./components/RichProgressBar.js";
import { RichThemeProvider } from "./hooks/useRichTheme.js";
import { ROUNDED, DOUBLE } from "rich-js";

function Demo(): React.JSX.Element {
  return (
    <RichThemeProvider>
      <Box flexDirection="column" gap={1}>
        <Text bold>rich-js-ink Demo</Text>

        {/* Tier 1: Foundation */}
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

        {/* Tier 2: Static Renderables */}
        <RichMarkup>{"[bold cyan]Rich Markup[/] with [italic green]inline styles[/]"}</RichMarkup>

        <RichRule title="Section Divider" style="blue" />

        <RichSyntax language="typescript" lineNumbers>
          {`function greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}`}
        </RichSyntax>

        <RichJSON data={{ name: "rich-js-ink", version: "0.0.1", features: ["panels", "tables", "spinners"] }} indent={2} />

        <RichColumns items={["Alpha", "Beta", "Gamma", "Delta", "Epsilon"]} equal />

        {/* Tier 4: Animated */}
        <RichSpinner name="dots" text="Loading resources..." style="cyan" />

        <RichStatus message="Installing dependencies..." spinner="dots" style="bold blue" />

        <RichProgressBar completed={65} total={100} style="green" width={50} />
      </Box>
    </RichThemeProvider>
  );
}

render(<Demo />);
