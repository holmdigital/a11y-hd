/**
 * HolmDigital A11y Types
 * Typdefinitioner för tillgänglighetstestning
 */

import type { Result as AxeResult, NodeResult, ImpactValue } from 'axe-core';

/**
 * Tillgänglighetsstandarder som stöds
 */
export type AccessibilityStandard = 'wcag' | 'en301549' | 'dos-lagen' | 'all';

/**
 * WCAG-nivåer
 */
export type WCAGLevel = 'A' | 'AA' | 'AAA';

/**
 * Konfiguration för scanner
 */
export interface ScannerConfig {
    /** URL att scanna */
    url: string;

    /** Vilken standard att testa mot */
    standard?: AccessibilityStandard;

    /** WCAG-nivå (endast relevant för WCAG-standard) */
    wcagLevel?: WCAGLevel;

    /** Inkludera screenshots i rapporten */
    includeScreenshots?: boolean;

    /** Timeout för sidladdning (ms) */
    timeout?: number;

    /** Viewport-storlek */
    viewport?: {
        width: number;
        height: number;
    };

    /** Custom axe-core rules att inkludera */
    customRules?: string[];

    /** Headless mode för Puppeteer */
    headless?: boolean;
}

/**
 * Resultat från en tillgänglighetsscan
 */
export interface ScanResult {
    /** URL som scannades */
    url: string;

    /** Tidsstämpel för scanningen */
    timestamp: Date;

    /** Standard som användes */
    standard: AccessibilityStandard;

    /** WCAG-nivå (om relevant) */
    wcagLevel?: WCAGLevel;

    /** Sammanfattning av resultat */
    summary: ScanSummary;

    /** Detaljerade violations */
    violations: Violation[];

    /** Godkända kontroller */
    passes: Pass[];

    /** Ofullständiga kontroller (kräver manuell verifiering) */
    incomplete: Incomplete[];

    /** Screenshots */
    screenshots?: {
        fullPage?: string; // Base64-kodad bild
        viewport?: string;
    };
}

/**
 * Sammanfattning av scanresultat
 */
export interface ScanSummary {
    /** Totalt antal violations */
    totalViolations: number;

    /** Violations per impact-nivå */
    violationsByImpact: {
        critical: number;
        serious: number;
        moderate: number;
        minor: number;
    };

    /** Antal godkända kontroller */
    totalPasses: number;

    /** Antal ofullständiga kontroller */
    totalIncomplete: number;

    /** Totalt antal element som scannades */
    totalElements: number;

    /** Compliance score (0-100) */
    complianceScore: number;
}

/**
 * En tillgänglighetsviolation
 */
export interface Violation {
    /** Unikt ID för regeln */
    id: string;

    /** Beskrivning av problemet */
    description: string;

    /** Hjälptext */
    help: string;

    /** URL till mer information */
    helpUrl: string;

    /** Impact-nivå */
    impact: ImpactValue;

    /** Vilka standarder som påverkas */
    tags: string[];

    /** Berörda element */
    nodes: ViolationNode[];

    /** Länk till kunskapsdatabasen */
    learnMoreUrl?: string;
}

/**
 * Ett element som har en violation
 */
export interface ViolationNode {
    /** HTML-element */
    html: string;

    /** CSS-selektor */
    target: string[];

    /** Felmeddelande */
    failureSummary: string;

    /** Screenshot av elementet (base64) */
    screenshot?: string;

    /** Förslag på lösning */
    fix?: string;
}

/**
 * En godkänd kontroll
 */
export interface Pass {
    /** Regel-ID */
    id: string;

    /** Beskrivning */
    description: string;

    /** Antal element som klarade kontrollen */
    nodeCount: number;
}

/**
 * En ofullständig kontroll
 */
export interface Incomplete {
    /** Regel-ID */
    id: string;

    /** Beskrivning */
    description: string;

    /** Hjälptext */
    help: string;

    /** Berörda element */
    nodes: ViolationNode[];

    /** Instruktioner för manuell verifiering */
    manualCheckInstructions: string;
}

/**
 * Rapport-format
 */
export type ReportFormat = 'html' | 'json' | 'markdown' | 'pdf';

/**
 * Konfiguration för rapportgenerering
 */
export interface ReporterConfig {
    /** Format för rapporten */
    format: ReportFormat;

    /** Output-sökväg */
    outputPath: string;

    /** Inkludera screenshots */
    includeScreenshots?: boolean;

    /** Öppna rapporten automatiskt */
    openAfterGeneration?: boolean;
}

/**
 * Custom regel för axe-core
 */
export interface CustomRule {
    /** Unikt ID */
    id: string;

    /** Metadata */
    metadata: {
        description: string;
        help: string;
        helpUrl?: string;
    };

    /** Vilka standarder regeln tillhör */
    tags: string[];

    /** Evaluering-funktion */
    evaluate: (node: HTMLElement, options: any) => boolean;
}
