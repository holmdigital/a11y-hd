import { describe, it, expect } from 'vitest';
import { resolveNationalLawReference, generateStatementContent } from './statement-generator';
import type { StatementMetadata } from './statement-generator';
import type { Country } from '@holmdigital/standards';
import type { ScanResult } from '../core/regulatory-scanner';

/**
 * Intern #31: a `--sector private` statement must NEVER render an empty national-law
 * reference. Six countries (NO, DK, FR, ES, GB, CA) have no EAA post in the data and
 * used to render "complies with , …" — a broken clause in a document the customer
 * hands over as their own. This test walks every country × both sectors and asserts
 * the law reference is non-empty. It is the test that would have caught the bug.
 */

// The 16 supported countries (EU is only an internal fallback).
const COUNTRIES: Country[] = [
    'SE', 'NO', 'DK', 'FI', 'NL', 'DE', 'FR', 'ES',
    'IE', 'IT', 'PT', 'PL', 'GB', 'US', 'CA', 'AU',
];
const SECTORS: Array<'public' | 'private'> = ['public', 'private'];

describe('resolveNationalLawReference — no empty law reference (Intern #31)', () => {
    for (const country of COUNTRIES) {
        for (const sector of SECTORS) {
            it(`returns a non-empty reference for ${country} / ${sector}`, () => {
                const ref = resolveNationalLawReference(country, sector, 'en');
                expect(ref.trim()).not.toBe('');
            });
        }
    }

    it('never claims an EU directive is a country\'s national law for GB/NO/CA private', () => {
        for (const country of ['GB', 'NO', 'CA'] as Country[]) {
            const ref = resolveNationalLawReference(country, 'private', 'en');
            expect(ref).not.toMatch(/2019\/882|European Accessibility Act/i);
        }
    });
});

describe('generateStatementContent — private statement has no empty law slot (Intern #31)', () => {
    const mockResult: ScanResult = {
        url: 'https://example.com',
        timestamp: '2026-02-08T01:51:29Z',
        metadata: {
            engineVersion: '3.1.0', axeCoreVersion: '4.13.0', standardsVersion: '3.0.3',
            scanDuration: 1200, pageTitle: 'Example', pageLanguage: 'en',
        },
        reports: [],
        stats: { passed: 46, critical: 0, high: 0, medium: 0, low: 0, total: 0, needsReview: 0 },
        score: 100,
        complianceStatus: 'PASS',
    } as unknown as ScanResult;

    const cases: Array<[Country, string]> = [['FR', 'fr'], ['GB', 'en-gb'], ['NO', 'no']];

    it.each(cases)('%s private statement names or rewords — never "complies with ,"', async (country, lang) => {
        const metadata: StatementMetadata = {
            organizationName: 'Testbolaget',
            contactEmail: 'test@example.com',
            country,
            sector: 'private',
            publishDate: '2026-08-25',
        } as StatementMetadata;

        const out = await generateStatementContent(mockResult, lang, 'md', metadata);
        // The bug rendered an empty slot -> "complies with ," / "med ," etc.
        expect(out).not.toMatch(/complies with\s*,/i);
        expect(out).not.toMatch(/\breglerne?\b\s*,/i);
        // And the resolved reference itself is present and non-empty.
        expect(resolveNationalLawReference(country, 'private', lang).trim()).not.toBe('');
    });
});
