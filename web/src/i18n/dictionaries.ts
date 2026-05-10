import en from "../../messages/en.json";
import zh from "../../messages/zh.json";
import es from "../../messages/es.json";

export const locales = ["en", "zh", "es"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
};

const dictionaries = { en, zh, es } as const;

// English is the canonical schema; ZH/ES must mirror its keys.
export type Dict = typeof en;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDict(locale: string): Dict {
  const key: Locale = isLocale(locale) ? locale : defaultLocale;
  return dictionaries[key] as Dict;
}
