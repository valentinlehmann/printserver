import { de } from "@/messages/de";

/**
 * Single-language message accessor. The app ships German only, so `t` is just
 * the German dictionary. Components read e.g. `t.print.title`.
 *
 * TODO(i18n): if a second language is ever needed, swap this for a locale-aware
 * lookup and introduce a real i18n runtime.
 */
export const t = de;
