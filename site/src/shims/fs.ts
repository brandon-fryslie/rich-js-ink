// Browser shim — fs functions are imported but never called in browser.
export function writeFileSync() {}
export function readFileSync() { return ""; }
export function existsSync() { return false; }
export function mkdirSync() {}
export function statSync() { return {}; }
export function readdirSync() { return []; }
export default {};
