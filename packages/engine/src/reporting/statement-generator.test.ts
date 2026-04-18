import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateStatementContent } from './statement-generator';
import type { ScanResult } from '../core/regulatory-scanner';
import type { StatementMetadata } from './statement-generator';
import { getEnforcementBody, getNationalLawByFramework } from '@holmdigital/standards';
import type { Country } from '@holmdigital/standards';

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const templateFiles = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json'));

// Mock ScanResult with representative data to exercise substitution paths
const mockResult: ScanResult = {
    url: 'https://example.se',
    timestamp: new Date().toISOString(),
    metadata: {
        engineVersion: '2.1.6',
        axeCoreVersion: '4.11.1',
        standardsVersion: '1.0.0',
        scanDuration: 1200,
        pageTitle: 'Example Site',
        pageLanguage: 'en',
    },
    reports: [
        {
            ruleId: 'color-contrast',
            wcagCriteria: '1.4.3',
            impact: 'serious',
            severity: 'high',
            description: 'Elements must have sufficient color contrast',
            help: 'Ensure sufficient color contrast',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.6/color-contrast',
            nodes: [],
            element: '',
            selector: '.example',
            regulatoryMapping: {
                eaaArticle: '3.1',
                wadDirective: '4.1',
            },
        },
    ],
    stats: {
        passed: 45,
        critical: 0,
        high: 1,
        medium: 0,
        low: 0,
        total: 46,
    },
    score: 85,
    complianceStatus: 'partial',
    legalSummary: {
        wadViolations: 1,
        eaaViolations: 0,
        eaaDeadlineViolations: 0,
    },
};

const metadata: StatementMetadata = {
    organizationName: 'Test Organization',
    contactEmail: 'test@example.se',
    phoneNumber: '+46-70-123-4567',
    responseTime: '2 days',
    country: 'SE',
    publishDate: '2024-06-15',
};

// Regex matching the {<placeholder>} pattern used in templates
const PLACEHOLDER_REGEX = /\{<[^>]+>\}/g;

describe('Template placeholder exhaustiveness', () => {
    it.each(templateFiles)(
        'should produce output with no leftover placeholders for %s',
        async (file) => {
            const lang = file.replace('.json', '');
            const output = await generateStatementContent(mockResult, lang, 'md', metadata);

            const leftover = output.match(PLACEHOLDER_REGEX);
            expect(
                leftover,
                `Found unsubstituted placeholders in ${lang} output: ${leftover?.join(', ')}`
            ).toBeNull();
        }
    );

    it('should throw a clear error for a non-existent locale', async () => {
        await expect(
            generateStatementContent(mockResult, 'xx', 'md', metadata)
        ).rejects.toThrow(/template not found for locale "xx"/i);
    });

    it('should discover all 16 expected template files', () => {
        expect(templateFiles.length).toBeGreaterThanOrEqual(16);
        const langs = templateFiles.map(f => f.replace('.json', '')).sort();
        expect(langs).toEqual(
            expect.arrayContaining(['da', 'de', 'en', 'en-au', 'en-ca', 'en-gb', 'en-us', 'es', 'fi', 'fr', 'it', 'nl', 'no', 'pl', 'pt', 'sv'])
        );
    });
});

/**
 * Locale-specific output verification.
 * Validates ENGI-01/02/03: each EU locale produces locale-specific evaluationMethod
 * text and compliance status phrases in Markdown output — not English fallbacks.
 *
 * The status phrases come from the template choice blocks (not the STATUS_LABELS map),
 * so we verify distinctive locale-specific compliance wording from the actual templates.
 */
describe('Locale-specific output verification', () => {
    // [lang, expectedEvalMethodSubstring, expectedStatusPhrase]
    // mockResult has score=85, complianceLevel='partial', so the partial choice text appears.
    // Status phrases are extracted from each template's technical-section choice block.
    const localeExpectations: [string, string, string][] = [
        ['sv', 'Automatiserad granskning', 'delvis förenlig'],
        ['en', 'Automated scan', 'partially compliant'],
        ['en-au', 'Automated scan', 'partially compliant'],
        ['no', 'Automatisert gjennomgang', 'delvis i samsvar'],
        ['fi', 'Automaattinen tarkistus', 'osittain'],
        ['da', 'Automatiseret gennemgang', 'delvist i overensstemmelse'],
        ['de', 'Automatisierte Prüfung', 'teilweise mit den Barrierefreiheitsanforderungen vereinbar'],
        ['fr', 'Analyse automatisée', 'partiellement conforme'],
        ['es', 'Análisis automatizado', 'parcialmente conforme'],
        ['nl', 'Geautomatiseerde controle', 'gedeeltelijk in overeenstemming'],
        ['en-gb', 'Automated scan', 'partially compliant with the Public Sector Bodies'],
        ['en-us', 'Automated scan', 'partially compliant with Section 508'],
        ['en-ca', 'Automated scan', 'partially compliant with the Accessible Canada Act'],
    ];

    it.each(localeExpectations)(
        'should produce locale-specific evaluationMethod and status label for %s',
        async (lang, expectedEvalMethod, expectedStatusPhrase) => {
            const output = await generateStatementContent(mockResult, lang, 'md', metadata);

            // Verify locale-specific evaluationMethod text appears
            expect(output).toContain(expectedEvalMethod);

            // Verify locale-specific compliance status phrase appears in the output
            expect(output.toLowerCase()).toContain(expectedStatusPhrase.toLowerCase());

            // Verify English fallback text is NOT present (except for English locale)
            if (!lang.startsWith('en')) {
                expect(output).not.toContain('Automated scan');
                expect(output.toLowerCase()).not.toContain('partially compliant');
            }
        }
    );
});

describe('TLD country detection for en-* locales', () => {
    it('should detect .uk TLD as GB country', async () => {
        const ukResult = { ...mockResult, url: 'https://example.gov.uk' };
        const output = await generateStatementContent(ukResult, 'en-gb', 'md', { ...metadata, country: undefined });
        expect(output).toContain('Equality and Human Rights Commission');
    });

    it('should detect .us TLD as US country', async () => {
        const usResult = { ...mockResult, url: 'https://example.us' };
        const output = await generateStatementContent(usResult, 'en-us', 'md', { ...metadata, country: undefined });
        expect(output).toContain('Department of Justice');
    });

    it('should detect .ca TLD as CA country', async () => {
        const caResult = { ...mockResult, url: 'https://example.gc.ca' };
        const output = await generateStatementContent(caResult, 'en-ca', 'md', { ...metadata, country: undefined });
        expect(output).toContain('Accessibility Commissioner');
    });

    it('should detect .com.au TLD as AU country', async () => {
        const auResult = { ...mockResult, url: 'https://example.com.au' };
        const output = await generateStatementContent(auResult, 'en-au', 'md', { ...metadata, country: undefined });
        expect(output).toContain(getEnforcementBody('AU'));
    });

    it('should not detect .gov TLD as any specific country — falls back to EU', async () => {
        const govResult = { ...mockResult, url: 'https://example.gov' };
        const output = await generateStatementContent(govResult, 'en-us', 'md', { ...metadata, country: undefined });
        // .gov is unmapped, defaults to EU (not SE or US)
        expect(output).not.toContain('Department of Justice');
        expect(output).toContain('DG CNECT');
    });
});

describe('TLD detection — extended country coverage', () => {
    it('should detect .de TLD as DE country', async () => {
        const deResult = { ...mockResult, url: 'https://example.de' };
        const output = await generateStatementContent(deResult, 'de', 'md', { ...metadata, country: undefined });
        expect(output).toContain('BFIT-Bund');
    });

    it('should detect .fr TLD as FR country', async () => {
        const frResult = { ...mockResult, url: 'https://example.fr' };
        const output = await generateStatementContent(frResult, 'fr', 'md', { ...metadata, country: undefined });
        expect(output).toContain('DINUM');
    });

    it('should detect .nl TLD as NL country', async () => {
        const nlResult = { ...mockResult, url: 'https://example.nl' };
        const output = await generateStatementContent(nlResult, 'nl', 'md', { ...metadata, country: undefined });
        expect(output).toContain('Logius');
    });

    it('should detect .es TLD as ES country', async () => {
        const esResult = { ...mockResult, url: 'https://example.es' };
        const output = await generateStatementContent(esResult, 'es', 'md', { ...metadata, country: undefined });
        expect(output).toContain('MPTFP');
    });

    it('should detect .it TLD as IT country', async () => {
        const itResult = { ...mockResult, url: 'https://example.it' };
        const output = await generateStatementContent(itResult, 'en', 'md', { ...metadata, country: undefined });
        expect(output).toContain('AgID');
    });

    it('should fall back to EU for .eu TLD (not SE)', async () => {
        const euResult = { ...mockResult, url: 'https://example.eu' };
        const output = await generateStatementContent(euResult, 'en', 'md', { ...metadata, country: undefined });
        // Must NOT contain DIGG (Swedish) — EU fallback should show DG CNECT
        expect(output).not.toContain('Digg');
        expect(output).toContain('DG CNECT');
    });

    it('should fall back to EU for .com TLD (not SE)', async () => {
        const comResult = { ...mockResult, url: 'https://example.com' };
        const output = await generateStatementContent(comResult, 'en', 'md', { ...metadata, country: undefined });
        // Must NOT contain DIGG (Swedish)
        expect(output).not.toContain('Digg');
        expect(output).toContain('DG CNECT');
    });

    it('metadata.country overrides TLD detection', async () => {
        const deResult = { ...mockResult, url: 'https://example.de' };
        const output = await generateStatementContent(deResult, 'sv', 'md', { ...metadata, country: 'SE' });
        // metadata.country='SE' wins over .de TLD
        expect(output).toContain('Digg');
    });
});

describe('EU locale enforcement body and national law verification', () => {
    const euLocales: [string, string][] = [
        ['sv', 'SE'],
        ['no', 'NO'],
        ['da', 'DK'],
        ['nl', 'NL'],
        ['de', 'DE'],
        ['fr', 'FR'],
        ['es', 'ES'],
        ['fi', 'FI'],
    ];

    it.each(euLocales)(
        'should produce correct enforcement body for %s locale (country %s)',
        async (lang, countryCode) => {
            const output = await generateStatementContent(
                mockResult,
                lang,
                'md',
                { ...metadata, country: countryCode }
            );
            const expectedBody = getEnforcementBody(countryCode as Country, 'public');
            expect(output).toContain(expectedBody);
        }
    );

    it.each(euLocales)(
        'should produce correct national law name for %s locale (country %s)',
        async (lang, countryCode) => {
            const output = await generateStatementContent(
                mockResult,
                lang,
                'md',
                { ...metadata, country: countryCode }
            );
            const law = getNationalLawByFramework('WAD', countryCode as Country);
            if (law) {
                expect(output).toContain(law.fullName);
            }
            // If law is null, no assertion needed — substitution resolves to '' which is correct
        }
    );
});

describe('TLD detection for EU locales', () => {
    const euTldTests: [string, string, string][] = [
        ['de', 'https://example.de', 'DE'],
        ['fr', 'https://example.fr', 'FR'],
        ['nl', 'https://example.nl', 'NL'],
        ['es', 'https://example.es', 'ES'],
    ];

    it.each(euTldTests)(
        'should detect .%s TLD and produce correct enforcement body',
        async (tld, url, countryCode) => {
            const tldResult = { ...mockResult, url };
            const output = await generateStatementContent(
                tldResult,
                tld,
                'md',
                { ...metadata, country: undefined }
            );
            const expectedBody = getEnforcementBody(countryCode as Country, 'public');
            expect(output).toContain(expectedBody);
        }
    );
});

describe('National law substitution', () => {
    // These tests verify the substitution key is registered in statement-generator's substitution map.
    // Templates don't currently use {<national_law>} so we verify via the exhaustiveness test
    // (no leftover placeholder) and via direct unit-testing of the resolved value.

    it('should not leave {<national_law>} as unsubstituted placeholder for DE', async () => {
        const deResult = { ...mockResult, url: 'https://example.de' };
        const output = await generateStatementContent(deResult, 'de', 'md', { ...metadata, country: 'DE' });
        expect(output).not.toMatch(/\{<national_law>\}/);
    });

    it('should not leave {<national_law>} as unsubstituted placeholder for SE', async () => {
        const output = await generateStatementContent(mockResult, 'sv', 'md', { ...metadata, country: 'SE' });
        expect(output).not.toMatch(/\{<national_law>\}/);
    });

    it('should not leave {<national_law>} as unsubstituted placeholder for GB (no WAD law)', async () => {
        const gbResult = { ...mockResult, url: 'https://example.gov.uk' };
        const output = await generateStatementContent(gbResult, 'en-gb', 'md', { ...metadata, country: 'GB' });
        // GB has no WAD law — {<national_law>} should produce empty string (no leftover placeholder)
        expect(output).not.toMatch(/\{<national_law>\}/);
    });

    it('should not leave {<national_law>} as unsubstituted placeholder for EU fallback', async () => {
        const output = await generateStatementContent(mockResult, 'en', 'md', { ...metadata, country: 'EU' });
        expect(output).not.toMatch(/\{<national_law>\}/);
    });
});

describe('Engine HTML output pipeline smoke test', () => {
    it('should produce HTML output with markup and locale-specific content for en', async () => {
        const output = await generateStatementContent(mockResult, 'en', 'html', metadata);

        // Verify HTML markup was produced (not Markdown)
        expect(output).toContain('<');

        // Verify English title marker from component renderer
        expect(output).toContain('Accessibility of');

        // Verify no leftover placeholders
        expect(output).not.toMatch(PLACEHOLDER_REGEX);
    });
});

describe('TLD detection — pt and pl', () => {
    it('should detect .pt TLD as PT country', async () => {
        const ptResult = { ...mockResult, url: 'https://example.pt' };
        const output = await generateStatementContent(ptResult, 'pt', 'md', { ...metadata, country: undefined });
        expect(output).toContain(getEnforcementBody('PT', 'public'));
    });

    it('should detect .pl TLD as PL country', async () => {
        const plResult = { ...mockResult, url: 'https://example.pl' };
        const output = await generateStatementContent(plResult, 'pl', 'md', { ...metadata, country: undefined });
        expect(output).toContain(getEnforcementBody('PL', 'public'));
    });
});

describe('New locale enforcement body and national law verification (it/pt/pl)', () => {
    const newLocales: [string, string][] = [
        ['it', 'IT'],
        ['pt', 'PT'],
        ['pl', 'PL'],
    ];

    it.each(newLocales)(
        'should produce correct enforcement body for %s locale (country %s)',
        async (lang, countryCode) => {
            const output = await generateStatementContent(
                mockResult,
                lang,
                'md',
                { ...metadata, country: countryCode }
            );
            const expectedBody = getEnforcementBody(countryCode as Country, 'public');
            expect(output).toContain(expectedBody);
        }
    );

    it.each(newLocales)(
        'should produce correct national law name for %s locale (country %s)',
        async (lang, countryCode) => {
            const output = await generateStatementContent(
                mockResult,
                lang,
                'md',
                { ...metadata, country: countryCode }
            );
            const law = getNationalLawByFramework('WAD', countryCode as Country);
            if (law) {
                expect(output).toContain(law.law);
            }
        }
    );
});

describe('EAA sector support', () => {
    it('should use EAA enforcement body when sector is private for DE', async () => {
        const output = await generateStatementContent(
            mockResult, 'de', 'md',
            { ...metadata, country: 'DE', sector: 'private' }
        );
        const eaaBody = getEnforcementBody('DE', 'private');
        expect(output).toContain(eaaBody);
    });

    it('should use EAA enforcement body when sector is private for SE', async () => {
        const output = await generateStatementContent(
            mockResult, 'sv', 'md',
            { ...metadata, country: 'SE', sector: 'private' }
        );
        const eaaBody = getEnforcementBody('SE', 'private');
        expect(output).toContain(eaaBody);
    });

    it('should use EAA national law when sector is private for DE', async () => {
        const output = await generateStatementContent(
            mockResult, 'de', 'md',
            { ...metadata, country: 'DE', sector: 'private' }
        );
        const eaaLaw = getNationalLawByFramework('EAA', 'DE');
        expect(eaaLaw).not.toBeNull();
        expect(output).toContain(eaaLaw!.fullName);
    });

    it('should use WAD national law when sector is public for DE', async () => {
        const output = await generateStatementContent(
            mockResult, 'de', 'md',
            { ...metadata, country: 'DE', sector: 'public' }
        );
        const wadLaw = getNationalLawByFramework('WAD', 'DE');
        expect(wadLaw).not.toBeNull();
        expect(output).toContain(wadLaw!.fullName);
    });

    it('should default to WAD when no sector is specified', async () => {
        const output = await generateStatementContent(
            mockResult, 'de', 'md',
            { ...metadata, country: 'DE' }
        );
        const wadBody = getEnforcementBody('DE', 'public');
        expect(output).toContain(wadBody);
        const wadLaw = getNationalLawByFramework('WAD', 'DE');
        if (wadLaw) {
            expect(output).toContain(wadLaw.fullName);
        }
    });

    it('should produce different enforcement bodies for WAD vs EAA for DE', async () => {
        const wadBody = getEnforcementBody('DE', 'public');
        const eaaBody = getEnforcementBody('DE', 'private');
        // Sanity check: they should actually differ
        expect(wadBody).not.toBe(eaaBody);
    });

    it('should produce different law names for WAD vs EAA for DE', async () => {
        const wadLaw = getNationalLawByFramework('WAD', 'DE');
        const eaaLaw = getNationalLawByFramework('EAA', 'DE');
        expect(wadLaw).not.toBeNull();
        expect(eaaLaw).not.toBeNull();
        expect(wadLaw!.fullName).not.toBe(eaaLaw!.fullName);
    });
});

describe('US ADA — sector-aware national law routing', () => {
    // US has three laws: Section 508 (federal, public), ADA Title II (state/local, public),
    // ADA Title III (private). statement-generator must resolve sector → correct ADA law.

    it('should reference ADA Title II AND Section 508 for US public sector', async () => {
        const usResult = { ...mockResult, url: 'https://example.gov' };
        const output = await generateStatementContent(
            usResult,
            'en-us',
            'md',
            { ...metadata, country: 'US', sector: 'public' }
        );
        expect(output).toContain('ADA Title II');
        expect(output).toContain('Section 508');
    });

    it('should reference ADA Title III for US private sector (not Title II)', async () => {
        const usResult = { ...mockResult, url: 'https://shop.example.com' };
        const output = await generateStatementContent(
            usResult,
            'en-us',
            'md',
            { ...metadata, country: 'US', sector: 'private' }
        );
        expect(output).toContain('ADA Title III');
        // ADA Title II must not be cited as primary law in private-sector statement.
        // Note: the en-us template still has legacy Section 508 references in the
        // technical-compliance status choice block (out-of-scope P2 cleanup).
        expect(output).not.toMatch(/ADA Title II[^I]/);
    });

    it('should reference DOJ as enforcement body for US (both sectors)', async () => {
        const outputPublic = await generateStatementContent(
            { ...mockResult, url: 'https://example.gov' },
            'en-us', 'md',
            { ...metadata, country: 'US', sector: 'public' }
        );
        const outputPrivate = await generateStatementContent(
            { ...mockResult, url: 'https://shop.example.com' },
            'en-us', 'md',
            { ...metadata, country: 'US', sector: 'private' }
        );
        expect(outputPublic).toContain('Department of Justice');
        expect(outputPrivate).toContain('Department of Justice');
    });

    it('should not leave {<national_law>} unsubstituted for US/public', async () => {
        const output = await generateStatementContent(
            mockResult,
            'en-us',
            'md',
            { ...metadata, country: 'US', sector: 'public' }
        );
        expect(output).not.toMatch(/\{<national_law>\}/);
    });

    it('should not leave {<national_law>} unsubstituted for US/private', async () => {
        const output = await generateStatementContent(
            mockResult,
            'en-us',
            'md',
            { ...metadata, country: 'US', sector: 'private' }
        );
        expect(output).not.toMatch(/\{<national_law>\}/);
    });
});
