/**
 * Cloud Client for HolmDigital Cloud Integration
 * Sends scan results to the HolmDigital Cloud API
 */

import type { ScanResult } from '../core/regulatory-scanner';
import type { EnrichedReport } from '@holmdigital/standards';
import { getEngineVersion } from '../core/regulatory-scanner';
import { needsReviewOf, violationsOf } from '../reporting/needs-review';

export interface CloudConfig {
    apiKey: string;
    cloudUrl: string;
}

export interface CloudViolation {
    rule_id: string;
    impact: string;
    wcag_criteria: string[];
    element_selector: string;
    element_html: string;
    failure_summary: string;
    fix_suggestion: string;
}

export interface CloudPayload {
    url: string;
    compliance_score: number;
    // Intern #43: INCONCLUSIVE kan bäras av typen, men sendToCloud POST:ar aldrig
    // ett sådant resultat (inget riktigt mätt innehåll att ingesta).
    compliance_status: 'PASS' | 'FAIL' | 'INCONCLUSIVE';
    total_violations: number;
    critical_count: number;
    serious_count: number;
    moderate_count: number;
    minor_count: number;
    engine_version: string;
    violations: CloudViolation[];
    /** "Needs review" (cantTell): burna från axes incomplete, aldrig fel. */
    needs_review_count: number;
    needs_review: CloudViolation[];
}

/**
 * Transform ScanResult to CloudPayload format
 */
export function transformToCloudPayload(result: ScanResult): CloudPayload {
    const toCloudViolation = (report: EnrichedReport): CloudViolation => {
        const firstNode = report.failingNodes?.[0];
        return {
            rule_id: report.ruleId,
            impact: report.holmdigitalInsight?.diggRisk || 'medium',
            wcag_criteria: report.wcagCriteria ? [report.wcagCriteria] : [],
            element_selector: Array.isArray(firstNode?.target) ? firstNode.target.join(' ') : (firstNode?.target || ''),
            element_html: firstNode?.html || '',
            failure_summary: report.holmdigitalInsight?.reasoning || report.remediation?.description || '',
            fix_suggestion: report.remediation?.description || ''
        };
    };

    // Bara verkliga fel i violations (konsekvent med total_violations = stats.total).
    // Needs review (cantTell) skickas separat, aldrig som violation (Intern #12).
    const violations = violationsOf(result.reports).map(toCloudViolation);
    const needs_review = needsReviewOf(result.reports).map(toCloudViolation);

    return {
        url: result.url,
        compliance_score: result.score,
        compliance_status: result.complianceStatus,
        total_violations: result.stats.total,
        critical_count: result.stats.critical,
        serious_count: result.stats.high,
        moderate_count: result.stats.medium,
        minor_count: result.stats.low,
        engine_version: getEngineVersion(),
        violations,
        needs_review_count: result.stats.needsReview,
        needs_review
    };
}

export interface CloudResponse {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * Send scan results to HolmDigital Cloud
 */
export async function sendToCloud(
    config: CloudConfig,
    result: ScanResult
): Promise<CloudResponse> {
    // Intern #43 fynd 1: ladda aldrig upp en INCONCLUSIVE-scan — den mätte inte
    // det riktiga innehållet. Självförsvar även om en framtida anropare glömmer
    // CLI-gaten. (compliance_status i moln-API:t är i praktiken PASS/FAIL.)
    if (result.complianceStatus === 'INCONCLUSIVE') {
        return {
            success: false,
            error: 'Scan inconclusive (interstitial/wait page) — not uploaded; no real content was assessed.'
        };
    }

    const payload = transformToCloudPayload(result);
    const endpoint = `${config.cloudUrl.replace(/\/$/, '')}/api/v1/ingest`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();

            if (response.status === 401) {
                return {
                    success: false,
                    error: 'Authentication failed. Please check your API key.'
                };
            }

            if (response.status === 403) {
                return {
                    success: false,
                    error: 'Access denied. Your API key may not have permission for this action.'
                };
            }

            return {
                success: false,
                error: `Server error (${response.status}): ${errorText}`
            };
        }

        const data = await response.json().catch(() => ({}));
        return {
            success: true,
            message: data.message || 'Results uploaded successfully'
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
            return {
                success: false,
                error: `Could not connect to cloud server at ${config.cloudUrl}`
            };
        }

        return {
            success: false,
            error: `Network error: ${errorMessage}`
        };
    }
}
