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

    it('should discover all 9 expected template files', () => {
        expect(templateFiles.length).toBeGreaterThanOrEqual(9);
        const langs = templateFiles.map(f => f.replace('.json', '')).sort();
        expect(langs).toEqual(
            expect.arrayContaining(['da', 'de', 'en', 'es', 'fi', 'fr', 'nl', 'no', 'sv'])
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
            if (lang !== 'en') {
                expect(output).not.toContain('Automated scan');
                expect(output.toLowerCase()).not.toContain('partially compliant');
            }
        }
    );
});
