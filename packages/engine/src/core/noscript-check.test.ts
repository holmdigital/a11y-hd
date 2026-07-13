import { describe, it, expect } from 'vitest';
import {
    evaluateNoScriptCoverage,
    NOSCRIPT_EMPTY_THRESHOLD,
    NOSCRIPT_PARTIAL_THRESHOLD
} from './noscript-check';

/**
 * Tröskelvärdena testas mot den rena funktionen, inte via en riktig webbläsare.
 * Webbläsarmekaniken (JS av under laddning, på igen före mätning) är verifierad
 * separat, se noscript-check.ts. Här bevakar vi bedömningslogiken.
 */
describe('evaluateNoScriptCoverage — de tre scenarierna', () => {
    it('helt tom utan JS: klientrenderat SPA ger verdict "empty"', () => {
        // 0 tecken utan JS, 4200 med. Ett klientrenderat SPA: tomt skal tills skripten kört.
        const r = evaluateNoScriptCoverage(0, 4200);

        expect(r.verdict).toBe('empty');
        expect(r.coverageRatio).toBe(0);
        expect(r.hasContentWithoutJs).toBe(false);
        expect(r.textLengthWithoutJs).toBe(0);
        expect(r.textLengthWithJs).toBe(4200);
    });

    it('delvis renderad utan JS: hälften av innehållet saknas ger verdict "partial"', () => {
        // 30 % täckning: skalet finns serverrenderat, huvudinnehållet är klientrenderat.
        const r = evaluateNoScriptCoverage(1260, 4200);

        expect(r.verdict).toBe('partial');
        expect(r.coverageRatio).toBeCloseTo(0.3, 5);
        expect(r.hasContentWithoutJs).toBe(true);
    });

    it('fullt statisk sida: full täckning ger verdict "ok" och inget fynd', () => {
        // Serverrenderad sida: identisk textmängd med och utan JS.
        const r = evaluateNoScriptCoverage(4200, 4200);

        expect(r.verdict).toBe('ok');
        expect(r.coverageRatio).toBe(1);
        expect(r.hasContentWithoutJs).toBe(true);
    });
});

describe('evaluateNoScriptCoverage — tröskelvärden', () => {
    it('exakt på empty-tröskeln (5 %) räknas som partial, inte empty', () => {
        const r = evaluateNoScriptCoverage(NOSCRIPT_EMPTY_THRESHOLD * 1000, 1000);
        expect(r.coverageRatio).toBe(NOSCRIPT_EMPTY_THRESHOLD);
        expect(r.verdict).toBe('partial');
    });

    it('strax under empty-tröskeln räknas som empty', () => {
        // 4,9 %: bara en cookie-banner eller ett "aktivera JavaScript"-meddelande.
        const r = evaluateNoScriptCoverage(49, 1000);
        expect(r.verdict).toBe('empty');
        expect(r.hasContentWithoutJs).toBe(false);
    });

    it('exakt på partial-tröskeln (50 %) räknas som ok', () => {
        const r = evaluateNoScriptCoverage(NOSCRIPT_PARTIAL_THRESHOLD * 1000, 1000);
        expect(r.coverageRatio).toBe(NOSCRIPT_PARTIAL_THRESHOLD);
        expect(r.verdict).toBe('ok');
    });

    it('strax under partial-tröskeln räknas som partial', () => {
        const r = evaluateNoScriptCoverage(499, 1000);
        expect(r.verdict).toBe('partial');
    });
});

describe('evaluateNoScriptCoverage — kantfall', () => {
    it('tom sida även MED JS ger "unknown", inte "empty" (vi larmar inte i blindo)', () => {
        const r = evaluateNoScriptCoverage(0, 0);
        expect(r.verdict).toBe('unknown');
        expect(r.coverageRatio).toBe(0);
    });

    it('mer text utan JS än med (t.ex. noscript-block som JS tar bort) klampas till 100 %', () => {
        const r = evaluateNoScriptCoverage(1500, 1000);
        expect(r.coverageRatio).toBe(1);
        expect(r.verdict).toBe('ok');
    });

    it('negativa värden normaliseras till 0 i stället för att ge nonsens', () => {
        const r = evaluateNoScriptCoverage(-50, 1000);
        expect(r.textLengthWithoutJs).toBe(0);
        expect(r.verdict).toBe('empty');
    });

    it('bär vidare hasNoScriptFallback', () => {
        expect(evaluateNoScriptCoverage(0, 1000, true).hasNoScriptFallback).toBe(true);
        expect(evaluateNoScriptCoverage(0, 1000, false).hasNoScriptFallback).toBe(false);
    });
});

/**
 * Detta är kravet från Juno och det viktigaste i hela filen.
 * Inget WCAG-framgångskriterium kräver att en sida fungerar utan JavaScript.
 * Om vi någonsin rapporterar detta som en WCAG-överträdelse ljuger vi om lagen.
 */
describe('robusthetsfynd är ALDRIG ett WCAG-fel', () => {
    const alla = [
        evaluateNoScriptCoverage(0, 4200),      // empty
        evaluateNoScriptCoverage(1260, 4200),   // partial
        evaluateNoScriptCoverage(4200, 4200),   // ok
        evaluateNoScriptCoverage(0, 0)          // unknown
    ];

    it('isWcagViolation är false i samtliga utfall', () => {
        alla.forEach(r => expect(r.isWcagViolation).toBe(false));
    });

    it('affectsScore är false i samtliga utfall', () => {
        alla.forEach(r => expect(r.affectsScore).toBe(false));
    });
});
