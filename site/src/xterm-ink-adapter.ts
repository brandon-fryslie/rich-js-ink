/**
 * Adapts an xterm.js Terminal instance to the NodeJS.WriteStream / ReadStream
 * interfaces that Ink's render() expects.
 *
 * [LAW:single-enforcer] xterm.js is the single rendering authority.
 * Ink writes ANSI; xterm interprets it.
 */

import type { Terminal } from "@xterm/xterm";
import { EventEmitter } from "events";

/**
 * Fake WriteStream backed by an xterm.js terminal.
 * Implements the subset of NodeJS.WriteStream that Ink actually uses:
 * - .write(data, callback?)
 * - .columns / .rows
 * - .on("resize", handler)
 * - .isTTY
 */
export class XtermWriteStream extends EventEmitter {
  readonly isTTY = true;
  private _terminal: Terminal;

  constructor(terminal: Terminal) {
    super();
    this._terminal = terminal;

    // Forward xterm resize events as Node-style 'resize'
    terminal.onResize(({ cols, rows }) => {
      this.emit("resize", cols, rows);
    });
  }

  get columns(): number {
    return this._terminal.cols;
  }

  get rows(): number {
    return this._terminal.rows;
  }

  write(data: string | Uint8Array, callbackOrEncoding?: (() => void) | string, callback?: () => void): boolean {
    const str = typeof data === "string" ? data : new TextDecoder().decode(data);
    this._terminal.write(str, typeof callbackOrEncoding === "function" ? callbackOrEncoding : callback);
    return true;
  }

  end(): void {
    // no-op
  }
}

/**
 * Fake ReadStream for Ink's stdin.
 * Forwards xterm.js onData events as Node-style 'data' events.
 * Implements the subset of NodeJS.ReadStream that Ink actually uses.
 */
export class XtermReadStream extends EventEmitter {
  readonly isTTY = true;
  private _terminal: Terminal;
  private _raw = false;

  constructor(terminal: Terminal) {
    super();
    this._terminal = terminal;

    terminal.onData((data: string) => {
      this.emit("data", data);
    });
  }

  setRawMode(raw: boolean): this {
    this._raw = raw;
    return this;
  }

  setEncoding(_encoding: string): this {
    return this;
  }

  resume(): this {
    return this;
  }

  pause(): this {
    return this;
  }

  ref(): this {
    return this;
  }

  unref(): this {
    return this;
  }

  read(): null {
    return null;
  }

  get isRaw(): boolean {
    return this._raw;
  }
}
