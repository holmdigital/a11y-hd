import React from 'react';
import {
    getStatementToolsByCountry,
    type Country
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
     * Datum för när bedömningen gjordes (viktigt för Digg)
     */
    assessmentDate?: Date;

    /**
     * Metod för utvärdering (t.ex. "Automatiserad granskning", "Självskattning")
     */
    evaluationMethod?: string;

    /**
     * (Valfritt) Anpassat verktyg som användes för att generera rapporten
     * Ersätter standardverktyget (t.ex. Digg) om angivet
     */
    generatorTool?: {
        name: string;
        url: string;
    };

    /**
     * (Valfritt) URL eller Base64-sträng för logotyp
     */
    logoUrl?: string;

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

    /**
     * (Valfritt) Telefonnummer för kontakt
     */
    phoneNumber?: string;

    /**
     * (Valfritt) Normal svarstid (t.ex. "2 dagar")
     */
    responseTime?: string;
    /**
     * (Valfritt) URL för tillgänglighets-badge
     */
    badgeUrl?: string;
    /**
     * (Valfritt) Datum för när webbplatsen publicerades
     */
    publishDate?: Date;
}

const ENFORCEMENT_BODIES: Record<Country, string> = {
    SE: 'Myndigheten för digital förvaltning (Digg)',
    NO: 'Digitaliseringsdirektoratet (uutilsynet)',
    DK: 'Digitaliseringsstyrelsen',
    FI: 'Regionförvaltningsverket i Södra Finland (AVI)',
    NL: 'Ministerie van Binnenlandse Zaken en Koninkrijksrelaties (BZK)',
    DE: 'BFIT-Bund (Überwachungsstelle des Bundes für Barrierefreiheit von Informationstechnik)',
    FR: 'Direction interministérielle du numérique (DINUM)',
    ES: 'Ministerio para la Transformación Digital y de la Función Pública',
    IE: 'National Disability Authority (NDA)',
    GB: 'Equality and Human Rights Commission (EHRC)',
    US: 'Department of Justice (Civil Rights Division)',
    CA: 'Accessibility Commissioner (Canadian Human Rights Commission)',
    EU: 'Europeiska kommissionen (DG CNECT)'
};

const TEMPLATES = {
    sv: `Tillgänglighet för {<webbplats>}

{<organisation>} står bakom den här webbplatsen. Vi vill att så många som möjligt ska kunna använda den. Det här dokumentet beskriver hur {<webbplats>} uppfyller lagen om tillgänglighet till digital offentlig service, eventuella kända tillgänglighetsproblem och hur du kan rapportera brister till oss så att vi kan åtgärda dem.

## Hur tillgänglig är webbplatsen?

{Vi har inga kända brister i tillgängligheten för den här webbplatsen./Vi är medvetna om att delar av webbplatsen inte är helt tillgängliga. Se avsnittet om innehåll som inte är tillgängligt nedan för mer information./Vi är medvetna om att delar av webbplatsen inte är helt tillgängliga. Se avsnittet om innehåll som inte är tillgängligt nedan för mer information.}

## Vad kan du göra om du inte kan använda delar av webbplatsen?

Om du behöver innehåll från {<webbplats>} som inte är tillgängligt för dig, men som är undantaget från lagens tillämpningsområde enligt beskrivning nedan, kan du meddela oss.

[Svarstiden är normalt {<svarstid>}.]

[Du kan också kontakta oss på följande sätt:

* skicka e-post till {<e-postadress>}
* ring {<telefonnummer>}]

## Rapportera brister i webbplatsens tillgänglighet

Vi strävar hela tiden efter att förbättra webbplatsens tillgänglighet. Om du upptäcker problem som inte är beskrivna på den här sidan, eller om du anser att vi inte uppfyller lagens krav, meddela oss så att vi får veta att problemet finns.

## Tillsyn

{<enforcement_body>} har ansvaret för tillsyn över lagen om tillgänglighet till digital offentlig service. Du kan anmäla till {<enforcement_body>} om du tycker att vår digitala service har brister i tillgänglighet.

Du kan också anmäla till {<enforcement_body>} om du tycker att vår bedömning av vad som är oskäligt betungande ska granskas, om du tycker att vår tillgänglighetsredogörelse har brister eller om du tycker att vi inte har hanterat din begäran om tillgängliggörande korrekt.

## Teknisk information om webbplatsens tillgänglighet

{Den här webbplatsen är helt förenlig med lagen om tillgänglighet till digital offentlig service./Den här webbplatsen är delvis förenlig med lagen om tillgänglighet till digital offentlig service, på grund av de brister som beskrivs nedan./Den här webbplatsen är inte förenlig med lagen om tillgänglighet till digital offentlig service. Otillgängliga delar beskrivs nedan.}

## Innehåll som inte är tillgängligt

Det innehåll som beskrivs nedan är på ett eller annat sätt inte helt tillgängligt.

[
### Bristande förenlighet med lagkraven
{<brister>}
]

## Hur vi testat webbplatsen

{Vi har gjort en självskattning (intern testning) av {<webbplats>}./{<extern aktör>} har gjort en oberoende granskning av {<webbplats>}./Vi har uppskattat tillgängligheten utan granskning.}

Senaste bedömningen gjordes den {<bedömningsdatum>}.

[Granskningsmetod: {<metod>}]

Webbplatsen publicerades den {<publiceringsdatum>}.

Redogörelsen uppdaterades senast den {<uppdateringsdatum>}.`,

    en: `Accessibility of {<website>}

This website is run by {<organisation>}. We want as many people as possible to be able to use it, and this document describes how {<website>} complies with the accessibility regulations, any known accessibility issues, and how you can report problems so that we can fix them.

## How accessible is the website?

{There are no known accessibility issues with this website./We know some parts of this website aren’t fully accessible. See the section on non-accessible content below for more information./We know some parts of this website aren’t fully accessible. See the section on non-accessible content below for more information.}

## What to do if you can’t access parts of this website?

If you need content from this website that is not accessible for you, but is not within the scope of the accessibility regulations as described below, please contact us.

[Our normal response time is {<response time>}.]

[You can also contact us in the following ways:

* email {<email address>}
* call {<telephone number>}]

## Reporting accessibility problems with this website

We’re always looking to improve the accessibility of this website. If you find any problems that aren’t listed on this page or if we’re not meeting the requirements of the accessibility regulations, contact us and let us know about the problem.

## Enforcement procedure

The {<enforcement_body>} is responsible for enforcing the web accessibility regulations. If you experience accessibility issues on our website, you can submit a complaint to {<enforcement_body>}.

You can also submit a complaint to {<enforcement_body>} if you think that our assessment of what constitutes a disproportionate burden should be reviewed, if you think that our accessibility statement is inadequate, or it you think that your request for excluded content in an accessible format has not been handled correctly.

## Technical information about this website’s accessibility

{This website is fully compliant with the accessibility regulations./This website is partially compliant with the accessibility regulations, due to the non-compliances listed below./This website is not compliant with the accessibility regulations. The non-accessible sections are listed below.}

## Non-accessible content

The content described below is, in one way or another, not fully accessible.

[
### Non-compliance with the accessibility regulations

{<issues>}
]

## How we tested this website

{We have performed a self-assessment (internal testing) of {<website>}./{<third party>} has tested {<website>}./We have estimated the accessibility without testing.}

The last assessment was made on {<assessment date>}.

[Assessment method: {<method>}]

The website was published on {<publish date>}.

The statement was last updated on {<update date>}.`
};

// Helper to format date "1 January 2023"
const formatDiggDate = (date: Date, locale: string) => {
    return date.toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sector: _sector,
    organizationName,
    websiteUrl: _websiteUrl,
    complianceLevel,
    lastReviewDate,
    contactEmail,
    assessmentDate,
    evaluationMethod,
    generatorTool,
    logoUrl,
    nonComplianceItems = [],
    locale = 'en',
    className = '',
    phoneNumber,
    responseTime,
    badgeUrl,
    publishDate
}) => {
    // Localization & Template Logic
    const lang = (locale === 'sv' ? 'sv' : 'en') as keyof typeof TEMPLATES;
    const template = TEMPLATES[lang] || TEMPLATES.en;

    // Helper to format date
    const d = (date: Date) => formatDiggDate(date, locale);

    // Resolve enforcement body based on country
    const enforcementBody = ENFORCEMENT_BODIES[country] || ENFORCEMENT_BODIES.EU;

    // Data Map for replacements
    const replacements: Record<string, string> = {
        '{<webbplats>}': organizationName, // Or websiteUrl, but usually org/site name
        '{<website>}': organizationName,
        '{<organisation>}': organizationName,
        '{<e-postadress>}': contactEmail,
        '{<email address>}': contactEmail,
        '{<telefonnummer>}': phoneNumber || '',
        '{<telephone number>}': phoneNumber || '',
        '{<svarstid>}': responseTime || '',
        '{<response time>}': responseTime || '',
        '{<bedömningsdatum>}': assessmentDate ? d(assessmentDate) : d(lastReviewDate),
        '{<assessment date>}': assessmentDate ? d(assessmentDate) : d(lastReviewDate),
        '{<uppdateringsdatum>}': d(lastReviewDate),
        '{<update date>}': d(lastReviewDate),
        '{<publiceringsdatum>}': publishDate ? d(publishDate) : '2024-01-01', // Default to a realistic value if unknown
        '{<publish date>}': publishDate ? d(publishDate) : '2024-01-01',
        '{<metod>}': evaluationMethod || 'Automated Scan',
        '{<method>}': evaluationMethod || 'Automated Scan',
        '{<extern aktör>}': generatorTool?.name || 'HolmDigital Engine',
        '{<third party>}': generatorTool?.name || 'HolmDigital Engine',
        '{<enforcement_body>}': enforcementBody,
    };

    // Construct issue list string
    let issuesContent = '';
    if (nonComplianceItems.length > 0) {
        issuesContent = '\n\n' + nonComplianceItems.map(item => `* ${item}`).join('\n');
    } else {
        issuesContent = lang === 'sv' ? 'Inga kända brister.' : 'No known issues.';
    }
    replacements['{<brister>}'] = issuesContent;
    replacements['{<issues>}'] = issuesContent;


    const renderTemplate = (tmpl: string) => {
        let text = tmpl;

        // 1. Handle Conditional Blocks [ ... ] using Regex
        text = text.replace(/\[([\s\S]*?)\]/g, (_match, content) => {
            // If the block contains a variable that is EMPTY/UNDEFINED, remove the block.
            if (content.includes('{<svarstid>}') || content.includes('{<response time>}')) {
                return responseTime ? content : '';
            }
            if (content.includes('{<telefonnummer>}') || content.includes('{<telephone number>}')) {
                return phoneNumber ? content : '';
            }
            if (content.includes('{<brister>}') || content.includes('{<issues>}')) {
                // Logic: If complianceLevel is 'full', hide this block.
                return complianceLevel !== 'full' ? content : '';
            }
            // Add a newline before and after content to ensure separation from headings
            return '\n' + content.trim() + '\n';
        });

        // 2. Variable Substitution
        for (const [key, value] of Object.entries(replacements)) {
            text = text.replaceAll(key, value);
        }

        // 3. Handle Choices { A / B / C }
        text = text.replace(/\{([^{}]*?)\}/g, (_match, content) => {
            const parts = content.split('/');
            if (parts.length >= 2) {
                let idx = 0;
                if (complianceLevel === 'partial') idx = 1;
                if (complianceLevel === 'non-compliant') idx = parts.length > 2 ? 2 : 1;
                return parts[idx].trim();
            }
            return _match; // Return as is if not a choice block
        });

        // Split into paragraphs/nodes for rendering
        // Normalize line endings
        text = text.replace(/\r\n/g, '\n');

        // Split by double newline for paragraphs
        const sections = text.split('\n\n');

        const sectionNodes = sections.map((block, i) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            // Define icons based on title content
            let IconNode = null;
            if (trimmed.includes('Hur tillgänglig') || trimmed.includes('How accessible')) {
                IconNode = <IconWrapper><EyeIcon /></IconWrapper>;
            } else if (trimmed.includes('Vad kan du göra') || trimmed.includes('What to do')) {
                IconNode = <IconWrapper><HelpCircleIcon /></IconWrapper>;
            } else if (trimmed.includes('Rapportera brister') || trimmed.includes('Reporting accessibility')) {
                IconNode = <IconWrapper><AlertOctagonIcon /></IconWrapper>;
            } else if (trimmed.includes('Tillsyn') || trimmed.includes('Enforcement procedure')) {
                IconNode = <IconWrapper><GavelIcon /></IconWrapper>;
            } else if (trimmed.includes('Teknisk information') || trimmed.includes('Technical information')) {
                IconNode = <IconWrapper><CpuIcon /></IconWrapper>;
            } else if (trimmed.includes('Hur vi testat') || trimmed.includes('How we tested')) {
                IconNode = <IconWrapper><CheckCircleIcon /></IconWrapper>;
            }

            if (trimmed.startsWith('## ')) {
                const title = trimmed.replace('## ', '');
                return (
                    <h2 key={i} style={styles.sectionTitle}>
                        {IconNode}
                        {title}
                    </h2>
                );
            }
            if (trimmed.startsWith('### ')) {
                return <h3 key={i} style={{ ...styles.sectionTitle, fontSize: '1.4rem' }}>{trimmed.replace('### ', '')}</h3>;
            }

            // Handle lists (bullets)
            if (trimmed.includes('* ') || trimmed.includes('• ')) {
                const lines = trimmed.split('\n');
                return (
                    <ul key={i} style={styles.list}>
                        {lines.map((line, li) => {
                            const cleanLine = line.trim().replace(/^[*-•]\s*/, '');
                            if (!cleanLine) return null;
                            const isListItem = line.trim().startsWith('*') || line.trim().startsWith('•') || line.trim().startsWith('-');
                            if (!isListItem) {
                                return <p key={`p-${li}`} style={styles.paragraph}>{line}</p>;
                            }
                            return (
                                <li key={li} style={styles.listItem}>
                                    <div style={styles.listBullet} />
                                    {cleanLine}
                                </li>
                            );
                        })}
                    </ul>
                );
            }

            // Wrap specific sections in Cards for modern look
            const isCardSection = trimmed.includes('e-post') || trimmed.includes('email') || trimmed.includes('ring ') || trimmed.includes('call ');
            if (isCardSection) {
                return <div key={i} style={styles.card}>{trimmed}</div>;
            }

            // Default paragraph
            return <p key={i} style={styles.paragraph}>{trimmed}</p>;
        });

        return sectionNodes;
    };

    // Get statement tools for this country (fallback/reference)
    const statementTools = getStatementToolsByCountry(country);
    // Use custom generator tool if provided, otherwise fallback to national recommendation
    const usedTool = generatorTool || statementTools.find((t: any) => t.recommended) || statementTools[0];

    // Placeholder styles
    const styles: Record<string, React.CSSProperties> = {
        page: {
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: '#334155', // Slate 700
            lineHeight: 1.6,
            maxWidth: '100%',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid #f1f5f9'
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            marginRight: '1.5rem'
        },
        divider: {
            height: '2.5rem',
            width: '1px',
            backgroundColor: '#e2e8f0',
            marginRight: '1.5rem',
            display: 'block'
        },
        websiteContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: '#475569', // Slate 600
            fontWeight: 600,
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #f1f5f9'
        },
        container: {
            maxWidth: '900px',
            margin: '2rem auto',
            padding: '4.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.05)',
            border: '1px solid #f1f5f9',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: '#1e293b', // Slate 800
            lineHeight: 1.75,
            fontSize: '1.125rem'
        },
        mainHeading: {
            fontSize: '3rem',
            fontWeight: 900,
            color: '#082f49', // Primary 950
            marginTop: '0',
            marginBottom: '1rem',
            letterSpacing: '-0.04em',
            lineHeight: 1.1
        },
        metaData: {
            color: '#64748b', // Slate 500
            fontSize: '0.925rem',
            marginBottom: '4rem',
            fontWeight: 500,
            display: 'flex',
            gap: '1.5rem'
        },
        section: {
            marginBottom: '4.5rem'
        },
        sectionTitle: {
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#082f49', // Primary 950
            marginBottom: '1.5rem',
            marginTop: 0,
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        card: {
            padding: '2.5rem',
            backgroundColor: '#f0f9ff', // Primary 50
            borderRadius: '1.5rem',
            border: '1px solid #e0f2fe',
            marginBottom: '2.5rem'
        },
        paragraph: {
            marginBottom: '1.5rem',
            maxWidth: '65ch',
            whiteSpace: 'pre-line'
        },
        link: {
            color: '#0284c7', // Primary 600
            textDecoration: 'none',
            fontWeight: 600,
            borderBottom: '2px solid #e0f2fe',
            transition: 'border-color 0.2s',
            cursor: 'pointer'
        },
        list: {
            listStyleType: 'none',
            paddingLeft: 0,
            marginBottom: '1.5rem'
        },
        listItem: {
            marginBottom: '0.75rem',
            paddingLeft: '1.75rem',
            position: 'relative',
            display: 'block'
        },
        listBullet: {
            position: 'absolute',
            left: 0,
            top: '0.6em',
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '50%',
            backgroundColor: '#0ea5e9' // Primary 500
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.375rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 700,
            backgroundColor: complianceLevel === 'full' ? '#dcfce7' : complianceLevel === 'partial' ? '#fef9c3' : '#fee2e2',
            color: complianceLevel === 'full' ? '#166534' : complianceLevel === 'partial' ? '#854d0e' : '#991b1b',
            boxShadow: `0 4px 6px -1px ${complianceLevel === 'full' ? 'rgba(34, 197, 94, 0.1)' : complianceLevel === 'partial' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
            border: `1px solid ${complianceLevel === 'full' ? '#bbf7d0' : complianceLevel === 'partial' ? '#fef08a' : '#fecaca'}`,
            marginLeft: '0.5rem'
        },
        iconWrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.75rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #f1f5f9',
            color: '#0284c7'
        }
    };

    const Logo = () => (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="32" height="32" rx="6" fill="#0F172A" />
            <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="#38BDF8" />
            <path d="M16 12L20 16L16 20L12 16L16 12Z" fill="#0F172A" />
        </svg>
    );

    // Icon Components (Lucide-style)
    const IconWrapper = ({ children }: { children: React.ReactNode }) => (
        <div style={styles.iconWrapper}>{children}</div>
    );

    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    );

    const HelpCircleIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
    );

    const AlertOctagonIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    );

    const GavelIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 13-5 5 2 2 5-5-2-2Z" /><path d="m3 21 2-2 5-5-2-2-5 5-2 2Z" /><path d="m15 6 5 5-11 11-5-5L15 6Z" /><path d="M13 2 18 7" /></svg>
    );

    const CpuIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>
    );

    const CheckCircleIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    );


    return (
        <main
            role="main"
            className={className}
            style={styles.container}
            aria-labelledby="a11y-statement-title"
        >
            <header style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <a href="https://holmdigital.se" style={styles.logoContainer} target="_blank" rel="noreferrer">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Holm Digital" style={{ height: '3rem', width: 'auto' }} />
                        ) : (
                            <>
                                <Logo />
                                <span style={{ marginLeft: '0.75rem', fontWeight: 700, fontSize: '1.25rem', color: '#0c4a6e' }}>HolmDigital</span>
                            </>
                        )}
                    </a>

                    <div style={styles.divider} aria-hidden="true" />

                    <a href="https://holmdigital.se" style={styles.websiteContainer} target="_blank" rel="noreferrer">
                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '0.375rem', display: 'flex' }}>
                            {/* Simple Globe Icon SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }} aria-hidden="true">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                        </span>
                        <span>holmdigital<span style={{ color: '#0284c7' }}>.se</span></span>
                    </a>
                </div>

                {badgeUrl && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={badgeUrl} alt="Accessibility Badge" style={{ height: '1.5rem', width: 'auto' }} />
                    </div>
                )}
            </header>

            {/* Header Title strictly from Template (First part of template?) No, Digg template has no H1, it starts with text. 
                 But we want the H1... 
                 Actually, the 'title' key in Digg template is implicit or the document itself.
                 The provided template strings start with the title "Tillgänglighet för..."
             */}
            {/* 
            <h1 id="a11y-statement-title" style={styles.mainHeading}>
                {lang === 'sv' ? 'Tillgänglighetsredogörelse' : 'Accessibility Statement'}
            </h1>
            Wait, the template starts with "Tillgänglighet för {<webbplats>}" which IS the title.
            We should render the first line as H1?
            The template text:
            `Tillgänglighet för {<webbplats>}
            {<organisation>} står bakom...`
            
            So the first line is the Heading. I will handle this in renderTemplate by checking for index 0 if it's not starting with #.
            Or better: I will manually extract the first line as title, or let the renderer handle it.
            
            Let's let renderTemplate handle it. But we want H1 semantics.
            I will modify renderTemplate to make the first block an H1 if it's the very first line.
            */}

            {/* Template Rendered Content */}
            <div className="statement-content">
                {/* We manually render the first line as H1 for better control, OR we update renderTemplate. 
                    Let's update renderTemplate inside the component to handle the first line specially if needed.
                    Actually, the template provided has:
                    "Tillgänglighet för {<webbplats>}\n{<organisation>}..."
                    So the first paragraph is the title.
                    I need to split the template string carefully.
                */}
                {(() => {
                    // Split the template to separate title from body
                    const parts = template.split('\n');
                    const titleRaw = parts[0];
                    const bodyRaw = parts.slice(1).join('\n');

                    // Format title
                    let title = titleRaw.replace('{<webbplats>}', organizationName).replace('{<website>}', organizationName);

                    return (
                        <>
                            <h1 id="a11y-statement-title" style={styles.mainHeading}>
                                {title}
                            </h1>
                            {renderTemplate(bodyRaw)}
                        </>
                    )
                })()}

            </div>

            {/* Footer with Tool attribution */}
            <footer style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                <p>
                    {lang === 'sv' ? 'Genererad med hjälp av' : 'Generated using'}{' '}
                    <a href={usedTool?.url || 'https://holmdigital.se'} style={styles.link} target="_blank" rel="noopener noreferrer">
                        {usedTool?.name || 'HolmDigital Engine'}
                    </a>
                </p>
            </footer>
        </main>
    );
};

AccessibilityStatement.displayName = 'AccessibilityStatement';
