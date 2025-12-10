import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Starting verification...');
    console.log('Navigating to Wiki...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    // --- TEST 1: BREADCRUMBS ---
    console.log('\n--- BREADCRUMBS TEST ---');
    console.log('Navigating to Navigation page...');

    // Click navigation link
    await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, button'));
        const navLink = links.find(el => el.textContent?.includes('Navigation'));
        if (navLink) navLink.click();
    });

    try {
        await page.waitForSelector('nav[aria-label="Breadcrumb"]', { timeout: 3000 });
        console.log('SUCCESS: Breadcrumb nav found.');
    } catch {
        console.error('FAILURE: Breadcrumb nav not found.');
        process.exit(1);
    }

    const breadcrumbResult = await page.evaluate(() => {
        const items = document.querySelectorAll('nav[aria-label="Breadcrumb"] li');
        const lastItem = items[items.length - 1]; // The item itself has aria-current in our implementation? 
        // Actually, let's check our implementation: 
        // <li aria-current="page">...</li>

        const currentItem = document.querySelector('nav[aria-label="Breadcrumb"] li[aria-current="page"]');
        if (!currentItem) return 'NO_CURRENT_PAGE';
        if (currentItem.textContent !== 'Navigation') return 'WRONG_CURRENT_TEXT';
        return 'OK';
    });

    if (breadcrumbResult === 'OK') {
        console.log('SUCCESS: Breadcrumb structure valid.');
    } else {
        console.error(`FAILURE: Breadcrumb check failed: ${breadcrumbResult}`);
        process.exit(1);
    }


    // --- TEST 2: ACCORDION & TABS ---
    console.log('\n--- CONTENT STRUCTURE TEST ---');
    console.log('Navigating to Structure & Content page...');

    await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, button'));
        const link = links.find(el => el.textContent?.includes('Structure & Content'));
        if (link) link.click();
    });

    // Wait for Accordion
    try {
        await page.waitForSelector('button[aria-controls^="accordion-content"]', { timeout: 3000 });
        console.log('SUCCESS: Accordion triggers found.');
    } catch {
        console.error('FAILURE: Accordion not found.');
        process.exit(1);
    }

    // Test Accordion Interaction
    const accordionResult = await page.evaluate(async () => {
        const trigger = document.querySelector('button[aria-controls^="accordion-content"]');
        if (!trigger) return 'NO_TRIGGER';

        // Check initial state (should be expanded or collapsed based on default)
        // In our demo we set defaultValue="item-1", so the first one should be open?
        // Let's assume we click the SECOND one to test toggle.

        const triggers = Array.from(document.querySelectorAll('button[aria-controls^="accordion-content"]'));
        const secondTrigger = triggers[1]; // "Can I have multiple items open?"

        if (secondTrigger.getAttribute('aria-expanded') === 'true') return 'ALREADY_OPEN';

        secondTrigger.click();

        // Wait for React
        await new Promise(r => setTimeout(r, 200));

        if (secondTrigger.getAttribute('aria-expanded') !== 'true') return 'DID_NOT_OPEN';

        return 'OK';
    });

    if (accordionResult === 'OK') {
        console.log('SUCCESS: Accordion interaction working.');
    } else {
        console.error(`FAILURE: Accordion test failed: ${accordionResult}`);
        process.exit(1);
    }

    // Test Tabs Interaction
    const tabsResult = await page.evaluate(async () => {
        const tabList = document.querySelector('[role="tablist"]');
        if (!tabList) return 'NO_TABLIST';

        const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
        const tabSettings = tabs.find(t => t.textContent?.includes('Settings'));

        if (!tabSettings) return 'SETTINGS_TAB_NOT_FOUND';

        tabSettings.click();

        await new Promise(r => setTimeout(r, 200));

        if (tabSettings.getAttribute('aria-selected') !== 'true') return 'ARIA_selected_NOT_UPDATED';

        // Check panel visibility (conceptually)
        // In our implementation, we hide other panels or unmount them.
        // We can check if the settings content is visible.
        // ID connection check:
        const controlsId = tabSettings.getAttribute('aria-controls');
        if (!controlsId) return 'NO_ARIA_CONTROLS';

        const panel = document.getElementById(controlsId);
        if (!panel) return 'PANEL_NOT_FOUND';

        return 'OK';
    });

    if (tabsResult === 'OK') {
        console.log('SUCCESS: Tabs interaction working.');
    } else {
        console.error(`FAILURE: Tabs test failed: ${tabsResult}`);
        process.exit(1);
    }

    await browser.close();
})();
