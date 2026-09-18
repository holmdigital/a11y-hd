import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateReportHTML } from './html-template';
import type { ScanResult } from '../types';

/**
 * Intern #75, uppföljning på #74.
 *
 * #74 var en riktig sårbarhet: scan-URL:en, som är rå CLI-indata, skrevs
 * oescapad i rapport-HTML:en. Den är fixad. Under den fixen visade en PoC att
 * ytterligare nio fält renderades rått — inte angriparstyrda i dag, men samma
 * malldrift, och klarspråksrapporten escapade redan flera av dem medan
 * utvecklarrapporten inte gjorde det.
 *
 * Det som gör den här filen värd att ha är inte fälttesterna. Det är svepet
 * längst ned. Att escapa nio fält en gång hjälper inte mot det tionde som
 * läggs till om ett halvår, och exakt den sortens glidning är vad både #74 och
 * #75 handlar om.
 */

const X = '<img src=x onerror=alert(1)>';
const X_ESCAPED = '&lt;img src=x onerror=alert(1)&gt;';

const BASE = {
    url: 'https://example.com',
    timestamp: '2026-09-18T10:00:00.000Z',
    score: 50,
    complianceStatus: 'FAIL',
    stats: { passed: 0, critical: 1, high: 0, medium: 0, low: 0, total: 1 },
    metadata: { pageTitle: 'x', engineVersion: '0', standardsVersion: '0', scanDuration: 1, viewport: { width: 1, height: 1 } },
    legalSummary: { wadApplicable: true, eaaApplicable: false, eaaDeadlineViolations: 0 },
};

function report(extra: Record<string, unknown>) {
    return {
        ruleId: 'r',
        wcagCriteria: '1.1.1',
        en301549Criteria: '9.1.1.1',
        diggRisk: 'critical',
        dosLagenReference: 'd',
        remediation: { description: 'desc', technicalGuidance: 'g', component: 'Comp' },
        holmdigitalInsight: { diggRisk: 'critical', reasoning: 'reas', swedishInterpretation: 'sv', priorityRationale: 'pr' },
        legalContext: { appliesTo: ['WAD'], eaaDeadline: 'dl' },
        ...extra,
    };
}

function render(extra: Record<string, unknown>, cantTell = false): string {
    const result = {
        ...BASE,
        reports: [report({ ...extra, ...(cantTell ? { cantTell: true } : {}) })],
    } as unknown as ScanResult;
    return generateReportHTML(result, 'public');
}

describe('Intern #75 — axe- och regeldatahärlett innehåll escapas i utvecklarrapporten', () => {
    const fall: Array<[string, Record<string, unknown>, boolean]> = [
        ['report.ruleId, needs-review-sektionen', { ruleId: X }, true],
        ['report.ruleId, hinderlistan', { ruleId: X }, false],
        ['report.wcagCriteria', { wcagCriteria: X }, false],
        ['report.en301549Criteria', { en301549Criteria: X }, false],
        ['report.dosLagenReference', { dosLagenReference: X }, false],
        ['report.remediation.component', { remediation: { description: 'd', technicalGuidance: 'g', component: X } }, false],
        ['report.legalContext.eaaDeadline', { legalContext: { appliesTo: ['WAD'], eaaDeadline: X } }, false],
        [
            'report.holmdigitalInsight.priorityRationale',
            { holmdigitalInsight: { diggRisk: 'critical', reasoning: 'r', swedishInterpretation: 's', priorityRationale: X } },
            false,
        ],
    ];

    for (const [namn, extra, cantTell] of fall) {
        it(`escapar ${namn}`, () => {
            const html = render(extra, cantTell);
            expect(html, namn).not.toContain(X);
            expect(html, namn).toContain(X_ESCAPED);
        });
    }

    it('bygger badge-klassen ur en fast tabell, så ett oväntat värde inte kan bryta ut ur class=""', () => {
        const html = render({
            holmdigitalInsight: {
                diggRisk: 'critical" onmouseover=alert(1) x="',
                reasoning: 'r',
                swedishInterpretation: 's',
                priorityRationale: 'p',
            },
        });

        // Notera vad som INTE testas här: att strängen "onmouseover=alert(1)"
        // är borta. Den finns kvar, som synlig text, och det är rätt.
        // escapeHtml har ingen anledning att koda =, ( eller blanksteg i en
        // textnod — det som gör en payload ofarlig där är att citattecknen är
        // kodade. En första version av det här testet letade efter substrängen
        // och "hittade sårbarheten" i korrekt escapad utdata.
        //
        // Det som ska hålla är strukturen: klassattributet stängt och tomt
        // (okänt värde slår inte i tabellen), och payloadens citattecken kodade
        // så de inte kan avsluta attributet.
        expect(html).toContain('<span class="badge ">critical&quot; onmouseover=alert(1) x=&quot;</span>');

        // Utbrytningssignaturen: ett ROTT citattecken följt av ett attributnamn.
        expect(html).not.toContain('" onmouseover');
    });

    it('ett känt diggRisk ger fortfarande sin klass, så fixen inte tystade badgen', () => {
        for (const [risk, klass] of [['critical', 'badge-critical'], ['high', 'badge-high'], ['medium', 'badge-medium'], ['low', 'badge-low']]) {
            const html = render({
                holmdigitalInsight: { diggRisk: risk, reasoning: 'r', swedishInterpretation: 's', priorityRationale: 'p' },
            });
            expect(html, risk).toContain(klass);
        }
    });

    it('lagrumstexten är oförändrad i sak, bara HTML-kodad', () => {
        const html = render({ dosLagenReference: '5 § DOS-lagen (2018:1937)' });
        expect(html).toContain('5 § DOS-lagen (2018:1937)');
    });
});

/**
 * Svepet. Det här är poängen med filen.
 *
 * Regeln: en interpolation av `report.` eller `result.` i mallfilen ska gå
 * genom escapeHtml. Undantagen nedan är uttryckliga och var och en är ett
 * värde som inte är en sträng från data — siffror, booleaner, datum och
 * ternärer som ger fasta strängar. Att lägga till i listan är därför en
 * medveten handling, synlig i en diff, till skillnad från att glömma en
 * escape.
 */
const TILLATNA_UTAN_ESCAPE = [
    'result.stats.total',              // siffra
    'result.score',                    // siffra, går via Math.round
    'result.timestamp',                // datum, går via formatDate
    'result.legalSummary.wadApplicable',
    'result.legalSummary.eaaApplicable',
    'result.legalSummary.eaaDeadlineViolations',
    'report.legalContext?.appliesTo?.includes',  // ternär som ger fast sträng
    'report.holmdigitalInsight.diggRisk?.toLowerCase',  // nyckel till RISK_BADGE_CLASS
    'report.holmdigitalInsight.diggRisk.toLowerCase',   // sorteringsnyckel
    'report.dosLagenReference ?',      // villkoret, inte värdet
    'report.legalContext?.eaaDeadline ?',
    'report.holmdigitalInsight.priorityRationale ?',
    'report.remediation.component ?',
    // Kontrollflöde, inte utskrift. Villkoret är booleskt och grenarnas värden
    // interpoleras separat (och står var för sig i listan ovan).
    'result.legalSummary ?',
    // Blocköppningen för .map() över fynden. result.reports är en array som
    // itereras, inte en sträng som skrivs.
    'violationsOf(result.reports)',
];

describe('Intern #75 — svep: inga nya oescapade interpolationer i mallen', () => {
    it('varje ${report.x} och ${result.x} går genom escapeHtml, eller står i undantagslistan', () => {
        const fil = path.join(__dirname, 'html-template.ts');
        const rader = fs.readFileSync(fil, 'utf8').split(/\r?\n/);
        const brott: string[] = [];

        rader.forEach((rad, i) => {
            if (rad.trim().startsWith('//') || rad.trim().startsWith('*')) return;

            // Citerade stränglitteraler måste bort FÖRE sökningen. i18n-nycklarna
            // heter `report.footer`, `report.overall_score` och så vidare, så en
            // sökning på `report.` i råtexten träffar fjorton `t('report.x')`-anrop
            // som inte rör data alls. Första versionen av det här testet gjorde
            // precis det och rapporterade fjorton fel som inte fanns.
            const utanStrangar = rad.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""');

            const träffar = utanStrangar.matchAll(/\$\{([^}]*(?:report\.|result\.)[^}]*)\}?/g);
            for (const m of träffar) {
                const uttryck = m[1];
                if (uttryck.includes('escapeHtml')) continue;
                if (TILLATNA_UTAN_ESCAPE.some(t => uttryck.includes(t))) continue;
                brott.push(`rad ${i + 1}: \${${uttryck.trim().slice(0, 80)}}`);
            }
        });

        expect(
            brott,
            'Oescapade interpolationer i html-template.ts. Escapa dem, eller lägg till i ' +
            'TILLATNA_UTAN_ESCAPE med ett skäl om värdet inte är en sträng från data:\n' +
            brott.join('\n')
        ).toEqual([]);
    });
});
