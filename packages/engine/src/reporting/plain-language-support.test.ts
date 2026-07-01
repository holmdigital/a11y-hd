import { describe, it, expect } from 'vitest';
import {
    PLAIN_LANGUAGE_CORE_RULES,
    isPlainLanguageSupported,
    getPlainLanguageSupportedLanguages,
} from './plain-language-support';

describe('plain-language support gate', () => {
    it('supports Swedish (full core coverage)', () => {
        expect(isPlainLanguageSupported('sv')).toBe(true);
    });

    it('supports English and its regional variants', () => {
        for (const lang of ['en', 'en-GB', 'en-US', 'en-CA', 'en-au']) {
            expect(isPlainLanguageSupported(lang)).toBe(true);
        }
    });

    it('blocks languages without native core coverage', () => {
        for (const lang of ['de', 'fr', 'es', 'nl', 'no', 'fi', 'da']) {
            expect(isPlainLanguageSupported(lang)).toBe(false);
        }
    });

    it('lists exactly the languages that clear the bar today', () => {
        const supported = getPlainLanguageSupportedLanguages();
        expect(supported).toContain('sv');
        expect(supported).toContain('en');
        expect(supported).not.toContain('de');
        expect(supported).not.toContain('fr');
    });

    it('treats the core rule set as the bar', () => {
        // Guards against an accidental empty or truncated core list, which would
        // silently make every language "supported".
        expect(PLAIN_LANGUAGE_CORE_RULES.length).toBeGreaterThanOrEqual(10);
        expect(PLAIN_LANGUAGE_CORE_RULES).toContain('color-contrast');
    });
});
