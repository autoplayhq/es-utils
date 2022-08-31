import { dev } from "./DevString";
import { devStringify } from "./devStringify";
import { describe, expect, it, jest } from "@jest/globals";

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
      "[ "Error resulting from ",
        { error: "TypeError: Unknown type\\"
                 \\"",
          stack: "TypeError: Unknown type\\"
                 \\"
                     at Object.<anonymous> (🙈/src/internal/devStringify.test.ts:17:45)
                     at Promise.then.completed (node_modules/jest-circus/build/utils.js:333:28)
                     at new Promise (<anonymous>)
                     at callAsyncCircusFn (node_modules/jest-circus/build/utils.js:259:10)
                     at _callCircusTest (node_modules/jest-circus/build/run.js:277:40)
                     at processTicksAndRejections (node:internal/process/task_queues:95:5)
                     at _runTest (node_modules/jest-circus/build/run.js:209:3)
                     at _runTestsForDescribeBlock (node_modules/jest-circus/build/run.js:97:9)
                     at _runTestsForDescribeBlock (node_modules/jest-circus/build/run.js:91:9)
                     at run (node_modules/jest-circus/build/run.js:31:3)" },
        ". This might have been caused by ",
        "https://example.com/" ]"
    `);
    expectStringWithPaths(devStringify(reason.causedA`failed to log in`)).toMatchInlineSnapshot(`
      "[ "the user saw an error",
        { cause: [
            "Error resulting from ",
            { error: "TypeError: Unknown type\\"
                     \\"",
              stack: "TypeError: Unknown type\\"
                     \\"
                         at Object.<anonymous> (🙈/src/internal/devStringify.test.ts:17:45)
                         at Promise.then.completed (node_modules/jest-circus/build/utils.js:333:28)
                         at new Promise (<anonymous>)
                         at callAsyncCircusFn (node_modules/jest-circus/build/utils.js:259:10)
                         at _callCircusTest (node_modules/jest-circus/build/run.js:277:40)
                         at processTicksAndRejections (node:internal/process/task_queues:95:5)
                         at _runTest (node_modules/jest-circus/build/run.js:209:3)
                         at _runTestsForDescribeBlock (node_modules/jest-circus/build/run.js:97:9)
                         at _runTestsForDescribeBlock (node_modules/jest-circus/build/run.js:91:9)
                         at run (node_modules/jest-circus/build/run.js:31:3)" },
            ". This might have been caused by ",
            "https://example.com/" ] } ]"
    `);
    // expect(devStringify(dev1)).toMatchInlineSnapshot();
  });
});

function expectStringWithPaths(str: string) {
  return expect(str.split(process.cwd()).join("🙈"));
}
