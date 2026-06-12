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
});
