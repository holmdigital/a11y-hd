#!/usr/bin/env node

/**
 * CLI för @holmdigital/engine
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { RegulatoryScanner, ScannerOptions, getEngineVersion } from '../core/regulatory-scanner';
import { PseudoAutomationEngine } from '../automation/pseudo-automation';
import { generateReportHTML } from '../reporting/html-template';
import { generatePDF } from '../reporting/pdf-generator';
import { generateStatement, generateStatementContent, StatementMetadata } from '../reporting/statement-generator';
import { generateBadgeMarkdown } from '../reporting/badge-generator';
import { setLanguage, t } from '../i18n';
import type { EnrichedReport } from '@holmdigital/standards';
import { isPlainLanguageSupported } from '../reporting/plain-language-support';
import { sendToCloud, CloudConfig } from './cloud-client';
import type { NoScriptResult } from '../core/noscript-check';

/**
 * Skriver ut robusthetsindikatorn utan JS.
 *
 * Presenteras medvetet SEPARAT från konformansscoren och alltid tillsammans med
 * raden om att det är en rekommendation och inte ett lagkrav. Inget WCAG-
 * kriterium kräver att en sida fungerar utan JavaScript, och vi får aldrig ge
 * intryck av att detta är en överträdelse. Ändra inte den formuleringen utan
 * att först läsa noscript-check.ts.
 *
 * Vid empty och partial skrivs dessutom en rad om VEM fyndet drabbar. Utan den
 * avfärdas fyndet med "alla har ju JavaScript". Poängen är att det sällan är den
 * som valt bort JS, utan den vars skript aldrig kom fram. Raden är medvetet
 * kvalitativ och utan siffror: det enda kända underlaget (GDS 2013) är gammalt
 * och orepliterat, och en åldrande siffra hör inte hemma i ett verktyg som lever
 * länge.
 */
function renderNoScriptAdvisory(noScript: NoScriptResult): void {
    console.log(chalk.bold(t('cli.noscript_heading')));

    if (noScript.verdict === 'unknown') {
        console.log(chalk.gray(`  ${t('cli.noscript_unknown')}${noScript.error ? ` (${noScript.error})` : ''}`));
        console.log(chalk.gray(`  ${t('cli.noscript_advisory')}`));
        return;
    }

    const percent = Math.round(noScript.coverageRatio * 100);
    const color = noScript.verdict === 'empty' ? chalk.red
        : noScript.verdict === 'partial' ? chalk.yellow
            : chalk.green;
    const icon = noScript.verdict === 'empty' ? '🔴'
        : noScript.verdict === 'partial' ? '🟡'
            : '🟢';

    const summary = noScript.verdict === 'empty' ? t('cli.noscript_empty')
        : noScript.verdict === 'partial' ? t('cli.noscript_partial')
            : t('cli.noscript_ok');

    console.log(`  ${icon} ${color.bold(summary)}`);

    if (noScript.verdict !== 'ok') {
        console.log(chalk.white(`  ${t('cli.noscript_impact')}`));
    }

    console.log(chalk.white(`  ${t('cli.noscript_coverage', {
        percent,
        without: noScript.textLengthWithoutJs,
        with: noScript.textLengthWithJs
    })}`));

    if (noScript.verdict !== 'ok') {
        console.log(chalk.gray(`  ${noScript.hasNoScriptFallback ? t('cli.noscript_fallback') : t('cli.noscript_no_fallback')}`));
    }

    console.log(chalk.gray(`  ${t('cli.noscript_advisory')}`));
}

/**
 * Validates URL format
 */
function isValidUrl(urlString: string): boolean {
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

const program = new Command();

program
    .name('hd-a11y-scan')
    .description('HolmDigital Regulatory Scanner')
    .version(getEngineVersion());

import { cosmiconfig } from 'cosmiconfig';

// ... imports ...

// ... program setup ...

program
    .argument('<url>', 'URL to scan')
    .option('--lang <code>', 'Language code (en, sv)')
    .option('--ci', 'Run in CI/CD mode (exit code 1 on critical failures)')
    .option('--generate-tests', 'Generate Pseudo-Automation tests')
    .option('--json', 'Output as JSON')
    .option('--junit <path>', 'Generate JUnit XML report')
    .option('--pdf <path>', 'Generate PDF report to path')
    .option('--statement <path>', 'Generate accessibility statement HTML to path')
    .option('--format <type>', 'Output format for statement (html, md)', 'html')
    .option('--viewport <size>', 'Set viewport (e.g. "mobile", "desktop", "1024x768")')
    .option('--threshold <level>', 'Severity threshold (critical, high, medium, low)')
    .option('--api-key <key>', 'API key for HolmDigital Cloud')
    .option('--cloud-url <url>', 'Cloud API URL')
    .option('--invalid-https-cert', 'Allow scanning on pages with invalid https certificate')
    .option('--email <email>', 'Contact email for accessibility statement')
    .option('--phone <number>', 'Contact phone number for accessibility statement')
    .option('--org <name>', 'Organization name for accessibility statement')
    .option('--response-time <time>', 'Expected response time for accessibility statement')
    .option('--country <code>', 'Country code for accessibility statement enforcement body')
    .option('--sector <type>', 'Sector type: public (WAD) or private (EAA)', 'public')
    .option('--publish-date <date>', 'Publish date for the website (YYYY-MM-DD)')
    .option('--light', 'Light scan: fast score-only mode (skips HTML validation and detailed legal mapping)')
    .option('--audience <mode>', 'Output audience: developer (default) or plain', 'developer')
    .option('--plain', 'Alias for --audience plain (klarspråksläge for non-technical recipients)')
    .option('--noscript-check', 'Robustness probe: measure how much content is available without JavaScript. Advisory only, never affects the compliance score.')
    .action(async (url: string, cliOptions) => {
        // 1. Load Config from file (.a11yrc, package.json, etc.)
        const explorer = cosmiconfig('a11y');
        const configResult = await explorer.search();
        const fileConfig = configResult ? configResult.config : {};

        // 2. Merge Options: CLI > File > Defaults
        const options = {
            lang: cliOptions.lang || fileConfig.lang || 'en',
            ci: cliOptions.ci ?? fileConfig.ci ?? false,
            generateTests: cliOptions.generateTests ?? fileConfig.generateTests ?? false,
            json: cliOptions.json ?? fileConfig.json ?? false,
            junit: cliOptions.junit || fileConfig.junit,
            pdf: cliOptions.pdf || fileConfig.pdf,
            statement: cliOptions.statement || fileConfig.statement,
            format: cliOptions.format || fileConfig.format || 'html',
            viewport: cliOptions.viewport || fileConfig.viewport, // Handled specifically below
            threshold: cliOptions.threshold || fileConfig.threshold || 'high',
            apiKey: cliOptions.apiKey || fileConfig.apiKey,
            cloudUrl: cliOptions.cloudUrl || fileConfig.cloudUrl || 'https://cloud.holmdigital.se',
            invalidHttpsCert: cliOptions.invalidHttpsCert ?? fileConfig.invalidHttpsCert ?? false,
            // Metadata for accessibility statement
            email: cliOptions.email || fileConfig.email,
            phone: cliOptions.phone || fileConfig.phone,
            org: cliOptions.org || fileConfig.org,
            responseTime: cliOptions.responseTime || fileConfig.responseTime,
            country: cliOptions.country || fileConfig.country,
            sector: cliOptions.sector || fileConfig.sector || 'public',
            publishDate: cliOptions.publishDate || fileConfig.publishDate,
            light: cliOptions.light ?? fileConfig.light ?? false,
            plain: cliOptions.plain ?? fileConfig.plain ?? false,
            // Commander camelCase:ar --noscript-check till noscriptCheck.
            noScriptCheck: cliOptions.noscriptCheck ?? fileConfig.noScriptCheck ?? false,
            audience: cliOptions.plain
                ? 'plain'
                : (cliOptions.audience || fileConfig.audience || 'developer'),
        } as ScannerOptions & {
            lang: string;
            ci: boolean;
            generateTests: boolean;
            json: boolean;
            junit?: string;
            pdf?: string;
            statement?: string;
            format: 'html' | 'md' | 'markdown';
            viewport?: string | { width: number; height: number };
            threshold: string;
            apiKey?: string;
            cloudUrl: string;
            invalidHttpsCert: boolean;
            email?: string;
            phone?: string;
            org?: string;
            responseTime?: string;
            country?: string;
            sector?: 'public' | 'private';
            publishDate?: string;
            light: boolean;
            plain: boolean;
            audience: 'developer' | 'plain';
            noScriptCheck: boolean;
        };

        setLanguage(options.lang);

        // Klarspråk fallback: --plain in a language we do not yet cover natively
        // is served in English (the plain-language floor) with a notice, rather
        // than refused, so every country gets a readable report. We fill native
        // languages one country at a time; until then, English. Switch the render
        // language to English BEFORE scanning so enrichment picks the English
        // plainLanguage. JSON output is raw data, unaffected by audience, ungated.
        let plainFallbackFrom: string | undefined;
        if (options.audience === 'plain' && !options.json && !isPlainLanguageSupported(options.lang)) {
            plainFallbackFrom = options.lang;
            setLanguage('en');
        }

        if (!isValidUrl(url)) {
            // ... validation ...
        }

        if (!options.json) {
            console.log(chalk.blue.bold(t('cli.title')));
            if (configResult) console.log(chalk.gray(`Loaded config from ${configResult.filepath}`));
            console.log(chalk.gray(t('cli.scanning', { url })));
        }

        const spinner = !options.json ? ora(t('cli.initializing')).start() : null;
        let scanner: RegulatoryScanner | undefined;

        try {
            // Parse viewport options
            let viewport = { width: 1280, height: 720 }; // Default Desktop
            // Check formatted viewport string from CLI
            if (options.viewport && typeof options.viewport === 'string') {
                if (options.viewport === 'mobile') viewport = { width: 375, height: 667 };
                else if (options.viewport === 'desktop') viewport = { width: 1920, height: 1080 };
                else if (options.viewport === 'tablet') viewport = { width: 768, height: 1024 };
                else {
                    const [w, h] = options.viewport.split('x').map(Number);
                    if (w && h) viewport = { width: w, height: h };
                }
            }
            // Handle object config from file
            else if (options.viewport && typeof options.viewport === 'object') {
                viewport = options.viewport;
            }

            scanner = new RegulatoryScanner({
                url,
                failOnCritical: options.ci,
                viewport,
                silent: options.json || options.light,
                severityThreshold: options.threshold as 'critical' | 'high' | 'medium' | 'low',
                invalidHttpsCert: options.invalidHttpsCert,
                light: options.light,
                noScriptCheck: options.noScriptCheck
            });

            if (spinner) spinner.text = t('cli.analyzing');

            const result = await scanner.scan();

            if (spinner) spinner.succeed(t('cli.complete'));

            // PDF Generation
            if (options.pdf) {
                if (spinner) spinner.start(t('cli.generating_pdf'));
                const html = options.audience === 'plain'
                    ? generateReportHTML(result, options.sector as 'public' | 'private', 'plain', plainFallbackFrom)
                    : generateReportHTML(result, options.sector as 'public' | 'private');
                await generatePDF(html, options.pdf);
                if (spinner) spinner.succeed(t('cli.pdf_saved', { path: options.pdf }));
            }

            // Statement Generation
            if (options.statement) {
                if (spinner) spinner.start(t('cli.generating_statement', { path: options.statement }));

                const metadata: StatementMetadata = {
                    contactEmail: options.email,
                    phoneNumber: options.phone,
                    organizationName: options.org,
                    responseTime: options.responseTime,
                    country: options.country,
                    sector: options.sector as 'public' | 'private',
                    publishDate: options.publishDate
                };

                if (options.statement.toLowerCase().endsWith('.pdf')) {
                    const htmlContent = await generateStatementContent(result, options.lang, 'html', metadata);
                    await generatePDF(htmlContent, options.statement);
                } else {
                    await generateStatement(result, options.statement, options.lang, options.format, metadata);
                }

                if (spinner) spinner.succeed(t('cli.statement_saved', { path: options.statement }));
            }

            if (options.json && options.light) {
                // Stripped-down JSON for API consumption
                const lightResult = {
                    url: result.url,
                    score: result.score,
                    complianceStatus: result.complianceStatus,
                    stats: result.stats,
                    scanDuration: result.metadata.scanDuration,
                    // Rådgivande robusthetsindikator. Undefined när --noscript-check
                    // inte används och faller då ur JSON:en av sig själv.
                    noScript: result.noScript,
                    topIssues: result.reports.slice(0, 5).map(r => ({
                        id: r.ruleId,
                        impact: r.holmdigitalInsight.diggRisk,
                        description: r.remediation.description,
                        // Plain-language (klarspråk) fields, present when the rule
                        // is covered; undefined values drop out of the JSON.
                        headline: r.plainLanguage?.headline,
                        businessImpact: r.plainLanguage?.businessImpact,
                        impactLevel: r.plainLanguage?.impactLevel
                    }))
                };
                console.log(JSON.stringify(lightResult, null, 2));
            } else if (options.json) {
                console.log(JSON.stringify(result, null, 2));
            } else if (options.light) {
                // Compact CLI output for light scan
                const scoreColor = result.score >= 90 ? chalk.green : (result.score >= 70 ? chalk.yellow : chalk.red);
                const statusColor = result.complianceStatus === 'PASS' ? chalk.green : chalk.red;

                console.log('');
                console.log(chalk.bold(`Score: ${scoreColor(`${result.score}/100`)}  Status: ${statusColor(result.complianceStatus)}`));
                console.log(chalk.gray(`Critical: ${result.stats.critical} | High: ${result.stats.high} | Medium: ${result.stats.medium} | Low: ${result.stats.low}`));

                if (result.reports.length > 0) {
                    console.log('');
                    console.log(chalk.bold('Top Issues:'));
                    result.reports.slice(0, 5).forEach(r => {
                        const color = r.holmdigitalInsight.diggRisk === 'critical' ? chalk.red
                            : r.holmdigitalInsight.diggRisk === 'high' ? chalk.yellow : chalk.gray;
                        console.log(color(`  [${r.holmdigitalInsight.diggRisk.toUpperCase()}] ${r.ruleId} — ${r.remediation.description}`));
                    });
                }

                console.log(chalk.gray(`\nScan: ${result.metadata.scanDuration}ms | ${result.metadata.engineVersion}`));
            } else if (options.audience === 'plain') {
                const { renderPlainReport } = await import('../reporting/plain-report');
                renderPlainReport(result, plainFallbackFrom ? 'en' : options.lang, plainFallbackFrom);
            } else {
                // --- CLI DASHBOARD IMPLEMENTATION ---

                // 1. Header & Score
                console.log('\n');
                const scoreColor = result.score >= 90 ? chalk.green : (result.score >= 70 ? chalk.yellow : chalk.red);
                console.log(chalk.bold(`[ Compliance Score: ${scoreColor(result.score + '/100')} ] ${result.score >= 90 ? '🟢' : (result.score >= 70 ? '🟡' : '🔴')}`));

                if (result.score === 100) {
                    const badge = generateBadgeMarkdown(result.score);
                    if (badge) {
                        console.log(chalk.green.bold('\n🏆 Perfect Score! Here is your accessibility badge:'));
                        console.log(chalk.white(badge));
                    }
                }

                console.log(chalk.gray('----------------------------------------'));

                // 2. Category Progress Bars
                // Provide a rough visualization based on types of failures found
                const calculateCategoryScore = (filterFn: (r: EnrichedReport) => boolean) => {
                    const failures = result.reports.filter(filterFn).length;
                    // Formula: Start at 100, deduct 20 per failure, min 10.
                    return Math.max(10, 100 - (failures * 20));
                };

                const cats = [
                    {
                        name: 'HTML Structure',
                        score: calculateCategoryScore(r => ['1.3.1', '4.1.1', '4.1.2'].some(c => r.wcagCriteria.includes(c))),
                        critical: false
                    },
                    {
                        name: 'Keyboard Nav  ',
                        score: calculateCategoryScore(r => ['2.1.1', '2.1.2', '2.4.3', '2.4.7'].some(c => r.wcagCriteria.includes(c))),
                        critical: result.reports.some(r => ['2.1.1', '2.1.2'].some(c => r.wcagCriteria.includes(c)) && r.holmdigitalInsight.diggRisk === 'critical')
                    },
                    {
                        name: 'Contrast      ',
                        score: calculateCategoryScore(r => r.wcagCriteria.includes('1.4.3') || r.ruleId === 'color-contrast'),
                        critical: false
                    }
                ];

                cats.forEach(cat => {
                    const width = 10;
                    const filled = Math.round((cat.score / 100) * width);
                    const empty = width - filled;
                    const bar = '█'.repeat(filled) + '░'.repeat(empty);

                    let statusText = `${cat.score}%`;
                    if (cat.critical) statusText += chalk.red(' (CRITICAL FAIL)');
                    else if (cat.score < 100) statusText += chalk.gray(' (Minor issues)');

                    console.log(`${cat.name}   [${cat.score >= 80 ? chalk.green(bar) : (cat.score >= 50 ? chalk.yellow(bar) : chalk.red(bar))}] ${statusText}`);
                });

                console.log(chalk.gray('----------------------------------------'));

                // 3. Legal Risk Assessment
                let legalRisk = 'LOW';
                let riskReason = 'No critical violations found.';
                let riskIcon = '✅';

                if (result.legalSummary && result.legalSummary.eaaDeadlineViolations > 0) {
                    legalRisk = 'HIGH';
                    // Determine actual risk reason based on violations
                    const hasKeyboardIssues = result.reports.some(r =>
                        ['2.1.1', '2.1.2'].some(c => r.wcagCriteria.includes(c)));
                    const hasContrastIssues = result.reports.some(r =>
                        r.wcagCriteria.includes('1.4.3') || r.ruleId === 'color-contrast');
                    const hasStructureIssues = result.reports.some(r =>
                        r.wcagCriteria.includes('1.3.1'));

                    if (hasKeyboardIssues) riskReason = 'Keyboard accessibility blocks EAA compliance';
                    else if (hasContrastIssues) riskReason = 'Contrast issues block EAA compliance';
                    else if (hasStructureIssues) riskReason = 'HTML structure issues block EAA compliance';
                    else riskReason = `${result.legalSummary.eaaDeadlineViolations} EAA deadline violation(s) found`;
                    riskIcon = '⚖️ ';
                } else if (result.stats.critical > 0) {
                    legalRisk = 'MEDIUM';
                    riskReason = 'Critical violations found.';
                    riskIcon = '⚠️ ';
                }

                console.log(`${riskIcon} Legal Risk: ${legalRisk === 'HIGH' ? chalk.red.bold(legalRisk) : (legalRisk === 'MEDIUM' ? chalk.yellow.bold(legalRisk) : chalk.green(legalRisk))} (${chalk.white(riskReason)})`);
                console.log('\n');

                // 4. Detailed Validation Errors (HTML)
                if (result.htmlValidation && !result.htmlValidation.valid) {
                    console.log(chalk.red.bold('⚠️  Structural HTML Issues Detected'));
                    console.log(chalk.yellow('    These issues may affect accessibility tool accuracy (e.g. contrast calculations)\n'));

                    result.htmlValidation.errors.forEach((error) => {
                        console.log(chalk.red(`    [${error.rule}] ${error.message}`));
                    });
                    console.log(chalk.gray('    ... and more (run with --json for full details)'));
                    console.log(chalk.gray('----------------------------------------'));
                }

                // 5. Report Details
                if (result.reports.length > 0) {
                    console.log(chalk.bold('Top Violations:'));
                }

                result.reports.forEach((report, i) => {
                    if (i > 5) return; // Limit to top 5 for CLI readability

                    const color = report.holmdigitalInsight.diggRisk === 'critical' ? chalk.red : chalk.yellow;
                    console.log(color.bold(`\n[${report.holmdigitalInsight.diggRisk.toUpperCase()}] ${report.ruleId}`));
                    console.log(chalk.white(`WCAG: ${report.wcagCriteria} | EN 301 549: ${report.en301549Criteria}`));

                    if (report.remediation.component) {
                        console.log(chalk.green(`Fix: Use component <${report.remediation.component} />`));
                    }
                });

                if (result.reports.length > 5) {
                    console.log(chalk.gray(`\n... and ${result.reports.length - 5} more issues.`));
                }

                console.log(chalk.gray('\n----------------------------------------'));
                console.log(`Scan Date: ${new Date().toISOString().split('T')[0]}`);
                console.log('\n');

                if (options.generateTests) {
                    console.log(chalk.magenta.bold(t('cli.pseudo_tests')));
                    const automation = new PseudoAutomationEngine();
                    result.reports.forEach(report => {
                        if (report.testability.pseudoAutomation) {
                            console.log(chalk.cyan(t('cli.test_for', { ruleId: report.ruleId })));
                            console.log(chalk.gray(automation.generateTestScript(report, url)));
                        }
                    });
                }
            }

            // Robusthet utan JS: skrivs ut för alla människoläsbara lägen (dashboard,
            // light och klarspråk). JSON-lägena bär datan i result.noScript i stället.
            if (result.noScript && !options.json) {
                renderNoScriptAdvisory(result.noScript);
            }

            if (options.ci && result.reports.length > 0) {
                const { generateGitHubActionsAnnotations } = await import('../reporting/github-actions');
                generateGitHubActionsAnnotations(result.reports);
            }

            // JUnit Output
            if (options.junit) {
                const { generateJUnitXML } = await import('../reporting/junit-generator');
                const fs = await import('fs/promises');
                const xml = generateJUnitXML(result);
                await fs.writeFile(options.junit, xml);
                if (spinner) spinner.succeed(t('cli.junit_saved', { path: options.junit }));
                else if (!options.json) console.log(chalk.green(`✓ JUnit report saved to ${options.junit}`));
            }

            if (options.ci && result.stats.critical > 0) {
                if (!options.json) console.error(chalk.red(t('cli.critical_failure')));
                process.exit(1);
            }

            // Cloud Integration: Send results if API key is provided
            if (options.apiKey) {
                const cloudSpinner = !options.json ? ora('Uploading results to HolmDigital Cloud...').start() : null;

                const cloudConfig: CloudConfig = {
                    apiKey: options.apiKey,
                    cloudUrl: options.cloudUrl
                };

                const cloudResponse = await sendToCloud(cloudConfig, result);

                if (cloudResponse.success) {
                    if (cloudSpinner) cloudSpinner.succeed('Results uploaded to HolmDigital Cloud');
                    if (!options.json) {
                        console.log(chalk.green(`✓ ${cloudResponse.message}`));
                    }
                } else {
                    if (cloudSpinner) cloudSpinner.fail('Cloud upload failed');
                    if (!options.json) {
                        console.error(chalk.red(`Cloud error: ${cloudResponse.error}`));
                    }
                }
            }

        } catch (error) {
            if (spinner) spinner.fail(t('cli.scan_failed'));

            // Clean error output for users
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
                console.error(chalk.red(`Error: Could not resolve domain for '${url}'`));
                console.error(chalk.gray('Please check that the URL is correct and the site is accessible.'));
            } else if (errorMessage.includes('ERR_CONNECTION_REFUSED')) {
                console.error(chalk.red(`Error: Connection refused for '${url}'`));
                console.error(chalk.gray('The server may be down or blocking automated access.'));
            } else if (errorMessage.includes('Timeout')) {
                console.error(chalk.red(`Error: Connection timed out for '${url}'`));
                console.error(chalk.gray('The page took too long to respond.'));
            } else {
                console.error(chalk.red(`Error: ${errorMessage}`));
            }

            process.exit(1);
        } finally {
            // Ensure browser is closed to avoid EBUSY/lockfiles
            if (typeof scanner !== 'undefined') {
                await scanner.close();
            }
        }
    });

program.parse();
