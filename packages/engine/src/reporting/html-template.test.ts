import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { generateReportHTML } from './html-template';
import { ScanResult, getEngineVersion } from '../core/regulatory-scanner';
import { setLanguage } from '../i18n';
import axeCore from 'axe-core';

/**
 * D-13 developer-PDF snapshot baseline.
 *
 * These tests capture the developer HTML output via two-arg generateReportHTML
 * calls (no third argument) in wave 2, BEFORE plan 05 adds the `audience` param.
 * The committed snapshot file is the regression lock plan 05 asserts against.
 *
 * Version is normalized out via replaceAll(getEngineVersion(), '__VERSION__')
 * so future version bumps do not invalidate the baseline.
 */

const EMPTY_RESULT: ScanResult = {
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

const ONE_REPORT_RESULT: ScanResult = {
    ...EMPTY_RESULT,
    reports: [
        {
            ruleId: 'all-img-alt',
            wcagCriteria: '1.1.1',
            en301549Criteria: '9.1.1.1',
            dosLagenReference: 'Lag 2018:1937 §7',
            diggRisk: 'critical',
            eaaImpact: 'high',
            remediation: {
                description: 'Fix alt',
                technicalGuidance: 'Guidance',
                component: 'Image',
            },
            holmdigitalInsight: {
                diggRisk: 'critical',
                eaaImpact: 'high',
                reasoning: 'Missing alt text',
            },
            testability: {
                automated: true,
                requiresManualCheck: false,
                pseudoAutomation: false,
                complexity: 'simple',
            },
            failingNodes: [
                { target: 'img', html: '<img src="bad.jpg">', failureSummary: 'Fix it' },
            ],
        } as unknown as ScanResult['reports'][number],
    ],
    stats: { passed: 0, critical: 1, high: 0, medium: 0, low: 0, total: 1 },
    score: 0,
    complianceStatus: 'FAIL',
};

describe('generateReportHTML developer baseline (D-13)', () => {
    beforeAll(() => {
        // Ensure locale-deterministic formatDate output (LOCALE_TO_INTL[getCurrentLang()])
        setLanguage('en');
    });

    it('matches snapshot for empty result (two-arg call, no audience param)', () => {
        // D-13: two arguments only — no third argument
        const html = generateReportHTML(EMPTY_RESULT, 'public');
        const normalized = html
            .replaceAll(getEngineVersion(), '__VERSION__')
            // Generated-date renders in the host timezone — normalize so the
            // snapshot passes on UTC CI runners as well as local CET (CR-01)
            .replace(/Generated: [^<]+</g, 'Generated: __DATE__<');
        expect(normalized).toMatchSnapshot();
    });

    it('matches snapshot for result with one report (two-arg call, no audience param)', () => {
        // D-13: two arguments only — no third argument
        const html = generateReportHTML(ONE_REPORT_RESULT, 'public');
        const normalized = html
            .replaceAll(getEngineVersion(), '__VERSION__')
            .replace(/Generated: [^<]+</g, 'Generated: __DATE__<');
        expect(normalized).toMatchSnapshot();
    });
});

describe('generateReportHTML plain template (D-08/D-16)', () => {
    beforeAll(() => {
        setLanguage('en');
    });

    it('returns plain chrome and NOT the developer score block (D-08)', () => {
        const html = generateReportHTML(EMPTY_RESULT, 'public', 'plain');
        // Plain chrome must be present
        expect(html).toContain('Accessibility report for https://example.com');
        // Developer score block must NOT be present in the plain template
        expect(html).not.toContain('summary-grid');
        expect(html).not.toContain('Overall Score');
    });

    it('contains the engine package version in the plain footer (D-16)', () => {
        const html = generateReportHTML(EMPTY_RESULT, 'public', 'plain');
        // Read engine package.json version at test time (mirrors regulatory-scanner.test.ts:55 pattern)
        const enginePkg = JSON.parse(
            readFileSync(join(__dirname, '../../package.json'), 'utf-8')
        ) as { version: string };
        const engineVersion = enginePkg.version;
        // Footer must contain the engine version string (proves D-16: not root or standards version)
        expect(html).toContain(`v${engineVersion}`);
        // Cross-check: matches getEngineVersion() which reads __ENGINE_VERSION__ at build time
        expect(html).toContain(`v${getEngineVersion()}`);
    });

    it('plain footer contains attribution text', () => {
        const html = generateReportHTML(EMPTY_RESULT, 'public', 'plain');
        expect(html).toContain('HolmDigital Engine');
        expect(html).toContain('HolmDigital accessibility ecosystem');
    });

    it('finding without plainLanguage renders fallback framing before description', () => {
        const withFallback: ScanResult = {
            ...EMPTY_RESULT,
            reports: [
                {
                    ruleId: 'aria-allowed-role',
                    holmdigitalInsight: { diggRisk: 'medium', eaaImpact: 'medium', reasoning: '' },
                    remediation: { description: 'Role is not allowed for element', technicalGuidance: '' },
                    testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
                    // No plainLanguage field
                } as unknown as ScanResult['reports'][number],
            ],
            stats: { passed: 0, critical: 0, high: 0, medium: 1, low: 0, total: 1 },
            score: 80,
            complianceStatus: 'FAIL',
        };
        const html = generateReportHTML(withFallback, 'public', 'plain');
        // Fallback framing must appear before the technical description
        expect(html).toContain('Technical finding. Ask your developer to review this:');
        expect(html).toContain('Role is not allowed for element');
        // The framing class must be present
        expect(html).toContain('fallback-framing');
    });

    it('plain HTML items have break-inside: avoid for PDF page break safety', () => {
        const html = generateReportHTML(EMPTY_RESULT, 'public', 'plain');
        // issue-item must carry the page-break guard CSS
        expect(html).toContain('break-inside: avoid');
        expect(html).toContain('page-break-inside: avoid');
    });

    it('plain header is the light wiki style, not the navy band (Task H1)', () => {
        const html = generateReportHTML(EMPTY_RESULT, 'public', 'plain');
        // Navy band color removed entirely
        expect(html).not.toContain('#082f49');
        // Localized tagline present under the logo
        expect(html).toContain('brand__tagline');
        // Accent color for the top line stays the wiki blue
        expect(html).toContain('#0369a1');
    });

    it('plain header embeds the real HolmDigital logo as a data URI (Task I)', () => {
        const html = generateReportHTML(EMPTY_RESULT, 'public', 'plain');
        // Self-contained embedded logo — no network fetch at generation time
        expect(html).toContain('data:image/jpeg;base64,');
        expect(html).toContain('alt="Holm Digital logotyp"');
        // CSS-drawn monogram + stacked-text treatment removed
        expect(html).not.toContain('brand__monogram');
        expect(html).not.toContain('brand__mark');
    });

    it('plain footer is position:fixed so it repeats on every printed page (Task H2)', () => {
        const html = generateReportHTML(EMPTY_RESULT, 'public', 'plain');
        // Fixed footer element + the print-repeat rule
        expect(html).toContain('page-footer');
        expect(html).toContain('position: fixed');
        // Old in-flow footer removed: exactly one footer element in the document
        expect(html.match(/<footer/g)).toHaveLength(1);
        // Attribution still rides in the (now fixed) footer
        expect(html).toContain('HolmDigital accessibility ecosystem');
    });

    it('KRAV 1: groups duplicate findings into one card with an occurrence count', () => {
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
            ...EMPTY_RESULT,
            reports: [contrast(), contrast(), contrast()],
            stats: { passed: 0, critical: 0, high: 0, medium: 3, low: 0, total: 3 },
            score: 40,
            complianceStatus: 'FAIL',
        };

        const html = generateReportHTML(result, 'public', 'plain');

        // Three identical findings collapse to a single issue card
        expect(html.match(/class="issue-id"/g)).toHaveLength(1);
        expect(html).toContain('color-contrast');
        // Occurrence count rendered on the grouped card
        expect(html).toContain('3 occurrences');
    });

    it('KRAV 4: renders a per-impact-level breakdown line that sums to the total', () => {
        const make = (ruleId: string, impactLevel: string) => ({
            ruleId,
            holmdigitalInsight: { diggRisk: 'medium', eaaImpact: 'medium', reasoning: '' },
            remediation: { description: 'x', technicalGuidance: '' },
            testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
            plainLanguage: {
                headline: 'h', whatHappens: 'w', whoIsAffected: 'a', businessImpact: 'b', howToFix: 'f',
                impactLevel,
            },
        }) as unknown as ScanResult['reports'][number];

        const result: ScanResult = {
            ...EMPTY_RESULT,
            reports: [
                make('form-labels', 'stoppar-kop'),
                make('color-contrast', 'forsamrar'),
                make('color-contrast', 'forsamrar'),
                make('heading-order', 'putsning'),
            ],
            stats: { passed: 0, critical: 1, high: 0, medium: 2, low: 1, total: 4 },
            score: 30,
            complianceStatus: 'FAIL',
        };

        const html = generateReportHTML(result, 'public', 'plain');

        // Breakdown counted per occurrence, ordered by impact, only levels with findings
        expect(html).toContain('4 issues: 1 Blocks purchases, 2 Degrades experience, 1 Worth polishing');
    });

    it('KRAV 3: uses the Swedish headline as the card heading with the ruleId as a subordinate reference', () => {
        const result: ScanResult = {
            ...EMPTY_RESULT,
            reports: [
                {
                    ruleId: 'region',
                    holmdigitalInsight: { diggRisk: 'medium', eaaImpact: 'medium', reasoning: '' },
                    remediation: { description: 'x', technicalGuidance: '' },
                    testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
                    plainLanguage: {
                        headline: 'Sidans innehåll är inte organiserat i tydliga områden',
                        whatHappens: 'w', whoIsAffected: 'a', businessImpact: 'b', howToFix: 'f',
                        impactLevel: 'forsamrar',
                    },
                } as unknown as ScanResult['reports'][number],
            ],
            stats: { passed: 0, critical: 0, high: 0, medium: 1, low: 0, total: 1 },
            score: 80,
            complianceStatus: 'FAIL',
        };

        const html = generateReportHTML(result, 'public', 'plain');

        // Swedish headline is the heading text; ruleId wrapped in the subordinate ref span
        expect(html).toContain('Sidans innehåll är inte organiserat i tydliga områden');
        expect(html).toContain('<span class="issue-rule-ref">(region)</span>');
    });

    it('KRAV 3: falls back to the bare ruleId heading when a finding has no plainLanguage', () => {
        const result: ScanResult = {
            ...EMPTY_RESULT,
            reports: [
                {
                    ruleId: 'custom-rule',
                    holmdigitalInsight: { diggRisk: 'high', eaaImpact: 'high', reasoning: '' },
                    remediation: { description: 'fallback text', technicalGuidance: '' },
                    testability: { automated: false, requiresManualCheck: true, pseudoAutomation: false, complexity: 'complex' },
                    // No plainLanguage field
                } as unknown as ScanResult['reports'][number],
            ],
            stats: { passed: 0, critical: 0, high: 1, medium: 0, low: 0, total: 1 },
            score: 0,
            complianceStatus: 'FAIL',
        };

        const html = generateReportHTML(result, 'public', 'plain');

        // Heading holds the ruleId, with no subordinate-ref span rendered in the
        // card body (the .issue-rule-ref CSS rule always exists in the <style> block).
        expect(html).toContain('custom-rule');
        expect(html).not.toContain('<span class="issue-rule-ref">');
    });
});

describe('plain report fallback notice banner', () => {
    it('renders the notice banner element when served in English as a fallback', () => {
        setLanguage('en');
        const html = generateReportHTML(EMPTY_RESULT, 'public', 'plain', 'de');
        // The CSS class always exists in <style>; assert on the rendered element.
        expect(html).toContain('<p class="plain-fallback-notice">');
        expect(html).toContain('German');
    });

    it('renders no notice banner element for a natively supported language', () => {
        setLanguage('en');
        const html = generateReportHTML(EMPTY_RESULT, 'public', 'plain');
        expect(html).not.toContain('<p class="plain-fallback-notice">');
    });
});

/**
 * Robusthetssektionen utan JS.
 *
 * Kravet från Juno: fyndet får aldrig presenteras som ett WCAG-fel eller som en
 * del av konformansresultatet. Testerna nedan bevakar exakt det.
 */
describe('robusthetssektion utan JavaScript', () => {
    const withNoScript = (verdict: 'ok' | 'partial' | 'empty' | 'unknown', ratio: number): ScanResult => ({
        ...EMPTY_RESULT,
        noScript: {
            textLengthWithoutJs: Math.round(4200 * ratio),
            textLengthWithJs: 4200,
            coverageRatio: ratio,
            verdict,
            hasContentWithoutJs: ratio >= 0.05,
            hasNoScriptFallback: false,
            isWcagViolation: false,
            affectsScore: false
        }
    });

    it('renderas inte alls när kontrollen inte körts (opt-in)', () => {
        setLanguage('sv');
        const html = generateReportHTML(EMPTY_RESULT, 'public');
        expect(html).not.toContain('Robusthet utan JavaScript');
    });

    it('renderas i utvecklarrapporten när kontrollen körts', () => {
        setLanguage('sv');
        const html = generateReportHTML(withNoScript('empty', 0), 'public');
        expect(html).toContain('Robusthet utan JavaScript');
        expect(html).toContain('Sidan är i praktiken tom utan JavaScript.');
    });

    it('renderas i klarspråksrapporten när kontrollen körts', () => {
        setLanguage('sv');
        const html = generateReportHTML(withNoScript('empty', 0), 'public', 'plain');
        expect(html).toContain('Robusthet utan JavaScript');
    });

    it('märks ALLTID som rekommendation och inte lagkrav', () => {
        setLanguage('sv');
        (['empty', 'partial', 'ok', 'unknown'] as const).forEach(verdict => {
            const html = generateReportHTML(withNoScript(verdict, 0.3), 'public');
            expect(html).toContain('Rekommendation, inte ett lagkrav.');
            expect(html).toContain('påverkar inte konformansscoren');
        });
    });

    it('presenteras utanför violation-listan och rör inte scoren', () => {
        setLanguage('sv');
        const clean = generateReportHTML(EMPTY_RESULT, 'public');
        const withProbe = generateReportHTML(withNoScript('empty', 0), 'public');

        // Samma score, samma violation-markup. Enda skillnaden i hela dokumentet
        // är den tillagda robusthetssektionen: tar man bort den är rapporterna
        // tecken för tecken identiska. Fyndet kan alltså inte ha smugit sig in i
        // scoren, statistiken eller violation-listan.
        const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();
        expect(withProbe).toContain('100');
        expect(withProbe).not.toContain('class="violation-title">noscript');
        expect(collapse(withProbe.replace(/<section[\s\S]*?<\/section>/, ''))).toBe(collapse(clean));
    });

    it('visar täckningsgraden i procent', () => {
        setLanguage('sv');
        const html = generateReportHTML(withNoScript('partial', 0.3), 'public');
        expect(html).toContain('30%');
    });

    /**
     * Vem fyndet drabbar. Utan den här raden avfärdas fyndet med "alla har ju
     * JavaScript", och då är hela kontrollen bortkastad. Raden ska INTE innehålla
     * någon siffra: enda kända underlaget är GDS 2013, gammalt och orepliterat.
     */
    it('säger VEM det drabbar när sidan är tom utan JavaScript', () => {
        setLanguage('sv');
        const html = generateReportHTML(withNoScript('empty', 0), 'public');
        expect(html).toContain('vars skript aldrig kom fram');
    });

    it('säger VEM det drabbar även vid partiellt bortfall', () => {
        setLanguage('sv');
        const html = generateReportHTML(withNoScript('partial', 0.3), 'public');
        expect(html).toContain('vars skript aldrig kom fram');
    });

    it('säger inget om vem det drabbar när innehållet finns (ok/unknown)', () => {
        setLanguage('sv');
        (['ok', 'unknown'] as const).forEach(verdict => {
            const html = generateReportHTML(withNoScript(verdict, 0.95), 'public');
            expect(html).not.toContain('vars skript aldrig kom fram');
        });
    });

    it('finns även i klarspråksrapporten, som är PDF-flödet', () => {
        setLanguage('sv');
        const html = generateReportHTML(withNoScript('empty', 0), 'public', 'plain');
        expect(html).toContain('vars skript aldrig kom fram');
    });
});
