/** Strings you're willing to send to the user with minor formatting capabilities. */
export class UsrString {
  constructor(public readonly marks: UsrMarkKind[], public readonly children: UsrStringChild[]) {}
  toString(): string {
    return this.toPlainText();
  }
  toMarkdown(): string {
    return this._flattenedMd().join("");
  }
  toPlainText(): string {
    let disp = this.children.map((c) => c.toString()).filter(Boolean);
    for (const m of this.marks) {
      if (m.type === "link") {
        disp = [...disp, " (", m.link.href, ")"];
      }
    }
    return disp.join("");
  }
  toJSON(key?: unknown): unknown {
    return this._flattenedMd();
  }
  private _flattenedMd(): (string | number)[] {
    let disp = this.children.flatMap((c) => (c instanceof UsrString ? c._flattenedMd() : [c])).filter(Boolean);
    for (const m of this.marks) {
      if (m.type === "bold") disp = ["**", ...disp, "**"];
      else if (m.type === "em") disp = ["*", ...disp, "*"];
      else disp = ["[", ...disp, "](", m.link.href, ")"];
    }
    return disp;
  }
}

const text = _usr.bind(null, []);
export const usr: UsrConstructor = Object.assign(text, {
  text,
  em: _usr.bind(null, [{ type: "em" }]),
  bold: _usr.bind(null, [{ type: "bold" }]),
  link: (displayText: UsrStringChild, href: string | URL) =>
    _usr([{ type: "link", link: { href: href.toString() } }], displayText),
});

type UsrMarkKind =
  | { type: "bold" }
  | { type: "em" }
  | {
      type: "link";
      link: {
        href: string;
      };
    };

type UsrStringChild = string | number | UsrString;
function _usr(
  marks: UsrMarkKind[],
  template: TemplateStringsArray | UsrStringChild,
  ...elements: UsrStringChild[]
): UsrString {
  return new UsrString(
    marks,
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
  link(displayText: UsrStringChild, href: string | URL): UsrString;
}
