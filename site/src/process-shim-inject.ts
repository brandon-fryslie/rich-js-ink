// Injected by esbuild — provides global `process` for Ink and its deps.
// This file is injected into every module, making `process` available
// without an explicit import.

export const process = {
  env: {} as Record<string, string | undefined>,
  platform: "browser",
  argv: [] as string[],
  cwd: () => "/",
  exit: (_code?: number) => {},
  pid: 1,
  stdout: undefined,
  stdin: undefined,
  stderr: undefined,
  versions: { node: "0.0.0" } as Record<string, string>,
  version: "",
  nextTick: (fn: () => void) => Promise.resolve().then(fn),
};
