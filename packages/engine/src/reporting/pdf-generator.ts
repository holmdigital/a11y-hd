
import puppeteer from 'puppeteer';
import { chromeLaunchArgs, explainLaunchFailure, type LaunchPolicy } from '../core/browser-launch';

/**
 * Generera en PDF från HTML-innehåll.
 *
 * Intern #53 steg 2: sandboxen är på här också, med samma uttryckliga
 * opt-out som skannern (`sandbox: false` eller PUPPETEER_ARGS).
 */
export async function generatePDF(htmlContent: string, outputPath: string, policy: LaunchPolicy = {}): Promise<void> {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: chromeLaunchArgs(policy)
        });
    } catch (e) {
        throw explainLaunchFailure(e, policy);
    }

    try {
        const page = await browser.newPage();

        // Sätt innehåll
        await page.setContent(htmlContent, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Generera PDF
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

    } finally {
        await browser.close();
    }
}
