import { devStringify } from "./devStringify";

/**
 * Future: maybe replaceable during build to create smaller packages.
 *
 * Substitutions are not computed until you call toString()
 *
 * {@link DevString}
 */
export function dev(
  tmpl: TemplateStringsArray,
  ...substitutions: any[]
): DevString {
  return new DevString(tmpl, substitutions);
}

export class DevString {
  constructor(
    public readonly templateOrID: TemplateStringsArray | number,
    public readonly subs: any[]
  ) {}

  // Notice that `"" + {toString() { return 1}} === "1"`
  toString() {
    const stringSubs = this.subs.map((sub) => devStringify(sub));
    return typeof this.templateOrID === "number"
      ? `#${this.templateOrID}: ${stringSubs.join("; ")}` // if dev calls are replaced with message identifiers (this is speculative)
      : String.raw(this.templateOrID as TemplateStringsArray, stringSubs);
  }
}
