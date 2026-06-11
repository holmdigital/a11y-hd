import { describe, it, expect, beforeAll } from 'vitest';
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
        const normalized = html.replaceAll(getEngineVersion(), '__VERSION__');
        expect(normalized).toMatchSnapshot();
    });

    it('matches snapshot for result with one report (two-arg call, no audience param)', () => {
        // D-13: two arguments only — no third argument
        const html = generateReportHTML(ONE_REPORT_RESULT, 'public');
        const normalized = html.replaceAll(getEngineVersion(), '__VERSION__');
        expect(normalized).toMatchSnapshot();
    });
});
