import { DevString } from "./DevString";
import { devStringify } from "./devStringify";
import { t } from "./t";
import { z } from "./z";

type AllowedMessageTypes = DevString | string | number | object;

/**
 * invariants are like `expect` from jest or another testing library but
 * for use in implementations and not just tests. If the `condition` passed
 * to `invariant` is falsy then `message`, and optionally `found`, are thrown as a
 * {@link InvariantError} which has a developer-readable and command line friendly
 * stack trace and error message.
 */
export function invariant(
  shouldBeTruthy: any,
  message: (() => AllowedMessageTypes) | AllowedMessageTypes,
  butFoundInstead?: any
): asserts shouldBeTruthy {
  if (!shouldBeTruthy) {
    const isFoundArgGiven = arguments.length > 2;
    if (isFoundArgGiven) {
      invariantThrow(message, butFoundInstead);
    } else {
      invariantThrow(message);
    }
  }
}

/**
 * Throws an error message with a developer-readable and command line friendly
 * string of the argument `butFoundInstead`.
 *
 * Also see {@link invariant}, which accepts a condition.
 */
export function invariantThrow(
  message: (() => AllowedMessageTypes) | AllowedMessageTypes,
  butFoundInstead?: any
): never {
  const isFoundArgGiven = arguments.length > 1;
  const prefix = devStringify(
    typeof message === "function" ? message() : message
  );
  const suffix = isFoundArgGiven
    ? `\nInstead found: ${devStringify(butFoundInstead)}`
    : "";
  throw new InvariantError(`Invariant: ${prefix}${suffix}`, butFoundInstead);
}

/** Used with our (Autoplay) custom ZodChoice */
export function invariantChoiceIs<
  TVariants extends Record<string, any>,
  VariantName extends Extract<keyof TVariants, string>
>(
  choice: z.ZodChoiceContainer<TVariants>,
  key: VariantName,
  name = "choice"
): TVariants[VariantName] {
  return choice.matchPartial({ [key]: identity } as Partial<any>, (other) => {
    invariantThrow(`Expected ${name} to be "${key}"`, other);
  });
}

function identity<T>(x: T): T {
  return x;
}

/** Asserts that the `left` strict equals the `right` */
export function invariantEq(
  left: any,
  /** Pass a value for comparison */
  right: any,
  /** Pass a message or function producing a message */
  message?: (() => AllowedMessageTypes) | AllowedMessageTypes,
  found?: any
) {
  if (left !== right)
    throw new InvariantError(
      `Invariant expected ${devStringify(left, false)} = ${devStringify(
        right,
        false
      )}` +
        optionalMessageSuffix(message) +
        (arguments.length > 3 ? `\nInstead found: ${devStringify(found)}` : ""),
      found
    );
}

/** Asserts that the `value` conforms to the `codec` type */
export function invariantT<T>(
  value: unknown,
  /** Pass a validation */
  codec: t.Type<T>,
  /** Pass a message or function producing a message */
  message?: AllowedMessageTypes
): asserts value is T;
export function invariantT(
  value: any,
  /** Pass a validation */
  codec: t.Type<any>,
  /** Pass a message or function producing a message */
  message?: AllowedMessageTypes
) {
  let decode = codec.decode(value);
  if (decode._tag === "Left") {
    console.error(
      "Invariant failed to type check",
      message,
      "in",
      value,
      "with errors",
      ...decode.left
    );
    throw new InvariantError(
      `Invariant expected ${devStringify(value)} is ${devStringify(codec)}` +
        optionalMessageSuffix(message),
      value
    );
  }
}

/**
 * Enable exhaustive checking
 *
 * @example
 * ```ts
 * function a(x: 'a' | 'b') {
 *   if (x === 'a') {
 *
 *   } else if (x === 'b') {
 *
 *   } else {
 *     invariantUnreachable(x)
 *   }
 * }
 * ```
 */
export function invariantUnreachable(
  x: never,
  message: AllowedMessageTypes
): never {
  invariantThrow(
    "invariantUnreachable encountered value which was supposed to be never" +
      optionalMessageSuffix(message),
    x
  );
}

function optionalMessageSuffix(message?: AllowedMessageTypes): string {
  return message
    ? " in " + devStringify(typeof message === "function" ? message() : message)
    : "";
}

// regexes to remove lines from thrown error stacktraces
const AT_NODE_INTERNAL_RE = /^\s*at.+node:internal.+/gm;
const AT_TYPES_INTERNAL_RE = /^\s*at.+\/types\/src\/.+/gm;
const AT_INVARIANT_RE = /^\s*(at|[^@]+@) (?:Object\.)?invariant.+/gm;
const AT_INVARIANT_MORE_RE = /^\s*at.+invariant.+/gm;
const AT_TEST_HELPERS_RE = /^\s*(at|[^@]+@).+test\-helpers.+/gm;
// const AT_WEB_MODULES = /^\s*(at|[^@]+@).+(web_modules|\-[a-f0-9]{8}\.js).*/gm
const AT_ASSORTED_HELPERS_RE =
  /^\s*(at|[^@]+@).+(debounce|invariant|iif)\.[tj]s.*/gm;

/**
 * `InvariantError` removes lines from the `Error.stack` stack trace string
 * which cleans up the stack trace, making it more developer friendly to read.
 */
class InvariantError extends Error {
  found: any;
  constructor(message: string, found?: any) {
    super(message);
    if (found !== undefined) {
      this.found = found;
    }
    // const before = this.stack
    // prettier-ignore
    this.stack = this.stack
      ?.replace(AT_INVARIANT_RE, "")
      .replace(AT_INVARIANT_MORE_RE, "")
      .replace(AT_TYPES_INTERNAL_RE, "")
      .replace(AT_ASSORTED_HELPERS_RE, "")
      .replace(AT_TEST_HELPERS_RE, "")
      .replace(AT_NODE_INTERNAL_RE, "")
    // console.error({ before, after: this.stack })
  }
}
