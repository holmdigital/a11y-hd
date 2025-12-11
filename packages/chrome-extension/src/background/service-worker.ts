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
            .catch(error => sendResponse({ error: error.message }));
        return true; // Keep message channel open for async response
    }
});

async function handleScan(tabId: number) {
    // Inject axe-core and run scan
    const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: runAxeScan,
    });

    const axeResults = results[0]?.result;

    if (!axeResults) {
        throw new Error('Failed to run accessibility scan');
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
            dosLagen: true, // Simplified: all WCAG AA applies to DOS-lagen
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
}

// This function is injected into the page
async function runAxeScan() {
    // Dynamically load axe-core
    if (!(window as any).axe) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
        document.head.appendChild(script);

        await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load axe-core'));
        });
    }

    // Run axe
    const results = await (window as any).axe.run(document, {
        runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
        }
    });

    return results;
}

export { };
