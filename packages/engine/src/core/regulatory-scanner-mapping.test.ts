import { describe, it, expect } from 'vitest';
import axeCore from 'axe-core';
import { getAllConvergenceRules, generateRegulatoryReport } from '@holmdigital/standards';
import { wcagTagToCriterion, criteriaFromTags, selectMappedRuleId } from './regulatory-scanner';

/**
 * Intern #30: the engine used to label a rule by ANY shared tag, taking the first
 * DB entry in file order — color-contrast (wcag2a/wcag21aa) therefore won every rule
 * carrying a level tag, so an image with no alt was reported as a contrast failure.
 * These tests walk every axe rule through the mapping and assert zero wrong choices.
 */

const LANG = 'sv';
const rules = getAllConvergenceRules(LANG);

// axe's own rule definitions (id + tags), reproduced independently of our data.
const axeRules = (axeCore.getRules() as Array<{ ruleId: string; tags: string[] }>);

describe('wcagTagToCriterion / criteriaFromTags (Intern #30)', () => {
    it('parses criterion tags, rejects level tags', () => {
        expect(wcagTagToCriterion('wcag111')).toBe('1.1.1');
        expect(wcagTagToCriterion('wcag143')).toBe('1.4.3');
        expect(wcagTagToCriterion('wcag258')).toBe('2.5.8');
        expect(wcagTagToCriterion('wcag1410')).toBe('1.4.10');
        // Level tags are NOT criteria.
        expect(wcagTagToCriterion('wcag2a')).toBeNull();
        expect(wcagTagToCriterion('wcag21aa')).toBeNull();
        expect(wcagTagToCriterion('best-practice')).toBeNull();
    });

    it('criteriaFromTags keeps only real criteria', () => {
        expect(criteriaFromTags(['cat.text-alternatives', 'wcag2a', 'wcag111'])).toEqual(['1.1.1']);
        expect(criteriaFromTags(['wcag2a', 'wcag21aa'])).toEqual([]);
    });
});

describe('mapping every axe rule — zero wrong criterion (Intern #30)', () => {
    it('no axe rule maps to a rule whose criterion axe never declared', () => {
        const wrong: string[] = [];
        for (const { ruleId, tags } of axeRules) {
            // Mirror the engine: direct id match first, else criterion fallback.
            const direct = generateRegulatoryReport(ruleId, LANG);
            const mappedRuleId = direct ? ruleId : selectMappedRuleId(ruleId, tags, rules);
            if (!mappedRuleId) continue; // honest "no mapping" branch
            const report = generateRegulatoryReport(mappedRuleId, LANG);
            if (!report) continue;
            const declared = criteriaFromTags(tags);
            // A direct id match may legitimately carry a criterion axe didn't tag;
            // the fallback path (the bug) must never do so.
            if (!direct && !declared.includes(report.wcagCriteria)) {
                wrong.push(`${ruleId} -> ${mappedRuleId} (${report.wcagCriteria}); axe declares ${declared.join(',') || '—'}`);
            }
        }
        expect(wrong, `Wrong criterion choices:\n${wrong.join('\n')}`).toEqual([]);
    });

    it.each(['image-alt', 'label', 'link-name', 'html-has-lang', 'list', 'object-alt', 'frame-title'])(
        '%s is never reported as color-contrast / 1.4.3',
        (ruleId) => {
            const axeRule = axeRules.find(r => r.ruleId === ruleId);
            expect(axeRule, `axe rule ${ruleId} not found`).toBeTruthy();
            const tags = axeRule!.tags;
            const mappedRuleId = generateRegulatoryReport(ruleId, LANG) ? ruleId : selectMappedRuleId(ruleId, tags, rules);
            if (mappedRuleId) {
                const report = generateRegulatoryReport(mappedRuleId, LANG)!;
                expect(mappedRuleId).not.toBe('color-contrast');
                expect(report.wcagCriteria).not.toBe('1.4.3');
                // Whatever it resolves to must be one of axe's declared criteria.
                expect(criteriaFromTags(tags)).toContain(report.wcagCriteria);
            }
            // If unmapped, that's the honest branch — also acceptable (never mislabelled).
        }
    );

    // Karin's tiebreak ratification (2026-08-25): link-name and area-alt map to
    // 4.1.2 (Name, Role, Value), not 2.4.4 — the failure is a missing accessible name.
    it.each(['link-name', 'area-alt'])('%s maps to 4.1.2 (Name, Role, Value), not 2.4.4', (ruleId) => {
        const axeRule = axeRules.find(r => r.ruleId === ruleId);
        expect(axeRule, `axe rule ${ruleId} not found`).toBeTruthy();
        // Sanity: axe declares both 2.4.4 and 4.1.2 for these.
        expect(criteriaFromTags(axeRule!.tags)).toEqual(expect.arrayContaining(['2.4.4', '4.1.2']));
        const mappedRuleId = generateRegulatoryReport(ruleId, LANG) ? ruleId : selectMappedRuleId(ruleId, axeRule!.tags, rules);
        const report = generateRegulatoryReport(mappedRuleId!, LANG)!;
        expect(report.wcagCriteria).toBe('4.1.2');
    });
});
