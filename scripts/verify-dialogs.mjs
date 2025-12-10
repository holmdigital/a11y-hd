import puppeteer from 'puppeteer';

(async () => {
    console.log('Starting verification...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // 1. Go to Wiki
    console.log('Navigating to Wiki...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    // 2. Click "Dialogs & Modals"
    await page.setViewport({ width: 1280, height: 800 });

    // Use evaluate to find element by text content
    const foundLink = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const target = buttons.find(el => el.textContent?.includes('Dialogs & Modals'));
        if (target) {
            target.click();
            return true;
        }
        return false;
    });

    if (foundLink) {
        console.log('Clicked sidebar link.');
    } else {
        console.error('Could not find nav link "Dialogs & Modals"');
        process.exit(1);
    }

    // 3. Wait for content
    console.log('Waiting for content...');
    try {
        await page.waitForFunction(() => {
            return document.body.innerText.includes('Standard Dialog');
        }, { timeout: 3000 });
        console.log('Page loaded.');
    } catch (e) {
        console.error('Timeout waiting for page content.');
        process.exit(1);
    }

    // 4. Click "Open Standard Dialog"
    console.log('Opening dialog...');
    const opened = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent?.includes('Open Standard Dialog'));
        if (btn) {
            btn.click();
            return true;
        }
        return false;
    });

    if (!opened) {
        console.error('Open button not found');
        process.exit(1);
    }

    // 5. Verify <dialog> is open
    await new Promise(r => setTimeout(r, 1000)); // wait for animation
    const isOpen = await page.evaluate(() => {
        const dialog = document.querySelector('dialog');
        return dialog && dialog.open;
    });

    if (isOpen) {
        console.log('SUCCESS: Dialog is open!');
    } else {
        console.error('FAILURE: Dialog did not open.');
        process.exit(1);
    }

    // 6. Close it
    console.log('Closing dialog...');
    const closedClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent?.includes('Cancel'));
        if (btn) {
            btn.click();
            return true;
        }
        return false;
    });

    if (!closedClicked) {
        console.error('Cancel button not found');
        // try closing via Esc
        await page.keyboard.press('Escape');
    }

    await new Promise(r => setTimeout(r, 1000));
    const isClosed = await page.evaluate(() => {
        const dialog = document.querySelector('dialog');
        return dialog && !dialog.open;
    });

    if (isClosed) {
        console.log('SUCCESS: Dialog closed!');
    } else {
        console.error('FAILURE: Dialog did not close.');
        process.exit(1);
    }

    await browser.close();
})();
