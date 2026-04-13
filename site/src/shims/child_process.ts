// Browser shim — these functions are imported but never called in browser.
export function execFileSync() { return ""; }
export function execSync() { return ""; }
export function spawn() { return {}; }
export default {};
