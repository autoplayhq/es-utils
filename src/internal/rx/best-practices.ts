import type { DevString } from "../DevString";
import type { Disposable, DisposableLike, TeardownLogic } from "./Disposable";
import type { Outcome, Tapper as Tapper } from "./types";
import { isFunction } from "./utils/isFunction";
import { pipeFromArray } from "../pipe";

export class BestPracticeError<
  Path extends string,
  M extends string,
  T
> extends Error {}
export class TSErrors<T> extends Error {}

const RxViewValid = Symbol("viewvalue");
const RxType = Symbol("rxvalue");
export interface ViewRx<T> extends Rx<T> {
  /** This comes through a call through {@link RxForView.forView} */
  [RxViewValid]: true;
}

export interface UnaryFunction<T, R> {
  (source: T): R;
}

export interface Tapable<T> {
  /** Returns an individually disposable tool */
  tap: Tap<T>;
}

export interface Tap<T> {
  /** Returns an individually disposable tool */
  (parent: Disposable, tapper: Tapper<T>): DisposableLike;
}

export interface Source<T> {
  /** Return teardown logic */
  (tapper: Tapper<T>): TeardownLogic;
}

/***
 * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
 */
export interface Operator<T, R> {
  call(tapper: Tapper<R>, source: any): TeardownLogic;
}

export interface OperatorFunction<T, R> extends UnaryFunction<Rx<T>, Rx<R>> {}

const EMPTY: DisposableLike = Object.freeze({ dispose() {} });

export class Rx<T> implements Tapable<T> {
  [RxType]: T = undefined!;
  /**
   * @internal Internal implementation detail, do not use directly. Will be made internal in v8.
   */
  source: Rx<any> | undefined;
  /**
   * @internal Internal implementation detail, do not use directly. Will be made internal in v8.
   */
  operator: Operator<any, T> | undefined;

  /**
   * @constructor
   * @param {Function} subscribe the function that is called when the Observable is
   * initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or
   * `complete` can be called to notify of a successful completion.
   */
  constructor(source?: (this: Rx<T>, tapper: Tapper<T>) => TeardownLogic) {
    if (source) {
      this._tap = source;
    }
  }

  /**
   * Creates a new Observable, with this Observable instance as the source, and the passed
   * operator defined as the new observable's operator.
   * @method lift
   * @param operator the operator defining the operation to take on the observable
   * @return a new observable with the Operator applied
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   * If you have implemented an operator using `lift`, it is recommended that you create an
   * operator by simply returning `new Observable()` directly. See "Creating new operators from
   * scratch" section here: https://rxjs.dev/guide/operators
   */
  lift<R>(operator?: Operator<T, R>): Rx<R> {
    const rx = new Rx<R>();
    rx.source = this;
    rx.operator = operator;
    return rx;
  }

  tap(disposable: Disposable, tapper: Tapper<T>): DisposableLike {
    const untap = this._tap?.(tapper);
    const like =
      untap == null ? EMPTY : isFunction(untap) ? { dispose: untap } : untap;
    disposable.add(like);
    return like;
  }

  /** @internal */
  protected _tap(tapper: Tapper<any>): TeardownLogic {
    return this.source?._tap(tapper);
  }

  pipe(): Rx<T>;
  pipe<A>(op1: OperatorFunction<T, A>): Rx<A>;
  pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Rx<B>;
  pipe<A, B, C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Rx<C>;
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): Rx<D>;
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Rx<E>;
  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
  ): Rx<F>;
  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
  ): Rx<G>;
  pipe<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>
  ): Rx<H>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
  ): Rx<I>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): Rx<unknown>;
  pipe(...ops: OperatorFunction<any, any>[]): Rx<any> {
    return pipeFromArray(ops)(this);
  }
}

export interface RxForView<T> extends Rx<T> {
  forView: ForView<T>;
}

export type ForView<T> = _ForViewCheck<ForViewOk<T>, _ForView<T, "">>;

type ForViewOk<T> = (this: Rx<T>) => ViewRx<T>;
type ForViewCheck<
  T,
  Path extends string,
  Expect,
  Message extends string
> = T extends Expect ? never : BestPracticeError<Path, Message, T>;

type _ForViewCheck<T, E> = [E] extends [never] ? T : TSErrors<E>;

type IsAny<T> = [any extends T ? never : 0] extends [never] ? true : false;
type A = IsAny<string>;
type A2 = IsAny<any>;
type A3 = IsAny<never>;

type _ForView<T, Path extends string> =
  // any
  [any extends T ? never : true] extends [never]
    ? BestPracticeError<Path, "any is forbidden", T>
    : // fn
    T extends (...args: any) => any
    ?
        | ForViewCheck<
            T,
            Path,
            ((...args: any) => undefined | void) | ((...args: any) => Outcome),
            `functions may not return, or may return Outcome`
          >
        | ForViewCheck<
            T,
            Path,
            ((noarg: void) => any) | ((reason: DevString) => any),
            `functions may only take no args or an optional DevString`
          >
    : // nested
    T extends { [RxType]: infer _ }
    ? ForViewCheck<
        T,
        Path,
        { [RxViewValid]: true },
        `reactive values must themselves be view values`
      >
    : //
    // array
    T extends (infer R)[]
    ? _ForView<R, `${Path}[number]`>
    : T extends Record<string, any>
    ? {
        [P in Extract<keyof T, string | number>]: _ForView<
          T[P],
          `${Path}.${P}`
        >;
      }[Extract<keyof T, string | number>]
    : // primitives
      ForViewCheck<T, Path, number | string, "Expected simple data">;

declare function checkForView<T>(value: T): RxForView<T>;
