import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getEngineVersion, RegulatoryScanner } from './regulatory-scanner';
import { setLanguage } from '../i18n';

/**
 * Inline AxeScanOutput type — NOT exported from regulatory-scanner.ts,
 * reproduced here for type-safe fixture construction.
 */
interface AxeScanOutput {
    violations: Array<{
        id: string;
        help: string;
        description: string;
        tags: string[];
        nodes: Array<{ html: string; target: string[]; failureSummary: string }>;
    }>;
    passes: Array<{ id: string }>;
    incomplete?: Array<{
        id: string;
        help: string;
        description: string;
        tags: string[];
        nodes: Array<{
            html: string;
            target: string[];
            failureSummary?: string;
            any?: Array<{ id: string; message?: string; data?: Record<string, unknown> }>;
        }>;
    }>;
}

// Test fixture: matched rule (color-contrast exists in standards data)
const mockAxeOutput: AxeScanOutput = {
    violations: [{
        id: 'color-contrast',
        help: 'Elements must have sufficient color contrast',
        description: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds',
        tags: ['wcag2a', 'wcag21aa', 'color', 'contrast', 'WAD', 'EAA'],
        nodes: [{
            html: '<span style="color: #777">Low contrast text</span>',
            target: ['span'],
            failureSummary: 'Fix any of the following: Element has insufficient color contrast of 4.48:1'
        }]
    }],
    passes: [{ id: 'html-has-lang' }]
};

// Test fixture: unmatched rule (fallback path)
const mockAxeOutputNoMatch: AxeScanOutput = {
    violations: [{
        id: 'fake-rule-that-does-not-exist',
        help: 'This rule does not exist in standards',
        description: 'Testing fallback path',
        tags: ['custom'],
        nodes: [{
            html: '<div>test</div>',
            target: ['div'],
            failureSummary: 'Fails for testing'
        }]
    }],
    passes: []
};

describe('getEngineVersion', () => {
    it('returns version from package.json, not a hardcoded string', () => {
        const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
        expect(getEngineVersion()).toBe(pkg.version);
        expect(getEngineVersion()).toMatch(/^\d+\.\d+\.\d+/);
    });
});

describe('enrichResults', () => {
    // enrichResults is private; bracket notation avoids production code changes (TEST-01 constraint)
    const scanner = new RegulatoryScanner({ url: 'https://test.example.com' });
    const enrichResults = (input: AxeScanOutput) =>
        (scanner as unknown as { enrichResults: (i: AxeScanOutput) => Promise<import('@holmdigital/standards').EnrichedReport[]> })
            .enrichResults(input);

    it('produces EnrichedReport with failingNodes and legalContext for matched rule', async () => {
        const reports = await enrichResults(mockAxeOutput);

        expect(reports.length).toBe(1);
        expect(reports[0].ruleId).toBe('color-contrast');

        // failingNodes should be populated from violation nodes
        expect(reports[0].failingNodes).toBeDefined();
        expect(Array.isArray(reports[0].failingNodes)).toBe(true);
        expect(reports[0].failingNodes!.length).toBe(1);
        expect(reports[0].failingNodes![0].html).toContain('color: #777');
        expect(typeof reports[0].failingNodes![0].target).toBe('string');
        expect(reports[0].failingNodes![0].failureSummary).toContain('color contrast');

        // legalContext should be populated from convergence rule
        expect(reports[0].legalContext).toBeDefined();

        // wcagCriteria should be a real criteria, not 'Unknown'
        expect(typeof reports[0].wcagCriteria).toBe('string');
        expect(reports[0].wcagCriteria).not.toBe('Unknown');

        // reasoning should be overwritten with violation.help
        expect(reports[0].holmdigitalInsight.reasoning).toBe('Elements must have sufficient color contrast');
    });

    it('produces fallback report without failingNodes for unmatched rule', async () => {
        const reports = await enrichResults(mockAxeOutputNoMatch);

        expect(reports.length).toBe(1);
        expect(reports[0].ruleId).toBe('fake-rule-that-does-not-exist');

        // Fallback values
        expect(reports[0].wcagCriteria).toBe('Unknown');
        expect(reports[0].en301549Criteria).toBe('Unknown');
        expect(reports[0].diggRisk).toBe('medium');

        // No failingNodes or legalContext in fallback path
        expect(reports[0].failingNodes).toBeUndefined();
        expect(reports[0].legalContext).toBeUndefined();

        // reasoning comes from violation.help
        expect(reports[0].holmdigitalInsight.reasoning).toBe('This rule does not exist in standards');
        // remediation populated from violation fields
        expect(reports[0].remediation.description).toBe('This rule does not exist in standards');
        expect(reports[0].remediation.technicalGuidance).toBe('Testing fallback path');
    });

    it('labels best-practice rules correctly instead of Unknown', async () => {
        const bestPracticeInput: AxeScanOutput = {
            violations: [{
                id: 'aria-allowed-role',
                help: 'ARIA role should be appropriate for the element',
                description: 'Ensures role attribute has an appropriate value for the element',
                tags: ['cat.aria', 'best-practice'],
                nodes: [{
                    html: '<div role="button">click</div>',
                    target: ['div[role="button"]'],
                    failureSummary: 'Fix role usage'
                }]
            }],
            passes: []
        };

        const reports = await enrichResults(bestPracticeInput);

        expect(reports.length).toBe(1);
        expect(reports[0].wcagCriteria).toBe('Best Practice');
        expect(reports[0].en301549Criteria).toBe('N/A');
        expect(reports[0].diggRisk).toBe('low');
        expect(reports[0].holmdigitalInsight.priorityRationale).toContain('Best practice');
        expect(reports[0].dosLagenReference).toBe('Recommendation (not a legal requirement)');
    });

    it('handles multiple violations in a single scan', async () => {
        const multiViolation: AxeScanOutput = {
            violations: [...mockAxeOutput.violations, ...mockAxeOutputNoMatch.violations],
            passes: []
        };

        const reports = await enrichResults(multiViolation);

        expect(reports.length).toBe(2);
        // First report is matched (has failingNodes)
        expect(reports[0].failingNodes).toBeDefined();
        // Second report is fallback (no failingNodes)
        expect(reports[1].failingNodes).toBeUndefined();
    });
});

describe('enrichResultsLight (klarspråk on the light path)', () => {
    // enrichResultsLight is private; bracket notation mirrors the enrichResults tests.
    const scanner = new RegulatoryScanner({ url: 'https://test.example.com' });
    const enrichLight = (input: AxeScanOutput) =>
        (scanner as unknown as { enrichResultsLight: (i: AxeScanOutput) => Promise<import('@holmdigital/standards').EnrichedReport[]> })
            .enrichResultsLight(input);

    it('attaches Swedish plainLanguage for a mapped rule', async () => {
        setLanguage('sv');
        const reports = await enrichLight(mockAxeOutput);
        setLanguage('en');

        expect(reports.length).toBe(1);
        expect(reports[0].ruleId).toBe('color-contrast');
        expect(reports[0].plainLanguage).toBeDefined();
        expect(reports[0].plainLanguage!.headline.length).toBeGreaterThan(0);
        expect(['stoppar-kop', 'hindrar', 'forsamrar', 'putsning']).toContain(reports[0].plainLanguage!.impactLevel);
    });

    it('leaves plainLanguage undefined for an unmapped rule', async () => {
        const reports = await enrichLight(mockAxeOutputNoMatch);
        expect(reports[0].plainLanguage).toBeUndefined();
    });

    it('only looks up klarspråk for the top-N findings', async () => {
        // Nine copies of the mapped rule: index 7 is within top-8, index 8 is beyond it.
        const many: AxeScanOutput = {
            violations: Array.from({ length: 9 }, () => mockAxeOutput.violations[0]),
            passes: []
        };
        setLanguage('sv');
        const reports = await enrichLight(many);
        setLanguage('en');

        expect(reports.length).toBe(9);
        expect(reports[7].plainLanguage).toBeDefined();
        expect(reports[8].plainLanguage).toBeUndefined();
    });

    // Intern #29: light-läget måste bära lagrummet, inte tom sträng — det är ytan
    // den publika widgeten matar och där #28:s lagrumsrättelse ska synas.
    it('fills dosLagenReference and en301549Criteria for a mapped rule (never empty)', async () => {
        setLanguage('sv');
        const reports = await enrichLight(mockAxeOutput);
        setLanguage('en');

        expect(reports[0].dosLagenReference.length).toBeGreaterThan(0);
        expect(reports[0].dosLagenReference).not.toBe('');
        expect(reports[0].en301549Criteria.length).toBeGreaterThan(0);
        expect(reports[0].en301549Criteria).not.toBe('');
    });

    it('says the legal basis is unknown for an unmapped rule — never empty, never a fake reference', async () => {
        setLanguage('sv');
        const reportsSv = await enrichLight(mockAxeOutputNoMatch);
        setLanguage('en');

        expect(reportsSv[0].dosLagenReference).toBe('Lagrum okänt');
        expect(reportsSv[0].dosLagenReference).not.toBe('');
        // Never a "Rekommendation"/"Kräver manuell bedömning"-style phrase in the law slot.
        expect(reportsSv[0].dosLagenReference).not.toMatch(/Rekommendation|manuell/i);

        const reportsEn = await enrichLight(mockAxeOutputNoMatch);
        expect(reportsEn[0].dosLagenReference).toBe('Legal basis unknown');
    });
});

describe('ScannerOptions.waitForHydrationMs', () => {
    it('defaults to 2500 ms when not provided', () => {
        const scanner = new RegulatoryScanner({ url: 'https://test.example.com' });
        // Access via the publik konstruktor-spreaden — defaulten ligger på instansens options.
        expect((scanner as unknown as { options: { waitForHydrationMs?: number } }).options.waitForHydrationMs).toBe(2500);
    });

    it('respects an explicit 0 to disable hydration wait', () => {
        const scanner = new RegulatoryScanner({ url: 'https://test.example.com', waitForHydrationMs: 0 });
        expect((scanner as unknown as { options: { waitForHydrationMs?: number } }).options.waitForHydrationMs).toBe(0);
    });

    it('respects a custom value above the default', () => {
        const scanner = new RegulatoryScanner({ url: 'https://test.example.com', waitForHydrationMs: 5000 });
        expect((scanner as unknown as { options: { waitForHydrationMs?: number } }).options.waitForHydrationMs).toBe(5000);
    });

    it('keeps the 2500 ms default when the key is present but undefined', () => {
        // CLI:n skickar alltid med nyckeln. Är flaggan inte satt är värdet undefined,
        // och objekt-spreaden i konstruktorn skriver då över defaulten med undefined
        // (spread bryr sig om nyckelns existens, inte dess värde). Utan skyddet blev
        // waiten 0 ms för ALLA CLI-körningar, och SPA:er fick falskt 100/100 igen.
        const scanner = new RegulatoryScanner({ url: 'https://test.example.com', waitForHydrationMs: undefined });
        expect((scanner as unknown as { options: { waitForHydrationMs?: number } }).options.waitForHydrationMs).toBe(2500);
    });
});

describe('ScannerOptions.noScriptCheck', () => {
    const readOption = (scanner: RegulatoryScanner) =>
        (scanner as unknown as { options: { noScriptCheck?: boolean } }).options.noScriptCheck;

    it('defaults to false — robusthetskontrollen är opt-in och kostar en extra sidladdning', () => {
        expect(readOption(new RegulatoryScanner({ url: 'https://test.example.com' }))).toBe(false);
    });

    it('can be enabled explicitly', () => {
        expect(readOption(new RegulatoryScanner({ url: 'https://test.example.com', noScriptCheck: true }))).toBe(true);
    });
});

// KRAV-3 (Intern #12): motorn ska LÄSA och BÄRA VIDARE axes `incomplete`.
// Två röda test skrivna före koden. Fixturen speglar det frysta fallet i
// Intern #20: kontrastnoden som axe 4.11.1/4.12.1 la i `incomplete` med
// messageKey `bgOverlap` — bakgrunden kunde inte bestämmas, och contrastRatio 0
// betyder DÄR "inte uppmätt", inte "noll kontrast".
describe('enrichIncomplete — axe incomplete bärs som needs review/cantTell (Intern #12)', () => {
    const scanner = new RegulatoryScanner({ url: 'https://example.com', silent: true });
    type EnrichedReport = import('@holmdigital/standards').EnrichedReport;
    type ScanResult = import('./regulatory-scanner').ScanResult;
    const enrichIncomplete = (input: AxeScanOutput) =>
        (scanner as unknown as { enrichIncomplete: (i: AxeScanOutput) => Promise<EnrichedReport[]> })
            .enrichIncomplete(input);
    const buildPackage = (reports: EnrichedReport[], passed: number) =>
        (scanner as unknown as { generateResultPackage: (r: EnrichedReport[], p: number, d: number) => ScanResult })
            .generateResultPackage(reports, passed, 0);

    const incompleteBgOverlap: AxeScanOutput = {
        violations: [],
        passes: [{ id: 'html-has-lang' }],
        incomplete: [{
            id: 'color-contrast',
            help: 'Elements must have sufficient color contrast',
            description: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds',
            tags: ['wcag2aa', 'cat.color', 'WAD', 'EAA'],
            nodes: [{
                html: '<div class="text-slate-500 pb-2">added 1 package in 2s</div>',
                target: ['.pb-2'],
                failureSummary: "Fix any of the following: Element's background color could not be determined because it is overlapped by another element",
                any: [{
                    id: 'color-contrast',
                    message: "Element's background color could not be determined because it is overlapped by another element",
                    data: { contrastRatio: 0, messageKey: 'bgOverlap', expectedContrastRatio: '4.5:1' }
                }]
            }]
        }]
    };

    it('carries incomplete into reports as a cantTell item, excluded from stats/score/complianceStatus', async () => {
        const incompleteReports = await enrichIncomplete(incompleteBgOverlap);
        expect(incompleteReports).toHaveLength(1);
        expect(incompleteReports[0].cantTell).toBe(true);
        expect(incompleteReports[0].ruleId).toBe('color-contrast');

        // En incomplete-post, noll violations. Den ska finnas kvar i reports men
        // inte påverka någon siffra som betyder pass/fail.
        const result = buildPackage(incompleteReports, incompleteBgOverlap.passes.length);
        expect(result.stats.total).toBe(0);           // exkluderad ur total
        expect(result.stats.critical).toBe(0);
        expect(result.stats.high).toBe(0);
        expect(result.stats.needsReview).toBe(1);      // men räknad som needs review
        expect(result.score).toBe(100);               // påverkar inte score
        expect(result.complianceStatus).toBe('PASS'); // eller compliance
        // Inte tyst borttappad: posten finns kvar i reports, märkt cantTell.
        expect(result.reports.some(r => r.cantTell && r.ruleId === 'color-contrast')).toBe(true);
    });

    it('reads messageKey (bgOverlap) and does not present contrastRatio 0 as a measured failure', async () => {
        const [report] = await enrichIncomplete(incompleteBgOverlap);
        expect(report.reviewReason).toBe('bgOverlap');
        // Skälet ska bära "kunde inte bestämmas", ALDRIG ett uppmätt 0-kontrastvärde.
        const node = report.failingNodes?.[0];
        expect(node?.failureSummary).toMatch(/could not be determined/i);
        expect(node?.failureSummary ?? '').not.toMatch(/\b0(?:\.0+)?\s*:\s*1\b/); // ingen "0:1"
        expect(report.cantTell).toBe(true);
    });

    // Intern #20: i det frysta fallet ligger benigna `nonBmp`-noder (rena
    // ikon-glyfer, →) FÖRE `bgOverlap`-noden. bgOverlap är det verkliga
    // granskningsbehovet och får inte begravas/truncas bort bakom pilarna.
    const incompleteMixed: AxeScanOutput = {
        violations: [],
        passes: [],
        incomplete: [{
            id: 'color-contrast',
            help: 'Elements must meet minimum color contrast ratio thresholds',
            description: 'Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds',
            tags: ['cat.color', 'wcag2aa', 'wcag143'],
            nodes: [
                { html: '<span aria-hidden="true">→</span>', target: ['a.one > span'], any: [{ id: 'color-contrast', message: 'Element content contains only non-text characters', data: { messageKey: 'nonBmp' } }] },
                { html: '<span aria-hidden="true">→</span>', target: ['a.two > span'], any: [{ id: 'color-contrast', message: 'Element content contains only non-text characters', data: { messageKey: 'nonBmp' } }] },
                { html: '<span aria-hidden="true">→</span>', target: ['a.three > span'], any: [{ id: 'color-contrast', message: 'Element content contains only non-text characters', data: { messageKey: 'nonBmp' } }] },
                { html: '<div class="text-slate-500 pb-2">added 1 package in 2s</div>', target: ['.pb-2'], any: [{ id: 'color-contrast', message: "Element's background color could not be determined because it is overlapped by another element", data: { contrastRatio: 0, messageKey: 'bgOverlap', expectedContrastRatio: '4.5:1' } }] }
            ]
        }]
    };

    it('prioritises the concerning bgOverlap node over benign nonBmp arrows that precede it (Intern #20)', async () => {
        const [report] = await enrichIncomplete(incompleteMixed);
        expect(report.cantTell).toBe(true);
        // bgOverlap ska bli reviewReason, inte de benigna nonBmp-pilarna först i arrayen.
        expect(report.reviewReason).toBe('bgOverlap');
        // och bgOverlap-noden ska finnas bland de burna failingNodes (inte truncad bort).
        expect(report.failingNodes?.some(n => /could not be determined/i.test(n.failureSummary))).toBe(true);
    });
});
