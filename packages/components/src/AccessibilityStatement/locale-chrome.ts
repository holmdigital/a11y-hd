/**
 * Locale-specific chrome text for the AccessibilityStatement component.
 *
 * Covers the 9 canonical EU locales that effectiveLang resolves to.
 * Alias codes (nb, dk, en-gb, en-us, en-ca) are resolved in
 * supportedLocales before lookup, so they are NOT duplicated here.
 *
 * Badge labels intentionally match the engine's STATUS_LABELS wording
 * (statement-generator.ts) for cross-package consistency.
 */

/** Compliance badge text per locale, keyed by complianceLevel. */
export const BADGE_LABELS: Record<string, Record<string, string>> = {
    sv: { full: 'Fullt ut förenlig', partial: 'Delvis förenlig', 'non-compliant': 'Inte förenlig' },
    en: { full: 'Fully compliant', partial: 'Partially compliant', 'non-compliant': 'Non-compliant' },
    no: { full: 'Helt i samsvar', partial: 'Delvis i samsvar', 'non-compliant': 'Ikke i samsvar' },
    fi: { full: 'Täysin saavutettava', partial: 'Osittain saavutettava', 'non-compliant': 'Ei saavutettava' },
    da: { full: 'Fuldt ud i overensstemmelse', partial: 'Delvist i overensstemmelse', 'non-compliant': 'Ikke i overensstemmelse' },
    de: { full: 'Vollständig konform', partial: 'Teilweise konform', 'non-compliant': 'Nicht konform' },
    fr: { full: 'Totalement conforme', partial: 'Partiellement conforme', 'non-compliant': 'Non conforme' },
    es: { full: 'Plenamente conforme', partial: 'Parcialmente conforme', 'non-compliant': 'No conforme' },
    nl: { full: 'Volledig conform', partial: 'Gedeeltelijk conform', 'non-compliant': 'Niet conform' },
};

/** "Updated:" label per locale. */
export const UPDATED_LABEL: Record<string, string> = {
    sv: 'Uppdaterad:',
    en: 'Updated:',
    no: 'Oppdatert:',
    fi: 'Päivitetty:',
    da: 'Opdateret:',
    de: 'Aktualisiert:',
    fr: 'Mis à jour :',
    es: 'Actualizado:',
    nl: 'Bijgewerkt:',
};

/** "Generated using" footer text per locale. */
export const FOOTER_TEXT: Record<string, string> = {
    sv: 'Genererad med hjälp av',
    en: 'Generated using',
    no: 'Generert med',
    fi: 'Luotu käyttäen',
    da: 'Genereret ved hjælp af',
    de: 'Erstellt mit',
    fr: "Généré à l'aide de",
    es: 'Generado con',
    nl: 'Gegenereerd met',
};
