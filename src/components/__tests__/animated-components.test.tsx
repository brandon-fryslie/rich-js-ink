/**
 * Tests for animated components (Tier 4-5).
 *
 * Note: useAnimation returns { frame: 0, time: 0, delta: 0 } in
 * Ink's renderToString, so we test the initial frame only.
 *
 * [LAW:behavior-not-structure] Tests assert visible output.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "ink";
import { RichSpinner } from "../RichSpinner.js";
import { RichProgressBar } from "../RichProgressBar.js";
import { RichStatus } from "../RichStatus.js";
import { RichProgress } from "../RichProgress.js";
import { RichThemeProvider } from "../../hooks/useRichTheme.js";
import type { TaskState } from "../../hooks/useProgress.js";

const COLS = 60;

function render(node: React.ReactNode): string {
  return renderToString(node, { columns: COLS });
}

describe("RichSpinner", () => {
  it("renders initial spinner frame", () => {
    const output = render(
      <RichThemeProvider>
        <RichSpinner name="dots" />
      </RichThemeProvider>,
    );
    // Frame 0 of dots spinner is "⠋"
    expect(output).toContain("⠋");
  });

  it("renders with text label", () => {
    const output = render(
      <RichThemeProvider>
        <RichSpinner name="dots" text="Loading..." />
      </RichThemeProvider>,
    );
    expect(output).toContain("Loading...");
  });
});

describe("RichProgressBar", () => {
  it("renders a progress bar", () => {
    const output = render(
      <RichProgressBar completed={50} total={100} width={40} />,
    );
    // Should contain bar characters
    expect(output).toContain("━");
  });

  it("renders empty bar at 0%", () => {
    const output = render(
      <RichProgressBar completed={0} total={100} width={40} />,
    );
    expect(output.length).toBeGreaterThan(0);
  });
});

describe("RichStatus", () => {
  it("renders spinner frame and message", () => {
    const output = render(
      <RichThemeProvider>
        <RichStatus message="Working..." spinner="dots" />
      </RichThemeProvider>,
    );
    expect(output).toContain("⠋");
    expect(output).toContain("Working...");
  });
});

describe("RichProgress", () => {
  it("renders task descriptions", () => {
    const tasks: TaskState[] = [
      {
        id: 1,
        description: "Downloading",
        total: 100,
        completed: 50,
        started: true,
        visible: true,
        startTime: Date.now() - 5000,
      },
    ];

    const output = render(
      <RichProgress tasks={tasks} columns={["text", "percentage"]} width={COLS} />,
    );
    expect(output).toContain("Downloading");
    expect(output).toContain("50%");
  });

  it("hides invisible tasks", () => {
    const tasks: TaskState[] = [
      {
        id: 1,
        description: "Visible",
        total: 100,
        completed: 0,
        started: true,
        visible: true,
        startTime: Date.now(),
      },
      {
        id: 2,
        description: "Hidden",
        total: 100,
        completed: 0,
        started: true,
        visible: false,
        startTime: Date.now(),
      },
    ];

    const output = render(
      <RichProgress tasks={tasks} columns={["text"]} width={COLS} />,
    );
    expect(output).toContain("Visible");
    expect(output).not.toContain("Hidden");
  });

  it("renders mofn column", () => {
    const tasks: TaskState[] = [
      {
        id: 1,
        description: "Task",
        total: 200,
        completed: 75,
        started: true,
        visible: true,
        startTime: Date.now(),
      },
    ];

    const output = render(
      <RichProgress tasks={tasks} columns={["mofn"]} width={COLS} />,
    );
    expect(output).toContain("75/200");
  });
});
