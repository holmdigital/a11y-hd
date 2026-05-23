
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
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
    getNationalLaws,
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
                // US has split enforcement: GSA for Section 508 (wad) and DOJ for ADA (eaa + default).
                // ENFORCEMENT_BODIES.US keeps DOJ as the primary accessibility body.
                if (country === 'US') continue;
                expect(ENFORCEMENT_BODIES_DETAILED[country].wad).toBe(ENFORCEMENT_BODIES[country]);
            }
        });

        it('should split GSA (Section 508) vs DOJ (ADA) for US', () => {
            expect(ENFORCEMENT_BODIES_DETAILED.US.wad).toBe('General Services Administration (GSA)');
            expect(ENFORCEMENT_BODIES_DETAILED.US.eaa).toBe('Department of Justice (Civil Rights Division)');
            expect(ENFORCEMENT_BODIES.US).toBe('Department of Justice (Civil Rights Division)');
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

describe('National Laws — US (ADA)', () => {
    it('should return 4 laws for US', () => {
        const usLaws = getNationalLaws('US');
        expect(usLaws).toHaveLength(4);
    });

    it('should return WAD law (Section 508) for US', () => {
        const s508 = getNationalLawByFramework('WAD', 'US');
        expect(s508).not.toBeNull();
        expect(s508?.law).toBe('Section 508');
        expect(s508?.enforcement.authority).toBe('us-gsa');
    });

    it('should return ADA Title II as first ADA match for US (public scope)', () => {
        const adaLaw = getNationalLawByFramework('ADA', 'US');
        expect(adaLaw).not.toBeNull();
        expect(adaLaw?.id).toBe('us-ada-title-ii');
        expect(adaLaw?.scope).toBe('public');
        expect(adaLaw?.enforcement.authority).toBe('us-doj');
    });

    it('should expose ADA Title III via scope-aware lookup', () => {
        const titleIII = getNationalLaws('US').find(l => l.euFramework === 'ADA' && l.scope === 'private');
        expect(titleIII).toBeDefined();
        expect(titleIII?.id).toBe('us-ada-title-iii');
        expect(titleIII?.law).toBe('ADA Title III');
    });

    it('should have compliance deadlines on Title II per 28 CFR § 35.200(b)', () => {
        const titleII = getNationalLaws('US').find(l => l.id === 'us-ada-title-ii');
        const large = titleII?.complianceDeadlines?.largeEntity;
        // Deadlines extended +1y by DOJ Interim Final Rule (published 2026-04-20)
        expect(large?.deadline).toBe('2027-04-26');
        // Narrow on the discriminant before reading populationThreshold
        expect(large && 'populationThreshold' in large ? large.populationThreshold : undefined).toBe(50000);
        expect(titleII?.complianceDeadlines?.smallEntity?.deadline).toBe('2028-04-26');
    });

    it('should have inForce match effectiveDate <= today for all US laws', () => {
        const today = new Date();
        for (const law of getNationalLaws('US')) {
            const isPastEffective = new Date(law.effectiveDate) <= today;
            expect(law.inForce).toBe(isPastEffective);
        }
    });

    it('should have inForce match effectiveDate <= today for ALL national laws', () => {
        // Drift guard: every national law's `inForce` must agree with its `effectiveDate`.
        // Catches the failure mode where an entry was added with a future effectiveDate
        // and inForce: false, but nobody flips inForce when the date passes.
        const today = new Date();
        const COUNTRIES: Country[] = ['SE','NO','DK','FI','NL','DE','FR','ES','IE','IT','PT','PL','GB','US','CA','AU'];
        const drift: string[] = [];
        for (const country of COUNTRIES) {
            for (const law of getNationalLaws(country)) {
                const isPastEffective = new Date(law.effectiveDate) <= today;
                if (law.inForce !== isPastEffective) {
                    drift.push(`${country}/${law.id}: inForce=${law.inForce} but effectiveDate=${law.effectiveDate} (today=${today.toISOString().slice(0,10)})`);
                }
            }
        }
        expect(drift).toEqual([]);
    });

    it('should resolve sector-specific enforcement for US', () => {
        // Default / public → Section 508 domain → GSA (federal agencies)
        expect(getEnforcementBody('US')).toBe('General Services Administration (GSA)');
        expect(getEnforcementBody('US', 'public')).toBe('General Services Administration (GSA)');
        // Private → ADA Title III → DOJ
        expect(getEnforcementBody('US', 'private')).toBe('Department of Justice (Civil Rights Division)');
    });

    it('should expose DOJ via ENFORCEMENT_BODIES.US as the primary accessibility authority', () => {
        // Constant kept as DOJ per Juno's ruling (DOJ is the recognized US accessibility authority).
        // For per-law enforcement consumers should use getNationalLaws('US')[*].enforcement.
        expect(ENFORCEMENT_BODIES.US).toBe('Department of Justice (Civil Rights Division)');
    });
});

describe('National Laws — US HHS Section 504', () => {
    it('should expose us-hhs-section-504 in US laws', () => {
        const law = getNationalLaws('US').find(l => l.id === 'us-hhs-section-504');
        expect(law).toBeDefined();
        expect(law?.euFramework).toBe('REHAB');
        expect(law?.scope).toBe('private');
        // effectiveDate reflects the WCAG benchmark in-force date for the large-entity tier
        // (HHS IFR 2026-09266 extended this from 2026-05-11 to 2027-05-11); inForce flips
        // to true on that date — drift-guard test validates the relationship.
        expect(law?.inForce).toBe(false);
        expect(law?.effectiveDate).toBe('2027-05-11');
    });

    it('should have tiered compliance deadlines for HHS Section 504', () => {
        const law = getNationalLaws('US').find(l => l.id === 'us-hhs-section-504');
        const large = law?.complianceDeadlines?.largeEntity;
        const small = law?.complianceDeadlines?.smallEntity;
        // Deadlines extended +1y by HHS IFR 2026-09266 (published 2026-05-11)
        expect(large?.deadline).toBe('2027-05-11');
        expect(small?.deadline).toBe('2028-05-10');
        // Narrow on the discriminant before reading employeeThreshold
        expect(large && 'employeeThreshold' in large ? large.employeeThreshold : undefined).toBe(15);
        expect(small && 'employeeThreshold' in small ? small.employeeThreshold : undefined).toBe(14);
    });

    it('should have HHS OCR as enforcement authority', () => {
        const law = getNationalLaws('US').find(l => l.id === 'us-hhs-section-504');
        expect(law?.enforcement.authority).toBe('us-hhs-ocr');
        expect(law?.enforcement.authorityName).toBe('HHS Office for Civil Rights (OCR)');
    });

    it('should resolve us-hhs-section-504 via getNationalLawByFramework(\'REHAB\', \'US\')', () => {
        const law = getNationalLawByFramework('REHAB', 'US');
        expect(law).not.toBeNull();
        expect(law?.id).toBe('us-hhs-section-504');
    });

    it('should not include HHS Section 504 when filtering ADA private-sector laws', () => {
        // Regression guard: us-ada-title-iii and us-hhs-section-504 both have scope='private',
        // but only Title III carries euFramework='ADA'. Make sure framework filtering keeps them apart.
        const adaPrivate = getNationalLaws('US').filter(l => l.euFramework === 'ADA' && l.scope === 'private');
        expect(adaPrivate).toHaveLength(1);
        expect(adaPrivate[0].id).toBe('us-ada-title-iii');
    });

    it('should resolve REHAB framework metadata via getLegalFramework', () => {
        const framework = getLegalFramework('REHAB');
        expect(framework).not.toBeNull();
        expect(framework?.name).toBe('Rehabilitation Act of 1973 (Section 504)');
        expect(framework?.wcagLevel).toBe('AA');
    });

    it('should return WCAG 2.1 A/AA convergence rules for REHAB framework', () => {
        // Section 504 (HHS) requires WCAG 2.1 Level A and AA — getRulesByFramework('REHAB')
        // should mirror ADA's coverage minus any AAA rules (none in current dataset).
        const rehabRules = getRulesByFramework('REHAB');
        expect(rehabRules.length).toBeGreaterThan(0);
        for (const rule of rehabRules) {
            expect(['A', 'AA']).toContain(rule.wcagLevel);
        }
    });

    it('should resolve DDA framework metadata via getLegalFramework', () => {
        // Companion guard for the same union/data symmetry as REHAB
        const framework = getLegalFramework('DDA');
        expect(framework).not.toBeNull();
        expect(framework?.wcagLevel).toBe('AA');
    });
});

describe('National Laws — EAA microbusiness exemption (Article 4(5))', () => {
    const EAA_PRIVATE_COUNTRIES: Country[] = ['SE','FI','DE','NL','IT','PT','PL'];

    it('should expose microbusiness exemption on every EAA private-sector law', () => {
        const missing: string[] = [];
        for (const country of EAA_PRIVATE_COUNTRIES) {
            const law = getNationalLaws(country).find(l => l.euFramework === 'EAA' && l.scope === 'private');
            if (!law?.exemptions?.microbusiness) {
                missing.push(`${country}/${law?.id ?? '<missing>'}`);
            }
        }
        expect(missing).toEqual([]);
    });

    it('should encode the EAA-mandated thresholds (10 employees / 2M EUR)', () => {
        for (const country of EAA_PRIVATE_COUNTRIES) {
            const law = getNationalLaws(country).find(l => l.euFramework === 'EAA' && l.scope === 'private');
            const ex = law?.exemptions?.microbusiness;
            expect(ex?.employeeThreshold).toBe(10);
            expect(ex?.revenueThreshold).toBe(2_000_000);
            expect(ex?.revenueCurrency).toBe('EUR');
            expect(ex?.appliesTo).toBe('services');
        }
    });
});

describe('National Laws — schema validation', () => {
    it('should validate national-laws.json against national-laws-schema.json', () => {
        const dataPath = join(__dirname, '..', 'data', 'legal', 'national-laws.json');
        const schemaPath = join(__dirname, '..', 'schema', 'national-laws-schema.json');
        const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
        const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

        const ajv = new Ajv({ allErrors: true, strict: false });
        const validate = ajv.compile(schema);
        const valid = validate(data);

        if (!valid) {
            // Surface every violation so authors see all issues at once
            const summary = (validate.errors ?? []).map(e => `${e.instancePath || '<root>'} ${e.message}`).join('\n');
            throw new Error(`national-laws.json failed schema validation:\n${summary}`);
        }
        expect(valid).toBe(true);
    });
});
