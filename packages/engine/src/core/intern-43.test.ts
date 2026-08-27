import { describe, it, expect } from 'vitest';
import { isInterstitialPage, getStandardsVersion } from './regulatory-scanner';

/**
 * Intern #43 — två robusthetsfynd i motorn.
 *
 * Fynd 1: en interstitial-/vänta-/bot-challenge-sida (t.ex. w3.org som en gång
 * scannades som en "Vänta..."-sida) mäts av axe som om det vore riktigt innehåll.
 * `isInterstitialPage` känner av det så att scan() kan flagga resultatet.
 *
 * Fynd 3: `getStandardsVersion()` returnerade 'unknown' eftersom standards
 * `exports` inte exponerade "./package.json" (ERR_PACKAGE_PATH_NOT_EXPORTED).
 */

describe('Intern #43 fynd 1 — interstitial-detektion', () => {
    it('flaggar en tydlig svensk vänta-titel', () => {
        expect(isInterstitialPage('Vänta...', false, 5000)).toBe(true);
    });

    it('flaggar engelska challenge-titlar', () => {
        for (const t of [
            'Just a moment...',
            'Checking your browser before accessing',
            'Attention Required! | Cloudflare',
            'Please wait',
            'Redirecting…',
            'Verifying you are human',
        ]) {
            expect(isInterstitialPage(t, false, 5000), t).toBe(true);
        }
    });

    it('flaggar en meta-refresh-omdirigering på en nästan tom sida', () => {
        expect(isInterstitialPage('Home', true, 120)).toBe(true);
    });

    it('flaggar INTE en riktig sida med normal titel och innehåll', () => {
        expect(isInterstitialPage('HolmDigital — Tillgänglighet', false, 8000)).toBe(false);
    });

    it('flaggar INTE en kort men riktig sida utan meta-refresh', () => {
        // Låg textmängd ensam räcker inte — bara i kombination med en omdirigering.
        expect(isInterstitialPage('Kontakt', false, 120)).toBe(false);
    });

    it('flaggar INTE en meta-refresh på en sida med rejält innehåll', () => {
        // En riktig sida kan bära en långsam meta-refresh (t.ex. sessions-timeout).
        expect(isInterstitialPage('Artikel', true, 5000)).toBe(false);
    });

    it('hanterar undefined titel utan att krascha', () => {
        expect(isInterstitialPage(undefined, false, 5000)).toBe(false);
    });
});

describe('Intern #43 fynd 3 — standardsVersion är inte "unknown"', () => {
    it('resolver @holmdigital/standards/package.json och läser en riktig semver', () => {
        const v = getStandardsVersion();
        expect(v).not.toBe('unknown');
        expect(v).toMatch(/^\d+\.\d+\.\d+/);
    });
});
