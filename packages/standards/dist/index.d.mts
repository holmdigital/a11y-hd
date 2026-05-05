type WCAGLevel = 'A' | 'AA' | 'AAA';
type WCAGVersion = '2.0' | '2.1' | '2.2';
type DiggRisk = 'low' | 'medium' | 'high' | 'critical';
type EAAImpact = 'none' | 'low' | 'medium' | 'high' | 'critical';
type TestComplexity = 'simple' | 'moderate' | 'complex';
type LegalFramework = 'WAD' | 'EAA' | 'DDA' | 'ADA' | 'REHAB';
type Sector = 'public' | 'private' | 'both';
type Country = 'SE' | 'NO' | 'DK' | 'FI' | 'NL' | 'DE' | 'FR' | 'ES' | 'IE' | 'IT' | 'PT' | 'PL' | 'GB' | 'US' | 'CA' | 'AU' | 'EU';
interface ConvergenceRule {
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
    legalContext?: LegalContext;
}
interface Remediation {
    description: string;
    technicalGuidance: string;
    component?: string | null;
    codeExample?: string;
    wcagTechnique?: string[];
}
interface HolmDigitalInsight {
    diggRisk: DiggRisk;
    eaaImpact: EAAImpact;
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
    reasoning?: string;
    commonMistakes?: string[];
    diggPrecedent?: string;
    priorityRationale?: string;
}
interface Testability {
    automated: boolean;
    requiresManualCheck: boolean;
    pseudoAutomation: boolean;
    complexity: TestComplexity;
}
interface EN301549Mapping {
    wcagCriteria: string;
    wcagTitle: string;
    wcagLevel: WCAGLevel;
    en301549Criteria: string;
    en301549Title: string;
    dosLagenApplies: boolean;
    dosLagenReference: string;
}
interface ICTManualCheck {
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
interface ComponentRecommendation {
    component: string;
    description: string;
    codeExample: string;
    wcagCriteria: string[];
}
interface RegulatoryReport {
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
interface FailingNode {
    html: string;
    target: string | string[];
    failureSummary: string;
}
interface EnrichedReport extends RegulatoryReport {
    failingNodes?: FailingNode[];
    legalContext?: LegalContext;
}
interface LegalContext {
    appliesTo: LegalFramework[];
    sectors: Sector[];
    wadArticle?: string;
    eaaAnnex?: string;
    eaaProductScope?: string[];
    eaaDeadline?: string;
}
interface EUDirective {
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
interface NordicAuthority {
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
interface StatementTool {
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
interface Sanction {
    type: string;
    description: string;
    minAmount: number;
    maxAmount: number;
    currency: string;
    example?: string;
}
interface SectorAuthority {
    authority: string;
    responsibility: string;
}
interface NationalLaw {
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
    complianceDeadlines?: {
        largeEntity?: {
            populationThreshold: number;
            deadline: string;
            description: string;
        };
        smallEntity?: {
            populationThreshold: number;
            deadline: string;
            description: string;
        };
    };
}

declare const ENFORCEMENT_BODIES: Record<Country, string>;
declare const ENFORCEMENT_BODIES_DETAILED: Record<Country, {
    wad: string;
    eaa: string;
}>;
declare function getEnforcementBody(country: Country, sector?: 'public' | 'private'): string;

declare function getEN301549Mapping(wcagCriteria: string, lang?: string): EN301549Mapping | null;
declare function getDOSLagenReference(wcagCriteria: string, lang?: string): string | null;
declare function getICTManualChecklist(): ICTManualCheck[];
declare function getICTManualChecksByCategory(category: string): ICTManualCheck[];
declare function getICTManualChecksByChapter(chapter: number): ICTManualCheck[];
declare function getRecommendedComponent(ruleId: string, lang?: string): ComponentRecommendation | null;
declare function getHolmDigitalInsight(ruleId: string, lang?: string): HolmDigitalInsight | null;
declare function getConvergenceRule(ruleId: string, lang?: string): ConvergenceRule | null;
declare function getAllConvergenceRules(lang?: string): ConvergenceRule[];
declare function getConvergenceRulesByLevel(level: WCAGLevel, lang?: string): ConvergenceRule[];
declare function getConvergenceRulesByDiggRisk(risk: DiggRisk, lang?: string): ConvergenceRule[];
declare function generateRegulatoryReport(ruleId: string, lang?: string): RegulatoryReport | null;
declare function searchRulesByTags(tags: string[], lang?: string): ConvergenceRule[];
declare function getAllTags(lang?: string): string[];
declare function isWCAGCriteriaSupported(wcagCriteria: string, lang?: string): boolean;
declare function getDatabaseStats(lang?: string): {
    totalRules: number;
    totalICTChecks: number;
    rulesByLevel: {
        A: number;
        AA: number;
        AAA: number;
    };
    rulesByDiggRisk: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    automatedRules: number;
    manualRules: number;
    pseudoAutomationRules: number;
};
declare function getRulesByFramework(framework: LegalFramework, lang?: string): ConvergenceRule[];
declare function getRulesBySector(sector: Sector, lang?: string): ConvergenceRule[];
declare function getLegalFrameworks(): Record<string, EUDirective>;
declare function getLegalFramework(id: LegalFramework): EUDirective | null;
declare function getNordicAuthorities(): NordicAuthority[];
declare function getNordicAuthority(id: string): NordicAuthority | null;
declare function getNordicAuthoritiesByCountry(country: Country): NordicAuthority[];
declare function getStatementTools(): StatementTool[];
declare function getStatementToolsByCountry(country: Country): StatementTool[];
declare function getEAADeadlineRules(lang?: string): ConvergenceRule[];
declare function getNationalLaws(country: Country): NationalLaw[];
declare function getNationalLaw(id: string, country?: Country): NationalLaw | null;
declare function getNationalLawByFramework(framework: LegalFramework, country?: Country): NationalLaw | null;
declare function getSanctions(lawId: string, country?: Country): Sanction | null;
declare function getMaxSanction(country?: Country): {
    law: string;
    amount: number;
    currency: string;
} | null;
declare function getSectorAuthorities(country?: Country): SectorAuthority[];

export { type ComponentRecommendation, type ConvergenceRule, type Country, type DiggRisk, type EAAImpact, type EN301549Mapping, ENFORCEMENT_BODIES, ENFORCEMENT_BODIES_DETAILED, type EUDirective, type EnrichedReport, type FailingNode, type HolmDigitalInsight, type ICTManualCheck, type LegalContext, type LegalFramework, type NationalLaw, type NordicAuthority, type RegulatoryReport, type Remediation, type Sanction, type Sector, type SectorAuthority, type StatementTool, type Testability, type WCAGLevel, generateRegulatoryReport, getAllConvergenceRules, getAllTags, getConvergenceRule, getConvergenceRulesByDiggRisk, getConvergenceRulesByLevel, getDOSLagenReference, getDatabaseStats, getEAADeadlineRules, getEN301549Mapping, getEnforcementBody, getHolmDigitalInsight, getICTManualChecklist, getICTManualChecksByCategory, getICTManualChecksByChapter, getLegalFramework, getLegalFrameworks, getMaxSanction, getNationalLaw, getNationalLawByFramework, getNationalLaws, getNordicAuthorities, getNordicAuthoritiesByCountry, getNordicAuthority, getRecommendedComponent, getRulesByFramework, getRulesBySector, getSanctions, getSectorAuthorities, getStatementTools, getStatementToolsByCountry, isWCAGCriteriaSupported, searchRulesByTags };
