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
    const englishVariants = ['en-gb', 'en-us', 'en-ca'];

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

    it('renders generic en with EU accessibility regulations (unchanged)', () => {
        const { container } = render(
            <AccessibilityStatement {...defaultProps} locale="en" />
        );
        const html = container.innerHTML;
        // Generic en uses "the accessibility regulations" in enforcement and technical sections
        expect(html).toContain('complies with the accessibility regulations');
        expect(html).not.toContain('Public Sector Bodies');
        expect(html).not.toContain('Section 508');
        expect(html).not.toContain('Accessible Canada Act');
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
