"use client";

import { createContext, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, translator, type Lang, type T } from "@/lib/i18n";

const LangCtx = createContext<Lang>("en");

/** The patient portal's language (set by its layout from the language cookie). Elsewhere everything is English. */
export function LanguageProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangCtx.Provider value={lang}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

/** `t("English text")` in the current language. */
export function useT(): T {
  const lang = useLang();
  return useMemo(() => translator(lang), [lang]);
}

/** Switches the language for a year on this device and re-renders the page in it. */
export function useSetLang() {
  const router = useRouter();
  return (lang: Lang) => {
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };
}
