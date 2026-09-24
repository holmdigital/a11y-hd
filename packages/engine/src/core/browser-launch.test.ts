/**
 * Intern #53 steg 2: sandboxen är på som standard, och avstängningen är
 * uttrycklig.
 */
import { describe, it, expect } from 'vitest';
import { chromeLaunchArgs, explainLaunchFailure, puppeteerArgsFromEnv, sandboxRequested } from './browser-launch';

describe('chromeLaunchArgs', () => {
    it('sandboxen är på som standard: ingen --no-sandbox', () => {
        const args = chromeLaunchArgs({}, {});
        expect(args).not.toContain('--no-sandbox');
        expect(args).not.toContain('--disable-setuid-sandbox');
    });

    it('sandbox: false stänger av den uttryckligen', () => {
        expect(chromeLaunchArgs({ sandbox: false }, {})).toEqual(['--no-sandbox', '--disable-setuid-sandbox']);
    });

    it('PUPPETEER_ARGS läses, så som scan-serverns container redan sätter den', () => {
        const env = { PUPPETEER_ARGS: '--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu' };
        expect(chromeLaunchArgs({}, env)).toEqual(['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']);
        expect(sandboxRequested({}, env)).toBe(false);
    });

    it('övriga flaggor behålls', () => {
        const args = chromeLaunchArgs({ invalidHttpsCert: true, extraArgs: ['--disable-blink-features=AutomationControlled'] }, {});
        expect(args).toEqual(['--ignore-certificate-errors', '--allow-insecure-localhost', '--disable-blink-features=AutomationControlled']);
    });

    it('en tom PUPPETEER_ARGS ger inga flaggor', () => {
        expect(puppeteerArgsFromEnv({ PUPPETEER_ARGS: '   ' })).toEqual([]);
        expect(puppeteerArgsFromEnv({})).toEqual([]);
    });
});

describe('explainLaunchFailure', () => {
    const rootError = new Error('Failed to launch the browser process!\n[0924/120000.000:ERROR:zygote_host_impl_linux.cc(100)] Running as root without --no-sandbox is not supported. See https://crbug.com/638180.');

    it('förklarar ett sandboxfel och säger hur man stänger av sandboxen', () => {
        const explained = explainLaunchFailure(rootError, {}, {});
        expect(explained.message).toContain('Chrome could not start its sandbox');
        expect(explained.message).toContain('--no-sandbox');
        expect(explained.message).toContain('Running as root without --no-sandbox is not supported');
    });

    it('lämnar andra startfel orörda', () => {
        const other = new Error('Could not find Chrome (ver. 140.0.0)');
        expect(explainLaunchFailure(other, {}, {})).toBe(other);
    });

    it('lämnar felet orört när sandboxen redan är avstängd', () => {
        expect(explainLaunchFailure(rootError, { sandbox: false }, {})).toBe(rootError);
    });
});
