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
