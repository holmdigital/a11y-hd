/**
 * Cloud Client for HolmDigital Cloud Integration
 * Sends scan results to the HolmDigital Cloud API
 */

import type { ScanResult } from '../core/regulatory-scanner';

// Read version from package.json at build time
const ENGINE_VERSION = '1.1.0';

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
    compliance_status: 'PASS' | 'FAIL';
    total_violations: number;
    critical_count: number;
    serious_count: number;
    moderate_count: number;
    minor_count: number;
    engine_version: string;
    violations: CloudViolation[];
}

/**
 * Transform ScanResult to CloudPayload format
 */
export function transformToCloudPayload(result: ScanResult): CloudPayload {
    const violations: CloudViolation[] = result.reports.map((report: any) => {
        const firstNode = report.failingNodes?.[0];

        return {
            rule_id: report.ruleId,
            impact: report.holmdigitalInsight?.diggRisk || 'medium',
            wcag_criteria: report.wcagCriteria ? [report.wcagCriteria] : [],
            element_selector: firstNode?.target || '',
            element_html: firstNode?.html || '',
            failure_summary: report.holmdigitalInsight?.reasoning || report.remediation?.description || '',
            fix_suggestion: report.remediation?.description || ''
        };
    });

    return {
        url: result.url,
        compliance_score: result.score,
        compliance_status: result.complianceStatus,
        total_violations: result.stats.total,
        critical_count: result.stats.critical,
        serious_count: result.stats.high,
        moderate_count: result.stats.medium,
        minor_count: result.stats.low,
        engine_version: ENGINE_VERSION,
        violations
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
