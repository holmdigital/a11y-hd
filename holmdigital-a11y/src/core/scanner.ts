/**
 * HolmDigital A11y Scanner
 * Huvudscanner för tillgänglighetstestning
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import type { AxeResults } from 'axe-core';
import type { ScannerConfig, ScanResult, ScanSummary, Violation, Pass, Incomplete } from '../types';
import { en301549Rules } from '../rules/en301549';
import { dosLagenRules } from '../rules/dos-lagen';

/**
 * Huvudklass för tillgänglighetsscanningar
 */
export class AccessibilityScanner {
    private browser: Browser | null = null;
    private config: Required<ScannerConfig>;

    constructor(config: ScannerConfig) {
        this.config = this.normalizeConfig(config);
    }

    /**
     * Normalisera och sätt default-värden för konfiguration
     */
    private normalizeConfig(config: ScannerConfig): Required<ScannerConfig> {
        return {
            url: config.url,
            standard: config.standard ?? 'all',
            wcagLevel: config.wcagLevel ?? 'AA',
            includeScreenshots: config.includeScreenshots ?? true,
            timeout: config.timeout ?? 30000,
            viewport: config.viewport ?? { width: 1920, height: 1080 },
            customRules: config.customRules ?? [],
            headless: config.headless ?? true,
        };
    }

    /**
     * Kör en fullständig tillgänglighetsscan
     */
    async scan(): Promise<ScanResult> {
        try {
            await this.initBrowser();
            const page = await this.createPage();

            // Ladda sidan
            await page.goto(this.config.url, {
                waitUntil: 'networkidle2',
                timeout: this.config.timeout,
            });

            // Injicera axe-core och custom rules
            await this.injectAxeCore(page);
            await this.injectCustomRules(page);

            // Kör axe-core analys
            const axeResults = await this.runAxeAnalysis(page);

            // Ta screenshots om konfigurerat
            const screenshots = this.config.includeScreenshots
                ? await this.captureScreenshots(page)
                : undefined;

            // Stäng browser
            await this.closeBrowser();

            // Transformera resultat till vårt format
            return this.transformResults(axeResults, screenshots);
        } catch (error) {
            await this.closeBrowser();
            throw new Error(`Scan misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`);
        }
    }

    /**
     * Initialisera Puppeteer browser
     */
    private async initBrowser(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: this.config.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }

    /**
     * Skapa en ny sida med konfigurerad viewport
     */
    private async createPage(): Promise<Page> {
        if (!this.browser) {
            throw new Error('Browser inte initialiserad');
        }

        const page = await this.browser.newPage();
        await page.setViewport(this.config.viewport);
        return page;
    }

    /**
     * Injicera axe-core i sidan
     */
    private async injectAxeCore(page: Page): Promise<void> {
        const axeSource = require('axe-core').source;
        await page.evaluate(axeSource);
    }

    /**
     * Injicera custom rules baserat på vald standard
     */
    private async injectCustomRules(page: Page): Promise<void> {
        const rules = [];

        if (this.config.standard === 'en301549' || this.config.standard === 'all') {
            rules.push(...en301549Rules);
        }

        if (this.config.standard === 'dos-lagen' || this.config.standard === 'all') {
            rules.push(...dosLagenRules);
        }

        if (rules.length > 0) {
            await page.evaluate((customRules) => {
                // @ts-ignore - axe är injicerat via evaluate
                if (window.axe) {
                    customRules.forEach((rule: any) => {
                        // @ts-ignore
                        window.axe.configure({ rules: [rule] });
                    });
                }
            }, rules);
        }
    }

    /**
     * Kör axe-core analys
     */
    private async runAxeAnalysis(page: Page): Promise<AxeResults> {
        const options = this.buildAxeOptions();

        const results = await page.evaluate((opts) => {
            // @ts-ignore - axe är injicerat
            return window.axe.run(opts);
        }, options);

        return results;
    }

    /**
     * Bygg axe-core options baserat på konfiguration
     */
    private buildAxeOptions(): any {
        const options: any = {
            runOnly: {
                type: 'tag',
                values: this.getTagsForStandard(),
            },
        };

        return options;
    }

    /**
     * Hämta axe-core tags baserat på vald standard
     */
    private getTagsForStandard(): string[] {
        const tags: string[] = [];

        if (this.config.standard === 'wcag' || this.config.standard === 'all') {
            tags.push('wcag2a');
            if (this.config.wcagLevel === 'AA' || this.config.wcagLevel === 'AAA') {
                tags.push('wcag2aa');
            }
            if (this.config.wcagLevel === 'AAA') {
                tags.push('wcag2aaa');
            }
            tags.push('wcag21a', 'wcag21aa', 'wcag22aa');
        }

        if (this.config.standard === 'en301549' || this.config.standard === 'all') {
            tags.push('en301549');
        }

        if (this.config.standard === 'dos-lagen' || this.config.standard === 'all') {
            tags.push('dos-lagen');
        }

        return tags;
    }

    /**
     * Ta screenshots av sidan
     */
    private async captureScreenshots(page: Page): Promise<{ fullPage: string; viewport: string }> {
        const fullPage = await page.screenshot({
            encoding: 'base64',
            fullPage: true,
        });

        const viewport = await page.screenshot({
            encoding: 'base64',
            fullPage: false,
        });

        return {
            fullPage: fullPage as string,
            viewport: viewport as string,
        };
    }

    /**
     * Stäng browser
     */
    private async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * Transformera axe-results till vårt ScanResult-format
     */
    private transformResults(
        axeResults: AxeResults,
        screenshots?: { fullPage: string; viewport: string }
    ): ScanResult {
        const violations = this.transformViolations(axeResults.violations);
        const passes = this.transformPasses(axeResults.passes);
        const incomplete = this.transformIncomplete(axeResults.incomplete);

        return {
            url: this.config.url,
            timestamp: new Date(),
            standard: this.config.standard,
            wcagLevel: this.config.wcagLevel,
            summary: this.calculateSummary(violations, passes, incomplete),
            violations,
            passes,
            incomplete,
            screenshots,
        };
    }

    /**
     * Transformera violations
     */
    private transformViolations(axeViolations: any[]): Violation[] {
        return axeViolations.map((violation) => ({
            id: violation.id,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            impact: violation.impact,
            tags: violation.tags,
            nodes: violation.nodes.map((node: any) => ({
                html: node.html,
                target: node.target,
                failureSummary: node.failureSummary || '',
                fix: this.generateFixSuggestion(violation.id),
            })),
            learnMoreUrl: this.generateLearnMoreUrl(violation.id),
        }));
    }

    /**
     * Transformera passes
     */
    private transformPasses(axePasses: any[]): Pass[] {
        return axePasses.map((pass) => ({
            id: pass.id,
            description: pass.description,
            nodeCount: pass.nodes.length,
        }));
    }

    /**
     * Transformera incomplete
     */
    private transformIncomplete(axeIncomplete: any[]): Incomplete[] {
        return axeIncomplete.map((incomplete) => ({
            id: incomplete.id,
            description: incomplete.description,
            help: incomplete.help,
            nodes: incomplete.nodes.map((node: any) => ({
                html: node.html,
                target: node.target,
                failureSummary: node.failureSummary || '',
            })),
            manualCheckInstructions: this.generateManualCheckInstructions(incomplete.id),
        }));
    }

    /**
     * Beräkna sammanfattning
     */
    private calculateSummary(
        violations: Violation[],
        passes: Pass[],
        incomplete: Incomplete[]
    ): ScanSummary {
        const violationsByImpact = {
            critical: violations.filter((v) => v.impact === 'critical').length,
            serious: violations.filter((v) => v.impact === 'serious').length,
            moderate: violations.filter((v) => v.impact === 'moderate').length,
            minor: violations.filter((v) => v.impact === 'minor').length,
        };

        const totalElements = passes.reduce((sum, pass) => sum + pass.nodeCount, 0);
        const totalViolations = violations.length;
        const totalPasses = passes.length;

        // Beräkna compliance score (0-100)
        const complianceScore = totalPasses + totalViolations > 0
            ? Math.round((totalPasses / (totalPasses + totalViolations)) * 100)
            : 100;

        return {
            totalViolations,
            violationsByImpact,
            totalPasses,
            totalIncomplete: incomplete.length,
            totalElements,
            complianceScore,
        };
    }

    /**
     * Generera URL till kunskapsdatabasen
     */
    private generateLearnMoreUrl(ruleId: string): string {
        return `https://a11y.holmdigital.se/regler/${ruleId}`;
    }

    /**
     * Generera förslag på lösning
     */
    private generateFixSuggestion(ruleId: string): string {
        // TODO: Implementera regelspecifika lösningsförslag
        return 'Se kunskapsdatabasen för detaljerade lösningsförslag';
    }

    /**
     * Generera instruktioner för manuell kontroll
     */
    private generateManualCheckInstructions(ruleId: string): string {
        // TODO: Implementera regelspecifika instruktioner
        return 'Denna kontroll kräver manuell verifiering. Se kunskapsdatabasen för instruktioner.';
    }
}
