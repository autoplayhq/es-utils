/** Strings you're willing to send to the user with minor formatting capabilities. */
export class UsrString {
  constructor(public readonly _marks: UsrMarkKind[], public readonly _children: UsrStringChild[]) {}
  toString(): string {
    return this.toPlainText();
  }
  toMarkdown(): string {
    return this._flattenedMd().join("");
  }
  toPlainText(): string {
    let disp = this._children.map((c) => c.toString()).filter(Boolean);
    for (const m of this._marks) {
      if (typeof m === "object") {
        disp = [...disp, " (", m.link, ")"];
      }
    }
    return disp.join("");
  }
  toJSON(key?: unknown): unknown {
    return this._flattenedMd()
  }
  private _flattenedMd(): (string | number)[] {
    let disp = this._children.flatMap((c) => c instanceof UsrString ? c._flattenedMd() : [c]).filter(Boolean);
    for (const m of this._marks) {
      if (m === "bold") disp = ["**", ...disp, "**"];
      else if (m === "em") disp = ["*", ...disp, "*"];
      else disp = ["[", ...disp, "](", m.link, ")"];
    }
    return disp;
  }
}

const text = _usr.bind(null, []);
export const usr: UsrConstructor = Object.assign(text, {
  text,
  em: _usr.bind(null, ["em"]),
  bold: _usr.bind(null, ["bold"]),
  link: (displayText: UsrStringChild, href: string) => _usr([{ link: href.toString() }], displayText),
});

type UsrMarkKind =
  | "bold"
  | "em"
  | {
      link: string;
    };
type UsrStringChild = string | number | UsrString;
function _usr(
  _marks: UsrMarkKind[],
  template: TemplateStringsArray | UsrStringChild,
  ...elements: UsrStringChild[]
): UsrString {
  return new UsrString(
    _marks,
    Array.isArray(template) ? template.flatMap((a, i) => (i < elements.length ? [a, elements[i]] : [a])) : [template],
  );
}
interface UsrFn {
  (child: UsrStringChild): UsrString;
  (template: TemplateStringsArray, ...elements: UsrStringChild[]): UsrString;
}
interface UsrConstructor extends UsrFn {
  text: UsrFn;
  em: UsrFn;
  bold: UsrFn;
  link(displayText: UsrStringChild, href: string | URL): UsrString
}
