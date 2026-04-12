/**
 * useSpinnerFrame — low-level hook returning the current spinner frame string.
 *
 * Uses Ink's useAnimation for timing. Does NOT use rich-js Spinner's internal
 * timer — Ink owns the render loop.
 *
 * [LAW:one-source-of-truth] SPINNERS data is the single source of frame content.
 * [LAW:single-enforcer] Ink's useAnimation is the single timing authority.
 */

import { useAnimation } from "ink";
import { SPINNERS, DEFAULT_SPINNER } from "rich-js";

export function useSpinnerFrame(
  name?: string,
  interval?: number,
): string {
  const spinnerName = name ?? DEFAULT_SPINNER;
  const data = SPINNERS[spinnerName];
  if (!data) {
    throw new Error(`Unknown spinner: "${spinnerName}"`);
  }

  const effectiveInterval = interval ?? data.interval;
  const { frame } = useAnimation({ interval: effectiveInterval });

  return data.frames[frame % data.frames.length]!;
}
