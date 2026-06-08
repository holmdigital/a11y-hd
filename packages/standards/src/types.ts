/**
 * TypeScript types for @holmdigital/standards
 */

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type WCAGVersion = '2.0' | '2.1' | '2.2';
export type DiggRisk = 'low' | 'medium' | 'high' | 'critical';
export type EAAImpact = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type TestComplexity = 'simple' | 'moderate' | 'complex';

// EU Legal Framework types
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
    lawUrl?: string;
    enforcement: {
        authority: string;
        authorityName: string;
        responsibility: string;
        website: string;
    };
    sectorAuthorities?: SectorAuthority[];
    sanctions: Sanction;
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
    /** Statutory exemptions that remove an organisation from the law's scope entirely. */
    exemptions?: {
        microbusiness?: MicrobusinessExemption;
    };
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
