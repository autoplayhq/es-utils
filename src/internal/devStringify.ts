import { DevString } from "./DevString";
import { tightJsonStringify } from "./tightJsonStringify";

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
    } else if (display && input instanceof DevString) {
      return input.toDisplay();
    } else if (typeof input === "function") {
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
      return display ? cleanNewlinesAndStacks(json.replace(/(\\?")([^"]+)\1:/g, "$2:")) : json;
    }
  } catch (err) {
    return input?.name || String(input);
  }
}

function cleanNewlinesAndStacks(stack: string): string {
  // return stack;
  return (
    stack
      // replace private paths before node_modules
      .replace(/(\(|\sat )\/[^\)\s]+node_modules\//gm, "$1node_modules/")
      // replace escaped newlines in strings
      // .replace(/^(.+?)"(.*\\n(.(?!\\"))+|\\")*"$/gm, (_fullMatch, beforeQuote, inside) => {
      .replace(/([^"]+?)"((?:\\.|[^\"])*)"/g, (_fullMatch, beforeQuote, inside: string | undefined) => {
        return (
          beforeQuote +
          (inside
            ? `"${inside
                .split(/\\n/g)
                // .map((line) => line.replace(/\\"/g, '"'))
                .join("\n" + " ".repeat(beforeQuote.length))}"`
            : '""')
        );
      })
  );
}
