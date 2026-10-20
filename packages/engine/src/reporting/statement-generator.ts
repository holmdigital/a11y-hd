import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AccessibilityStatement, AccessibilityStatementProps } from '@holmdigital/components';
import { Country, getEnforcementBody, getNationalLawForSector, getNationalLaws, getSectorAuthorities } from '@holmdigital/standards';
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
    sections: Array<{ id?: string; title?: string; content: string }>;
}

/**
 * Language-keyed fallback for the national-law slot when the data has no naming law.
 * Intern #31: a statement must NEVER render an empty law reference. When a country has
 * no matching national law (e.g. an EAA transposition not yet in the data, or a country
 * that legitimately has no EAA post), the "complies with …" sentence is reworded to be
 * true WITHOUT naming a law — never by inventing one and never by claiming an EU
 * directive is a country's national law. Naming the real law is #32 (Juno's wording).
 */
const NATIONAL_LAW_FALLBACK: Record<string, string> = {
    en: 'applicable accessibility requirements',
    sv: 'gällande tillgänglighetskrav',
    no: 'gjeldende tilgjengelighetskrav',
    da: 'gældende tilgængelighedskrav',
    fi: 'sovellettavat saavutettavuusvaatimukset',
    de: 'die geltenden Barrierefreiheitsanforderungen',
    nl: 'de geldende toegankelijkheidseisen',
    fr: "la réglementation d'accessibilité applicable",
    es: 'los requisitos de accesibilidad aplicables',
    it: 'i requisiti di accessibilità applicabili',
    pt: 'os requisitos de acessibilidade aplicáveis',
    pl: 'obowiązujące wymagania dostępności',
};

/**
 * Resolve the human-readable national-law reference used in a statement's
 * "complies with …" sentence. Kept separate so it can be tested across every
 * country × sector (Intern #31). Never returns an empty string.
 */
export function resolveNationalLawReference(
    country: Country,
    sector: 'public' | 'private',
    lang: string = 'en'
): string {
    // Intern #64 (M4): a statute that has not entered into force must never be
    // rendered as current law. `inForce` was declared in the type and read
    // nowhere, so `us-hhs-section-504` (effective 2027-05-11) was named as
    // binding law to US private-sector customers today.
    const inForce = <T extends { inForce?: boolean }>(law: T | undefined | null): law is T =>
        !!law && law.inForce !== false;

    if (country === 'AU') {
        // AU keeps its own branch, and Juno ratified that 2026-09-11 (Intern
        // #63) after reading both sources in full: the Disability
        // Discrimination Act is the only legally binding instrument for
        // Australia, public sector and private alike, and the Digital Access
        // Standard (au-dta) is an internal Commonwealth policy with no
        // third-party standing and no sanction beyond reporting to the DTA.
        // Routing AU through the sector selector would silently switch the
        // public track to au-dta, because that selector prefers an exact scope
        // match and au-dta is scope 'public' while au-dda is 'both'.
        // au-dta now carries euFramework 'DAS', so this lookup is unambiguous
        // rather than dependent on the order of the JSON array.
        const ddaLaw = getNationalLaws('AU').find(l => l.euFramework === 'DDA' && inForce(l));
        return ddaLaw ? `${ddaLaw.fullName}` : 'Disability Discrimination Act 1992 (Cth)';
    }
    if (country === 'US') {
        // US carries several parallel federal statutes rather than one, so it
        // keeps a dedicated branch: ADA split by scope, plus Section 508 on the
        // public side and HHS Section 504 on the private side. The `inForce`
        // filter is what removes Section 504 until 2027.
        const usLaws = getNationalLaws('US').filter(inForce);
        const adaLaw = usLaws.find(l => l.euFramework === 'ADA' && l.scope === sector);
        if (adaLaw) {
            if (sector === 'public') {
                const s508 = usLaws.find(l => l.id === 'us-508');
                return s508
                    ? `${adaLaw.fullName} (${adaLaw.law}) & ${s508.fullName} (${s508.law})`
                    : `${adaLaw.fullName} (${adaLaw.law})`;
            }
            const hhs504 = usLaws.find(l => l.euFramework === 'REHAB' && l.scope === 'private');
            return hhs504
                ? `${adaLaw.fullName} (${adaLaw.law}) & ${hhs504.fullName} (${hhs504.law})`
                : `${adaLaw.fullName} (${adaLaw.law})`;
        }
    }
    // Intern #64 (M1): country + scope + inForce, never `euFramework`. The old
    // lookup asked for EAA on the private track, so a law with scope 'both'
    // whose framework was not EAA became invisible — Norway's forskrift and
    // Canada's ACA both fell through to a lawless fallback phrase. It also made
    // a province's statute the country's answer for Canada.
    const law = getNationalLawForSector(country, sector);
    if (law) {
        // Intern #63/#66: parentesen finns för att ge kortnamnet vid sidan av det
        // långa. När fälten säger samma sak är den bara brus, och efter
        // attesteringen gör de det för två poster: dk-eaa bär titeln i båda
        // fälten, och ca-aca:s fullName är korttiteln plus lagrumsreferens.
        // Utan den här grenen renderades titeln två gånger i rad i ett danskt
        // kunddokument, och det syntes inte i någon datadiff.
        const shortName = law.law.trim();
        const longName = law.fullName.trim();
        // Regeln är: parentesen faller när kortnamnet är ett PREFIX av det långa,
        // för då bär den ingen ny information. Det täcker fler fall än de två som
        // upptäcktes först: pt-eaa hade kortnamnet plus " de 6 de dezembro", och
        // dk-wad har en förkortning som är ett rent prefix. DOS-lagen och DL
        // 83/2018 är inga prefix och står därför kvar, vilket är hela poängen.
        const redundant = longName === shortName || longName.startsWith(shortName);
        return redundant ? longName : `${longName} (${shortName})`;
    }
    // Intern #31: never empty — reword the sentence to be true without a law name.
    const langKey = lang.split('-')[0];
    return NATIONAL_LAW_FALLBACK[langKey] ?? NATIONAL_LAW_FALLBACK.en;
}

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
 *    service type across five authorities (förordning (2023:676) 28-31 §§).
 *
 * Public-sector DOS-lagen wording is correct and kept as-is, with the link to
 * Digg's own anmälan procedure added (MDFFS 2019:2 6 § requires "en länk till
 * det förfarande för anmälningar som myndigheten tillhandahåller").
 *
 * Scoped to SE only — no other country's enforcement template has been
 * reviewed for the same defect, and this must not change their output.
 */
function resolveSwedishEnforcementContent(
    sector: 'public' | 'private',
    enforcementBody: string,
    nationalLaw: string
): string {
    if (sector === 'private') {
        const authorities = getSectorAuthorities('SE');
        const list = authorities.map(a => `* ${a.authority}: ${a.responsibility}`).join('\n');
        return `${enforcementBody} är en av flera tillsynsmyndigheter för ${nationalLaw}. PTS är marknadskontrollmyndighet och samordnare; tillsynen i övrigt är delad utifrån vilken typ av tjänst det gäller:\n\n${list}\n\nOm du tycker att vi inte uppfyller lagens krav kan du anmäla det till den myndighet som ansvarar för den typen av tjänst.`;
    }
    return `${enforcementBody} har ansvaret för tillsyn över ${nationalLaw}. Du kan anmäla till ${enforcementBody} om du tycker att vår digitala service har brister i tillgänglighet.\n\nDu kan också anmäla till ${enforcementBody} om du tycker att vår bedömning av vad som är oskäligt betungande ska granskas, om du tycker att vår tillgänglighetsredogörelse har brister eller om du tycker att vi inte har hanterat din begäran om tillgängliggörande korrekt.\n\nDu kan anmäla direkt till Digg via tjänsten för anmälan om bristande tillgänglighet: https://www.digg.se/tdosanmalan`;
}

export async function generateStatementContent(
    result: ScanResult,
    lang: string = 'en',
    format: 'html' | 'md' | 'markdown' = 'html',
    metadata?: StatementMetadata
): Promise<string> {
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
            '{<extern aktör>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<ekstern aktør>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<ekstern aktor>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<ulkoinen taho>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<externe partij>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<externer Dritter>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<tiers externe>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<tercero externo>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<third party>}': props.generatorTool?.name || 'HolmDigital Engine',
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


        const processText = (text: string, sectionId?: string) => {
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

            // Substitute {<placeholder>} patterns first (before choice resolution).
            //
            // A substituted value can itself contain a literal "/" — EU law
            // citations are routinely written "nr/år" (FI: "(306/2019)", DK:
            // "08/06/2018") and SE's private-sector law carries "Tillgänglighets-
            // lagen / LPTT". The choice step below splits on "/", so an
            // unprotected value collided with the template's own delimiter and
            // corrupted the "is this site compliant" sentence for every country
            // whose national-law text contains one — found verifying the H3 fix
            // (2026-10-08), pre-existing and unrelated to it. Slashes coming from
            // substituted values are parked behind a sentinel here and restored
            // after the choice step runs, so only the template's OWN delimiters
            // are ever split on.
            const SLASH_SENTINEL = '\u0000SLASH\u0000';
            processed = processed.replace(/\{<[^>]+>\}/g, (match) => {
                const value = substitutions[match];
                return value !== undefined ? value.replace(/\//g, SLASH_SENTINEL) : match;
            });

            // Handle Choices { A / B / C }
            processed = processed.replace(/\{([^{}]*?)\}/g, (_match, content) => {
                const parts = content.split('/');
                if (parts.length >= 2) {
                    // Juno B1 (Intern #128, 2026-10-20): the "testing" section's choice
                    // picks between self-assessment / third-party review / no testing.
                    // This function only ever runs a pure automated scan, so it is
                    // always self-assessment and testing always happened — picking this
                    // by complianceLevel claimed "independent review" (index 1) for
                    // every statement once complianceLevel became permanently 'partial'.
                    // Pinned to the self-assessment branch regardless of compliance
                    // outcome; only the "technical" (compliance status) choice reads
                    // complianceLevel.
                    if (sectionId === 'testing') {
                        return parts[0].trim();
                    }
                    let idx = 0;
                    if (complianceLevel === 'partial') idx = 1;
                    if (complianceLevel === 'non-compliant') idx = parts.length > 2 ? 2 : 1;
                    return parts[idx].trim();
                }
                return _match;
            });

            processed = processed.split(SLASH_SENTINEL).join('/');

            return processed;
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
                // Juno H3/H4: Swedish enforcement wording is sector-specific and
                // cannot come from the generic template — see
                // resolveSwedishEnforcementContent() above.
                const body = (s.id === 'enforcement' && country === 'SE' && lang === 'sv')
                    ? resolveSwedishEnforcementContent(sector, enforcementBody, substitutions['{<national_law>}'] ?? '').trim()
                    : processText(s.content, s.id).trim();
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
