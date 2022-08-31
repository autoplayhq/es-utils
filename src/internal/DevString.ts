import { devStringify } from "./devStringify";

/**
 * Future: maybe replaceable during build to create smaller packages.
 *
 * Substitutions are not computed until you call toString()
 *
 * {@link DevString}
 */
export function dev(tmpl: TemplateStringsArray, ...substitutions: any[]): DevString {
  return new DevString(tmpl, substitutions);
}

export class DevString {
  constructor(
    public readonly _templateOrID: TemplateStringsArray | number,
    public readonly _subs: any[],
    public _values: undefined | { cause?: DevString | DevString[]; records?: Record<string, unknown> } = undefined,
  ) {}

  /** for double clicking in  */
  get _json(): unknown {
    return this.toJSON();
  }

  get _display(): unknown {
    return this.toDisplay();
  }

  /**
   * @example
   * dev`login failure`.because(reason)
   * dev`failed token exchange with ${issuerURL}`.because(reason)
   * dev`Continue button to show`.because(reason)
   */
  because(cause: DevString): DevString {
    return new DevString(this._templateOrID, this._subs, {
      ...this._values,
      cause: add(this._values?.cause, cause),
    });
  }

  record(key: string, value: unknown): DevString {
    return new DevString(this._templateOrID, this._subs, {
      ...this._values,
      records: {
        ...this._values?.records,
        [key]: value,
      },
    });
  }

  // Notice that `"" + {toString() { return 1}} === "1"`
  toDisplay() {
    const stringSubs = this._subs.map((sub) => devStringify(sub, false));
    return typeof this._templateOrID === "number"
      ? `#${this._templateOrID}: ${stringSubs.join("; ")}` // if dev calls are replaced with message identifiers (this is speculative)
      : String.raw(this._templateOrID as TemplateStringsArray, stringSubs);
  }

  // Notice that `"" + {toString() { return 1}} === "1"`
  toString() {
    const stringSubs = this._subs.map((sub) => devStringify(sub));
    return typeof this._templateOrID === "number"
      ? `#${this._templateOrID}: ${stringSubs.join("; ")}` // if dev calls are replaced with message identifiers (this is speculative)
      : String.raw(this._templateOrID as TemplateStringsArray, stringSubs);
  }

  toJSON(key?: string) {
    return typeof this._templateOrID === "number"
      ? this._values == null
        ? [this._templateOrID, ...this._subs]
        : [this._templateOrID, ...this._subs, this._values]
      : this._templateOrID.flatMap((part, idx) =>
          idx < this._subs.length
            ? [part, this._subs[idx]]
            : this._values == null
            ? part
              ? [part]
              : []
            : [part, this._values],
        );
  }
}

function add<T>(arr: undefined | T | T[], ...values: T[]): undefined | T | T[] {
  if (values.length === 0) return arr;
  if (Array.isArray(values[0])) {
    // @ts-ignore assume that because T is array, that we default create arrays before
    return arr && arr.length ? [...arr, ...values] : values;
  }
  if (values.length === 1) {
    return arr == null ? values[0] : Array.isArray(arr) ? [...arr, values[0]] : [arr, values[0]];
  }
  if (arr == null) return values;
  return Array.isArray(arr) ? [...arr, ...values] : [arr, ...values];
}
