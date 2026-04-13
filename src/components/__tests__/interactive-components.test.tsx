/**
 * Tests for interactive components (Tier 6).
 *
 * Note: useInput is a no-op in Ink's renderToString, so we can only
 * test the initial render state. Full interaction testing would require
 * Ink's render() with stdin mocking.
 *
 * [LAW:behavior-not-structure] Tests assert visible output.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "ink";
import { RichPrompt } from "../RichPrompt.js";
import { RichConfirm } from "../RichConfirm.js";
import { RichSelect } from "../RichSelect.js";
import { RichThemeProvider } from "../../hooks/useRichTheme.js";

const COLS = 60;

function render(node: React.ReactNode): string {
  return renderToString(node, { columns: COLS });
}

describe("RichPrompt", () => {
  it("renders prompt message", () => {
    const output = render(
      <RichThemeProvider>
        <RichPrompt message="Enter name" onSubmit={() => {}} />
      </RichThemeProvider>,
    );
    expect(output).toContain("Enter name");
  });

  it("renders default value", () => {
    const output = render(
      <RichThemeProvider>
        <RichPrompt message="Name" defaultValue="Alice" onSubmit={() => {}} />
      </RichThemeProvider>,
    );
    expect(output).toContain("Alice");
  });

  it("shows cursor when not submitted", () => {
    const output = render(
      <RichThemeProvider>
        <RichPrompt message="Name" onSubmit={() => {}} />
      </RichThemeProvider>,
    );
    expect(output).toContain("█");
  });
});

describe("RichConfirm", () => {
  it("renders confirmation message with hint", () => {
    const output = render(
      <RichConfirm message="Continue?" onConfirm={() => {}} />,
    );
    expect(output).toContain("Continue?");
    expect(output).toContain("[y/n]");
  });

  it("shows Y/n hint when defaultValue is true", () => {
    const output = render(
      <RichConfirm message="OK?" defaultValue={true} onConfirm={() => {}} />,
    );
    expect(output).toContain("[Y/n]");
  });

  it("shows y/N hint when defaultValue is false", () => {
    const output = render(
      <RichConfirm message="OK?" defaultValue={false} onConfirm={() => {}} />,
    );
    expect(output).toContain("[y/N]");
  });
});

describe("RichSelect", () => {
  it("renders all items", () => {
    const output = render(
      <RichThemeProvider>
        <RichSelect
          items={["Option A", "Option B", "Option C"]}
          onSelect={() => {}}
        />
      </RichThemeProvider>,
    );
    expect(output).toContain("Option A");
    expect(output).toContain("Option B");
    expect(output).toContain("Option C");
  });

  it("highlights the first item by default", () => {
    const output = render(
      <RichThemeProvider>
        <RichSelect
          items={["First", "Second"]}
          onSelect={() => {}}
        />
      </RichThemeProvider>,
    );
    // First item gets the ❯ prefix
    expect(output).toContain("❯");
  });
});
