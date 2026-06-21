import type { EnrichedReport } from '@holmdigital/standards';

/**
 * KRAV 1 (klarspråk launch fix): collapse a scan's findings to one entry per
 * rule.
 *
 * A single scan often returns many findings of the same axe rule — e.g. five
 * separate `color-contrast` violations. In the plain-language report those must
 * render as ONE card with an occurrence count, never as repeated identical text
 * blocks. Grouping is by `ruleId` across the whole result regardless of the
 * findings' positions, so duplicates that the impact-sort would otherwise
 * scatter still merge. Callers sort the returned groups by business impact.
 *
 * Shared by the terminal renderer (`plain-report.ts`) and the PDF renderer
 * (`html-template.ts`) so both produce identical grouping.
 */
export interface PlainReportGroup {
    /** Representative report for the rule — plainLanguage is identical per rule. */
    report: EnrichedReport;
    /** Number of findings of this ruleId the scan returned (>= 1). */
    count: number;
}

export function groupReportsByRule(reports: readonly EnrichedReport[]): PlainReportGroup[] {
    const groups = new Map<string, PlainReportGroup>();
    for (const report of reports) {
        const existing = groups.get(report.ruleId);
        if (existing) {
            existing.count += 1;
        } else {
            groups.set(report.ruleId, { report, count: 1 });
        }
    }
    return [...groups.values()];
}
