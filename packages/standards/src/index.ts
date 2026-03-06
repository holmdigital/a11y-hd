/**
 * @holmdigital/standards
 * Machine-readable regulatory database for WCAG, EN 301 549 and DOS-lagen
 */

import rulesEn from '../data/rules.en.json';
import rulesSv from '../data/rules.sv.json';
import rulesDe from '../data/rules.de.json';
import rulesFr from '../data/rules.fr.json';
import rulesEs from '../data/rules.es.json';
import rulesNl from '../data/rules.nl.json';
import rulesNo from '../data/rules.no.json';
import rulesFi from '../data/rules.fi.json';
import rulesDa from '../data/rules.da.json';
import rulesEnGb from '../data/rules.en-gb.json';
import rulesEnUs from '../data/rules.en-us.json';
import rulesEnCa from '../data/rules.en-ca.json';
import ictManualChecksData from '../data/ict-manual-checks.json';

// EU Legal Framework data
import frameworksData from '../data/legal/frameworks.json';
import nordicAuthoritiesData from '../data/legal/nordic-authorities.json';
import statementToolsData from '../data/legal/statement-tools.json';
import nationalLawsData from '../data/legal/national-laws.json';

export const ENFORCEMENT_BODIES: Record<Country, string> = {
    SE: 'Agency for Digital Government (Digg)',
    NO: 'Norwegian Digitalisation Agency (Digdir)',
    DK: 'Agency for Digital Government (Digitaliseringsstyrelsen)',
    FI: 'Regional State Administrative Agency for Southern Finland (AVI)',
    NL: 'Logius',
    DE: 'Federal Monitoring Body for Accessibility of Information Technology (BFIT-Bund)',
    FR: 'Interministerial Directorate for Digital Affairs (DINUM)',
    ES: 'Ministry for Digital Transformation and the Civil Service (MPTFP)',
    IE: 'National Disability Authority (NDA)',
    IT: 'Agency for Digital Italy (AgID)',
    GB: 'Equality and Human Rights Commission (EHRC)',
    US: 'Department of Justice (Civil Rights Division)',
    CA: 'Accessibility Commissioner (Canadian Human Rights Commission)',
    EU: 'European Commission (DG CNECT)'
};

export const ENFORCEMENT_BODIES_DETAILED: Record<Country, { wad: string; eaa: string }> = {
    SE: { wad: 'Agency for Digital Government (Digg)', eaa: 'Swedish Post and Telecom Authority (PTS)' },
    NO: { wad: 'Norwegian Digitalisation Agency (Digdir)', eaa: 'Norwegian Communications Authority (Nkom)' },
    DK: { wad: 'Agency for Digital Government (Digitaliseringsstyrelsen)', eaa: 'Danish Safety Technology Authority (Sikkerhedsstyrelsen)' },
    FI: { wad: 'Regional State Administrative Agency for Southern Finland (AVI)', eaa: 'Finnish Transport and Communications Agency (Traficom)' },
    NL: { wad: 'Logius', eaa: 'Authority for Consumers and Markets (ACM)' },
    DE: { wad: 'Federal Monitoring Body for Accessibility of Information Technology (BFIT-Bund)', eaa: 'Federal Network Agency (Bundesnetzagentur)' },
    FR: { wad: 'Interministerial Directorate for Digital Affairs (DINUM)', eaa: 'Regulatory Authority for Audiovisual and Digital Communication (Arcom)' },
    ES: { wad: 'Ministry for Digital Transformation and the Civil Service (MPTFP)', eaa: 'Ministry of Consumer Affairs (Ministerio de Consumo)' },
    IE: { wad: 'National Disability Authority (NDA)', eaa: 'Competition and Consumer Protection Commission (CCPC)' },
    IT: { wad: 'Agency for Digital Italy (AgID)', eaa: 'Communications Regulatory Authority (AGCOM)' },
    GB: { wad: 'Equality and Human Rights Commission (EHRC)', eaa: 'Equality and Human Rights Commission (EHRC)' },
    US: { wad: 'Department of Justice (Civil Rights Division)', eaa: 'Department of Justice (Civil Rights Division)' },
    CA: { wad: 'Accessibility Commissioner (Canadian Human Rights Commission)', eaa: 'Accessibility Commissioner (Canadian Human Rights Commission)' },
    EU: { wad: 'European Commission (DG CNECT)', eaa: 'European Commission (DG JUST)' }
};

/**
 * Get the enforcement body name for a country.
 * Defaults to WAD (public sector) enforcement body.
 * Pass sector='private' for EAA enforcement body.
 */
export function getEnforcementBody(country: Country, sector?: 'public' | 'private'): string {
    const detailed = ENFORCEMENT_BODIES_DETAILED[country];
    return sector === 'private' ? detailed.eaa : detailed.wad;
}

import type {
    ConvergenceRule,
    EN301549Mapping,
    ICTManualCheck,
    ComponentRecommendation,
    HolmDigitalInsight,
    RegulatoryReport,
    FailingNode,
    EnrichedReport,
    WCAGLevel,
    DiggRisk,
    EAAImpact,
    Remediation,
    Testability,
    // EU Legal Framework types
    LegalFramework,
    Sector,
    Country,
    LegalContext,
    EUDirective,
    NordicAuthority,
    StatementTool,
    NationalLaw,
    Sanction,
    SectorAuthority,
} from './types';

export type {
    ConvergenceRule,
    EN301549Mapping,
    ICTManualCheck,
    ComponentRecommendation,
    HolmDigitalInsight,
    RegulatoryReport,
    FailingNode,
    EnrichedReport,
    WCAGLevel,
    DiggRisk,
    EAAImpact,
    Remediation,
    Testability,
    // EU Legal Framework types
    LegalFramework,
    Sector,
    Country,
    LegalContext,
    EUDirective,
    NordicAuthority,
    StatementTool,
    NationalLaw,
    Sanction,
    SectorAuthority,
};

function getData(lang: string = 'en'): ConvergenceRule[] {
    const supportedLangs = ['sv', 'de', 'fr', 'es', 'nl', 'no', 'fi', 'da', 'en-gb', 'en-us', 'en-ca', 'en'];
    if (!supportedLangs.includes(lang.toLowerCase())) {
        console.warn(`[standards] Language '${lang}' not supported, falling back to 'en'. Supported: ${supportedLangs.join(', ')}`);
    }
    switch (lang.toLowerCase()) {
        case 'sv': return rulesSv as ConvergenceRule[];
        case 'de': return rulesDe as ConvergenceRule[];
        case 'fr': return rulesFr as ConvergenceRule[];
        case 'es': return rulesEs as ConvergenceRule[];
        case 'nl': return rulesNl as ConvergenceRule[];
        case 'no': return rulesNo as ConvergenceRule[];
        case 'nb': return rulesNo as ConvergenceRule[]; // Alias for NO
        case 'fi': return rulesFi as ConvergenceRule[];
        case 'da': return rulesDa as ConvergenceRule[];
        case 'dk': return rulesDa as ConvergenceRule[]; // Alias for DK
        case 'en-gb': return rulesEnGb as ConvergenceRule[];
        case 'en-us': return rulesEnUs as ConvergenceRule[];
        case 'en-ca': return rulesEnCa as ConvergenceRule[];
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

// ============================================
// EU Legal Framework Functions
// ============================================

/**
 * Get rules filtered by EU legal framework (WAD or EAA)
 */
export function getRulesByFramework(
    framework: LegalFramework,
    lang: string = 'en'
): ConvergenceRule[] {
    return getData(lang).filter((rule) =>
        rule.legalContext?.appliesTo?.includes(framework) ||
        rule.tags.includes(framework)
    );
}

/**
 * Get rules filtered by sector (public, private, or both)
 */
export function getRulesBySector(
    sector: Sector,
    lang: string = 'en'
): ConvergenceRule[] {
    return getData(lang).filter((rule) => {
        if (rule.legalContext?.sectors) {
            return rule.legalContext.sectors.includes(sector) ||
                rule.legalContext.sectors.includes('both');
        }
        // Fallback to tag-based filtering
        return rule.tags.includes(`${sector}-sector`);
    });
}

/**
 * Get all EU legal frameworks
 */
export function getLegalFrameworks(): Record<string, EUDirective> {
    return frameworksData.frameworks as unknown as Record<string, EUDirective>;
}

/**
 * Get specific legal framework by ID
 */
export function getLegalFramework(id: LegalFramework): EUDirective | null {
    const frameworks = frameworksData.frameworks as Record<string, unknown>;
    return (frameworks[id] as EUDirective) || null;
}

/**
 * Get all Nordic authorities
 */
export function getNordicAuthorities(): NordicAuthority[] {
    return nordicAuthoritiesData.authorities as NordicAuthority[];
}

/**
 * Get Nordic authority by ID
 */
export function getNordicAuthority(id: string): NordicAuthority | null {
    const authority = nordicAuthoritiesData.authorities.find(
        (a: { id: string }) => a.id === id
    );
    return (authority as NordicAuthority) || null;
}

/**
 * Get Nordic authorities by country
 */
export function getNordicAuthoritiesByCountry(country: Country): NordicAuthority[] {
    return nordicAuthoritiesData.authorities.filter(
        (a: { country: string }) => a.country === country
    ) as NordicAuthority[];
}

/**
 * Get all accessibility statement tools
 */
export function getStatementTools(): StatementTool[] {
    return statementToolsData.tools as StatementTool[];
}

/**
 * Get statement tools by country
 */
export function getStatementToolsByCountry(country: Country): StatementTool[] {
    return statementToolsData.tools.filter(
        (t: { country?: string; international?: boolean }) =>
            t.country === country || t.international
    ) as StatementTool[];
}

/**
 * Get rules with EAA deadline
 */
export function getEAADeadlineRules(lang: string = 'en'): ConvergenceRule[] {
    return getData(lang).filter((rule) =>
        rule.legalContext?.eaaDeadline !== undefined
    );
}

// ============================================
// National Laws & Sanctions API
// ============================================

/**
 * Get all national laws for a country
 */
export function getNationalLaws(country: Country): NationalLaw[] {
    const countryLaws = (nationalLawsData.laws as Record<string, NationalLaw[]>)[country];
    return countryLaws || [];
}

/**
 * Get a specific national law by ID
 */
export function getNationalLaw(id: string, country: Country = 'SE'): NationalLaw | null {
    const countryLaws = getNationalLaws(country);
    return countryLaws.find(law => law.id === id) || null;
}

/**
 * Get national law by EU framework (WAD or EAA)
 */
export function getNationalLawByFramework(
    framework: LegalFramework,
    country: Country = 'SE'
): NationalLaw | null {
    const countryLaws = getNationalLaws(country);
    return countryLaws.find(law => law.euFramework === framework) || null;
}

/**
 * Get sanctions information for a specific law
 */
export function getSanctions(lawId: string, country: Country = 'SE'): Sanction | null {
    const law = getNationalLaw(lawId, country);
    return law?.sanctions || null;
}

/**
 * Get maximum potential sanction amount for a country
 */
export function getMaxSanction(country: Country = 'SE'): { law: string; amount: number; currency: string } | null {
    const laws = getNationalLaws(country);
    if (laws.length === 0) return null;

    const maxLaw = laws.reduce((max, current) =>
        current.sanctions.maxAmount > max.sanctions.maxAmount ? current : max
    );

    return {
        law: maxLaw.law,
        amount: maxLaw.sanctions.maxAmount,
        currency: maxLaw.sanctions.currency
    };
}

/**
 * Get all sector-specific authorities for EAA enforcement
 */
export function getSectorAuthorities(country: Country = 'SE'): SectorAuthority[] {
    const eaaLaw = getNationalLawByFramework('EAA', country);
    return eaaLaw?.sectorAuthorities || [];
}
