/**
 * HolmDigital A11y - Main Entry Point
 * Exporterar alla publika API:er
 */

export { AccessibilityScanner } from './core/scanner';
export { HTMLReporter } from './reporters/html-reporter';
export { en301549Rules, registerEN301549Rules } from './rules/en301549';
export { dosLagenRules, registerDOSLagenRules } from './rules/dos-lagen';

export type {
    AccessibilityStandard,
    WCAGLevel,
    ScannerConfig,
    ScanResult,
    ScanSummary,
    Violation,
    ViolationNode,
    Pass,
    Incomplete,
    ReportFormat,
    ReporterConfig,
    CustomRule,
} from './types';
