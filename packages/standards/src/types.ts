/**
 * TypeScript types for @holmdigital/standards
 */

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type WCAGVersion = '2.0' | '2.1' | '2.2';
export type DiggRisk = 'low' | 'medium' | 'high' | 'critical';
export type BusinessImpactLevel = 'stoppar-kop' | 'hindrar' | 'forsamrar' | 'putsning';
export type EAAImpact = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type TestComplexity = 'simple' | 'moderate' | 'complex';

// EU Legal Framework types
/**
 * The regulatory family a national law belongs to.
 *
 * Intern #68 (5.0.0): the Digital Access Standard's framework code is removed,
 * together with the only entry that carried it. Juno's rule, which applies
 * going forward: an entry belongs in `national-laws.json` only if a binding
 * legal instrument makes compliance mandatory and enforceable against the
 * party that bears the obligation. The Standard is an internal Commonwealth
 * policy: binding on agencies through their own government's investment
 * oversight, but with no statute, no third-party standing, no supervisory
 * authority outside the DTA and no route to a court.
 */
export type LegalFramework = 'WAD' | 'EAA' | 'DDA' | 'ADA' | 'REHAB' | 'ACA';
export type Sector = 'public' | 'private' | 'both';
export type Country = 'SE' | 'NO' | 'DK' | 'FI' | 'NL' | 'DE' | 'FR' | 'ES' | 'IE' | 'IT' | 'PT' | 'PL' | 'GB' | 'US' | 'CA' | 'AU' | 'EU';

/**
 * Convergence Schema Rule
 * Mappar WCAG → EN 301 549 → DOS-lagen med regulatorisk metadata
 */
export interface ConvergenceRule {
    ruleId: string;
    wcagCriteria: string;
    wcagLevel: WCAGLevel;
    wcagTitle: string;
    wcagVersion: WCAGVersion;
    en301549Criteria: string;
    en301549Title: string;
    en301549Chapter: number;
    dosLagenApplies: boolean;
    dosLagenReference: string;
    remediation: Remediation;
    holmdigitalInsight: HolmDigitalInsight;
    testability: Testability;
    tags: string[];
    // EU Legal Framework context (optional for backward compatibility)
    legalContext?: LegalContext;
    // Plain-language copy for non-technical recipients (klarspråksläge)
    plainLanguage?: PlainLanguageCopy;
}

/**
 * Åtgärdsinformation
 */
export interface Remediation {
    description: string;
    technicalGuidance: string;
    component?: string | null;
    codeExample?: string;
    wcagTechnique?: string[];
}

/**
 * HolmDigital expertanalys och riskbedömning
 */
export interface HolmDigitalInsight {
    diggRisk: DiggRisk;
    eaaImpact: EAAImpact;
    // Locale-specific interpretation fields (from all 12 locale JSON files)
    swedishInterpretation?: string;
    norwegianInterpretation?: string;
    danishInterpretation?: string;
    finnishInterpretation?: string;
    dutchInterpretation?: string;
    germanInterpretation?: string;
    frenchInterpretation?: string;
    spanishInterpretation?: string;
    ukInterpretation?: string;
    usInterpretation?: string;
    canadianInterpretation?: string;
    // Runtime-injected by enrichResults() — not in JSON data files
    reasoning?: string;
    // Static analysis fields (from JSON data)
    commonMistakes?: string[];
    diggPrecedent?: string;
    priorityRationale?: string;
}

/**
 * Testbarhetsinformation
 */
export interface Testability {
    automated: boolean;
    requiresManualCheck: boolean;
    pseudoAutomation: boolean;
    complexity: TestComplexity;
}

/**
 * EN 301 549 mappning
 */
export interface EN301549Mapping {
    wcagCriteria: string;
    wcagTitle: string;
    wcagLevel: WCAGLevel;
    en301549Criteria: string;
    en301549Title: string;
    dosLagenApplies: boolean;
    dosLagenReference: string;
}

/**
 * IKT Manual Check
 */
export interface ICTManualCheck {
    id: string;
    chapter: number;
    title: string;
    description: string;
    applicableFor: string[];
    manualVerification: boolean;
    checklistItem: string;
    swedishGuidance: string;
    diggRelevance: DiggRisk;
    eaaRelevance: EAAImpact;
}

/**
 * Component Recommendation
 */
export interface ComponentRecommendation {
    component: string;
    description: string;
    codeExample: string;
    wcagCriteria: string[];
}

/**
 * Plain-language copy for non-technical recipients (klarspråksläge)
 * All text fields must be free of em/en dashes and percent signs (D-10.2).
 */
export interface PlainLanguageCopy {
    headline: string;
    whatHappens: string;
    whoIsAffected: string;
    businessImpact: string;
    howToFix: string;
    impactLevel: BusinessImpactLevel;
}

/**
 * Regulatory Report
 * Rapport som kombinerar tekniska fel med regulatorisk kontext
 */
export interface RegulatoryReport {
    ruleId: string;
    wcagCriteria: string;
    en301549Criteria: string;
    dosLagenReference: string;
    diggRisk: DiggRisk;
    eaaImpact: EAAImpact;
    remediation: Remediation;
    holmdigitalInsight: HolmDigitalInsight;
    testability: Testability;
    // Plain-language copy for non-technical recipients (klarspråksläge)
    plainLanguage?: PlainLanguageCopy;
}

/**
 * Axe-core node result shape — minimal fields needed for reporting
 * Mirrors axe-core's NodeResult essentials without importing axe-core into standards
 */
export interface FailingNode {
    html: string;
    target: string | string[];
    failureSummary: string;
}

/**
 * Enriched scan report — extends RegulatoryReport with node-level detail
 * and legal context populated at scan time (not from the static rule DB).
 * Both fields are optional: the fallback path in enrichResults() omits them.
 */
export interface EnrichedReport extends RegulatoryReport {
    failingNodes?: FailingNode[];
    legalContext?: LegalContext;
    /**
     * "Needs review" mot användaren, `cantTell` internt. Buren från axes
     * `incomplete`: axe kunde inte avgöra pass/fail, en människa måste
     * kontrollera. Poster med `cantTell === true` MÅSTE exkluderas ur stats,
     * score och complianceStatus (KRAV-3, Intern #12) — de bärs vidare i
     * `reports` så att en verklig brist inte försvinner tyst, men räknas aldrig
     * som fel.
     */
    cantTell?: boolean;
    /**
     * För cantTell-poster: axes `messageKey` (t.ex. `bgOverlap` = bakgrunden
     * kunde inte bestämmas). Läses uttryckligen så att ett mätvärde som
     * `contrastRatio: 0` inte förväxlas med "noll kontrast" (Intern #20).
     */
    reviewReason?: string;
}

// ============================================
// EU Legal Framework Types
// ============================================

/**
 * Legal context for a rule - links to EU directives
 */
export interface LegalContext {
    appliesTo: LegalFramework[];
    sectors: Sector[];
    wadArticle?: string;
    eaaAnnex?: string;
    eaaProductScope?: string[];
    eaaDeadline?: string;
}

/**
 * EU Directive information
 */
export interface EUDirective {
    id: string;
    name: string;
    fullName: string;
    scope: Sector;
    eurLexUrl: string;
    adoptionDate: string;
    transpositionDeadline: string;
    applicationDeadline?: string;
    wcagVersion: WCAGVersion;
    wcagLevel: WCAGLevel;
    technicalStandard: string;
    productScopes?: string[];
    serviceScopes?: string[];
}

/**
 * Nordic authority information
 */
export interface NordicAuthority {
    id: string;
    name: string;
    country: Country;
    scope: Sector;
    framework: LegalFramework;
    website: string;
    monitoringPortal?: string;
    statementTool?: string;
    guidesUrl?: string;
    nationalLaw: string;
    reputation?: string;
    comment?: string;
}

/**
 * Accessibility statement tool
 */
export interface StatementTool {
    id: string;
    name: string;
    provider: string;
    type: 'template' | 'interactive';
    url: string;
    format: string[];
    country?: Country;
    international?: boolean;
    recommended?: boolean;
    legalBasis?: string;
    comment?: string;
}

/**
 * Sanction information for accessibility violations
 */
export interface Sanction {
    type: string;
    description: string;
    minAmount: number;
    maxAmount: number;
    currency: string;
    example?: string;
}

/**
 * Sector-specific authority
 */
export interface SectorAuthority {
    authority: string;
    responsibility: string;
}

/**
 * National law implementation of EU directives
 */
export interface NationalLaw {
    id: string;
    law: string;
    fullName: string;
    euFramework: LegalFramework;
    scope: Sector;
    /**
     * Intern #64: whether the statute speaks for the whole country or only a
     * sub-national unit. Ontario's AODA is a provincial law; rendering it as
     * "Canada's law" is factually wrong however right it is for Ontario.
     *
     * Optional and treated as national when absent, so existing data and
     * consumers are unaffected. Only set `'subnational'` when the statute
     * genuinely belongs to a province, state or Land.
     */
    jurisdiction?: 'national' | 'subnational';
    lawUrl?: string;
    /**
     * Intern #63: OPTIONAL since 4.0.0. It was required, and that was wrong.
     *
     * Spain genuinely has no national supervisory authority for EAA matters —
     * Ley 11/2023 art. 27.3 hands it to each autonomous community and to Ceuta
     * and Melilla, each designating its own. Denmark's is simply not established
     * against primary source yet. Neither may be filled with a plausible-looking
     * body to satisfy a type: a named authority in this field is a claim the
     * customer may act on.
     *
     * Absent means "no single authority, or not established" — never "none
     * exists". Consumers MUST narrow before reading, and must not fall back to
     * another country's authority or to the flat ENFORCEMENT_BODIES constant
     * without saying which they used.
     */
    enforcement?: {
        authority: string;
        authorityName: string;
        responsibility: string;
        website: string;
    };
    sectorAuthorities?: SectorAuthority[];
    /**
     * Intern #63: OPTIONAL since 4.0.0, for the same reason as `enforcement`.
     *
     * Spain's Ley 11/2023 art. 30 carries no penalty range of its own; it defers
     * to the applicable sectoral legislation and then to Title III of RDL
     * 1/2013. France's sanction TYPE is established (a 5th-class contravention
     * under art. R. 451-4 code de la consommation) but no amount is. `Sanction`
     * demands `minAmount`/`maxAmount`, and an invented figure in a compliance
     * product is worse than an honest absence.
     *
     * `getMaxSanction()` skips laws without this field rather than reading a
     * missing range as zero.
     */
    sanctions?: Sanction;
    inForce: boolean;
    effectiveDate: string;
    note?: string;
    /**
     * Tiered compliance deadlines keyed by entity size.
     *
     * Each entry carries exactly one threshold field. Consumers MUST narrow on
     * the threshold key before reading it.
     *
     * - `populationThreshold` — entity-served population (e.g. ADA Title II).
     *   `largeEntity` value is an inclusive lower bound (population >= N qualifies).
     *   `smallEntity` value is an inclusive upper bound (population <= N qualifies).
     * - `employeeThreshold` — recipient headcount (e.g. HHS Section 504).
     *   Same comparator convention as above.
     */
    complianceDeadlines?: {
        largeEntity?: ComplianceDeadlineEntry;
        smallEntity?: ComplianceDeadlineEntry;
    };
    /** Statutory exemptions and carve-outs the law itself grants. */
    exemptions?: {
        microbusiness?: MicrobusinessExemption;
        /**
         * Intern #83: every other exemption the statute grants, one per
         * provision. `microbusiness` keeps its own slot because consumers
         * compute with its thresholds; these are carried as cited text.
         */
        statutory?: StatutoryExemption[];
    };
}

/**
 * One exemption granted by a provision of the law, other than the
 * microbusiness exemption.
 *
 * Intern #83: DOS-lagen has no microbusiness exemption (it binds public
 * actors), but four other carve-outs, and the data carried none of them.
 */
export interface StatutoryExemption {
    /**
     * What the provision carves out:
     * - `actor`: an organisation or class of organisations is outside the law.
     * - `content`: a type of content is outside the requirements.
     * - `disproportionate-burden`: a case-by-case exemption the obliged party must claim.
     * - `transitional`: a requirement applies only from a later date or to newer content.
     */
    kind: 'actor' | 'content' | 'disproportionate-burden' | 'transitional';
    /** Human-readable summary of what the provision exempts (free text). */
    description: string;
    /** Citation to the provision granting the exemption. */
    legalBasis: string;
}

/**
 * One tier of a `NationalLaw.complianceDeadlines` map.
 * Discriminated by the threshold field present.
 */
export type ComplianceDeadlineEntry =
    | { populationThreshold: number; deadline: string; description: string }
    | { employeeThreshold: number; deadline: string; description: string };

/**
 * Microbusiness exemption metadata.
 *
 * Used by EU Member States transposing the European Accessibility Act
 * (Article 4(5) of Directive 2019/882): microenterprises providing services
 * are exempt from accessibility requirements. The "microenterprise" definition
 * comes from Commission Recommendation 2003/361/EC: fewer than `employeeThreshold`
 * persons AND annual turnover or balance sheet at or below `revenueThreshold`.
 *
 * Both conditions must be met cumulatively for the exemption to apply.
 */
export interface MicrobusinessExemption {
    /** Strict less-than: an entity with FEWER than this many employees may qualify. */
    employeeThreshold: number;
    /** Inclusive upper bound: turnover OR balance sheet at or below this value. */
    revenueThreshold: number;
    /** ISO 4217 currency code of `revenueThreshold` (e.g. 'EUR'). */
    revenueCurrency: string;
    /** Which side of the law the exemption covers. EAA exempts services only. */
    appliesTo: 'services' | 'products' | 'both';
    /** Human-readable summary of the exemption (free text). */
    description: string;
    /** Citation to the statutory or directive provision granting the exemption. */
    legalBasis?: string;
}
