import type { z } from ".";
import { identity, invariantThrow } from "../invariant";

/** Used with our (Autoplay) custom ZodChoice */

export function invariantChoiceIs<
  TVariants extends Record<string, any>,
  VariantName extends Extract<keyof TVariants, string>,
>(choice: z.ZodChoiceContainer<TVariants>, key: VariantName, name = "choice"): TVariants[VariantName] {
  return choice.matchPartial({ [key]: identity } as Partial<any>, (other) => {
    invariantThrow(`Expected ${name} to be "${key}"`, other);
  });
}
