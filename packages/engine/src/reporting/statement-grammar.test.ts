/**
 * Grammatiken kring lagplatsen `{<national_law>}` i utlåtandena.
 *
 * Intern #82 avsnitt 3: lydelsen är byggarens, men den måste vara grammatiskt
 * korrekt i sin mening och ordagrant identisk mellan motorn och komponenten.
 *
 * Mallarna hade en artikel framför platsen: "con la", "com a", "mit der",
 * "met de", "alla". Det var fel redan för lagnamn med annat genus ("la Real
 * Decreto", "a Decreto-Lei", "der Gesetz") och blev obegripligt med
 * fallback-frasen, som bär sin egen artikel ("con la los requisitos", "avec la
 * la réglementation"). Lagnamnsgrinden i #82 gör att fallbacken renderas i
 * ungefär hälften av alla kombinationer av land och sektor.
 *
 * Testerna läser båda mallsamlingarna: motorns JSON-mallar för Markdown och
 * komponentens inbyggda mallar, som CLI:ts HTML-utlåtanden renderas med.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const COMPONENT = path.join(__dirname, '..', '..', '..', 'components', 'src', 'AccessibilityStatement', 'AccessibilityStatement.tsx');
const ENGINE = path.join(__dirname, 'statement-generator.ts');
const SLOT = '{<national_law>}';

/** Fallback-kartan ur källan, så att testet läser det som faktiskt byggs. */
function fallbackMap(file: string): Record<string, string> {
    const src = fs.readFileSync(file, 'utf8');
    const start = src.indexOf('const NATIONAL_LAW_FALLBACK');
    const block = src.slice(start, src.indexOf('};', start));
    const map: Record<string, string> = {};
    for (const m of block.matchAll(/^\s+(\w+):\s*(['"])(.*)\2,\s*$/gm)) map[m[1]] = m[3];
    return map;
}

/** Alla texter per språk: motorns JSON-mall och komponentens inbyggda mall. */
function templateTexts(): Array<{ lang: string; set: 'md' | 'html'; text: string }> {
    const out: Array<{ lang: string; set: 'md' | 'html'; text: string }> = [];
    for (const file of fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json'))) {
        const t = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf8'));
        const lang = file.replace(/\.json$/, '');
        for (const text of [t.title, t.intro, ...t.sections.map((s: { content: string }) => s.content)]) {
            out.push({ lang, set: 'md', text });
        }
    }
    const src = fs.readFileSync(COMPONENT, 'utf8');
    const start = src.indexOf('const TEMPLATES');
    const block = src.slice(start, src.indexOf('\n};', start));
    const keys = [...block.matchAll(/^ {4}'?([a-z-]+)'?: \{/gm)];
    keys.forEach((k, i) => {
        const chunk = block.slice(k.index, keys[i + 1]?.index ?? block.length);
        for (const m of chunk.matchAll(/(?:title|intro|content): "((?:[^"\\]|\\.)*)"/g)) {
            out.push({ lang: k[1], set: 'html', text: m[1] });
        }
    });
    return out;
}

/** Ordet närmast före varje lagplats. */
function wordsBeforeSlot(text: string): string[] {
    const words: string[] = [];
    let i = text.indexOf(SLOT);
    while (i !== -1) {
        const m = text.slice(0, i).match(/([\p{L}']+)\s*$/u);
        words.push(m ? m[1] : '');
        i = text.indexOf(SLOT, i + 1);
    }
    return words;
}

const ARTICLES: Record<string, string[]> = {
    de: ['der', 'die', 'das', 'den', 'dem', 'des'],
    fr: ['le', 'la', 'les', 'du', 'au', 'aux'],
    es: ['el', 'la', 'los', 'las', 'del', 'al'],
    it: ['il', 'lo', 'la', 'i', 'gli', 'le', 'del', 'della', 'dei', 'degli', 'delle', 'al', 'alla', 'ai', 'agli', 'alle'],
    pt: ['o', 'a', 'os', 'as', 'do', 'da', 'dos', 'das', 'ao', 'à', 'aos', 'às'],
    nl: ['de', 'het', 'een'],
};

describe('lagplatsen i utlåtandena', () => {
    const texts = templateTexts();

    it('båda mallsamlingarna har lästs', () => {
        expect(texts.filter(t => t.set === 'md').length).toBeGreaterThan(0);
        expect(texts.filter(t => t.set === 'html').length).toBeGreaterThan(0);
    });

    for (const [lang, articles] of Object.entries(ARTICLES)) {
        it(`${lang}: ingen artikel direkt före lagplatsen, i någon av samlingarna`, () => {
            const offenders: string[] = [];
            for (const t of texts.filter(t => t.lang === lang)) {
                for (const word of wordsBeforeSlot(t.text)) {
                    if (articles.includes(word.toLowerCase())) offenders.push(`${t.set}: "${word} ${SLOT}"`);
                }
            }
            expect(offenders).toEqual([]);
        });
    }

    it('pl: varje lagplats står efter "z", så fallbacken står i instrumentalis', () => {
        const words = texts.filter(t => t.lang === 'pl').flatMap(t => wordsBeforeSlot(t.text));
        expect(words.length).toBeGreaterThan(0);
        expect(new Set(words)).toEqual(new Set(['z']));
        expect(fallbackMap(ENGINE).pl).toMatch(/^obowiązującymi /);
    });

    it('fi: varje lagplats styr genitiv, och fallbacken står i genitiv', () => {
        const after = texts.filter(t => t.lang === 'fi').flatMap(t => {
            const out: string[] = [];
            let i = t.text.indexOf(SLOT);
            while (i !== -1) {
                out.push((t.text.slice(i + SLOT.length).match(/^\s*([\p{L}]+)/u) ?? ['', ''])[1]);
                i = t.text.indexOf(SLOT, i + 1);
            }
            return out;
        });
        expect(new Set(after)).toEqual(new Set(['mukainen', 'vaatimukset', 'valvonnasta']));
        expect(fallbackMap(ENGINE).fi).toMatch(/n$/);
    });
});

describe('fallback-fraserna', () => {
    it('är ordagrant identiska i motorn och komponenten', () => {
        const engine = fallbackMap(ENGINE);
        expect(Object.keys(engine).length).toBeGreaterThanOrEqual(12);
        expect(fallbackMap(COMPONENT)).toEqual(engine);
    });
});
