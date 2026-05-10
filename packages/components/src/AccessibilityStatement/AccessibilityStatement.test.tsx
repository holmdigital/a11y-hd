// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AccessibilityStatement } from './AccessibilityStatement';
import { getEnforcementBody, getNationalLawByFramework } from '@holmdigital/standards';

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

    it('renders en-ca with ACA/AODA legislation references', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en-ca" country="CA" />
        );
        const html = container.innerHTML;
        expect(html).toContain('Accessible Canada Act');
        expect(html).toContain('Accessibility for Ontarians with Disabilities Act');
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

const EU_LOCALE_COUNTRY_MAP: Array<{ locale: string; country: string }> = [
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
                    country={country as any}
                    sector="public"
                />
            );
            const expectedBody = getEnforcementBody(country as any, 'public');
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
                    country={country as any}
                    sector="public"
                />
            );
            const law = getNationalLawByFramework('WAD', country as any);
            expect(law).not.toBeNull();
            expect(container.innerHTML).toContain(law!.fullName);
        });
    });
});

// --- New locale tests for it/pt/pl ---

const NEW_LOCALE_COUNTRY_MAP: Array<{ locale: string; country: string }> = [
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
                    country={country as any}
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
                    country={country as any}
                    sector="public"
                />
            );
            const expectedBody = getEnforcementBody(country as any, 'public');
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
                    country={country as any}
                    sector="public"
                />
            );
            const law = getNationalLawByFramework('WAD', country as any);
            expect(law).not.toBeNull();
            expect(container.innerHTML).toContain(law!.fullName);
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
                <AccessibilityStatement {...defaultProps} locale={locale} country={country as any} complianceLevel="full" />
            );
            expect(container.innerHTML).toContain(expectedBadge);
        });
    });

    Object.entries(NEW_LOCALE_UPDATED_LABEL).forEach(([locale, expectedLabel]) => {
        it(`renders ${locale} locale with correct "Updated:" label`, () => {
            const country = locale === 'it' ? 'IT' : locale === 'pt' ? 'PT' : 'PL';
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} country={country as any} />
            );
            expect(container.innerHTML).toContain(expectedLabel);
        });
    });

    Object.entries(NEW_LOCALE_FOOTER_TEXT).forEach(([locale, expectedFooter]) => {
        it(`renders ${locale} locale with correct footer text`, () => {
            const country = locale === 'it' ? 'IT' : locale === 'pt' ? 'PT' : 'PL';
            const { container } = render(
                <AccessibilityStatement {...defaultProps} locale={locale} country={country as any} />
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
                country={'AU' as any}
                sector="public"
            />
        );
        const expectedBody = getEnforcementBody('AU' as any, 'public');
        expect(container.innerHTML).toContain(expectedBody);
    });

    it('en-au locale renders correct national law for country=AU', () => {
        const { container } = render(
            <AccessibilityStatement
                {...defaultProps}
                locale="en-au"
                country={'AU' as any}
                sector="public"
            />
        );
        const law = getNationalLawByFramework('DDA' as any, 'AU' as any);
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

    it('US private sector resolves to ADA Title III + HHS Section 504', () => {
        const { container } = render(
            <AccessibilityStatement
                {...defaultProps}
                locale="en"
                country="US"
                sector="private"
            />
        );
        const html = container.innerHTML;
        // Private-sector US should reference ADA Title III AND HHS Section 504 (REHAB)
        expect(html).toMatch(/Americans with Disabilities Act.*Title III/i);
        expect(html).toMatch(/Section 504|Rehabilitation Act/i);
        expect(html).not.toMatch(PLACEHOLDER_PATTERN);
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
