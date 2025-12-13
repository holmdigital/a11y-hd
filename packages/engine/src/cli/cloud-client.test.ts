/**
 * Unit tests for Cloud Client module
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transformToCloudPayload, sendToCloud, CloudConfig } from './cloud-client';
import type { ScanResult } from '../core/regulatory-scanner';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('cloud-client', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('transformToCloudPayload', () => {
        it('should transform ScanResult to CloudPayload format', () => {
            const scanResult: ScanResult = {
                url: 'https://example.com',
                timestamp: '2024-01-01T00:00:00Z',
                reports: [
                    {
                        ruleId: 'color-contrast',
                        wcagCriteria: '1.4.3',
                        en301549Criteria: '9.1.4.3',
                        dosLagenReference: 'Tillgänglighetsdirektivet',
                        diggRisk: 'serious',
                        eaaImpact: 'high',
                        remediation: {
                            description: 'Improve color contrast',
                            technicalGuidance: 'Use higher contrast ratio'
                        },
                        holmdigitalInsight: {
                            diggRisk: 'serious',
                            eaaImpact: 'high',
                            reasoning: 'Element has insufficient color contrast'
                        },
                        testability: {
                            automated: true,
                            requiresManualCheck: false,
                            pseudoAutomation: false,
                            complexity: 'simple'
                        },
                        failingNodes: [
                            {
                                target: 'button.submit',
                                html: '<button class="submit">Submit</button>',
                                failureSummary: 'Insufficient contrast'
                            }
                        ]
                    }
                ] as any,
                stats: {
                    critical: 0,
                    high: 1,
                    medium: 0,
                    low: 0,
                    total: 1
                },
                score: 85,
                complianceStatus: 'FAIL'
            };

            const payload = transformToCloudPayload(scanResult);

            expect(payload.url).toBe('https://example.com');
            expect(payload.compliance_score).toBe(85);
            expect(payload.compliance_status).toBe('FAIL');
            expect(payload.total_violations).toBe(1);
            expect(payload.serious_count).toBe(1);
            expect(payload.critical_count).toBe(0);
            expect(payload.engine_version).toBe('1.1.0');
            expect(payload.violations).toHaveLength(1);
            expect(payload.violations[0].rule_id).toBe('color-contrast');
            expect(payload.violations[0].element_selector).toBe('button.submit');
        });

        it('should handle empty reports', () => {
            const scanResult: ScanResult = {
                url: 'https://example.com',
                timestamp: '2024-01-01T00:00:00Z',
                reports: [],
                stats: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
                score: 100,
                complianceStatus: 'PASS'
            };

            const payload = transformToCloudPayload(scanResult);

            expect(payload.total_violations).toBe(0);
            expect(payload.compliance_status).toBe('PASS');
            expect(payload.violations).toHaveLength(0);
        });
    });

    describe('sendToCloud', () => {
        const config: CloudConfig = {
            apiKey: 'test-api-key',
            cloudUrl: 'https://cloud.test.com'
        };

        const mockResult: ScanResult = {
            url: 'https://example.com',
            timestamp: '2024-01-01T00:00:00Z',
            reports: [],
            stats: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
            score: 100,
            complianceStatus: 'PASS'
        };

        it('should send POST request with correct headers', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Success' })
            });

            await sendToCloud(config, mockResult);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://cloud.test.com/api/v1/ingest',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'test-api-key'
                    }
                })
            );
        });

        it('should return success on 200 response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Results saved' })
            });

            const response = await sendToCloud(config, mockResult);

            expect(response.success).toBe(true);
            expect(response.message).toBe('Results saved');
        });

        it('should handle 401 authentication error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: async () => 'Unauthorized'
            });

            const response = await sendToCloud(config, mockResult);

            expect(response.success).toBe(false);
            expect(response.error).toContain('Authentication failed');
        });

        it('should handle 403 forbidden error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                text: async () => 'Forbidden'
            });

            const response = await sendToCloud(config, mockResult);

            expect(response.success).toBe(false);
            expect(response.error).toContain('Access denied');
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

            const response = await sendToCloud(config, mockResult);

            expect(response.success).toBe(false);
            expect(response.error).toContain('Could not connect');
        });

        it('should strip trailing slash from cloudUrl', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });

            const configWithSlash: CloudConfig = {
                apiKey: 'test',
                cloudUrl: 'https://cloud.test.com/'
            };

            await sendToCloud(configWithSlash, mockResult);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://cloud.test.com/api/v1/ingest',
                expect.anything()
            );
        });
    });
});
