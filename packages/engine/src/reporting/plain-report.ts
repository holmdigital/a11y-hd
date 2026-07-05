import chalk from 'chalk';
import type { EnrichedReport, BusinessImpactLevel } from '@holmdigital/standards';
import { ScanResult } from '../core/regulatory-scanner';
import { t, setLanguage, getCurrentLang } from '../i18n';
import { groupReportsByRule, impactBreakdown } from './plain-group';
import { languageDisplayName } from './plain-language-support';

/**
 * Impact sort order: lower number = higher priority.
 * D-04: stoppar-kop > hindrar > forsamrar > putsning
 */
const IMPACT_ORDER: Record<BusinessImpactLevel, number> = {
    'stoppar-kop': 0,
    'hindrar': 1,
    'forsamrar': 2,
    'putsning': 3,
};

/**
 * Fallback derivation from DIGG risk for rules without explicit impactLevel (D-10.4).
 * Used when report.plainLanguage is undefined.
 */
const RISK_TO_IMPACT: Record<string, BusinessImpactLevel> = {
    critical: 'stoppar-kop',
    high: 'hindrar',
    medium: 'forsamrar',
    low: 'putsning',
};

/**
 * Chalk color mapper for each impact level badge.
 * stoppar-kop → red bold (most severe)
 * hindrar     → red
 * forsamrar   → yellow
 * putsning    → gray
 */
const BADGE_CHALK: Record<BusinessImpactLevel, typeof chalk> = {
    'stoppar-kop': chalk.red.bold,
    'hindrar': chalk.red,
    'forsamrar': chalk.yellow,
    'putsning': chalk.gray,
};

/**
 * Maps BusinessImpactLevel to the t() key for the badge clear-text (D-01).
 * No Swedish or English literals in this file — all via t().
 */
const BADGE_KEY: Record<BusinessImpactLevel, 'plain.badge_stoppar_kop' | 'plain.badge_hindrar' | 'plain.badge_forsamrar' | 'plain.badge_putsning'> = {
    'stoppar-kop': 'plain.badge_stoppar_kop',
    'hindrar': 'plain.badge_hindrar',
    'forsamrar': 'plain.badge_forsamrar',
    'putsning': 'plain.badge_putsning',
};

/**
 * Derive the effective BusinessImpactLevel for a report.
 * Reads report.plainLanguage directly — no secondary standards lookup (D-03).
 * Falls back via RISK_TO_IMPACT when plainLanguage is absent.
 */
function levelOf(report: EnrichedReport): BusinessImpactLevel {
    return report.plainLanguage?.impactLevel
        ?? RISK_TO_IMPACT[report.holmdigitalInsight.diggRisk]
        ?? 'putsning';
}

/**
 * Render the plain-language terminal report for non-technical recipients.
 *
 * Reads report.plainLanguage directly (D-03: no getConvergenceRule or standards
 * lookup at print time). Sorts by business impact descending (D-04). All human-
 * readable chrome goes through t() — no hardcoded Swedish or English string
 * literals in this file (D-01). No compliance score printed (D-05).
 *
 * @param result - ScanResult with plainLanguage populated at enrichment time (plan 02)
 * @param lang   - Language code; passed to setLanguage() before rendering
 */
export function renderPlainReport(result: ScanResult, lang: string = 'en', plainFallbackFrom?: string): void {
    setLanguage(lang);

    // Fallback notice: --plain was requested in a language we do not yet cover,
    // so the report is served in English (the floor) instead of being refused.
    if (plainFallbackFrom) {
        console.log(chalk.yellow(t('plain.gate_fallback', { lang: languageDisplayName(plainFallbackFrom) })));
        console.log('');
    }

    if (result.reports.length === 0) {
        console.log(t('plain.empty_state'));
        console.log('');
        console.log(t('plain.attribution'));
        return;
    }

    // KRAV 1: collapse findings of the same rule into one card with an
    // occurrence count, then sort the groups by business impact (0 = first).
    const sortedGroups = groupReportsByRule(result.reports as EnrichedReport[]).sort((a, b) => {
        const aLevel = IMPACT_ORDER[levelOf(a.report)] ?? 4;
        const bLevel = IMPACT_ORDER[levelOf(b.report)] ?? 4;
        return aLevel - bLevel;
    });

    // Intro count stays the TOTAL number of findings (a group can hold many),
    // so "Hittade 9 hinder" still reflects every barrier on the page.
    const count = result.reports.length;
    const unit = count === 1
        ? t('plain.intro_unit_singular')
        : t('plain.intro_unit_plural');

    // KRAV 4: per-impact-level breakdown, counted per occurrence so the
    // sub-totals sum to the total in "Hittade N hinder". Only levels with
    // findings, ordered by business impact, badge labels via t().
    const breakdown = impactBreakdown(result.reports as EnrichedReport[], levelOf, IMPACT_ORDER);
    const breakdownText = breakdown
        .map(b => `${b.count} ${t(BADGE_KEY[b.level])}`)
        .join(', ');

    // Opening chrome
    console.log(t('plain.intro_framing'));
    console.log(t('plain.intro_found', { count, unit }));
    console.log(`${count} ${unit}: ${breakdownText}`);
    console.log(t('plain.sorted_by'));
    console.log('');

    const isSwedish = getCurrentLang() === 'sv';

    // One row per rule — business-first field order (D-04)
    sortedGroups.forEach((group, index) => {
        const report = group.report;
        const level = levelOf(report);
        const badgeText = BADGE_CHALK[level](t(BADGE_KEY[level]));
        const pl = report.plainLanguage;
        const occurrences = group.count > 1
            ? `, ${t('plain.occurrences', { count: group.count })}`
            : '';

        // KRAV 3: primary heading is the Swedish plain-language headline when
        // present; the raw axe ruleId stays as a small parenthetical technical
        // reference. Falls back to the bare ruleId only when no headline exists.
        const heading = pl?.headline
            ? `${pl.headline} (${report.ruleId})`
            : report.ruleId;
        console.log(`${index + 1}. ${badgeText}: ${heading}${occurrences}`);

        if (pl) {
            // Five business-first fields from plainLanguage (D-04)
            console.log(`   ${t('plain.what_happens')} ${pl.whatHappens}`);
            console.log(`   ${t('plain.who_is_affected')} ${pl.whoIsAffected}`);
            console.log(`   ${t('plain.business_impact')} ${pl.businessImpact}`);
            console.log(`   ${t('plain.how_to_fix')} ${pl.howToFix}`);
        } else if (isSwedish) {
            // KRAV 3-short: never leak axe-core's raw English help into a
            // Swedish report body. The ruleId is already on the header line.
            console.log(`   ${t('plain.fallback_framing')}`);
        } else {
            // Other locales keep the raw technical description (an English
            // report shows English detail; full localisation is KRAV 3 long-term).
            console.log(`   ${t('plain.fallback_framing')} ${report.remediation.description}`);
        }

        console.log('');
    });

    // Closing chrome
    console.log(t('plain.closing'));
    console.log('');
    console.log(t('plain.attribution'));
}
