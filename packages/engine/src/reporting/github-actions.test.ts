import { describe, it, expect, vi, afterEach } from 'vitest';
import type { EnrichedReport } from '@holmdigital/standards';
import { generateGitHubActionsAnnotations } from './github-actions';

const report = (ruleId: string, diggRisk: string, cantTell?: boolean): EnrichedReport =>
    ({
        ruleId,
        wcagCriteria: '1.4.3',
        cantTell,
        holmdigitalInsight: { diggRisk, reasoning: `${ruleId} reasoning` },
        dosLagenReference: 'ref',
        remediation: {},
        failingNodes: []
    } as unknown as EnrichedReport);

describe('generateGitHubActionsAnnotations (Intern #12)', () => {
    afterEach(() => vi.restoreAllMocks());

    it('emits ::notice for cantTell and never lets it become error/warning', () => {
        const logs: string[] = [];
        vi.spyOn(console, 'log').mockImplementation((m: string) => { logs.push(m); });

        generateGitHubActionsAnnotations([
            report('color-contrast', 'critical'),
            report('image-alt', 'serious', true)
        ]);

        const critical = logs.find(l => l.includes('color-contrast'));
        const review = logs.find(l => l.includes('image-alt'));

        expect(critical).toMatch(/^::error/);
        expect(review).toMatch(/^::notice/);
        expect(review).toContain('[needs review]');
        // Needs review-posten får aldrig fälla bygget.
        expect(review).not.toMatch(/^::error/);
        expect(review).not.toMatch(/^::warning/);
    });
});
