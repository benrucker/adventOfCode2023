export function getIsDemoMode(arg: string | undefined) {
  return arg != null && arg === "demo";
}
