import { describe, it, expect } from 'vitest';
import type { EnrichedReport } from '@holmdigital/standards';
import { isNeedsReview, needsReviewOf, violationsOf } from './needs-review';

/** Minimal EnrichedReport-stub — bara fälten hjälparna bryr sig om. */
const report = (ruleId: string, cantTell?: boolean): EnrichedReport =>
    ({ ruleId, cantTell } as unknown as EnrichedReport);

describe('needs-review helpers (Intern #12)', () => {
    const reports = [
        report('color-contrast'),
        report('image-alt', true),
        report('label'),
        report('link-in-text-block', true),
    ];

    it('isNeedsReview is true only for cantTell === true', () => {
        expect(isNeedsReview(report('x', true))).toBe(true);
        expect(isNeedsReview(report('x', false))).toBe(false);
        expect(isNeedsReview(report('x'))).toBe(false);
    });

    it('violationsOf keeps everything that is not needs review', () => {
        const v = violationsOf(reports);
        expect(v.map(r => r.ruleId)).toEqual(['color-contrast', 'label']);
    });

    it('needsReviewOf keeps only cantTell poster', () => {
        const nr = needsReviewOf(reports);
        expect(nr.map(r => r.ruleId)).toEqual(['image-alt', 'link-in-text-block']);
    });

    it('the two partitions are complementary and lossless', () => {
        expect(violationsOf(reports).length + needsReviewOf(reports).length).toBe(reports.length);
    });
});
