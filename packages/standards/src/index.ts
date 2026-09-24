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
    // Intern #63 A2: AVI var fel. 12 § i lag 306/2019, efter ändringen 606/2024,
    // ger Transport- och kommunikationsverket tillsyn över BÅDA kapitlen, alltså
    // både offentliga (3 kap.) och privata (3 a kap.) digitala tjänster. Raden är
    // död kod för Finland sedan derivationen, men en död rad med fel uppgift är
    // en fälla för nästa läsare.
    FI: { wad: 'Finnish Transport and Communications Agency (Traficom)', eaa: 'Finnish Transport and Communications Agency (Traficom)' },
    NL: { wad: 'Logius', eaa: 'Authority for Consumers and Markets (ACM)' },
    DE: { wad: 'Federal Monitoring Body for Accessibility of Information Technology (BFIT-Bund)', eaa: 'Federal Network Agency (Bundesnetzagentur)' },
    FR: { wad: 'DINUM (Direction interministérielle du numérique)', eaa: 'DGCCRF (Direction générale de la concurrence, de la consommation et de la répression des fraudes)' },
    ES: { wad: 'Ministry for Digital Transformation and the Civil Service (MPTFP)', eaa: 'Supervisory authority designated by the relevant autonomous community, or by Ceuta or Melilla (Ley 11/2023, art. 27.3)' },
    IE: { wad: 'National Disability Authority (NDA)', eaa: 'Competition and Consumer Protection Commission (CCPC)' },
    IT: { wad: 'Agency for Digital Italy (AgID)', eaa: 'Agency for Digital Italy (AgID)' },
    PT: { wad: 'Administrative Modernization Agency (AMA)', eaa: 'Sector supervisory authority under Decreto-Lei n.º 82/2022, art. 28.º' },
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
 * Mirrors `resolveNationalLawReference()`'s own US routing in the engine
 * EXACTLY, so this constant can never contradict the law a statement names.
 *
 * Do NOT replace the US branch with a plain `getNationalLawForSector()` call.
 * US carries several parallel federal statutes where `us-508` and
 * `us-ada-title-ii` are both scope 'public', so a generic selector picks
 * whichever sits first in the JSON array rather than whichever was intended.
 *
 * Intern #68: Australia no longer needs a branch. It had one only because the
 * Digital Access Standard entry (scope 'public') won the selector's
 * exact-scope preference over `au-dda` (scope 'both'); with the Standard out
 * of the law data, the generic selector gives `au-dda` in both sectors on its
 * own. Two hand-kept mirrors that could drift apart are gone.
 */
export function deriveEnforcementLaw(country: Country, sector: Sector): NationalLaw | null {
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
    // Decreto-Lei n.º 82/2022 artigo 28.º n.º 1 (Intern #63/#66, Juno, Diário da
    // República 1.ª série N.º 234 read in full): Portugal has no single
    // supervisory body either — fiscalização is split by sector under art.
    // 28.º n.º 1 (ANACOM, ERC, AMT, ANAC, IMT, Banco de Portugal, CMVM, ASAE,
    // the municipalities and IGAC). INR, I. P. is responsible for
    // acompanhamento and monitorização, NOT fiscalização, and must never be
    // named here as though it supervised.
    //
    // NO COUNT IS ASSERTED, deliberately. This string said "nine bodies by
    // sector" and the comment above it listed TEN names — the number came from
    // the source text handed to me (Intern #63, "nio sektorsorgan" followed by
    // ten names) and I built it faithfully. Art. 28.º n.º 1 has nine alíneas,
    // but alínea c) names two authorities, so "nine bodies" is wrong while
    // "nine paragraphs" would be right. Rather than pick a number for a legal
    // text I cannot read, the claim is dropped: naming the article is enough,
    // and it cannot be wrong. Add a count back only with Juno's wording.
    PT: { private: 'Sector supervisory authority designated by sector under Decreto-Lei n.º 82/2022, art. 28.º (INR, I. P. monitors but does not supervise)' },
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
    StatutoryExemption,
    Attestation,
    AttestableField,
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
    StatutoryExemption,
    Attestation,
    AttestableField,
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
 * Intern #82 — lagnamnsgrinden.
 *
 * Ett lagnamn skrivs ut bara om någon gått i god för just det namnet mot
 * primärkälla (Karin 2026-09-12), annars fallback-frasen. Grinden läser
 * `attested` och inget annat. `attestation !== undefined` räcker INTE: ett
 * block med tom `attested` är en spärr, inte ett godkännande. Och bara en
 * granskning av själva lagposten kan öppna den; en granskning av en
 * myndighetsnyckel eller av en post som inte finns kan det aldrig.
 */
export function isNameAttested(law?: Pick<NationalLaw, 'attestation'> | null): boolean {
    const a = law?.attestation;
    return a?.subject === 'law-entry' && a.attested.includes('lagnamn');
}

/**
 * Språknycklad fallback för lagplatsen i ett utlåtande.
 *
 * Intern #31: ett utlåtande får ALDRIG rendera en tom lagreferens. När ingen
 * lag kan namnges skrivs meningen om så att den är sann utan lagnamn, aldrig
 * genom att hitta på ett och aldrig genom att kalla ett EU-direktiv för ett
 * lands nationella lag.
 *
 * Intern #82: flyttad hit från motorn, där komponenten bar en ordagrann kopia.
 * Två kopior av samma logik gled isär en gång redan (Intern #63/#66, där
 * komponenten bar hela #64:s defektuppsättning efter att motorn lagats), och
 * grinden hade annars behövt byggas två gånger och hållas lika för hand.
 *
 * Varje fras står i den form lagplatsens meningar kräver (a11y-hd#213): dativ
 * på tyska, instrumentalis på polska, genitiv på finska, och utan artikel på
 * italienska och portugisiska, där mallen redan har prepositionen. Den finska
 * frasen betyder "tillämplig tillgänglighetslagstiftning", eftersom genitiv av
 * "tillämpliga tillgänglighetskrav" gav "kraven i kraven" i en av meningarna.
 * Juno godkände den 2026-09-24 (Intern #94 fråga 5), med förbehållet att en
 * modersmålstalare ser över den innan grinden tänds för Finland.
 */
export const NATIONAL_LAW_FALLBACK: Readonly<Record<string, string>> = Object.freeze({
    en: 'applicable accessibility requirements',
    sv: 'gällande tillgänglighetskrav',
    no: 'gjeldende tilgjengelighetskrav',
    da: 'gældende tilgængelighedskrav',
    fi: 'sovellettavan saavutettavuuslainsäädännön',
    de: 'den geltenden Barrierefreiheitsanforderungen',
    nl: 'de geldende toegankelijkheidseisen',
    fr: "la réglementation d'accessibilité applicable",
    es: 'los requisitos de accesibilidad aplicables',
    it: 'requisiti di accessibilità applicabili',
    pt: 'requisitos de acessibilidade aplicáveis',
    pl: 'obowiązującymi wymaganiami dostępności',
});

/**
 * Intern #63/#66: parentesen finns för att ge kortnamnet vid sidan av det
 * långa, och faller när kortnamnet är ett PREFIX av det långa, för då bär den
 * ingen ny information. `dk-eaa` bär titeln i båda fälten och `ca-aca`:s
 * fullName är korttiteln plus lagrumsreferens; utan regeln renderades titeln
 * två gånger i rad i ett danskt kunddokument, och det syntes inte i någon
 * datadiff. DOS-lagen och DL 83/2018 är inga prefix och står därför kvar.
 *
 * Intern #82: motorns US-gren gick förbi regeln och skrev "Section 508 of the
 * Rehabilitation Act of 1973 (Section 508)", medan komponenten skrev samma rad
 * utan parentes. Nu går varje namnväg genom den här funktionen.
 */
function lawPhrase(law: NationalLaw): string {
    const shortName = law.law.trim();
    const longName = law.fullName.trim();
    return longName === shortName || longName.startsWith(shortName)
        ? longName
        : `${longName} (${shortName})`;
}

/**
 * Lagreferensen i ett utlåtandes "uppfyller …"-mening, för land och sektor.
 * Returnerar aldrig tom sträng.
 *
 * Varje väg som kan returnera ett lagnamn går genom lagnamnsgrinden
 * (`isNameAttested`), också särfallet för US. Faller en enda väg igenom
 * grinden är den verkningslös; det är samma felklass som mallarna som gick
 * förbi lagvalet i Intern #64.
 *
 * Används av både motorn och komponenten, så ett utlåtande säger samma sak
 * oavsett vilket verktyg som genererade det.
 */
export function resolveNationalLawReference(
    country: Country,
    sector: 'public' | 'private',
    lang: string = 'en'
): string {
    // Intern #64 (M4): en författning som inte trätt i kraft får aldrig
    // renderas som gällande rätt. `us-hhs-section-504` (ikraft 2027-05-11)
    // namngavs som bindande lag för amerikansk privat sektor.
    const inForce = (law: NationalLaw | undefined | null): law is NationalLaw =>
        !!law && law.inForce !== false;
    const named = (laws: Array<NationalLaw | undefined | null>): string | null => {
        const vouched = laws.filter((l): l is NationalLaw => inForce(l) && isNameAttested(l));
        return vouched.length > 0 ? vouched.map(lawPhrase).join(' & ') : null;
    };

    // Intern #68: Australien har ingen egen gren längre. Den fanns bara för att
    // Digital Access Standard (scope 'public') vann väljarens företräde för
    // exakt scope över Disability Discrimination Act (scope 'both'). Med
    // standarden borta ur datan ger väljaren nedan lagen i båda sektorerna.
    let phrase: string | null;
    if (country === 'US' && getNationalLaws('US').some(l => l.euFramework === 'ADA' && l.scope === sector && inForce(l))) {
        // US bär flera parallella federala författningar: ADA delad på scope,
        // Section 508 på offentliga sidan och HHS Section 504 på privata.
        // Varje lag i kombinationen prövas mot grinden var för sig, så en
        // obelagd lag faller bort utan att dra med sig en belagd.
        const usLaws = getNationalLaws('US').filter(inForce);
        const adaLaw = usLaws.find(l => l.euFramework === 'ADA' && l.scope === sector);
        const companion = sector === 'public'
            ? usLaws.find(l => l.id === 'us-508')
            : usLaws.find(l => l.euFramework === 'REHAB' && l.scope === 'private');
        phrase = named([adaLaw, companion]);
    } else {
        // Intern #64 (M1): land + scope + inForce, aldrig `euFramework`.
        phrase = named([getNationalLawForSector(country, sector)]);
    }
    if (phrase) return phrase;

    const langKey = lang.split('-')[0];
    return NATIONAL_LAW_FALLBACK[langKey] ?? NATIONAL_LAW_FALLBACK.en;
}

/**
 * Intern #63 punkt 4 — hitta en lagpost på id, oavsett land.
 *
 * `getNationalLaw(id, country = 'SE')` defaultar till Sverige, så
 * `getNationalLaw('de-bfsg')` returnerar `null` i stället för ett fel: en
 * validering skriven som "finns lagrummet, ja eller nej" som glömmer
 * landparametern underkänner varje utländsk rad, tyst. Meja kallade det den
 * enskilt mest sannolika buggen i en kommande tracker-koppling.
 *
 * Den här funktionen tar inget land och kan därför inte glömmas. Landet följer
 * med i svaret, eftersom en anropare som slår upp på id nästan alltid behöver
 * veta vilket land posten hörde till.
 */
export function findNationalLaw(id: string): (NationalLaw & { country: Country }) | null {
    for (const [country, laws] of Object.entries(nationalLawsData.laws)) {
        const match = (laws as NationalLaw[]).find(law => law.id === id);
        if (match) return { ...match, country: country as Country };
    }
    return null;
}

/**
 * Intern #63 punkt 4 — hela lagmängden, med land påhängt på varje post.
 *
 * Utan den här gick det inte att fråga paketet "ge mig alla lagar", till
 * exempel för en rullgardinsmeny. Alternativet var att importera datafilen
 * direkt via `exports`-blockets `"./data/*"`, men då kringgås den typade ytan
 * och versionsgarantin.
 *
 * Ordningen följer datafilen: länderna i sin nyckelordning, lagarna i sin
 * arrayordning. Förlita dig inte på den: att två australiska poster låg i en
 * viss ordning var precis en sådan tyst ordningsberoende som gav en latent bugg
 * i `getNationalLawByFramework` (Intern #63).
 */
export function getAllNationalLaws(): Array<NationalLaw & { country: Country }> {
    const out: Array<NationalLaw & { country: Country }> = [];
    for (const [country, laws] of Object.entries(nationalLawsData.laws)) {
        for (const law of laws as NationalLaw[]) {
            out.push({ ...law, country: country as Country });
        }
    }
    return out;
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
    //
    // Intern #66: that filter had a hole, and the hole defeated its own purpose.
    // It skipped only `sanctions === undefined`, while SIXTEEN entries carry a
    // DECLARED `maxAmount: 0` meaning "no figure recorded". Seven countries
    // therefore answered that their maximum exposure was literally zero: FI, NO,
    // DK, GB, AU, PT and PL. A declared zero is a stronger false claim than a
    // missing field, because it reads as a measured ceiling.
    //
    // A statute with a genuine zero maximum penalty does not exist, so treating
    // 0 as "no stated ceiling" is safe and matches how the data actually uses it.
    // This is a stopgap: the real fix is the `amounts` discriminated union with
    // an explicit `maxStatus`, specced in Intern #63 and gated to the next major.
    const laws = getNationalLaws(country).filter(
        (law): law is NationalLaw & { sanctions: Sanction } =>
            law.sanctions !== undefined &&
            typeof law.sanctions.maxAmount === 'number' &&
            law.sanctions.maxAmount > 0
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
