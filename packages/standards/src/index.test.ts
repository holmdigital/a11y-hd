
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
    getNationalLawForSector,
    deriveEnforcementLaw,
    getNationalLaws,
    getMaxSanction,
    findNationalLaw,
    getNationalLaw,
    getAllNationalLaws,
    generateRegulatoryReport,
} from './index';
import type { Country, ConvergenceRule } from './types';
import rulesSv from '../data/rules.sv.json';
import rulesEn from '../data/rules.en.json';
import rulesDe from '../data/rules.de.json';
import rulesFr from '../data/rules.fr.json';
import rulesEs from '../data/rules.es.json';
import rulesNl from '../data/rules.nl.json';
import rulesNo from '../data/rules.no.json';
import rulesFi from '../data/rules.fi.json';
import rulesDa from '../data/rules.da.json';
import rulesEnGb from '../data/rules.en-gb.json';
import rulesEnUs from '../data/rules.en-us.json';
import rulesEnCa from '../data/rules.en-ca.json';

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
        // Intern #63: GB var en av de fyra motsägelserna. Konstanten sa EHRC,
        // gb-psbar säger CDDO. Konstanten härleds nu ur lagposten, så CDDO är
        // rätt svar för offentlig sektor. EHRC står kvar för privat sektor via
        // gb-eqa2010, se ENFORCEMENT_BODIES_DETAILED.GB.eaa.
        expect(ENFORCEMENT_BODIES.GB).toBe('Central Digital and Data Office (CDDO)');
        expect(ENFORCEMENT_BODIES.US).toContain('Department of Justice');
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
                if (country === 'NO') {
                    // Intern #23 Fynd B, bevarad genom ENFORCEMENT_SUPPRESSED.
                    // Härledningen skulle ge UU-tilsynet, eftersom no-ikt har
                    // scope 'both' och UU-tilsynet är dess tillsyn. Fältet hålls
                    // ändå tomt, och skälet är inte att tillsynen är overifierad
                    // utan att en tillsynssektion i ett PRIVAT utlåtande antyder
                    // en rapporteringsplikt en privat aktör inte har. Tomt fält
                    // är vad som får motorn att utelämna hela sektionen.
                    expect(entry.eaa).toBe('');
                } else {
                    expect(entry.eaa.length).toBeGreaterThan(0);
                }
            }
        });

        it('should have WAD values matching ENFORCEMENT_BODIES', () => {
            for (const country of ALL_COUNTRIES) {
                // US has split enforcement: GSA for Section 508 (wad) and DOJ for ADA (eaa + default).
                // ENFORCEMENT_BODIES.US keeps DOJ as the primary accessibility body.
                if (country === 'US') continue;
                expect(ENFORCEMENT_BODIES_DETAILED[country].wad).toBe(ENFORCEMENT_BODIES[country]);
            }
            // Intern #63: den flata konstanten HÄRLEDS nu ur den detaljerade, så de
            // två kan inte längre drifta isär. Att de gjorde det var halva fyndet.
        });

        it('should split GSA (Section 508) vs DOJ (ADA) for US', () => {
            // Intern #63: uppdelningen är oförändrad i sak, men namnen kommer nu ur
            // lagposternas egna enforcement-fält i stället för ur en handskriven
            // tabell, så de lyder exakt som datan.
            expect(ENFORCEMENT_BODIES_DETAILED.US.wad).toBe('General Services Administration (GSA)');
            expect(ENFORCEMENT_BODIES_DETAILED.US.eaa).toContain('Department of Justice');
            expect(ENFORCEMENT_BODIES.US).toContain('Department of Justice');
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
            // IT: AgID supervises digital services per art. 21 D.Lgs. 82/2022.
            // AGCOM only covers audiovisual media services under D.Lgs. 208/2021 art. 31.
            expect(getEnforcementBody('IT', 'private')).toBe('Agency for Digital Italy (AgID)');
        });

        it('should work for Italy', () => {
            expect(getEnforcementBody('IT')).toBe('Agency for Digital Italy (AgID)');
            // Regression guard: must NOT return AGCOM for general digital services.
            // AGCOM only covers audiovisual media services (D.Lgs. 208/2021 art. 31).
            expect(getEnforcementBody('IT', 'private')).toBe('Agency for Digital Italy (AgID)');
            expect(getEnforcementBody('IT', 'private')).not.toBe('Communications Regulatory Authority (AGCOM)');
        });

        it('should work for Portugal', () => {
            expect(getEnforcementBody('PT')).toBe('Administrative Modernization Agency (AMA)');
            // Intern #63/#66: DGAC var ett påhittat huvudorgan. Decreto-Lei n.º
            // 82/2022 artigo 28.º n.º 1 delar tillsynen på nio sektorsorgan, och INR
            // ansvarar för acompanhamento och monitorização, inte fiscalização.
            // Junos ord: fältet står tomt eller bär en fallback-fras, aldrig ett
            // påhittat huvudorgan. Samma mönster som Spanien.
            expect(getEnforcementBody('PT', 'private')).toContain('art. 28.º');
            expect(getEnforcementBody('PT', 'private')).not.toContain('DGAC');
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
        expect(getNationalLawByFramework('EAA', 'IT')?.law).toBe('D.Lgs. 82/2022');
        expect(getNationalLawByFramework('WAD', 'PT')?.law).toBe('DL 83/2018');
        // Intern #63/#66 F1: DL 101-D/2023 är ett diploma DRE:s ELI-resolver inte
        // lämnar ut på något av 168 prövade datum under 2023, och som det är EJ
        // BELAGT att det existerar. Rätt akt är 82/2022, belagt i artigo 1.º.
        expect(getNationalLawByFramework('EAA', 'PT')?.law).toBe('Decreto-Lei n.º 82/2022');
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

describe('National Laws — CA (federal ACA)', () => {
    it('should expose ca-aca as a CA law alongside ca-aoda', () => {
        const caLaws = getNationalLaws('CA');
        const acaLaw = caLaws.find(l => l.id === 'ca-aca');
        const aodaLaw = caLaws.find(l => l.id === 'ca-aoda');
        expect(acaLaw).toBeDefined();
        expect(aodaLaw).toBeDefined();
        expect(acaLaw?.euFramework).toBe('ACA');
        expect(acaLaw?.scope).toBe('both');
        expect(acaLaw?.inForce).toBe(true);
        expect(acaLaw?.effectiveDate).toBe('2025-12-05');
    });

    it('should have tiered compliance deadlines for ACA ICT amendments', () => {
        const acaLaw = getNationalLawByFramework('ACA', 'CA');
        // ICT amendments in force 2025-12-05; federal public sector 2027-12-05, federally-regulated private 2028-12-05.
        expect(acaLaw?.complianceDeadlines?.largeEntity?.deadline).toBe('2027-12-05');
        expect(acaLaw?.complianceDeadlines?.smallEntity?.deadline).toBe('2028-12-05');
    });

    it('should resolve ACA framework via getNationalLawByFramework', () => {
        const law = getNationalLawByFramework('ACA', 'CA');
        expect(law).not.toBeNull();
        expect(law?.id).toBe('ca-aca');
    });
});

describe('National Laws — FR (RGAA authority)', () => {
    // Regression guard: DINUM is the current supervisory authority for RGAA 4.1.2.
    // RGAA 5 (expected late 2026) will transfer this role to Arcom. Until OJEU
    // citation / RGAA 5 publication, DO NOT pre-emptively switch authority to Arcom.
    it('should list DINUM (not Arcom) as fr-rgaa authority', () => {
        const law = getNationalLawByFramework('WAD', 'FR');
        expect(law?.enforcement?.authorityName).toContain('DINUM');
        expect(law?.enforcement?.authorityName).not.toContain('Arcom');
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
        expect(s508?.enforcement?.authority).toBe('us-gsa');
    });

    it('should return ADA Title II as first ADA match for US (public scope)', () => {
        const adaLaw = getNationalLawByFramework('ADA', 'US');
        expect(adaLaw).not.toBeNull();
        expect(adaLaw?.id).toBe('us-ada-title-ii');
        expect(adaLaw?.scope).toBe('public');
        expect(adaLaw?.enforcement?.authority).toBe('us-doj');
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
        // Private → ADA Title III → DOJ (lydelsen kommer ur us-ada-title-iii)
        expect(getEnforcementBody('US', 'private')).toContain('Department of Justice');
    });

    it('should expose DOJ via ENFORCEMENT_BODIES.US as the primary accessibility authority', () => {
        // Constant kept as DOJ per legal review (DOJ is the recognized US accessibility authority).
        // For per-law enforcement consumers should use getNationalLaws('US')[*].enforcement.
        expect(ENFORCEMENT_BODIES.US).toContain('Department of Justice');
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
        expect(law?.enforcement?.authority).toBe('us-hhs-ocr');
        expect(law?.enforcement?.authorityName).toBe('HHS Office for Civil Rights (OCR)');
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

        const ajv = new Ajv({ allErrors: true });
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

/**
 * Datasvepet 2026-09-24: Intern #83 (Sverige), #63 (ikraftträdanden belagda
 * 2026-09-14 men aldrig byggda), #70 (de-bfsg) och #88 (fr-rgaa).
 *
 * Värdena kommer ur Junos register med citat. Testerna intygar att datan bär
 * dem, inte att de är rätt i sak; det senare är hennes.
 */
describe('Intern #83/#63/#70/#88 — datasvepet 2026-09-24', () => {
    const lag = (id: string) => {
        const hit = findNationalLaw(id);
        if (!hit) throw new Error(`saknas: ${id}`);
        return hit;
    };

    it('ikraftträdandet är lagens eget, inte direktivets frist eller lagens datum', () => {
        expect(lag('dos-lagen').effectiveDate).toBe('2019-01-01');
        expect(lag('de-bitv').effectiveDate).toBe('2011-09-22');
        expect(lag('es-une').effectiveDate).toBe('2018-09-20');
        expect(lag('it-wad').effectiveDate).toBe('2004-02-01');
        expect(lag('pl-wad').effectiveDate).toBe('2019-05-23');
        expect(lag('pt-wad').effectiveDate).toBe('2019-01-01');
    });

    it('dos-lagen bär sina fyra undantag, alla med lagrum, och inget mikroföretagsundantag', () => {
        const ex = lag('dos-lagen').exemptions;
        // Lagen binder offentliga aktörer; ett mikroföretagsundantag vore påhittat.
        expect(ex?.microbusiness).toBeUndefined();
        expect(ex?.statutory?.map(e => e.kind)).toEqual(['actor', 'content', 'disproportionate-burden', 'transitional']);
        for (const e of ex?.statutory ?? []) {
            expect(e.legalBasis).toContain('2018:1937');
        }
        // 8 § är ändrad genom Lag (2025:992); datan speglade inte det.
        expect(ex?.statutory?.[0].legalBasis).toContain('2025:992');
    });

    it('lptt pekar ut Konsumentverket för transportsajter, inte PTS', () => {
        const lptt = lag('lptt');
        const konsumentverket = lptt.sectorAuthorities?.find(s => s.authority === 'Konsumentverket');
        expect(konsumentverket?.responsibility).toContain('3 a-c');
        expect(konsumentverket?.responsibility).toContain('31 §');
        // PTS egna tjänsteområden saknades helt i listan.
        expect(lptt.sectorAuthorities?.some(s => s.authority.startsWith('PTS'))).toBe(true);
        expect(lptt.enforcement?.responsibility).toContain('Konsumentverket');
    });

    it('lptt:s mikroföretagsundantag vilar på svensk lag och skiljer tjänster från produkter', () => {
        const mb = lag('lptt').exemptions?.microbusiness;
        expect(mb?.legalBasis).toBe('Lag (2023:254) 2 §, 10 §');
        expect(mb?.appliesTo).toBe('services');
        expect(mb?.description).toContain('not a full exemption');
    });

    it('lptt:s frist till 2030 kan inte läsas som ett allmänt anstånd', () => {
        const note = lag('lptt').note ?? '';
        expect(note).toContain('27 June 2030');
        expect(note).toContain('never be read as a general deferral');
    });

    it('de-bfsg: 100 000 EUR, inte de påhittade 500 000', () => {
        const s = lag('de-bfsg').sanctions;
        expect(s?.maxAmount).toBe(100000);
        expect(s?.minAmount).toBe(0);
        expect(s?.description).toContain('10,000');
        expect(getMaxSanction('DE')?.amount).toBe(100000);
    });

    it('ca-aoda: spannet 200–100 000 är borta, och taken per dag står i note', () => {
        // Intern #93: taken gäller PER DAG och per ansvarig. Ett platt
        // maxAmount skulle underskatta en exponering som växer för varje dag.
        const aoda = lag('ca-aoda');
        expect(aoda.sanctions).toBeUndefined();
        expect(aoda.note).toContain('$50,000 for each day');
        expect(aoda.note).toContain('$100,000 for each day');
        // Kanadas tak kommer då från den federala lagen, oförändrat.
        expect(getMaxSanction('CA')?.amount).toBe(250000);
    });

    it('ca-aca: lagrummet är § 91(2), inte Part 6 i allmänhet', () => {
        const s = lag('ca-aca').sanctions;
        expect(s?.maxAmount).toBe(250000);
        expect(s?.description).toContain('section 91(2)');
        expect(s?.description).not.toContain('Part 6');
    });

    it('fr-rgaa: två tak ur art. 47-1, det högre i maxAmount och det lägre i texten', () => {
        const s = lag('fr-rgaa').sanctions;
        expect(s?.maxAmount).toBe(50000);
        // 25 000 är ett eget tak för en annan överträdelse, aldrig ett golv.
        expect(s?.minAmount).toBe(0);
        expect(s?.description).toContain('25,000');
        expect(lag('fr-rgaa').note).toContain('2023-09-08');
    });
});

describe('plainLanguage encoding guard (D-10.1)', () => {
    const MOJIBAKE = /Ã/;
    const PLAIN_IDS = [
        'alt-text', 'color-contrast', 'form-labels', 'link-purpose',
        'name-role-value', 'keyboard-accessible', 'heading-order', 'language-of-page',
        'landmark-one-main', 'region', 'target-size'
    ] as const;

    it('sv: no mojibake in any plainLanguage text field', () => {
        for (const id of PLAIN_IDS) {
            const rule = (rulesSv as ConvergenceRule[]).find(r => r.ruleId === id);
            const pl = rule?.plainLanguage;
            if (!pl) continue;
            for (const [field, val] of Object.entries(pl)) {
                if (typeof val === 'string') {
                    expect(MOJIBAKE.test(val), `${id}.${field} has mojibake`).toBe(false);
                }
            }
        }
    });
});

describe('plainLanguage tone lint (D-10.2)', () => {
    const DASH = /[—–]/;
    const PERCENT = /%/;

    for (const [lang, rules] of [['sv', rulesSv], ['en', rulesEn]] as const) {
        it(`${lang}: no em/en dashes or percent signs in any plainLanguage field`, () => {
            for (const rule of rules as ConvergenceRule[]) {
                if (!rule.plainLanguage) continue;
                for (const [field, val] of Object.entries(rule.plainLanguage)) {
                    if (typeof val !== 'string') continue;
                    expect(DASH.test(val), `${rule.ruleId}.${field} (${lang}) has dash`).toBe(false);
                    expect(PERCENT.test(val), `${rule.ruleId}.${field} (${lang}) has percent`).toBe(false);
                }
            }
        });
    }
});

describe('plainLanguage sv/en parity (D-10.3)', () => {
    const PLAIN_IDS = [
        'alt-text', 'color-contrast', 'form-labels', 'link-purpose',
        'name-role-value', 'keyboard-accessible', 'heading-order', 'language-of-page',
        'landmark-one-main', 'region', 'target-size'
    ] as const;

    it('same 10 ruleIds have plainLanguage in both sv and en', () => {
        for (const id of PLAIN_IDS) {
            const sv = (rulesSv as ConvergenceRule[]).find(r => r.ruleId === id);
            const en = (rulesEn as ConvergenceRule[]).find(r => r.ruleId === id);
            expect(sv?.plainLanguage, `sv missing plainLanguage for ${id}`).toBeDefined();
            expect(en?.plainLanguage, `en missing plainLanguage for ${id}`).toBeDefined();
            expect(sv?.plainLanguage?.impactLevel, `impactLevel mismatch for ${id}`)
                .toBe(en?.plainLanguage?.impactLevel);
        }
    });
});

describe('generateRegulatoryReport plainLanguage enrichment (PLAIN-02)', () => {
    it('returns plainLanguage for sv when texts exist', () => {
        const report = generateRegulatoryReport('form-labels', 'sv');
        expect(report?.plainLanguage).toBeDefined();
        expect(report?.plainLanguage?.impactLevel).toBe('stoppar-kop');
    });

    it('returns EN plainLanguage as fallback for unsupported lang (D-03)', () => {
        const report = generateRegulatoryReport('form-labels', 'de');
        expect(report?.plainLanguage).toBeDefined();
        // de has no plainLanguage -> falls back to EN
        expect(report?.plainLanguage?.impactLevel).toBe('stoppar-kop');
    });

    it('returns EN plainLanguage for every rule now the en floor is complete (focus-order)', () => {
        // The en plainLanguage floor is fully filled (48/48). focus-order previously
        // had no plainLanguage in any language; this now guards the floor from regressing.
        const report = generateRegulatoryReport('focus-order', 'en');
        expect(report?.plainLanguage).toBeDefined();
        expect(report?.plainLanguage?.impactLevel).toBe('forsamrar');
    });
});

describe('WCAG 2.2 Phase 1 locale parity (target-size, dragging-movements, focus-not-obscured)', () => {
    // All 12 locale rule files
    const LOCALE_FILES: Array<[string, ConvergenceRule[]]> = [
        ['sv', rulesSv as ConvergenceRule[]],
        ['en', rulesEn as ConvergenceRule[]],
        ['de', rulesDe as ConvergenceRule[]],
        ['fr', rulesFr as ConvergenceRule[]],
        ['es', rulesEs as ConvergenceRule[]],
        ['nl', rulesNl as ConvergenceRule[]],
        ['no', rulesNo as ConvergenceRule[]],
        ['fi', rulesFi as ConvergenceRule[]],
        ['da', rulesDa as ConvergenceRule[]],
        ['en-gb', rulesEnGb as ConvergenceRule[]],
        ['en-us', rulesEnUs as ConvergenceRule[]],
        ['en-ca', rulesEnCa as ConvergenceRule[]],
    ];

    const WCAG22_PHASE1_IDS = ['target-size', 'dragging-movements', 'focus-not-obscured'] as const;

    for (const [lang, rules] of LOCALE_FILES) {
        for (const id of WCAG22_PHASE1_IDS) {
            it(`${lang}: contains WCAG 2.2 Phase 1 rule '${id}'`, () => {
                const rule = rules.find(r => r.ruleId === id);
                expect(rule, `${lang} missing rule ${id}`).toBeDefined();
                expect(rule?.wcagVersion, `${id} in ${lang} must be wcagVersion 2.2`).toBe('2.2');
                expect(rule?.dosLagenApplies, `${id} in ${lang} must be dosLagenApplies false`).toBe(false);
            });
        }
    }
});

/**
 * Intern #63 — EAA-transponeringar för Frankrike, Danmark och Spanien.
 *
 * Juno granskade mot primärkälla 2026-09-10. Det som inte gick att belägga fick
 * inte byggas, och de här testerna finns för att det ska förbli obyggt: en halv
 * post med ärliga luckor är rätt utfall, en hel post med påhittade värden är det
 * inte. Testerna failar alltså både om posterna försvinner OCH om någon "fyller
 * i" dem för att de ska se kompletta ut.
 */
describe('Intern #63 — EAA-transponeringar FR, DK, ES', () => {
    it('alla tre länderna har en EAA-post för privat sektor', () => {
        for (const [country, id] of [['FR', 'fr-eaa'], ['DK', 'dk-eaa'], ['ES', 'es-eaa']] as const) {
            const law = getNationalLaws(country).find(l => l.id === id);
            expect(law, `${id} saknas`).toBeDefined();
            expect(law?.euFramework).toBe('EAA');
            expect(law?.scope).toBe('private');
            expect(law?.inForce).toBe(true);
            expect(law?.effectiveDate).toBe('2025-06-28');
        }
    });

    it('privat sektor i FR, DK och ES får ett namngivet lagrum, inte en omskrivning', () => {
        // Karins fynd i #63: en privat kund i något av de tre fick tidigare ingen
        // lag namngiven alls. Det är hela poängen med posterna.
        expect(getNationalLawForSector('FR', 'private')?.id).toBe('fr-eaa');
        expect(getNationalLawForSector('DK', 'private')?.id).toBe('dk-eaa');
        expect(getNationalLawForSector('ES', 'private')?.id).toBe('es-eaa');
    });

    it('offentlig sektor i FR, DK och ES rörs inte av tillskottet', () => {
        expect(getNationalLawForSector('FR', 'public')?.id).toBe('fr-rgaa');
        expect(getNationalLawForSector('DK', 'public')?.id).toBe('dk-wad');
        expect(getNationalLawForSector('ES', 'public')?.id).toBe('es-une');
    });

    it('fr-eaa har DGCCRF som myndighet men INGET sanktionsspann', () => {
        const law = getNationalLaws('FR').find(l => l.id === 'fr-eaa');
        expect(law?.enforcement?.authority).toBe('fr-dgccrf');
        expect(law?.enforcement?.authorityName).toContain('DGCCRF');
        // Sanktionsarten är belagd (contravention de 5e klass, art. R. 451-4),
        // beloppet är det inte. En siffra här vore uppfunnen.
        expect(law?.sanctions, 'fr-eaa får inget sanktionsspann förrän beloppet är belagt').toBeUndefined();
    });

    it('dk-eaa har belagd tillsyn men fortfarande inga sanktioner', () => {
        const law = getNationalLaws('DK').find(l => l.id === 'dk-eaa');
        // Tillsynen är belagd sedan 2026-09-11: Sikkerhedsstyrelsens eget
        // pressmeddelande via Ritzau. Nyansen "hovedparten af områderne" står i
        // responsibility — myndigheten täcker de flesta men inte alla områden,
        // och vilka undantagen är förblir obelagt.
        expect(law?.enforcement?.authorityName).toBe('Sikkerhedsstyrelsen');
        expect(law?.enforcement?.responsibility).toContain('hovedparten');
        // Sanktionsart och belopp är fortfarande obelagda. Strafparagrafens rubrik
        // syns i en betalväggsdatabas, innehållet gör det inte. Ingen siffra här.
        expect(law?.sanctions, 'dk-eaa får inget sanktionsspann förrän straffbestämmelsen är öppnad').toBeUndefined();
    });

    it('es-eaa har varken tillsyn eller sanktioner — så ser lagen ut', () => {
        const law = getNationalLaws('ES').find(l => l.id === 'es-eaa');
        // Ley 11/2023 art. 27.3: tillsynen ligger hos de autonoma regionerna samt
        // Ceuta och Melilla. Art. 30: inget eget sanktionsspann, lagen hänvisar
        // till sektorslagstiftning och därefter till avdelning III i RDL 1/2013.
        // Det här är inte en lucka att fylla senare, det är vad lagen säger.
        expect(law?.enforcement, 'Spanien har ingen nationell tillsynsmyndighet för detta').toBeUndefined();
        expect(law?.sanctions, 'Ley 11/2023 anger inget eget sanktionsspann').toBeUndefined();
    });

    it('FR:s EAA-myndighet är DGCCRF, inte Arcom', () => {
        // Arcoms mandat enligt code de la consommation art. L. 511-25-1 omfattar
        // bara tillgång till audiovisuella medietjänster samt e-böcker och
        // läsprogramvara. Som generellt påstående om fransk EAA-tillsyn var Arcom fel.
        expect(ENFORCEMENT_BODIES_DETAILED.FR.eaa).toContain('DGCCRF');
        expect(ENFORCEMENT_BODIES_DETAILED.FR.eaa).not.toContain('Arcom');
        expect(getEnforcementBody('FR', 'private')).toContain('DGCCRF');
        // WAD-sidan är oförändrad: DINUM är rätt för RGAA och offentlig sektor.
        expect(ENFORCEMENT_BODIES_DETAILED.FR.wad).toContain('DINUM');
    });

    it('ES:s EAA-tillsyn beskrivs som regional, inte som ett ministerium', () => {
        // Ministerio de Consumo är inte tillsynsmyndighet enligt lagen.
        expect(ENFORCEMENT_BODIES_DETAILED.ES.eaa).not.toContain('Consumo');
        expect(ENFORCEMENT_BODIES_DETAILED.ES.eaa).not.toContain('Ministry of Consumer');
        expect(ENFORCEMENT_BODIES_DETAILED.ES.eaa).toContain('27.3');
    });

    it('getMaxSanction hoppar över lagar utan spann i stället för att läsa dem som noll', () => {
        // Alla tre länderna har nu minst en lag utan sanctions. Att läsa den som
        // ett nolltak skulle underskatta landets maxexponering — den enda
        // riktning den här funktionen inte får ha fel åt.
        // Intern #88: fr-rgaa bar 300 000 EUR, ett tak som inte finns i lagen.
        // Art. 47-1 ger 50 000 och 25 000; maxAmount bär det högre.
        const fr = getMaxSanction('FR');
        expect(fr?.amount).toBe(50000);
        const es = getMaxSanction('ES');
        expect(es?.amount).toBe(1000000);
        for (const country of ['FR', 'DK', 'ES'] as const) {
            expect(() => getMaxSanction(country), country).not.toThrow();
        }
    });
});

/**
 * Intern #63 — ENFORCEMENT_BODIES_DETAILED härleds ur national-laws.json.
 *
 * Den handskrivna tabellen sa emot datan för fyra länder samtidigt: samma paket
 * gav två olika svar på vem som utövar tillsyn, och bara ett av dem var det som
 * faktiskt renderades i ett utlåtande. Testerna nedan gör att motsägelsen inte
 * kan återuppstå, och att ett undantag aldrig kan skugga ett värde datan redan
 * kan leverera.
 */
describe('Intern #63 — ENFORCEMENT_BODIES_DETAILED är härledd', () => {
    const ALL_COUNTRIES: Country[] = ['SE', 'NO', 'DK', 'FI', 'NL', 'DE', 'FR', 'ES', 'IE', 'IT', 'PT', 'PL', 'GB', 'US', 'CA', 'AU', 'EU'];
    const SECTORS: Array<['public' | 'private', 'wad' | 'eaa']> = [['public', 'wad'], ['private', 'eaa']];

    it('varje land och sektor matchar den lag datan faktiskt namnger', () => {
        const drift: string[] = [];
        for (const country of ALL_COUNTRIES) {
            for (const [sector, key] of SECTORS) {
                const law = deriveEnforcementLaw(country, sector);
                const fromData = law?.enforcement?.authorityName;
                if (!fromData) continue;
                if (ENFORCEMENT_BODIES_DETAILED[country][key] === '') continue; // undertryckt, se ENFORCEMENT_SUPPRESSED // ingen lag, eller lag utan myndighet: fallback täcks nedan
                if (ENFORCEMENT_BODIES_DETAILED[country][key] !== fromData) {
                    drift.push(`${country}/${sector}: konstanten säger "${ENFORCEMENT_BODIES_DETAILED[country][key]}", datan säger "${fromData}"`);
                }
            }
        }
        expect(drift, `Konstant och data säger emot varandra:\n${drift.join('\n')}`).toEqual([]);
    });

    it('de fyra motsägelserna i #63 är borta', () => {
        // ca-aoda, de-bfsg, gb-psbar och nl-wad sa emot den handskrivna tabellen.
        // ca-aoda är dessutom subnationell och får aldrig svara för landet.
        expect(ENFORCEMENT_BODIES_DETAILED.GB.wad).toContain('Central Digital and Data Office');
        expect(ENFORCEMENT_BODIES_DETAILED.NL.wad).toContain('Binnenlandse Zaken');
        expect(ENFORCEMENT_BODIES_DETAILED.DE.eaa).toContain('Marktüberwachungsbehörden der Länder');
        expect(ENFORCEMENT_BODIES_DETAILED.CA.wad).not.toContain('Ontario');
        expect(ENFORCEMENT_BODIES_DETAILED.CA.eaa).not.toContain('Ontario');
    });

    it('myndighetsnamnet är landets eget, inte en engelsk översättning', () => {
        // Fynd 3 i #65: ett svenskt dokument sa "Swedish Post and Telecom
        // Authority (PTS)" medan lagposten bar "PTS (Post- och telestyrelsen)".
        expect(ENFORCEMENT_BODIES_DETAILED.SE.wad).toBe('Digg (Myndigheten för digital förvaltning)');
        expect(ENFORCEMENT_BODIES_DETAILED.SE.eaa).toBe('PTS (Post- och telestyrelsen)');
    });

    it('AU och US följer motorns egen routing, inte sektorsväljaren rakt av', () => {
        // getNationalLawForSector('AU','public') ger au-dta på exakt scope-träff.
        // Juno har avgjort att au-dda är Australiens enda bindande instrument i
        // båda sektorerna, så härledningen måste spegla motorns AU-gren.
        expect(deriveEnforcementLaw('AU', 'public')?.id).toBe('au-dda');
        expect(deriveEnforcementLaw('AU', 'private')?.id).toBe('au-dda');
        expect(deriveEnforcementLaw('US', 'public')?.id).toBe('us-508');
        expect(deriveEnforcementLaw('US', 'private')?.id).toBe('us-ada-title-iii');
    });

    it('ett undantag får aldrig skugga ett värde datan kan leverera', () => {
        // ENFORCEMENT_NO_SINGLE_AUTHORITY finns för äkta rättsliga frånvaron, inte
        // för att överrösta datan. Blir en post där belagd ska undantaget bort.
        for (const country of ALL_COUNTRIES) {
            for (const sector of ['public', 'private'] as const) {
                const key = sector === 'private' ? 'eaa' : 'wad';
                const law = deriveEnforcementLaw(country, sector);
                // En undertryckning (ENFORCEMENT_SUPPRESSED) säger 'namnge ingen' och
                // får därför skugga datan. Ett undantag säger 'namnge det här i
                // stället' och får det inte. Bara det senare regleras här.
                if (ENFORCEMENT_BODIES_DETAILED[country][key] === '') continue;
                if (law?.enforcement?.authorityName) {
                    expect(
                        ENFORCEMENT_BODIES_DETAILED[country][key],
                        `${country}/${sector} har en belagd authorityName i datan — konstanten måste använda den`
                    ).toBe(law.enforcement.authorityName);
                }
            }
        }
    });

    it('au-dta har en egen ramverkskod, så DDA-uppslaget är entydigt', () => {
        // Juno 2026-09-11: att tagga Digital Access Standard som DDA var sakligt
        // fel OCH en latent bugg — getNationalLawByFramework returnerar första
        // träffen, så en omsortering av JSON-arrayen hade tyst kunnat göra
        // styrdokumentet till Australiens lag.
        const dta = getNationalLaws('AU').find(l => l.id === 'au-dta');
        expect(dta?.euFramework).toBe('DAS');
        expect(getNationalLawByFramework('DDA', 'AU')?.id).toBe('au-dda');
    });
});

/**
 * Intern #63 avsnitt C — inga tankstreck i lagnamn som går ut till kund.
 *
 * Mejas spärr, med Junos motivering ordagrant:
 *
 *   U+2013 och U+2014 förekommer i dag bara som vår egen redaktionella skarv
 *   mellan beteckning och titel, aldrig i en officiell titel. Bindestrecket
 *   U+002D i `Decreto-Lei`, `101-D`, `Real Decreto-ley` och `EAA-implementering`
 *   är däremot del av namnen och berörs inte av spärren.
 *
 * Fälten renderas via `${law.fullName} (${law.law})` i motorns
 * statement-generator, alltså direkt in i ett dokument kunden lämnar ifrån sig
 * som sitt eget.
 *
 * KÄND GRÄNS, medvetet inte lagad: spärren fångar inte U+002D. `de-bfsg.fullName`
 * bar platshållaren "- EAA-implementering" med bindestreck och gick därför förbi
 * det här testet (Intern #66 fynd 2). Att bredda spärren till U+002D är fel
 * medicin — då faller `Decreto-Lei` och `101-D`, som är riktiga namn. Den luckan
 * stängs av granskningsregistret, inte av ett slarvigare test.
 */
describe('Intern #63 — inga tankstreck i lagnamn', () => {
    const EM_DASH = String.fromCharCode(0x2014);
    const EN_DASH = String.fromCharCode(0x2013);
    const ALL_COUNTRIES: Country[] = ['SE', 'NO', 'DK', 'FI', 'NL', 'DE', 'FR', 'ES', 'IE', 'IT', 'PT', 'PL', 'GB', 'US', 'CA', 'AU'];

    it('inget law- eller fullName-fält bär U+2013 eller U+2014', () => {
        const offenders: string[] = [];
        for (const country of ALL_COUNTRIES) {
            for (const law of getNationalLaws(country)) {
                for (const field of ['law', 'fullName'] as const) {
                    const value = law[field];
                    if (typeof value !== 'string') continue;
                    if (value.includes(EM_DASH)) offenders.push(`${law.id}.${field} bär U+2014`);
                    if (value.includes(EN_DASH)) offenders.push(`${law.id}.${field} bär U+2013`);
                }
            }
        }
        expect(
            offenders,
            `Tankstreck i lagnamn som går ut till kund:\n${offenders.join('\n')}`
        ).toEqual([]);
    });

    it('bindestreck i riktiga lagnamn rörs inte av spärren', () => {
        // Regressionsvakt mot att någon breddar testet till U+002D. Dessa fyra är
        // riktiga namn och MÅSTE fortsätta bära sitt bindestreck.
        expect(getNationalLaws('PT').find(l => l.id === 'pt-wad')?.fullName).toContain('Decreto-Lei');
        expect(getNationalLaws('PT').find(l => l.id === 'pt-eaa')?.law).toContain('Decreto-Lei');
        // HÄR LÅSTE JAG SJÄLV IN EN DEFEKT. Raden krävde tidigare att
        // fi-eaa.law var "EAA-implementering". Den platshållaren var rätt
        // beteende när jag skrev testet, men lydelsetabellen 2026-09-12 16:29
        // gav posten sitt riktiga värde, och testet gjorde då rättelsen röd.
        // Fjärde gången i det här repot ett test kodifierade felet det skulle
        // skydda mot, och första gången det var jag som skrev det.
        //
        // Rätt invariant är den motsatta: ingen platshållare får stå i ett
        // namnfält som går ut till kund.
        const placeholders: string[] = [];
        for (const country of ['SE', 'NO', 'DK', 'FI', 'NL', 'DE', 'FR', 'ES', 'IE', 'IT', 'PT', 'PL', 'GB', 'US', 'CA', 'AU'] as Country[]) {
            for (const law of getNationalLaws(country)) {
                for (const field of ['law', 'fullName'] as const) {
                    if (law[field] && law[field].includes('EAA-implementering')) placeholders.push(law.id + '.' + field);
                }
            }
        }
        expect(placeholders, 'Platshållare i namnfält: ' + placeholders.join(', ')).toEqual([]);
        expect(getNationalLaws('NO').find(l => l.id === 'no-ikt')?.fullName).toContain('(IKT)-løsninger');
    });
});

/**
 * Intern #66 — getMaxSanction får aldrig påstå ett nolltak.
 *
 * 4.0.0-filtret skippade bara sanctions === undefined. Sexton poster bär ett
 * DEKLARERAT maxAmount: 0 som betyder "ingen siffra belagd", och sju länder
 * svarade därför att deras maximala sanktionsexponering var noll: FI, NO, DK,
 * GB, AU, PT och PL. En deklarerad nolla är ett starkare falskt påstående än
 * ett saknat fält, eftersom den läses som ett mätt tak.
 *
 * Funktionens egen doc-kommentar sa redan att den aldrig får underskatta ett
 * lands maxexponering. Filtret gjorde precis det.
 */
describe('Intern #66 — getMaxSanction påstår inget nolltak', () => {
    const ALL: Country[] = ['SE', 'NO', 'DK', 'FI', 'NL', 'DE', 'FR', 'ES', 'IE', 'IT', 'PT', 'PL', 'GB', 'US', 'CA', 'AU'];

    it('inget land rapporterar ett tak på noll', () => {
        const zeros: string[] = [];
        for (const country of ALL) {
            const max = getMaxSanction(country);
            if (max && max.amount <= 0) zeros.push(country + ": " + JSON.stringify(max));
        }
        expect(zeros, "Land som påstår nolltak:" + String.fromCharCode(10) + zeros.join(String.fromCharCode(10))).toEqual([]);
    });

    it('länder utan belagt tak svarar null, inte noll', () => {
        // Sju länder saknar ett belagt tak i datan i dag. Rätt svar är null.
        for (const country of ['FI', 'NO', 'DK', 'GB', 'AU', 'PT', 'PL'] as Country[]) {
            expect(getMaxSanction(country), country + " borde sakna belagt tak").toBeNull();
        }
    });

    it('länder med belagt tak svarar med siffran', () => {
        expect(getMaxSanction('SE')?.amount).toBe(10000000);
        expect(getMaxSanction('ES')?.amount).toBe(1000000);
        expect(getMaxSanction('CA')?.amount).toBe(250000);
    });
});

/**
 * Intern #63 punkt 4 — den landsblinda uppslagsfällan.
 *
 * getNationalLaw(id, country = "SE") returnerar null för varje utländsk post om
 * anroparen glömmer landet. Meja kallade det den enskilt mest sannolika buggen i
 * en tracker-koppling: en validering som frågar "finns lagrummet" underkänner
 * varje utländsk rad, tyst och utan fel.
 */
describe('Intern #63 — findNationalLaw och getAllNationalLaws', () => {
    it('fällan finns kvar och är dokumenterad: getNationalLaw utan land ger null', () => {
        expect(getNationalLaw('de-bfsg')).toBeNull();
        expect(getNationalLaw('pt-eaa')).toBeNull();
        // Svenska poster fungerar, vilket är precis varför fällan är tyst.
        expect(getNationalLaw('dos-lagen')?.id).toBe('dos-lagen');
    });

    it('findNationalLaw hittar över alla länder och bär landet i svaret', () => {
        expect(findNationalLaw('de-bfsg')?.country).toBe('DE');
        expect(findNationalLaw('pt-eaa')?.country).toBe('PT');
        expect(findNationalLaw('gb-eqa2010')?.country).toBe('GB');
        expect(findNationalLaw('finns-inte')).toBeNull();
    });

    it('getAllNationalLaws returnerar hela mängden med land på varje post', () => {
        const all = getAllNationalLaws();
        expect(all.length).toBeGreaterThan(30);
        expect(all.every(l => typeof l.country === String.fromCharCode(115, 116, 114, 105, 110, 103))).toBe(true);
        // Varje id ska gå att hitta igen med findNationalLaw.
        for (const law of all) {
            expect(findNationalLaw(law.id)?.country, law.id).toBe(law.country);
        }
    });

    it('id är unika över alla länder, annars är uppslag på id meningslöst', () => {
        const ids = getAllNationalLaws().map(l => l.id);
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        expect(dupes, 'dubbletter: ' + dupes.join(', ')).toEqual([]);
    });
});
