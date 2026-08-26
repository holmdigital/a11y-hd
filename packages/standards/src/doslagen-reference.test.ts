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
import nationalLaws from '../data/legal/national-laws.json';

/**
 * Intern #28 — lås för `dosLagenReference`-lagrummen.
 *
 * Regeldata pekade tidigare på fel lagrum i kundvända rapporter (38× DOS-lagens
 * §7 = museiföremål i stället för 10 §, 7× 9 § = undantagsparagrafen, en 100 §
 * som inte finns, 45× det upphävda spanska regelverket UNE 139803, samt fel
 * akttyp "Delibera" för två italienska AgID-akter). Junos godkända lydelser
 * byggdes ordagrant. Det här testet låser dem så att de inte kan glida isär igen.
 */

const count = (haystack: string, needle: string): number =>
    haystack.split(needle).length - 1;

// Varje data-fil serialiserad, så vi kan söka på hela innehållet.
const ALL_DATA: Record<string, string> = {
    'rules.sv': JSON.stringify(rulesSv),
    'rules.en': JSON.stringify(rulesEn),
    'rules.da': JSON.stringify(rulesDa),
    'rules.fi': JSON.stringify(rulesFi),
    'rules.es': JSON.stringify(rulesEs),
    'rules.no': JSON.stringify(rulesNo),
    'rules.de': JSON.stringify(rulesDe),
    'rules.fr': JSON.stringify(rulesFr),
    'rules.nl': JSON.stringify(rulesNl),
    'rules.en-gb': JSON.stringify(rulesEnGb),
    'rules.en-us': JSON.stringify(rulesEnUs),
    'rules.en-ca': JSON.stringify(rulesEnCa),
    'national-laws': JSON.stringify(nationalLaws),
};

const SV_A = 'Lag 2018:1937 10 §, preciserad i MDFFS 2019:2 4 och 5 §§ via EN 301 549 V3.2.1 Annex A, WCAG 2.1 nivå A krävs';
const SV_AA = 'Lag 2018:1937 10 §, preciserad i MDFFS 2019:2 4 och 5 §§ via EN 301 549 V3.2.1 Annex A, WCAG 2.1 nivå AA krävs';
const ES_A = 'Real Decreto 1112/2018, artículos 5 y 6, mediante UNE-EN 301549:2022 (EN 301 549 V3.2.1) Anexo A, Nivel A requerido';
const ES_AA = 'Real Decreto 1112/2018, artículos 5 y 6, mediante UNE-EN 301549:2022 (EN 301 549 V3.2.1) Anexo A, Nivel AA requerido';

describe('Intern #28 — dosLagenReference lagrum', () => {
    describe('inga gamla, felaktiga hänvisningar får återkomma i någon data-fil', () => {
        const forbidden = ['2018:1937 §7', '9 § (Struktur', '100 §', 'UNE 139803', 'Delibera'];
        for (const [name, blob] of Object.entries(ALL_DATA)) {
            for (const pat of forbidden) {
                it(`${name} innehåller inte "${pat}"`, () => {
                    expect(blob).not.toContain(pat);
                });
            }
        }
    });

    it('rules.sv bär Junos svenska 10 §-lydelse (21 nivå A, 17 nivå AA)', () => {
        // 21 f.d. §7 (de 7 f.d. 9 § blev "Best Practice" i Intern #27, ej lagkrav).
        expect(count(ALL_DATA['rules.sv'], SV_A)).toBe(21);
        expect(count(ALL_DATA['rules.sv'], SV_AA)).toBe(17);
    });

    it('en/da/fi: inga svenska strängar', () => {
        for (const f of ['rules.en', 'rules.da', 'rules.fi']) {
            expect(ALL_DATA[f]).not.toContain('krävs');
            expect(ALL_DATA[f]).not.toContain('Struktur och relationer');
            expect(ALL_DATA[f]).not.toContain('Lag 2018:1937');
        }
    });

    it('da och fi har samma A/AA-fördelning som no (21 A / 17 AA) efter Best Practice-flytten', () => {
        // 21, inte 28: de 7 f.d. 9 § blev "Best Practice" (Intern #27), utan EN-lagrum.
        for (const f of ['rules.da', 'rules.fi', 'rules.no']) {
            expect(count(ALL_DATA[f], 'WCAG 2.1 Level A required')).toBe(21);
            expect(count(ALL_DATA[f], 'WCAG 2.1 Level AA required')).toBe(17);
        }
    });

    it('rules.es bär Junos RD 1112/2018-lydelse (21 nivå A, 17 nivå AA)', () => {
        // 21, inte 28: de 7 f.d. 9 § blev "Best Practice" (Intern #27).
        expect(count(ALL_DATA['rules.es'], ES_A)).toBe(21);
        expect(count(ALL_DATA['rules.es'], ES_AA)).toBe(17);
    });

    it('national-laws es-une: law + fullName rättade, id orört', () => {
        const laws = (nationalLaws as { laws: Record<string, Array<Record<string, unknown>>> }).laws;
        const es = laws['ES'].find((l) => l.id === 'es-une');
        expect(es).toBeDefined();
        expect(es!.law).toBe('Real Decreto 1112/2018');
        expect(es!.fullName).toBe('Real Decreto 1112/2018, de 7 de septiembre, sobre accesibilidad de los sitios web y aplicaciones para dispositivos móviles del sector público');
        expect(es!.id).toBe('es-une'); // opak nyckel — ändras aldrig i denna patch
    });

    it('national-laws italiensk akttyp: Determinazione, aldrig Delibera', () => {
        expect(count(ALL_DATA['national-laws'], 'Determinazione n. 84 del 15 maggio 2026')).toBe(2);
        expect(count(ALL_DATA['national-laws'], 'Determinazione n. 38 del 4 marzo 2026')).toBe(1);
    });

    it('fr-rgaa lämnas orörd i denna patch (eget spår)', () => {
        const laws = (nationalLaws as { laws: Record<string, Array<Record<string, unknown>>> }).laws;
        const fr = laws['FR'].find((l) => l.id === 'fr-rgaa');
        expect(fr).toBeDefined();
        expect(fr!.law).toBe('RGAA');
    });
});
