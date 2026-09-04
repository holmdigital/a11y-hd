/**
 * Regulatory Scanner
 * Kärnan i @holmdigital/engine som kombinerar teknisk scanning med regulatorisk data
 */

import axeCore from 'axe-core';
import puppeteer, { Browser, Page } from 'puppeteer';
import type { RegulatoryReport, EnrichedReport, ConvergenceRule } from '@holmdigital/standards';
import { VirtualDOMBuilder } from './virtual-dom';
import { HtmlValidator, ValidationResult } from './html-validator';
import { evaluateNoScriptCoverage, probeWithoutJavaScript, NoScriptResult } from './noscript-check';

import { readFileSync } from 'node:fs';

/**
 * Intern #30: pick the mapped rule for an axe violation by its WCAG CRITERION,
 * not by any shared tag. axe carries two kinds of `wcag*` tag:
 *   - criterion tags — pure digits, e.g. `wcag111` = 1.1.1, `wcag258` = 2.5.8,
 *     `wcag1410` = 1.4.10 (principle.guideline.criterion),
 *   - level tags — carry letters, e.g. `wcag2a`, `wcag21aa` (NOT a criterion).
 * The old fallback matched ANY shared tag and took `[0]` (file order), so
 * `color-contrast` (which bears `wcag2a`/`wcag21aa`) won every rule carrying a
 * level tag — an image with no alt was reported as a contrast failure.
 */
export function wcagTagToCriterion(tag: string): string | null {
    const m = /^wcag(\d+)$/.exec(tag);
    if (!m) return null;                       // level tags (wcag2a, …) carry letters
    const d = m[1];
    if (d.length < 3) return null;             // need principle+guideline+criterion
    return `${d[0]}.${d[1]}.${d.slice(2)}`;
}

/** The WCAG criteria (dotted) that an axe rule's own tags declare, in tag order. */
export function criteriaFromTags(tags: string[]): string[] {
    return tags.map(wcagTagToCriterion).filter((c): c is string => c !== null);
}

/**
 * Intern #39: the EN 301 549 criterion an axe rule declares in its own tags, e.g.
 * `EN-9.1.4.4` → `9.1.4.4`. Only the `EN-9.x[.x[.x]]` criterion tags match — the
 * framework tag `EN-301-549` is deliberately NOT matched. Used ONLY as a fallback
 * for honestly-unmapped findings (where we would otherwise emit `'Unknown'`); it
 * never overrides our rule data on a matched finding.
 */
export function en301549FromTags(tags: string[]): string | null {
    for (const tag of tags) {
        const m = /^EN-(9(?:\.\d+){1,3})$/.exec(tag);
        if (m) return m[1];
    }
    return null;
}

/** Compare dotted WCAG criteria numerically: 1.4.3 < 1.4.10 < 2.4.4. */
function compareCriteria(a: string, b: string): number {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
        if (diff !== 0) return diff;
    }
    return 0;
}

/**
 * Explicit criterion overrides for multi-criterion axe rules where the base rule
 * (lowest criterion) would pick the wrong one (Intern #30, ratified by Karin
 * 2026-08-25). For `link-name` and `area-alt` the actual failure is a missing
 * accessible NAME, so 4.1.2 (Name, Role, Value) wins over 2.4.4 (Link Purpose).
 */
const CRITERION_OVERRIDE: Record<string, string> = {
    'link-name': '4.1.2',
    'area-alt': '4.1.2',
};

/**
 * The subset of our ruleIds that ARE axe rule ids (Intern #27 K3). These "self-
 * matching" rules are always reached in step 1 (direct id match); they must never be
 * chosen as a tag fallback, or e.g. `list` (1.3.1) could be labelled `landmark-one-main`
 * depending on file order. Derived from axe's own rule set, not a hardcoded table.
 */
export function getSelfMatchingRuleIds(rules: ConvergenceRule[]): Set<string> {
    const axeIds = new Set((axeCore.getRules() as Array<{ ruleId: string }>).map(r => r.ruleId));
    return new Set(rules.filter(r => axeIds.has(r.ruleId)).map(r => r.ruleId));
}

/**
 * Resolve which of our rules an axe violation maps to, by criterion (Intern #30/#27).
 * Returns the ruleId of a rule whose `wcagCriteria` equals one of the criteria the axe
 * rule's own tags declare, or null when we map none (→ the honest "no specific mapping"
 * branch). Tiebreak when an axe rule declares several criteria: lowest criterion wins
 * (earliest WCAG principle, deterministic), except `CRITERION_OVERRIDE` (→ 4.1.2).
 *
 * K3 (Intern #27): among the rules holding a criterion, prefer a GENERAL rule over a
 * self-matching one (a rule that owns an axe id), so the choice never depends on file
 * order. A self-matching rule is used only when it alone holds the criterion — hardening
 * so a future axe rule on e.g. `wcag143` still maps to `color-contrast` instead of
 * silently falling to "no match".
 */
export function selectMappedRuleId(
    ruleId: string,
    tags: string[],
    rules: ConvergenceRule[],
    selfMatchingIds: Set<string> = new Set()
): string | null {
    const ruleForCriterion = (c: string): ConvergenceRule | undefined => {
        const holders = rules.filter(r => r.wcagCriteria === c);
        return holders.find(r => !selfMatchingIds.has(r.ruleId)) ?? holders[0];
    };

    const criteria = criteriaFromTags(tags);
    const override = CRITERION_OVERRIDE[ruleId];
    if (override && criteria.includes(override)) {
        const r = ruleForCriterion(override);
        if (r) return r.ruleId;
    }
    const matched = criteria
        .map(c => ruleForCriterion(c))
        .filter((r): r is ConvergenceRule => !!r);
    if (matched.length === 0) return null;
    matched.sort((a, b) => compareCriteria(a.wcagCriteria, b.wcagCriteria));
    return matched[0].ruleId;
}

/**
 * Titlar som en vänta-/challenge-/omdirigeringssida typiskt bär (Intern #43).
 */
const INTERSTITIAL_TITLE = /\b(v[aä]nta|please wait|just a moment|checking your browser|attention required|redirecting|one moment|ett [oö]gonblick|verifying you are human)\b/i;

/**
 * Intern #43: känn av när axe mätte en interstitial-/vänta-/bot-challenge-sida i
 * stället för det riktiga innehållet. Körs EFTER hydration-waiten, så en sida som
 * fortfarande är en vänta-sida då är en verklig challenge, inte en transient
 * laddningsskärm. Konservativ: en tydlig vänta-titel, ELLER en meta-refresh-
 * omdirigering på en nästan tom sida. En kort men riktig sida flaggas inte.
 */
export function isInterstitialPage(
    pageTitle: string | undefined,
    hasMetaRefresh: boolean,
    bodyTextLength: number
): boolean {
    if (pageTitle && INTERSTITIAL_TITLE.test(pageTitle)) return true;
    if (hasMetaRefresh && bodyTextLength < 400) return true;
    return false;
}

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

export function getStandardsVersion(): string {
    try {
        // Try to find @holmdigital/standards package.json via require.resolve.
        // Intern #43: standards `exports` måste exponera "./package.json", annars
        // faller detta på ERR_PACKAGE_PATH_NOT_EXPORTED och versionen blir 'unknown'.
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
    /**
     * Intern #43: true när den scannade sidan ser ut som en interstitial-/vänta-/
     * bot-challenge-sida. Då kan resultatet gälla en platshållarsida, inte det
     * riktiga innehållet. Rådgivande — påverkar aldrig score/stats/compliance.
     */
    interstitialSuspected?: boolean;
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
    /**
     * PASS/FAIL för en riktigt mätt sida. INCONCLUSIVE (Intern #43 fynd 1) när
     * sidan var en interstitial-/vänta-/bot-challenge-sida: motorn mätte inte det
     * riktiga innehållet, så den emitterar medvetet INGEN vanlig score/compliance
     * — `score` är 0 och `reports`/`stats` är tomma. Läs `complianceStatus` FÖRST;
     * ett INCONCLUSIVE-`score` är inte ett betyg. `metadata.interstitialSuspected`
     * bär varför.
     */
    complianceStatus: 'PASS' | 'FAIL' | 'INCONCLUSIVE';
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
        let interstitialSuspected: boolean | undefined;
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

            // Intern #43: känn av interstitial-/vänta-/challenge-sida. Görs EFTER
            // hydration-waiten — är sidan fortfarande en vänta-sida då är det en
            // verklig challenge, inte en transient laddningsskärm.
            const interstitialSignals = await page.evaluate(() => ({
                hasMetaRefresh: !!document.querySelector('meta[http-equiv="refresh" i]'),
                bodyTextLength: (document.body?.innerText ?? '').trim().length
            }));
            interstitialSuspected = isInterstitialPage(
                pageTitle, interstitialSignals.hasMetaRefresh, interstitialSignals.bodyTextLength
            );
            if (interstitialSuspected) {
                this.log('⚠️  Sidan ser ut som en vänta-/omdirigerings-/challenge-sida — resultatet kan gälla en platshållarsida, inte det riktiga innehållet. Prova ett högre --wait-for-hydration <ms>.');
            }

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
            const result = this.generateResultPackage(allReports, passedCount, scanDuration, pageTitle, pageLanguage, interstitialSuspected);
            // Intern #43: html-validering och noscript-sonden mätte också vänta-
            // sidan, inte det riktiga innehållet — häng inte på dem på ett
            // INCONCLUSIVE-resultat.
            if (result.complianceStatus !== 'INCONCLUSIVE') {
                if (htmlValidation) {
                    result.htmlValidation = htmlValidation;
                }
                if (noScript) {
                    result.noScript = noScript;
                }
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
        const { generateRegulatoryReport, getAllConvergenceRules } = await import('@holmdigital/standards');
        const { getCurrentLang } = await import('../i18n');
        const lang = getCurrentLang();
        const allRules = getAllConvergenceRules(lang);
        const selfMatchingIds = getSelfMatchingRuleIds(allRules);

        return axeResults.violations.map((violation, index) => {
            const impact = (violation as unknown as { impact?: string }).impact || 'moderate';
            const risk = impactToRisk[impact] || 'medium';

            // Lös rapporten som i enrichResults (direkt-id → kriterie-fallback,
            // Intern #30) så light-läget bär rätt lagrum och en301549 (Intern #29),
            // inte tom sträng. Den publika widgeten är ytan flest okända besökare
            // möter, och lagrumsrättelsen i #28 ska synas där.
            let report = generateRegulatoryReport(violation.id, lang);
            if (!report) {
                const ruleId = selectMappedRuleId(violation.id, violation.tags, allRules, selfMatchingIds);
                if (ruleId) report = generateRegulatoryReport(ruleId, lang);
            }

            // Klarspråk only for the top-N findings (undefined for the rest).
            const plainLanguage = index < KLARSPRAK_TOP_N ? report?.plainLanguage : undefined;

            return {
                ruleId: violation.id,
                // Intern #30: rätt kriterium ur rapporten, annars ur wcagNNN-taggarna —
                // aldrig en nivåbeteckning som "wcag2a".
                wcagCriteria: report?.wcagCriteria || criteriaFromTags(violation.tags)[0] || (violation.tags.includes('best-practice') ? 'Best Practice' : 'Unknown'),
                // Intern #29: fyll från rapporten. Omappat fynd → okänt lagrum, aldrig
                // tom sträng och aldrig en fras som utger sig för att vara ett lagrum.
                // Intern #39: för omappade fynd, använd EN-9.x ur axes egen tagg som
                // fallback innan 'Unknown' — matchad regeldata går alltid först.
                en301549Criteria: report?.en301549Criteria || en301549FromTags(violation.tags) || 'Unknown',
                dosLagenReference: report?.dosLagenReference || (lang === 'sv' ? 'Lagrum okänt' : 'Legal basis unknown'),
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
        const { generateRegulatoryReport, getConvergenceRule, getAllConvergenceRules } = await import('@holmdigital/standards');
        const { getCurrentLang } = await import('../i18n');
        const lang = getCurrentLang();
        const allRules = getAllConvergenceRules(lang);
        const selfMatchingIds = getSelfMatchingRuleIds(allRules);

        for (const violation of axeResults.violations) {
            // 1. Försök matcha direkt på Rule ID (mest exakt)
            // Detta garanterar att 'page-has-heading-one' mappar till vår regel med samma ID
            let report: RegulatoryReport | null = generateRegulatoryReport(violation.id, lang);

            // 2. Fallback: matcha på WCAG-KRITERIUM ur axes egna wcagNNN-taggar, inte
            //    på delad tagg (Intern #30/#27). Självmatchande regler föredras bort
            //    (K3) så valet aldrig beror på filordning.
            if (!report) {
                const ruleId = selectMappedRuleId(violation.id, violation.tags, allRules, selfMatchingIds);
                if (ruleId) {
                    report = generateRegulatoryReport(ruleId, lang);
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
                    // Intern #39: omappat fynd → EN-9.x ur axes egen tagg som fallback
                    // före 'Unknown'. Best practice behåller 'N/A'. Rör aldrig matchade.
                    en301549Criteria: isBestPractice ? 'N/A' : (en301549FromTags(violation.tags) || 'Unknown'),
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
            // En incomplete-post kan ha noder med olika skäl. I det frysta fallet
            // (Intern #20) kommer benigna `nonBmp`-noder (rena ikon-glyfer, →) FÖRE
            // `bgOverlap`-noden — och den senare är det verkliga granskningsbehovet.
            // Prioritera därför "kunde inte avgöra kontrast"-noder (de bär
            // contrastRatio/expectedContrastRatio i sin data) före de benigna, så
            // det som faktiskt måste granskas inte begravs och truncas bort.
            const nodeInfos = item.nodes.map(node => {
                const c = readMessageKey(node.any);
                const data = c?.data && typeof c.data === 'object' ? c.data as Record<string, unknown> : undefined;
                const messageKey = data && typeof data.messageKey === 'string' ? data.messageKey : undefined;
                const concerning = !!data && ('expectedContrastRatio' in data || 'contrastRatio' in data);
                return {
                    html: node.html,
                    target: node.target.join(' '),
                    // axes egen check-message (VARFÖR den inte kunde avgöras).
                    // Aldrig ett kontrastvärde — i bgOverlap-fallet finns inget uppmätt.
                    failureSummary: c?.message ?? node.failureSummary ?? item.help,
                    messageKey,
                    concerning
                };
            });
            // Stabil sort: granskningsvärda noder först, benigna sist.
            const ordered = nodeInfos
                .map((n, i) => ({ n, i }))
                .sort((a, b) => (Number(b.n.concerning) - Number(a.n.concerning)) || (a.i - b.i))
                .map(x => x.n);

            const reviewReason = (ordered.find(n => n.concerning) ?? ordered[0])?.messageKey;
            const failingNodes = ordered.slice(0, 3).map(n => ({
                html: n.html,
                target: n.target,
                failureSummary: n.failureSummary
            }));
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
                    // Intern #30 (sidofynd): aldrig en nivåbeteckning som kriterium.
                    // Rör inte enrichIncompletes mappnings-/needs-review-logik i övrigt.
                    wcagCriteria: criteriaFromTags(item.tags)[0] || 'Unknown',
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
        pageLanguage?: string,
        interstitialSuspected?: boolean
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
            pageLanguage,
            // Intern #43: bara med när flaggan är satt, så äldre snapshots/JSON
            // inte får ett nytt fält på nej-fallet.
            ...(interstitialSuspected ? { interstitialSuspected: true } : {})
        };

        // Intern #43 fynd 1: sidan var en interstitial-/vänta-/challenge-sida —
        // axe mätte inte det riktiga innehållet. Emitta INTE en vanlig score/
        // compliance för fel sida (en falsk 85/FAIL är värre än ett ärligt "kunde
        // inte mäta"). Släpp vänta-sidans egna artefakter (t.ex. dess meta-refresh
        // 2.2.1), nolla stats och markera resultatet INCONCLUSIVE. Rådgivande-
        // flaggan + varningen från scan() säger redan åt användaren att höja
        // --wait-for-hydration.
        if (interstitialSuspected) {
            return {
                url: this.options.url,
                timestamp: new Date().toISOString(),
                metadata,
                reports: [],
                stats: { passed: 0, critical: 0, high: 0, medium: 0, low: 0, total: 0, needsReview: 0 },
                score: 0,
                complianceStatus: 'INCONCLUSIVE',
                legalSummary: { wadApplicable: 0, eaaApplicable: 0, eaaDeadlineViolations: 0 }
            };
        }

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
