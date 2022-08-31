import { DevString } from "./DevString";
import { tightJsonStringify } from "./tightJsonStringify";
import { quotelessJson } from "zod";

/**
 * Stringifies any value given. If an object is given and `indentJSON` is true,
 * then a developer-readable, command line friendly (not too spaced out, but with
 * enough whitespace to be readable).
 */
export function devStringify(input: any, display: boolean = true): string {
  try {
    if (typeof input === "string") {
      if (input[0] === "{" || input[0] === "[") {
        try {
          return devStringify(JSON.parse(input), display);
        } catch {
          // I guess it wasn't JSON. No biggie!
        }
      }
      return input;
    } else if (typeof input === "function" || input instanceof Error) {
      return input.toString();
    } else {
      const json = tightJsonStringify(input, (key, value) => {
        if (value.toJSON === undefined) {
          if (value instanceof Error) {
            return {
              // // @ts-ignore
              // cause: value.cause ?? null,
              error: value.toString(),
              stack: value.stack ?? null,
            };
          }
        }

        return value;
      });
      return display ? cleanNewlinesAndStacks(json.replace(/"([^"]+)":/g, "$1:")) : json;
    }
  } catch (err) {
    return input?.name || String(input);
  }
}

function cleanNewlinesAndStacks(stack: string): string {
  // return stack;
  return stack
    .replace(/\(\/[^\)]+node_modules\//g, "(node_modules/")
    .replace(/(.+?)"(.*\\n(.(?!\\"))+|\\")*"/gm, (_fullMatch, beforeQuote, inside) => {
      return beforeQuote + `"` + inside.split(/\\n/g).join("\n" + " ".repeat(beforeQuote.length)) + '"';
    });
}
