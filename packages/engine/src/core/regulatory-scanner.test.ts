import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getEngineVersion, RegulatoryScanner } from './regulatory-scanner';

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
        (scanner as any)['enrichResults'](input) as Promise<import('@holmdigital/standards').EnrichedReport[]>;

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
