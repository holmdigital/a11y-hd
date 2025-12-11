/**
 * TypeScript types for @holmdigital/standards
 */

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type WCAGVersion = '2.0' | '2.1' | '2.2';
export type DiggRisk = 'low' | 'medium' | 'high' | 'critical';
export type EAAImpact = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type TestComplexity = 'simple' | 'moderate' | 'complex';

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
