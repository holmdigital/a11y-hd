import React from 'react';
import {
    getStatementToolsByCountry,
    ENFORCEMENT_BODIES,
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


// Template logic is now handled in a more flexible way to support externalized templates
// In a real application, these might be loaded from JSON files during build or runtime
const TEMPLATES: Record<string, any> = {
    sv: {
        title: "Tillgänglighet för {<webbplats>}",
        intro: "{<organisation>} står bakom den här webbplatsen. Vi vill att så många som möjligt ska kunna använda den. Det här dokumentet beskriver hur {<webbplats>} uppfyller lagen om tillgänglighet till digital offentlig service, eventuella kända tillgänglighetsproblem och hur du kan rapportera brister till oss så att vi kan åtgärda dem.",
        sections: [
            { id: "how-accessible", title: "Hur tillgänglig är webbplatsen?", content: "{Vi har inga kända brister i tillgängligheten för den här webbplatsen./Vi är medvetna om att delar av webbplatsen inte är helt tillgängliga. Se avsnittet om innehåll som inte är tillgängligt nedan för mer information./Vi är medvetna om att delar av webbplatsen inte är helt tillgängliga. Se avsnittet om innehåll som inte är tillgängligt nedan för mer information.}" },
            { id: "what-to-do", title: "Vad kan du göra om du inte kan använda delar av webbplatsen?", content: "Om du behöver innehåll från {<webbplats>} som inte är tillgängligt för dig, men som är undantaget från lagens tillämpningsområde enligt beskrivning nedan, kan du meddela oss.\n\n[Svarstiden är normalt {<svarstid>}.]\n\n[Du kan också kontakta oss på följande sätt:\n\n* skicka e-post till {<e-postadress>}\n* ring {<telefonnummer>}]" },
            { id: "reporting", title: "Rapportera brister i webbplatsens tillgänglighet", content: "Vi strävar hela tiden efter att förbättra webbplatsens tillgänglighet. Om du upptäcker problem som inte är beskrivna på den här sidan, eller om du anser att vi inte uppfyller lagens krav, meddela oss så att vi får veta att problemet finns." },
            { id: "enforcement", title: "Tillsyn", content: "{<enforcement_body>} har ansvaret för tillsyn över lagen om tillgänglighet till digital offentlig service. Du kan anmäla till {<enforcement_body>} om du tycker att vår digitala service har brister i tillgänglighet.\n\nDu kan också anmäla till {<enforcement_body>} om du tycker att vår bedömning av vad som är oskäligt betungande ska granskas, om du tycker att vår tillgänglighetsredogörelse har brister eller om du tycker att vi inte har hanterat din begäran om tillgängliggörande korrekt." },
            { id: "technical", title: "Teknisk information om webbplatsens tillgänglighet", content: "{Den här webbplatsen är helt förenlig med lagen om tillgänglighet till digital offentlig service./Den här webbplatsen är delvis förenlig med lagen om tillgänglighet till digital offentlig service, på grund av de brister som beskrivs nedan./Den här webbplatsen är inte förenlig med lagen om tillgänglighet till digital offentlig service. Otillgängliga delar beskrivs nedan.}" },
            { id: "non-accessible", title: "Innehåll som inte är tillgängligt", content: "Det innehåll som beskrivs nedan är på ett eller annat sätt inte helt tillgängligt.\n\n[\n### Bristande förenlighet med lagkraven\n{<brister>}\n]" },
            { id: "testing", title: "Hur vi testat webbplatsen", content: "{Vi har gjort en självskattning (intern testning) av {<webbplats>}./{<extern aktör>} har gjort en oberoende granskning av {<webbplats>}./Vi har uppskattat tillgängligheten utan granskning.}\n\nSenaste bedömningen gjordes den {<bedömningsdatum>}.\n\n[Granskningsmetod: {<metod>}]\n\nWebbplatsen publicerades den {<publiceringsdatum>}.\n\nRedogörelsen uppdaterades senast den {<uppdateringsdatum>}." }
        ]
    },
    en: {
        title: "Accessibility of {<website>}",
        intro: "This website is run by {<organisation>}. We want as many people as possible to be able to use it, and this document describes how {<website>} complies with the accessibility regulations, any known accessibility issues, and how you can report problems so that we can fix them.",
        sections: [
            { id: "how-accessible", title: "How accessible is the website?", content: "{There are no known accessibility issues with this website./We know some parts of this website aren’t fully accessible. See the section on non-accessible content below for more information./We know some parts of this website aren’t fully accessible. See the section on non-accessible content below for more information.}" },
            { id: "what-to-do", title: "What to do if you can’t access parts of this website?", content: "If you need content from this website that is not accessible for you, but is not within the scope of the accessibility regulations as described below, please contact us.\n\n[Our normal response time is {<response time>}.]\n\n[You can also contact us in the following ways:\n\n* email {<email address>}\n* call {<telephone number>}]" },
            { id: "reporting", title: "Reporting accessibility problems with this website", content: "We’re always looking to improve the accessibility of this website. If you find any problems that aren’t listed on this page or if we’re not meeting the requirements of the accessibility regulations, contact us and let us know about the problem." },
            { id: "enforcement", title: "Enforcement procedure", content: "The {<enforcement_body>} is responsible for enforcing the web accessibility regulations. If you experience accessibility issues on our website, you can submit a complaint to {<enforcement_body>}.\n\nYou can also submit a complaint to {<enforcement_body>} if you think that our assessment of what constitutes a disproportionate burden should be reviewed, if you think that our accessibility statement is inadequate, or it you think that your request for excluded content in an accessible format has not been handled correctly." },
            { id: "technical", title: "Technical information about this website’s accessibility", content: "{This website is fully compliant with the accessibility regulations./This website is partially compliant with the accessibility regulations, due to the non-compliances listed below./This website is not compliant with the accessibility regulations. The non-accessible sections are listed below.}" },
            { id: "non-accessible", title: "Non-accessible content", content: "The content described below is, in one way or another, not fully accessible.\n\n[\n### Non-compliance with the accessibility regulations\n\n{<issues>}\n]" },
            { id: "testing", title: "How we tested this website", content: "{We have performed a self-assessment (internal testing) of {<website>}./{<third party>} has tested {<website>}./We have estimated the accessibility without testing.}\n\nThe last assessment was made on {<assessment date>}.\n\n[Assessment method: {<method>}]\n\nThe website was published on {<publish date>}.\n\nThe statement was last updated on {<update date>}." }
        ]
    },
    no: {
        title: "Tilgjengelighet for {<nettsted>}",
        intro: "{<organisasjon>} står bak dette nettstedet. Vi ønsker at flest mulig skal kunne bruke det. Dette dokumentet beskriver hvordan {<nettsted>} oppfyller lov om universell utforming av IKT-løsninger, eventuelle kjente tilgjengelighetsproblemer og hvordan du kan rapportere mangler til oss slik at vi kan utbedre dem.",
        sections: [
            { id: "how-accessible", title: "Hvor tilgjengelig er nettstedet?", content: "{Vi har ingen kjente mangler i tilgjengeligheten for dette nettstedet./Vi er klar over at deler av nettstedet ikke er fullt ut tilgjengelig. See avsnittet om innhold som ikke er tilgjengelig nedenfor for mer informasjon./Vi er klar over at deler av nettstedet ikke er fullt ut tilgjengelig. See avsnittet om innhold som ikke er tilgjengelig nedenfor for mer informasjon.}" },
            { id: "what-to-do", title: "Hva kan du gjøre hvis du ikke kan bruke deler av nettstedet?", content: "Hvis du trenger innhold fra {<nettsted>} som ikke er tilgjengelig for deg, men som er unntatt fra lovens anvendelsesområde som beskrevet nedenfor, kan du melde fra til oss.\n\n[Svartiden er normalt {<svartid>}.]\n\n[Du kan også kontakte oss på følgende måter:\n\n* send e-post til {<e-postadresse>}\n* ring {<telefonnummer>}]" },
            { id: "reporting", title: "Rapporter mangler ved nettstedets tilgjengelighet", content: "Vi jobber kontinuerlig med å forbedre nettstedets tilgjengelighet. Hvis du oppdager problemer som ikke er beskrevet på denne siden, eller hvis du mener at vi ikke oppfyller lovens krav, meld fra til oss slik at vi får vite om problemet." },
            { id: "enforcement", title: "Tillsyn", content: "{<enforcement_body>} har ansvaret for tilsyn med lov om universell utforming av IKT-løsninger. Du kan klage til {<enforcement_body>} hvis du mener at vår digitale tjeneste har mangler i tilgjengelighet.\n\nDu kan også klage til {<enforcement_body>} hvis du mener at vår vurdering av hva som er uforholdsmessig byrdefullt bør overproves, hvis du mener at vår tilgjengelighetserklæring har mangler eller hvis du mener at vi ikke har håndtert din forespørsel om tilgjengeliggjøring korrekt." },
            { id: "technical", title: "Teknisk informasjon om nettstedets tilgjengelighet", content: "{Dette nettstedet er helt i samsvar med lov om universell utforming av IKT-løsninger./Dette nettstedet er delvis i samsvar med lov om universell utforming av IKT-løsninger, på grunn av manglene beskrevet nedenfor./Dette nettstedet er ikke i samsvar med lov om universell utforming av IKT-løsninger. Utilgjengelige deler er beskrevet nedenfor.}" },
            { id: "non-accessible", title: "Innhold som ikke er tilgjengelig", content: "Innholdet som er beskrevet nedenfor er på en eller annen måte ikke fullt ut tilgjengelig.\n\n[\n### Manglende samsvar med lovkravene\n{<mangler>}\n]" },
            { id: "testing", title: "Hvordan vi har testet nettstedet", content: "{Vi har gjort en egenevaluering (intern testing) av {<nettsted>}./{<ekstern aktor>} har gjort en uavhengig revisjon av {<nettsted>}./Vi har anslått tilgjengeligheten uten testing.}\n\nSiste vurdering ble gjort den {<vurderingsdato>}.\n\n[Vurderingsmetode: {<metode>}]\n\nNettstedet ble publisert den {<publiseringsdato>}.\n\nErklæringen ble sist oppdatert den {<oppdateringsdato>}." }
        ]
    }
};


// Helper to format date "1 January 2023"
const formatDiggDate = (date: Date, locale: string) => {
    const localeMap: Record<string, string> = {
        sv: 'sv-SE',
        no: 'no-NO',
        nb: 'no-NO',
        da: 'da-DK',
        fi: 'fi-FI',
        nl: 'nl-NL',
        de: 'de-DE',
        fr: 'fr-FR',
        es: 'es-ES'
    };
    return date.toLocaleDateString(localeMap[locale] || 'en-US', {
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
    const supportedLocales: Record<string, keyof typeof TEMPLATES> = { sv: 'sv', no: 'no', nb: 'no' };
    const lang = supportedLocales[locale] ?? 'en';
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
        issuesContent = nonComplianceItems.map(item => `* ${item}`).join('\n');
    } else {
        issuesContent = lang === 'sv' ? 'Inga kända brister.' : (lang === 'no' ? 'Ingen kjente mangler.' : 'No known issues.');
    }
    replacements['{<brister>}'] = issuesContent;
    replacements['{<issues>}'] = issuesContent;
    replacements['{<mangler>}'] = issuesContent;

    // NO-specific mappings
    replacements['{<nettsted>}'] = organizationName;
    replacements['{<organisasjon>}'] = organizationName;
    replacements['{<svartid>}'] = responseTime || '';
    replacements['{<vurderingsdato>}'] = assessmentDate ? d(assessmentDate) : d(lastReviewDate);
    replacements['{<publiseringsdatum>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<ekstern aktor>}'] = generatorTool?.name || 'HolmDigital Engine';



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

        return text;
    };

    const renderSections = (sections: any[]) => {
        return sections.map((section, i) => {
            const content = renderTemplate(section.content);
            const trimmed = content.trim();
            if (!trimmed) return null;

            // Define icons based on section id or title
            let IconNode = null;
            if (section.id === 'how-accessible' || trimmed.includes('Hur tillgänglig') || trimmed.includes('How accessible') || trimmed.includes('Hvor tilgjengelig') || trimmed.includes('Hvor tilgængeligt') || trimmed.includes('Kuinka saavutettava') || trimmed.includes('Hoe toegankelijk') || trimmed.includes('Stand der Vereinbarkeit') || trimmed.includes('État de conformité') || trimmed.includes('Situación de cumplimiento')) {
                IconNode = <IconWrapper><EyeIcon /></IconWrapper>;
            } else if (section.id === 'what-to-do' || trimmed.includes('Vad kan du göra') || trimmed.includes('What to do') || trimmed.includes('Hva kan du gjøre') || trimmed.includes('Hvad kan du gøre') || trimmed.includes('Mitä voit tehdä') || trimmed.includes('Wat kunt u doen') || trimmed.includes('Nicht barrierefreie Inhalte') || trimmed.includes('Contenus non accessibles') || trimmed.includes('Contenido no accesible')) {
                IconNode = <IconWrapper><HelpCircleIcon /></IconWrapper>;
            } else if (section.id === 'reporting' || trimmed.includes('Rapporter brister') || trimmed.includes('Reporting accessibility') || trimmed.includes('Rapporter mangler') || trimmed.includes('Anna palautetta') || trimmed.includes('Meld toegankelijkheidsproblemen') || trimmed.includes('Feedback und Kontaktangaben') || trimmed.includes('Retour d\'information') || trimmed.includes('Mecanismo de comunicación')) {
                IconNode = <IconWrapper><AlertOctagonIcon /></IconWrapper>;
            } else if (section.id === 'enforcement' || trimmed.includes('Tillsyn') || trimmed.includes('Enforcement procedure') || trimmed.includes('Tilsyn') || trimmed.includes('Håndhævelsesprocedure') || trimmed.includes('Täytäntöönpanomenettely') || trimmed.includes('Handhavingsprocedure') || trimmed.includes('Durchsetzungsverfahren') || trimmed.includes('Voies de recours') || trimmed.includes('Procedimiento de aplicación')) {
                IconNode = <IconWrapper><GavelIcon /></IconWrapper>;
            } else if (section.id === 'technical' || trimmed.includes('Teknisk information') || trimmed.includes('Technical information')) {
                IconNode = <IconWrapper><CpuIcon /></IconWrapper>;
            } else if (section.id === 'testing' || trimmed.includes('Hur vi testat') || trimmed.includes('How we tested') || trimmed.includes('Hvordan vi har testet') || trimmed.includes('Kuinka olemme testanneet') || trimmed.includes('Hoe wij de website hebben getest') || trimmed.includes('Erstellung dieser Erklärung') || trimmed.includes('Établissement de cette déclaration') || trimmed.includes('Preparación de la presente declaración')) {
                IconNode = <IconWrapper><CheckCircleIcon /></IconWrapper>;
            }


            // Render section header
            const SectionHeader = (
                <h2 key={`h2-${i}`} style={styles.sectionTitle}>
                    {IconNode}
                    {section.title}
                </h2>
            );

            // Split content into paragraphs for better rendering
            const blocks = trimmed.split('\n\n').map((block, bi) => {
                const blockTrimmed = block.trim();
                if (!blockTrimmed) return null;

                if (blockTrimmed.startsWith('## ')) {
                    const title = blockTrimmed.replace('## ', '');
                    return (
                        <h2 key={`${i}-${bi}`} style={styles.sectionTitle}>
                            {title}
                        </h2>
                    );
                }
                if (blockTrimmed.startsWith('### ')) {
                    return <h3 key={`${i}-${bi}`} style={{ ...styles.sectionTitle, fontSize: '1.4rem' }}>{blockTrimmed.replace('### ', '')}</h3>;
                }

                // Handle lists
                if (blockTrimmed.includes('* ') || blockTrimmed.includes('• ')) {
                    const lines = blockTrimmed.split('\n');
                    return (
                        <ul key={`${i}-${bi}`} style={styles.list}>
                            {lines.map((line, li) => {
                                const cleanLine = line.trim().replace(/^[*-•]\s*/, '');
                                if (!cleanLine) return null;
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

                // Wrap contact info in cards
                const isCardSection = blockTrimmed.includes('e-post') || blockTrimmed.includes('email') || blockTrimmed.includes('ring ') || blockTrimmed.includes('call ');
                if (isCardSection) {
                    return <div key={`${i}-${bi}`} style={styles.card}>{blockTrimmed}</div>;
                }

                return <p key={`${i}-${bi}`} style={styles.paragraph}>{blockTrimmed}</p>;
            });

            return (
                <section key={i} style={styles.section}>
                    {SectionHeader}
                    {blocks}
                </section>
            );
        });
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
            marginBottom: '5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid #f8fafc'
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            marginRight: '2rem'
        },
        divider: {
            height: '2rem',
            width: '1px',
            backgroundColor: '#e2e8f0',
            marginRight: '2rem',
            display: 'block'
        },
        websiteContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
            color: '#64748b', // Slate 500
            fontWeight: 500,
            fontSize: '0.925rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '100px',
            border: '1px solid #f1f5f9'
        },
        container: {
            maxWidth: '1000px',
            margin: '4rem auto',
            padding: '6rem',
            backgroundColor: '#ffffff',
            borderRadius: '32px',
            boxShadow: '0 40px 100px -20px rgba(15, 23, 42, 0.08)',
            border: '1px solid #f1f5f9',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: '#1e293b', // Slate 800
            lineHeight: 1.8,
            fontSize: '1.125rem',
            position: 'relative',
            overflow: 'hidden'
        },
        mainHeading: {
            fontSize: '3.5rem',
            fontWeight: 800,
            color: '#0f172a', // Slate 900
            marginTop: '0',
            marginBottom: '1.5rem',
            letterSpacing: '-0.05em',
            lineHeight: 1.05
        },
        metaData: {
            color: '#64748b', // Slate 500
            fontSize: '0.925rem',
            marginBottom: '5rem',
            fontWeight: 500,
            display: 'flex',
            gap: '2rem',
            padding: '1.25rem 2rem',
            backgroundColor: '#f8fafc',
            borderRadius: '1rem',
            border: '1px solid #f1f5f9',
            width: 'fit-content'
        },
        section: {
            marginBottom: '6rem'
        },
        sectionTitle: {
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '2rem',
            marginTop: 0,
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        card: {
            padding: '2.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '1.5rem',
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        paragraph: {
            marginBottom: '1.75rem',
            maxWidth: '70ch',
            whiteSpace: 'pre-line',
            color: '#475569' // Slate 600
        },
        link: {
            color: '#0ea5e9', // Primary 500
            textDecoration: 'none',
            fontWeight: 600,
            borderBottom: '1.5px solid rgba(14, 165, 233, 0.2)',
            transition: 'all 0.2s',
            cursor: 'pointer'
        },
        list: {
            listStyleType: 'none',
            paddingLeft: 0,
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        listItem: {
            padding: '1.25rem 1.75rem 1.25rem 3.5rem',
            position: 'relative',
            backgroundColor: '#f8fafc',
            borderRadius: '1rem',
            border: '1px solid #f1f5f9',
            fontSize: '1rem',
            color: '#334155'
        },
        listBullet: {
            position: 'absolute',
            left: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '0.75rem',
            height: '0.75rem',
            borderRadius: '4px',
            backgroundColor: '#0ea5e9',
            opacity: 0.8
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.5rem 1.25rem',
            borderRadius: '100px',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: complianceLevel === 'full' ? '#f0fdf4' : complianceLevel === 'partial' ? '#fffbeb' : '#fef2f2',
            color: complianceLevel === 'full' ? '#166534' : complianceLevel === 'partial' ? '#92400e' : '#991b1b',
            border: `1px solid ${complianceLevel === 'full' ? '#dcfce7' : complianceLevel === 'partial' ? '#fef3c7' : '#fee2e2'}`,
            letterSpacing: '0.01em'
        },
        iconWrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #f1f5f9',
            color: '#0ea5e9'
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
                <header style={{ marginBottom: '4rem' }}>
                    <h1 id="a11y-statement-title" style={styles.mainHeading}>
                        {renderTemplate(template.title)}
                    </h1>

                    <div style={styles.metaData}>
                        <span>{lang === 'sv' ? 'Status:' : 'Status:'} <span style={styles.statusBadge}>
                            {complianceLevel === 'full' ? (lang === 'sv' ? 'Fullt förenlig' : 'Fully compliant') :
                                complianceLevel === 'partial' ? (lang === 'sv' ? 'Delvis förenlig' : 'Partially compliant') :
                                    (lang === 'sv' ? 'Ej förenlig' : 'Non-compliant')}
                        </span></span>
                        <span style={{ color: '#e2e8f0' }}>|</span>
                        <span>{lang === 'sv' ? 'Uppdaterad:' : 'Updated:'} {d(lastReviewDate)}</span>
                    </div>
                </header>

                <p style={{ ...styles.paragraph, fontSize: '1.25rem', color: '#1e293b', fontWeight: 500, marginBottom: '4rem' }}>
                    {renderTemplate(template.intro)}
                </p>
                {renderSections(template.sections)}
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
