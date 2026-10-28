// Translation for the patient portal (English and Tamil). Text is written in English in the code and wrapped in
// t("..."); locales/ta.json maps each English text to Tamil. Anything without a translation shows in English, so a
// missing entry never breaks a page. The same lookup translates fixed phrases the backend sends (claim statuses, steps).
import ta from "@/locales/ta.json";

export type Lang = "en" | "ta";

/** Cookie that remembers the patient's language, so server-rendered pages come out in it too. */
export const LANG_COOKIE = "insurecare-lang";

export const parseLang = (value?: string | null): Lang => (value === "ta" ? "ta" : "en");

/** Translates English text; `{name}` placeholders are filled from `vars`. */
export type T = (text: string, vars?: Record<string, string | number>) => string;

type Template = { pattern: RegExp; names: string[]; translation: string };

/**
 * Entries with placeholders also match text that arrives already filled in, e.g. "Approved amount: ₹43,200." from the
 * backend matches "Approved amount: {amount}.". The captured values are themselves translated when they can be.
 */
function templatesOf(dictionary: Record<string, string>): Template[] {
  return Object.entries(dictionary).filter(([english]) => english.includes("{")).map(([english, translation]) => {
    const names: string[] = [];
    const source = english.split(/(\{\w+\})/).map((part) => {
      const name = part.match(/^\{(\w+)\}$/)?.[1];
      if (name) { names.push(name); return "(.+?)"; }
      return part.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
    }).join("");
    return { pattern: new RegExp(`^${source}$`, "s"), names, translation };
  });
}

const DICTIONARIES: Record<Lang, { exact: Record<string, string>; templates: Template[] }> = {
  en: { exact: {}, templates: [] },
  ta: { exact: ta, templates: templatesOf(ta) },
};

const fill = (text: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((out, [k, v]) => out.replaceAll(`{${k}}`, String(v)), text);

export function translator(lang: Lang): T {
  const { exact, templates } = DICTIONARIES[lang];
  const t: T = (text, vars) => {
    const known = exact[text];
    if (known !== undefined) return vars ? fill(known, vars) : known;
    if (!vars) {
      for (const { pattern, names, translation } of templates) {
        const m = text.match(pattern);
        if (m) return fill(translation, Object.fromEntries(names.map((n, i) => [n, t(m[i + 1]!)])));
      }
    }
    return vars ? fill(text, vars) : text;
  };
  return t;
}
