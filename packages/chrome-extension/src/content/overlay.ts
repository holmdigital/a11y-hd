/**
 * Content Script - Overlay Manager
 * Highlights accessibility violations on the page
 */

interface ViolationData {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    selectors: string[];
}

// Color mapping for violation impacts
const impactColors: Record<string, string> = {
    critical: '#ef4444',
    serious: '#f97316',
    moderate: '#eab308',
    minor: '#3b82f6',
};

// Store references to created overlays
let overlays: HTMLElement[] = [];

// Remove existing overlays
function clearOverlays() {
    overlays.forEach(el => el.remove());
    overlays = [];
}

// Create overlay for a violation
function createOverlay(element: Element, violation: ViolationData) {
    const rect = element.getBoundingClientRect();
    const color = impactColors[violation.impact];

    // Create highlight overlay
    const overlay = document.createElement('div');
    overlay.className = 'hd-a11y-overlay';
    overlay.style.cssText = `
    position: fixed;
    top: ${rect.top + window.scrollY}px;
    left: ${rect.left + window.scrollX}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 3px solid ${color};
    background: ${color}20;
    pointer-events: none;
    z-index: 999999;
    box-sizing: border-box;
    transition: all 0.2s ease;
  `;

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'hd-a11y-tooltip';
    tooltip.innerHTML = `
    <strong>${violation.id}</strong>
    <p>${violation.description}</p>
  `;
    tooltip.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #0f172a;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    pointer-events: auto;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1000000;
  `;
    tooltip.querySelector('strong')!.style.cssText = `
    display: block;
    color: ${color};
    margin-bottom: 4px;
  `;
    tooltip.querySelector('p')!.style.cssText = `
    margin: 0;
    line-height: 1.4;
  `;

    overlay.appendChild(tooltip);

    // Show tooltip on hover
    const showTooltip = () => {
        tooltip.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
    };
    const hideTooltip = () => {
        tooltip.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    };

    overlay.addEventListener('mouseenter', showTooltip);
    overlay.addEventListener('mouseleave', hideTooltip);

    document.body.appendChild(overlay);
    overlays.push(overlay);
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'HIGHLIGHT_VIOLATIONS') {
        clearOverlays();

        message.violations.forEach((violation: ViolationData) => {
            violation.selectors.forEach(selector => {
                try {
                    const element = document.querySelector(selector);
                    if (element) {
                        createOverlay(element, violation);
                    }
                } catch {
                    // Invalid selector, skip
                }
            });
        });

        sendResponse({ success: true, count: overlays.length });
    }

    if (message.type === 'CLEAR_OVERLAYS') {
        clearOverlays();
        sendResponse({ success: true });
    }

    return true;
});

// Update overlay positions on scroll/resize
const updatePositions = () => {
    // Overlays use fixed positioning, so they update automatically in most cases
    // For complex cases, we'd need to track original elements
};

window.addEventListener('scroll', updatePositions, { passive: true });
window.addEventListener('resize', updatePositions, { passive: true });

export { };
