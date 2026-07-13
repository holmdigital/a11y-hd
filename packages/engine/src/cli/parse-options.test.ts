import { describe, it, expect } from 'vitest';
import { parseHydrationWait, InvalidOptionError, MAX_HYDRATION_WAIT_MS } from './parse-options';

describe('parseHydrationWait (--wait-for-hydration)', () => {
    it('tar emot ett heltal millisekunder', () => {
        expect(parseHydrationWait('5000')).toBe(5000);
    });

    it('tar emot 0: stänger av waiten helt', () => {
        expect(parseHydrationWait('0')).toBe(0);
    });

    it('tar emot taket', () => {
        expect(parseHydrationWait(String(MAX_HYDRATION_WAIT_MS))).toBe(MAX_HYDRATION_WAIT_MS);
    });

    it('tillåter omgivande blanksteg', () => {
        expect(parseHydrationWait('  2500 ')).toBe(2500);
    });

    it('avvisar värden över taket, i stället för att hänga i en minut', () => {
        expect(() => parseHydrationWait(String(MAX_HYDRATION_WAIT_MS + 1))).toThrow(InvalidOptionError);
    });

    it('avvisar negativa värden', () => {
        expect(() => parseHydrationWait('-1')).toThrow(InvalidOptionError);
    });

    it('avvisar decimaltal', () => {
        expect(() => parseHydrationWait('1500.5')).toThrow(InvalidOptionError);
    });

    it.each(['abc', '', '   ', '5s', '1e3', '0x10', 'NaN', 'Infinity'])(
        'avvisar skräpindata: %j',
        raw => {
            expect(() => parseHydrationWait(raw)).toThrow(InvalidOptionError);
        }
    );

    it('felmeddelandet säger vad som var fel OCH vad som är rätt', () => {
        // En användare som skrivit fel ska inte behöva gissa. Tyst fallback till
        // defaulten vore värre än ett fel: hen tror att waiten sattes.
        try {
            parseHydrationWait('snart');
            throw new Error('skulle ha kastat');
        } catch (e) {
            expect(e).toBeInstanceOf(InvalidOptionError);
            const message = (e as Error).message;
            expect(message).toContain('snart');
            expect(message).toContain('--wait-for-hydration 5000');
            expect(message).toContain(String(MAX_HYDRATION_WAIT_MS));
        }
    });
});
