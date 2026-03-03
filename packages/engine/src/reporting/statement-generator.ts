import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AccessibilityStatement, AccessibilityStatementProps } from '@holmdigital/components';
import { Country, ENFORCEMENT_BODIES } from '@holmdigital/standards';
import { ScanResult } from '../core/regulatory-scanner';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { generateBadgeUrl } from './badge-generator';

const __dirname_esm = typeof __dirname === 'undefined'
    ? path.dirname(fileURLToPath(import.meta.url))
    : __dirname;

/**
 * Metadata for organizational information in the accessibility statement
 */
export interface StatementMetadata {
    organizationName?: string;
    contactEmail?: string;
    phoneNumber?: string;
    responseTime?: string;
    country?: string;
    publishDate?: string | Date;
}

/**
 * Generates an HTML or Markdown Accessibility Statement from scan results
 */
interface StatementTemplate {
    title: string;
    intro: string;
    sections: Array<{ id?: string; title: string; content: string }>;
}

export async function generateStatementContent(
    result: ScanResult,
    lang: string = 'en',
    format: 'html' | 'md' | 'markdown' = 'html',
    metadata?: StatementMetadata
): Promise<string> {
    // 0. Load Template
    let template: StatementTemplate | undefined;
    const possibleTemplatePaths = [
        path.join(__dirname_esm, 'templates', `${lang}.json`),
        path.join(__dirname_esm, '../src/reporting/templates', `${lang}.json`),
        path.join(process.cwd(), 'packages/engine/src/reporting/templates', `${lang}.json`)
    ];

    let loaded = false;
    for (const p of possibleTemplatePaths) {
        try {
            const data = await fs.readFile(p, 'utf-8');
            template = JSON.parse(data) as StatementTemplate;
            loaded = true;
            break;
        } catch (e) {
            continue;
        }
    }

    if (!loaded) {
        // Fallback to en
        const fallbackPaths = [
            path.join(__dirname_esm, 'templates', 'en.json'),
            path.join(__dirname_esm, '../src/reporting/templates', 'en.json'),
            path.join(process.cwd(), 'packages/engine/src/reporting/templates', 'en.json')
        ];

        for (const p of fallbackPaths) {
            try {
                const data = await fs.readFile(p, 'utf-8');
                template = JSON.parse(data) as StatementTemplate;
                loaded = true;
                break;
            } catch (e) {
                continue;
            }
        }
    }

    if (!loaded || !template) {
        throw new Error(`Accessibility statement templates missing. Looked in: ${possibleTemplatePaths.join(', ')}`);
    }

    // 1. Determine compliance level
    let complianceLevel: AccessibilityStatementProps['complianceLevel'] = 'full';

    if (result.stats.critical > 0 || (result.legalSummary && result.legalSummary.eaaDeadlineViolations > 0)) {
        complianceLevel = 'non-compliant'; // Critical issues or legal blockers
    } else if (result.score < 100) {
        complianceLevel = 'partial'; // Some issues, but no critical ones
    }

    // 2. Extract known issues (non-compliant items)
    const issuesMap = new Map<string, string>();
    result.reports.forEach(report => {
        if (!issuesMap.has(report.ruleId)) {
            // Updated to handle simple string if that's what report.wcagCriteria is
            const issueText = `${report.ruleId} (${report.wcagCriteria})`;
            issuesMap.set(report.ruleId, issueText);
        }
    });

    const nonComplianceItems = Array.from(issuesMap.values());

    // 3. Determine Country/Sector
    let country: Country = (metadata?.country || 'SE') as Country;
    if (!metadata?.country) {
        if (result.url.endsWith('.no')) country = 'NO';
        if (result.url.endsWith('.dk')) country = 'DK';
        if (result.url.endsWith('.fi')) country = 'FI';
        if (result.url.endsWith('.de')) country = 'DE';
    }

    const sector: 'public' | 'private' = 'public';

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
            } catch (e) {
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
        evaluationMethod: lang === 'sv' ? 'Automatiserad granskning via @holmdigital/engine' : 'Automated Scan via @holmdigital/engine',
        generatorTool: {
            name: 'HolmDigital Regulatory Engine',
            url: 'https://holmdigital.se'
        },
        logoUrl,
        contactEmail: metadata?.contactEmail || 'hej@holmdigital.se',
        phoneNumber: metadata?.phoneNumber || '070-123 45 67',
        responseTime: metadata?.responseTime || (lang === 'sv' ? '2 dagar' : '2 days'),
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
        const statusMap: Record<string, string> = {
            'full': lang === 'sv' ? 'Fullt ut förenlig' : (lang === 'no' || lang === 'nb' ? 'Helt i samsvar' : (lang === 'da' ? 'Fuldt ud i overensstemmelse' : 'Fully compliant')),
            'partial': lang === 'sv' ? 'Delvis förenlig' : (lang === 'no' || lang === 'nb' ? 'Delvis i samsvar' : (lang === 'da' ? 'Delvist i overensstemmelse' : 'Partially compliant')),
            'non-compliant': lang === 'sv' ? 'Inte förenlig' : (lang === 'no' || lang === 'nb' ? 'Ikke i samsvar' : (lang === 'da' ? 'Ikke i overensstemmelse' : 'Non-compliant'))
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
            '{<publish date>}': props.publishDate?.toISOString().split('T')[0] || '2024-01-01',
            '{<metod>}': props.evaluationMethod || 'Automated Scan',
            '{<metodi>}': props.evaluationMethod || 'Automated Scan',
            '{<methode>}': props.evaluationMethod || 'Automated Scan',
            '{<método>}': props.evaluationMethod || 'Automated Scan',
            '{<method>}': props.evaluationMethod || 'Automated Scan',
            '{<extern aktör>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<ekstern aktor>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<ulkoinen taho>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<externe partij>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<externer Dritter>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<tiers externe>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<tercero externo>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<third party>}': props.generatorTool?.name || 'HolmDigital Engine',
            '{<enforcement_body>}': ENFORCEMENT_BODIES[country] || ENFORCEMENT_BODIES.EU,
            '{<brister>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'sv' ? 'Inga kända brister.' : 'No known issues.'),
            '{<puutteet>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'fi' ? 'Ei tiedossa olevia puutteita.' : 'No known issues.'),
            '{<gebreken>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'nl' ? 'Geen bekende gebreken.' : 'No known issues.'),
            '{<mängel>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'de' ? 'Keine bekannten Mängel.' : 'No known issues.'),
            '{<défauts>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'fr' ? 'Aucun défaut connu.' : 'No known issues.'),
            '{<deficiencias>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'es' ? 'No hay deficiencias conocidas.' : 'No known issues.'),
            '{<mangler>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : (lang === 'no' || lang === 'da' ? 'Ingen kendte mangler.' : 'No known issues.'),
            '{<issues>}': nonComplianceItems.length > 0 ? nonComplianceItems.map(item => `* ${item}`).join('\n') : 'No known issues.'
        };


        const processText = (text: string) => {
            let processed = text;
            // Handle Conditionals [ ... ]
            processed = processed.replace(/\[([\s\S]*?)\]/g, (_match, content) => {
                if (content.includes('{<svarstid>}') || content.includes('{<svartid>}') || content.includes('{<response time>}')) {
                    return props.responseTime ? content : '';
                }
                if (content.includes('{<telefonnummer>}') || content.includes('{<telephone number>}')) {
                    return props.phoneNumber ? content : '';
                }
                if (content.includes('{<brister>}') || content.includes('{<mangler>}') || content.includes('{<issues>}')) {
                    return complianceLevel !== 'full' ? content : '';
                }
                return content;
            });

            // Handle Choices { A / B / C }
            processed = processed.replace(/\{([^{}]*?)\}/g, (_match, content) => {
                const parts = content.split('/');
                if (parts.length >= 2) {
                    let idx = 0;
                    if (complianceLevel === 'partial') idx = 1;
                    if (complianceLevel === 'non-compliant') idx = parts.length > 2 ? 2 : 1;
                    return parts[idx].trim();
                }
                // Handle substitutions if not a choice block
                const key = `{${content}}`;
                return substitutions[key] !== undefined ? substitutions[key] : _match;
            });

            return processed;
        };

        const title = processText(template.title);
        const intro = processText(template.intro);
        const sections = template.sections.map(s => `## ${s.title}\n\n${processText(s.content)}`).join('\n\n');

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
