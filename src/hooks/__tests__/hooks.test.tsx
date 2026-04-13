/**
 * Tests for hooks and context providers.
 *
 * [LAW:behavior-not-structure] Tests assert behavior, not implementation.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString, Text } from "ink";
import { RichThemeProvider, useRichTheme } from "../useRichTheme.js";
import { useRichRenderable } from "../useRichRenderable.js";
import { useProgress } from "../useProgress.js";
import { ColorSystem, RichText, Panel, ROUNDED } from "rich-js";

const COLS = 60;

function render(node: React.ReactNode): string {
  return renderToString(node, { columns: COLS });
}

describe("RichThemeProvider + useRichTheme", () => {
  function ThemeConsumer(): React.JSX.Element {
    const { colorSystem } = useRichTheme();
    return <Text>cs={colorSystem}</Text>;
  }

  it("provides default TRUECOLOR color system", () => {
    const output = render(
      <RichThemeProvider>
        <ThemeConsumer />
      </RichThemeProvider>,
    );
    expect(output).toContain(`cs=${ColorSystem.TRUECOLOR}`);
  });

  it("provides custom color system", () => {
    const output = render(
      <RichThemeProvider colorSystem={ColorSystem.EIGHT_BIT}>
        <ThemeConsumer />
      </RichThemeProvider>,
    );
    expect(output).toContain(`cs=${ColorSystem.EIGHT_BIT}`);
  });
});

describe("useRichRenderable", () => {
  function RenderableUser(): React.JSX.Element {
    const output = useRichRenderable(
      (_width) => new RichText("hook-output", { end: "" }),
      [],
    );
    return <Text>{output}</Text>;
  }

  it("returns ANSI string from factory", () => {
    const output = render(
      <RichThemeProvider>
        <RenderableUser />
      </RichThemeProvider>,
    );
    expect(output).toContain("hook-output");
  });

  function PanelUser(): React.JSX.Element {
    const output = useRichRenderable(
      (_width) => new Panel(new RichText("inside panel", { end: "" }), { box: ROUNDED }),
      [],
    );
    return <Text>{output}</Text>;
  }

  it("works with complex renderables", () => {
    const output = render(
      <RichThemeProvider>
        <PanelUser />
      </RichThemeProvider>,
    );
    expect(output).toContain("inside panel");
    expect(output).toContain("╭");
  });
});

describe("useProgress", () => {
  it("has correct initial types (smoke test)", () => {
    // useProgress is a React hook — we can't call it outside a component.
    // Verify the module exports the expected shape.
    expect(typeof useProgress).toBe("function");
  });

  function ProgressUser(): React.JSX.Element {
    const { tasks, addTask } = useProgress();
    // useLayoutEffect runs synchronously in renderToString
    React.useLayoutEffect(() => {
      addTask("Download", { total: 100 });
    }, [addTask]);
    return <Text>tasks={tasks.length}</Text>;
  }

  it("can add tasks via useLayoutEffect", () => {
    const output = render(<ProgressUser />);
    // useLayoutEffect fires synchronously in Ink's renderToString
    expect(output).toContain("tasks=1");
  });
});
