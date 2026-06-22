import type { EnrichedReport, BusinessImpactLevel } from '@holmdigital/standards';

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

export interface ImpactBreakdownEntry {
    level: BusinessImpactLevel;
    /** Number of findings at this impact level (counted per occurrence). */
    count: number;
}

/**
 * KRAV 4: per-impact-level breakdown for the intro line ("7 hinder: 6
 * Försämrar upplevelsen, 1 Värt att putsa").
 *
 * Counted PER OCCURRENCE (not per grouped card), so the sub-totals sum to the
 * total finding count. Returns only levels that actually have findings, ordered
 * by business impact (same order as the cards). `levelOf` and `order` are
 * passed in so the terminal and PDF renderers reuse their own (identical) impact
 * logic and stay consistent.
 */
export function impactBreakdown(
    reports: readonly EnrichedReport[],
    levelOf: (report: EnrichedReport) => BusinessImpactLevel,
    order: Record<BusinessImpactLevel, number>
): ImpactBreakdownEntry[] {
    const counts = new Map<BusinessImpactLevel, number>();
    for (const report of reports) {
        const level = levelOf(report);
        counts.set(level, (counts.get(level) ?? 0) + 1);
    }
    return [...counts.entries()]
        .map(([level, count]) => ({ level, count }))
        .sort((a, b) => (order[a.level] ?? 4) - (order[b.level] ?? 4));
}
