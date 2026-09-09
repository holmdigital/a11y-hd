import { describe, it, expect } from 'vitest';
import { klarsprakLegalLine } from './legal-line';
import rulesSv from '@holmdigital/standards/data/rules.sv.json';

/**
 * Intern #56 — Junos tre-grensmodell.
 *
 * Den tidigare tvågrensmodellen (lagkrav / god praxis) klassade fel. Juno gick
 * igenom alla 48 regler individuellt: `color-contrast` är en riktig WCAG 1.4.3
 * AA-brist och får aldrig hamna bland best practice-reglerna, och tre WCAG 2.2-
 * kriterier är riktiga kriterier som ännu inte är bindande — vilket är något
 * annat än god praxis.
 */

const DOS_REF = 'Lag 2018:1937 10 §, preciserad i MDFFS 2019:2 4 och 5 §§ via EN 301 549 V3.2.1 Annex A, WCAG 2.1 nivå AA krävs';
const NOT_YET_REF = 'WCAG 2.2-kriterium (nivå AA), ännu inte lagkrav under DOS-lagen. Lagens golv är WCAG 2.1 nivå AA via EN 301 549 V3.2.1.';
const BP_REF = 'Rekommendation (ej lagkrav)';
const A = 'Lagrum okänt. Fyndet kunde inte kopplas till ett specifikt lagrum.';

describe('Intern #56 — gren 1: formellt lagkrav', () => {
    it('offentlig sektor citerar DOS-lagen med kriterium och EN-kriterium', () => {
        const line = klarsprakLegalLine(DOS_REF, {
            sector: 'public', ruleId: 'color-contrast', wcagCriteria: '1.4.3', en301549Criteria: '9.1.4.3'
        });
        expect(line).toBe('Lagkrav: DOS-lagen (2018:1937), 10 §. WCAG AA 1.4.3 (Contrast (Minimum)), EN 301 549 9.1.4.3.');
    });

    it('privat sektor citerar LPTT och gissar ALDRIG en EN 301 549-version', () => {
        const line = klarsprakLegalLine(DOS_REF, {
            sector: 'private', ruleId: 'color-contrast', wcagCriteria: '1.4.3', en301549Criteria: '9.1.4.3'
        });
        expect(line).toContain('lagen om vissa produkters och tjänsters tillgänglighet (2023:254), 6 och 9 §§');
        expect(line).toContain('WCAG AA 1.4.3 (Contrast (Minimum))');
        expect(line).toContain('inte verifierad');
        // Junos öppna punkt: versionen är inte belagd mot primärkälla.
        expect(line).not.toMatch(/EN 301 549 V\d/);
        expect(line).not.toContain('DOS-lagen');
    });

    it('color-contrast behandlas som lagkrav, ALDRIG som god praxis', () => {
        // Exakt fällan Juno varnade för när man generaliserar från region/heading-order.
        for (const sector of ['public', 'private'] as const) {
            const line = klarsprakLegalLine(DOS_REF, { sector, ruleId: 'color-contrast', wcagCriteria: '1.4.3' });
            expect(line).toContain('Lagkrav:');
            expect(line).not.toContain('god praxis');
        }
    });
});

describe('Intern #56 — gren 2: god praxis, samma text för båda sektorerna', () => {
    it('region och heading-order har Vilmas fastställda lydelser', () => {
        const r = klarsprakLegalLine(BP_REF, { ruleId: 'region', wcagCriteria: 'Best Practice' });
        const h = klarsprakLegalLine(BP_REF, { ruleId: 'heading-order', wcagCriteria: 'Best Practice' });
        expect(r).toContain('god praxis för sidstruktur');
        expect(h).toContain('god praxis för rubrikstruktur');
    });

    it('lydelsen påstår INTE 1.3.1 eller nivå A — den överdrev och togs bort', () => {
        for (const ruleId of ['region', 'heading-order']) {
            const line = klarsprakLegalLine(BP_REF, { ruleId, wcagCriteria: 'Best Practice' });
            expect(line, ruleId).not.toContain('1.3.1');
            expect(line, ruleId).not.toContain('nivå A');
            expect(line, ruleId).not.toContain('Lagkrav');
        }
    });

    it('identisk text för offentlig och privat — klassningsfråga, inte sektorsfråga', () => {
        for (const ruleId of ['region', 'heading-order', 'landmark-one-main']) {
            const pub = klarsprakLegalLine(BP_REF, { sector: 'public', ruleId, wcagCriteria: 'Best Practice' });
            const priv = klarsprakLegalLine(BP_REF, { sector: 'private', ruleId, wcagCriteria: 'Best Practice' });
            expect(pub, ruleId).toBe(priv);
        }
    });

    it('övriga best practice-regler får den generella lydelsen', () => {
        const line = klarsprakLegalLine(BP_REF, { ruleId: 'landmark-unique', wcagCriteria: 'Best Practice' });
        expect(line).toContain('Ingen lagkrav');
        expect(line).toContain('landmark-unique');
        expect(line).toContain('best-practice');
    });
});

describe('Intern #56 — gren 3: riktigt kriterium, ännu inte bindande', () => {
    it('target-size skiljs från god praxis och från lagkrav', () => {
        const line = klarsprakLegalLine(NOT_YET_REF, { ruleId: 'target-size', wcagCriteria: '2.5.8' });
        expect(line).toContain('Ännu inte lagkrav');
        expect(line).toContain('WCAG AA 2.5.8 (Target Size (Minimum))');
        expect(line).toContain('30 november 2026');
        // Får inte förväxlas med gren 2: detta ÄR ett framgångskriterium.
        expect(line).not.toContain('god praxis');
    });

    it('samma text oavsett sektor', () => {
        const pub = klarsprakLegalLine(NOT_YET_REF, { sector: 'public', ruleId: 'target-size', wcagCriteria: '2.5.8' });
        const priv = klarsprakLegalLine(NOT_YET_REF, { sector: 'private', ruleId: 'target-size', wcagCriteria: '2.5.8' });
        expect(pub).toBe(priv);
    });
});

describe('Intern #56 — fall A och interna referenser', () => {
    it('omappat fynd säger att lagrummet är okänt', () => {
        expect(klarsprakLegalLine('')).toBe(A);
        expect(klarsprakLegalLine(undefined)).toBe(A);
        expect(klarsprakLegalLine('Kräver manuell bedömning')).toBe(A);
    });

    it('ingen rad läcker en intern issue-referens till kunden', () => {
        const lines = [
            klarsprakLegalLine(DOS_REF, { sector: 'private', ruleId: 'color-contrast', wcagCriteria: '1.4.3' }),
            klarsprakLegalLine(NOT_YET_REF, { ruleId: 'target-size', wcagCriteria: '2.5.8' }),
            klarsprakLegalLine(BP_REF, { ruleId: 'region', wcagCriteria: 'Best Practice' }),
        ];
        for (const line of lines) {
            expect(line).not.toMatch(/Intern#?\d+/);
            expect(line).not.toContain('se öppen punkt');
            expect(line).not.toContain('nedan');
        }
    });
});

describe('Intern #56 — grenindelningen matchar Junos genomgång av datan', () => {
    it('38 lagkrav / 7 god praxis / 3 ännu inte bindande', () => {
        const rules = rulesSv as Array<{ ruleId: string; wcagCriteria: string; dosLagenReference: string }>;
        const branch = (r: { wcagCriteria: string; dosLagenReference: string }) =>
            r.wcagCriteria === 'Best Practice' ? 2 : (/ännu inte lagkrav/.test(r.dosLagenReference ?? '') ? 3 : 1);
        const counts = { 1: 0, 2: 0, 3: 0 } as Record<number, number>;
        for (const r of rules) counts[branch(r)]++;
        expect(counts[1]).toBe(38);
        expect(counts[2]).toBe(7);
        expect(counts[3]).toBe(3);
    });

    it('de tre gren 3-reglerna är exakt de Juno pekade ut', () => {
        const rules = rulesSv as Array<{ ruleId: string; wcagCriteria: string; dosLagenReference: string }>;
        const g3 = rules
            .filter(r => r.wcagCriteria !== 'Best Practice' && /ännu inte lagkrav/.test(r.dosLagenReference ?? ''))
            .map(r => r.ruleId).sort();
        expect(g3).toEqual(['dragging-movements', 'focus-not-obscured', 'target-size']);
    });
});
