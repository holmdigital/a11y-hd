/**
 * Regulatory Scanner
 * Kärnan i @holmdigital/engine som kombinerar teknisk scanning med regulatorisk data
 */

import axeCore from 'axe-core';
import puppeteer, { Browser, Page } from 'puppeteer';
import type { RegulatoryReport, EnrichedReport } from '@holmdigital/standards';
import { VirtualDOMBuilder } from './virtual-dom';
import { HtmlValidator, ValidationResult } from './html-validator';

import { readFileSync } from 'node:fs';

export function getEngineVersion(): string {
    return __ENGINE_VERSION__;
}

function getStandardsVersion(): string {
    try {
        // Try to find @holmdigital/standards package.json via require.resolve
        const stdPath = require.resolve('@holmdigital/standards/package.json');
        const pkg = JSON.parse(readFileSync(stdPath, 'utf-8'));
        return pkg.version;
    } catch {
        return 'unknown';
    }
}

export interface ScannerOptions {
    url: string;
    headless?: boolean;
    standard?: 'wcag' | 'en301549' | 'dos-lagen';
    failOnCritical?: boolean;
    viewport?: { width: number; height: number };
    silent?: boolean; // Suppress debug output (for --json mode)
    severityThreshold?: 'critical' | 'high' | 'medium' | 'low'; // CI fail threshold
    invalidHttpsCert?: boolean;
}

export interface ScanMetadata {
    engineVersion: string;
    axeCoreVersion: string;
    standardsVersion: string;
    scanDuration: number; // milliseconds
    pageTitle?: string;
    pageLanguage?: string;
}

export interface ScanResult {
    url: string;
    timestamp: string;
    metadata: ScanMetadata;
    reports: EnrichedReport[];
    stats: {
        passed: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        total: number;
    };
    score: number;
    complianceStatus: 'PASS' | 'FAIL';
    htmlValidation?: ValidationResult;
    // EU Legal Framework summary
    legalSummary?: {
        wadApplicable: number;   // Rules applicable to WAD
        eaaApplicable: number;   // Rules applicable to EAA
        eaaDeadlineViolations: number; // Rules with EAA 2025 deadline
    };
}

export class RegulatoryScanner {
    private browser: Browser | null = null;
    private options: ScannerOptions;
    private htmlValidator: HtmlValidator;

    constructor(options: ScannerOptions) {
        this.options = {
            headless: true,
            standard: 'dos-lagen', // Default till striktaste
            silent: false,
            invalidHttpsCert: false,
            ...options
        };
        this.htmlValidator = new HtmlValidator();
    }

    /** Log only when not in silent mode */
    private log(message: string) {
        if (!this.options.silent) {
            console.log(message);
        }
    }

    /**
     * Kör en fullständig regulatorisk scan
     */
    async scan(): Promise<ScanResult> {
        const startTime = Date.now();
        let pageTitle: string | undefined;
        let pageLanguage: string | undefined;
        let passedCount = 0;

        try {
            await this.initBrowser();
            const page = await this.getPage();

            // Set Viewport
            if (this.options.viewport) {
                await page.setViewport(this.options.viewport);
            }

            // Navigera till URL (med retry logic)
            let retries = 3;
            while (retries > 0) {
                try {
                    await page.goto(this.options.url, {
                        waitUntil: 'domcontentloaded',
                        timeout: 60000
                    });
                    break; // Success
                } catch (e) {
                    retries--;
                    if (retries === 0) throw e;
                    this.log(`Navigation failed, retrying... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            try {
                // Best-effort väntan på att nätverket ska lugna ner sig
                await page.waitForNetworkIdle({
                    idleTime: 500,
                    timeout: 10000,
                    concurrency: 2
                });
            } catch (e) {
                this.log('Network busy, proceeding with scan anyway...');
            }

            // Capture page metadata
            pageTitle = await page.title();
            pageLanguage = await page.evaluate(() => document.documentElement.lang || undefined);

            // Capture HTML for validation
            const pageContent = await page.content();
            const htmlValidation = await this.htmlValidator.validate(pageContent);
            if (!htmlValidation.valid) {
                this.log(`HTML Validation: Found ${htmlValidation.errors.length} structural issues.`);
            }

            // Bygg Virtual DOM för analys (används för avancerade regler senare)
            const vDomBuilder = new VirtualDOMBuilder(page);
            await vDomBuilder.build({ includeComputedStyle: ['color', 'background-color'] });

            // Kör axe-core
            await this.injectAxe(page);
            this.log('Axe injected. Running analysis...');
            const axeResults = await page.evaluate(async () => {
                // Safety check: Ensure we have a document to scan
                if (!document || !document.documentElement) {
                    return { violations: [], passes: [] }; // Fail gracefully
                }

                // @ts-ignore
                return await window.axe.run(document, {
                    iframes: false, // Inaktivera iframe-scanning för att undvika kraschar på tunga annons-sajter
                    // Vi tar bort runOnly tillfälligt för att se ALLA fel
                    /*
                    runOnly: {
                        type: 'tag',
                        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
                    }
                    */
                });
            });
            this.log(`Raw Axe Violations: ${axeResults.violations?.length || 0}`);
            passedCount = axeResults.passes?.length || 0;

            // Transformera resultat med regulatorisk kontext
            const regulatoryReports = await this.enrichResults(axeResults);

            const scanDuration = Date.now() - startTime;
            const result = this.generateResultPackage(regulatoryReports, passedCount, scanDuration, pageTitle, pageLanguage);
            result.htmlValidation = htmlValidation; // Attach validation result
            return result;

        } finally {
            await this.close();
        }
    }

    private async initBrowser() {
        this.browser = await puppeteer.launch({
            headless: this.options.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled', // Gömmer att det är en robot
                ...(this.options.invalidHttpsCert ? ['--ignore-certificate-errors', '--allow-insecure-localhost'] : [])
            ]
        });
    }

    private async getPage(): Promise<Page> {
        if (!this.browser) throw new Error('Browser not initialized');
        const page = await this.browser.newPage();
        // Sätt en riktig User Agent för att undvika att bli blockad eller få en "lite"-version
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        return page;
    }

    private async injectAxe(page: Page) {
        const axeSource = axeCore.source;
        await page.evaluate(axeSource);
    }

    private async enrichResults(axeResults: any): Promise<RegulatoryReport[]> {
        const reports: RegulatoryReport[] = [];
        const { searchRulesByTags, generateRegulatoryReport, getConvergenceRule } = await import('@holmdigital/standards');
        const { getCurrentLang } = await import('../i18n');
        const lang = getCurrentLang();

        for (const violation of axeResults.violations) {
            // 1. Försök matcha direkt på Rule ID (mest exakt)
            // Detta garanterar att 'page-has-heading-one' mappar till vår regel med samma ID
            let report: RegulatoryReport | null = generateRegulatoryReport(violation.id, lang);

            // 2. Fallback: Sök via tags
            if (!report) {
                const matchingRules = searchRulesByTags(violation.tags, lang);
                if (matchingRules.length > 0) {
                    report = generateRegulatoryReport(matchingRules[0].ruleId, lang);
                }
            }

            if (report) {
                // Get full rule to access legalContext
                const fullRule = getConvergenceRule(report.ruleId, lang);

                // Lägg till specifik information från axe-violationen
                // Vi "patchar" rapporten med faktisk feldata från scanningen
                reports.push({
                    ...report,
                    holmdigitalInsight: {
                        ...report.holmdigitalInsight,
                        reasoning: violation.help // Använd Axe's hjälptext som specifik anledning
                    },
                    // Include legal context from the full rule
                    legalContext: fullRule?.legalContext,
                    // Attach extra debug info for the CLI
                    failingNodes: violation.nodes.map((node: any) => ({
                        html: node.html,
                        target: node.target.join(' '),
                        failureSummary: node.failureSummary
                    }))
                } as any);
            } else {
                // Fallback: Om vi inte hittar en regeln i vår databas, skapa en generisk rapport
                // så att vi inte tappar bort felet.
                reports.push({
                    ruleId: violation.id,
                    wcagCriteria: 'Unknown',
                    en301549Criteria: 'Unknown',
                    dosLagenReference: 'Kräver manuell bedömning',
                    diggRisk: 'medium', // Default risk
                    eaaImpact: 'medium',
                    remediation: {
                        description: violation.help,
                        technicalGuidance: violation.description,
                        component: undefined
                    },
                    holmdigitalInsight: {
                        diggRisk: 'medium',
                        eaaImpact: 'medium',
                        reasoning: violation.help,
                        swedishInterpretation: violation.help,
                        priorityRationale: 'Detta fel upptäcktes av scannern men saknar specifik mappning i HolmDigital-databasen.'
                    },
                    testability: {
                        automated: true,
                        requiresManualCheck: false,
                        pseudoAutomation: false,
                        complexity: 'moderate'
                    }
                });
            }
        }

        return reports;
    }

    private generateResultPackage(
        reports: RegulatoryReport[],
        passedCount: number,
        scanDuration: number,
        pageTitle?: string,
        pageLanguage?: string
    ): ScanResult {
        const stats = {
            passed: passedCount,
            critical: reports.filter(r => r.holmdigitalInsight.diggRisk === 'critical').length,
            high: reports.filter(r => r.holmdigitalInsight.diggRisk === 'high').length,
            medium: reports.filter(r => r.holmdigitalInsight.diggRisk === 'medium').length,
            low: reports.filter(r => r.holmdigitalInsight.diggRisk === 'low').length,
            total: reports.length
        };

        // Justerat score-system för att match Lighthouse strängare nivaer
        // Varje fel straffas hårdare
        const weightedScore = (
            (stats.critical * 25) + // Critical violations are severe
            (stats.high * 15) +     // High risk affects usability significantly
            (stats.medium * 5) +    // Medium annoyance
            (stats.low * 1)         // Minor issues
        );

        // Score 100 är bäst, drar av poäng för fel
        const score = Math.max(0, 100 - weightedScore);

        // Compliance status based on severity threshold (default: fail on critical or high)
        const threshold = this.options.severityThreshold || 'high';
        let complianceStatus: 'PASS' | 'FAIL' = 'PASS';
        switch (threshold) {
            case 'critical':
                complianceStatus = stats.critical > 0 ? 'FAIL' : 'PASS';
                break;
            case 'high':
                complianceStatus = (stats.critical > 0 || stats.high > 0) ? 'FAIL' : 'PASS';
                break;
            case 'medium':
                complianceStatus = (stats.critical > 0 || stats.high > 0 || stats.medium > 0) ? 'FAIL' : 'PASS';
                break;
            case 'low':
                complianceStatus = stats.total > 0 ? 'FAIL' : 'PASS';
                break;
        }

        // Get version info dynamically from package.json
        const metadata: ScanMetadata = {
            engineVersion: getEngineVersion(),
            axeCoreVersion: axeCore.version || '4.11.1',
            standardsVersion: getStandardsVersion(),
            scanDuration,
            pageTitle,
            pageLanguage
        };

        // Calculate EU Legal Framework summary
        const reportsWithContext = reports.filter((r: any) => r.legalContext);
        const legalSummary = {
            wadApplicable: reportsWithContext.filter((r: any) =>
                r.legalContext?.appliesTo?.includes('WAD')
            ).length,
            eaaApplicable: reportsWithContext.filter((r: any) =>
                r.legalContext?.appliesTo?.includes('EAA')
            ).length,
            eaaDeadlineViolations: reportsWithContext.filter((r: any) =>
                r.legalContext?.eaaDeadline
            ).length
        };

        return {
            url: this.options.url,
            timestamp: new Date().toISOString(),
            metadata,
            reports,
            stats,
            score,
            complianceStatus,
            legalSummary
        };
    }

    /**
     * Stänger webbläsaren och frigör resurser
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
