import DOMPurify, { Config } from "dompurify";

const DEFAULT_ALLOWED_TAGS = [
  "b",
  "i",
  "em",
  "strong",
  "u",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "span",
  "div",
  "a",
];
const DEFAULT_ALLOWED_ATTR = ["href", "title", "target", "rel", "class"];

const baseConfig: Config = {
  ALLOWED_TAGS: DEFAULT_ALLOWED_TAGS,
  ALLOWED_ATTR: DEFAULT_ALLOWED_ATTR,
  FORBID_TAGS: ["style", "script", "iframe", "object", "embed"],
};

export function sanitizeHtml(dirty: string, config: Config = {}): string {
  if (!dirty) return "";
  const merged: Config = { ...baseConfig, ...config };
  let clean = DOMPurify.sanitize(dirty, merged);

  // Enforce rel safety on anchors.
  clean = clean.replace(/<a\b([^>]*)>/gi, (_m: string, attrs: string) => {
    let a = attrs;
    if (!/rel=/i.test(a)) {
      a += ' rel="noopener noreferrer"';
    } else {
      a = a.replace(/rel="([^"]*)"/i, (_relm: string, relVal: string) => {
        const parts = relVal.split(/\s+/);
        if (!parts.includes("noopener")) parts.push("noopener");
        if (!parts.includes("noreferrer")) parts.push("noreferrer");
        return 'rel="' + parts.join(" ") + '"';
      });
    }
    return "<a" + a + ">";
  });

  return clean;
}

export default sanitizeHtml;
