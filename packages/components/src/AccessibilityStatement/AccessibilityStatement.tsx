import React from 'react';
import {
    getNationalLawByFramework,
    getNordicAuthority,
    getStatementToolsByCountry,
    type Country,
    type LegalFramework
} from '@holmdigital/standards';

/**
 * Props för AccessibilityStatement-komponenten
 */
export interface AccessibilityStatementProps {
    /**
     * Landskod (SE, NO, DK, FI, DE, FR, ES, IE)
     */
    country: Country;

    /**
     * Sektor avgör om WAD (public) eller EAA (private) tillämpas
     */
    sector: 'public' | 'private';

    /**
     * Organisationens namn
     */
    organizationName: string;

    /**
     * Webbplatsens URL
     */
    websiteUrl: string;

    /**
     * Efterlevnadsnivå
     */
    complianceLevel: 'full' | 'partial' | 'non-compliant';

    /**
     * Datum för senaste granskning
     */
    lastReviewDate: Date;

    /**
     * Kontakt-e-post för tillgänglighetsfrågor
     */
    contactEmail: string;

    /**
     * (Valfritt) Lista över kända problem
     */
    nonComplianceItems?: string[];

    /**
     * (Valfritt) Språk för datumformatering
     * @default 'en'
     */
    locale?: string;

    /**
     * (Valfritt) Extra CSS-klass
     */
    className?: string;
}

/**
 * Tillgänglighetsredogörelse-komponent
 * 
 * Genererar en juridiskt korrekt tillgänglighetsredogörelse 
 * baserat på tillämplig EU-lagstiftning (WAD/EAA) och nationell lag.
 * 
 * Uppfyller:
 * - WCAG 2.1 Level AA (semantic HTML)
 * - EN 301 549 (accessible document structure)
 * - WAD Article 7 / EAA Annex V (accessibility statement requirements)
 */
export const AccessibilityStatement: React.FC<AccessibilityStatementProps> = ({
    country,
    sector,
    organizationName,
    websiteUrl,
    complianceLevel,
    lastReviewDate,
    contactEmail,
    nonComplianceItems = [],
    locale = 'en',
    className = ''
}) => {
    // Determine applicable EU framework
    const framework: LegalFramework = sector === 'public' ? 'WAD' : 'EAA';

    // Get national law for this country and framework
    const nationalLaw = getNationalLawByFramework(framework, country);

    // Get enforcement authority (for Nordic countries)
    const authorityId = nationalLaw?.enforcement?.authority;
    const authority = authorityId ? getNordicAuthority(authorityId) : null;

    // Get statement tools for this country
    const statementTools = getStatementToolsByCountry(country);
    const recommendedTool = statementTools.find(t => t.recommended) || statementTools[0];

    // Format date according to locale
    const formatDate = (date: Date) => {
        return date.toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Localization dictionary
    const translations: Record<string, any> = {
        en: {
            title: 'Accessibility Statement',
            about: 'About this statement',
            appliesTo: (org: string) => `This accessibility statement applies to ${org}.`,
            website: 'Website:',
            lastUpdated: 'Last updated:',
            compliance: 'Compliance status',
            knownIssues: 'Known issues:',
            legalBasis: 'Legal basis',
            readLaw: '📜 Read the legislation',
            euFramework: 'EU Framework:',
            enforcement: 'Enforcement Authority',
            monitoringPortal: '🔍 Monitoring Portal',
            contact: 'Contact',
            contactIntro: 'If you encounter accessibility issues, please contact us:',
            generatedBy: 'Generated using',
            statuses: {
                full: 'This website is fully compliant with accessibility requirements.',
                partial: 'This website is partially compliant with accessibility requirements.',
                'non-compliant': 'This website is not yet compliant with accessibility requirements.'
            },
            frameworks: {
                WAD: 'Web Accessibility Directive (2016/2102)',
                EAA: 'European Accessibility Act (2019/882)'
            }
        },
        sv: {
            title: 'Tillgänglighetsredogörelse',
            about: 'Om denna redogörelse',
            appliesTo: (org: string) => `Denna tillgänglighetsredogörelse gäller för ${org}.`,
            website: 'Webbplats:',
            lastUpdated: 'Senast uppdaterad:',
            compliance: 'Efterlevnadsstatus',
            knownIssues: 'Kända problem:',
            legalBasis: 'Rättslig grund',
            readLaw: '📜 Läs lagtexten',
            euFramework: 'EU-ramverk:',
            enforcement: 'Tillsynsmyndighet',
            monitoringPortal: '🔍 Tillsynsportal',
            contact: 'Kontakt',
            contactIntro: 'Om du upptäcker tillgänglighetsproblem, vänligen kontakta oss:',
            generatedBy: 'Genererad med hjälp av',
            statuses: {
                full: 'Denna webbplats är helt förenlig med tillgänglighetskraven.',
                partial: 'Denna webbplats är delvis förenlig med tillgänglighetskraven.',
                'non-compliant': 'Denna webbplats uppfyller ännu inte tillgänglighetskraven.'
            },
            frameworks: {
                WAD: 'Webbtillgänglighetsdirektivet (2016/2102)',
                EAA: 'Tillgänglighetsdirektivet (2019/882)'
            }
        },
        no: {
            title: 'Tilgjengelighetserklæring',
            about: 'Om denne erklæringen',
            appliesTo: (org: string) => `Denne tilgjengelighetserklæringen gjelder for ${org}.`,
            website: 'Nettsted:',
            lastUpdated: 'Sist oppdatert:',
            compliance: 'Status for etterlevelse',
            knownIssues: 'Kjente problemer:',
            legalBasis: 'Rettslig grunnlag',
            readLaw: '📜 Les lovteksten',
            euFramework: 'EU-rammeverk:',
            enforcement: 'Tilsynsmyndighet',
            monitoringPortal: '🔍 Tilsynsportal',
            contact: 'Kontakt',
            contactIntro: 'Hvis du opplever tilgjengelighetsproblemer, vennligst kontakt oss:',
            generatedBy: 'Generert ved hjelp av',
            statuses: {
                full: 'Dette nettstedet er i samsvar med kravene til universell utforming.',
                partial: 'Dette nettstedet er delvis i samsvar med kravene til universell utforming.',
                'non-compliant': 'Dette nettstedet oppfyller ennå ikke kravene til universell utforming.'
            },
            frameworks: {
                WAD: 'Webdirektivet (2016/2102)',
                EAA: 'Tilgjengelighetsdirektivet (2019/882)'
            }
        },
        dk: {
            title: 'Tilgængelighedserklæring',
            about: 'Om denne erklæring',
            appliesTo: (org: string) => `Denne tilgængelighedserklæring gælder for ${org}.`,
            website: 'Websted:',
            lastUpdated: 'Sidst opdateret:',
            compliance: 'Overensstemmelsesstatus',
            knownIssues: 'Kendte problemer:',
            legalBasis: 'Retsgrundlag',
            readLaw: '📜 Læs lovteksten',
            euFramework: 'EU-ramme:',
            enforcement: 'Håndhævelsesmyndighed',
            monitoringPortal: '🔍 Tilsynsportal',
            contact: 'Kontakt',
            contactIntro: 'Hvis du oplever tilgængelighedsproblemer, bedes du kontakte os:',
            generatedBy: 'Genereret ved hjælp af',
            statuses: {
                full: 'Dette websted overholder fuldt ud tilgængelighedskravene.',
                partial: 'Dette websted overholder delvist tilgængelighedskravene.',
                'non-compliant': 'Dette websted overholder endnu ikke tilgængelighedskravene.'
            },
            frameworks: {
                WAD: 'Webtilgængelighedsdirektivet (2016/2102)',
                EAA: 'Tilgængelighedsdirektivet (2019/882)'
            }
        },
        fi: {
            title: 'Saavutettavuusseloste',
            about: 'Tietoa tästä selosteesta',
            appliesTo: (org: string) => `Tämä saavutettavuusseloste koskee organisaatiota ${org}.`,
            website: 'Verkkosivusto:',
            lastUpdated: 'Viimeksi päivitetty:',
            compliance: 'Vaatimustenmukaisuus',
            knownIssues: 'Tunnetut ongelmat:',
            legalBasis: 'Oikeusperusta',
            readLaw: '📜 Lue lakiteksti',
            euFramework: 'EU-kehys:',
            enforcement: 'Valvontaviranomainen',
            monitoringPortal: '🔍 Valvontaportaali',
            contact: 'Yhteystiedot',
            contactIntro: 'Jos havaitset saavutettavuusongelmia, ota meihin yhteyttä:',
            generatedBy: 'Luotu käyttäen',
            statuses: {
                full: 'Tämä verkkosivusto on täysin vaatimusten mukainen.',
                partial: 'Tämä verkkosivusto on osittain vaatimusten mukainen.',
                'non-compliant': 'Tämä verkkosivusto ei vielä täytä vaatimuksia.'
            },
            frameworks: {
                WAD: 'Saavutettavuusdirektiivi (2016/2102)',
                EAA: 'Esteettömyysdirektiivi (2019/882)'
            }
        },
        de: {
            title: 'Barrierefreiheitserklärung',
            about: 'Über diese Erklärung',
            appliesTo: (org: string) => `Diese Barrierefreiheitserklärung gilt für ${org}.`,
            website: 'Website:',
            lastUpdated: 'Zuletzt aktualisiert:',
            compliance: 'Vereinbarkeit mit den Anforderungen',
            knownIssues: 'Bekannte Probleme:',
            legalBasis: 'Rechtsgrundlage',
            readLaw: '📜 Gesetzestext lesen',
            euFramework: 'EU-Rahmen:',
            enforcement: 'Durchsetzungsstelle',
            monitoringPortal: '🔍 Überwachungsportal',
            contact: 'Kontakt',
            contactIntro: 'Wenn Sie Barrieren melden möchten, kontaktieren Sie uns bitte:',
            generatedBy: 'Erstellt mit',
            statuses: {
                full: 'Diese Website ist vollständig mit den Anforderungen vereinbar.',
                partial: 'Diese Website ist teilweise mit den Anforderungen vereinbar.',
                'non-compliant': 'Diese Website ist noch nicht mit den Anforderungen vereinbar.'
            },
            frameworks: {
                WAD: 'EU-Richtlinie 2016/2102',
                EAA: 'European Accessibility Act (2019/882)'
            }
        },
        fr: {
            title: 'Déclaration d\'accessibilité',
            about: 'À propos de cette déclaration',
            appliesTo: (org: string) => `Cette déclaration d'accessibilité s'applique à ${org}.`,
            website: 'Site web:',
            lastUpdated: 'Dernière mise à jour:',
            compliance: 'État de conformité',
            knownIssues: 'Problèmes connus:',
            legalBasis: 'Base légale',
            readLaw: '📜 Lire la législation',
            euFramework: 'Cadre de l\'UE:',
            enforcement: 'Autorité de contrôle',
            monitoringPortal: '🔍 Portail de surveillance',
            contact: 'Contact',
            contactIntro: 'Si vous rencontrez des problèmes d\'accessibilité, veuillez nous contacter:',
            generatedBy: 'Généré à l\'aide de',
            statuses: {
                full: 'Ce site est totalement conforme aux exigences d\'accessibilité.',
                partial: 'Ce site est partiellement conforme aux exigences d\'accessibilité.',
                'non-compliant': 'Ce site n\'est pas encore conforme aux exigences d\'accessibilité.'
            },
            frameworks: {
                WAD: 'Directive Accessibilité Web (2016/2102)',
                EAA: 'Acte Européen sur l\'Accessibilité (2019/882)'
            }
        },
        es: {
            title: 'Declaración de accesibilidad',
            about: 'Sobre esta declaración',
            appliesTo: (org: string) => `Esta declaración de accesibilidad se aplica a ${org}.`,
            website: 'Sitio web:',
            lastUpdated: 'Última actualización:',
            compliance: 'Estado de cumplimiento',
            knownIssues: 'Problemas conocidos:',
            legalBasis: 'Base legal',
            readLaw: '📜 Leer la legislación',
            euFramework: 'Marco de la UE:',
            enforcement: 'Autoridad de control',
            monitoringPortal: '🔍 Portal de seguimiento',
            contact: 'Contacto',
            contactIntro: 'Si encuentra problemas de accesibilidad, contáctenos:',
            generatedBy: 'Generado usando',
            statuses: {
                full: 'Este sitio web cumple totalmente con los requisitos de accesibilidad.',
                partial: 'Este sitio web cumple parcialmente con los requisitos de accesibilidad.',
                'non-compliant': 'Este sitio web aún no cumple con los requisitos de accesibilidad.'
            },
            frameworks: {
                WAD: 'Directiva de Accesibilidad Web (2016/2102)',
                EAA: 'Acta Europea de Accesibilidad (2019/882)'
            }
        }
    };

    // Use selected locale or default to English
    const t = translations[locale] || translations['en'];

    return (
        <article
            className={className}
            style={styles.container}
            aria-labelledby="a11y-statement-title"
        >
            <h1 id="a11y-statement-title" style={styles.heading}>
                {t.title}
                <span style={badgeStyle}>
                    {complianceLevel === 'full' ? '✓' : complianceLevel === 'partial' ? '⚠' : '✕'}
                </span>
            </h1>

            {/* Organization & Scope */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    {t.about}
                </h2>
                <p style={styles.paragraph}>
                    {t.appliesTo(organizationName)}
                </p>
                <p style={styles.paragraph}>
                    <strong>{t.website}</strong>{' '}
                    <a href={websiteUrl} style={styles.link}>{websiteUrl}</a>
                </p>
                <p style={styles.paragraph}>
                    <strong>{t.lastUpdated}</strong>{' '}
                    {formatDate(lastReviewDate)}
                </p>
            </section>

            {/* Compliance Status */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    {t.compliance}
                </h2>
                <p style={styles.paragraph}>
                    {t.statuses[complianceLevel]}
                </p>
                {nonComplianceItems.length > 0 && (
                    <>
                        <p style={styles.paragraph}>
                            <strong>
                                {t.knownIssues}
                            </strong>
                        </p>
                        <ul style={styles.list}>
                            {nonComplianceItems.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </>
                )}
            </section>

            {/* Legal Basis */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    {t.legalBasis}
                </h2>
                <div style={styles.legalBox}>
                    {nationalLaw ? (
                        <>
                            <p style={styles.paragraph}>
                                <strong>{nationalLaw.law}</strong>
                                <br />
                                {nationalLaw.fullName}
                            </p>
                            {nationalLaw.lawUrl && (
                                <p style={styles.paragraph}>
                                    <a href={nationalLaw.lawUrl} style={styles.link} target="_blank" rel="noopener noreferrer">
                                        {t.readLaw}
                                    </a>
                                </p>
                            )}
                            <p style={styles.paragraph}>
                                <strong>{t.euFramework}</strong>{' '}
                                {framework === 'WAD'
                                    ? t.frameworks.WAD
                                    : t.frameworks.EAA
                                }
                            </p>
                        </>
                    ) : (
                        <p style={styles.paragraph}>
                            {framework === 'WAD'
                                ? 'Web Accessibility Directive (EU) 2016/2102'
                                : 'European Accessibility Act (EU) 2019/882'
                            }
                        </p>
                    )}
                </div>
            </section>

            {/* Enforcement Authority */}
            {authority && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        {t.enforcement}
                    </h2>
                    <p style={styles.paragraph}>
                        <strong>{authority.name}</strong>
                    </p>
                    <p style={styles.paragraph}>
                        <a href={authority.website} style={styles.link} target="_blank" rel="noopener noreferrer">
                            {authority.website}
                        </a>
                    </p>
                    {authority.monitoringPortal && (
                        <p style={styles.paragraph}>
                            <a href={authority.monitoringPortal} style={styles.link} target="_blank" rel="noopener noreferrer">
                                {t.monitoringPortal}
                            </a>
                        </p>
                    )}
                </section>
            )}

            {/* Contact */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    {t.contact}
                </h2>
                <div style={styles.contactBox}>
                    <p style={styles.paragraph}>
                        {t.contactIntro}
                    </p>
                    <p style={styles.paragraph}>
                        <a href={`mailto:${contactEmail}`} style={styles.link}>
                            ✉️ {contactEmail}
                        </a>
                    </p>
                </div>
            </section>

            {/* Statement Tool Reference */}
            {recommendedTool && (
                <footer style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#64748b' }}>
                    <p>
                        {t.generatedBy}{' '}
                        <a href={recommendedTool.url} style={styles.link} target="_blank" rel="noopener noreferrer">
                            {recommendedTool.name}
                        </a>
                    </p>
                </footer>
            )}
        </article>
    );
};

AccessibilityStatement.displayName = 'AccessibilityStatement';
