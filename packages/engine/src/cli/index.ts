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
import { setLanguage, t } from '../i18n';

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
    .option('--lang <code', 'Language code (en, sv)', 'en')
    .option('--ci', 'Run in CI/CD mode (exit code 1 on critical failures)')
    .option('--generate-tests', 'Generate Pseudo-Automation tests')
    .option('--json', 'Output as JSON')
    .option('--pdf <path>', 'Generate PDF report to path')
    .option('--viewport <size>', 'Set viewport (e.g. "mobile", "desktop", "1024x768")')
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
                silent: options.json // Suppress debug output for JSON mode
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
                // Human readable output
                console.log(chalk.bold(t('cli.score', { score: result.score })));

                const statusColor = result.complianceStatus === 'PASS' ? chalk.green : chalk.red;
                console.log(statusColor.bold(t('cli.status', { status: result.complianceStatus })));
                if (result.complianceStatus === 'FAIL') {
                    console.log(chalk.red(t('cli.not_compliant')));
                }

                console.log(chalk.gray('----------------------------------------'));

                if (options.viewport) {
                    console.log(chalk.blue(t('cli.viewport', { width: viewport.width, height: viewport.height })));
                }

                // @ts-ignore
                if (result.htmlValidation && !result.htmlValidation.valid) {
                    console.log(chalk.red.bold('\n⚠️  Structural HTML Issues Detected'));
                    console.log(chalk.yellow('    These issues may affect accessibility tool accuracy (e.g. contrast calculations)\n'));

                    // @ts-ignore
                    result.htmlValidation.errors.forEach((error: any) => {
                        console.log(chalk.red(`    [${error.rule}] ${error.message}`));
                        if (error.selector) console.log(chalk.gray(`    ${error.selector}`));
                        console.log(chalk.gray(`    Line: ${error.line}, Col: ${error.column}\n`));
                    });
                    console.log(chalk.gray('----------------------------------------'));
                }

                result.reports.forEach((report: any) => {
                    const color = report.holmdigitalInsight.diggRisk === 'critical' ? chalk.red : chalk.yellow;

                    console.log(color.bold(`\n[${report.holmdigitalInsight.diggRisk.toUpperCase()}] ${report.ruleId}`));
                    console.log(chalk.white(`WCAG: ${report.wcagCriteria} | EN 301 549: ${report.en301549Criteria}`));
                    console.log(chalk.gray(`Legitimitet: ${report.dosLagenReference}`));

                    if (report.remediation.component) {
                        console.log(chalk.green(t('cli.prescriptive_fix')));
                        console.log(t('cli.use_component', { component: chalk.bold(report.remediation.component) }));
                    }

                    // @ts-ignore
                    if (report.failingNodes && report.failingNodes.length > 0) {
                        console.log(chalk.gray('\nAffected Elements:'));
                        // @ts-ignore
                        report.failingNodes.forEach((node: any, index: number) => {
                            if (index < 5) { // Limit output
                                console.log(chalk.cyan(`➜ ${node.target}`));
                                console.log(chalk.gray(`  ${node.html}`));
                            }
                        });
                        // @ts-ignore
                        if (report.failingNodes.length > 5) {
                            console.log(chalk.gray(`  ...and ${report.failingNodes.length - 5} more`));
                        }
                    }
                });

                console.log(chalk.gray('\n----------------------------------------'));
                console.log(`Critical: ${result.stats.critical} | High: ${result.stats.high} | Medium: ${result.stats.medium} | Total: ${result.stats.total}\n`);

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

            if (options.ci && result.stats.critical > 0) {
                if (!options.json) console.error(chalk.red(t('cli.critical_failure')));
                process.exit(1);
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
