import type { EnrichedReport } from '@holmdigital/standards';
import { needsReviewOf, violationsOf } from './needs-review';

/**
 * Generates GitHub Actions workflow commands for annotations
 * Reference: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-warning-message
 *
 * Needs review-poster (cantTell, från axes incomplete) annoteras som `::notice`
 * — synliggörs i loggen men får ALDRIG fälla bygget (Intern #12). Verkliga fel
 * blir error (critical) eller warning.
 */
export function generateGitHubActionsAnnotations(reports: EnrichedReport[]) {
    const emit = (report: EnrichedReport, level: 'error' | 'warning' | 'notice', titlePrefix = '') => {
        const title = `${titlePrefix}[${report.ruleId}] ${report.wcagCriteria}`;
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
    };

    // Verkliga fel: error (critical) / warning (övrigt).
    violationsOf(reports).forEach(report => {
        emit(report, report.holmdigitalInsight.diggRisk === 'critical' ? 'error' : 'warning');
    });

    // Needs review (cantTell): notice — synliggörs, aldrig ett fel.
    needsReviewOf(reports).forEach(report => {
        emit(report, 'notice', '[needs review] ');
    });
}
