import type { Disposable } from "./Disposable";
import type { Rx } from "./best-practices";

/** For `any`s that aren't meant to stay `any`*/
export type $FixMe = any;
/** For `any`s that we don't care about */
export type $IntentionalAny = any;

export type VoidFn = () => void;

export type Tapper<T> = (value: T) => void;

/**
 * Required for UI to be able to react to whether something happened
 * synchronously or not
 */
export enum Outcome {
  Handled = 1,
  Passthrough = 0,
}

/**
 * Note: This will add Symbol.observable globally for all TypeScript users,
 * however, we are no longer polyfilling Symbol.observable
 */
declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

/** OPERATOR INTERFACES */

export interface UnaryFunction<T, R> {
  (source: T): R;
}

export interface OperatorFunction<T, R> extends UnaryFunction<Rx<T>, Rx<R>> {}

export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {}

/** SUBSCRIPTION INTERFACES */

export interface Unsubscribable {
  unsubscribe(): void;
}

export type TeardownLogic = Disposable | Unsubscribable | (() => void) | void;

/**
 * A simple type to represent a gamut of "falsy" values... with a notable exception:
 * `NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
 * comments here: https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417
 */
export type Falsy = null | undefined | false | 0 | -0 | 0n | "";

export type TruthyTypesOf<T> = T extends Falsy ? never : T;
