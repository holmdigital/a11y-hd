
import { describe, it, expect } from 'vitest';
import { generateBadgeUrl, generateBadgeMarkdown, isBadgeWithheldByRobustness } from './badge-generator';

describe('Badge Generator', () => {
    it('should generate correct URL for score 100', () => {
        const url = generateBadgeUrl(100);
        expect(url).toBe('https://img.shields.io/badge/HolmDigital_Engine-100%25-00703C?style=flat-square');
    });

    it('should return null for score < 100', () => {
        const url = generateBadgeUrl(99);
        expect(url).toBeNull();
    });

    it('should generate correct markdown for score 100', () => {
        const markdown = generateBadgeMarkdown(100);
        expect(markdown).toBe('![Accessibility Status: 100% Compliant](https://img.shields.io/badge/HolmDigital_Engine-100%25-00703C?style=flat-square)');
    });

    it('should return null markdown for score < 100', () => {
        const markdown = generateBadgeMarkdown(90);
        expect(markdown).toBeNull();
    });
});

/**
 * Badgen är en delbar utmärkelse, inte en juridisk bedömning. En sida som är tom
 * utan JavaScript kan mycket väl vara WCAG-konform, och ska då fortsatt visa
 * 100/100 och PASS. Men vi delar inte ut en badge att skryta med till en sida som
 * en användare på dåligt nät aldrig ser.
 */
describe('isBadgeWithheldByRobustness', () => {
    it('håller inne badgen när sidan är tom utan JavaScript', () => {
        expect(isBadgeWithheldByRobustness({ verdict: 'empty' })).toBe(true);
    });

    it('ger badgen vid partial: kärninnehåll finns, sidan går att läsa', () => {
        expect(isBadgeWithheldByRobustness({ verdict: 'partial' })).toBe(false);
    });

    it('ger badgen vid ok', () => {
        expect(isBadgeWithheldByRobustness({ verdict: 'ok' })).toBe(false);
    });

    it('ger badgen vid unknown: en misslyckad mätning får inte straffa någon', () => {
        expect(isBadgeWithheldByRobustness({ verdict: 'unknown' })).toBe(false);
    });

    it('ger badgen när --noscript-check inte kördes alls', () => {
        expect(isBadgeWithheldByRobustness(undefined)).toBe(false);
        expect(isBadgeWithheldByRobustness(null)).toBe(false);
    });

    it('rör aldrig scoren: badgens markdown för 100 finns kvar oberoende av verdict', () => {
        // Regressionsvakt. Tystningen sker i CLI:n, generateBadgeMarkdown är ren
        // och får aldrig börja ta hänsyn till robusthet eller sänka något.
        expect(generateBadgeMarkdown(100)).not.toBeNull();
    });
});
