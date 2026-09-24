// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 3.1.1 Language of Page — locale-correct prose per supported country
 * - 3.1.2 Language of Parts — jurisdiction-specific legislation references
 * - 4.1.2 Name, Role, Value — semantic structure of the rendered statement
 */
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AccessibilityStatement } from './AccessibilityStatement';
import {
    getAllNationalLaws,
    getEnforcementBody,
    getNationalLawByFramework,
    getNationalLawForSector,
    getNationalLaws,
    isNameAttested,
    NATIONAL_LAW_FALLBACK,
    type Country,
    type NationalLaw,
} from '@holmdigital/standards';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Intern #82: vad lagplatsen ska visa. Namnet om lagnamnet är attesterat,
 * annars fallback-frasen på utlåtandets språk. Testerna följer registret i
 * stället för att låsa dagens läge, så att ett land som tänds inte kräver att
 * någon skriver om dem.
 */
const lagplatsen = (law: NationalLaw | null | undefined, locale: string): string =>
    law && isNameAttested(law)
        ? law.fullName
        : NATIONAL_LAW_FALLBACK[locale.split('-')[0]] ?? NATIONAL_LAW_FALLBACK.en;

const defaultProps = {
    country: 'SE' as const,
    sector: 'public' as const,
    organizationName: 'Test Organization AB',
    websiteUrl: 'https://test.example.com',
    complianceLevel: 'partial' as const,
    lastReviewDate: new Date('2024-06-15'),
    contactEmail: 'accessibility@test.example.com',
    assessmentDate: new Date('2024-06-01'),
    evaluationMethod: 'Automated Scan + Manual Review',
    generatorTool: { name: 'HolmDigital Engine', url: 'https://holmdigital.se' },
    phoneNumber: '+46 8 123 456 78',
    responseTime: '2 business days',
    publishDate: new Date('2024-01-15'),
    nonComplianceItems: ['Missing alt text on decorative images', 'Insufficient heading hierarchy on search page'],
};

const LOCALE_TITLE_MARKERS: Record<string, string> = {
    sv: 'Tillgänglighet för',
    en: 'Accessibility of',
    no: 'Tilgjengelighet for',
    da: 'Tilgængelighed for',
    de: 'Barrierefreiheitserklärung für',
    fr: "Déclaration d'accessibilité pour",
    es: 'Declaración de accesibilidad para',
    fi: 'Saavutettavuusseloste:',
    nl: 'Toegankelijkheidsverklaring voor',
    'en-gb': 'Accessibility of',
    'en-us': 'Accessibility of',
    'en-ca': 'Accessibility of',
    'en-au': 'Accessibility of',
};

const PLACEHOLDER_PATTERN = /\{<[^>]+>\}/;

describe('AccessibilityStatement locale routing', () => {
    Object.entries(LOCALE_TITLE_MARKERS).forEach(([locale, expectedMarker]) => {
        it(`renders ${locale} locale with correct title marker`, () => {
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} />
            );
            const html = container.innerHTML;
            expect(html).toContain(expectedMarker);
        });
    });
});

describe('AccessibilityStatement placeholder leakage', () => {
    const locales = ['sv', 'en', 'no', 'da', 'de', 'fr', 'es', 'fi', 'nl', 'en-gb', 'en-us', 'en-ca'];

    locales.forEach((locale) => {
        it(`no {<...>} placeholders survive in ${locale} locale output`, () => {
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} />
            );
            const html = container.innerHTML;
            expect(html).not.toMatch(PLACEHOLDER_PATTERN);
        });
    });
});

// Chrome badge text expected for complianceLevel="full" per canonical locale
const CHROME_BADGE_MARKERS: Record<string, string> = {
    sv: 'Fullt ut förenlig',
    en: 'Fully compliant',
    no: 'Helt i samsvar',
    fi: 'Täysin saavutettava',
    da: 'Fuldt ud i overensstemmelse',
    de: 'Vollständig konform',
    fr: 'Totalement conforme',
    es: 'Plenamente conforme',
    nl: 'Volledig conform',
    'en-gb': 'Fully compliant',
    'en-us': 'Fully compliant',
    'en-ca': 'Fully compliant',
    'en-au': 'Fully compliant',
};

const CHROME_UPDATED_MARKERS: Record<string, string> = {
    sv: 'Uppdaterad:',
    en: 'Updated:',
    no: 'Oppdatert:',
    fi: 'Päivitetty:',
    da: 'Opdateret:',
    de: 'Aktualisiert:',
    fr: 'Mis à jour :',
    es: 'Actualizado:',
    nl: 'Bijgewerkt:',
    'en-gb': 'Updated:',
    'en-us': 'Updated:',
    'en-ca': 'Updated:',
    'en-au': 'Updated:',
};

const CHROME_FOOTER_MARKERS: Record<string, string> = {
    sv: 'Genererad med hjälp av',
    en: 'Generated using',
    no: 'Generert med',
    fi: 'Luotu käyttäen',
    da: 'Genereret ved hjælp af',
    de: 'Erstellt mit',
    fr: "Généré à l'aide de",
    es: 'Generado con',
    nl: 'Gegenereerd met',
    'en-gb': 'Generated using',
    'en-us': 'Generated using',
    'en-ca': 'Generated using',
    'en-au': 'Generated using',
};

describe('AccessibilityStatement chrome badge localization', () => {
    Object.entries(CHROME_BADGE_MARKERS).forEach(([locale, expectedBadge]) => {
        it(`renders ${locale} locale with correct badge text for full compliance`, () => {
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} complianceLevel="full" />
            );
            expect(container.innerHTML).toContain(expectedBadge);
        });
    });
});

describe('AccessibilityStatement chrome label localization', () => {
    Object.entries(CHROME_UPDATED_MARKERS).forEach(([locale, expectedLabel]) => {
        it(`renders ${locale} locale with correct "Updated:" label`, () => {
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} />
            );
            expect(container.innerHTML).toContain(expectedLabel);
        });
    });

    Object.entries(CHROME_FOOTER_MARKERS).forEach(([locale, expectedFooter]) => {
        it(`renders ${locale} locale with correct "Generated using" footer`, () => {
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} />
            );
            expect(container.innerHTML).toContain(expectedFooter);
        });
    });
});

describe('AccessibilityStatement en-gb/en-us/en-ca chrome', () => {
    const englishVariants = ['en-gb', 'en-us', 'en-ca', 'en-au'];

    englishVariants.forEach((locale) => {
        it(`renders ${locale} with English badge text without console warning`, () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} complianceLevel="full" />
            );
            const html = container.innerHTML;
            expect(html).toContain('Fully compliant');
            expect(html).toContain('Updated:');
            expect(html).toContain('Generated using');
            expect(warnSpy).not.toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });
});

describe('AccessibilityStatement en-gb/en-us/en-ca jurisdiction content', () => {
    it('renders en-gb with UK PSBAR 2018 legislation references', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-gb" country="GB" />
        );
        const html = container.innerHTML;
        expect(html).toContain('Public Sector Bodies');
        // Enforcement and technical sections reference UK legislation, not generic EU text
        expect(html).toContain('Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018');
    });

    it('renders en-us with Section 508/ADA legislation references', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-us" country="US" />
        );
        const html = container.innerHTML;
        expect(html).toContain('Section 508');
        expect(html).toContain('Americans with Disabilities Act');
    });

    it('renders en-ca with the Accessible Canada Act and never Ontario\'s AODA as Canada\'s law', () => {
        // Det här testet krävde tidigare AODA, och passerade DÄRFÖR att mallen
        // hårdkodade "the Accessible Canada Act and the Accessibility for
        // Ontarians with Disabilities Act" förbi lagvalet. AODA är en
        // provinslag (Intern #64) och är aldrig Kanadas svar. Motorns mallar
        // rättades i 3.3.8; komponentens, som CLI:ts HTML-utlåtanden renderas
        // med, rättades aldrig.
        //
        // Intern #82: med lagnamnsgrinden står den federala lagen där bara när
        // dess namn är attesterat, annars fallback-frasen. Ontarios lag får
        // aldrig stå där, attesterad eller inte.
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-ca" country="CA" />
        );
        const html = container.innerHTML;
        expect(html).toContain(lagplatsen(getNationalLawForSector('CA', 'public'), 'en-ca'));
        expect(html).not.toContain('Accessibility for Ontarians with Disabilities Act');
    });

    it('renders en-gb private sector without the public-sector regulations', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-gb" country="GB" sector="private" />
        );
        expect(container.innerHTML).not.toContain('Public Sector Bodies');
    });

    it('renders en-us private sector without Section 508, which binds federal agencies only', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-us" country="US" sector="private" />
        );
        expect(container.innerHTML).not.toContain('Section 508');
    });

    it('renders generic en with national law name (not generic "accessibility regulations")', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en" />
        );
        const html = container.innerHTML;
        // Generic en now uses {<national_law>} which resolves to the actual law name for the country
        expect(html).toContain('complies with');
        expect(html).not.toContain('complies with the accessibility regulations');
        expect(html).not.toContain('Public Sector Bodies');
        expect(html).not.toContain('Section 508');
        expect(html).not.toContain('Accessible Canada Act');
    });
});

describe('AccessibilityStatement en-au jurisdiction content', () => {
    it('renders en-au with DDA 1992 legislation references', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-au" country="AU" />
        );
        const html = container.innerHTML;
        expect(html).toContain('Disability Discrimination Act 1992');
        expect(html).toContain('Australian Human Rights Commission');
    });

    it('renders en-au without EU-specific concepts', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-au" country="AU" />
        );
        const html = container.innerHTML;
        expect(html).not.toContain('disproportionate burden');
        expect(html).not.toContain('Web Accessibility Directive');
        expect(html).not.toContain('EN 301 549');
    });

    it('renders en-au with AHRC complaint URL', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-au" country="AU" />
        );
        const html = container.innerHTML;
        expect(html).toContain('humanrights.gov.au/complaints');
    });

    it('renders en-au with DTA policy section', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-au" country="AU" />
        );
        const html = container.innerHTML;
        expect(html).toContain('Digital Transformation Agency');
        expect(html).toContain('Digital Inclusion Standard');
    });

    it('renders the DTA policy section for the public sector only', () => {
        // Juno 2026-09-24 (Intern #94 fråga 4): policyn gäller federala
        // myndigheter och ingen annan. Ett privat företag är varken "subject to"
        // den eller en "Commonwealth agency", så avsnittet är sakligt fel där.
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-au" country="AU" sector="private" />
        );
        const html = container.innerHTML;
        expect(html).not.toContain('Australian Government digital policy');
        expect(html).not.toContain('Digital Inclusion Standard');
        expect(html).not.toContain('Commonwealth agencies');
        // Resten av utlåtandet står kvar.
        expect(html).toContain('Australian Human Rights Commission');
    });

    it('renders en-au with voluntary framing (not mandatory statement language)', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-au" country="AU" />
        );
        const html = container.innerHTML;
        expect(html).toContain('This statement describes how');
        expect(html).not.toContain('required by law');
        expect(html).not.toContain('is required to');
    });
});

// Chrome badge text expected for complianceLevel="non-compliant" per canonical locale
const CHROME_NON_COMPLIANT_MARKERS: Record<string, string> = {
    sv: 'Inte förenlig',
    en: 'Non-compliant',
    no: 'Ikke i samsvar',
    fi: 'Ei saavutettava',
    da: 'Ikke i overensstemmelse',
    de: 'Nicht konform',
    fr: 'Non conforme',
    es: 'No conforme',
    nl: 'Niet conform',
    'en-gb': 'Non-compliant',
    'en-us': 'Non-compliant',
    'en-ca': 'Non-compliant',
    'en-au': 'Non-compliant',
};

describe('AccessibilityStatement chrome badge non-compliant localization', () => {
    Object.entries(CHROME_NON_COMPLIANT_MARKERS).forEach(([locale, expectedBadge]) => {
        it(`renders ${locale} locale with correct badge text for non-compliant`, () => {
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} complianceLevel="non-compliant" />
            );
            expect(container.innerHTML).toContain(expectedBadge);
        });
    });
});

describe('AccessibilityStatement nb alias chrome', () => {
    it('renders nb locale with Norwegian chrome text', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="nb" complianceLevel="full" />
        );
        const html = container.innerHTML;
        expect(html).toContain('Helt i samsvar');
        expect(html).toContain('Oppdatert:');
        expect(html).toContain('Generert med');
    });
});

const EU_LOCALE_COUNTRY_MAP: Array<{ locale: string; country: Country }> = [
    { locale: 'sv', country: 'SE' },
    { locale: 'no', country: 'NO' },
    { locale: 'da', country: 'DK' },
    { locale: 'nl', country: 'NL' },
    { locale: 'de', country: 'DE' },
    { locale: 'fr', country: 'FR' },
    { locale: 'es', country: 'ES' },
    { locale: 'fi', country: 'FI' },
];

describe('AccessibilityStatement national compliance - enforcement body', () => {
    EU_LOCALE_COUNTRY_MAP.forEach(({ locale, country }) => {
        it(`${locale} locale renders correct enforcement body for country=${country}`, () => {
            const { container } = render(
                <AccessibilityStatement
                    {...defaultProps}
                    locale={locale}
                    country={country}
                    sector="public"
                />
            );
            const expectedBody = getEnforcementBody(country, 'public');
            expect(container.innerHTML).toContain(expectedBody);
        });
    });
});

describe('AccessibilityStatement national compliance - national law', () => {
    EU_LOCALE_COUNTRY_MAP.forEach(({ locale, country }) => {
        it(`${locale} locale renders correct national law for country=${country}`, () => {
            const { container } = render(
                <AccessibilityStatement
                    {...defaultProps}
                    locale={locale}
                    country={country}
                    sector="public"
                />
            );
            const law = getNationalLawByFramework('WAD', country);
            expect(law).not.toBeNull();
            // Intern #82: namnet bara när det är attesterat, annars frasen.
            expect(container.innerHTML).toContain(lagplatsen(law, locale));
            if (!isNameAttested(law)) expect(container.innerHTML).not.toContain(law!.fullName);
        });
    });
});

// --- New locale tests for it/pt/pl ---

const NEW_LOCALE_COUNTRY_MAP: Array<{ locale: string; country: Country }> = [
    { locale: 'it', country: 'IT' },
    { locale: 'pt', country: 'PT' },
    { locale: 'pl', country: 'PL' },
];

// AU uses DDA framework (not WAD/EAA), so en-au placeholder leakage is tested in the en-au describe block below

describe('AccessibilityStatement placeholder leakage - new locales (it/pt/pl)', () => {
    NEW_LOCALE_COUNTRY_MAP.forEach(({ locale, country }) => {
        it(`no {<...>} placeholders survive in ${locale} locale output`, () => {
            const { container } = render(
                <AccessibilityStatement
                    {...defaultProps}
                    locale={locale}
                    country={country}
                    sector="public"
                />
            );
            expect(container.innerHTML).not.toMatch(PLACEHOLDER_PATTERN);
        });
    });
});

describe('AccessibilityStatement national compliance - enforcement body (it/pt/pl)', () => {
    NEW_LOCALE_COUNTRY_MAP.forEach(({ locale, country }) => {
        it(`${locale} locale renders correct enforcement body for country=${country}`, () => {
            const { container } = render(
                <AccessibilityStatement
                    {...defaultProps}
                    locale={locale}
                    country={country}
                    sector="public"
                />
            );
            const expectedBody = getEnforcementBody(country, 'public');
            expect(container.innerHTML).toContain(expectedBody);
        });
    });
});

describe('AccessibilityStatement national compliance - national law (it/pt/pl)', () => {
    NEW_LOCALE_COUNTRY_MAP.forEach(({ locale, country }) => {
        it(`${locale} locale renders correct national law for country=${country}`, () => {
            const { container } = render(
                <AccessibilityStatement
                    {...defaultProps}
                    locale={locale}
                    country={country}
                    sector="public"
                />
            );
            const law = getNationalLawByFramework('WAD', country);
            expect(law).not.toBeNull();
            // Intern #82: namnet bara när det är attesterat, annars frasen.
            expect(container.innerHTML).toContain(lagplatsen(law, locale));
            if (!isNameAttested(law)) expect(container.innerHTML).not.toContain(law!.fullName);
        });
    });
});

const NEW_LOCALE_CHROME_FULL: Record<string, string> = {
    it: 'Pienamente conforme',
    pt: 'Plenamente conforme',
    pl: 'W pełni zgodna',
};

const NEW_LOCALE_UPDATED_LABEL: Record<string, string> = {
    it: 'Aggiornato:',
    pt: 'Atualizado:',
    pl: 'Zaktualizowano:',
};

const NEW_LOCALE_FOOTER_TEXT: Record<string, string> = {
    it: 'Generato con',
    pt: 'Gerado com',
    pl: 'Wygenerowano za pomocą',
};

describe('AccessibilityStatement chrome localization - new locales (it/pt/pl)', () => {
    Object.entries(NEW_LOCALE_CHROME_FULL).forEach(([locale, expectedBadge]) => {
        it(`renders ${locale} locale with correct badge text for full compliance`, () => {
            const country = locale === 'it' ? 'IT' : locale === 'pt' ? 'PT' : 'PL';
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} country={country} complianceLevel="full" />
            );
            expect(container.innerHTML).toContain(expectedBadge);
        });
    });

    Object.entries(NEW_LOCALE_UPDATED_LABEL).forEach(([locale, expectedLabel]) => {
        it(`renders ${locale} locale with correct "Updated:" label`, () => {
            const country = locale === 'it' ? 'IT' : locale === 'pt' ? 'PT' : 'PL';
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} country={country} />
            );
            expect(container.innerHTML).toContain(expectedLabel);
        });
    });

    Object.entries(NEW_LOCALE_FOOTER_TEXT).forEach(([locale, expectedFooter]) => {
        it(`renders ${locale} locale with correct footer text`, () => {
            const country = locale === 'it' ? 'IT' : locale === 'pt' ? 'PT' : 'PL';
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} country={country} />
            );
            expect(container.innerHTML).toContain(expectedFooter);
        });
    });
});

describe('AccessibilityStatement placeholder leakage - en-au', () => {
    it('no {<...>} placeholders survive in en-au locale output', () => {
        const { container } = render(
            <AccessibilityStatement
                {...defaultProps}
                locale="en-au"
                country="AU"
                sector="public"
            />
        );
        expect(container.innerHTML).not.toMatch(PLACEHOLDER_PATTERN);
    });
});

describe('AccessibilityStatement national compliance - AU enforcement body', () => {
    it('en-au locale renders correct enforcement body for country=AU', () => {
        const { container } = render(
            <AccessibilityStatement
                {...defaultProps}
                locale="en-au"
                country="AU"
                sector="public"
            />
        );
        const expectedBody = getEnforcementBody('AU', 'public');
        expect(container.innerHTML).toContain(expectedBody);
    });

    it('en-au locale renders correct national law for country=AU', () => {
        const { container } = render(
            <AccessibilityStatement
                {...defaultProps}
                locale="en-au"
                country="AU"
                sector="public"
            />
        );
        const law = getNationalLawByFramework('DDA', 'AU');
        expect(law).not.toBeNull();
        expect(container.innerHTML).toContain(law!.fullName);
    });
});

describe('AccessibilityStatement US national_law placeholder (generic en template)', () => {
    // Regression: country='US' in the generic en template previously called
    // getNationalLawByFramework('EAA'|'WAD', 'US') which returns null, leaving an
    // empty {<national_law>} render. Fixed by adding a US-aware branch that mirrors
    // the engine's statement-generator.ts.

    it('US public sector resolves to ADA Title II + Section 508', () => {
        const { container } = render(
            <AccessibilityStatement
                {...defaultProps}
                locale="en"
                country="US"
                sector="public"
            />
        );
        const html = container.innerHTML;
        // Public-sector US should reference ADA Title II AND Section 508
        expect(html).toMatch(/Americans with Disabilities Act.*Title II/i);
        expect(html).toContain('Section 508');
        // No empty placeholder leakage
        expect(html).not.toMatch(PLACEHOLDER_PATTERN);
    });

    it('US private sector resolves to ADA Title III, WITHOUT HHS Section 504', () => {
        // Intern #63/#66: det här testet krävde tidigare att Section 504 nämndes,
        // och låste därmed fast defekten. us-hhs-section-504 har inForce: false
        // med ikraftträdande 2027-05-11, och en lag som inte trätt i kraft får
        // aldrig namnges som bindande rätt i ett dokument kunden lämnar ifrån sig
        // som sitt eget. Motorn rättades i Intern #64; den här komponenten gjorde
        // det inte, så felet levde vidare i publicerad components 4.0.1.
        //
        // Tredje gången i det här repot ett test kodifierade felet det skulle
        // skydda mot. Referensen kommer tillbaka av sig själv när inForce-vakten
        // vänder flaggan 2027 — hand-återställ den inte.
        const { container } = render(
            <AccessibilityStatement
                {...defaultProps}
                locale="en"
                country="US"
                sector="private"
            />
        );
        const html = container.innerHTML;
        // Intern #82: Title III står där bara när dess namn är attesterat.
        const titleIII = getNationalLaws('US').find(l => l.id === 'us-ada-title-iii');
        expect(html).toContain(lagplatsen(titleIII, 'en'));
        expect(html).not.toMatch(/Section 504/i);
        expect(html).not.toMatch(PLACEHOLDER_PATTERN);
    });

    it('Intern #64 i components: inget land renderar tom lagrad, och Kanada får aldrig AODA', () => {
        // Verifierat mot publicerad components 4.0.1 att detta var trasigt:
        // CA public namngav Ontarios AODA som Kanadas lag, och CA, NO och GB
        // privat renderade TOM STRÄNG i meningen "… uppfyller , eventuella kända".
        const cases: Array<[string, 'public' | 'private']> = [
            ['CA', 'public'], ['CA', 'private'],
            ['NO', 'public'], ['NO', 'private'],
            ['GB', 'public'], ['GB', 'private'],
        ];
        for (const [country, sector] of cases) {
            const { container } = render(
                <AccessibilityStatement
                    {...defaultProps}
                    locale="en"
                    country={country as never}
                    sector={sector}
                />
            );
            const html = container.innerHTML;
            expect(html, `${country}/${sector} lämnade platshållare kvar`).not.toMatch(PLACEHOLDER_PATTERN);
            // Tom lagrad syns som "complies with ," eller "with  ," i utfallet.
            expect(html, `${country}/${sector} renderade tom lagrad`).not.toMatch(/complies with\s*,/i);
            if (country === 'CA') {
                expect(html, `CA/${sector} namngav Ontarios provinslag`).not.toMatch(/Ontarians/i);
                // Intern #82: den federala lagen, eller frasen om namnet inte är attesterat.
                expect(html).toContain(lagplatsen(getNationalLawForSector('CA', sector), 'en'));
            }
        }
    });

    it('US locale=en does not leave an empty national_law substitution (previously broken)', () => {
        const { container } = render(
            <AccessibilityStatement
                {...defaultProps}
                locale="en"
                country="US"
                sector="public"
            />
        );
        const html = container.innerHTML;
        // Pre-fix output rendered "complies with  ()" with empty law name.
        expect(html).not.toMatch(/complies with\s*\(\s*\)/);
        expect(html).not.toMatch(/complies with\s*\.\s/);
    });
});

/**
 * Utlåtandets valblock `{A / B / C}`, samma fel som i motorn och av samma skäl:
 * komponenten bär en egen kopia av mallarna och av tolkningen. CLI:ts
 * HTML-utlåtanden renderas med den här komponenten, så felen nådde också dem.
 *
 * Mallarna läses ur källfilen i stället för att fraser räknas upp per språk,
 * så en ny mall omfattas utan att någon behöver komma ihåg det.
 */
describe('AccessibilityStatement valblock', () => {
    const SOURCE = readFileSync(join(__dirname, 'AccessibilityStatement.tsx'), 'utf8');
    const TEMPLATE_BLOCK = SOURCE.slice(SOURCE.indexOf('const TEMPLATES'), SOURCE.indexOf('\n};', SOURCE.indexOf('const TEMPLATES')));
    const LEVELS = ['full', 'partial', 'non-compliant'] as const;

    /** locale → råinnehållet i sektionen `testing`, som JS-strängen lyder. */
    const testingContent = new Map<string, string>();
    const keys = [...TEMPLATE_BLOCK.matchAll(/^ {4}'?([a-z-]+)'?: \{/gm)];
    keys.forEach((k, i) => {
        const chunk = TEMPLATE_BLOCK.slice(k.index, keys[i + 1]?.index ?? TEMPLATE_BLOCK.length);
        const m = /id: "testing", title: "(?:[^"\\]|\\.)*", content: "((?:[^"\\]|\\.)*)"/.exec(chunk);
        if (m) testingContent.set(k[1], JSON.parse(`"${m[1].replace(/\\'/g, "'")}"`));
    });

    const choiceOptions = (text: string): string[] => {
        const m = /\{((?:[^{}]|\{<[^>]+>\})*\/(?:[^{}]|\{<[^>]+>\})*)\}/.exec(text);
        if (!m) throw new Error(`inget valblock i: ${text.slice(0, 80)}`);
        return m[1].split('/');
    };
    const literal = (option: string): string =>
        option.split(/\{<[^>]+>\}/).map(s => s.trim()).sort((a, b) => b.length - a.length)[0];

    it('hittar metodsektionen i varje mall', () => {
        expect(testingContent.size).toBe(keys.length);
        expect(keys.length).toBeGreaterThanOrEqual(16);
    });

    for (const [locale, content] of testingContent) {
        const [self, external, estimated] = choiceOptions(content).map(literal);
        it.each(LEVELS)(`${locale}: %s ger självskattningen, aldrig extern granskning eller uppskattning`, (level) => {
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} complianceLevel={level} />
            );
            const text = container.textContent ?? '';
            expect(text).toContain(self);
            expect(text).not.toContain(external);
            if (estimated) expect(text).not.toContain(estimated);
        });
    }

    it.each(LEVELS)('ett organisationsnamn med snedstreck återges helt i varje mall, %s', (level) => {
        const org = 'Region Testlän / Förvaltning 1/2';
        for (const locale of testingContent.keys()) {
            const { container, unmount } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} complianceLevel={level} organizationName={org} />
            );
            const text = container.textContent ?? '';
            const prefix = text.split('Region Testlän').length - 1;
            expect(prefix, locale).toBeGreaterThan(0);
            expect(text.split(org).length - 1, locale).toBe(prefix);
            unmount();
        }
    });

    it('ingen mall namnger en lag förbi lagvalet', () => {
        // Samma svep som motorn fick i 3.3.8. Ett lagnamn i mallen går förbi
        // {<national_law>} och därmed förbi lagvalet: GB privat fick
        // regleringen för offentlig sektor och US privat Section 508.
        const names = new Set<string>();
        for (const law of getAllNationalLaws()) {
            for (const n of [law.law, law.fullName]) if (n.trim().length >= 8) names.add(n.trim());
        }
        const hits = [...names].filter(n => TEMPLATE_BLOCK.includes(n));
        expect(hits).toEqual([]);
    });
});

/**
 * Intern #82 avsnitt 6, komponentdelen. För varje land, sektor och mall: en
 * lagpost utan attesterat lagnamn får aldrig synas med namn, varken i
 * lagplatsen eller någon annanstans i dokumentet. Och lagplatsen visar alltid
 * något, namnet eller fallback-frasen.
 */
describe('Intern #82 — lagnamnsgrinden i komponenten', () => {
    const SOURCE = readFileSync(join(__dirname, 'AccessibilityStatement.tsx'), 'utf-8');
    const block = SOURCE.slice(SOURCE.indexOf('const TEMPLATES'), SOURCE.indexOf('\n};', SOURCE.indexOf('const TEMPLATES')));
    const LOCALES = [...block.matchAll(/^ {4}'?([a-z-]+)'?: \{/gm)].map(m => m[1]);
    const COUNTRIES = [...new Set(getAllNationalLaws().map(l => l.country))];
    const SECTORS = ['public', 'private'] as const;
    /**
     * Känd krock, rapporterad till Juno 2026-09-24 i Intern #82: myndighetsraden
     * för ES och PT privat citerar lagen med lagrum, eftersom tillsynen där inte
     * har en enda myndighet. Specen säger både att myndigheten inte tystnar i
     * det här bygget och att ingen mening får namnge lagen bakvägen. Undantaget
     * gäller exakt de här citaten; varje annan förekomst av namnet fäller testet.
     */
    const MYNDIGHETSRADENS_LAGRUM: Record<string, string> = {
        'es-eaa': 'Ley 11/2023, art. 27.3',
        'pt-eaa': 'Decreto-Lei n.º 82/2022, art. 28.º',
    };

    it('hittar alla mallar och alla länder', () => {
        expect(LOCALES.length).toBeGreaterThanOrEqual(16);
        expect(COUNTRIES.length).toBeGreaterThanOrEqual(16);
    });

    for (const country of COUNTRIES) {
        const utanNamn = getNationalLaws(country).filter(l => !isNameAttested(l));
        it(`${country}: ingen lag utan attesterat lagnamn syns, i någon sektor eller mall`, () => {
            for (const sector of SECTORS) {
                for (const locale of LOCALES) {
                    const html = render(
                        <AccessibilityStatement {...defaultProps} locale={locale} country={country} sector={sector} />
                    ).container.innerHTML;
                    for (const lag of utanNamn) {
                        const citat = MYNDIGHETSRADENS_LAGRUM[lag.id];
                        const text = citat ? html.split(citat).join('') : html;
                        expect(text, `${country}/${sector}/${locale} namngav ${lag.id}`).not.toContain(lag.fullName);
                        expect(text, `${country}/${sector}/${locale} namngav ${lag.id}`).not.toContain(lag.law);
                    }
                    expect(html, `${country}/${sector}/${locale}`).not.toMatch(PLACEHOLDER_PATTERN);
                }
            }
        });
    }

    it('lagplatsen visar namnet eller frasen för varje land och sektor, aldrig ingenting', () => {
        for (const country of COUNTRIES.filter(c => c !== 'US')) {
            for (const sector of SECTORS) {
                const html = render(
                    <AccessibilityStatement {...defaultProps} locale="en" country={country} sector={sector} />
                ).container.innerHTML;
                expect(html, `${country}/${sector}`).toContain(lagplatsen(getNationalLawForSector(country, sector), 'en'));
            }
        }
    });
});
