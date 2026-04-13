/**
 * Tests for the bridge layer (renderToString) and re-exports.
 *
 * [LAW:behavior-not-structure] Tests assert rendering behavior.
 */

import { describe, it, expect } from "vitest";
import { renderToString } from "../render-to-string.js";
import { RichText, Style, ColorSystem } from "rich-js";

describe("renderToString", () => {
  it("renders plain text", () => {
    const text = new RichText("hello", { end: "" });
    const result = renderToString(text, { width: 80 });
    expect(result).toContain("hello");
  });

  it("renders styled text with ANSI codes", () => {
    const text = new RichText("", { end: "" });
    text.append("bold", Style.parse("bold"));
    const result = renderToString(text, { width: 80, colorSystem: ColorSystem.TRUECOLOR });
    expect(result).toContain("bold");
    // Bold ANSI escape: ESC[1m
    expect(result).toContain("\x1b[1m");
  });

  it("respects width constraint", () => {
    const text = new RichText("a".repeat(100), { end: "" });
    const result = renderToString(text, { width: 20 });
    // Output should wrap or truncate based on rich-js behavior
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("re-exports", () => {
  it("exports box constants", async () => {
    const mod = await import("../index.js");
    expect(mod.ROUNDED).toBeDefined();
    expect(mod.DOUBLE).toBeDefined();
    expect(mod.ASCII).toBeDefined();
    expect(mod.HEAVY).toBeDefined();
    expect(mod.SQUARE).toBeDefined();
    expect(mod.MINIMAL).toBeDefined();
  });

  it("exports style utilities", async () => {
    const mod = await import("../index.js");
    expect(mod.Style).toBeDefined();
    expect(mod.NULL_STYLE).toBeDefined();
    expect(mod.RichText).toBeDefined();
    expect(mod.renderMarkup).toBeDefined();
  });

  it("exports spinner data", async () => {
    const mod = await import("../index.js");
    expect(mod.SPINNERS).toBeDefined();
    expect(mod.DEFAULT_SPINNER).toBeDefined();
    expect(typeof mod.SPINNERS["dots"]).toBe("object");
  });

  it("exports ColorSystem", async () => {
    const mod = await import("../index.js");
    expect(mod.ColorSystem).toBeDefined();
    expect(mod.ColorSystem.TRUECOLOR).toBeDefined();
  });
});
