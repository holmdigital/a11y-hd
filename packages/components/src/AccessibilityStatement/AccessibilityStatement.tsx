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

    // Compliance status text
    const complianceText = {
        'full': 'This website is fully compliant with accessibility requirements.',
        'partial': 'This website is partially compliant with accessibility requirements.',
        'non-compliant': 'This website is not yet compliant with accessibility requirements.'
    };

    // Swedish compliance text
    const complianceTextSv = {
        'full': 'Denna webbplats är helt förenlig med tillgänglighetskraven.',
        'partial': 'Denna webbplats är delvis förenlig med tillgänglighetskraven.',
        'non-compliant': 'Denna webbplats uppfyller ännu inte tillgänglighetskraven.'
    };

    const isSv = locale === 'sv';

    const styles: Record<string, React.CSSProperties> = {
        container: {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: 1.6,
            maxWidth: '800px',
            padding: '2rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
        },
        heading: {
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: '#0f172a'
        },
        section: {
            marginBottom: '1.5rem'
        },
        sectionTitle: {
            fontSize: '1.125rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: '#1e293b'
        },
        paragraph: {
            margin: '0.5rem 0',
            color: '#334155'
        },
        link: {
            color: '#0056b3',
            textDecoration: 'underline'
        },
        list: {
            margin: '0.5rem 0',
            paddingLeft: '1.5rem'
        },
        legalBox: {
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '1rem',
            marginTop: '1rem'
        },
        contactBox: {
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '1rem',
            marginTop: '1rem'
        },
        badge: {
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginLeft: '0.5rem'
        },
        badgeFull: {
            backgroundColor: '#dcfce7',
            color: '#166534'
        },
        badgePartial: {
            backgroundColor: '#fef3c7',
            color: '#92400e'
        },
        badgeNonCompliant: {
            backgroundColor: '#fee2e2',
            color: '#991b1b'
        }
    };

    const badgeStyle = complianceLevel === 'full'
        ? { ...styles.badge, ...styles.badgeFull }
        : complianceLevel === 'partial'
            ? { ...styles.badge, ...styles.badgePartial }
            : { ...styles.badge, ...styles.badgeNonCompliant };

    return (
        <article
            className={className}
            style={styles.container}
            aria-labelledby="a11y-statement-title"
        >
            <h1 id="a11y-statement-title" style={styles.heading}>
                {isSv ? 'Tillgänglighetsredogörelse' : 'Accessibility Statement'}
                <span style={badgeStyle}>
                    {complianceLevel === 'full' ? '✓' : complianceLevel === 'partial' ? '⚠' : '✕'}
                </span>
            </h1>

            {/* Organization & Scope */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    {isSv ? 'Om denna redogörelse' : 'About this statement'}
                </h2>
                <p style={styles.paragraph}>
                    {isSv
                        ? `Denna tillgänglighetsredogörelse gäller för ${organizationName}.`
                        : `This accessibility statement applies to ${organizationName}.`
                    }
                </p>
                <p style={styles.paragraph}>
                    <strong>{isSv ? 'Webbplats:' : 'Website:'}</strong>{' '}
                    <a href={websiteUrl} style={styles.link}>{websiteUrl}</a>
                </p>
                <p style={styles.paragraph}>
                    <strong>{isSv ? 'Senast uppdaterad:' : 'Last updated:'}</strong>{' '}
                    {formatDate(lastReviewDate)}
                </p>
            </section>

            {/* Compliance Status */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    {isSv ? 'Efterlevnadsstatus' : 'Compliance status'}
                </h2>
                <p style={styles.paragraph}>
                    {isSv ? complianceTextSv[complianceLevel] : complianceText[complianceLevel]}
                </p>
                {nonComplianceItems.length > 0 && (
                    <>
                        <p style={styles.paragraph}>
                            <strong>
                                {isSv ? 'Kända problem:' : 'Known issues:'}
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
                    {isSv ? 'Rättslig grund' : 'Legal basis'}
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
                                        {isSv ? '📜 Läs lagtexten' : '📜 Read the legislation'}
                                    </a>
                                </p>
                            )}
                            <p style={styles.paragraph}>
                                <strong>{isSv ? 'EU-ramverk:' : 'EU Framework:'}</strong>{' '}
                                {framework === 'WAD'
                                    ? 'Web Accessibility Directive (2016/2102)'
                                    : 'European Accessibility Act (2019/882)'
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
                        {isSv ? 'Tillsynsmyndighet' : 'Enforcement Authority'}
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
                                {isSv ? '🔍 Tillsynsportal' : '🔍 Monitoring Portal'}
                            </a>
                        </p>
                    )}
                </section>
            )}

            {/* Contact */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    {isSv ? 'Kontakt' : 'Contact'}
                </h2>
                <div style={styles.contactBox}>
                    <p style={styles.paragraph}>
                        {isSv
                            ? 'Om du upptäcker tillgänglighetsproblem, vänligen kontakta oss:'
                            : 'If you encounter accessibility issues, please contact us:'
                        }
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
                        {isSv ? 'Genererad med hjälp av' : 'Generated using'}{' '}
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
