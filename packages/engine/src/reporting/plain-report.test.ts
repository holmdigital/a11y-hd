import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderPlainReport } from './plain-report';
import { ScanResult, getEngineVersion } from '../core/regulatory-scanner';
import { setLanguage } from '../i18n';
import axeCore from 'axe-core';

/**
 * D-10.4 renderer structure tests.
 *
 * These four tests verify: sort order, badge mapping, fallback (no plainLanguage),
 * and empty-state handling.
 *
 * Tests were written in TDD RED state before plain-report.ts existed.
 */

const BASE_RESULT: ScanResult = {
    url: 'https://example.com',
    timestamp: '2026-02-08T01:51:29Z',
    metadata: {
        engineVersion: getEngineVersion(),
        axeCoreVersion: axeCore.version,
        standardsVersion: '1.2.2',
        scanDuration: 1500,
        pageTitle: 'Example',
        pageLanguage: 'en',
    },
    reports: [],
    stats: {
        passed: 42,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
    },
    score: 100,
    complianceStatus: 'PASS',
};

/** Helper: capture all console.log calls as a single joined string */
function captureConsoleLog(fn: () => void): string {
    const lines: string[] = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
        lines.push(args.join(' '));
    });
    try {
        fn();
    } finally {
        spy.mockRestore();
    }
    return lines.join('\n');
}

describe('renderPlainReport (D-10.4)', () => {
    beforeEach(() => {
        // Use English so badge/chrome assertions are language-deterministic
        setLanguage('en');
    });

    afterEach(() => {
        setLanguage('en');
    });

    it('sorts reports by business impact: stoppar-kop first, putsning last', () => {
        const result: ScanResult = {
            ...BASE_RESULT,
            reports: [
                {
                    ruleId: 'heading-order',
                    holmdigitalInsight: { diggRisk: 'low', eaaImpact: 'low', reasoning: '' },
                    remediation: { description: 'Fix heading order', technicalGuidance: '' },
                    testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
                    plainLanguage: {
                        headline: 'Putsning headline',
                        whatHappens: 'Putsning what',
                        whoIsAffected: 'Putsning who',
                        businessImpact: 'Putsning cost',
                        howToFix: 'Putsning fix',
                        impactLevel: 'putsning',
                    },
                } as unknown as ScanResult['reports'][number],
                {
                    ruleId: 'form-labels',
                    holmdigitalInsight: { diggRisk: 'critical', eaaImpact: 'high', reasoning: '' },
                    remediation: { description: 'Fix form labels', technicalGuidance: '' },
                    testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
                    plainLanguage: {
                        headline: 'Stoppar headline',
                        whatHappens: 'Stoppar what',
                        whoIsAffected: 'Stoppar who',
                        businessImpact: 'Stoppar cost',
                        howToFix: 'Stoppar fix',
                        impactLevel: 'stoppar-kop',
                    },
                } as unknown as ScanResult['reports'][number],
                {
                    ruleId: 'color-contrast',
                    holmdigitalInsight: { diggRisk: 'medium', eaaImpact: 'medium', reasoning: '' },
                    remediation: { description: 'Fix contrast', technicalGuidance: '' },
                    testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
                    plainLanguage: {
                        headline: 'Forsamrar headline',
                        whatHappens: 'Forsamrar what',
                        whoIsAffected: 'Forsamrar who',
                        businessImpact: 'Forsamrar cost',
                        howToFix: 'Forsamrar fix',
                        impactLevel: 'forsamrar',
                    },
                } as unknown as ScanResult['reports'][number],
            ],
            stats: { passed: 0, critical: 1, high: 0, medium: 1, low: 1, total: 3 },
            score: 50,
            complianceStatus: 'FAIL',
        };

        const output = captureConsoleLog(() => renderPlainReport(result, 'en'));

        // stoppar-kop must appear before forsamrar, which must appear before putsning
        const stopparIdx = output.indexOf('form-labels');
        const forsamrarIdx = output.indexOf('color-contrast');
        const putsningIdx = output.indexOf('heading-order');

        expect(stopparIdx).toBeGreaterThanOrEqual(0);
        expect(forsamrarIdx).toBeGreaterThanOrEqual(0);
        expect(putsningIdx).toBeGreaterThanOrEqual(0);
        expect(stopparIdx).toBeLessThan(forsamrarIdx);
        expect(forsamrarIdx).toBeLessThan(putsningIdx);
    });

    it('badge mapping: stoppar-kop report contains the "Blocks purchases" badge text', () => {
        const result: ScanResult = {
            ...BASE_RESULT,
            reports: [
                {
                    ruleId: 'form-labels',
                    holmdigitalInsight: { diggRisk: 'critical', eaaImpact: 'high', reasoning: '' },
                    remediation: { description: 'Fix form labels', technicalGuidance: '' },
                    testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
                    plainLanguage: {
                        headline: 'Forms stop buyers',
                        whatHappens: 'Buttons unclickable',
                        whoIsAffected: 'Screen reader users',
                        businessImpact: 'Cart abandonment',
                        howToFix: 'Add labels',
                        impactLevel: 'stoppar-kop',
                    },
                } as unknown as ScanResult['reports'][number],
            ],
            stats: { passed: 0, critical: 1, high: 0, medium: 0, low: 0, total: 1 },
            score: 0,
            complianceStatus: 'FAIL',
        };

        const output = captureConsoleLog(() => renderPlainReport(result, 'en'));

        // t('plain.badge_stoppar_kop') = 'Blocks purchases' in English
        expect(output).toContain('Blocks purchases');
    });

    it('fallback: report with no plainLanguage renders framing line + description (Task C)', () => {
        const result: ScanResult = {
            ...BASE_RESULT,
            reports: [
                {
                    ruleId: 'custom-rule',
                    holmdigitalInsight: { diggRisk: 'high', eaaImpact: 'high', reasoning: '' },
                    remediation: { description: 'This is the fallback remediation text', technicalGuidance: '' },
                    testability: { automated: false, requiresManualCheck: true, pseudoAutomation: false, complexity: 'complex' },
                    // No plainLanguage field
                } as unknown as ScanResult['reports'][number],
            ],
            stats: { passed: 0, critical: 0, high: 1, medium: 0, low: 0, total: 1 },
            score: 0,
            complianceStatus: 'FAIL',
        };

        let output = '';
        expect(() => {
            output = captureConsoleLog(() => renderPlainReport(result, 'en'));
        }).not.toThrow();

        // Fallback framing must appear before the technical description
        expect(output).toContain('Technical finding. Ask your developer to review this:');
        // Technical description must follow
        expect(output).toContain('This is the fallback remediation text');
    });

    it('attribution line appears in terminal output after closing', () => {
        const result: ScanResult = {
            ...BASE_RESULT,
            reports: [],
        };

        const output = captureConsoleLog(() => renderPlainReport(result, 'en'));

        // t('plain.attribution') must appear
        expect(output).toContain('HolmDigital Engine');
        expect(output).toContain('HolmDigital accessibility ecosystem');
    });

    it('empty-state: result with 0 reports renders the t("plain.empty_state") string', () => {
        const result: ScanResult = {
            ...BASE_RESULT,
            reports: [],
        };

        const output = captureConsoleLog(() => renderPlainReport(result, 'en'));

        // t('plain.empty_state') = 'No barriers found this time.' in English
        expect(output).toContain('No barriers found this time.');
    });

    it('KRAV 1: collapses duplicate findings of the same rule into one card with an occurrence count', () => {
        const contrast = () => ({
            ruleId: 'color-contrast',
            holmdigitalInsight: { diggRisk: 'medium', eaaImpact: 'medium', reasoning: '' },
            remediation: { description: 'Fix contrast', technicalGuidance: '' },
            testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
            plainLanguage: {
                headline: 'Contrast headline',
                whatHappens: 'Contrast what',
                whoIsAffected: 'Contrast who',
                businessImpact: 'Contrast cost',
                howToFix: 'Contrast fix',
                impactLevel: 'forsamrar',
            },
        }) as unknown as ScanResult['reports'][number];

        const result: ScanResult = {
            ...BASE_RESULT,
            // Three identical color-contrast findings + one other rule
            reports: [
                contrast(),
                contrast(),
                contrast(),
                {
                    ruleId: 'heading-order',
                    holmdigitalInsight: { diggRisk: 'low', eaaImpact: 'low', reasoning: '' },
                    remediation: { description: 'Fix headings', technicalGuidance: '' },
                    testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
                    plainLanguage: {
                        headline: 'Heading headline',
                        whatHappens: 'Heading what',
                        whoIsAffected: 'Heading who',
                        businessImpact: 'Heading cost',
                        howToFix: 'Heading fix',
                        impactLevel: 'putsning',
                    },
                } as unknown as ScanResult['reports'][number],
            ],
            stats: { passed: 0, critical: 0, high: 0, medium: 3, low: 1, total: 4 },
            score: 40,
            complianceStatus: 'FAIL',
        };

        const output = captureConsoleLog(() => renderPlainReport(result, 'en'));

        // color-contrast must appear exactly once (one grouped card, not three)
        expect(output.split('color-contrast').length - 1).toBe(1);
        // The occurrence count is shown on the grouped card
        expect(output).toContain('3 occurrences');
        // Two distinct cards only: "1." and "2.", never a "3." or "4."
        expect(output).toContain('1. ');
        expect(output).toContain('2. ');
        expect(output).not.toContain('3. ');
        expect(output).not.toContain('4. ');
        // Intro count stays the TOTAL number of findings (4), not the group count (2)
        expect(output).toContain('Found 4 issues');
    });

    it('KRAV 3-short: a Swedish fallback finding never leaks the raw English axe description', () => {
        const result: ScanResult = {
            ...BASE_RESULT,
            reports: [
                {
                    ruleId: 'aria-allowed-role',
                    holmdigitalInsight: { diggRisk: 'medium', eaaImpact: 'medium', reasoning: '' },
                    remediation: { description: 'ARIA role should be appropriate for the element', technicalGuidance: '' },
                    testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
                    // No plainLanguage field → fallback path
                } as unknown as ScanResult['reports'][number],
            ],
            stats: { passed: 0, critical: 0, high: 0, medium: 1, low: 0, total: 1 },
            score: 80,
            complianceStatus: 'FAIL',
        };

        const output = captureConsoleLog(() => renderPlainReport(result, 'sv'));

        // The raw English axe help must NOT appear in the Swedish report body
        expect(output).not.toContain('ARIA role should be appropriate for the element');
        // The translated, self-contained framing is shown instead
        expect(output).toContain('Tekniskt fynd som din utvecklare behöver titta på.');
        // The ruleId is still surfaced (on the header line)
        expect(output).toContain('aria-allowed-role');
    });
});
