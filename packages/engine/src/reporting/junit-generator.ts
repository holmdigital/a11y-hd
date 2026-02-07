import { RegulatoryReport } from '@holmdigital/standards';

/**
 * Generates JUnit XML format for CI/CD integration
 */
export function generateJUnitXML(reports: RegulatoryReport[], url: string, duration: number): string {
    const failures = reports.length;
    const testSuites = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<testsuites name="HolmDigital Accessibility Scan" time="${duration / 1000}">`,
        `  <testsuite name="${url}" tests="${failures}" failures="${failures}" errors="0" time="${duration / 1000}">`
    ];

    reports.forEach(report => {
        const severity = report.holmdigitalInsight.diggRisk;
        // Escape XML characters
        const message = escapeXML(report.holmdigitalInsight.reasoning);
        const criteria = escapeXML(`WCAG ${report.wcagCriteria} | EN 301 549 ${report.en301549Criteria}`);
        const help = escapeXML(`Ref: ${report.dosLagenReference}. Remediation: ${report.remediation.component || 'Manual'}`);

        testSuites.push(`    <testcase name="[${severity.toUpperCase()}] ${report.ruleId}" classname="${report.wcagCriteria}" time="0">`);
        testSuites.push(`      <failure message="${message}" type="${severity}">${criteria}\n${help}</failure>`);
        testSuites.push(`    </testcase>`);
    });

    testSuites.push(`  </testsuite>`);
    testSuites.push(`</testsuites>`);

    return testSuites.join('\n');
}

function escapeXML(unsafe: any): string {
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
