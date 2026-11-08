/**
 * Intern #53 steg 2: en spärrad startadress skannas aldrig, och ingen
 * webbläsare startas för den.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import puppeteer from 'puppeteer';
import { RegulatoryScanner } from './regulatory-scanner';
import { PrivateHostError } from './network-guard';

afterEach(() => vi.restoreAllMocks());

describe('RegulatoryScanner och spärren', () => {
    it('vägrar en privat startadress innan någon webbläsare startar', async () => {
        const launch = vi.spyOn(puppeteer, 'launch');
        const scanner = new RegulatoryScanner({ url: 'http://127.0.0.1:3000/', silent: true });
        await expect(scanner.scan()).rejects.toBeInstanceOf(PrivateHostError);
        expect(launch).not.toHaveBeenCalled();
    });

    it('allowPrivateHosts släpper förbi förkontrollen', async () => {
        const stopp = new Error('stoppad i testet efter förkontrollen');
        const launch = vi.spyOn(puppeteer, 'launch').mockRejectedValue(stopp);
        const scanner = new RegulatoryScanner({ url: 'http://127.0.0.1:3000/', silent: true, allowPrivateHosts: true });
        await expect(scanner.scan()).rejects.toBe(stopp);
        expect(launch).toHaveBeenCalledTimes(1);
    });

    it('startar Chrome med sandboxen på som standard', async () => {
        const stopp = new Error('stoppad i testet');
        const launch = vi.spyOn(puppeteer, 'launch').mockRejectedValue(stopp);
        const scanner = new RegulatoryScanner({ url: 'http://127.0.0.1/', silent: true, allowPrivateHosts: true });
        await expect(scanner.scan()).rejects.toBe(stopp);
        const args = (launch.mock.calls[0][0] as { args: string[] }).args;
        expect(args).not.toContain('--no-sandbox');
    });

    it('sandbox: false stänger av sandboxen', async () => {
        const stopp = new Error('stoppad i testet');
        const launch = vi.spyOn(puppeteer, 'launch').mockRejectedValue(stopp);
        const scanner = new RegulatoryScanner({ url: 'http://127.0.0.1/', silent: true, allowPrivateHosts: true, sandbox: false });
        await expect(scanner.scan()).rejects.toBe(stopp);
        const args = (launch.mock.calls[0][0] as { args: string[] }).args;
        expect(args).toContain('--no-sandbox');
    });
});
