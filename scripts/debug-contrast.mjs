import puppeteer from 'puppeteer';
import axe from 'axe-core';

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    console.log('Injecting Axe...');
    await page.addScriptTag({ content: axe.source });

    console.log('Running analysis...');
    const results = await page.evaluate(async () => {
        return await axe.run({
            runOnly: ['color-contrast']
        });
    });

    if (results.violations.length === 0) {
        console.log('SUCCESS: No contrast violations found.');
    } else {
        console.log(`FAILURE: Found ${results.violations.length} violations.`);
        results.violations.forEach(v => {
            console.log(`\nRule: ${v.id}`);
            v.nodes.forEach(n => {
                console.log(`  Selector: ${n.target}`);
                console.log(`  HTML: ${n.html}`);
                console.log(`  Failure Summary: ${n.failureSummary}`);
            });
        });
    }

    await browser.close();
})();
