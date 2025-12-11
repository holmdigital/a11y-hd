/**
 * Background Service Worker
 * Handles scanning logic and message passing
 */

// WCAG criteria to EN 301 549 mapping (simplified)
const wcagToEN301549: Record<string, string> = {
    '1.1.1': '9.1.1.1',
    '1.2.1': '9.1.2.1',
    '1.2.2': '9.1.2.2',
    '1.2.3': '9.1.2.3',
    '1.3.1': '9.1.3.1',
    '1.3.2': '9.1.3.2',
    '1.3.3': '9.1.3.3',
    '1.4.1': '9.1.4.1',
    '1.4.2': '9.1.4.2',
    '1.4.3': '9.1.4.3',
    '2.1.1': '9.2.1.1',
    '2.1.2': '9.2.1.2',
    '2.4.1': '9.2.4.1',
    '2.4.2': '9.2.4.2',
    '2.4.3': '9.2.4.3',
    '2.4.4': '9.2.4.4',
    '3.1.1': '9.3.1.1',
    '3.2.1': '9.3.2.1',
    '3.3.1': '9.3.3.1',
    '3.3.2': '9.3.3.2',
    '4.1.1': '9.4.1.1',
    '4.1.2': '9.4.1.2',
};

// Parse WCAG tags from axe-core
function parseWcagTags(tags: string[]): string {
    const wcagTag = tags.find(t => t.match(/wcag\d+/));
    if (!wcagTag) return '2.1.1';

    const match = wcagTag.match(/wcag(\d)(\d)(\d)/);
    if (match) {
        return `${match[1]}.${match[2]}.${match[3]}`;
    }
    return '2.1.1';
}

// Message handler
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'SCAN_PAGE') {
        handleScan(message.tabId)
            .then(result => sendResponse({ result }))
            .catch(error => {
                console.error('Scan error:', error);
                sendResponse({ error: error.message });
            });
        return true; // Keep message channel open for async response
    }
});

async function handleScan(tabId: number) {
    try {
        // First inject axe-core from CDN
        await chrome.scripting.executeScript({
            target: { tabId },
            func: injectAxeCore,
        });

        // Wait a bit for axe to load
        await new Promise(resolve => setTimeout(resolve, 500));

        // Then run the scan
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: runAxeScan,
        });

        const axeResults = results[0]?.result;

        if (!axeResults) {
            throw new Error('No scan results returned');
        }

        if (axeResults.error) {
            throw new Error(axeResults.error);
        }

        // Map to our format
        const violations = axeResults.violations.map((v: any) => {
            const wcag = parseWcagTags(v.tags);
            return {
                id: v.id,
                impact: v.impact,
                description: v.help,
                wcagCriteria: wcag,
                en301549: wcagToEN301549[wcag],
                dosLagen: true,
                nodes: v.nodes.length,
                selectors: v.nodes.map((n: any) => n.target[0]),
            };
        });

        return {
            violations,
            passes: axeResults.passes?.length || 0,
            url: axeResults.url,
            timestamp: axeResults.timestamp,
        };
    } catch (err) {
        console.error('handleScan error:', err);
        throw err;
    }
}

// Inject axe-core script into the page
function injectAxeCore() {
    return new Promise<void>((resolve, reject) => {
        if ((window as any).axe) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load axe-core'));
        document.head.appendChild(script);
    });
}

// Run axe scan (called after axe-core is loaded)
function runAxeScan() {
    return new Promise((resolve) => {
        // Check if axe is available
        if (!(window as any).axe) {
            resolve({ error: 'axe-core not loaded' });
            return;
        }

        (window as any).axe.run(document, {
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
            }
        }).then((results: any) => {
            resolve(results);
        }).catch((err: any) => {
            resolve({ error: err.message || 'Scan failed' });
        });
    });
}

export { };
