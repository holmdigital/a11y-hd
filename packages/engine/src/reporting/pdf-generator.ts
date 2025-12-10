
import puppeteer from 'puppeteer';

/**
 * Generera en PDF från HTML-innehåll
 */
export async function generatePDF(htmlContent: string, outputPath: string): Promise<void> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

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
