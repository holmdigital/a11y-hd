import { describe, it, expect } from 'vitest';
import { generateReportHTML } from './html-template';
import { setLanguage } from '../i18n';
import type { ScanResult } from '../types';

const RESULT = {
    url: 'https://example.se',
    timestamp: '2026-09-18T10:00:00.000Z',
    score: 72,
    complianceStatus: 'FAIL',
    stats: { passed: 3, critical: 1, high: 0, medium: 0, low: 0, total: 1 },
    metadata: { pageTitle: 'Startsida', engineVersion: '3.3.12', standardsVersion: '4.2.1', scanDuration: 1, viewport: { width: 1280, height: 720 } },
    legalSummary: { wadApplicable: true, eaaApplicable: false, eaaDeadlineViolations: 0 },
    reports: [{
        ruleId: 'image-alt',
        wcagCriteria: '1.1.1',
        en301549Criteria: '9.1.1.1',
        diggRisk: 'critical',
        dosLagenReference: '5 § DOS-lagen (2018:1937), 9.1.1.1 EN 301 549',
        remediation: { description: 'Lagg till alt-text.', technicalGuidance: 'g', component: 'Image' },
        holmdigitalInsight: { diggRisk: 'critical', reasoning: 'Bild utan alternativtext.', swedishInterpretation: 'Digg bedomer detta som allvarligt.', priorityRationale: 'Hogst prioritet enligt DOS-lagen.' },
        legalContext: { appliesTo: ['WAD'], eaaDeadline: '28 juni 2025' },
    }],
} as unknown as ScanResult;

describe('Intern #75 — lagrumstexten oforandrad i sak efter escapningen', () => {
    for (const lang of ['sv', 'de']) {
        it(`${lang}: lagrum, deadline, badge-klass, rationale och komponent renderas`, () => {
            setLanguage(lang);
            const html = generateReportHTML(RESULT, 'public');
            setLanguage('en');

            expect(html, 'lagrummet ordagrant').toContain('5 § DOS-lagen (2018:1937), 9.1.1.1 EN 301 549');
            expect(html, 'eaaDeadline').toContain('28 juni 2025');
            expect(html, 'badge-klassen ur tabellen').toContain('badge-critical');
            expect(html, 'priorityRationale').toContain('Hogst prioritet enligt DOS-lagen.');
            expect(html, 'remediation.component').toContain('<strong>Image</strong>');
            expect(html, 'ruleId').toContain('image-alt');
            // Inget har dubbelkodats: en escapning som kors tva ganger ger &amp;lt;
            expect(html, 'ingen dubbelkodning').not.toContain('&amp;lt;');
        });
    }
});
