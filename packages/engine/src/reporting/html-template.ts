
import { ScanResult } from '../core/regulatory-scanner';
import { t, getCurrentLang } from '../i18n';

export function generateReportHTML(result: ScanResult): string {
    const criticalCount = result.stats.critical;
    const highCount = result.stats.high;
    const scoreColor = result.score > 90 ? '#16a34a' : result.score > 70 ? '#eab308' : '#dc2626';

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(getCurrentLang() === 'sv' ? 'sv-SE' : 'en-US', {
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
                grid-template-columns: repeat(4, 1fr);
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
            <div class="brand">Holm<span>Digital</span></div>
            <div class="meta">
                <div>${t('report.scan_target', { url: result.url })}</div>
                <div>${t('report.generated', { date: formatDate(result.timestamp) })}</div>
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
        </div>

        <div class="section-title">${t('report.detailed_violations')}</div>

        ${result.reports.map(report => {
        const riskClass = `badge-${report.holmdigitalInsight.diggRisk}`;
        return `
            <div class="violation-card">
                <div class="violation-header">
                    <div class="violation-title">${report.ruleId}</div>
                    <span class="badge ${riskClass}">${report.holmdigitalInsight.diggRisk}</span>
                </div>
                <div class="violation-meta">
                    WCAG ${report.wcagCriteria} • EN 301 549 ${report.en301549Criteria}
                    ${report.dosLagenReference ? `• ${report.dosLagenReference}` : ''}
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
            ${t('report.footer')}
        </footer>
    </body>
    </html>
    `;
}
