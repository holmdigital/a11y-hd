import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('Starting verification...');
    console.log('Navigating to Wiki...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    await page.setViewport({ width: 1280, height: 800 });

    // 1. Navigate to "Navigation" page
    console.log('Clicking "Navigation" sidebar link...');
    const foundLink = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const target = buttons.find(el => el.textContent?.includes('Navigation'));
        if (target) {
            target.click();
            return true;
        }
        return false;
    });

    if (!foundLink) {
        console.error('Could not find nav link "Navigation"');
        process.exit(1);
    }

    // 2. Wait for content
    console.log('Waiting for content...');
    try {
        await page.waitForFunction(() => {
            return document.body.innerText.includes('Skip Link');
        }, { timeout: 3000 });
        console.log('Page loaded.');
    } catch (e) {
        console.error('Timeout waiting for page content.');
        process.exit(1);
    }

    // 3. Verify SkipLink presence
    const skipLinkExists = await page.evaluate(() => {
        const link = document.querySelector('a[href="#demo-content"]');
        return !!link;
    });
    if (skipLinkExists) {
        console.log('SUCCESS: SkipLink found.');
    } else {
        console.error('FAILURE: SkipLink not found.');
        process.exit(1);
    }

    // 4. Verify Navigation Menu presence
    const navExists = await page.evaluate(() => {
        const nav = document.querySelector('nav[aria-label="Main Navigation"]');
        return !!nav;
    });
    if (navExists) {
        console.log('SUCCESS: NavigationMenu found.');
    } else {
        console.error('FAILURE: NavigationMenu not found.');
        process.exit(1);
    }

    // 5. Test Dropdown Interaction
    console.log('Testing dropdown...');
    const dropdownOpened = await page.evaluate(async () => {
        const buttons = Array.from(document.querySelectorAll('nav button'));
        const trigger = buttons.find(b => b.textContent?.includes('Services'));

        if (!trigger) return 'TRIGGER_NOT_FOUND';

        trigger.click();

        // Wait for React to update
        await new Promise(r => setTimeout(r, 200));

        // Check aria-expanded
        if (trigger.getAttribute('aria-expanded') !== 'true') return 'ARIA_NOT_UPDATED';

        return 'OK';
    });

    if (dropdownOpened === 'OK') {
        console.log('SUCCESS: Dropdown opened and aria-expanded updated.');
    } else {
        console.error(`FAILURE: Dropdown test failed with code: ${dropdownOpened}`);
        process.exit(1);
    }

    await browser.close();
})();
