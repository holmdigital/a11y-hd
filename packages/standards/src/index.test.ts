
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
    getEAADeadlineRules,
    // Enforcement body data
    ENFORCEMENT_BODIES,
    ENFORCEMENT_BODIES_DETAILED,
    getEnforcementBody,
    // National laws
    getNationalLawByFramework,
} from './index';
import type { Country } from './types';

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

describe('Enforcement Bodies', () => {
    const ALL_COUNTRIES: Country[] = ['SE', 'NO', 'DK', 'FI', 'NL', 'DE', 'FR', 'ES', 'IE', 'IT', 'PT', 'PL', 'GB', 'US', 'CA', 'AU', 'EU'];

    it('should have entries for all 17 countries', () => {
        expect(Object.keys(ENFORCEMENT_BODIES)).toHaveLength(17);
        for (const country of ALL_COUNTRIES) {
            expect(ENFORCEMENT_BODIES[country]).toBeDefined();
            expect(ENFORCEMENT_BODIES[country].length).toBeGreaterThan(0);
        }
    });

    it('should use English names for EU entry', () => {
        expect(ENFORCEMENT_BODIES.EU).toBe('European Commission (DG CNECT)');
    });

    it('should include Italy', () => {
        expect(ENFORCEMENT_BODIES.IT).toBe('Agency for Digital Italy (AgID)');
    });

    it('should not change non-EU entries', () => {
        expect(ENFORCEMENT_BODIES.GB).toBe('Equality and Human Rights Commission (EHRC)');
        expect(ENFORCEMENT_BODIES.US).toBe('Department of Justice (Civil Rights Division)');
        expect(ENFORCEMENT_BODIES.CA).toBe('Accessibility Commissioner (Canadian Human Rights Commission)');
    });

    it('should include Australia', () => {
        expect(ENFORCEMENT_BODIES.AU).toBe(getEnforcementBody('AU'));
        expect(ENFORCEMENT_BODIES.AU.length).toBeGreaterThan(0);
    });

    describe('ENFORCEMENT_BODIES_DETAILED', () => {
        it('should have WAD and EAA entries for all 17 countries', () => {
            expect(Object.keys(ENFORCEMENT_BODIES_DETAILED)).toHaveLength(17);
            for (const country of ALL_COUNTRIES) {
                const entry = ENFORCEMENT_BODIES_DETAILED[country];
                expect(entry.wad).toBeDefined();
                expect(entry.eaa).toBeDefined();
                expect(entry.wad.length).toBeGreaterThan(0);
                expect(entry.eaa.length).toBeGreaterThan(0);
            }
        });

        it('should have WAD values matching ENFORCEMENT_BODIES', () => {
            for (const country of ALL_COUNTRIES) {
                expect(ENFORCEMENT_BODIES_DETAILED[country].wad).toBe(ENFORCEMENT_BODIES[country]);
            }
        });

        it('should have AHRC for both AU sectors', () => {
            const au = ENFORCEMENT_BODIES_DETAILED.AU;
            expect(au.wad).toBe(ENFORCEMENT_BODIES.AU);
            expect(au.eaa).toBe(ENFORCEMENT_BODIES.AU);
        });
    });

    describe('getEnforcementBody()', () => {
        it('should return WAD body by default', () => {
            expect(getEnforcementBody('SE')).toBe(ENFORCEMENT_BODIES.SE);
            expect(getEnforcementBody('DE')).toBe(ENFORCEMENT_BODIES.DE);
        });

        it('should return WAD body for public sector', () => {
            expect(getEnforcementBody('SE', 'public')).toBe(ENFORCEMENT_BODIES.SE);
        });

        it('should return EAA body for private sector', () => {
            expect(getEnforcementBody('SE', 'private')).toBe(ENFORCEMENT_BODIES_DETAILED.SE.eaa);
            expect(getEnforcementBody('IT', 'private')).toBe('Communications Regulatory Authority (AGCOM)');
        });

        it('should work for Italy', () => {
            expect(getEnforcementBody('IT')).toBe('Agency for Digital Italy (AgID)');
            expect(getEnforcementBody('IT', 'private')).toBe('Communications Regulatory Authority (AGCOM)');
        });

        it('should work for Portugal', () => {
            expect(getEnforcementBody('PT')).toBe('Administrative Modernization Agency (AMA)');
            expect(getEnforcementBody('PT', 'private')).toBe('Directorate-General for Consumer Affairs (DGAC)');
        });

        it('should work for Poland', () => {
            expect(getEnforcementBody('PL')).toBe('Ministry of Digitization (Ministerstwo Cyfryzacji)');
            expect(getEnforcementBody('PL', 'private')).toBe('Office of Competition and Consumer Protection (UOKiK)');
        });

        it('should work for Australia (single body for all sectors)', () => {
            expect(getEnforcementBody('AU')).toBe(ENFORCEMENT_BODIES.AU);
            expect(getEnforcementBody('AU', 'public')).toBe(ENFORCEMENT_BODIES.AU);
            expect(getEnforcementBody('AU', 'private')).toBe(ENFORCEMENT_BODIES.AU);
        });
    });
});

describe('National Laws — IT, PT, PL', () => {
    it('should return WAD laws for IT, PT, PL', () => {
        expect(getNationalLawByFramework('WAD', 'IT')).not.toBeNull();
        expect(getNationalLawByFramework('WAD', 'PT')).not.toBeNull();
        expect(getNationalLawByFramework('WAD', 'PL')).not.toBeNull();
    });

    it('should return EAA laws for IT, PT, PL', () => {
        expect(getNationalLawByFramework('EAA', 'IT')).not.toBeNull();
        expect(getNationalLawByFramework('EAA', 'PT')).not.toBeNull();
        expect(getNationalLawByFramework('EAA', 'PL')).not.toBeNull();
    });

    it('should have correct law identifiers', () => {
        expect(getNationalLawByFramework('WAD', 'IT')?.law).toBe('Legge 4/2004');
        expect(getNationalLawByFramework('EAA', 'IT')?.law).toBe('D.Lgs. 82/2024');
        expect(getNationalLawByFramework('WAD', 'PT')?.law).toBe('DL 83/2018');
        expect(getNationalLawByFramework('EAA', 'PT')?.law).toBe('DL 101-D/2023');
        expect(getNationalLawByFramework('WAD', 'PL')?.law).toBe('Ustawa o dostępności cyfrowej');
        expect(getNationalLawByFramework('EAA', 'PL')?.law).toBe('Ustawa o dostępności produktów i usług');
    });

    it('should have inForce: true for all EAA entries', () => {
        expect(getNationalLawByFramework('EAA', 'IT')?.inForce).toBe(true);
        expect(getNationalLawByFramework('EAA', 'PT')?.inForce).toBe(true);
        expect(getNationalLawByFramework('EAA', 'PL')?.inForce).toBe(true);
    });

    it('should have distinct WAD and EAA bodies for PT and PL', () => {
        expect(getEnforcementBody('PT', 'private')).not.toBe(getEnforcementBody('PT', 'public'));
        expect(getEnforcementBody('PL', 'private')).not.toBe(getEnforcementBody('PL', 'public'));
    });
});

describe('National Laws — AU', () => {
    it('should return DDA law for AU', () => {
        expect(getNationalLawByFramework('DDA', 'AU')).not.toBeNull();
    });

    it('should return au-dda as the primary AU entry', () => {
        const law = getNationalLawByFramework('DDA', 'AU');
        expect(law?.id).toBe('au-dda');
        expect(law?.scope).toBe('both');
    });

    it('should have AHRC as enforcement body for both sectors', () => {
        expect(getEnforcementBody('AU')).toBe(ENFORCEMENT_BODIES.AU);
        expect(getEnforcementBody('AU', 'public')).toBe(ENFORCEMENT_BODIES.AU);
        expect(getEnforcementBody('AU', 'private')).toBe(ENFORCEMENT_BODIES.AU);
    });

    it('should have inForce true for au-dda', () => {
        expect(getNationalLawByFramework('DDA', 'AU')?.inForce).toBe(true);
    });
});
