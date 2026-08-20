/**
 * Regulatory Scanner
 * Kärnan i @holmdigital/engine som kombinerar teknisk scanning med regulatorisk data
 */

import axeCore from 'axe-core';
import puppeteer, { Browser, Page } from 'puppeteer';
import type { RegulatoryReport, EnrichedReport } from '@holmdigital/standards';
import { VirtualDOMBuilder } from './virtual-dom';
import { HtmlValidator, ValidationResult } from './html-validator';
import { evaluateNoScriptCoverage, probeWithoutJavaScript, NoScriptResult } from './noscript-check';

import { readFileSync } from 'node:fs';

/**
 * Minimal interface for serialized axe-core output from page.evaluate().
 * NOT the full axe-core AxeResults type (missing EnvironmentData, etc.).
 */
interface AxeScanOutput {
    violations: Array<{
        id: string;
        help: string;
        description: string;
        tags: string[];
        nodes: Array<{ html: string; target: string[]; failureSummary: string }>;
    }>;
    passes: Array<{ id: string }>;
    /**
     * axes `incomplete`: kontroller som axe INTE kunde avgöra (varken pass eller
     * fail). KRAV-3 (Intern #12): dessa ska bäras vidare, inte tappas tyst.
     * Noderna har check-arrayer (`any`) med `message` och `data.messageKey` —
     * skälet läses därifrån (t.ex. `bgOverlap`), aldrig ett `contrastRatio: 0`
     * som om det vore en uppmätt nollkontrast.
     */
    incomplete?: Array<{
        id: string;
        help: string;
        description: string;
        tags: string[];
        nodes: Array<{
            html: string;
            target: string[];
            failureSummary?: string;
            any?: Array<{ id: string; message?: string; data?: Record<string, unknown> }>;
        }>;
    }>;
}

/* global __ENGINE_VERSION__ */
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

/**
 * En riktig User Agent, så vi inte blockas eller får en "lite"-version av sidan.
 * Delas av huvudskanningen och robusthetssonden. De MÅSTE använda samma sträng:
 * svarar servern med olika markup för olika user agents jämför sonden två skilda
 * sidor i stället för samma sida med och utan JavaScript.
 */
const SCAN_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface ScannerOptions {
    url: string;
    headless?: boolean;
    standard?: 'wcag' | 'en301549' | 'dos-lagen';
    failOnCritical?: boolean;
    viewport?: { width: number; height: number };
    silent?: boolean; // Suppress debug output (for --json mode)
    severityThreshold?: 'critical' | 'high' | 'medium' | 'low'; // CI fail threshold
    invalidHttpsCert?: boolean;
    light?: boolean; // Skip HTML validation + Virtual DOM for faster scan
    waitForHydrationMs?: number; // Extra settle efter networkidle så SPA hinner hydrera (default 2500, 0 = av)
    noScriptCheck?: boolean; // Opt-in robusthetskontroll utan JS (rådgivande, påverkar aldrig score)
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
        /**
         * Antal "needs review"-poster (cantTell) burna från axes `incomplete`.
         * Informativt: ingår ALDRIG i total, score eller complianceStatus.
         */
        needsReview: number;
    };
    score: number;
    complianceStatus: 'PASS' | 'FAIL';
    htmlValidation?: ValidationResult;
    /**
     * Robusthet utan JavaScript. Endast närvarande när noScriptCheck är på.
     * RÅDGIVANDE: ingår aldrig i score, stats eller complianceStatus ovan.
     * Se noscript-check.ts för varför detta inte är ett WCAG-fel.
     */
    noScript?: NoScriptResult;
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
            waitForHydrationMs: 2500, // Default PÅ: klientrenderade SPA:er behöver tid att hydrera innan axe körs
            noScriptCheck: false, // Default AV: opt-in, kostar en extra sidladdning
            ...options
        };

        // Spreaden ovan skriver över defaulten även när nyckeln finns men är
        // undefined (vanligt när värdet kommer från en CLI-flagga som inte
        // sattes). Utan denna rad blir waitForHydrationMs undefined → 0 ms, och
        // SPA:er får falskt 100/100 igen. Återställ defaulten.
        if (this.options.waitForHydrationMs === undefined) {
            this.options.waitForHydrationMs = 2500;
        }
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
            } catch {
                this.log('Network busy, proceeding with scan anyway...');
            }

            // Hydration-settle: ge klientrenderade SPA:er (React/Vue/Next client)
            // tid att hydrera efter att bundlen laddats. networkidle räcker inte,
            // den uppfylls innan ramverket byggt klart komponentträdet.
            const hydrationWait = this.options.waitForHydrationMs ?? 0;
            if (hydrationWait > 0) {
                this.log(`Väntar ${hydrationWait} ms på hydrering...`);
                await new Promise(resolve => setTimeout(resolve, hydrationWait));
            }

            // Capture page metadata
            pageTitle = await page.title();
            pageLanguage = await page.evaluate(() => document.documentElement.lang || undefined);

            // Referensmätning för robusthetskontrollen: hur mycket text finns när
            // sidan ÄR hydrerad? Måste tas här, medan sidan lever, för att kunna
            // jämföras med den JS-fria laddningen längre ned. Kostar inget när av.
            let textLengthWithJs: number | undefined;
            if (this.options.noScriptCheck) {
                textLengthWithJs = await page.evaluate(
                    () => (document.body?.innerText ?? '').trim().length
                );
            }

            // Capture HTML for validation (skip in light mode)
            let htmlValidation: ValidationResult | undefined;
            if (!this.options.light) {
                const pageContent = await page.content();
                htmlValidation = await this.htmlValidator.validate(pageContent);
                if (!htmlValidation.valid) {
                    this.log(`HTML Validation: Found ${htmlValidation.errors.length} structural issues.`);
                }

                // Bygg Virtual DOM för analys (används för avancerade regler senare)
                const vDomBuilder = new VirtualDOMBuilder(page);
                await vDomBuilder.build({ includeComputedStyle: ['color', 'background-color'] });
            }

            // Kör axe-core
            await this.injectAxe(page);
            this.log('Axe injected. Running analysis...');
            const axeResults = await page.evaluate(async () => {
                // Safety check: Ensure we have a document to scan
                if (!document || !document.documentElement) {
                    return { violations: [], passes: [] }; // Fail gracefully
                }

                // @ts-expect-error window.axe is injected by axe-core script tag at runtime; not part of lib.dom
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
            const regulatoryReports = this.options.light
                ? await this.enrichResultsLight(axeResults)
                : await this.enrichResults(axeResults);

            // KRAV-3 (Intern #12): bär axes `incomplete` vidare som needs review/
            // cantTell-poster. De hamnar i reports men exkluderas ur stats, score
            // och complianceStatus (görs i generateResultPackage).
            const incompleteReports = await this.enrichIncomplete(axeResults);
            const allReports = [...regulatoryReports, ...incompleteReports];

            // Robusthetskontroll utan JS. Körs EFTER huvudskanningen och resultatet
            // hängs på utanför generateResultPackage, så det är strukturellt omöjligt
            // för det att påverka score, stats eller complianceStatus.
            let noScript: NoScriptResult | undefined;
            if (this.options.noScriptCheck) {
                noScript = await this.runNoScriptCheck(textLengthWithJs ?? 0);
            }

            const scanDuration = Date.now() - startTime;
            const result = this.generateResultPackage(allReports, passedCount, scanDuration, pageTitle, pageLanguage);
            if (htmlValidation) {
                result.htmlValidation = htmlValidation;
            }
            if (noScript) {
                result.noScript = noScript;
            }
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
        await page.setUserAgent(SCAN_USER_AGENT);
        return page;
    }

    private async injectAxe(page: Page) {
        const axeSource = axeCore.source;
        await page.evaluate(axeSource);
    }

    /**
     * Laddar sidan en andra gång med JS avstängt och jämför innehållsmängden
     * med den hydrerade sidan. Rådgivande robusthetsindikator, aldrig ett
     * WCAG-fel och aldrig en faktor i scoren. Se noscript-check.ts.
     *
     * Kastar aldrig: en misslyckad sond får inte fälla en i övrigt lyckad scan.
     * Vid fel returneras verdict 'unknown' med felmeddelandet bevarat, inte
     * 'empty' (vi vill inte larma om en tom sida när det var sonden som brast).
     */
    private async runNoScriptCheck(textLengthWithJs: number): Promise<NoScriptResult> {
        try {
            if (!this.browser) throw new Error('Browser not initialized');

            this.log('Mäter robusthet utan JavaScript...');
            const measurement = await probeWithoutJavaScript(this.browser, {
                // SAMMA user agent och viewport som huvudskanningen. Skiljer de sig
                // åt kan servern svara med annan markup och jämförelsen blir falsk:
                // vi skulle mäta två olika sidor, inte JS-effekten.
                url: this.options.url,
                userAgent: SCAN_USER_AGENT,
                viewport: this.options.viewport
            });

            return evaluateNoScriptCoverage(
                measurement.textLength,
                textLengthWithJs,
                measurement.hasNoScriptFallback
            );
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            this.log(`Robusthetskontrollen kunde inte genomföras: ${message}`);

            return {
                textLengthWithoutJs: 0,
                textLengthWithJs: Math.max(0, textLengthWithJs),
                coverageRatio: 0,
                verdict: 'unknown',
                hasContentWithoutJs: false,
                hasNoScriptFallback: false,
                isWcagViolation: false,
                affectsScore: false,
                error: message
            };
        }
    }

    /**
     * Light enrichment — maps axe severity directly, then attaches plain-language
     * (klarspråk) copy to the top findings so the public light scan can render
     * readable cards instead of raw axe rule ids. Stays light: a single standards
     * import and a lookup only for the first N findings (the widget shows a
     * handful). The language follows getCurrentLang() — the public Swedish scan
     * sets 'sv'; generateRegulatoryReport carries the built-in EN fallback for
     * rules lacking the target language.
     */
    private async enrichResultsLight(axeResults: AxeScanOutput): Promise<EnrichedReport[]> {
        const impactToRisk: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
            critical: 'critical',
            serious: 'high',
            moderate: 'medium',
            minor: 'low'
        };

        const KLARSPRAK_TOP_N = 8;
        const { generateRegulatoryReport } = await import('@holmdigital/standards');
        const { getCurrentLang } = await import('../i18n');
        const lang = getCurrentLang();

        return axeResults.violations.map((violation, index) => {
            const impact = (violation as unknown as { impact?: string }).impact || 'moderate';
            const risk = impactToRisk[impact] || 'medium';

            // Klarspråk only for the top-N findings (undefined for the rest, and
            // for unmapped best-practice rules generateRegulatoryReport returns null).
            const plainLanguage = index < KLARSPRAK_TOP_N
                ? generateRegulatoryReport(violation.id, lang)?.plainLanguage
                : undefined;

            return {
                ruleId: violation.id,
                wcagCriteria: violation.tags.find(t => t.startsWith('wcag')) || (violation.tags.includes('best-practice') ? 'Best Practice' : 'Unknown'),
                en301549Criteria: '',
                dosLagenReference: '',
                diggRisk: risk,
                eaaImpact: risk,
                plainLanguage,
                remediation: {
                    description: violation.help,
                    technicalGuidance: violation.description,
                    component: undefined
                },
                holmdigitalInsight: {
                    diggRisk: risk,
                    eaaImpact: risk,
                    reasoning: violation.help,
                    swedishInterpretation: '',
                    priorityRationale: ''
                },
                testability: {
                    automated: true,
                    requiresManualCheck: false,
                    pseudoAutomation: false,
                    complexity: 'simple' as const
                },
                failingNodes: violation.nodes.slice(0, 3).map(node => ({
                    html: node.html,
                    target: node.target.join(' '),
                    failureSummary: node.failureSummary
                }))
            };
        });
    }

    private async enrichResults(axeResults: AxeScanOutput): Promise<EnrichedReport[]> {
        const reports: EnrichedReport[] = [];
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
                    failingNodes: violation.nodes.map((node) => ({
                        html: node.html,
                        target: node.target.join(' '),
                        failureSummary: node.failureSummary
                    }))
                });
            } else {
                // Fallback: Om vi inte hittar en regeln i vår databas, skapa en generisk rapport
                // så att vi inte tappar bort felet.
                const isBestPractice = violation.tags.includes('best-practice');
                const riskLevel = isBestPractice ? 'low' as const : 'medium' as const;

                // Locale-aware fallback strings
                const FALLBACK_STRINGS: Record<string, { bestPracticeRef: string; manualRef: string; bestPracticeRationale: string; unmappedRationale: string }> = {
                    sv: { bestPracticeRef: 'Rekommendation (ej lagkrav)', manualRef: 'Kräver manuell bedömning', bestPracticeRationale: 'Best practice — rekommenderas för bättre tillgänglighet men är inget specifikt WCAG-krav.', unmappedRationale: 'Detta fel upptäcktes av scannern men saknar specifik mappning i HolmDigital-databasen.' },
                    no: { bestPracticeRef: 'Anbefaling (ikke lovkrav)', manualRef: 'Krever manuell vurdering', bestPracticeRationale: 'Best practice — anbefales for bedre tilgjengelighet, men er ikke et spesifikt WCAG-krav.', unmappedRationale: 'Denne feilen ble oppdaget av skanneren, men mangler spesifikk kartlegging i HolmDigital-databasen.' },
                    fi: { bestPracticeRef: 'Suositus (ei lakisääteinen)', manualRef: 'Vaatii manuaalisen arvioinnin', bestPracticeRationale: 'Best practice — suositellaan paremman saavutettavuuden vuoksi, mutta ei ole erityinen WCAG-vaatimus.', unmappedRationale: 'Tämä virhe havaittiin skannerilla, mutta sille ei ole tarkkaa kartoitusta HolmDigital-tietokannassa.' },
                    de: { bestPracticeRef: 'Empfehlung (keine gesetzliche Pflicht)', manualRef: 'Erfordert manuelle Bewertung', bestPracticeRationale: 'Best Practice — empfohlen für bessere Barrierefreiheit, aber keine spezifische WCAG-Anforderung.', unmappedRationale: 'Dieser Fehler wurde vom Scanner erkannt, hat aber keine spezifische Zuordnung in der HolmDigital-Datenbank.' },
                    fr: { bestPracticeRef: 'Recommandation (non obligatoire)', manualRef: 'Nécessite une évaluation manuelle', bestPracticeRationale: 'Bonne pratique — recommandée pour une meilleure accessibilité, mais pas une exigence WCAG spécifique.', unmappedRationale: 'Cette erreur a été détectée par le scanner mais n\'a pas de correspondance spécifique dans la base HolmDigital.' },
                    es: { bestPracticeRef: 'Recomendación (no obligatorio)', manualRef: 'Requiere evaluación manual', bestPracticeRationale: 'Buena práctica — recomendada para mejor accesibilidad, pero no es un requisito WCAG específico.', unmappedRationale: 'Este error fue detectado por el escáner pero no tiene una correspondencia específica en la base de datos de HolmDigital.' },
                    nl: { bestPracticeRef: 'Aanbeveling (geen wettelijke verplichting)', manualRef: 'Vereist handmatige beoordeling', bestPracticeRationale: 'Best practice — aanbevolen voor betere toegankelijkheid, maar geen specifieke WCAG-eis.', unmappedRationale: 'Deze fout is gedetecteerd door de scanner maar heeft geen specifieke toewijzing in de HolmDigital-database.' },
                    da: { bestPracticeRef: 'Anbefaling (ikke lovkrav)', manualRef: 'Kræver manuel vurdering', bestPracticeRationale: 'Best practice — anbefales for bedre tilgængelighed, men er ikke et specifikt WCAG-krav.', unmappedRationale: 'Denne fejl blev opdaget af scanneren, men mangler specifik kortlægning i HolmDigital-databasen.' },
                    en: { bestPracticeRef: 'Recommendation (not a legal requirement)', manualRef: 'Requires manual assessment', bestPracticeRationale: 'Best practice — recommended for better accessibility but not a specific WCAG requirement.', unmappedRationale: 'This issue was detected by the scanner but has no specific mapping in the HolmDigital database.' },
                };
                const fallback = FALLBACK_STRINGS[lang] || FALLBACK_STRINGS['en'];

                reports.push({
                    ruleId: violation.id,
                    wcagCriteria: isBestPractice ? 'Best Practice' : 'Unknown',
                    en301549Criteria: isBestPractice ? 'N/A' : 'Unknown',
                    dosLagenReference: isBestPractice ? fallback.bestPracticeRef : fallback.manualRef,
                    diggRisk: riskLevel,
                    eaaImpact: riskLevel,
                    remediation: {
                        description: violation.help,
                        technicalGuidance: violation.description,
                        component: undefined
                    },
                    holmdigitalInsight: {
                        diggRisk: riskLevel,
                        eaaImpact: riskLevel,
                        reasoning: violation.help,
                        swedishInterpretation: violation.help,
                        priorityRationale: isBestPractice
                            ? fallback.bestPracticeRationale
                            : fallback.unmappedRationale
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

    /**
     * KRAV-3 (Intern #12): bär axes `incomplete` vidare som "needs review"-poster
     * (internt `cantTell`). axe kunde inte avgöra pass/fail, så en människa måste
     * kontrollera. Poster märks `cantTell` och exkluderas ur stats/score/
     * complianceStatus i generateResultPackage — men tappas aldrig tyst.
     *
     * Skälet läses ur nodens check-data (`message` + `messageKey`), t.ex.
     * `bgOverlap` = bakgrunden kunde inte bestämmas. Ett `contrastRatio: 0` som
     * följer med i det fallet är INTE en uppmätt nollkontrast, så vi bär
     * skäl-texten, aldrig ett hopfabricerat mätvärde (Intern #20).
     */
    private async enrichIncomplete(axeResults: AxeScanOutput): Promise<EnrichedReport[]> {
        const incomplete = axeResults.incomplete;
        if (!incomplete || incomplete.length === 0) return [];

        const reports: EnrichedReport[] = [];
        const { generateRegulatoryReport, getConvergenceRule } = await import('@holmdigital/standards');
        const { getCurrentLang } = await import('../i18n');
        const lang = getCurrentLang();

        const readMessageKey = (
            checks?: Array<{ id: string; message?: string; data?: Record<string, unknown> }>
        ) => checks?.find(c => c.data && typeof c.data === 'object' && 'messageKey' in c.data) ?? checks?.[0];

        for (const item of incomplete) {
            const firstCheck = readMessageKey(item.nodes[0]?.any);
            const rawKey = firstCheck?.data && typeof firstCheck.data === 'object'
                ? (firstCheck.data as { messageKey?: unknown }).messageKey
                : undefined;
            const reviewReason = typeof rawKey === 'string' ? rawKey : undefined;

            // Skäl per nod: axes egen check-message (VARFÖR den inte kunde avgöras).
            // Aldrig ett kontrastvärde — i bgOverlap-fallet finns inget uppmätt.
            const failingNodes = item.nodes.slice(0, 3).map(node => {
                const c = readMessageKey(node.any);
                return {
                    html: node.html,
                    target: node.target.join(' '),
                    failureSummary: c?.message ?? node.failureSummary ?? item.help
                };
            });
            const reasoning = failingNodes[0]?.failureSummary ?? item.help;

            const base: RegulatoryReport | null = generateRegulatoryReport(item.id, lang);
            if (base) {
                const fullRule = getConvergenceRule(base.ruleId, lang);
                reports.push({
                    ...base,
                    cantTell: true,
                    reviewReason,
                    holmdigitalInsight: { ...base.holmdigitalInsight, reasoning },
                    legalContext: fullRule?.legalContext,
                    failingNodes
                });
            } else {
                // Regel utan mappning: bär ändå posten som cantTell så inget tappas.
                reports.push({
                    ruleId: item.id,
                    wcagCriteria: item.tags.find(t => t.startsWith('wcag')) || 'Unknown',
                    en301549Criteria: '',
                    dosLagenReference: '',
                    diggRisk: 'medium',
                    eaaImpact: 'medium',
                    remediation: { description: item.help, technicalGuidance: item.description, component: undefined },
                    holmdigitalInsight: {
                        diggRisk: 'medium',
                        eaaImpact: 'medium',
                        reasoning,
                        swedishInterpretation: '',
                        priorityRationale: ''
                    },
                    testability: { automated: false, requiresManualCheck: true, pseudoAutomation: false, complexity: 'moderate' },
                    cantTell: true,
                    reviewReason,
                    failingNodes
                });
            }
        }
        return reports;
    }

    private generateResultPackage(
        reports: EnrichedReport[],
        passedCount: number,
        scanDuration: number,
        pageTitle?: string,
        pageLanguage?: string
    ): ScanResult {
        // KRAV-3 (Intern #12): "needs review"-poster (cantTell) bärs i reports men
        // räknas ALDRIG som fel. Skilj scored (verkliga fel) från cantTell innan
        // stats, score och complianceStatus beräknas.
        const scored = reports.filter(r => !r.cantTell);
        const needsReview = reports.length - scored.length;

        const stats = {
            passed: passedCount,
            critical: scored.filter(r => r.holmdigitalInsight.diggRisk === 'critical').length,
            high: scored.filter(r => r.holmdigitalInsight.diggRisk === 'high').length,
            medium: scored.filter(r => r.holmdigitalInsight.diggRisk === 'medium').length,
            low: scored.filter(r => r.holmdigitalInsight.diggRisk === 'low').length,
            total: scored.length,
            needsReview
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

        // Calculate EU Legal Framework summary (cantTell exkluderas: inte bekräftade fel)
        const reportsWithContext = scored.filter(r => r.legalContext);
        const legalSummary = {
            wadApplicable: reportsWithContext.filter(r =>
                r.legalContext?.appliesTo?.includes('WAD')
            ).length,
            eaaApplicable: reportsWithContext.filter(r =>
                r.legalContext?.appliesTo?.includes('EAA')
            ).length,
            eaaDeadlineViolations: reportsWithContext.filter(r =>
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
