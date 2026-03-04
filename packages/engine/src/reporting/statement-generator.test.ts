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
