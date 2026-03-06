import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateStatementContent } from './statement-generator';
import type { ScanResult } from '../core/regulatory-scanner';
import type { StatementMetadata } from './statement-generator';

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

    it('should discover all 12 expected template files', () => {
        expect(templateFiles.length).toBeGreaterThanOrEqual(12);
        const langs = templateFiles.map(f => f.replace('.json', '')).sort();
        expect(langs).toEqual(
            expect.arrayContaining(['da', 'de', 'en', 'en-ca', 'en-gb', 'en-us', 'es', 'fi', 'fr', 'nl', 'no', 'sv'])
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

describe('National law substitution', () => {
    it('should resolve {<national_law>} for DE to Barrierefreiheitsstärkungsgesetz (BFSG)', async () => {
        const deResult = { ...mockResult, url: 'https://example.de' };
        const output = await generateStatementContent(deResult, 'de', 'md', { ...metadata, country: 'DE' });
        expect(output).toContain('Barrierefreiheitsstärkungsgesetz (BFSG)');
    });

    it('should resolve {<national_law>} for SE to DOS-lagen format string', async () => {
        const output = await generateStatementContent(mockResult, 'sv', 'md', { ...metadata, country: 'SE' });
        // SE has DOS-lagen as WAD law — should contain the full name + law code
        expect(output).toContain('DOS-lagen');
    });

    it('should resolve {<national_law>} for GB (no WAD law) to empty string', async () => {
        const gbResult = { ...mockResult, url: 'https://example.gov.uk' };
        const output = await generateStatementContent(gbResult, 'en-gb', 'md', { ...metadata, country: 'GB' });
        // GB has no WAD law — {<national_law>} should produce empty string (no leftover placeholder)
        expect(output).not.toMatch(/\{<national_law>\}/);
    });

    it('should not leave {<national_law>} as unsubstituted placeholder in any output', async () => {
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
