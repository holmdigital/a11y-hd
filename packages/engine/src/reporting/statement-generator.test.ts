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

    it('should not detect .gov TLD as any specific country', async () => {
        const govResult = { ...mockResult, url: 'https://example.gov' };
        const output = await generateStatementContent(govResult, 'en-us', 'md', { ...metadata, country: undefined });
        // .gov is unmapped, defaults to SE, so enforcement body is Swedish (DIGG)
        expect(output).not.toContain('Department of Justice');
    });
});
