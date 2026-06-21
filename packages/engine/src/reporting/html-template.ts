
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ScanResult, getEngineVersion } from '../core/regulatory-scanner';
import { generateBadgeUrl } from './badge-generator';
import { t, getCurrentLang } from '../i18n';
import { groupReportsByRule, impactBreakdown } from './plain-group';
import type { EnrichedReport, BusinessImpactLevel } from '@holmdigital/standards';

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

function formatDate(dateString: string): string {
    const intlLocale = LOCALE_TO_INTL[getCurrentLang()] || 'en-US';
    return new Date(dateString).toLocaleDateString(intlLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function generateReportHTML(
    result: ScanResult,
    sector: 'public' | 'private' = 'public',
    audience: 'developer' | 'plain' = 'developer'
): string {
    if (audience === 'plain') {
        return generatePlainReportHTML(result);
    }

    const criticalCount = result.stats.critical;
    const highCount = result.stats.high;
    const htmlErrorsCount = result.htmlValidation?.errors?.length ?? 0;
    const scoreColor = result.score > 90 ? '#16a34a' : result.score > 70 ? '#eab308' : '#dc2626';

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
                grid-template-columns: repeat(var(--legal-cols, 1), 1fr);
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
                ${sector ? `<div style="margin-top: 0.25rem; font-size: 0.75rem; font-weight: 600; color: ${sector === 'private' ? '#7c3aed' : '#1d4ed8'};">${sector === 'private' ? 'Private sector (EAA)' : 'Public sector (WAD)'}</div>` : ''}
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
            <div class="legal-grid" style="--legal-cols: ${sector === 'public' ? 1 : 2}">
                ${sector === 'public' ? `
                <div class="legal-stat">
                    <div class="legal-stat-value" style="color: #1d4ed8;">${result.legalSummary.wadApplicable}</div>
                    <div class="legal-stat-label">WAD (Public Sector) Violations</div>
                </div>
                ` : `
                <div class="legal-stat">
                    <div class="legal-stat-value" style="color: #7c3aed;">${result.legalSummary.eaaApplicable}</div>
                    <div class="legal-stat-label">EAA (Private Sector) Violations</div>
                </div>
                <div class="legal-stat">
                    <div class="legal-stat-value" style="color: #dc2626;">${result.legalSummary.eaaDeadlineViolations}</div>
                    <div class="legal-stat-label">EAA 2025 Deadline Issues</div>
                </div>
                `}
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
                        ${sector === 'public' && report.legalContext?.appliesTo?.includes('WAD') ? '<span class="badge badge-wad">WAD</span>' : ''}
                        ${sector === 'private' && report.legalContext?.appliesTo?.includes('EAA') ? '<span class="badge badge-eaa">EAA</span>' : ''}
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

/**
 * Impact sort order for the plain report (mirrors plain-report.ts — D-08).
 * Lower number = higher priority.
 */
const PLAIN_IMPACT_ORDER: Record<BusinessImpactLevel, number> = {
    'stoppar-kop': 0,
    'hindrar': 1,
    'forsamrar': 2,
    'putsning': 3,
};

/** Fallback derivation from DIGG risk (mirrors plain-report.ts — D-10.4). */
const PLAIN_RISK_TO_IMPACT: Record<string, BusinessImpactLevel> = {
    critical: 'stoppar-kop',
    high: 'hindrar',
    medium: 'forsamrar',
    low: 'putsning',
};

/** Badge CSS class per impact level. */
const PLAIN_BADGE_CLASS: Record<BusinessImpactLevel, string> = {
    'stoppar-kop': 'badge-stoppar-kop',
    'hindrar': 'badge-hindrar',
    'forsamrar': 'badge-forsamrar',
    'putsning': 'badge-putsning',
};

/** Badge i18n key per impact level. */
const PLAIN_BADGE_KEY: Record<BusinessImpactLevel, 'plain.badge_stoppar_kop' | 'plain.badge_hindrar' | 'plain.badge_forsamrar' | 'plain.badge_putsning'> = {
    'stoppar-kop': 'plain.badge_stoppar_kop',
    'hindrar': 'plain.badge_hindrar',
    'forsamrar': 'plain.badge_forsamrar',
    'putsning': 'plain.badge_putsning',
};

function plainLevelOf(report: EnrichedReport): BusinessImpactLevel {
    return report.plainLanguage?.impactLevel
        ?? PLAIN_RISK_TO_IMPACT[report.holmdigitalInsight.diggRisk]
        ?? 'putsning';
}

/**
 * Lazily-loaded HolmDigital logo as a base64 data URI (Task I).
 * Keeps the PDF self-contained and offline — no network fetch at
 * generation time. Resolved relative to the module, mirroring the
 * statement-generator template resolution: the dist bundles see
 * assets/ alongside them (copy-assets.mjs copies src/assets to
 * dist/assets and dist/cli/assets); the src tree (dev/tests) sees
 * ../assets/. Returns '' when the asset is missing so report
 * generation never crashes over a logo.
 */
let cachedLogoDataUri: string | null = null;
function getLogoDataUri(): string {
    if (cachedLogoDataUri !== null) {
        return cachedLogoDataUri;
    }
    const candidates = [
        join(__dirname, 'assets', 'logo.jpg'),       // dist/ and dist/cli/ (copy-assets.mjs)
        join(__dirname, '..', 'assets', 'logo.jpg'), // src tree (dev/tests)
    ];
    for (const candidate of candidates) {
        try {
            const buffer = readFileSync(candidate);
            cachedLogoDataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;
            return cachedLogoDataUri;
        } catch {
            // Asset not at this location — try the next candidate.
        }
    }
    cachedLogoDataUri = '';
    return cachedLogoDataUri;
}

/**
 * Generates a plain-language HTML document for non-technical recipients (D-08).
 * Mirrors the terminal renderer (plain-report.ts): opening + impact-sorted list
 * (5 fields + badge) + neutral closing + footer with URL/date/version (D-16).
 * NO score, NO WCAG/DIGG tables, NO legal sections.
 */
function generatePlainReportHTML(result: ScanResult): string {
    const lang = getCurrentLang();
    const safeUrl = escapeHtml(result.url);
    const logoDataUri = getLogoDataUri();

    // KRAV 1: one card per rule with an occurrence count, sorted by impact.
    const sortedGroups = groupReportsByRule(result.reports as EnrichedReport[]).sort((a, b) => {
        const aLevel = PLAIN_IMPACT_ORDER[plainLevelOf(a.report)] ?? 4;
        const bLevel = PLAIN_IMPACT_ORDER[plainLevelOf(b.report)] ?? 4;
        return aLevel - bLevel;
    });

    // Intro count stays the TOTAL finding count across all groups.
    const count = result.reports.length;
    const unit = count === 1
        ? t('plain.intro_unit_singular')
        : t('plain.intro_unit_plural');

    // KRAV 4: per-impact-level breakdown, counted per occurrence (sums to total).
    const breakdownText = impactBreakdown(result.reports as EnrichedReport[], plainLevelOf, PLAIN_IMPACT_ORDER)
        .map(b => `${b.count} ${escapeHtml(t(PLAIN_BADGE_KEY[b.level]))}`)
        .join(', ');

    const isSwedish = lang === 'sv';

    const itemsHtml = sortedGroups.length === 0
        ? `<p>${t('plain.empty_state')}</p>`
        : `<ul class="issue-list">
${sortedGroups.map((group) => {
    const report = group.report;
    const level = plainLevelOf(report);
    const badgeClass = PLAIN_BADGE_CLASS[level];
    const cardClass = `issue-item--${level}`;
    const badgeText = escapeHtml(t(PLAIN_BADGE_KEY[level]));
    const pl = report.plainLanguage;
    const occurrences = group.count > 1
        ? `, ${escapeHtml(t('plain.occurrences', { count: group.count }))}`
        : '';

    if (pl) {
        return `  <li class="issue-item ${cardClass}">
    <span class="badge ${badgeClass}">${badgeText}</span>
    <strong class="issue-id">${escapeHtml(report.ruleId)}${occurrences}</strong>
    <dl class="issue-fields">
      <dt>${t('plain.what_happens')}</dt><dd>${escapeHtml(pl.whatHappens)}</dd>
      <dt>${t('plain.who_is_affected')}</dt><dd>${escapeHtml(pl.whoIsAffected)}</dd>
      <dt>${t('plain.business_impact')}</dt><dd>${escapeHtml(pl.businessImpact)}</dd>
      <dt>${t('plain.how_to_fix')}</dt><dd>${escapeHtml(pl.howToFix)}</dd>
    </dl>
  </li>`;
    } else {
        // KRAV 3-short: don't leak axe-core's raw English help into a Swedish
        // report body; other locales keep the raw technical detail for now.
        const rawDetail = isSwedish ? '' : ` ${escapeHtml(report.remediation.description)}`;
        return `  <li class="issue-item ${cardClass}">
    <span class="badge ${badgeClass}">${badgeText}</span>
    <strong class="issue-id">${escapeHtml(report.ruleId)}${occurrences}</strong>
    <p class="issue-fallback"><span class="fallback-framing">${escapeHtml(t('plain.fallback_framing'))}</span>${rawDetail}</p>
  </li>`;
    }
}).join('\n')}
</ul>`;

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('plain.report_title', { url: safeUrl })}</title>
  <style>
    /* ---- Per-page margins (Task G): every printed page, incl. 2+, gets
           breathing room at top/bottom. An author-level @page rule overrides
           the zero margins passed to Puppeteer's pdf() call, and it travels
           with THIS document only — the developer PDF is unaffected.
           Bottom margin enlarged (Task H2): reserves footer height + ~8mm
           so flowing content never overlaps the fixed per-page footer. ---- */
    @page {
      margin: 14mm 12mm 22mm;
    }

    /* ---- Reset & base ---- */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
      background: #ffffff;
      color: #334155;
      font-size: 14px;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ---- Page-1 header (Task H1/I): light wiki style — white band, top
           accent line, real HolmDigital logo (embedded data URI). In
           normal flow, so it renders once on page 1 and is NOT repeated. ---- */
    .report-header {
      background: #ffffff;
      border-top: 3px solid #0369a1;
      border-bottom: 1px solid #e2e8f0;
      padding: 1.1rem 0 1.25rem;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report-header__row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      margin-bottom: 1.1rem;
    }
    .brand__logo {
      display: block;
      width: 160px;
      height: auto;
    }
    .brand__tagline {
      font-size: 0.6rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #64748b;
      margin-top: 0.35rem;
    }
    .report-header__meta {
      text-align: right;
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.8;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .report-header__title {
      font-size: 1.45rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
      word-break: break-all;
    }

    /* ---- Page body wrapper: sides + bottom now come from @page margins ---- */
    .report-body {
      max-width: 840px;
      margin: 0 auto;
      padding: 1.75rem 0 0;
    }

    /* ---- Intro paragraph ---- */
    .intro {
      margin-bottom: 2rem;
    }
    .intro p {
      color: #334155;
      line-height: 1.7;
      margin-bottom: 0.5rem;
    }
    .intro p:first-child {
      font-size: 1rem;
      font-weight: 500;
      color: #0f172a;
    }

    /* ---- Issue list ---- */
    .issue-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    /* ---- Finding card: comfortable padding + inter-card air (Task G) ---- */
    .issue-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #0369a1;
      border-radius: 8px;
      padding: 1.4rem 1.6rem;
      margin-bottom: 1.6rem;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .issue-item--stoppar-kop { border-left-color: #b91c1c; }
    .issue-item--hindrar    { border-left-color: #c2410c; }
    .issue-item--forsamrar  { border-left-color: #a16207; }
    .issue-item--putsning   { border-left-color: #475569; }

    /* ---- Badge chip — white text, WCAG AA contrast against solid background ---- */
    .badge {
      display: inline-block;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #ffffff;
      margin-bottom: 0.6rem;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* All combos: white on solid — contrast ratios: #b91c1c 7.5:1, #c2410c 5.6:1, #a16207 4.6:1, #475569 5.9:1 */
    .badge-stoppar-kop { background: #b91c1c; }
    .badge-hindrar     { background: #c2410c; }
    .badge-forsamrar   { background: #a16207; }
    .badge-putsning    { background: #475569; }

    /* ---- Rule ID ---- */
    .issue-id {
      display: block;
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
      font-family: ui-monospace, 'Cascadia Code', 'Courier New', monospace;
      margin-bottom: 0.75rem;
      break-after: avoid;
      page-break-after: avoid;
    }

    /* ---- Field label/value pairs ---- */
    .issue-fields { margin: 0; }
    .issue-fields dt {
      font-weight: 600;
      font-size: 0.78rem;
      color: #0f172a;
      margin-top: 0.65rem;
    }
    .issue-fields dd {
      margin-left: 0;
      font-size: 0.9rem;
      color: #334155;
      line-height: 1.55;
    }

    /* ---- Fallback (no plainLanguage data) ---- */
    .issue-fallback {
      font-size: 0.9rem;
      color: #334155;
      margin: 0.5rem 0 0;
      line-height: 1.5;
    }
    .fallback-framing {
      font-weight: 600;
      color: #0f172a;
    }

    /* ---- Closing line ---- */
    .closing {
      margin-top: 2rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f172a;
      break-before: avoid;
      page-break-before: avoid;
    }

    /* ---- Fixed per-page footer (Task H2): position:fixed elements are
           repeated on every printed page in Chromium print-to-PDF. White
           background + top border so cards never show through; the @page
           bottom margin reserves the vertical space. ---- */
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 0.45rem 0 0.35rem;
      font-size: 0.7rem;
      color: #64748b;
      line-height: 1.7;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <header class="report-header">
    <div class="report-header__row">
      <div class="brand">
        ${logoDataUri ? `<img class="brand__logo" src="${logoDataUri}" alt="Holm Digital logotyp">` : ''}
        <div class="brand__tagline">${escapeHtml(t('plain.report_tagline'))}</div>
      </div>
      <div class="report-header__meta">
        ${formatDate(result.timestamp)}<br>v${getEngineVersion()}
      </div>
    </div>
    <div class="report-header__title">${safeUrl}</div>
  </header>

  <div class="report-body">
    <div class="intro">
      <p>${t('plain.intro_framing')}</p>
      <p>${t('plain.intro_found', { count, unit })}</p>
      <p class="intro-breakdown">${count} ${escapeHtml(unit)}: ${breakdownText}</p>
    </div>

    ${itemsHtml}

    <p class="closing">${t('plain.closing')}</p>
  </div>

  <footer class="page-footer">
    ${safeUrl} &bull; ${formatDate(result.timestamp)} &bull; v${getEngineVersion()}
    <br>${escapeHtml(t('plain.attribution'))}
  </footer>
</body>
</html>`;
}
