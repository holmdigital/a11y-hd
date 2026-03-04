
import { ScanResult, getEngineVersion } from '../core/regulatory-scanner';
import { generateBadgeUrl } from './badge-generator';
import { t, getCurrentLang } from '../i18n';

/**
 * Maps lang codes to their correct Intl.DateTimeFormat locale codes.
 * Covers all 9 EU locales plus common aliases (nb, dk, en-gb, en-us, en-ca).
 */
const LOCALE_TO_INTL: Record<string, string> = {
    sv: 'sv-SE',
    en: 'en-US',
    no: 'nb-NO',
    nb: 'nb-NO',
    fi: 'fi-FI',
    da: 'da-DK',
    dk: 'da-DK',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-ES',
    nl: 'nl-NL',
    'en-gb': 'en-GB',
    'en-us': 'en-US',
    'en-ca': 'en-CA',
};

export function generateReportHTML(result: ScanResult): string {
    const criticalCount = result.stats.critical;
    const highCount = result.stats.high;
    const htmlErrorsCount = result.htmlValidation?.errors?.length ?? 0;
    const scoreColor = result.score > 90 ? '#16a34a' : result.score > 70 ? '#eab308' : '#dc2626';

    const formatDate = (dateString: string) => {
        const intlLocale = LOCALE_TO_INTL[getCurrentLang()] || 'en-US';
        return new Date(dateString).toLocaleDateString(intlLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return `
    <!DOCTYPE html>
    <html lang="${getCurrentLang()}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('report.title', { url: result.url })}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            @page {
                margin: 0;
            }
            body {
                font-family: 'Inter', sans-serif;
                background-color: #ffffff;
                color: #0f172a;
                margin: 0;
                padding: 40px;
                -webkit-print-color-adjust: exact;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #f1f5f9;
                padding-bottom: 2rem;
                margin-bottom: 3rem;
            }
            .brand {
                font-size: 1.5rem;
                font-weight: 700;
                color: #0f172a;
            }
            .brand span {
                color: #0ea5e9;
            }
            .meta {
                text-align: right;
                color: #64748b;
                font-size: 0.875rem;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 1.5rem;
                margin-bottom: 3rem;
            }
            .card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 1.5rem;
            }
            .score-card {
                background: #f0f9ff;
                border-color: #bae6fd;
            }
            .metric-label {
                font-size: 0.875rem;
                color: #64748b;
                margin-bottom: 0.5rem;
                font-weight: 500;
                min-height: 2.5rem;
            }
            .metric-value {
                font-size: 2rem;
                font-weight: 700;
                color: #0f172a;
            }
            .section-title {
                font-size: 1.25rem;
                font-weight: 700;
                margin-bottom: 1.5rem;
                color: #0f172a;
            }
            .violation-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                page-break-inside: avoid;
            }
            .violation-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }
            .violation-title {
                font-weight: 600;
                font-size: 1.125rem;
                color: #0f172a;
            }
            .badge {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
            }
            .badge-critical { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
            .badge-high { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
            .badge-medium { background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; }
            .badge-low { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
            .badge-wad { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; margin-left: 0.5rem; }
            .badge-eaa { background: #faf5ff; color: #7c3aed; border: 1px solid #ddd6fe; margin-left: 0.5rem; }
            .legal-summary {
                background: linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%);
                border: 1px solid #c7d2fe;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 2rem;
            }
            .legal-summary-title {
                font-size: 1rem;
                font-weight: 600;
                color: #3730a3;
                margin-bottom: 1rem;
            }
            .legal-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
            }
            .legal-stat {
                text-align: center;
            }
            .legal-stat-value {
                font-size: 1.5rem;
                font-weight: 700;
            }
            .legal-stat-label {
                font-size: 0.75rem;
                color: #64748b;
            }

            .violation-meta {
                font-size: 0.875rem;
                color: #64748b;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #f1f5f9;
            }
            .remediation-box {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 6px;
                padding: 1rem;
                margin-top: 1rem;
            }
            .remediation-title {
                color: #166534;
                font-weight: 600;
                font-size: 0.875rem;
                margin-bottom: 0.5rem;
            }
            .remediation-text {
                color: #15803d;
                font-size: 0.875rem;
            }
            footer {
                margin-top: 4rem;
                text-align: center;
                color: #94a3b8;
                font-size: 0.75rem;
                border-top: 1px solid #f1f5f9;
                padding-top: 2rem;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="brand">@HolmDigital/<span>engine</span></div>
            <div class="meta">
                <div>${t('report.scan_target', { url: result.url })}</div>
                <div>${t('report.generated', { date: formatDate(result.timestamp) })}</div>
                ${generateBadgeUrl(result.score) ? `<div style="margin-top: 0.5rem;"><img src="${generateBadgeUrl(result.score)}" alt="Accessibility Status: 100% Compliant" /></div>` : ''}
            </div>
        </div>

        <div class="summary-grid">
            <div class="card score-card">
                <div class="metric-label" style="color: #0369a1;">${t('report.overall_score')}</div>
                <div class="metric-value" style="color: ${scoreColor};">${Math.round(result.score)}</div>
            </div>
            <div class="card">
                <div class="metric-label">${t('report.critical_issues')}</div>
                <div class="metric-value" style="color: #dc2626;">${criticalCount}</div>
            </div>
            <div class="card">
                <div class="metric-label">${t('report.high_issues')}</div>
                <div class="metric-value" style="color: #d97706;">${highCount}</div>
            </div>
            <div class="card">
                <div class="metric-label">${t('report.total_issues')}</div>
                <div class="metric-value">${result.stats.total}</div>
            </div>
            <div class="card">
                <div class="metric-label">${t('report.html_errors')}</div>
                <div class="metric-value" style="color: ${htmlErrorsCount > 0 ? '#9333ea' : '#16a34a'};">${htmlErrorsCount}</div>
            </div>
        </div>

        ${result.legalSummary ? `
        <div class="legal-summary">
            <div class="legal-summary-title">🇪🇺 EU Legal Framework Impact</div>
            <div class="legal-grid">
                <div class="legal-stat">
                    <div class="legal-stat-value" style="color: #1d4ed8;">${result.legalSummary.wadApplicable}</div>
                    <div class="legal-stat-label">WAD (Public Sector) Violations</div>
                </div>
                <div class="legal-stat">
                    <div class="legal-stat-value" style="color: #7c3aed;">${result.legalSummary.eaaApplicable}</div>
                    <div class="legal-stat-label">EAA (Private Sector) Violations</div>
                </div>
                <div class="legal-stat">
                    <div class="legal-stat-value" style="color: #dc2626;">${result.legalSummary.eaaDeadlineViolations}</div>
                    <div class="legal-stat-label">EAA 2025 Deadline Issues</div>
                </div>
            </div>
        </div>
        ` : ''}

        <div class="section-title">${t('report.detailed_violations')}</div>

        ${[...result.reports].sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const aRisk = a.holmdigitalInsight.diggRisk.toLowerCase() as keyof typeof severityOrder;
        const bRisk = b.holmdigitalInsight.diggRisk.toLowerCase() as keyof typeof severityOrder;
        return (severityOrder[aRisk] ?? 4) - (severityOrder[bRisk] ?? 4);
    }).map(report => {
        const riskClass = `badge-${report.holmdigitalInsight.diggRisk}`;
        return `
            <div class="violation-card">
                <div class="violation-header">
                    <div class="violation-title">${report.ruleId}</div>
                    <div>
                        <span class="badge ${riskClass}">${report.holmdigitalInsight.diggRisk}</span>
                        ${report.legalContext?.appliesTo?.includes('WAD') ? '<span class="badge badge-wad">WAD</span>' : ''}
                        ${report.legalContext?.appliesTo?.includes('EAA') ? '<span class="badge badge-eaa">EAA</span>' : ''}
                    </div>
                </div>
                <div class="violation-meta">
                    WCAG ${report.wcagCriteria} • EN 301 549 ${report.en301549Criteria}
                    ${report.dosLagenReference ? `• ${report.dosLagenReference}` : ''}
                    ${report.legalContext?.eaaDeadline ? `<br/><strong>⚠️ EAA Deadline:</strong> ${report.legalContext.eaaDeadline}` : ''}
                </div>
                <div style="font-size: 0.95rem; color: #334155; line-height: 1.5;">
                    ${report.holmdigitalInsight.swedishInterpretation}
                    ${report.holmdigitalInsight.priorityRationale ? `<br/><br/><strong>Priority Rationale:</strong> ${report.holmdigitalInsight.priorityRationale}` : ''}
                </div>
                ${report.remediation.component ? `
                <div class="remediation-box">
                    <div class="remediation-title">${t('report.prescriptive_fix')}</div>
                    <div class="remediation-text">${t('report.use')} <strong>${report.remediation.component}</strong>: ${report.remediation.description}</div>
                </div>
                ` : ''}
            </div>
            `;
    }).join('')}

        <footer>
            ${t('report.footer', { version: getEngineVersion() })}
        </footer>
    </body>
    </html>
    `;
}
