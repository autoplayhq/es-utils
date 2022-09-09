// regexes to remove lines from thrown error stacktraces
const AT_NODE_INTERNAL_RE = /^\s*at.+node:internal.+/gm;
const AT_TYPES_INTERNAL_RE = /^\s*at.+\/types\/src\/.+/gm;
const AT_INVARIANT_RE = /^\s*(at|[^@]+@) (?:Object\.)?(?:invariant|asError).+/gm;
const AT_INVARIANT_MORE_RE = /^\s*at.+invariant.+/gm;
const AT_TEST_HELPERS_RE = /^\s*(at|[^@]+@).+test\-helpers.+/gm;
// const AT_WEB_MODULES = /^\s*(at|[^@]+@).+(web_modules|\-[a-f0-9]{8}\.js).*/gm
const AT_ASSORTED_HELPERS_RE = /^\s*(at|[^@]+@).+(debounce|invariant|iife)\.[tj]s.*/gm;

/**
 * `DevError` removes lines from the `Error.stack` stack trace string
 * which cleans up the stack trace, making it more developer friendly to read.
 */
export class DevError extends Error {
  found: any;
  constructor(message: string) {
    super(message);
    // const before = this.stack
    // prettier-ignore
    if (this.stack) {
      this.stack = this.stack
        .replace(AT_INVARIANT_RE, "")
        .replace(AT_INVARIANT_MORE_RE, "")
        .replace(AT_TYPES_INTERNAL_RE, "")
        .replace(AT_ASSORTED_HELPERS_RE, "")
        .replace(AT_TEST_HELPERS_RE, "")
        .replace(AT_NODE_INTERNAL_RE, "");
      // console.error({ before, after: this.stack })
    }
  }
}
