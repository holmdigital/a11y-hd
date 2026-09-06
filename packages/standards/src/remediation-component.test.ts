import { describe, it, expect } from 'vitest';
import rulesSv from '../data/rules.sv.json';
import rulesEn from '../data/rules.en.json';
import rulesDa from '../data/rules.da.json';
import rulesFi from '../data/rules.fi.json';
import rulesEs from '../data/rules.es.json';
import rulesNo from '../data/rules.no.json';
import rulesDe from '../data/rules.de.json';
import rulesFr from '../data/rules.fr.json';
import rulesNl from '../data/rules.nl.json';
import rulesEnGb from '../data/rules.en-gb.json';
import rulesEnUs from '../data/rules.en-us.json';
import rulesEnCa from '../data/rules.en-ca.json';

/**
 * Intern #43 fynd 2 — lås för `remediation.component`.
 *
 * Motorn klistrade ett komponentförslag på fynd där komponenten inte hörde hemma:
 * ett `@holmdigital/components/Button`-kodexempel på ett rent `<span>`-kontrastfel
 * (digg.se) och en `ProgressBar` injicerad på en extern sajt (airbnb).
 *
 * Vilma och Mejas regel (landad 2026-09-05): ett komponentförslag hör hemma bara när
 * felet är en trasig eller egenbyggd interaktiv widget där den äkta fixen ÄR att
 * använda rätt komponent. Att tömma fältet betyder aldrig att felet är mindre
 * allvarligt — bara att åtgärdstypen är en annan.
 */

type Remediation = { component?: string | null; codeExample?: string | null };
type Rule = { ruleId: string; wcagCriteria?: string; remediation?: Remediation };

const LOCALES: Record<string, Rule[]> = {
    sv: rulesSv as Rule[], en: rulesEn as Rule[], da: rulesDa as Rule[], fi: rulesFi as Rule[],
    es: rulesEs as Rule[], no: rulesNo as Rule[], de: rulesDe as Rule[], fr: rulesFr as Rule[],
    nl: rulesNl as Rule[], 'en-gb': rulesEnGb as Rule[], 'en-us': rulesEnUs as Rule[], 'en-ca': rulesEnCa as Rule[],
};

/** Komponentförslaget togs bort — åtgärdstypen är en annan (CSS, ARIA, generellt). */
const MUST_BE_EMPTY = [
    'color-contrast',      // 1.4.3  CSS-kontrast, vilken text som helst
    'non-text-contrast',   // 1.4.11 UI-kontrast generellt
    'focus-visible',       // 2.4.7  alla fokuserbara element
    'target-size',         // 2.5.8  kodexemplet är ren CSS
    'use-of-color',        // 1.4.1  färganvändning generellt
    'name-role-value',     // 4.1.2  alla egna ARIA-widgets (airbnb-felet)
    'keyboard-accessible', // 2.1.1  rätt bara i div-till-button-fallet
];

/** Komponenten passar: felet ÄR en trasig/egenbyggd widget. */
const MUST_KEEP: Record<string, string> = {
    'identify-input-purpose': '@holmdigital/components/FormField',
    'form-labels': '@holmdigital/components/FormField',
    'error-identification': '@holmdigital/components/FormField',
    'error-suggestion': '@holmdigital/components/FormField',
    'status-messages': '@holmdigital/components/LiveRegion',
};

/**
 * Känd drift, upptäckt när regeln tillämpades: en-gb/en-us/en-ca fick aldrig
 * `status-messages` → LiveRegion (component `null`, codeExample saknas helt), till
 * skillnad från de nio andra. Rapporterat till Meja. Ta bort undantaget när det
 * backfillas — då börjar KEEP-testet gälla alla tolv.
 */
const STATUS_MESSAGES_GAP = ['en-gb', 'en-us', 'en-ca'];

const find = (rules: Rule[], id: string) => rules.find(r => r.ruleId === id);

describe('Intern #43 fynd 2 — remediation.component', () => {
    describe('de sju reglerna bär inget komponentförslag, i någon locale', () => {
        for (const [loc, rules] of Object.entries(LOCALES)) {
            for (const id of MUST_BE_EMPTY) {
                it(`${loc}: ${id} har tomt component`, () => {
                    const r = find(rules, id);
                    expect(r, `${id} saknas i ${loc}`).toBeDefined();
                    expect(r!.remediation?.component ?? null).toBeNull();
                });
            }
        }
    });

    describe('de fem där komponenten passar behåller exakt rätt komponent', () => {
        for (const [loc, rules] of Object.entries(LOCALES)) {
            for (const [id, expected] of Object.entries(MUST_KEEP)) {
                if (id === 'status-messages' && STATUS_MESSAGES_GAP.includes(loc)) continue;
                it(`${loc}: ${id} → ${expected.split('/').pop()}`, () => {
                    expect(find(rules, id)?.remediation?.component).toBe(expected);
                });
            }
        }
    });

    it('ingen regel utan component bär kvar en komponent-import i sitt kodexempel', () => {
        // Kärnan i fyndet: symptomet kunden såg var kodexemplet, inte fältet.
        const leaks: string[] = [];
        for (const [loc, rules] of Object.entries(LOCALES)) {
            for (const r of rules) {
                const rem = r.remediation;
                if (!rem || rem.component) continue;
                if (rem.codeExample && rem.codeExample.includes('@holmdigital/components')) {
                    leaks.push(`${loc}:${r.ruleId}`);
                }
            }
        }
        expect(leaks, `Komponent-import kvar utan component:\n${leaks.join('\n')}`).toEqual([]);
    });

    it('target-size behåller sitt rena CSS-exempel (att tömma component tar inte bort vägledningen)', () => {
        const r = find(LOCALES.sv, 'target-size')!;
        expect(r.remediation?.component ?? null).toBeNull();
        expect(r.remediation?.codeExample).toContain('min-height');
        expect(r.remediation?.codeExample).not.toContain('@holmdigital/components');
    });

    it('keyboard-accessible behåller div-till-button-vägledningen utan komponent-svansen', () => {
        for (const [loc, rules] of Object.entries(LOCALES)) {
            const ce = find(rules, 'keyboard-accessible')?.remediation?.codeExample ?? '';
            expect(ce, `${loc}`).toContain('<button onClick=');
            expect(ce, `${loc}`).not.toContain('@holmdigital/components');
        }
    });

    it('exakt fem regler bär ett komponentförslag (fyra i de tre en-varianterna, känd drift)', () => {
        for (const [loc, rules] of Object.entries(LOCALES)) {
            const withComponent = rules.filter(r => r.remediation?.component).map(r => r.ruleId).sort();
            const expected = Object.keys(MUST_KEEP)
                .filter(id => !(id === 'status-messages' && STATUS_MESSAGES_GAP.includes(loc)))
                .sort();
            expect(withComponent, `${loc}`).toEqual(expected);
        }
    });
});
