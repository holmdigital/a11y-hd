import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AccessibilityStatement, AccessibilityStatementProps } from '@holmdigital/components';
import {
    Country,
    getEnforcementBody,
    getEnforcementStatementText,
    getNationalLaws,
    resolveNationalLawReference,
} from '@holmdigital/standards';
import { ScanResult } from '../core/regulatory-scanner';
import fs from 'fs/promises';
import path from 'path';
import { generateBadgeUrl } from './badge-generator';
import { violationsOf } from './needs-review';

/**
 * Metadata for organizational information in the accessibility statement
 */
export interface StatementMetadata {
    organizationName?: string;
    contactEmail?: string;
    phoneNumber?: string;
    responseTime?: string;
    country?: string;
    sector?: 'public' | 'private';
    publishDate?: string | Date;
    /**
     * How the assessment behind the statement was made. An explicit choice by the
     * caller, never derived from the scan result or the compliance level.
     *
     * - omitted or `'self-assessment'`: the organisation assessed its own website.
     *   This is the default, and a scan the customer runs is a self-assessment.
     * - `'external-review'`: an external party reviewed the website. Requires
     *   `reviewer`, and the statement names that reviewer.
     * - `'no-review'`: the accessibility was estimated without testing.
     */
    reviewMethod?: 'self-assessment' | 'external-review' | 'no-review';
    /**
     * Who performed the external review. Required when `reviewMethod` is
     * `'external-review'`: generating the statement throws without a non-empty
     * `name`. The statement names the reviewer by `name`; `url` is accepted for
     * the same shape as `generatorTool` and is not rendered. The footer still
     * credits the tool that generated the document, never the reviewer.
     */
    reviewer?: { name: string; url?: string };
}

/**
 * Locale lookup maps for multilingual statement generation.
 * Each map covers all 9 EU locales: sv, en, no, fi, da, de, fr, es, nl.
 */
const EVALUATION_METHOD: Record<string, string> = {
    sv: 'Automatiserad granskning via @holmdigital/engine',
    en: 'Automated scan via @holmdigital/engine',
    no: 'Automatisert gjennomgang via @holmdigital/engine',
    nb: 'Automatisert gjennomgang via @holmdigital/engine',
    fi: 'Automaattinen tarkistus @holmdigital/engine-työkalulla',
    da: 'Automatiseret gennemgang via @holmdigital/engine',
    de: 'Automatisierte Prüfung mit @holmdigital/engine',
    fr: 'Analyse automatisée via @holmdigital/engine',
    es: 'Análisis automatizado mediante @holmdigital/engine',
    nl: 'Geautomatiseerde controle via @holmdigital/engine',
    it: 'Scansione automatizzata tramite @holmdigital/engine',
    pt: 'Verificação automatizada via @holmdigital/engine',
    pl: 'Automatyczne skanowanie za pomocą @holmdigital/engine',
    'en-gb': 'Automated scan via @holmdigital/engine',
    'en-us': 'Automated scan via @holmdigital/engine',
    'en-ca': 'Automated scan via @holmdigital/engine',
    'en-au': 'Automated scan via @holmdigital/engine',
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
    sv: { full: 'Fullt ut förenlig', partial: 'Delvis förenlig', 'non-compliant': 'Inte förenlig' },
    en: { full: 'Fully compliant', partial: 'Partially compliant', 'non-compliant': 'Non-compliant' },
    no: { full: 'Helt i samsvar', partial: 'Delvis i samsvar', 'non-compliant': 'Ikke i samsvar' },
    nb: { full: 'Helt i samsvar', partial: 'Delvis i samsvar', 'non-compliant': 'Ikke i samsvar' },
    fi: { full: 'Täysin saavutettava', partial: 'Osittain saavutettava', 'non-compliant': 'Ei saavutettava' },
    da: { full: 'Fuldt ud i overensstemmelse', partial: 'Delvist i overensstemmelse', 'non-compliant': 'Ikke i overensstemmelse' },
    de: { full: 'Vollständig konform', partial: 'Teilweise konform', 'non-compliant': 'Nicht konform' },
    fr: { full: 'Totalement conforme', partial: 'Partiellement conforme', 'non-compliant': 'Non conforme' },
    es: { full: 'Plenamente conforme', partial: 'Parcialmente conforme', 'non-compliant': 'No conforme' },
    nl: { full: 'Volledig conform', partial: 'Gedeeltelijk conform', 'non-compliant': 'Niet conform' },
    it: { full: 'Pienamente conforme', partial: 'Parzialmente conforme', 'non-compliant': 'Non conforme' },
    pt: { full: 'Totalmente conforme', partial: 'Parcialmente conforme', 'non-compliant': 'Não conforme' },
    pl: { full: 'W pełni zgodny', partial: 'Częściowo zgodny', 'non-compliant': 'Niezgodny' },
    'en-gb': { full: 'Fully compliant', partial: 'Partially compliant', 'non-compliant': 'Non-compliant' },
    'en-us': { full: 'Fully compliant', partial: 'Partially compliant', 'non-compliant': 'Non-compliant' },
    'en-ca': { full: 'Fully compliant', partial: 'Partially compliant', 'non-compliant': 'Non-compliant' },
    'en-au': { full: 'Fully compliant', partial: 'Partially compliant', 'non-compliant': 'Non-compliant' },
};

const RESPONSE_TIME_DEFAULT: Record<string, string> = {
    sv: '2 dagar',
    en: '2 days',
    no: '2 dager',
    nb: '2 dager',
    fi: '2 päivää',
    da: '2 dage',
    de: '2 Tage',
    fr: '2 jours',
    es: '2 días',
    nl: '2 dagen',
    it: '2 giorni',
    pt: '2 dias',
    pl: '2 dni',
    'en-gb': '2 days',
    'en-us': '2 days',
    'en-ca': '2 days',
    'en-au': '2 days',
};

/**
 * Generates an HTML or Markdown Accessibility Statement from scan results
 */
interface StatementTemplate {
    title: string;
    intro: string;
    /**
     * `sectors`: rendera avsnittet bara för de här sektorerna. Saknas fältet
     * gäller avsnittet båda. Intern #94 fråga 4: AU-mallens avsnitt om
     * regeringens digitalpolicy beskriver en policy för federala myndigheter,
     * och är sakligt fel i ett utlåtande från ett privat företag.
     */
    sections: Array<{ id?: string; title?: string; content: string; sectors?: Array<'public' | 'private'> }>;
}

/**
 * Lagreferensen i utlåtandets "uppfyller …"-mening, för land och sektor.
 *
 * Intern #82: lagvalet och fallback-fraserna bor i @holmdigital/standards, och
 * både motorn och komponenten använder samma funktion. Två kopior av samma
 * logik har glidit isär en gång redan (Intern #63/#66), och lagnamnsgrinden
 * hade annars behövt byggas och hållas lika på två ställen. Funktionen
 * återexporteras här så att motorns publika API är oförändrat.
 */
export { resolveNationalLawReference };

/**
 * Intern #95: platshållarna för den externa part som granskat webbplatsen. De
 * står bara i metodvalets andra alternativ ("<granskaren> har granskat …").
 *
 * Listan täcker båda mallsatserna, motorns JSON och komponentens TEMPLATES, och
 * komponenten bär samma lista. Platsen fylls ur `reviewer` och ALDRIG ur
 * `generatorTool`: det är verktyget som skrev dokumentet, och när det namnet
 * hamnade här påstod varje delvis förenlig kunds utlåtande att HolmDigital
 * Regulatory Engine gjort en oberoende granskning (#91).
 */
const REVIEWER_PLACEHOLDERS = [
    '{<extern aktör>}', '{<ekstern aktør>}', '{<ekstern aktor>}', '{<ulkoinen taho>}',
    '{<externe partij>}', '{<externer Dritter>}', '{<tiers externe>}', '{<tercero externo>}',
    '{<terza parte>}', '{<terceiro externo>}', '{<podmiot zewnętrzny>}', '{<third party>}',
];

/**
 * Juno H3/H4 (2026-10-08): the generic Swedish "enforcement" section in
 * sv.json is written for DOS-lagen (public sector, WAD) and is wrong for the
 * private sector in two ways documented against primary source:
 *
 * 1. "oskäligt betungande", "tillgänglighetsredogörelse" and "begäran om
 *    tillgängliggörande" are DOS-lagen concepts (10-12 §§). They get zero
 *    hits in lagen (2023:254) or förordningen (2023:676), so rendering them
 *    for a private customer claims DOS-lagen rights that law does not give.
 * 2. It names PTS as though it were the sole supervisor. PTS is the market
 *    surveillance authority and coordinator; actual tillsyn is split by
 *    service type across five authorities (förordning (2023:676) 28-31 §§),
 *    and PTS is itself also the sector authority for three of them — a
 *    four-row list that omits PTS's own row makes it look like PTS has no
 *    service-level responsibility at all (Juno B3, Intern #128, 2026-10-20).
 *
 * Public-sector DOS-lagen wording is correct and kept as-is, with the link to
 * Digg's own anmälan procedure added (MDFFS 2019:2 6 § requires "en länk till
 * det förfarande för anmälningar som myndigheten tillhandahåller").
 *
 * Private-sector wording (Karin's own, Intern#94 fråga 2 alternativ (a),
 * Intern#83) is not here: it lives on the law record,
 * `lptt.enforcement.statementText.sv`, and is read through
 * getEnforcementStatementText() so it passes the law-name gate (Intern #82).
 * This function only handles the public sector.
 *
 * Scoped to SE only — no other country's enforcement template has been
 * reviewed for the same defect, and this must not change their output.
 */
function resolveSwedishEnforcementContent(
    enforcementBody: string,
    nationalLaw: string
): string {
    return `${enforcementBody} har ansvaret för tillsyn över ${nationalLaw}. Du kan anmäla till ${enforcementBody} om du tycker att vår digitala service har brister i tillgänglighet.\n\nDu kan också anmäla till ${enforcementBody} om du tycker att vår bedömning av vad som är oskäligt betungande ska granskas, om du tycker att vår tillgänglighetsredogörelse har brister eller om du tycker att vi inte har hanterat din begäran om tillgängliggörande korrekt.\n\nDu kan anmäla direkt till Digg via tjänsten för anmälan om bristande tillgänglighet: https://www.digg.se/tdosanmalan`;
}

export async function generateStatementContent(
    result: ScanResult,
    lang: string = 'en',
    format: 'html' | 'md' | 'markdown' = 'html',
    metadata?: StatementMetadata
): Promise<string> {
    // Intern #95: en extern granskning måste säga vem som granskade. Utan ett
    // namn finns inget sant att skriva i granskarens plats, och det var just där
    // verktygets eget namn hamnade före #91. Därför ett fel och ingen default.
    const reviewMethod = metadata?.reviewMethod;
    const reviewerName = typeof metadata?.reviewer?.name === 'string' ? metadata.reviewer.name.trim() : '';
    if (reviewMethod === 'external-review' && reviewerName === '') {
        throw new Error(
            "reviewMethod 'external-review' requires metadata.reviewer with a non-empty name: the organisation " +
            "that performed the review, e.g. { reviewMethod: 'external-review', reviewer: { name: 'Example Audit AB' } }. " +
            "The statement names it as the reviewer. Use 'self-assessment' (the default) if the statement is based " +
            'on your own testing, such as this scan.'
        );
    }

    // 0. Load Template
    const templatePath = path.join(__dirname, 'templates', `${lang}.json`);
    let template: StatementTemplate;
    try {
        const data = await fs.readFile(templatePath, 'utf-8');
        template = JSON.parse(data) as StatementTemplate;
    } catch {
        throw new Error(
            `Accessibility statement template not found for locale "${lang}". ` +
            `Expected file at: ${templatePath}`
        );
    }

    // 1. Determine compliance level.
    //
    // Juno H1 (2026-10-08): genomförandebeslut (EU) 2018/1523 fotnot iii kräver
    // att samtliga krav i standarden, UNDANTAGSLÖST, är uppfyllda för "helt
    // förenlig"; fotnot viii kräver att DE FLESTA kraven INTE är uppfyllda för
    // "inte förenlig". En automatiserad skanning kan aldrig ensam styrka något
    // av ytterlägena: den täcker inte alla krav (kan därför aldrig bevisa
    // "helt"), och `eaaDeadlineViolations` räknade tidigare varje fynd med ett
    // EAA-deadline-taggat lagrum — inklusive enstaka low/best-practice-fynd —
    // som grund för "inte förenlig", vilket satte den statusen på en bråkdel av
    // kraven i stället för "de flesta". Statusen sätts därför alltid till
    // "delvis förenlig" från en ren skanning; "helt" och "inte förenlig" kräver
    // en människas manuella granskning och kan inte komma ur den här funktionen.
    // Cast, not an annotated const: an annotated `const x: Union = 'partial'` still gets
    // narrowed by control flow to the literal `'partial'`, which makes the `=== 'full'` /
    // `=== 'non-compliant'` checks below fail to typecheck (TS2367, no overlap) even though
    // they guard real behavior for callers that branch on this value.
    const complianceLevel = 'partial' as AccessibilityStatementProps['complianceLevel'];

    // 2. Extract known issues (non-compliant items).
    // Needs review (cantTell) exkluderas: de är inte bekräftade brister och får
    // aldrig listas som non-compliance i en juridisk redogörelse (Intern #12).
    const issuesMap = new Map<string, string>();
    violationsOf(result.reports).forEach(report => {
        if (!issuesMap.has(report.ruleId)) {
            // Updated to handle simple string if that's what report.wcagCriteria is
            const issueText = `${report.ruleId} (${report.wcagCriteria})`;
            issuesMap.set(report.ruleId, issueText);
        }
    });

    const nonComplianceItems = Array.from(issuesMap.values());

    // 3. Determine Country/Sector
    let country: Country = 'EU'; // default fallback
    if (metadata?.country) {
        country = metadata.country as Country;
    } else {
        const TLD_MAP: Record<string, Country> = {
            'se': 'SE', 'no': 'NO', 'dk': 'DK', 'fi': 'FI',
            'de': 'DE', 'fr': 'FR', 'nl': 'NL', 'es': 'ES', 'it': 'IT',
            'pt': 'PT', 'pl': 'PL',
            'uk': 'GB', 'us': 'US', 'ca': 'CA', 'au': 'AU',
        };
        // Proper TLD parse: split URL hostname by '.', take last segment
        try {
            const hostname = new URL(result.url).hostname;
            const tld = hostname.split('.').pop()?.toLowerCase() || '';
            country = TLD_MAP[tld] ?? 'EU';
        } catch {
            country = 'EU';
        }
    }

    const sector: 'public' | 'private' = metadata?.sector || 'public';

    // 4. Load Logo (Base64)
    let logoUrl: string | undefined;
    try {

        // Check if file exists in src structure (dev) or dist structure (prod)
        // In dist, assets might be copied or we assume src/assets is available relative to running script?
        // Actually, for simplicity in this task, let's assume we read from the source location or handle error.
        // A robust way for build is to have assets copied to dist.
        // For now, let's look in the known location.
        // NOTE: __dirname in ES modules / compiled code can be tricky.
        // Using fixed path relative to project for now since we are in dev/validation mode.
        // In production, we'd bundle this.
        const possiblePaths = [

            path.join(process.cwd(), 'src/assets/logo.jpg'), // run from package root
            path.join(process.cwd(), 'packages/engine/src/assets/logo.jpg') // run from monorepo root
        ];

        for (const p of possiblePaths) {
            try {
                const logoBuffer = await fs.readFile(p);
                logoUrl = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
                break;
            } catch {
                // Ignore and try next
            }
        }
    } catch (e) {
        console.warn('Could not load logo.jpg', e);
    }

    // 5. Prepare Props
    const props: AccessibilityStatementProps = {
        country,
        sector,
        organizationName: metadata?.organizationName || new URL(result.url).hostname.replace(/^www\./, ''),
        websiteUrl: result.url,
        complianceLevel,
        lastReviewDate: new Date(),
        assessmentDate: new Date(),
        evaluationMethod: EVALUATION_METHOD[lang] || EVALUATION_METHOD['en'],
        generatorTool: {
            name: 'HolmDigital Regulatory Engine',
            url: 'https://holmdigital.se'
        },
        // Intern #95: HTML-utlåtandet renderas av komponenten, så metodvalet och
        // granskaren måste följa med dit. Annars gäller valet bara Markdown.
        reviewMethod,
        reviewer: metadata?.reviewer,
        logoUrl,
        // Placeholders make it obvious the consumer must supply real contact info.
        // Previous fallback leaked HolmDigital's own contact details into customer statements.
        contactEmail: metadata?.contactEmail || '[YOUR EMAIL]',
        phoneNumber: metadata?.phoneNumber || '[YOUR PHONE]',
        responseTime: metadata?.responseTime || RESPONSE_TIME_DEFAULT[lang] || RESPONSE_TIME_DEFAULT['en'],
        nonComplianceItems,
        locale: lang,
        badgeUrl: generateBadgeUrl(result.score) || undefined,
        publishDate: metadata?.publishDate ? new Date(metadata.publishDate) : undefined
    };

    let content = '';

    if (format === 'html') {
        const element = React.createElement(AccessibilityStatement, props);
        const markup = renderToStaticMarkup(element);
        content = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Statement - ${props.organizationName}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8f9fa; padding: 2rem; margin: 0; }
    </style>
</head>
<body>
    ${markup}
</body>
</html>`;
    } else {
        // MARKDOWN GENERATION (DIGG-compatible structure)
        const dateStr = props.lastReviewDate.toISOString().split('T')[0];
        const labels = STATUS_LABELS[lang] || STATUS_LABELS['en'];
        const statusMap: Record<string, string> = {
            'full': labels['full'],
            'partial': labels['partial'],
            'non-compliant': labels['non-compliant'],
        };

        const substitutions: Record<string, string> = {
            statusString: statusMap[complianceLevel],

            '{<webbplats>}': props.organizationName,
            '{<website>}': props.organizationName,
            '{<nettsted>}': props.organizationName,
            '{<organisation>}': props.organizationName,
            '{<organisasjon>}': props.organizationName,
            '{<e-postadress>}': props.contactEmail || '',
            '{<e-mailosoite>}': props.contactEmail || '',
            '{<e-mailadresse>}': props.contactEmail || '',
            '{<e-mailadres>}': props.contactEmail || '',
            '{<e-postadresse>}': props.contactEmail || '',
            '{<e-mail address>}': props.contactEmail || '',
            '{<email address>}': props.contactEmail || '',
            '{<telefonnummer>}': props.phoneNumber || '',
            '{<puhelinnumero>}': props.phoneNumber || '',
            '{<telefoonnummer>}': props.phoneNumber || '',
            '{<telephone number>}': props.phoneNumber || '',
            '{<svarstid>}': props.responseTime || '',
            '{<svartid>}': props.responseTime || '',
            '{<response time>}': props.responseTime || '',
            '{<bedömningsdatum>}': dateStr,
            '{<vurderingsdato>}': dateStr,
            '{<arviointipäivä>}': dateStr,
            '{<beoordelingsdatum>}': dateStr,
            '{<bewertungsdatum>}': dateStr,
            '{<date_evaluation>}': dateStr,
            '{<fecha_evaluacion>}': dateStr,
            '{<assessment date>}': dateStr,
            '{<uppdateringsdatum>}': dateStr,
            '{<oppdateringsdato>}': dateStr,
            '{<opdateringsdato>}': dateStr,
            '{<päivityspäivä>}': dateStr,
            '{<updatedatum>}': dateStr,
            '{<aktualisierungsdatum>}': dateStr,
            '{<date_mise_a_jour>}': dateStr,
            '{<fecha_actualizacion>}': dateStr,
            '{<update date>}': dateStr,
            '{<publiceringsdatum>}': props.publishDate?.toISOString().split('T')[0] || '2024-01-01',
            '{<publiseringsdato>}': props.publishDate?.toISOString().split('T')[0] || '2024-01-01',
            '{<julkaisupäivä>}': props.publishDate?.toISOString().split('T')[0] || '2024-01-01',
            '{<publicatiedatum>}': props.publishDate?.toISOString().split('T')[0] || '2024-01-01',
            '{<veröffentlichungsdatum>}': props.publishDate?.toISOString().split('T')[0] || '2024-01-01',
            '{<date_publication>}': props.publishDate?.toISOString().split('T')[0] || '2024-01-01',
            '{<fecha_publicacion>}': props.publishDate?.toISOString().split('T')[0] || '2024-01-01',
            '{<offentliggørelsesdato>}': props.publishDate?.toISOString().split('T')[0] || '2024-01-01',
            '{<publish date>}': props.publishDate?.toISOString().split('T')[0] || '2024-01-01',
            '{<metod>}': props.evaluationMethod || 'Automated Scan',
            '{<metodi>}': props.evaluationMethod || 'Automated Scan',
            '{<methode>}': props.evaluationMethod || 'Automated Scan',
            '{<metode>}': props.evaluationMethod || 'Automated Scan',
            '{<metodo>}': props.evaluationMethod || 'Automated Scan',
            '{<méthode>}': props.evaluationMethod || 'Automated Scan',
            '{<método>}': props.evaluationMethod || 'Automated Scan',
            '{<method>}': props.evaluationMethod || 'Automated Scan',
            // Intern #95: granskarens plats fylls bara ur reviewer, aldrig ur
            // generatorTool. Den renderas bara när metodvalet är en uttalad
            // extern granskning, och då är namnet kontrollerat ovan.
            ...Object.fromEntries(REVIEWER_PLACEHOLDERS.map(p => [p, reviewerName])),
            '{<enforcement_body>}': (() => {
                // US: statements for our customers are primarily about state/local gov (Title II)
                // or private sector (Title III) — both enforced by DOJ. Override the default
                // GSA-returning lookup (which targets federal Section 508).
                if (country === 'US') {
                    // Intern #64 (M4): inForce-filtret gäller även här — myndighetsnamnet
                    // hämtas ur en lagpost, och en lag som inte trätt i kraft får inte
                    // peka ut tillsynen för något som gäller i dag.
                    // Intern #63: `enforcement` är valfritt sedan standards 4.0.0 —
                    // Spaniens tillsyn är regional och Danmarks obelagd. Saknas den
                    // faller vi till getEnforcementBody i stället för att rendera
                    // ett tomt myndighetsnamn i kundtext.
                    const adaLaw = getNationalLaws('US').find(l => l.euFramework === 'ADA' && l.scope === sector && l.inForce !== false);
                    if (adaLaw?.enforcement) return adaLaw.enforcement.authorityName;
                }
                return getEnforcementBody(country, sector);
            })(),
            '{<national_law>}': resolveNationalLawReference(country, sector, lang),
            '{<ahrc_url>}': 'https://www.humanrights.gov.au/complaints',
            '{<brister>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'sv' ? 'Inga kända brister.' : 'No known issues.'),
            '{<puutteet>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'fi' ? 'Ei tiedossa olevia puutteita.' : 'No known issues.'),
            '{<gebreken>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'nl' ? 'Geen bekende gebreken.' : 'No known issues.'),
            '{<mängel>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'de' ? 'Keine bekannten Mängel.' : 'No known issues.'),
            '{<défauts>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'fr' ? 'Aucun défaut connu.' : 'No known issues.'),
            '{<deficiencias>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'es' ? 'No hay deficiencias conocidas.' : 'No known issues.'),
            '{<mangler>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'no' || lang === 'da' ? 'Ingen kendte mangler.' : 'No known issues.'),
            '{<carenze>}':    nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : 'Nessuna carenza nota.',
            '{<deficiências>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : 'Nenhuma deficiência conhecida.',
            '{<braki>}':      nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : 'Brak znanych problemów.',
            '{<issues>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : 'No known issues.'
        };


        /**
         * Vilket alternativ ett valblock `{A / B / C}` ska ge.
         *
         * Mallarna har två SORTERS val, och de fick tidigare samma svar.
         * Efterlevnadsvalet följer kundens utfall. Metodvalet i sektionen
         * `testing` (självskattning / extern granskning / uppskattning utan
         * granskning) beskriver hur utlåtandet togs fram, och det beror inte
         * på utfallet. Med samma index skrev varje delvis förenlig kund
         * "<verktyget> har gjort en oberoende granskning" och varje ej förenlig
         * kund "vi har uppskattat tillgängligheten utan granskning", båda
         * falska. Ett verktyg som kunden själv kör är en självskattning.
         *
         * Intern #95: metodvalet följer anroparens uttalade `reviewMethod` och
         * ingenting annat. Utan val blir det självskattning, som förut. Den
         * externa granskningen kräver en namngiven granskare, och utfallet
         * läses fortfarande aldrig här.
         */
        const choiceIndex = (kind: 'compliance' | 'method', parts: number): number => {
            if (kind === 'method') {
                if (reviewMethod === 'external-review') return 1;
                if (reviewMethod === 'no-review') return parts > 2 ? 2 : 1;
                return 0;
            }
            if (complianceLevel === 'partial') return 1;
            if (complianceLevel === 'non-compliant') return parts > 2 ? 2 : 1;
            return 0;
        };

        const processText = (text: string, kind: 'compliance' | 'method' = 'compliance') => {
            let processed = text;
            // Handle Conditionals [ ... ]
            processed = processed.replace(/\[([\s\S]*?)\]/g, (_match, content) => {
                if (content.includes('{<svarstid>}') || content.includes('{<svartid>}') || content.includes('{<response time>}')) {
                    return props.responseTime ? content : '';
                }
                if (content.includes('{<telefonnummer>}') || content.includes('{<telephone number>}')) {
                    return props.phoneNumber ? content : '';
                }
                if (content.includes('{<brister>}') || content.includes('{<mangler>}') || content.includes('{<issues>}') ||
                    content.includes('{<carenze>}') || content.includes('{<deficiências>}') || content.includes('{<braki>}')) {
                    return complianceLevel !== 'full' ? content : '';
                }
                return content;
            });

            // Platshållarna blir markörer INNAN valen löses, och får sina värden
            // efteråt. Annars delas ett värde som innehåller "/" av valparsern:
            // "Real Decreto 1112/2018" klipptes vid snedstrecket, och för en
            // delvis förenlig kund blev meningen ett fragment av lagnamnet.
            // Markören är ett tecken ur Unicodes privata område: varken "/",
            // klamrar eller ett styrtecken, och förekommer inte i någon text.
            const values: string[] = [];
            processed = processed.replace(/\{<[^>]+>\}/g, (match) => {
                values.push(substitutions[match] !== undefined ? substitutions[match] : match);
                return `\uE000${values.length - 1}\uE000`;
            });

            // Handle Choices { A / B / C }
            processed = processed.replace(/\{([^{}]*?)\}/g, (_match, content) => {
                const parts = content.split('/');
                if (parts.length >= 2) {
                    return parts[choiceIndex(kind, parts.length)].trim();
                }
                return _match;
            });

            return processed.replace(/\uE000(\d+)\uE000/g, (_m, i) => values[Number(i)]);
        };

        const title = processText(template.title);
        const intro = processText(template.intro);
        // Tillsynsmyndigheten (kan vara tom, t.ex. privat norsk sektor — .eaa = '').
        const enforcementBody = String(substitutions['{<enforcement_body>}'] ?? '').trim();
        const sections = template.sections
            .map(s => {
                // Intern #23: utelämna hela Tilsyn-sektionen när det inte finns någon
                // tillsynsmyndighet. Annars renderas tomma hål (" har ansvaret …") och
                // sektionen antyder en redogörelseplikt en privat aktör inte har.
                if (s.id === 'enforcement' && enforcementBody === '') return null;
                if (s.sectors && !s.sectors.includes(sector)) return null;
                // Intern #83 och #94 fråga 2: där tillsynen är delad efter
                // tjänstetyp bär lagposten avsnittets text. Mallen kan bara
                // namnge en myndighet, och det vore fel för en del kunder.
                // Juno H3/H4: svensk offentlig sektor får DOS-lagens text med
                // Digg-länken, se resolveSwedishEnforcementContent() ovan.
                const delad = s.id === 'enforcement' ? getEnforcementStatementText(country, sector, lang) : null;
                const body = (delad
                    ?? (s.id === 'enforcement' && country === 'SE' && lang === 'sv' && sector === 'public'
                        ? resolveSwedishEnforcementContent(enforcementBody, substitutions['{<national_law>}'] ?? '')
                        : processText(s.content, s.id === 'testing' ? 'method' : 'compliance'))).trim();
                if (body === '') return null;                 // hoppa sektioner som blir tomma
                // Intern #23: en section utan titel får aldrig rendera "## undefined".
                return s.title ? `## ${s.title}\n\n${body}` : body;
            })
            .filter((x): x is string => x !== null)
            .join('\n\n');

        content = `# ${title}\n\n${intro}\n\n${sections}\n\n---\nGenerated using [${props.generatorTool?.name || 'HolmDigital Engine'}](${props.generatorTool?.url || 'https://holmdigital.se'})`;
    }


    // 5. Write to file
    return content;
}

/**
 * Generates an HTML or Markdown Accessibility Statement to file
 */
export async function generateStatement(
    result: ScanResult,
    outputPath: string,
    lang: string = 'en',
    format: 'html' | 'md' | 'markdown' = 'html',
    metadata?: StatementMetadata
): Promise<void> {
    const content = await generateStatementContent(result, lang, format, metadata);

    // Write to file
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(outputPath, content, 'utf-8');
}
