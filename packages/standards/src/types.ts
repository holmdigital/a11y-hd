/**
 * TypeScript types for @holmdigital/standards
 */

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type WCAGVersion = '2.0' | '2.1' | '2.2';
export type DiggRisk = 'low' | 'medium' | 'high' | 'critical';
export type EAAImpact = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type TestComplexity = 'simple' | 'moderate' | 'complex';

// EU Legal Framework types
export type LegalFramework = 'WAD' | 'EAA';
export type Sector = 'public' | 'private' | 'both';
export type Country = 'SE' | 'NO' | 'DK' | 'FI' | 'NL' | 'DE' | 'FR' | 'ES' | 'IE' | 'GB' | 'US' | 'CA' | 'EU';

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
    swedishInterpretation?: string;
    [key: string]: any; // Allow for other languages interpretations
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
}
