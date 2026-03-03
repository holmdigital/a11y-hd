import type { EnrichedReport } from '@holmdigital/standards';

/**
 * Generates GitHub Actions workflow commands for annotations
 * Reference: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-warning-message
 */
export function generateGitHubActionsAnnotations(reports: EnrichedReport[]) {
    reports.forEach(report => {
        // Map engine severity to GitHub annotation levels
        // GitHub levels: debug, notice, warning, error
        let level = 'warning';
        if (report.holmdigitalInsight.diggRisk === 'critical') {
            level = 'error';
        }

        // Construct message
        const title = `[${report.ruleId}] ${report.wcagCriteria}`;
        const message = `${report.holmdigitalInsight.reasoning}\n\nLegitimacy: ${report.dosLagenReference}\nFix: ${report.remediation.component ? `Use <${report.remediation.component} />` : 'Manual remediation required'}`;

        // Output for each failing node if available
        if (report.failingNodes && report.failingNodes.length > 0) {
            report.failingNodes.forEach((node) => {
                // Format: ::level file={name},line={line},col={col}::{message}
                // Since we don't always have file/line from a URL scan, we output as general log if missing
                // but we can try to fallback to a generic message
                console.log(`::${level} title=${title}::${message} (Target: ${node.target})`);
            });
        } else {
            console.log(`::${level} title=${title}::${message}`);
        }
    });
}
