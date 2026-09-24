import { describe, it, expect } from 'vitest';
import { parseHydrationWait, parseReviewOptions, InvalidOptionError, MAX_HYDRATION_WAIT_MS } from './parse-options';
import { generateStatementContent } from '../reporting/statement-generator';
import type { ScanResult } from '../core/regulatory-scanner';

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

describe('parseReviewOptions (--review-method, --reviewer), Intern #95', () => {
    it('utan --review-method: inga fält, alltså självskattning som i dag', () => {
        expect(parseReviewOptions(undefined, undefined)).toEqual({});
    });

    it.each(['self-assessment', 'no-review'] as const)('tar emot %s', (method) => {
        expect(parseReviewOptions(method, undefined)).toEqual({ reviewMethod: method });
    });

    it('external-review med granskare ger båda fälten, utan omgivande blanksteg', () => {
        expect(parseReviewOptions(' external-review ', '  Granskaren AB ')).toEqual({
            reviewMethod: 'external-review',
            reviewer: { name: 'Granskaren AB' },
        });
    });

    it.each([undefined, '', '   '])('avvisar external-review utan granskare (%j), före skanningen', (reviewer) => {
        expect(() => parseReviewOptions('external-review', reviewer)).toThrow(InvalidOptionError);
    });

    it('felet för en saknad granskare säger vad som ska anges', () => {
        expect(() => parseReviewOptions('external-review', undefined)).toThrow(/--reviewer <name>/);
    });

    it.each(['external', 'self', 'EXTERNAL-REVIEW', 'true'])('avvisar okända värden: %j', (raw) => {
        // En tyst fallback till självskattning vore värre än ett fel: användaren
        // tror att den externa granskningen står i utlåtandet.
        expect(() => parseReviewOptions(raw, 'Granskaren AB')).toThrow(InvalidOptionError);
    });

    it('felet för ett okänt värde räknar upp de giltiga', () => {
        expect(() => parseReviewOptions('extern', undefined)).toThrow('self-assessment, external-review, no-review');
    });

    it('en granskare utan external-review skickas inte vidare', () => {
        expect(parseReviewOptions(undefined, 'Granskaren AB')).toEqual({});
        expect(parseReviewOptions('self-assessment', 'Granskaren AB')).toEqual({ reviewMethod: 'self-assessment' });
    });

    it('de tolkade fälten ger ett utlåtande som namnger granskaren', async () => {
        const result = {
            url: 'https://example.test',
            timestamp: '2026-09-24T00:00:00.000Z',
            metadata: { engineVersion: 'x', axeCoreVersion: 'x', standardsVersion: 'x', scanDuration: 1, pageTitle: 'x', pageLanguage: 'x' },
            reports: [],
            stats: { passed: 10, critical: 0, high: 1, medium: 0, low: 0, total: 11 },
            score: 85,
            complianceStatus: 'FAIL',
            legalSummary: { wadViolations: 0, eaaViolations: 0, eaaDeadlineViolations: 0 },
        } as unknown as ScanResult;
        const md = await generateStatementContent(result, 'sv', 'md', {
            country: 'SE',
            ...parseReviewOptions('external-review', 'Granskaren AB'),
        });
        expect(md).toContain('Granskaren AB har gjort en oberoende granskning av example.test.');
    });
});
