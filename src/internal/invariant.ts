import { DevError } from "./DevError";
import { DevString } from "./DevString";
import { devStringify } from "./devStringify";
import { z } from "./z/index";

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
  butFoundInstead?: any,
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
  butFoundInstead?: any,
): never {
  const isFoundArgGiven = arguments.length > 1;
  const prefix = devStringify(typeof message === "function" ? message() : message);
  const suffix = isFoundArgGiven ? `\nInstead found: ${devStringify(butFoundInstead)}` : "";
  throw new InvariantError(`Invariant: ${prefix}${suffix}`, butFoundInstead);
}

/** Used with our (Autoplay) custom ZodChoice */
export function invariantChoiceIs<
  TVariants extends Record<string, any>,
  VariantName extends Extract<keyof TVariants, string>,
>(choice: z.ZodChoiceContainer<TVariants>, key: VariantName, name = "choice"): TVariants[VariantName] {
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
  found?: any,
) {
  if (left !== right)
    throw new InvariantError(
      `Invariant expected ${devStringify(left, false)} = ${devStringify(right, false)}` +
        optionalMessageSuffix(message) +
        (arguments.length > 3 ? `\nInstead found: ${devStringify(found)}` : ""),
      found,
    );
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
export function invariantUnreachable(x: never, message?: AllowedMessageTypes): never {
  invariantThrow(
    "invariantUnreachable encountered value which was supposed to be never" + optionalMessageSuffix(message),
    x,
  );
}

function optionalMessageSuffix(message?: AllowedMessageTypes): string {
  return message ? " in " + devStringify(typeof message === "function" ? message() : message) : "";
}

/**
 * `InvariantError` removes lines from the `Error.stack` stack trace string
 * which cleans up the stack trace, making it more developer friendly to read.
 */
class InvariantError extends DevError {
  found: any;
  constructor(message: string, found?: any) {
    super(message);
    if (found !== undefined) {
      this.found = found;
    }
  }
}
