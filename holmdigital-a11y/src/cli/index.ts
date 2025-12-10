#!/usr/bin/env node

/**
 * HolmDigital A11y CLI
 * Kommandoradsverktyg för tillgänglighetstestning
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { AccessibilityScanner } from '../core/scanner';
import { HTMLReporter } from '../reporters/html-reporter';
import type { AccessibilityStandard, WCAGLevel } from '../types';
import { writeFileSync } from 'fs';
import { join } from 'path';

const program = new Command();

program
    .name('holmdigital-a11y')
    .description('Tillgänglighetstestning för WCAG, EN 301 549 och DOS-lagen')
    .version('0.1.0');

program
    .command('scan')
    .description('Scanna en webbsida för tillgänglighetsproblem')
    .argument('<url>', 'URL att scanna')
    .option('-s, --standard <standard>', 'Standard att testa mot (wcag|en301549|dos-lagen|all)', 'all')
    .option('-l, --level <level>', 'WCAG-nivå (A|AA|AAA)', 'AA')
    .option('-o, --output <path>', 'Output-sökväg för rapport', './a11y-report.html')
    .option('-f, --format <format>', 'Rapport-format (html|json)', 'html')
    .option('--no-screenshots', 'Inkludera inte screenshots')
    .option('--headless <boolean>', 'Kör i headless mode', 'true')
    .action(async (url: string, options) => {
        console.log(chalk.bold.blue('\n🌐 HolmDigital A11y\n'));
        console.log(chalk.gray(`Scannar: ${url}\n`));

        const spinner = ora('Initialiserar scanner...').start();

        try {
            // Validera URL
            new URL(url);

            // Skapa scanner
            const scanner = new AccessibilityScanner({
                url,
                standard: options.standard as AccessibilityStandard,
                wcagLevel: options.level as WCAGLevel,
                includeScreenshots: options.screenshots,
                headless: options.headless === 'true',
            });

            spinner.text = 'Laddar sida...';

            // Kör scan
            const result = await scanner.scan();

            spinner.succeed(chalk.green('Scan slutförd!'));

            // Visa sammanfattning
            console.log(chalk.bold('\n📊 Sammanfattning:\n'));
            console.log(`  ${chalk.bold('Compliance Score:')} ${getScoreColor(result.summary.complianceScore)}${result.summary.complianceScore}%${chalk.reset()}`);
            console.log(`  ${chalk.bold('Violations:')} ${result.summary.totalViolations}`);
            console.log(`    ${chalk.red('●')} Kritiska: ${result.summary.violationsByImpact.critical}`);
            console.log(`    ${chalk.yellow('●')} Allvarliga: ${result.summary.violationsByImpact.serious}`);
            console.log(`    ${chalk.blue('●')} Måttliga: ${result.summary.violationsByImpact.moderate}`);
            console.log(`    ${chalk.cyan('●')} Mindre: ${result.summary.violationsByImpact.minor}`);
            console.log(`  ${chalk.bold('Godkända:')} ${result.summary.totalPasses}`);
            console.log(`  ${chalk.bold('Element scannade:')} ${result.summary.totalElements}`);

            // Generera rapport
            const reportSpinner = ora('Genererar rapport...').start();

            if (options.format === 'html') {
                const reporter = new HTMLReporter(result);
                await reporter.generate(options.output);
                reportSpinner.succeed(chalk.green(`HTML-rapport sparad: ${options.output}`));
            } else if (options.format === 'json') {
                const jsonOutput = JSON.stringify(result, null, 2);
                writeFileSync(options.output, jsonOutput, 'utf-8');
                reportSpinner.succeed(chalk.green(`JSON-rapport sparad: ${options.output}`));
            }

            console.log(chalk.bold.green('\n✅ Klart!\n'));

            // Exit med felkod om det finns kritiska violations
            if (result.summary.violationsByImpact.critical > 0) {
                process.exit(1);
            }

        } catch (error) {
            spinner.fail(chalk.red('Scan misslyckades'));
            console.error(chalk.red(`\n❌ Fel: ${error instanceof Error ? error.message : 'Okänt fel'}\n`));
            process.exit(1);
        }
    });

program
    .command('info')
    .description('Visa information om tillgänglighetsstandarder')
    .option('-s, --standard <standard>', 'Standard att visa info om (wcag|en301549|dos-lagen)')
    .action((options) => {
        console.log(chalk.bold.blue('\n🌐 HolmDigital A11y - Standarder\n'));

        if (!options.standard || options.standard === 'wcag') {
            console.log(chalk.bold('WCAG (Web Content Accessibility Guidelines)'));
            console.log('Internationell standard för webbtillgänglighet');
            console.log('Nivåer: A, AA, AAA');
            console.log(chalk.gray('Läs mer: https://a11y.holmdigital.se/wcag\n'));
        }

        if (!options.standard || options.standard === 'en301549') {
            console.log(chalk.bold('EN 301 549'));
            console.log('Europeisk standard för tillgänglighet av IKT-produkter');
            console.log('Används vid offentliga upphandlingar i EU');
            console.log(chalk.gray('Läs mer: https://a11y.holmdigital.se/en-301-549\n'));
        }

        if (!options.standard || options.standard === 'dos-lagen') {
            console.log(chalk.bold('DOS-lagen'));
            console.log('Svensk lag om tillgänglighet till digital offentlig service');
            console.log('Kräver WCAG 2.1 nivå AA för offentliga webbplatser');
            console.log(chalk.gray('Läs mer: https://a11y.holmdigital.se/dos-lagen\n'));
        }
    });

program
    .command('wiki')
    .description('Öppna HolmDigital kunskapsdatabas')
    .argument('[topic]', 'Ämne att öppna (wcag|en301549|dos-lagen|lexikon)')
    .action((topic?: string) => {
        const baseUrl = 'https://a11y.holmdigital.se';
        const url = topic ? `${baseUrl}/${topic}` : baseUrl;

        console.log(chalk.blue(`\n🌐 Öppnar: ${url}\n`));

        // Öppna i webbläsare (plattformsoberoende)
        const open = require('open');
        open(url);
    });

/**
 * Hjälpfunktion för att färglägga score
 */
function getScoreColor(score: number): string {
    if (score >= 90) return chalk.green.bold;
    if (score >= 70) return chalk.yellow.bold;
    if (score >= 50) return chalk.orange.bold;
    return chalk.red.bold;
}

// Parse arguments
program.parse();
