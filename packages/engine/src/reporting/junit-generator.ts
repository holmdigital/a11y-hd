import { ScanResult } from '../core/regulatory-scanner';
import { needsReviewOf, violationsOf } from './needs-review';

/**
 * Generates JUnit XML format for CI/CD integration
 * Hardened to include metadata, successful tests, and detailed failure info.
 */
export function generateJUnitXML(result: ScanResult): string {
    const { url, reports, stats, metadata } = result;
    const duration = metadata.scanDuration;
    const timestamp = result.timestamp;

    // Intern #43 fynd 1: en INCONCLUSIVE-scan mätte inte det riktiga innehållet
    // (interstitial-/vänta-sida). Tomma reports skulle annars ge "0 tests, 0
    // failures" — ser ut som en ren PASS i CI. Emitta i stället ETT <error>-
    // testcase så CI-artefakten ärligt visar att sidan inte kunde mätas.
    if (result.complianceStatus === 'INCONCLUSIVE') {
        const msg = escapeXML(
            `Scan inconclusive: the page looked like a wait/redirect/bot-challenge page (interstitial), ` +
            `so the real content was not assessed. Try a higher --wait-for-hydration. Page title: ${metadata.pageTitle || 'N/A'}`
        );
        return [
            `<?xml version="1.0" encoding="UTF-8"?>`,
            `<testsuites name="HolmDigital Accessibility Scan" time="${duration / 1000}" tests="1" failures="0" errors="1">`,
            `  <testsuite name="${escapeXML(url)}" tests="1" failures="0" skipped="0" errors="1" time="${duration / 1000}" timestamp="${timestamp}">`,
            `    <properties>`,
            `      <property name="engineVersion" value="${escapeXML(metadata.engineVersion)}"/>`,
            `      <property name="standardsVersion" value="${escapeXML(metadata.standardsVersion)}"/>`,
            `      <property name="pageTitle" value="${escapeXML(metadata.pageTitle || 'N/A')}"/>`,
            `      <property name="complianceStatus" value="INCONCLUSIVE"/>`,
            `      <property name="interstitialSuspected" value="true"/>`,
            `    </properties>`,
            `    <testcase name="Accessibility scan" classname="Accessibility.Inconclusive" time="${duration / 1000}">`,
            `      <error message="${msg}" type="inconclusive"/>`,
            `    </testcase>`,
            `  </testsuite>`,
            `</testsuites>`
        ].join('\n');
    }

    const violations = violationsOf(reports);
    const needsReview = needsReviewOf(reports);

    // Tester = pass + violations + needs review. Fel = bara violations; needs
    // review räknas som skipped, aldrig som failure (Intern #12).
    const totalTests = stats.passed + stats.total + stats.needsReview;
    const failures = stats.total;
    const skipped = stats.needsReview;

    const xmlLines = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<testsuites name="HolmDigital Accessibility Scan" time="${duration / 1000}" tests="${totalTests}" failures="${failures}">`,
        `  <testsuite name="${url}" tests="${totalTests}" failures="${failures}" skipped="${skipped}" errors="0" time="${duration / 1000}" timestamp="${timestamp}">`,
        `    <properties>`,
        `      <property name="engineVersion" value="${metadata.engineVersion}"/>`,
        `      <property name="axeCoreVersion" value="${metadata.axeCoreVersion}"/>`,
        `      <property name="standardsVersion" value="${metadata.standardsVersion}"/>`,
        `      <property name="pageTitle" value="${escapeXML(metadata.pageTitle || 'N/A')}"/>`,
        `      <property name="pageLanguage" value="${escapeXML(metadata.pageLanguage || 'N/A')}"/>`,
        `      <property name="score" value="${result.score}"/>`,
        `      <property name="complianceStatus" value="${result.complianceStatus}"/>`,
        `    </properties>`
    ];

    // 1. Add Successful Test Cases (Placeholder for now since we only have count)
    // In JUnit, it's better to show that tests actually passed than to only show failures.
    for (let i = 0; i < stats.passed; i++) {
        xmlLines.push(`    <testcase name="Passed Accessibility Rule ${i + 1}" classname="Accessibility.Success" time="0" />`);
    }

    // 2. Add Failures (Violations only — needs review exkluderas)
    violations.forEach(report => {
        const severity = report.holmdigitalInsight.diggRisk;
        // Escape XML characters
        const message = escapeXML(report.holmdigitalInsight.reasoning);
        const criteria = `WCAG ${report.wcagCriteria} | EN 301 549 ${report.en301549Criteria}`;
        const help = `Ref: ${report.dosLagenReference}. Remediation: ${report.remediation.component || 'Manual'}`;

        xmlLines.push(`    <testcase name="[${severity.toUpperCase()}] ${report.ruleId}" classname="${report.wcagCriteria}" time="0">`);
        xmlLines.push(`      <failure message="${message}" type="${severity}">${escapeXML(criteria)}\n${escapeXML(help)}</failure>`);

        // Add detailed node information in system-out if available
        if (report.failingNodes && report.failingNodes.length > 0) {
            let nodeInfo = 'Failing Nodes:\n';
            report.failingNodes.forEach((node, idx) => {
                nodeInfo += `\n[Node ${idx + 1}]\n`;
                nodeInfo += `Target: ${node.target}\n`;
                nodeInfo += `HTML: ${node.html}\n`;
                nodeInfo += `Fix: ${node.failureSummary}\n`;
            });
            xmlLines.push(`      <system-out>${escapeXML(nodeInfo)}</system-out>`);
        }

        xmlLines.push(`    </testcase>`);
    });

    // 3. Needs review (cantTell): <skipped>, aldrig <failure> (Intern #12).
    needsReview.forEach(report => {
        const message = escapeXML(report.holmdigitalInsight.reasoning);
        xmlLines.push(`    <testcase name="[NEEDS REVIEW] ${report.ruleId}" classname="${report.wcagCriteria}" time="0">`);
        xmlLines.push(`      <skipped message="${message}"/>`);
        xmlLines.push(`    </testcase>`);
    });

    xmlLines.push(`  </testsuite>`);
    xmlLines.push(`</testsuites>`);

    return xmlLines.join('\n');
}

function escapeXML(unsafe: string | number | undefined | null): string {
    if (unsafe === undefined || unsafe === null) return '';
    const str = String(unsafe);
    return str.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}
