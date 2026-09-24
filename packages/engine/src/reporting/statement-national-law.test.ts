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

/**
 * Intern #68 T4: Australien, båda sektorerna, i den mall vi levererar till
 * Australien. Lagen ska stå där, aldrig fallback-frasen. Grenen som tidigare
 * garanterade det är borttagen; nu är det den generella väljaren som gör det.
 */
describe('Intern #68 — AU renderar Disability Discrimination Act, aldrig fallback', () => {
    const auResult = {
        url: 'https://example.com.au',
        timestamp: '2026-09-24T00:00:00Z',
        metadata: {
            engineVersion: 'x', axeCoreVersion: 'x', standardsVersion: 'x',
            scanDuration: 1, pageTitle: 'Example', pageLanguage: 'en',
        },
        reports: [],
        stats: { passed: 46, critical: 0, high: 0, medium: 0, low: 0, total: 0, needsReview: 0 },
        score: 100,
        complianceStatus: 'PASS',
    } as unknown as ScanResult;

    it.each(SECTORS)('en-au, %s', async (sector) => {
        const ref = resolveNationalLawReference('AU', sector, 'en-au');
        expect(ref).toBe('Disability Discrimination Act 1992 (Cth)');
        const out = await generateStatementContent(auResult, 'en-au', 'md', {
            organizationName: 'Testbolaget', contactEmail: 'test@example.com', country: 'AU', sector,
        } as StatementMetadata);
        expect(out).toContain('Disability Discrimination Act 1992 (Cth)');
        expect(out).not.toContain('applicable accessibility requirements');
    });
});
