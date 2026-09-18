import { describe, it, expect } from 'vitest';
import { assertScanUrl, UnsupportedUrlError, ALLOWED_SCAN_PROTOCOLS } from './url-guard';

/**
 * Intern #53 steg 1.
 *
 * Testet som betyder något här är inte att http går igenom, utan att file://
 * INTE gör det. Kontrollen fanns redan i CLI:t och gjorde rätt — den anropades
 * bara i en if-sats med tom kropp, så svaret kastades bort. Ingen test fanns
 * som hade kunnat upptäcka det, eftersom funktionen aldrig testades och
 * anropsstället aldrig kördes till ett utfall.
 */
describe('assertScanUrl (Intern #53)', () => {
    it('släpper igenom http och https', () => {
        expect(assertScanUrl('http://example.com').protocol).toBe('http:');
        expect(assertScanUrl('https://example.com/en/sida?a=1').protocol).toBe('https:');
    });

    it('tillåter omgivande blanksteg, som en inklistrad adress ofta har', () => {
        expect(assertScanUrl('  https://example.com  ').hostname).toBe('example.com');
    });

    it('AVVISAR file://, som gick rakt in i skanningen sedan februari', () => {
        expect(() => assertScanUrl('file:///etc/passwd')).toThrow(UnsupportedUrlError);
        expect(() => assertScanUrl('file:///C:/Windows/win.ini')).toThrow(UnsupportedUrlError);
    });

    it('avvisar övriga scheman någon faktiskt råkar skicka in', () => {
        for (const bad of ['data:text/html,<script>alert(1)</script>', 'javascript:alert(1)', 'chrome://settings', 'ftp://example.com']) {
            expect(() => assertScanUrl(bad), bad).toThrow(UnsupportedUrlError);
        }
    });

    it('avvisar det som inte är en absolut adress alls', () => {
        for (const bad of ['example.com', '/bara/en/sokvag', '', '   ']) {
            expect(() => assertScanUrl(bad), JSON.stringify(bad)).toThrow(UnsupportedUrlError);
        }
    });

    it('felet namnger schemat som avvisades, inte bara "ogiltig"', () => {
        expect(() => assertScanUrl('file:///etc/passwd')).toThrow(/file:/);
    });

    it('allowlisten är uttömmande: bara http och https', () => {
        expect([...ALLOWED_SCAN_PROTOCOLS]).toEqual(['http:', 'https:']);
    });
});
