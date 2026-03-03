// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AccessibilityStatement } from './AccessibilityStatement';

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
    const locales = ['sv', 'en', 'no', 'da', 'de', 'fr', 'es', 'fi', 'nl'];

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
