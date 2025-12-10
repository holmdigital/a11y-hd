/**
 * HTML Reporter
 * Genererar visuella HTML-rapporter från scanresultat
 */

import type { ScanResult, Violation } from '../types';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Genererar en HTML-rapport från scanresultat
 */
export class HTMLReporter {
    private result: ScanResult;

    constructor(result: ScanResult) {
        this.result = result;
    }

    /**
     * Generera och spara HTML-rapport
     */
    async generate(outputPath: string): Promise<void> {
        const html = this.buildHTML();
        writeFileSync(outputPath, html, 'utf-8');
    }

    /**
     * Bygg HTML-innehåll
     */
    private buildHTML(): string {
        return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tillgänglighetsrapport - ${this.escapeHtml(this.result.url)}</title>
  ${this.getStyles()}
</head>
<body>
  <div class="container">
    ${this.buildHeader()}
    ${this.buildSummary()}
    ${this.buildScreenshots()}
    ${this.buildViolations()}
    ${this.buildPasses()}
    ${this.buildIncomplete()}
    ${this.buildFooter()}
  </div>
  ${this.getScripts()}
</body>
</html>
    `.trim();
    }

    /**
     * Bygg header-sektion
     */
    private buildHeader(): string {
        const date = new Date(this.result.timestamp).toLocaleString('sv-SE');

        return `
<header class="report-header">
  <div class="logo">
    <h1>🌐 HolmDigital A11y</h1>
    <p class="tagline">Tillgänglighetsrapport</p>
  </div>
  <div class="meta">
    <div class="meta-item">
      <strong>URL:</strong>
      <a href="${this.escapeHtml(this.result.url)}" target="_blank">${this.escapeHtml(this.result.url)}</a>
    </div>
    <div class="meta-item">
      <strong>Datum:</strong> ${date}
    </div>
    <div class="meta-item">
      <strong>Standard:</strong> ${this.getStandardLabel(this.result.standard)}
    </div>
    ${this.result.wcagLevel ? `
    <div class="meta-item">
      <strong>WCAG-nivå:</strong> ${this.result.wcagLevel}
    </div>
    ` : ''}
  </div>
</header>
    `;
    }

    /**
     * Bygg sammanfattning
     */
    private buildSummary(): string {
        const { summary } = this.result;
        const scoreClass = this.getScoreClass(summary.complianceScore);

        return `
<section class="summary">
  <h2>Sammanfattning</h2>
  <div class="summary-grid">
    <div class="summary-card score-card ${scoreClass}">
      <div class="card-value">${summary.complianceScore}%</div>
      <div class="card-label">Compliance Score</div>
    </div>
    <div class="summary-card">
      <div class="card-value">${summary.totalViolations}</div>
      <div class="card-label">Violations</div>
    </div>
    <div class="summary-card">
      <div class="card-value">${summary.totalPasses}</div>
      <div class="card-label">Godkända kontroller</div>
    </div>
    <div class="summary-card">
      <div class="card-value">${summary.totalElements}</div>
      <div class="card-label">Element scannade</div>
    </div>
  </div>
  
  <div class="impact-breakdown">
    <h3>Violations per impact-nivå</h3>
    <div class="impact-grid">
      <div class="impact-item critical">
        <span class="impact-count">${summary.violationsByImpact.critical}</span>
        <span class="impact-label">Kritisk</span>
      </div>
      <div class="impact-item serious">
        <span class="impact-count">${summary.violationsByImpact.serious}</span>
        <span class="impact-label">Allvarlig</span>
      </div>
      <div class="impact-item moderate">
        <span class="impact-count">${summary.violationsByImpact.moderate}</span>
        <span class="impact-label">Måttlig</span>
      </div>
      <div class="impact-item minor">
        <span class="impact-count">${summary.violationsByImpact.minor}</span>
        <span class="impact-label">Mindre</span>
      </div>
    </div>
  </div>
</section>
    `;
    }

    /**
     * Bygg screenshots-sektion
     */
    private buildScreenshots(): string {
        if (!this.result.screenshots) return '';

        return `
<section class="screenshots">
  <h2>Screenshots</h2>
  <div class="screenshot-grid">
    ${this.result.screenshots.viewport ? `
    <div class="screenshot-item">
      <h3>Viewport</h3>
      <img src="data:image/png;base64,${this.result.screenshots.viewport}" alt="Viewport screenshot">
    </div>
    ` : ''}
    ${this.result.screenshots.fullPage ? `
    <div class="screenshot-item">
      <h3>Full sida</h3>
      <img src="data:image/png;base64,${this.result.screenshots.fullPage}" alt="Full page screenshot">
    </div>
    ` : ''}
  </div>
</section>
    `;
    }

    /**
     * Bygg violations-sektion
     */
    private buildViolations(): string {
        if (this.result.violations.length === 0) {
            return `
<section class="violations">
  <h2>Violations</h2>
  <div class="success-message">
    ✅ Inga violations hittades! Bra jobbat!
  </div>
</section>
      `;
        }

        const violationsByImpact = this.groupViolationsByImpact();

        return `
<section class="violations">
  <h2>Violations (${this.result.violations.length})</h2>
  ${Object.entries(violationsByImpact).map(([impact, violations]) => {
            if (violations.length === 0) return '';

            return `
    <div class="impact-section">
      <h3 class="impact-header ${impact}">${this.getImpactLabel(impact)} (${violations.length})</h3>
      ${violations.map((v, idx) => this.buildViolationCard(v, idx)).join('')}
    </div>
    `;
        }).join('')}
</section>
    `;
    }

    /**
     * Bygg violation-kort
     */
    private buildViolationCard(violation: Violation, index: number): string {
        return `
<div class="violation-card" id="violation-${index}">
  <div class="violation-header">
    <h4>${this.escapeHtml(violation.help)}</h4>
    <span class="impact-badge ${violation.impact}">${this.getImpactLabel(violation.impact)}</span>
  </div>
  
  <p class="violation-description">${this.escapeHtml(violation.description)}</p>
  
  <div class="violation-meta">
    <div class="meta-item">
      <strong>Regel-ID:</strong> <code>${violation.id}</code>
    </div>
    <div class="meta-item">
      <strong>Berörda element:</strong> ${violation.nodes.length}
    </div>
  </div>
  
  <div class="violation-nodes">
    ${violation.nodes.map((node, nodeIdx) => `
    <details class="node-details">
      <summary>Element ${nodeIdx + 1}: <code>${this.escapeHtml(node.target.join(', '))}</code></summary>
      <div class="node-content">
        <div class="node-html">
          <strong>HTML:</strong>
          <pre><code>${this.escapeHtml(node.html)}</code></pre>
        </div>
        <div class="node-failure">
          <strong>Problem:</strong>
          <p>${this.escapeHtml(node.failureSummary)}</p>
        </div>
        ${node.fix ? `
        <div class="node-fix">
          <strong>Lösning:</strong>
          <p>${this.escapeHtml(node.fix)}</p>
        </div>
        ` : ''}
      </div>
    </details>
    `).join('')}
  </div>
  
  <div class="violation-actions">
    <a href="${violation.helpUrl}" target="_blank" class="btn btn-secondary">Axe-core dokumentation</a>
    ${violation.learnMoreUrl ? `
    <a href="${violation.learnMoreUrl}" target="_blank" class="btn btn-primary">Lär dig mer (HolmDigital Wiki)</a>
    ` : ''}
  </div>
</div>
    `;
    }

    /**
     * Bygg passes-sektion
     */
    private buildPasses(): string {
        return `
<section class="passes">
  <h2>Godkända kontroller (${this.result.passes.length})</h2>
  <details>
    <summary>Visa alla godkända kontroller</summary>
    <ul class="passes-list">
      ${this.result.passes.map(pass => `
      <li>
        <strong>${this.escapeHtml(pass.description)}</strong>
        <span class="pass-count">${pass.nodeCount} element</span>
      </li>
      `).join('')}
    </ul>
  </details>
</section>
    `;
    }

    /**
     * Bygg incomplete-sektion
     */
    private buildIncomplete(): string {
        if (this.result.incomplete.length === 0) return '';

        return `
<section class="incomplete">
  <h2>Kräver manuell verifiering (${this.result.incomplete.length})</h2>
  <p class="info-message">
    ℹ️ Dessa kontroller kunde inte verifieras automatiskt och kräver manuell granskning.
  </p>
  ${this.result.incomplete.map((item, idx) => `
  <div class="incomplete-card">
    <h4>${this.escapeHtml(item.help)}</h4>
    <p>${this.escapeHtml(item.description)}</p>
    <div class="manual-instructions">
      <strong>Instruktioner:</strong>
      <p>${this.escapeHtml(item.manualCheckInstructions)}</p>
    </div>
    <div class="incomplete-nodes">
      <strong>Berörda element:</strong> ${item.nodes.length}
    </div>
  </div>
  `).join('')}
</section>
    `;
    }

    /**
     * Bygg footer
     */
    private buildFooter(): string {
        return `
<footer class="report-footer">
  <p>Genererad av <strong>HolmDigital A11y</strong> - Ett verktyg för tillgänglighetstestning</p>
  <p>Läs mer på <a href="https://a11y.holmdigital.se" target="_blank">a11y.holmdigital.se</a></p>
</footer>
    `;
    }

    /**
     * Hämta CSS-styles
     */
    private getStyles(): string {
        return `
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  
  .report-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 3rem 2rem;
  }
  
  .logo h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  .tagline {
    font-size: 1.2rem;
    opacity: 0.9;
  }
  
  .meta {
    margin-top: 2rem;
    display: grid;
    gap: 0.5rem;
  }
  
  .meta-item {
    font-size: 0.95rem;
  }
  
  .meta-item a {
    color: #fff;
    text-decoration: underline;
  }
  
  section {
    padding: 2rem;
    border-bottom: 1px solid #e0e0e0;
  }
  
  section:last-of-type {
    border-bottom: none;
  }
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #667eea;
  }
  
  h3 {
    font-size: 1.3rem;
    margin: 1.5rem 0 1rem;
  }
  
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .summary-card {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
    border: 2px solid #e0e0e0;
  }
  
  .score-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
  }
  
  .card-value {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .card-label {
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  .impact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .impact-item {
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
  }
  
  .impact-item.critical {
    background: #fee;
    border: 2px solid #f44336;
  }
  
  .impact-item.serious {
    background: #fff3e0;
    border: 2px solid #ff9800;
  }
  
  .impact-item.moderate {
    background: #fff9c4;
    border: 2px solid #ffc107;
  }
  
  .impact-item.minor {
    background: #e3f2fd;
    border: 2px solid #2196f3;
  }
  
  .impact-count {
    display: block;
    font-size: 2rem;
    font-weight: bold;
  }
  
  .violation-card {
    background: #fff;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .violation-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
  }
  
  .violation-header h4 {
    flex: 1;
    font-size: 1.2rem;
    color: #333;
  }
  
  .impact-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
    text-transform: uppercase;
  }
  
  .impact-badge.critical {
    background: #f44336;
    color: white;
  }
  
  .impact-badge.serious {
    background: #ff9800;
    color: white;
  }
  
  .impact-badge.moderate {
    background: #ffc107;
    color: #333;
  }
  
  .impact-badge.minor {
    background: #2196f3;
    color: white;
  }
  
  .violation-description {
    color: #666;
    margin-bottom: 1rem;
  }
  
  .violation-meta {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  code {
    background: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }
  
  pre {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 0.5rem 0;
  }
  
  .node-details {
    margin: 0.5rem 0;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 0.5rem;
  }
  
  .node-details summary {
    cursor: pointer;
    font-weight: 500;
    padding: 0.5rem;
  }
  
  .node-details summary:hover {
    background: #f5f5f5;
  }
  
  .node-content {
    padding: 1rem;
    border-top: 1px solid #e0e0e0;
    margin-top: 0.5rem;
  }
  
  .node-content > div {
    margin-bottom: 1rem;
  }
  
  .violation-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    display: inline-block;
    transition: all 0.3s;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .btn-secondary {
    background: #f5f5f5;
    color: #333;
    border: 2px solid #e0e0e0;
  }
  
  .btn-secondary:hover {
    background: #e0e0e0;
  }
  
  .passes-list {
    list-style: none;
    padding: 1rem;
  }
  
  .passes-list li {
    padding: 0.75rem;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
  }
  
  .pass-count {
    color: #4caf50;
    font-weight: bold;
  }
  
  .success-message, .info-message {
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
  }
  
  .success-message {
    background: #e8f5e9;
    color: #2e7d32;
    border: 2px solid #4caf50;
  }
  
  .info-message {
    background: #e3f2fd;
    color: #1565c0;
    border: 2px solid #2196f3;
  }
  
  .report-footer {
    background: #f8f9fa;
    padding: 2rem;
    text-align: center;
    color: #666;
  }
  
  .report-footer a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }
  
  .screenshot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
  }
  
  .screenshot-item img {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    body {
      padding: 1rem;
    }
    
    .summary-grid, .impact-grid {
      grid-template-columns: 1fr;
    }
    
    .violation-header {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .violation-actions {
      flex-direction: column;
    }
  }
</style>
    `;
    }

    /**
     * Hämta JavaScript
     */
    private getScripts(): string {
        return `
<script>
  // Smooth scroll till violations
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
</script>
    `;
    }

    /**
     * Hjälpfunktioner
     */
    private escapeHtml(text: string): string {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    private getStandardLabel(standard: string): string {
        const labels: Record<string, string> = {
            'wcag': 'WCAG',
            'en301549': 'EN 301 549',
            'dos-lagen': 'DOS-lagen',
            'all': 'Alla standarder',
        };
        return labels[standard] || standard;
    }

    private getImpactLabel(impact: string): string {
        const labels: Record<string, string> = {
            'critical': 'Kritisk',
            'serious': 'Allvarlig',
            'moderate': 'Måttlig',
            'minor': 'Mindre',
        };
        return labels[impact] || impact;
    }

    private getScoreClass(score: number): string {
        if (score >= 90) return 'score-excellent';
        if (score >= 70) return 'score-good';
        if (score >= 50) return 'score-fair';
        return 'score-poor';
    }

    private groupViolationsByImpact(): Record<string, Violation[]> {
        const groups: Record<string, Violation[]> = {
            critical: [],
            serious: [],
            moderate: [],
            minor: [],
        };

        this.result.violations.forEach(v => {
            if (groups[v.impact]) {
                groups[v.impact].push(v);
            }
        });

        return groups;
    }
}
