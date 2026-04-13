// Browser-compatible process shim with named exports.
// Ink and its deps import { env } from 'node:process'.

export const env: Record<string, string | undefined> = {};
export const platform = "browser";
export const argv: string[] = [];
export const cwd = () => "/";
export const exit = (_code?: number) => {};
export const pid = 1;
export const stdout = undefined;
export const stdin = undefined;
export const stderr = undefined;
export const versions = { node: "0.0.0" };
export const nextTick = (fn: () => void) => Promise.resolve().then(fn);

const processShim = {
  env,
  platform,
  argv,
  cwd,
  exit,
  pid,
  stdout,
  stdin,
  stderr,
  versions,
  nextTick,
};

export default processShim;
