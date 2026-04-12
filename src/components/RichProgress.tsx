/**
 * <RichProgress> — multi-task progress display with configurable columns.
 *
 * Renders task state from useProgress() as a table with progress bars,
 * percentages, spinners, and timing columns.
 *
 * Does NOT use rich-js's Progress class (which owns Live + setInterval).
 * Instead, builds a rich-js Table from task state each render.
 *
 * [LAW:one-source-of-truth] Task state comes from useProgress hook.
 * [LAW:single-enforcer] React reconciler drives re-renders, not setInterval.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Table, ProgressBar, RichText, Style } from "rich-js";
import { SPINNERS, DEFAULT_SPINNER } from "rich-js";
import { useAnimation } from "ink";
import type { TaskState } from "../hooks/useProgress.js";
import { renderToString } from "../render-to-string.js";

export type ProgressColumnDef =
  | "text"
  | "bar"
  | "percentage"
  | "time"
  | "elapsed"
  | "spinner"
  | "mofn";

export interface RichProgressProps {
  /** Task states from useProgress(). */
  tasks: TaskState[];
  /** Column definitions. Defaults to ["text", "bar", "percentage", "time"]. */
  columns?: ProgressColumnDef[];
  /** Expand table to fill available width. */
  expand?: boolean;
  /** Override available width. */
  width?: number;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function buildColumn(
  def: ProgressColumnDef,
  task: TaskState,
  spinnerFrame: string,
): RichText {
  switch (def) {
    case "text": {
      return new RichText(task.description, { end: "" });
    }
    case "bar": {
      const bar = new ProgressBar({
        total: task.total ?? 100,
        completed: task.completed,
        width: 40,
      });
      // Render the bar to text segments and assemble
      const segs = [...bar.render({ maxWidth: 40 })];
      const result = new RichText("", { end: "" });
      for (const seg of segs) {
        result.append(seg.text, seg.style);
      }
      return result;
    }
    case "percentage": {
      const percent =
        task.total ? Math.min(100, Math.round((task.completed / task.total) * 100)) : 0;
      return new RichText(`${percent}%`, { end: "" });
    }
    case "time": {
      if (!task.started || task.completed <= 0 || !task.total) {
        return new RichText("-:--:--", { end: "" });
      }
      const elapsed = (Date.now() - task.startTime) / 1000;
      const rate = task.completed / elapsed;
      const remaining = (task.total - task.completed) / rate;
      return new RichText(formatTime(remaining), { end: "" });
    }
    case "elapsed": {
      if (!task.started) {
        return new RichText("0:00:00", { end: "" });
      }
      const elapsed = (Date.now() - task.startTime) / 1000;
      return new RichText(formatTime(elapsed), { end: "" });
    }
    case "spinner": {
      const result = new RichText("", { end: "" });
      result.append(spinnerFrame, Style.parse("green"));
      return result;
    }
    case "mofn": {
      const total = task.total ?? "?";
      return new RichText(`${task.completed}/${total}`, { end: "" });
    }
  }
}

export function RichProgress({
  tasks,
  columns = ["text", "bar", "percentage", "time"],
  expand,
  width,
}: RichProgressProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  // Drive animation for spinner columns and time updates
  const hasAnimated = columns.includes("spinner") || columns.includes("time") || columns.includes("elapsed");
  const { frame } = useAnimation({ interval: 80, isActive: hasAnimated });

  const spinnerData = SPINNERS[DEFAULT_SPINNER]!;
  const spinnerFrame = spinnerData.frames[frame % spinnerData.frames.length]!;

  const output = useMemo(() => {
    const table = Table.grid({ expand });
    for (const _col of columns) {
      table.addColumn();
    }

    const visibleTasks = tasks.filter((t) => t.visible);
    for (const task of visibleTasks) {
      const cells = columns.map((def) => buildColumn(def, task, spinnerFrame));
      table.addRow(...cells);
    }

    return renderToString(table, { width: effectiveWidth });
  }, [tasks, columns, expand, effectiveWidth, spinnerFrame]);

  return <Text>{output}</Text>;
}
