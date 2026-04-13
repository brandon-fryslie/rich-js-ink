/**
 * Tests for static renderable components (Tiers 1-3).
 *
 * [LAW:behavior-not-structure] Tests assert visible output behavior,
 * not implementation details.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "ink";
import { Rich } from "../Rich.js";
import { RichPanel } from "../RichPanel.js";
import { RichTable } from "../RichTable.js";
import { RichTree } from "../RichTree.js";
import { RichMarkup } from "../RichMarkup.js";
import { RichRule } from "../RichRule.js";
import { RichSyntax } from "../RichSyntax.js";
import { RichMarkdown } from "../RichMarkdown.js";
import { RichJSON } from "../RichJSON.js";
import { RichPretty } from "../RichPretty.js";
import { RichColumns } from "../RichColumns.js";
import { RichTraceback } from "../RichTraceback.js";
import { RichText, ROUNDED, DOUBLE } from "rich-js";

const COLS = 60;

function render(node: React.ReactNode): string {
  return renderToString(node, { columns: COLS });
}

// --- Tier 1 ---

describe("Rich", () => {
  it("renders a rich-js renderable to ANSI text", () => {
    const text = new RichText("hello world", { end: "" });
    const output = render(<Rich renderable={text} width={COLS} />);
    expect(output).toContain("hello world");
  });
});

describe("RichPanel", () => {
  it("renders a bordered panel with title", () => {
    const output = render(
      <RichPanel title="Test" box={ROUNDED} width={COLS}>
        {"content inside"}
      </RichPanel>,
    );
    expect(output).toContain("Test");
    expect(output).toContain("content inside");
    // Box corners
    expect(output).toContain("╭");
    expect(output).toContain("╰");
  });

  it("parses rich markup in string children", () => {
    const output = render(
      <RichPanel width={COLS}>{"[bold]emphasized[/]"}</RichPanel>,
    );
    expect(output).toContain("emphasized");
  });
});

describe("RichTable", () => {
  it("renders columns and rows", () => {
    const output = render(
      <RichTable
        columns={[{ header: "Name" }, { header: "Age" }]}
        rows={[["Alice", "30"], ["Bob", "25"]]}
        box={DOUBLE}
        width={COLS}
      />,
    );
    expect(output).toContain("Name");
    expect(output).toContain("Age");
    expect(output).toContain("Alice");
    expect(output).toContain("Bob");
  });
});

describe("RichTree", () => {
  it("renders tree labels", () => {
    const output = render(
      <RichTree
        root={{
          label: "root",
          children: [{ label: "child-a" }, { label: "child-b" }],
        }}
        width={COLS}
      />,
    );
    expect(output).toContain("root");
    expect(output).toContain("child-a");
    expect(output).toContain("child-b");
  });
});

// --- Tier 2 ---

describe("RichMarkup", () => {
  it("renders markup text", () => {
    const output = render(<RichMarkup width={COLS}>{"[bold]hello[/] world"}</RichMarkup>);
    expect(output).toContain("hello");
    expect(output).toContain("world");
  });
});

describe("RichRule", () => {
  it("renders a horizontal rule", () => {
    const output = render(<RichRule width={COLS} />);
    // Rule fills width with line characters
    expect(output).toContain("─");
  });

  it("renders with a title", () => {
    const output = render(<RichRule title="Divider" width={COLS} />);
    expect(output).toContain("Divider");
    expect(output).toContain("─");
  });
});

describe("RichSyntax", () => {
  it("renders code with line numbers", () => {
    const output = render(
      <RichSyntax language="typescript" lineNumbers width={COLS}>
        {"const x = 42;"}
      </RichSyntax>,
    );
    expect(output).toContain("const");
    expect(output).toContain("42");
    // Line numbers
    expect(output).toContain("1");
  });
});

describe("RichMarkdown", () => {
  it("renders markdown headings", () => {
    const output = render(
      <RichMarkdown width={COLS}>{"# Hello\n\nSome text"}</RichMarkdown>,
    );
    expect(output).toContain("Hello");
    expect(output).toContain("Some text");
  });
});

describe("RichJSON", () => {
  it("renders formatted JSON", () => {
    const output = render(
      <RichJSON data={{ key: "value", num: 42 }} indent={2} width={COLS} />,
    );
    expect(output).toContain("key");
    expect(output).toContain("value");
    expect(output).toContain("42");
  });

  it("sorts keys when requested", () => {
    const output = render(
      <RichJSON data={{ z: 1, a: 2 }} sortKeys width={COLS} />,
    );
    const aPos = output.indexOf("a");
    const zPos = output.indexOf("z");
    expect(aPos).toBeLessThan(zPos);
  });
});

describe("RichPretty", () => {
  it("renders data structures", () => {
    const output = render(
      <RichPretty data={{ name: "test", items: [1, 2, 3] }} width={COLS} />,
    );
    expect(output).toContain("name");
    expect(output).toContain("test");
  });
});

describe("RichColumns", () => {
  it("renders items in columns", () => {
    const output = render(
      <RichColumns items={["alpha", "beta", "gamma"]} width={COLS} />,
    );
    expect(output).toContain("alpha");
    expect(output).toContain("beta");
    expect(output).toContain("gamma");
  });
});

describe("RichTraceback", () => {
  it("renders error name and message", () => {
    const error = new Error("something broke");
    const output = render(
      <RichTraceback error={error} width={COLS} />,
    );
    expect(output).toContain("Error");
    expect(output).toContain("something broke");
  });
});

