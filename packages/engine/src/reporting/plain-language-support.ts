import { getAllConvergenceRules } from '@holmdigital/standards';

/**
 * Core high-frequency rules that decide whether a language's plain-language
 * (klarspråk) report is presentable.
 *
 * These are the rules that actually surface on typical real-world sites. A
 * language that lacks a localized headline for them produces a report that is
 * mostly English (via the standards EN-fallback) under a non-English flag, which
 * is exactly what the klarspråk gate exists to prevent. A language that HAS them
 * renders the common findings natively; the rarer tail of rules may still fall
 * back, the same way Swedish does today.
 *
 * Derived from the live data set 2026-06-30: sv and en both cover all 11; every
 * other locale covers only target-size (1/11).
 */
export const PLAIN_LANGUAGE_CORE_RULES: readonly string[] = [
    'color-contrast',
    'keyboard-accessible',
    'alt-text',
    'form-labels',
    'link-purpose',
    'language-of-page',
    'name-role-value',
    'landmark-one-main',
    'heading-order',
    'region',
    'target-size',
];

/**
 * Candidate (non-English) languages we ship rule data for. English variants are
 * handled separately because English klarspråk is always real, see
 * isPlainLanguageSupported. Kept in sync with the locales in standards getData().
 */
const CANDIDATE_LANGS: readonly string[] = [
    'en', 'sv', 'de', 'fr', 'es', 'nl', 'no', 'fi', 'da',
];

/** True for en, en-GB, en-US, en-CA, en-AU and any other English variant. */
function isEnglish(lang: string): boolean {
    return /^en(-|$)/i.test(lang.trim());
}

/**
 * Whether `--plain` output may be offered in this language.
 *
 * English (and its regional variants) is always supported: English klarspråk is
 * genuine, not a silent fallback. Any other language is supported only once it
 * has its own headline for every core rule, so we never serve an English report
 * under, say, a German flag. Computed from the data so it updates itself as
 * locales are filled in.
 */
export function isPlainLanguageSupported(lang: string): boolean {
    if (isEnglish(lang)) return true;
    const byId = new Map(getAllConvergenceRules(lang).map((r) => [r.ruleId, r]));
    return PLAIN_LANGUAGE_CORE_RULES.every((id) => Boolean(byId.get(id)?.plainLanguage?.headline));
}

/**
 * Canonical base languages that currently clear the klarspråk bar, for use in
 * CLI hints ("Supported languages: ..."). English variants are represented by
 * the single entry `en`.
 */
export function getPlainLanguageSupportedLanguages(): string[] {
    return CANDIDATE_LANGS.filter((lang) => isPlainLanguageSupported(lang));
}

/**
 * English display name for a locale code, used in the plain-report fallback
 * notice ("not yet available in German ...") so the message reads naturally
 * instead of showing a bare locale code. Unknown codes fall back to the code.
 */
const LANG_DISPLAY_NAME: Record<string, string> = {
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    nl: 'Dutch',
    no: 'Norwegian',
    nb: 'Norwegian',
    fi: 'Finnish',
    da: 'Danish',
    dk: 'Danish',
};

export function languageDisplayName(code: string): string {
    return LANG_DISPLAY_NAME[code.toLowerCase()] ?? code;
}
