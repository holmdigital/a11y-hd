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
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateStatementContent, resolveNationalLawReference, type StatementMetadata } from './statement-generator';
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

interface Template { title: string; intro: string; sections: Array<{ id?: string; title?: string; content: string }> }
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

/*
 * Intern #95: metodvalet är anroparens uttalade val, `reviewMethod`.
 *
 * Efter #91 gav metodvalet alltid självskattningen, så "extern granskning" och
 * "uppskattning utan granskning" gick inte att nå ens när de var sanna. Nu
 * väljer anroparen. Invarianten från #91 står kvar: metoden läses aldrig ur
 * efterlevnadsutfallet, och granskarens plats fylls aldrig med verktygets namn.
 *
 * HTML-utlåtandet renderas av komponenten, som har egna mallar och egna tester
 * för dem. Här visas att motorn skickar valet dit.
 */
const REVIEWER = 'Granskaren AB';
const ORG = 'Testorganisation';
const METHODS = [undefined, 'self-assessment', 'external-review', 'no-review'] as const;
type Method = typeof METHODS[number];
const FORMATS = ['md', 'html'] as const;

/** Vilket alternativ i metodblocket ett val ska ge. */
const expectedIndex = (method: Method): number =>
    method === 'external-review' ? 1 : method === 'no-review' ? 2 : 0;

const placeholdersIn = (text: string): string[] => text.match(/\{<[^>]+>\}/g) ?? [];

/** Granskarens plats: platshållaren som det andra alternativet har och det första saknar. */
function reviewerSlots(options: string[]): Set<string> {
    const own = new Set(placeholdersIn(options[0]));
    return new Set(placeholdersIn(options[1]).filter(p => !own.has(p)));
}

/** Ett alternativ som det ska se ut i utlåtandet: granskaren på sin plats, organisationen på övriga. */
const asRendered = (option: string, slots: Set<string>): string =>
    option.replace(/\{<[^>]+>\}/g, p => (slots.has(p) ? REVIEWER : ORG)).trim();

function methodOptions(lang: string): string[] {
    const testing = template(lang).sections.find(s => s.id === 'testing');
    if (!testing) throw new Error(`${lang} saknar sektionen testing`);
    return choiceOptions(testing.content);
}

/** Första stycket i Markdown-utlåtandets metodsektion, alltså den valda meningen. */
function methodText(md: string, lang: string): string {
    const title = template(lang).sections.find(s => s.id === 'testing')?.title;
    const body = title === undefined ? undefined : md.split(`## ${title}\n\n`)[1];
    if (body === undefined) throw new Error(`ingen metodsektion i ${lang}`);
    return body.split('\n\n')[0];
}

/**
 * Texten mellan taggarna i ett HTML-utlåtande, som den står i markupen. Stycken
 * räcker inte: komponenten gör ett block med "ring " till ett kontaktkort, och
 * den norska och danska självskattningen ("egenevaluering (intern …") matchar.
 */
const textRuns = (html: string): string[] => html.split(/<[^>]*>/).map(s => s.trim()).filter(Boolean);

const renderWith = (lang: string, level: Level, extra: StatementMetadata, format: 'md' | 'html' = 'md') =>
    generateStatementContent(resultFor(level), lang, format, {
        organizationName: ORG, contactEmail: 't@example.test', country: COUNTRY_FOR[lang], sector: 'public', ...extra,
    });

const EXTERNAL: StatementMetadata = { reviewMethod: 'external-review', reviewer: { name: REVIEWER } };

describe('Intern #95: granskarens plats finns bara i metodvalets andra alternativ', () => {
    // Tre alternativ, för att no-review väljer index 1 när blocket bara har två,
    // och index 1 är den externa granskningen. Och granskarens plats bara där,
    // för att den bara är ifylld när anroparen uttryckligen valt extern granskning.
    it.each(LANGS)('%s', (lang) => {
        const options = methodOptions(lang);
        expect(options).toHaveLength(3);
        const slots = [...reviewerSlots(options)];
        expect(slots).toHaveLength(1);
        expect(JSON.stringify(template(lang)).split(slots[0]).length - 1).toBe(1);
    });
});

describe('Intern #95: uttalad extern granskning namnger granskaren, i varje mall', () => {
    for (const lang of LANGS) {
        const options = methodOptions(lang);
        const [self, external, estimated] = options.map(literal);

        it(`${lang} md: det andra alternativet, med granskarens namn`, async () => {
            const md = await renderWith(lang, 'partial', EXTERNAL);
            expect(methodText(md, lang)).toBe(asRendered(options[1], reviewerSlots(options)));
            expect(md).toContain(REVIEWER);
            expect(md).toContain(external);
            expect(md).not.toContain(self);
            expect(md).not.toContain(estimated);
        });

        it(`${lang} html: valet når komponenten och ersätter självskattningen`, async () => {
            const own = textRuns(await renderWith(lang, 'partial', {}, 'html'));
            const html = await renderWith(lang, 'partial', EXTERNAL, 'html');
            const reviewed = textRuns(html);
            const named = reviewed.filter(t => t.includes(REVIEWER));
            expect(named).toHaveLength(1);
            expect(reviewed).toHaveLength(own.length);
            // Samma plats i utlåtandet utan val är självskattningen, och den ska vara borta.
            const selfSentence = own[reviewed.indexOf(named[0])];
            expect(selfSentence).not.toContain(REVIEWER);
            expect(html).not.toContain(selfSentence);
        });
    }
});

describe('Intern #95: metodvalet följer reviewMethod, aldrig efterlevnadsutfallet', () => {
    for (const lang of LANGS) {
        const options = methodOptions(lang);
        const slots = reviewerSlots(options);

        it.each(METHODS)(`${lang}: reviewMethod %s ger samma metodtext på alla tre nivåer`, async (method) => {
            // Granskaren skickas med i alla fall: ett namn ensamt väljer ingen metod.
            const texts = await Promise.all(LEVELS.map(async level =>
                methodText(await renderWith(lang, level, { reviewMethod: method, reviewer: { name: REVIEWER } }), lang)));
            expect(texts).toEqual(LEVELS.map(() => asRendered(options[expectedIndex(method)], slots)));
        });
    }
});

describe('Intern #95: utan reviewMethod är utlåtandet oförändrat', () => {
    // Datumet fryses så att två renderingar kan jämföras tecken för tecken.
    beforeAll(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-09-24T12:00:00Z'));
    });
    afterAll(() => {
        vi.useRealTimers();
    });

    // Delvis förenlig är nivån där #91 slog till. Att metodtexten är densamma på
    // alla nivåer visar blocket ovan, också för ett utelämnat val.
    for (const lang of LANGS) {
        it.each(FORMATS)(`${lang} %s: samma dokument som med 'self-assessment', och självskattningen`, async (format) => {
            const omitted = await renderWith(lang, 'partial', {}, format);
            expect(omitted).toBe(await renderWith(lang, 'partial', { reviewMethod: 'self-assessment' }, format));
            if (format === 'md') {
                const options = methodOptions(lang);
                expect(methodText(omitted, lang)).toBe(asRendered(options[0], reviewerSlots(options)));
            }
        });
    }
});

describe('Intern #95: extern granskning utan namngiven granskare är ett fel', () => {
    const MISSING: Array<[string, StatementMetadata['reviewer']]> = [
        ['utan reviewer', undefined],
        ['med tomt namn', { name: '' }],
        ['med bara blanksteg i namnet', { name: '   ' }],
    ];

    it.each(MISSING)('%s kastar i båda formaten, i stället för att skriva ett utlåtande', async (_label, reviewer) => {
        for (const format of FORMATS) {
            await expect(renderWith('sv', 'partial', { reviewMethod: 'external-review', reviewer }, format))
                .rejects.toThrow(/reviewer/);
        }
    });

    it('felet säger vad som ska skickas in, och vad som gäller annars', async () => {
        const error = await renderWith('en', 'full', { reviewMethod: 'external-review' }).catch((e: unknown) => e);
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("reviewer: { name: 'Example Audit AB' }");
        expect((error as Error).message).toContain("'self-assessment'");
    });
});

describe('Intern #95: sidfoten namnger verktyget som skrev dokumentet, aldrig granskaren', () => {
    for (const lang of LANGS) {
        it.each(FORMATS)(`${lang} %s`, async (format) => {
            const out = await renderWith(lang, 'partial', EXTERNAL, format);
            const footer = format === 'md'
                ? out.slice(out.lastIndexOf('\n---\n'))
                : (/<footer\b[\s\S]*?<\/footer>/.exec(out)?.[0] ?? '');
            expect(footer).toContain('HolmDigital Regulatory Engine');
            expect(footer).not.toContain(REVIEWER);
        });
    }
});
