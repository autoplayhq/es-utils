import * as z from "zod";

type Names<T> = Extract<keyof T, string>;

// TODO: Try to move this over to being a class
export interface ZodChoice<
  TVariants extends Record<string, any>,
  T = ZodChoiceVariantsToValue<TVariants>
> extends z.ZodType<T> {
  // access T via `z.infer<typeof MyChoice>`
  /**
   * This has no value at runtime. It's only for the benefit of other TypeScript
   * type declarations built around the `ZodChoice` type
   *
   * **Example**
   * ```ts
   * { VariantA: null,
   *   VariantB: { id: string },
   *   VariantC: { id: string } }
   * ```
   */
  _variants: TVariants;
  _container: ZodChoiceContainer<TVariants>;
  create: {
    [P in Names<TVariants>]: (contents: TVariants[P]) => T;
  };
  // isChoice: {
  //   [P in Keys<TVariants>]: (contents: T) => boolean
  // }
  expect: {
    [P in Names<TVariants>]: <R>(
      value: T,
      then: (found: TVariants[P]) => R,
      orElse: (other: T) => R
    ) => R;
  };
  factory: <R>(then: (value: T) => R) => ZodChoiceFactory<TVariants, R>;
  apply: <R>(applyFns: {
    [P in Names<TVariants>]: (contents: TVariants[P]) => R;
  }) => (input: T) => R;
  match: <R>(
    value: T,
    applyFns: {
      [P in Names<TVariants>]: (contents: TVariants[P]) => R;
    }
  ) => R;
  matchPartial: MatchPartialFn<TVariants, T>;
  contain: (value: T) => ZodChoiceContainer<TVariants>;
}

export type inferChoiceContainer<T extends { _container: any }> =
  T["_container"];

/**
 * **Example**
 * ```ts
 * ZodChoiceVariantsToValue<{ A: number, B: string }>
 * is
 * Record<"A", number> | Record<"B", string>
 * ```
 */
export type ZodChoiceVariantsToValue<TVariants> = {
  [P in Names<TVariants>]: Record<P, TVariants[P]>;
}[Names<TVariants>];

type MatchPartialFn<TVariants extends Record<string, any>, T> = <R>(
  matchFns: {
    [P in Names<TVariants>]?: (contents: TVariants[P]) => R;
  },
  otherwise: (contents: T) => R
) => R;

export class ZodChoiceContainer<
  TVariants extends Record<string, any>,
  T = { [P in Names<TVariants>]: TVariants[P] }[Names<TVariants>]
> {
  // @internal
  constructor(
    match: (fns: Record<string, (contents: any) => any>) => any,
    matchPartial: MatchPartialFn<any, any>
  ) {
    this.match = match;
    this.matchPartial = matchPartial;
  }

  // isOrElse: <P extends keyof TVariants, R>(
  //   choiceName: P,
  //   isFn: (contents: TVariants[P]) => R,
  //   otherwise: (contents: { [P in Keys<TVariants>]: TVariants[P] }[Exclude<keyof TVariants, P>]) => R,
  // ) => R
  // expect: {
  //   [P in Keys<TVariants>]: (orElse: (other: T) => TVariants[P]) => TVariants[P]
  // }
  match: <R>(matchFns: {
    [P in Names<TVariants>]: (contents: TVariants[P]) => R;
  }) => R;
  matchPartial: MatchPartialFn<TVariants, T>;
}

export type ZodChoiceFactory<TVariants extends Record<string, any>, R> = {
  [P in Names<TVariants>]: (contents: TVariants[P]) => R;
};

/**
 * enum-ts for zod types
 *
 * Recommendation: Concrete "Choice" types should end in either "Kind", "Choice", or "State"
 * Examples: `ServiceSetupState`, `SetupStepKind`, etc.
 *
 * The more higher-order choice types like `Option` and `Result` may have their own naming conventions.
 */
export function choiceType<T extends Record<string, z.ZodType<any>>>(
  variantNameToZodType: T
): ZodChoice<{ [P in keyof T]: z.infer<T[P]> }> {
  const variantNames = Object.keys(variantNameToZodType);
  const unexpected = `Unexpected variant unmatched. Expected one of ${variantNames
    .map((name) => JSON.stringify(name))
    .join(", ")}`;
  const variantTypesArray: { k: string; t: z.ZodType<any> }[] =
    variantNames.map((key) => ({
      k: key,
      t: variantNameToZodType[key],
    }));
  const create: any = {};
  for (let i = 0; i < variantNames.length; i++) {
    const key = variantNames[i];
    create[key] = (contents: any) => ({ [key]: contents });
  }

  const customZodType = z.custom((input) => {
    if (typeof input !== "object" || input == null) return false;
    for (let i = 0; i < variantTypesArray.length; i++) {
      const { k: key, t: validator } = variantTypesArray[i];
      // check if this key exists, and if so, use it
      if (key in input) {
        return { [key]: validator.parse((input as any)[key], { path: [key] }) };
      }
    }
  });

  const applyPartial = <R>(
    fns: Record<string, (item: any) => R>,
    otherFn: (item: any) => R
  ) => {
    const fnsList: [string, (item: any) => R][] = variantNames
      .filter((key) => fns[key] != null)
      .map((key) => [key, fns[key]]);
    return function choiceApplyFn(item: any): R {
      for (let i = 0; i < fnsList.length; i++) {
        const [key, fn] = fnsList[i];
        if (key in item) {
          return fn(item[key]);
        }
      }
      return otherFn(item);
    };
  };

  const apply = (fns: Record<string, (item: any) => any>) =>
    applyPartial(
      fns,
      (item: any) => console.assert(false, unexpected, item) as never
    );

  const factory = (then: (item: any) => any) =>
    Object.fromEntries(
      variantNames.map((key) => [
        key,
        (contents: any) => {
          const contentsParsed = variantNameToZodType[key].parse(contents);
          return then({ [key]: contentsParsed });
        },
      ])
    );

  Object.assign(customZodType, {
    apply,
    create,
    factory,
    // expect: {
    //   [P in Keys<TVariants>]: <R>(value: T, then: (found: TVariants[P]) => R, orElse: (other: T) => R) => R
    // }
    expect: Object.fromEntries(
      variantNames.map((key) => [
        key,
        (
          value: any,
          thenFn: (found: any) => any,
          orElse: (value: any) => any
        ) => {
          if (key in value) {
            return thenFn(
              variantNameToZodType[key].parse(value[key], {
                path: [key],
              })
            );
          } else {
            return orElse(value);
          }
        },
      ])
    ),
    match(tt: any, fns: any): any {
      if (tt == null) throw new TypeError(`Cannot match undefined as choice`);
      return apply(fns)(tt);
    },
    matchPartial(tt: any, fns: any, otherFn: any): any {
      if (tt == null) throw new TypeError(`Cannot match undefined as choice`);
      return applyPartial(fns, otherFn)(tt);
    },
    contain(tt: any): ZodChoiceContainer<any> {
      if (tt == null) throw new TypeError(`Cannot contain undefined as choice`);
      return new ZodChoiceContainer<any>(
        function match(fns) {
          return apply(fns)(tt);
        },
        function matchPartial(fns, otherFn) {
          // We hide the complexity of these types so the rest of our users have a good time.
          // @ts-ignore because TypeScript is just in the way sometimes...
          return applyPartial(fns, otherFn)(tt);
        }
      );
    },
  });

  // @ts-ignore
  return customZodType;
}
