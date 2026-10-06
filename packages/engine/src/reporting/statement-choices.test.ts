/**
 * Utlåtandets valblock `{A / B / C}`.
 *
 * Tre fel levde i publicerad motor 3.3.12, alla i samma tolkning av mallen:
 *
 *  1. Metodvalet (självskattning / extern granskning / uppskattning) löstes på
 *     kundens efterlevnadsutfall. Varje delvis förenlig kund fick "<verktyget>
 *     har gjort en oberoende granskning", en granskning som aldrig gjordes, och
 *     varje ej förenlig kund "vi har uppskattat tillgängligheten utan granskning".
 *  2. Värdena byttes in före valen, så ett lagnamn med "/" klövs. SE privat bär
 *     "(Tillgänglighetslagen / LPTT)": full klipptes mitt i namnet, delvis blev
 *     meningen "LPTT).", och ej förenlig fick texten för DELVIS förenlig.
 *  3. Samma sak för varje annat värde med "/", till exempel ett organisationsnamn.
 *
 * Testerna läser mallarna i stället för att räkna upp fraser per språk, så en
 * ny mall omfattas utan att någon behöver komma ihåg det.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateStatementContent, resolveNationalLawReference } from './statement-generator';
import type { ScanResult } from '../core/regulatory-scanner';
import type { Country } from '@holmdigital/standards';

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const LANGS = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));

const COUNTRY_FOR: Record<string, Country> = {
    sv: 'SE', no: 'NO', da: 'DK', fi: 'FI', de: 'DE', fr: 'FR', nl: 'NL', es: 'ES',
    it: 'IT', pt: 'PT', pl: 'PL', en: 'IE', 'en-gb': 'GB', 'en-us': 'US', 'en-ca': 'CA', 'en-au': 'AU',
};

const LEVELS = ['full', 'partial', 'non-compliant'] as const;
type Level = typeof LEVELS[number];

function resultFor(level: Level): ScanResult {
    const stats = {
        full: { passed: 10, critical: 0, high: 0, medium: 0, low: 0, total: 10 },
        partial: { passed: 10, critical: 0, high: 1, medium: 0, low: 0, total: 11 },
        'non-compliant': { passed: 10, critical: 1, high: 0, medium: 0, low: 0, total: 11 },
    }[level];
    return {
        url: 'https://example.test',
        timestamp: '2026-09-24T00:00:00.000Z',
        metadata: { engineVersion: 'x', axeCoreVersion: 'x', standardsVersion: 'x', scanDuration: 1, pageTitle: 'x', pageLanguage: 'x' },
        reports: [],
        stats,
        score: level === 'full' ? 100 : level === 'partial' ? 85 : 40,
        complianceStatus: level === 'full' ? 'PASS' : 'FAIL',
        legalSummary: { wadViolations: 0, eaaViolations: 0, eaaDeadlineViolations: 0 },
    } as unknown as ScanResult;
}

interface Template { title: string; intro: string; sections: Array<{ id?: string; content: string }> }
const template = (lang: string): Template =>
    JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, `${lang}.json`), 'utf8'));

/** Alternativen i det första valblocket i texten; platshållare räknas inte som val. */
function choiceOptions(text: string): string[] {
    const m = /\{((?:[^{}]|\{<[^>]+>\})*\/(?:[^{}]|\{<[^>]+>\})*)\}/.exec(text);
    if (!m) throw new Error(`inget valblock i: ${text.slice(0, 80)}`);
    return m[1].split('/');
}

/** Den längsta bokstavliga biten av ett alternativ, utan platshållare. */
const literal = (option: string): string =>
    option.split(/\{<[^>]+>\}/).map(s => s.trim()).sort((a, b) => b.length - a.length)[0];

const render = (lang: string, level: Level, organizationName = 'Testorganisation') =>
    generateStatementContent(resultFor(level), lang, 'md', {
        organizationName, contactEmail: 't@example.test', country: COUNTRY_FOR[lang], sector: 'public',
    });

describe('utlåtandets metodval följer aldrig efterlevnadsutfallet', () => {
    for (const lang of LANGS) {
        const testing = template(lang).sections.find(s => s.id === 'testing');
        if (!testing) continue;
        const [self, external, estimated] = choiceOptions(testing.content).map(literal);

        it.each(LEVELS)(`${lang}: %s ger självskattningen, aldrig extern granskning eller uppskattning`, async (level) => {
            const md = await render(lang, level);
            expect(md).toContain(self);
            expect(md).not.toContain(external);
            if (estimated) expect(md).not.toContain(estimated);
        });
    }
});

describe('efterlevnadsvalet följer utfallet, också med snedstreck i lagnamnet', () => {
    // SE privat bär "(Tillgänglighetslagen / LPTT)", och det var den raden som
    // klövs. Ingen fixtur: det är den riktiga lagdatan som testas.
    const law = resolveNationalLawReference('SE', 'private', 'sv');

    it('lagnamnet i SE privat innehåller verkligen ett snedstreck', () => {
        expect(law).toContain('/');
    });

    it.each(LEVELS)('sv/SE privat, %s: meningen bär hela lagnamnet och rätt utfall', async (level) => {
        const md = await generateStatementContent(resultFor(level), 'sv', 'md', {
            organizationName: 'Testorganisation', contactEmail: 't@example.test', country: 'SE', sector: 'private',
        });
        const technical = template('sv').sections.find(s => s.id === 'technical')!;
        const options = choiceOptions(technical.content);
        const chosen = LEVELS.indexOf(level);
        expect(md).toContain(literal(options[chosen]));
        options.forEach((o, i) => { if (i !== chosen) expect(md).not.toContain(literal(o)); });
        expect(md).toContain(`förenlig med ${law}`);
    });
});

describe('inget insatt värde klyvs av valparsern', () => {
    const ORG = 'Region Testlän / Förvaltning 1/2';

    for (const lang of LANGS) {
        it.each(LEVELS)(`${lang}: %s återger organisationsnamnet helt, varje gång`, async (level) => {
            const md = await render(lang, level, ORG);
            const prefix = md.split('Region Testlän').length - 1;
            const whole = md.split(ORG).length - 1;
            expect(prefix).toBeGreaterThan(0);
            expect(whole).toBe(prefix);
        });
    }
});
