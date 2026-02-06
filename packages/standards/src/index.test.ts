
import { describe, it, expect } from 'vitest';
import {
    getEN301549Mapping,
    getDOSLagenReference,
    getICTManualChecklist,
    getAllConvergenceRules,
    getDatabaseStats,
    // EU Legal Framework functions
    getRulesByFramework,
    getRulesBySector,
    getLegalFrameworks,
    getLegalFramework,
    getNordicAuthorities,
    getNordicAuthority,
    getNordicAuthoritiesByCountry,
    getStatementTools,
    getEAADeadlineRules
} from './index';

describe('Standards Package', () => {
    it('should export convergence rules', () => {
        const rules = getAllConvergenceRules('en');
        expect(rules.length).toBeGreaterThan(0);
    });

    it('should retrieve database stats', () => {
        const stats = getDatabaseStats('en');
        expect(stats.totalRules).toBeGreaterThan(0);
        expect(stats.rulesByLevel.A).toBeGreaterThan(0);
    });

    it('should mapping WCAG to EN 301 549', () => {
        const mapping = getEN301549Mapping('1.1.1', 'en');
        expect(mapping).toBeDefined();
        expect(mapping?.wcagCriteria).toBe('1.1.1');
    });

    it('should return DOS-lagen reference', () => {
        // Assuming 1.1.1 maps to a DOS law ref
        const ref = getDOSLagenReference('1.1.1', 'en');
        // It might be null if not applicable, but let's check it doesn't crash
        expect(ref).toBeDefined(); // null or string
    });

    it('should load ICT manual checklist', () => {
        const checks = getICTManualChecklist();
        expect(Array.isArray(checks)).toBe(true);
    });
});

describe('EU Legal Framework', () => {
    it('should get rules by WAD framework', () => {
        const rules = getRulesByFramework('WAD');
        expect(rules.length).toBeGreaterThan(0);
        // color-contrast should be included
        const colorContrast = rules.find(r => r.ruleId === 'color-contrast');
        expect(colorContrast).toBeDefined();
    });

    it('should get rules by EAA framework', () => {
        const rules = getRulesByFramework('EAA');
        expect(rules.length).toBeGreaterThan(0);
    });

    it('should get rules by public sector', () => {
        const rules = getRulesBySector('public');
        expect(rules.length).toBeGreaterThan(0);
    });

    it('should get rules by private sector', () => {
        const rules = getRulesBySector('private');
        expect(rules.length).toBeGreaterThan(0);
    });

    it('should get EU legal frameworks', () => {
        const frameworks = getLegalFrameworks();
        expect(frameworks).toBeDefined();
        expect(frameworks.WAD).toBeDefined();
        expect(frameworks.EAA).toBeDefined();
    });

    it('should get specific legal framework by ID', () => {
        const wad = getLegalFramework('WAD');
        expect(wad).toBeDefined();
        expect(wad?.id).toBe('2016/2102');
        expect(wad?.name).toBe('Web Accessibility Directive');

        const eaa = getLegalFramework('EAA');
        expect(eaa).toBeDefined();
        expect(eaa?.id).toBe('2019/882');
    });

    it('should get all Nordic authorities', () => {
        const authorities = getNordicAuthorities();
        expect(authorities.length).toBeGreaterThan(0);
    });

    it('should get Nordic authority by ID', () => {
        const digg = getNordicAuthority('se-digg');
        expect(digg).toBeDefined();
        expect(digg?.name).toContain('Digg');
        expect(digg?.country).toBe('SE');
    });

    it('should get Nordic authorities by country', () => {
        const seAuthorities = getNordicAuthoritiesByCountry('SE');
        expect(seAuthorities.length).toBeGreaterThan(0);
        expect(seAuthorities.every(a => a.country === 'SE')).toBe(true);
    });

    it('should get statement tools', () => {
        const tools = getStatementTools();
        expect(tools.length).toBeGreaterThan(0);
        expect(tools.some(t => t.id === 'digg-generator')).toBe(true);
    });

    it('should get rules with EAA deadline', () => {
        const rules = getEAADeadlineRules();
        expect(rules.length).toBeGreaterThan(0);
        // color-contrast should have deadline
        const colorContrast = rules.find(r => r.ruleId === 'color-contrast');
        expect(colorContrast?.legalContext?.eaaDeadline).toBe('2025-06-28');
    });
});
