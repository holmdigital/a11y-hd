import { describe, it, expect } from 'vitest';
import { isInterstitialPage, getStandardsVersion, RegulatoryScanner } from './regulatory-scanner';
import type { ScanResult } from './regulatory-scanner';
import { generateJUnitXML } from '../reporting/junit-generator';
import { generateReportHTML } from '../reporting/html-template';

/**
 * Intern #43 — två robusthetsfynd i motorn.
 *
 * Fynd 1: en interstitial-/vänta-/bot-challenge-sida (t.ex. w3.org som en gång
 * scannades som en "Vänta..."-sida) mäts av axe som om det vore riktigt innehåll.
 * `isInterstitialPage` känner av det så att scan() kan flagga resultatet.
 *
 * Fynd 3: `getStandardsVersion()` returnerade 'unknown' eftersom standards
 * `exports` inte exponerade "./package.json" (ERR_PACKAGE_PATH_NOT_EXPORTED).
 */

describe('Intern #43 fynd 1 — interstitial-detektion', () => {
    it('flaggar en tydlig svensk vänta-titel', () => {
        expect(isInterstitialPage('Vänta...', false, 5000)).toBe(true);
    });

    it('flaggar engelska challenge-titlar', () => {
        for (const t of [
            'Just a moment...',
            'Checking your browser before accessing',
            'Attention Required! | Cloudflare',
            'Please wait',
            'Redirecting…',
            'Verifying you are human',
        ]) {
            expect(isInterstitialPage(t, false, 5000), t).toBe(true);
        }
    });

    it('flaggar en meta-refresh-omdirigering på en nästan tom sida', () => {
        expect(isInterstitialPage('Home', true, 120)).toBe(true);
    });

    it('flaggar INTE en riktig sida med normal titel och innehåll', () => {
        expect(isInterstitialPage('HolmDigital — Tillgänglighet', false, 8000)).toBe(false);
    });

    it('flaggar INTE en kort men riktig sida utan meta-refresh', () => {
        // Låg textmängd ensam räcker inte — bara i kombination med en omdirigering.
        expect(isInterstitialPage('Kontakt', false, 120)).toBe(false);
    });

    it('flaggar INTE en meta-refresh på en sida med rejält innehåll', () => {
        // En riktig sida kan bära en långsam meta-refresh (t.ex. sessions-timeout).
        expect(isInterstitialPage('Artikel', true, 5000)).toBe(false);
    });

    it('hanterar undefined titel utan att krascha', () => {
        expect(isInterstitialPage(undefined, false, 5000)).toBe(false);
    });
});

describe('Intern #43 fynd 3 — standardsVersion är inte "unknown"', () => {
    it('resolver @holmdigital/standards/package.json och läser en riktig semver', () => {
        const v = getStandardsVersion();
        expect(v).not.toBe('unknown');
        expect(v).toMatch(/^\d+\.\d+\.\d+/);
    });
});

/**
 * Fynd 1 (omarbetning, Karins live-regression 2026-08-27): detektion räcker inte —
 * motorn får INTE emitta en vanlig score/compliance för en interstitial-sida.
 * En INCONCLUSIVE-scan supprimerar score/stats och släpper vänta-sidans artefakter.
 */
describe('Intern #43 fynd 1 — interstitial ger INCONCLUSIVE, inte en vilseledande score', () => {
    // generateResultPackage är privat; samma cast-mönster som krav13-testet.
    const pkg = (scanner: RegulatoryScanner, reports: unknown[], interstitial: boolean): ScanResult =>
        (scanner as unknown as {
            generateResultPackage: (r: unknown, p: number, d: number, t?: string, l?: string, i?: boolean) => ScanResult
        }).generateResultPackage(reports, 40, 1234, 'Vänta...', 'sv', interstitial);

    it('interstitialSuspected → complianceStatus INCONCLUSIVE, score 0, tomma reports/stats', () => {
        const scanner = new RegulatoryScanner({ url: 'https://w3.org' });
        const r = pkg(scanner, [], true);
        expect(r.complianceStatus).toBe('INCONCLUSIVE');
        expect(r.score).toBe(0);
        expect(r.reports).toEqual([]);
        expect(r.stats.total).toBe(0);
        expect(r.stats.passed).toBe(0);
        expect(r.metadata.interstitialSuspected).toBe(true);
        expect(r.legalSummary).toEqual({ wadApplicable: 0, eaaApplicable: 0, eaaDeadlineViolations: 0 });
    });

    it('utan interstitial (kontroll) ger ett normalt PASS, inte INCONCLUSIVE', () => {
        const scanner = new RegulatoryScanner({ url: 'https://example.com' });
        const r = pkg(scanner, [], false);
        expect(r.complianceStatus).toBe('PASS');
        expect(r.score).toBe(100);
        expect(r.metadata.interstitialSuspected).toBeUndefined();
    });
});

const inconclusiveResult = (): ScanResult => ({
    url: 'https://w3.org',
    timestamp: '2026-09-04T00:00:00Z',
    metadata: {
        engineVersion: '3.2.0', axeCoreVersion: '4.13.0', standardsVersion: '3.0.5',
        scanDuration: 1000, pageTitle: 'Vänta...', pageLanguage: 'en', interstitialSuspected: true,
    },
    reports: [],
    stats: { passed: 0, critical: 0, high: 0, medium: 0, low: 0, total: 0, needsReview: 0 },
    score: 0,
    complianceStatus: 'INCONCLUSIVE',
    legalSummary: { wadApplicable: 0, eaaApplicable: 0, eaaDeadlineViolations: 0 },
});

describe('Intern #43 fynd 1 — reportrar ljuger inte om en INCONCLUSIVE-scan', () => {
    it('JUnit: ett <error>-testcase och errors="1", aldrig "0 tests" som ser ut som PASS', () => {
        const xml = generateJUnitXML(inconclusiveResult());
        expect(xml).toContain('errors="1"');
        expect(xml).toContain('<error message=');
        expect(xml).toContain('INCONCLUSIVE');
        expect(xml).not.toContain('Passed Accessibility Rule');
    });

    it('HTML: visar ett ärligt "kunde inte skanna"-besked, inte ett score-kort', () => {
        const html = generateReportHTML(inconclusiveResult());
        expect(html).toContain('We could not scan the real page'); // en är default
        expect(html).not.toContain('score-card');
        expect(html).not.toContain('>0</div>'); // inget nollställt score-tal
    });
});
