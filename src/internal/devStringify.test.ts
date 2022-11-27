import { dev } from "./DevString.js";
import { devStringify } from "./devStringify.js";
import { tightJsonStringify } from "./tightJsonStringify.js";
import { describe, expect, it } from "@jest/globals";

describe("tightJsonStringify", () => {
  it("matches a series of expectations", () => {
    expect(devStringify({ a: 1, b: 2, c: { y: 4, z: 745 } })).toMatchInlineSnapshot(`
      "{ a: 1,
        b: 2,
        c: {
          y: 4,
          z: 745 } }"
    `);
    expect(devStringify(true)).toMatchInlineSnapshot(`"true"`);

    expect(devStringify(true)).toMatchInlineSnapshot(`"true"`);
    const reason = dev`Error resulting from ${new TypeError(
      'Unknown type"\n"',
    )}. This might have been caused by ${new URL("https://example.com")}`;

    expectStringWithPaths(devStringify(reason)).toMatchInlineSnapshot(`
      "Error resulting from { error: "TypeError: Unknown type\\"
               \\"",
        stack: "TypeError: Unknown type\\"
                 \\"
                     at Object.<anonymous> (🙈/src/internal/devStringify.test.ts:18:47)
                     at Promise.then.completed (node_modules/jest-circus/build/utils.js:333:28)
                     at new Promise (<anonymous>)
                     at callAsyncCircusFn (node_modules/jest-circus/build/utils.js:259:10)
                     at _callCircusTest (node_modules/jest-circus/build/run.js:277:40)
                     at processTicksAndRejections (node:internal/process/task_queues:95:5)
                     at _runTest (node_modules/jest-circus/build/run.js:209:3)
                     at _runTestsForDescribeBlock (node_modules/jest-circus/build/run.js:97:9)
                     at _runTestsForDescribeBlock (node_modules/jest-circus/build/run.js:91:9)
                     at run (node_modules/jest-circus/build/run.js:31:3)" }. This might have been caused by "https://example.com/""
    `);
    const input = dev`the user saw an error`.because(reason);
    expectStringWithPaths(
      tightJsonStringify(input, (key, err) => (err instanceof Error ? { error: err.message, stack: err.stack } : err)),
    ).toMatchInlineSnapshot(`
      "[ "the user saw an error",
        { "cause": [
            "Error resulting from ",
            { "error": "Unknown type\\"\\n\\"",
              "stack": "TypeError: Unknown type\\"\\n\\"\\n    at Object.<anonymous> (🙈/src/internal/devStringify.test.ts:18:47)\\n    at Promise.then.completed (/Users/cole/autoplay/artprompt-app/node_modules/.pnpm/jest-circus@28.1.3/node_modules/jest-circus/build/utils.js:333:28)\\n    at new Promise (<anonymous>)\\n    at callAsyncCircusFn (/Users/cole/autoplay/artprompt-app/node_modules/.pnpm/jest-circus@28.1.3/node_modules/jest-circus/build/utils.js:259:10)\\n    at _callCircusTest (/Users/cole/autoplay/artprompt-app/node_modules/.pnpm/jest-circus@28.1.3/node_modules/jest-circus/build/run.js:277:40)\\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\\n    at _runTest (/Users/cole/autoplay/artprompt-app/node_modules/.pnpm/jest-circus@28.1.3/node_modules/jest-circus/build/run.js:209:3)\\n    at _runTestsForDescribeBlock (/Users/cole/autoplay/artprompt-app/node_modules/.pnpm/jest-circus@28.1.3/node_modules/jest-circus/build/run.js:97:9)\\n    at _runTestsForDescribeBlock (/Users/cole/autoplay/artprompt-app/node_modules/.pnpm/jest-circus@28.1.3/node_modules/jest-circus/build/run.js:91:9)\\n    at run (/Users/cole/autoplay/artprompt-app/node_modules/.pnpm/jest-circus@28.1.3/node_modules/jest-circus/build/run.js:31:3)" },
            ". This might have been caused by ",
            "https://example.com/" ] } ]"
    `);
    expectStringWithPaths(input.toDisplay()).toMatchInlineSnapshot(`
      "the user saw an error
        because: Error resulting from { error: "TypeError: Unknown type\\"
               \\"",
        stack: "TypeError: Unknown type\\"
                 \\"
                     at Object.<anonymous> (🙈/src/internal/devStringify.test.ts:18:47)
                     at Promise.then.completed (node_modules/jest-circus/build/utils.js:333:28)
                     at new Promise (<anonymous>)
                     at callAsyncCircusFn (node_modules/jest-circus/build/utils.js:259:10)
                     at _callCircusTest (node_modules/jest-circus/build/run.js:277:40)
                     at processTicksAndRejections (node:internal/process/task_queues:95:5)
                     at _runTest (node_modules/jest-circus/build/run.js:209:3)
                     at _runTestsForDescribeBlock (node_modules/jest-circus/build/run.js:97:9)
                     at _runTestsForDescribeBlock (node_modules/jest-circus/build/run.js:91:9)
                     at run (node_modules/jest-circus/build/run.js:31:3)" }. This might have been caused by "https://example.com/""
    `);
    expect(
      devStringify({
        tr: true,
        fa: false,
        obj: JSON,
        undef: undefined,
        null: null,
      }),
    ).toMatchInlineSnapshot(`"[object Object]"`);
  });
});

function expectStringWithPaths(str: string) {
  return expect(str.split(process.cwd()).join("🙈"));
}
