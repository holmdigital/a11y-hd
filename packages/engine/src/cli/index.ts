#!/usr/bin/env node

/**
 * CLI för @holmdigital/engine
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { RegulatoryScanner } from '../core/regulatory-scanner';
import { PseudoAutomationEngine } from '../automation/pseudo-automation';
import { generateReportHTML } from '../reporting/html-template';
import { generatePDF } from '../reporting/pdf-generator';
import { generateBadgeMarkdown } from '../reporting/badge-generator';
import { setLanguage, t } from '../i18n';
import { sendToCloud, CloudConfig } from './cloud-client';

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
    .version('0.1.0');

program
    .argument('<url>', 'URL to scan')
    .option('--lang <code>', 'Language code (en, sv)', 'en')
    .option('--ci', 'Run in CI/CD mode (exit code 1 on critical failures)')
    .option('--generate-tests', 'Generate Pseudo-Automation tests')
    .option('--json', 'Output as JSON')
    .option('--pdf <path>', 'Generate PDF report to path')
    .option('--viewport <size>', 'Set viewport (e.g. "mobile", "desktop", "1024x768")')
    .option('--threshold <level>', 'Severity threshold for compliance (critical, high, medium, low)', 'high')
    .option('--api-key <key>', 'API key for HolmDigital Cloud authentication')
    .option('--cloud-url <url>', 'Cloud API URL', 'https://cloud.holmdigital.se')
    .option('--invalid-https-cert', 'Allow scanning on pages with invalid https certificate')
    .action(async (url: string, options) => {
        setLanguage(options.lang);

        // Validate URL format first
        if (!isValidUrl(url)) {
            console.error(chalk.red(`Error: Invalid URL format '${url}'`));
            console.error(chalk.gray('URL must start with http:// or https://'));
            process.exit(1);
        }

        if (!options.json) {
            console.log(chalk.blue.bold(t('cli.title')));
            console.log(chalk.gray(t('cli.scanning', { url })));
        }

        const spinner = !options.json ? ora(t('cli.initializing')).start() : null;
        let scanner: RegulatoryScanner | undefined;

        try {
            // Parse viewport options
            let viewport = { width: 1280, height: 720 }; // Default Desktop
            if (options.viewport) {
                if (options.viewport === 'mobile') viewport = { width: 375, height: 667 };
                else if (options.viewport === 'desktop') viewport = { width: 1920, height: 1080 };
                else if (options.viewport === 'tablet') viewport = { width: 768, height: 1024 };
                else {
                    const [w, h] = options.viewport.split('x').map(Number);
                    if (w && h) viewport = { width: w, height: h };
                }
            }

            scanner = new RegulatoryScanner({
                url,
                failOnCritical: options.ci,
                viewport,
                silent: options.json, // Suppress debug output for JSON mode
                severityThreshold: options.threshold as 'critical' | 'high' | 'medium' | 'low',
                invalidHttpsCert: options.invalidHttpsCert
            });

            if (spinner) spinner.text = t('cli.analyzing');

            const result = await scanner.scan();

            if (spinner) spinner.succeed(t('cli.complete'));

            // PDF Generation
            if (options.pdf) {
                if (spinner) spinner.start(t('cli.generating_pdf'));
                const html = generateReportHTML(result);
                await generatePDF(html, options.pdf);
                if (spinner) spinner.succeed(t('cli.pdf_saved', { path: options.pdf }));
            }

            if (options.json) {
                console.log(JSON.stringify(result, null, 2));
            } else {
                // --- CLI DASHBOARD IMPLEMENTATION ---

                // 1. Header & Score
                console.log('\n');
                const scoreColor = result.score >= 90 ? chalk.green : (result.score >= 70 ? chalk.yellow : chalk.red);
                console.log(chalk.bold(`[ Compliance Score: ${scoreColor(result.score + '/100')} ] ${result.score >= 90 ? '🟢' : (result.score >= 70 ? '🟡' : '🔴')}`));
                console.log(chalk.gray('----------------------------------------'));

                // 2. Category Progress Bars
                // Provide a rough visualization based on types of failures found
                const calculateCategoryScore = (filterFn: (r: any) => boolean) => {
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
                    riskReason = 'Keyboard Nav blocks EAA compliance';
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

                    result.htmlValidation.errors.forEach((error: any) => {
                        console.log(chalk.red(`    [${error.rule}] ${error.message}`));
                    });
                    console.log(chalk.gray('    ... and more (run with --json for full details)'));
                    console.log(chalk.gray('----------------------------------------'));
                }

                // 5. Report Details
                if (result.reports.length > 0) {
                    console.log(chalk.bold('Top Violations:'));
                }

                result.reports.forEach((report: any, i: number) => {
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
