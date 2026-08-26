import { describe, it, expect } from 'vitest';
import axeCore from 'axe-core';
import { getAllConvergenceRules, generateRegulatoryReport, searchRulesByTags } from '@holmdigital/standards';
import { selectMappedRuleId, getSelfMatchingRuleIds, criteriaFromTags } from './regulatory-scanner';
import { RegulatoryScanner } from './regulatory-scanner';
import type { EnrichedReport } from '@holmdigital/standards';

/**
 * KRAV-13 (Intern #27) — the rule-label bug: the old tag fallback took the first DB
 * rule sharing any tag, so ~2/3 of findings were mislabelled (usually color-contrast).
 * These are the RED tests from the spec, verbatim axe tag arrays.
 */

const LANG = 'sv';
const rules = getAllConvergenceRules(LANG);
const selfMatchingIds = getSelfMatchingRuleIds(rules);

/** Mirror the engine: direct id match, else criterion fallback (K3-aware). */
function resolve(id: string, tags: string[]) {
    const direct = generateRegulatoryReport(id, LANG);
    const mappedId = direct ? id : selectMappedRuleId(id, tags, rules, selfMatchingIds);
    const report = mappedId ? generateRegulatoryReport(mappedId, LANG) : null;
    return { mappedId, report };
}

// Verbatim axe tag arrays from the spec.
const TAGS = {
    imageAlt: ['cat.text-alternatives', 'wcag2a', 'wcag111', 'section508', 'section508.22.a', 'TTv5', 'TT7.a', 'TT7.b', 'EN-301-549', 'EN-9.1.1.1', 'ACT', 'RGAAv4', 'RGAA-1.1.1'],
    buttonName: ['cat.name-role-value', 'wcag2a', 'wcag412', 'section508', 'section508.22.a', 'TTv5', 'TT6.a', 'EN-301-549', 'EN-9.4.1.2', 'ACT', 'RGAAv4', 'RGAA-11.9.1'],
    list: ['cat.structure', 'wcag2a', 'wcag131', 'EN-301-549', 'EN-9.1.3.1', 'RGAAv4', 'RGAA-9.3.1'],
    metaViewport: ['cat.sensory-and-visual-cues', 'wcag2aa', 'wcag144', 'EN-301-549', 'EN-9.1.4.4', 'ACT', 'RGAAv4', 'RGAA-10.4.2'],
    duplicateId: ['wcag2a-obsolete', 'wcag411'],
    inputImageAlt: ['cat.text-alternatives', 'wcag2a', 'wcag111', 'wcag412'],
    region: ['cat.keyboard', 'best-practice', 'RGAAv4', 'RGAA-9.2.1'],
};

describe('KRAV-13 red tests (Intern #27)', () => {
    it('RT1: image-alt maps to 1.1.1, never 1.4.3', () => {
        const { report } = resolve('image-alt', TAGS.imageAlt);
        expect(report?.wcagCriteria).toBe('1.1.1');
        expect(report?.en301549Criteria).toBe('9.1.1.1');
        expect(report?.wcagCriteria).not.toBe('1.4.3');
    });

    it('RT2: button-name maps to 4.1.2, never 1.4.3', () => {
        const { report } = resolve('button-name', TAGS.buttonName);
        expect(report?.wcagCriteria).toBe('4.1.2');
        expect(report?.wcagCriteria).not.toBe('1.4.3');
    });

    it('RT5: list resolves to info-and-relationships (1.3.1), never a landmark rule', () => {
        const { mappedId, report } = resolve('list', TAGS.list);
        expect(report?.wcagCriteria).toBe('1.3.1');
        expect(mappedId).toBe('info-and-relationships');
        expect(mappedId).not.toMatch(/landmark|region|heading/);
    });

    it('RT6: meta-viewport (1.4.4 not in DB) is honestly unmapped, inherits nothing', () => {
        const { mappedId } = resolve('meta-viewport', TAGS.metaViewport);
        expect(mappedId).toBeNull(); // no rule holds 1.4.4 → honest no-match branch
    });

    it('RT7: suffixed level tag wcag2a-obsolete is never a criterion; duplicate-id → 4.1.1', () => {
        expect(criteriaFromTags(TAGS.duplicateId)).toEqual(['4.1.1']);
        const { report } = resolve('duplicate-id', TAGS.duplicateId);
        expect(report?.wcagCriteria).toBe('4.1.1');
    });

    it('RT8: multiple criterion tags follow the lowest (input-image-alt → 1.1.1)', () => {
        const { report } = resolve('input-image-alt', TAGS.inputImageAlt);
        expect(report?.wcagCriteria).toBe('1.1.1');
    });
});

describe('KRAV-13 regression guards (Intern #27)', () => {
    it('RG1: a self-matching rule (region) still resolves via the direct id match', () => {
        const report = generateRegulatoryReport('region', LANG);
        expect(report).not.toBeNull();
        expect(report!.ruleId).toBe('region');
    });

    it('RG2: searchRulesByTags returns MANY rules for a shared level tag — why it must not pick', () => {
        const many = searchRulesByTags(['wcag2a'], LANG);
        expect(many.length).toBeGreaterThan(10);
    });
});

describe('KRAV-13 K3 hardening + K6 measurable outcome (Intern #27)', () => {
    it('K3: the fallback prefers a general rule over a self-matching one for a shared criterion', () => {
        // Real data (post Intern #27, the 7 landmark/heading rules are now Best Practice):
        // 1.3.1 is held by the general info-and-relationships; `list` resolves to it and
        // never to a self-matching landmark rule.
        const chosen = selectMappedRuleId('list', ['wcag131'], rules, selfMatchingIds);
        expect(chosen).toBe('info-and-relationships');
        expect(selfMatchingIds.has(chosen!)).toBe(false);

        // Synthetic order-independence: when a criterion is held by BOTH a self-matching
        // rule (its id is an axe id, reached only via the direct id match) and a general
        // one, the general always wins — regardless of file order.
        const general = { ruleId: 'info-and-relationships', wcagCriteria: '1.3.1' };
        const selfMatch = { ruleId: 'region', wcagCriteria: '1.3.1' };
        const selfIds = new Set(['region']);
        for (const order of [[selfMatch, general], [general, selfMatch]]) {
            const r = selectMappedRuleId('x', ['wcag131'], order as unknown as typeof rules, selfIds);
            expect(r).toBe('info-and-relationships');
        }
    });

    it('K6: no axe rule is ever labelled with a criterion axe did not declare (zero silent errors)', () => {
        const axeRules = axeCore.getRules() as Array<{ ruleId: string; tags: string[] }>;
        const wrong: string[] = [];
        for (const { ruleId, tags } of axeRules) {
            const direct = generateRegulatoryReport(ruleId, LANG);
            const mappedId = direct ? ruleId : selectMappedRuleId(ruleId, tags, rules, selfMatchingIds);
            if (!mappedId) continue;
            const report = generateRegulatoryReport(mappedId, LANG);
            if (!report) continue;
            if (!direct && !criteriaFromTags(tags).includes(report.wcagCriteria)) {
                wrong.push(`${ruleId} -> ${mappedId} (${report.wcagCriteria})`);
            }
        }
        expect(wrong, `Silent errors:\n${wrong.join('\n')}`).toEqual([]);
    });
});

describe('KRAV-13 both paths agree (K4/K5, Intern #27)', () => {
    const scanner = new RegulatoryScanner({ url: 'https://test.example.com' });
    const full = (i: unknown) => (scanner as unknown as { enrichResults: (x: unknown) => Promise<EnrichedReport[]> }).enrichResults(i);
    const light = (i: unknown) => (scanner as unknown as { enrichResultsLight: (x: unknown) => Promise<EnrichedReport[]> }).enrichResultsLight(i);

    const fixture = { violations: [{ id: 'image-alt', help: 'Images must have alternate text', description: 'x', tags: TAGS.imageAlt, nodes: [{ html: '<img>', target: ['img'], failureSummary: 'no alt' }] }], passes: [] };

    it('RT3+RT4: light path gives the dotted criterion "1.1.1" (not "wcag2a"), identical to the full path', async () => {
        const [f] = await full(fixture);
        const [l] = await light(fixture);
        expect(l.wcagCriteria).toBe('1.1.1');
        expect(l.wcagCriteria).not.toBe('wcag2a');
        expect(l.wcagCriteria).toBe(f.wcagCriteria);
    });
});
