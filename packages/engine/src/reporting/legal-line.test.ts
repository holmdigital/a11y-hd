import { describe, it, expect } from 'vitest';
import { klarsprakLegalLine } from './legal-line';

const A = 'Lagrum okänt. Fyndet kunde inte kopplas till ett specifikt lagrum.';
const B = 'Ännu inte lagkrav under DOS-lagen (WCAG 2.2-kriterium). Blir bindande när EN 301 549 V4.x refereras i EU:s officiella tidning.';
const C = 'Lagkrav: DOS-lagen (2018:1937), 10 §.';

describe('klarsprakLegalLine — Junos tre fall (Intern #29)', () => {
    it('Fall C: en riktig DOS-lagen-referens', () => {
        expect(klarsprakLegalLine('Lag 2018:1937 10 §, preciserad i MDFFS 2019:2 4 och 5 §§ via EN 301 549 V3.2.1 Annex A, WCAG 2.1 nivå A krävs')).toBe(C);
        expect(klarsprakLegalLine('Lag 2018:1937 10 §, ... WCAG 2.1 nivå AA krävs')).toBe(C);
    });

    it('Fall B: WCAG 2.2-posten ("ännu inte lagkrav")', () => {
        expect(klarsprakLegalLine('WCAG 2.2-kriterium (nivå AA), ännu inte lagkrav under DOS-lagen. Lagens golv är WCAG 2.1 nivå AA via EN 301 549 V3.2.1.')).toBe(B);
    });

    it('Fall A: tomt, saknat, eller en fras som inte är ett lagrum', () => {
        expect(klarsprakLegalLine('')).toBe(A);
        expect(klarsprakLegalLine('   ')).toBe(A);
        expect(klarsprakLegalLine(undefined)).toBe(A);
        expect(klarsprakLegalLine(null)).toBe(A);
        expect(klarsprakLegalLine('Lagrum okänt')).toBe(A);
        // De omappade fallback-fraserna får ALDRIG renderas som lagrum.
        expect(klarsprakLegalLine('Kräver manuell bedömning')).toBe(A);
        expect(klarsprakLegalLine('Rekommendation (ej lagkrav)')).toBe(A);
    });

    it('Ordningen: "ännu inte lagkrav" testas FÖRE default även om 2018:1937 råkar finnas', () => {
        expect(klarsprakLegalLine('Lag 2018:1937 ... ännu inte lagkrav ...')).toBe(B);
    });
});

/**
 * Intern #56 — DOS-lagen gäller OFFENTLIG sektor, men klarspråksraden påstod den
 * även med `--sector private`, i den PDF vi skickar kunden. Junos godkända
 * lydelser för privat sektor påstår medvetet inget skarpt EAA-krav: om EAA gäller
 * en enskild privat aktör beror på om tjänsten är konsumentriktad, vilket varken
 * vi eller motorn kan avgöra ur en URL.
 */
const DOS_REF = 'Lag 2018:1937 10 §, preciserad i MDFFS 2019:2 4 och 5 §§ via EN 301 549 V3.2.1 Annex A, WCAG 2.1 nivå A krävs';

const PRIV = {
    nameRoleValue: 'Standard: WCAG 2.2, framgångskriterium 4.1.2 Namn, roll, värde (nivå A). Motsvaras av EN 301 549. En knapp utan tillgängligt namn kan inte tolkas av skärmläsare.',
    region: 'Standard: WCAG 2.2, framgångskriterium 1.3.1 Information och relationer (nivå A), samt god praxis för sidstruktur.',
    headingOrder: 'Standard: WCAG 2.2, framgångskriterium 1.3.1 Information och relationer (nivå A), samt god praxis för rubrikstruktur.',
};

describe('klarsprakLegalLine — privat sektor (Intern #56)', () => {
    it('Junos godkända lydelser för de tre reglerna', () => {
        expect(klarsprakLegalLine(DOS_REF, { sector: 'private', ruleId: 'name-role-value' })).toBe(PRIV.nameRoleValue);
        expect(klarsprakLegalLine('Rekommendation (ej lagkrav)', { sector: 'private', ruleId: 'region' })).toBe(PRIV.region);
        expect(klarsprakLegalLine('Rekommendation (ej lagkrav)', { sector: 'private', ruleId: 'heading-order' })).toBe(PRIV.headingOrder);
    });

    it('region och heading-order skiljs åt trots samma kriterium (1.3.1)', () => {
        // Därför är lydelserna nycklade på ruleId, inte på kriterium.
        const r = klarsprakLegalLine('', { sector: 'private', ruleId: 'region' });
        const h = klarsprakLegalLine('', { sector: 'private', ruleId: 'heading-order' });
        expect(r).not.toBe(h);
        expect(r).toContain('sidstruktur');
        expect(h).toContain('rubrikstruktur');
    });

    it('en regel utan godkänd lydelse faller på "lagrum okänt" — aldrig påhittad juridik', () => {
        expect(klarsprakLegalLine(DOS_REF, { sector: 'private', ruleId: 'color-contrast' })).toBe(A);
        expect(klarsprakLegalLine(DOS_REF, { sector: 'private' })).toBe(A);
    });

    it('privat sektor nämner ALDRIG DOS-lagen, oavsett referens eller regel', () => {
        const refs = [DOS_REF, 'Lag 2018:1937 ... ännu inte lagkrav ...', 'Rekommendation (ej lagkrav)', '', undefined];
        const rules = ['name-role-value', 'region', 'heading-order', 'color-contrast', 'okänd-regel', undefined];
        for (const ref of refs) {
            for (const ruleId of rules) {
                const line = klarsprakLegalLine(ref, { sector: 'private', ruleId });
                expect(line, `${ruleId} / ${String(ref).slice(0, 30)}`).not.toContain('DOS-lagen');
                expect(line).not.toContain('2018:1937');
            }
        }
    });
});

describe('klarsprakLegalLine — offentlig sektor är oförändrad (Intern #56)', () => {
    it('explicit public beter sig exakt som förut', () => {
        expect(klarsprakLegalLine(DOS_REF, { sector: 'public', ruleId: 'name-role-value' })).toBe(C);
        expect(klarsprakLegalLine('Rekommendation (ej lagkrav)', { sector: 'public', ruleId: 'region' })).toBe(A);
    });

    it('utan opts (bakåtkompatibilitet) beter sig exakt som förut', () => {
        expect(klarsprakLegalLine(DOS_REF)).toBe(C);
        expect(klarsprakLegalLine(DOS_REF, {})).toBe(C);
        expect(klarsprakLegalLine(DOS_REF, { ruleId: 'name-role-value' })).toBe(C);
    });
});
