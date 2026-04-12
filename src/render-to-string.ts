/**
 * Bridge between rich-js Renderable and plain ANSI strings.
 *
 * Takes any rich-js Renderable, runs its segment pipeline, and produces
 * a single ANSI-encoded string suitable for Ink's <Text> component.
 *
 * [LAW:one-source-of-truth] rich-js owns rendering semantics.
 * This module only serializes segments to ANSI — it never reinterprets them.
 */

import { ColorSystem } from "rich-js";
import type { Renderable, RenderOptions } from "rich-js";

export interface RenderToStringOptions {
  /** Available width in terminal columns. */
  width: number;
  /** Color system to use for ANSI output. */
  colorSystem?: ColorSystem;
}

/**
 * Render a rich-js Renderable to an ANSI string.
 */
export function renderToString(
  renderable: Renderable,
  options: RenderToStringOptions,
): string {
  const colorSystem = options.colorSystem ?? ColorSystem.TRUECOLOR;

  const renderOptions: RenderOptions = {
    maxWidth: options.width,
  };

  const segments = renderable.render(renderOptions);
  const parts: string[] = [];

  for (const segment of segments) {
    if (segment.isControl) continue;
    const text =
      segment.style && !segment.style.isNull
        ? segment.style.render(segment.text, colorSystem)
        : segment.text;
    parts.push(text);
  }

  return parts.join("");
}
