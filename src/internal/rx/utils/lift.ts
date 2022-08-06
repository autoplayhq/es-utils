import type { Rx } from "../best-practices";
import type { OperatorFunction, Tapper } from "../types";
import { isFunction } from "./isFunction";

/**
 * Used to determine if an object is an Rx with a lift function.
 */
export function hasLift(
  source: any
): source is { lift: InstanceType<typeof Rx>["lift"] } {
  return isFunction(source?.lift);
}

/**
 * Creates an `OperatorFunction`. Used to define operators throughout the library in a concise way.
 * @param init The logic to connect the liftedSource to the subscriber at the moment of subscription.
 */
export function operate<T, R>(
  init: (liftedSource: Rx<T>, tapper: Tapper<R>) => (() => void) | void
): OperatorFunction<T, R> {
  return (source: Rx<T>) => {
    if (hasLift(source)) {
      return source.lift(function (this: Tapper<R>, liftedSource: Rx<T>) {
        return init(liftedSource, this);
      });
    }
    throw new TypeError("Unable to lift unknown Rx type");
  };
}
