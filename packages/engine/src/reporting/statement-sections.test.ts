import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateStatementContent } from './statement-generator';
import type { StatementMetadata } from './statement-generator';
import type { Country } from '@holmdigital/standards';
import type { ScanResult } from '../core/regulatory-scanner';

/**
 * Intern #23 Fynd B: the enforcement ("Tilsyn") section rendered with empty holes for
 * a private Norwegian entity (no supervisory authority — NO.eaa is ''), implying a
 * reporting duty a private actor does not have. And a title-less template section
 * rendered as a bare "## undefined" heading in every locale.
 */

const mockResult = {
    url: 'https://example.no',
    timestamp: '2026-08-25T00:00:00Z',
    metadata: {
        engineVersion: '3.1.3', axeCoreVersion: '4.13.0', standardsVersion: '3.0.3',
        scanDuration: 1000, pageTitle: 'Example', pageLanguage: 'no',
    },
    reports: [],
    stats: { passed: 46, critical: 0, high: 0, medium: 0, low: 0, total: 0, needsReview: 0 },
    score: 100,
    complianceStatus: 'PASS',
} as unknown as ScanResult;

const md = (country: Country, sector: 'public' | 'private'): StatementMetadata =>
    ({ organizationName: 'Testbedrift', contactEmail: 't@example.no', country, sector, publishDate: '2026-08-25' } as StatementMetadata);

describe('statement sections (Intern #23 Fynd B)', () => {
    it('omits the Tilsyn section entirely for a private Norwegian entity (no authority)', async () => {
        const out = await generateStatementContent(mockResult, 'no', 'md', md('NO', 'private'));
        expect(out).not.toContain('## Tilsyn');
        // no empty-hole sentence either
        expect(out).not.toMatch(/^\s*har ansvaret for tilsyn/m);
    });

    it('keeps the Tilsyn section for the public sector, where an authority exists', async () => {
        const out = await generateStatementContent(mockResult, 'no', 'md', md('NO', 'public'));
        expect(out).toContain('## Tilsyn');
        expect(out).toContain('Tilsynet for universell utforming av ikt');
    });

    it('never renders a bare "## undefined" heading in any locale', async () => {
        const dir = path.join(__dirname, 'templates');
        const langs = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
        for (const lang of langs) {
            const out = await generateStatementContent(mockResult, lang, 'md', md('NO', 'private'));
            expect(out, `"## undefined" leaked in ${lang}`).not.toContain('## undefined');
        }
    });
});
