/**
 * Regulatory Scanner
 * Kärnan i @holmdigital/engine som kombinerar teknisk scanning med regulatorisk data
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import type { RegulatoryReport } from '@holmdigital/standards';
import { VirtualDOMBuilder } from './virtual-dom';
import { HtmlValidator, ValidationResult } from './html-validator';

export interface ScannerOptions {
    url: string;
    headless?: boolean;
    standard?: 'wcag' | 'en301549' | 'dos-lagen';
    failOnCritical?: boolean;
    viewport?: { width: number; height: number };
    silent?: boolean; // Suppress debug output (for --json mode)
}

export interface ScanResult {
    url: string;
    timestamp: string;
    reports: RegulatoryReport[];
    stats: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        total: number;
    };
    score: number;
    complianceStatus: 'PASS' | 'FAIL';
    htmlValidation?: ValidationResult;
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
                    return { violations: [] }; // Fail gracefully
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

            // Transformera resultat med regulatorisk kontext
            const regulatoryReports = await this.enrichResults(axeResults);

            const result = this.generateResultPackage(regulatoryReports);
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
                '--disable-blink-features=AutomationControlled' // Gömmer att det är en robot
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
        const axeSource = require('axe-core').source;
        await page.evaluate(axeSource);
    }

    private async enrichResults(axeResults: any): Promise<RegulatoryReport[]> {
        const reports: RegulatoryReport[] = [];
        const { searchRulesByTags, generateRegulatoryReport } = await import('@holmdigital/standards');
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
                // Lägg till specifik information från axe-violationen
                // Vi "patchar" rapporten med faktisk feldata från scanningen
                reports.push({
                    ...report,
                    holmdigitalInsight: {
                        ...report.holmdigitalInsight,
                        reasoning: violation.help // Använd Axe's hjälptext som specifik anledning
                    },
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

    private generateResultPackage(reports: RegulatoryReport[]): ScanResult {
        const stats = {
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

        // Strict Compliance: Pass requires 0 violations
        const complianceStatus = stats.total === 0 ? 'PASS' : 'FAIL';

        return {
            url: this.options.url,
            timestamp: new Date().toISOString(),
            reports,
            stats,
            score,
            complianceStatus
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
