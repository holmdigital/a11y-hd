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

/**
 * Last resort only: the hand-written names, used where `national-laws.json`
 * has nothing to derive from.
 *
 * This is what `ENFORCEMENT_BODIES` and `ENFORCEMENT_BODIES_DETAILED` used to
 * BE, and being hand-written is exactly why they contradicted the data for four
 * countries at once (Intern #63). It is kept, unexported, purely so a country
 * without law data still names someone: today that is only `EU`, which has no
 * entry in `national-laws.json` by design (an EU-level case has no national
 * law key — see Intern #63, "EU-nivån").
 *
 * Do not add to this table to fix a wrong name. Fix the law entry instead; the
 * derivation below will follow it.
 */
const ENFORCEMENT_BODIES_FALLBACK: Record<Country, { wad: string; eaa: string }> = {
    SE: { wad: 'Agency for Digital Government (Digg)', eaa: 'Swedish Post and Telecom Authority (PTS)' },
    NO: { wad: 'Tilsynet for universell utforming av ikt (uu-tilsynet)', eaa: '' },
    DK: { wad: 'Agency for Digital Government (Digitaliseringsstyrelsen)', eaa: 'Danish Safety Technology Authority (Sikkerhedsstyrelsen)' },
    FI: { wad: 'Regional State Administrative Agency for Southern Finland (AVI)', eaa: 'Finnish Transport and Communications Agency (Traficom)' },
    NL: { wad: 'Logius', eaa: 'Authority for Consumers and Markets (ACM)' },
    DE: { wad: 'Federal Monitoring Body for Accessibility of Information Technology (BFIT-Bund)', eaa: 'Federal Network Agency (Bundesnetzagentur)' },
    FR: { wad: 'DINUM (Direction interministérielle du numérique)', eaa: 'DGCCRF (Direction générale de la concurrence, de la consommation et de la répression des fraudes)' },
    ES: { wad: 'Ministry for Digital Transformation and the Civil Service (MPTFP)', eaa: 'Supervisory authority designated by the relevant autonomous community, or by Ceuta or Melilla (Ley 11/2023, art. 27.3)' },
    IE: { wad: 'National Disability Authority (NDA)', eaa: 'Competition and Consumer Protection Commission (CCPC)' },
    IT: { wad: 'Agency for Digital Italy (AgID)', eaa: 'Agency for Digital Italy (AgID)' },
    PT: { wad: 'Administrative Modernization Agency (AMA)', eaa: 'Directorate-General for Consumer Affairs (DGAC)' },
    PL: { wad: 'Ministry of Digitization (Ministerstwo Cyfryzacji)', eaa: 'Office of Competition and Consumer Protection (UOKiK)' },
    GB: { wad: 'Equality and Human Rights Commission (EHRC)', eaa: 'Equality and Human Rights Commission (EHRC)' },
    US: { wad: 'Department of Justice (Civil Rights Division)', eaa: 'Department of Justice (Civil Rights Division)' },
    CA: { wad: 'Accessibility Commissioner (Canadian Human Rights Commission)', eaa: 'Accessibility Commissioner (Canadian Human Rights Commission)' },
    AU: { wad: 'Australian Human Rights Commission (AHRC)', eaa: 'Australian Human Rights Commission (AHRC)' },
    EU: { wad: 'European Commission (DG CNECT)', eaa: 'European Commission (DG JUST)' },
};

/**
 * Intern #63 — the per-sector enforcement bodies, DERIVED from
 * `national-laws.json` instead of hand-written.
 *
 * The hand-written map contradicted the data for four countries at once
 * (`ca-aoda`, `de-bfsg`, `gb-psbar`, `nl-wad`): the same package gave two
 * different answers to "who supervises this", and only one of them was the
 * one a statement actually rendered. Deriving it means the contradiction
 * cannot recur — there is one source.
 *
 * Ordering below matters and is deliberate: the law's own `enforcement` first,
 * then a sourced override for genuine legal absences, then the flat
 * `ENFORCEMENT_BODIES` fallback. An override may only FILL an absence, never
 * shadow a value the data can supply; a test enforces that.
 */

/**
 * Which law's `enforcement` answers for a country and sector.
 *
 * Mirrors `resolveNationalLawReference()`'s own AU/US routing in the engine
 * EXACTLY, so this constant can never contradict the law a statement names.
 *
 * Do NOT replace the AU and US branches with a plain `getNationalLawForSector()`
 * call. AU's candidates prefer `au-dta` (scope 'public') over `au-dda`
 * (scope 'both') because the selector prefers an exact scope match, and Juno
 * ruled 2026-09-11 that `au-dda` is the only binding instrument for Australia
 * in either sector. US carries several parallel federal statutes where
 * `us-508` and `us-ada-title-ii` are both scope 'public', so a generic
 * selector picks whichever sits first in the JSON array rather than whichever
 * was intended.
 */
export function deriveEnforcementLaw(country: Country, sector: Sector): NationalLaw | null {
    if (country === 'AU') {
        return getNationalLaws('AU').find(l => l.euFramework === 'DDA' && l.inForce !== false) ?? null;
    }
    if (country === 'US') {
        // Public goes to Section 508 (GSA), private to ADA Title III (DOJ).
        //
        // Mejas spec skrev grenen som 'ADA filtrerad på scope', men sa samtidigt
        // att US.wad skulle vara GSA 'oförändrad av derivationen'. De två går
        // inte ihop: ADA filtrerad på public ger Title II, alltså DOJ, och GSA
        // hade tyst försvunnit. Avsikten går före koden, och GSA-uppdelningen är
        // dessutom dokumenterad som medveten efter juridisk granskning. Valet på
        // id respektive ramverk-plus-scope är lika deterministiskt som hennes och
        // beror inte på ordningen i JSON-arrayen, vilket var hela hennes poäng.
        if (sector !== 'private') {
            return getNationalLaws('US').find(l => l.id === 'us-508' && l.inForce !== false) ?? null;
        }
        return getNationalLaws('US').find(l => l.euFramework === 'ADA' && l.scope === 'private' && l.inForce !== false) ?? null;
    }
    return getNationalLawForSector(country, sector);
}

/**
 * Countries where NO single authority name can be derived from the law's own
 * `enforcement` field — by the law's design, not as a data gap to be filled
 * later. Every entry needs a primary source and Juno's sign-off in its comment.
 *
 * The accompanying test fails if an entry here covers a country and sector
 * whose law DOES carry `enforcement.authorityName`, so an override can never
 * silently shadow a sourced value.
 */
const ENFORCEMENT_NO_SINGLE_AUTHORITY: Partial<Record<Country, { public?: string; private?: string }>> = {
    // Ley 11/2023 art. 27.3 (Intern #63, Juno, BOE-A-2023-11022 read in full):
    // Spain has no national body — each autonomous community, plus Ceuta and
    // Melilla, designates its own. The art. 28 unidad técnica coordinates and
    // advises those authorities; it does not supervise.
    ES: { private: 'Supervisory authority designated by the relevant autonomous community, or by Ceuta or Melilla (Ley 11/2023, art. 27.3)' },
};

/**
 * Sektorer där myndighetsfältet är avsiktligt TOMT, så att utlåtandet utelämnar
 * hela tillsynssektionen i stället för att namnge någon.
 *
 * Det här är något annat än ENFORCEMENT_NO_SINGLE_AUTHORITY ovan. Ett undantag
 * där säger "namnge det här i stället"; en undertryckning här säger "namnge
 * ingen", och den får därför skugga ett värde datan kan leverera.
 *
 * Intern #23 Fynd B: norsk privat sektor. Skälet är inte att tillsynen är
 * overifierad — UU-tilsynet utövar tillsyn över no-ikt — utan att en
 * tillsynssektion i ett privat utlåtande antyder en rapporteringsplikt en
 * privat aktör inte har. Att fältet är tomt är vad som får motorn att utelämna
 * sektionen helt i stället för att rendera den med hål i.
 *
 * En post här kräver samma sak som ett undantag: ett skäl och någons signatur.
 */
const ENFORCEMENT_SUPPRESSED: Partial<Record<Country, Sector[]>> = {
    NO: ['private'],
};

function deriveEnforcementBody(country: Country, sector: Sector): string {
    if (ENFORCEMENT_SUPPRESSED[country]?.includes(sector)) return '';
    const law = deriveEnforcementLaw(country, sector);
    return law?.enforcement?.authorityName
        ?? ENFORCEMENT_NO_SINGLE_AUTHORITY[country]?.[sector as 'public' | 'private']
        ?? ENFORCEMENT_BODIES_FALLBACK[country][sector === 'private' ? 'eaa' : 'wad'];
}

export const ENFORCEMENT_BODIES_DETAILED: Record<Country, { wad: string; eaa: string }> =
    (Object.keys(ENFORCEMENT_BODIES_FALLBACK) as Country[]).reduce((acc, country) => {
        acc[country] = {
            wad: deriveEnforcementBody(country, 'public'),
            eaa: deriveEnforcementBody(country, 'private'),
        };
        return acc;
    }, {} as Record<Country, { wad: string; eaa: string }>);

/**
 * The single enforcement body for a country, defaulting to the public-sector
 * one. Derived from `ENFORCEMENT_BODIES_DETAILED`, so it cannot drift from it
 * — the two contradicting each other was half of the Intern #63 finding.
 */
export const ENFORCEMENT_BODIES: Record<Country, string> =
    (Object.keys(ENFORCEMENT_BODIES_DETAILED) as Country[]).reduce((acc, country) => {
        // US är det dokumenterade undantaget: den detaljerade WAD-posten är GSA,
        // som administrerar Section 508 för federala myndigheter, men DOJ är den
        // erkända amerikanska tillgänglighetsmyndigheten och det värde den här
        // konstanten burit efter juridisk granskning. Undantaget fanns i den
        // handskrivna tabellen och följer med hit i stället för att tyst tappas.
        acc[country] = country === 'US'
            ? ENFORCEMENT_BODIES_DETAILED.US.eaa
            : ENFORCEMENT_BODIES_DETAILED[country].wad;
        return acc;
    }, {} as Record<Country, string>);

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
    PlainLanguageCopy,
    BusinessImpactLevel,
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
    PlainLanguageCopy,
    BusinessImpactLevel,
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

    // D-03: EN fallback — if the language rule lacks plainLanguage, fetch from EN
    const plainLanguage = rule.plainLanguage
        ?? (lang !== 'en' ? getConvergenceRule(ruleId, 'en')?.plainLanguage : undefined);

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
        plainLanguage,
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

/** En lag gäller en sektor när dess scope är sektorn eller täcker båda. */
function lawCoversSector(law: NationalLaw, sector: Sector): boolean {
    return law.scope === sector || law.scope === 'both' || sector === 'both';
}

/**
 * Get national law by EU framework (WAD or EAA).
 *
 * Intern #64 (M5): `scope` is optional for backwards compatibility, but callers
 * should almost always pass it. Without it this returns the FIRST law carrying
 * the framework — `getNationalLawByFramework('ADA', 'US')` therefore always
 * yields Title II (public) even when the caller wanted the private-sector
 * Title III. The engine was saved only by special-casing US and AU; the trap
 * stayed live in the public API for every other caller, the EAA tracker included.
 *
 * Prefer {@link getNationalLawForSector} when the question is "which law applies
 * to this country and sector" — framework is rarely the right question to ask.
 */
export function getNationalLawByFramework(
    framework: LegalFramework,
    country: Country = 'SE',
    scope?: Sector
): NationalLaw | null {
    const countryLaws = getNationalLaws(country);
    return countryLaws.find(law =>
        law.euFramework === framework && (scope === undefined || lawCoversSector(law, scope))
    ) || null;
}

/**
 * The national law that applies to a country and sector.
 *
 * Intern #64 (M1 + M4): selection goes on country + scope + inForce, NEVER on
 * `euFramework`. The old framework lookup had two failure modes:
 *
 *   - a law with `scope: 'both'` was invisible to the private track unless its
 *     framework happened to be EAA. Norway's forskrift and Canada's ACA both
 *     cover private sector, and both fell through to a lawless fallback phrase.
 *   - a law whose framework is neither WAD nor EAA could never be selected at
 *     all, however right it was for the country.
 *
 * `inForce: false` is excluded unconditionally. A statute that has not entered
 * into force must never be rendered as current law in a document the customer
 * signs off as their own.
 *
 * Sub-national laws are excluded: a province's statute is not the country's
 * answer. Ontario's AODA stays in the data as a provincial law, but rendering
 * it for "Canada" is factually wrong regardless of sector.
 */
export function getNationalLawForSector(country: Country, sector: Sector): NationalLaw | null {
    const candidates = getNationalLaws(country).filter(law =>
        law.inForce === true &&
        law.jurisdiction !== 'subnational' &&
        lawCoversSector(law, sector)
    );
    if (candidates.length === 0) return null;
    // A statute written for exactly this sector is the more precise answer than
    // one that happens to cover both, so prefer it when both exist.
    return candidates.find(l => l.scope === sector) ?? candidates[0];
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
    // Intern #63: `sanctions` is optional since 4.0.0 — Spain's EAA statute
    // carries no penalty range of its own, and France's amount is not
    // established. A law without a range must be skipped, never read as a zero
    // ceiling: that would understate a country's maximum exposure, which is the
    // one direction this function must never be wrong in.
    const laws = getNationalLaws(country).filter(
        (law): law is NationalLaw & { sanctions: Sanction } => law.sanctions !== undefined
    );
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
