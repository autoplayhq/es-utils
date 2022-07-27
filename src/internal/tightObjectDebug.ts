import { tightJsonStringify } from "./tightJsonStringify";

export function tightObjectDebug(obj: any) {
  return tightJsonStringify(obj, (key, value) => {
    if (value instanceof Map) {
      return Object.fromEntries(value.entries());
    }
    if (value instanceof Set) {
      return Array.from(value.values());
    }
    return value;
  });
}
