/**
 * @holmdigital/standards
 * Machine-readable regulatory database for WCAG, EN 301 549 and DOS-lagen
 */

import rulesEn from '../data/rules.en.json';
import rulesSv from '../data/rules.sv.json';
import rulesDe from '../data/rules.de.json';
import rulesFr from '../data/rules.fr.json';
import rulesEs from '../data/rules.es.json';
import ictManualChecksData from '../data/ict-manual-checks.json';

import type {
    ConvergenceRule,
    EN301549Mapping,
    ICTManualCheck,
    ComponentRecommendation,
    HolmDigitalInsight,
    RegulatoryReport,
    WCAGLevel,
    DiggRisk,
    EAAImpact,
    Remediation,
    Testability,
} from './types';

export type {
    ConvergenceRule,
    EN301549Mapping,
    ICTManualCheck,
    ComponentRecommendation,
    HolmDigitalInsight,
    RegulatoryReport,
    WCAGLevel,
    DiggRisk,
    EAAImpact,
    Remediation,
    Testability,
};

function getData(lang: string = 'en'): ConvergenceRule[] {
    switch (lang) {
        case 'sv': return rulesSv as ConvergenceRule[];
        case 'de': return rulesDe as ConvergenceRule[];
        case 'fr': return rulesFr as ConvergenceRule[];
        case 'es': return rulesEs as ConvergenceRule[];
        default: return rulesEn as ConvergenceRule[];
    }
}

/**
 * Get EN 301 549 mapping for a WCAG criteria
 */
export function getEN301549Mapping(wcagCriteria: string, lang: string = 'en'): EN301549Mapping | null {
    const rule = getData(lang).find(
        (r) => r.wcagCriteria === wcagCriteria
    );

    if (!rule) return null;

    return {
        wcagCriteria: rule.wcagCriteria,
        wcagTitle: rule.wcagTitle,
        wcagLevel: rule.wcagLevel,
        en301549Criteria: rule.en301549Criteria,
        en301549Title: rule.en301549Title,
        dosLagenApplies: rule.dosLagenApplies,
        dosLagenReference: rule.dosLagenReference,
    };
}

/**
 * Get DOS-lagen reference for a WCAG criteria
 */
export function getDOSLagenReference(wcagCriteria: string, lang: string = 'en'): string | null {
    const rule = getData(lang).find(
        (r) => r.wcagCriteria === wcagCriteria
    );

    return rule?.dosLagenApplies ? rule.dosLagenReference : null;
}

/**
 * Get all ICT manual checks
 */
export function getICTManualChecklist(): ICTManualCheck[] {
    return ictManualChecksData as ICTManualCheck[];
}

/**
 * Get ICT manual checks for specific category
 */
export function getICTManualChecksByCategory(category: string): ICTManualCheck[] {
    return (ictManualChecksData as ICTManualCheck[]).filter((check) =>
        check.applicableFor.includes(category)
    );
}

/**
 * Get ICT manual checks for specific chapter
 */
export function getICTManualChecksByChapter(chapter: number): ICTManualCheck[] {
    return (ictManualChecksData as ICTManualCheck[]).filter(
        (check) => check.chapter === chapter
    );
}

/**
 * Get recommended component for a rule ID
 */
export function getRecommendedComponent(ruleId: string, lang: string = 'en'): ComponentRecommendation | null {
    const rule = getData(lang).find((r) => r.ruleId === ruleId);

    if (!rule?.remediation.component) return null;

    return {
        component: rule.remediation.component,
        description: rule.remediation.description,
        codeExample: rule.remediation.codeExample || '',
        wcagCriteria: [rule.wcagCriteria],
    };
}

/**
 * Get HolmDigital Insight for a rule ID
 */
export function getHolmDigitalInsight(ruleId: string, lang: string = 'en'): HolmDigitalInsight | null {
    const rule = getData(lang).find((r) => r.ruleId === ruleId);
    return rule?.holmdigitalInsight || null;
}

/**
 * Get full convergence rule
 */
export function getConvergenceRule(ruleId: string, lang: string = 'en'): ConvergenceRule | null {
    return (
        getData(lang).find((r) => r.ruleId === ruleId) || null
    );
}

/**
 * Get all convergence rules
 */
export function getAllConvergenceRules(lang: string = 'en'): ConvergenceRule[] {
    return getData(lang);
}

/**
 * Get convergence rules filtered by WCAG level
 */
export function getConvergenceRulesByLevel(level: WCAGLevel, lang: string = 'en'): ConvergenceRule[] {
    return getData(lang).filter(
        (r) => r.wcagLevel === level
    );
}

/**
 * Get convergence rules filtered by DIGG risk
 */
export function getConvergenceRulesByDiggRisk(
    risk: DiggRisk,
    lang: string = 'en'
): ConvergenceRule[] {
    return getData(lang).filter(
        (r) => r.holmdigitalInsight.diggRisk === risk
    );
}

/**
 * Generate regulatory report for a rule ID
 */
export function generateRegulatoryReport(ruleId: string, lang: string = 'en'): RegulatoryReport | null {
    const rule = getConvergenceRule(ruleId, lang);
    if (!rule) return null;

    return {
        ruleId: rule.ruleId,
        wcagCriteria: rule.wcagCriteria,
        en301549Criteria: rule.en301549Criteria,
        dosLagenReference: rule.dosLagenReference,
        diggRisk: rule.holmdigitalInsight.diggRisk,
        eaaImpact: rule.holmdigitalInsight.eaaImpact,
        remediation: rule.remediation,
        holmdigitalInsight: rule.holmdigitalInsight,
        testability: rule.testability,
    };
}

/**
 * Search for rules based on tags
 */
export function searchRulesByTags(tags: string[], lang: string = 'en'): ConvergenceRule[] {
    return getData(lang).filter((rule) =>
        tags.some((tag) => rule.tags.includes(tag))
    );
}

/**
 * Get all unique tags
 */
export function getAllTags(lang: string = 'en'): string[] {
    const allTags = getData(lang).flatMap((r) => r.tags);
    return Array.from(new Set(allTags)).sort();
}

/**
 * Validate if a WCAG criteria exists in the database
 */
export function isWCAGCriteriaSupported(wcagCriteria: string, lang: string = 'en'): boolean {
    return getData(lang).some(
        (r) => r.wcagCriteria === wcagCriteria
    );
}

/**
 * Get database statistics
 */
export function getDatabaseStats(lang: string = 'en') {
    const rules = getData(lang);
    const ictChecks = ictManualChecksData as ICTManualCheck[];

    return {
        totalRules: rules.length,
        totalICTChecks: ictChecks.length,
        rulesByLevel: {
            A: rules.filter((r) => r.wcagLevel === 'A').length,
            AA: rules.filter((r) => r.wcagLevel === 'AA').length,
            AAA: rules.filter((r) => r.wcagLevel === 'AAA').length,
        },
        rulesByDiggRisk: {
            low: rules.filter((r) => r.holmdigitalInsight.diggRisk === 'low').length,
            medium: rules.filter((r) => r.holmdigitalInsight.diggRisk === 'medium').length,
            high: rules.filter((r) => r.holmdigitalInsight.diggRisk === 'high').length,
            critical: rules.filter((r) => r.holmdigitalInsight.diggRisk === 'critical').length,
        },
        automatedRules: rules.filter((r) => r.testability.automated).length,
        manualRules: rules.filter((r) => r.testability.requiresManualCheck).length,
        pseudoAutomationRules: rules.filter((r) => r.testability.pseudoAutomation).length,
    };
}
