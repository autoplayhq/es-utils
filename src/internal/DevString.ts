import { DevError } from "./DevError";
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
    public _values:
      | undefined
      | { cause?: DevString | DevString[] | undefined; records?: Record<string, unknown> } = undefined,
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
  because(cause: DevString): DevString;
  because(tmpl: TemplateStringsArray, ...substitutions: any[]): DevString;
  because(cause: DevString | TemplateStringsArray, ...substitutions: any[]): DevString {
    return new DevString(this._templateOrID, this._subs, {
      ...this._values,
      cause: add(this._values?.cause, cause instanceof DevString ? cause : new DevString(cause, substitutions)),
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

  asError(): DevError {
    const err = new DevError(this._templateDisplay());
    if (this._values) {
      err.cause = this._values.cause
      err.records = this._values.records
    }
    return err
  }

  private _templateDisplay(): string {
    const stringSubs = this._subs.map((sub) => devStringify(sub, true));
    return typeof this._templateOrID === "number"
    ? `#${this._templateOrID}: ${stringSubs.join("; ")}` // if dev calls are replaced with message identifiers (this is speculative)
    : String.raw(this._templateOrID as TemplateStringsArray, ...stringSubs);
  }

  // Notice that `"" + {toString() { return 1}} === "1"`
  toDisplay() {
    let display = this._templateDisplay()
    if (this._values) {
      if (this._values.cause) {
        display += "\n  because: " + devStringify(this._values.cause);
      }
      if (this._values.records) {
        display += "\n  records: " + devStringify(this._values.records);
      }
    }
    return display;
  }

  // Notice that `"" + {toString() { return 1}} === "1"`
  toString() {
    return this.toDisplay();
  }

  toJSON() {
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
