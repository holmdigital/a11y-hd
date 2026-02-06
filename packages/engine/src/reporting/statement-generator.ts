import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AccessibilityStatement, AccessibilityStatementProps } from '@holmdigital/components';
import { ScanResult } from '../core/regulatory-scanner';
import fs from 'fs/promises';
import path from 'path';
import { generateBadgeUrl } from './badge-generator';

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
export async function generateStatementContent(
    result: ScanResult,
    lang: string = 'en',
    format: 'html' | 'md' | 'markdown' = 'html',
    metadata?: StatementMetadata
): Promise<string> {
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
    let country: any = metadata?.country || 'SE';
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
            'full': 'Full',
            'partial': 'Partial',
            'non-compliant': 'Non-Compliant'
        };



        content = `# Accessibility Statement for ${props.organizationName}

This accessibility statement applies to [${props.websiteUrl}](${props.websiteUrl}).

## Compliance Status

**Status:** ${statusMap[complianceLevel] || complianceLevel}

This website is ${complianceLevel} compliant with ${sector === 'public' ? 'EN 301 549 (WAD)' : 'EAA'}.

## Non-accessible Content

The following content is non-accessible for the following reasons:

${nonComplianceItems.length > 0
                ? nonComplianceItems.map(item => `- ${item}`).join('\n')
                : '_No known issues._'}

## Preparation of this statement

This statement was prepared on ${dateStr}.
Method used: **Automated Scan** via @holmdigital/engine.

## Feedback and contact information

If you need information on this website in a different format like accessible PDF, large print, easy-to-read, audio recording or braille:

- email: [${props.contactEmail}](mailto:${props.contactEmail})

## Enforcement procedure

The enforcement body for ${country} is responsible for enforcing these regulations.
`;
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
