import type { EnrichedReport } from '@holmdigital/standards';

/**
 * "Needs review" (internt `cantTell`): poster burna från axes `incomplete` som
 * axe inte kunde avgöra. De ligger i `ScanResult.reports` (KRAV-3, Intern #12)
 * men får ALDRIG presenteras eller räknas som fel. Renderarna använder dessa
 * hjälpare för att skilja verkliga violations från needs review-poster.
 */
export const isNeedsReview = (report: EnrichedReport): boolean => report.cantTell === true;

/** Endast verkliga fel (allt utom needs review). Använd i violations-listor/räkningar. */
export const violationsOf = (reports: EnrichedReport[]): EnrichedReport[] =>
    reports.filter((r) => !isNeedsReview(r));

/** Endast needs review-poster (cantTell). Presenteras som egen kategori, aldrig som fel. */
export const needsReviewOf = (reports: EnrichedReport[]): EnrichedReport[] =>
    reports.filter(isNeedsReview);
