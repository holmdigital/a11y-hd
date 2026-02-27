import { describe, it, expect } from 'vitest';
import { generateJUnitXML } from './junit-generator';
import { ScanResult, getEngineVersion } from '../core/regulatory-scanner';
import axeCore from 'axe-core';

describe('junit-generator', () => {
    const mockResult: ScanResult = {
        url: 'https://example.com',
        timestamp: '2026-02-08T01:51:29Z',
        metadata: {
            engineVersion: getEngineVersion(),
            axeCoreVersion: axeCore.version,
            standardsVersion: '1.2.2',
            scanDuration: 1500,
            pageTitle: 'Example',
            pageLanguage: 'en'
        },
        reports: [],
        stats: {
            passed: 42,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: 0
        },
        score: 100,
        complianceStatus: 'PASS'
    };

    it('should generate an enriched JUnit XML with metadata and passes', () => {
        const xml = generateJUnitXML(mockResult);
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('<testsuites name="HolmDigital Accessibility Scan" time="1.5" tests="42" failures="0">');
        expect(xml).toContain(`<property name="engineVersion" value="${getEngineVersion()}"/>`);
        expect(xml).toContain('<property name="pageTitle" value="Example"/>');
        expect(xml).toContain('classname="Accessibility.Success"');
    });

    it('should generate failures with detailed info', () => {
        const failureResult: ScanResult = {
            ...mockResult,
            reports: [
                {
                    ruleId: 'all-img-alt',
                    wcagCriteria: '1.1.1',
                    en301549Criteria: '9.1.1.1',
                    dosLagenReference: 'Lag 2018:1937 §7',
                    diggRisk: 'critical',
                    eaaImpact: 'high',
                    remediation: {
                        description: 'Fix alt',
                        technicalGuidance: 'Guidance',
                        component: 'Image'
                    },
                    holmdigitalInsight: {
                        diggRisk: 'critical',
                        eaaImpact: 'high',
                        reasoning: 'Missing alt text'
                    },
                    testability: { automated: true, requiresManualCheck: false, pseudoAutomation: false, complexity: 'simple' },
                    failingNodes: [
                        { target: 'img', html: '<img src="bad.jpg">', failureSummary: 'Fix it' }
                    ]
                } as any
            ],
            stats: { ...mockResult.stats, total: 1, critical: 1, passed: 0 }
        };

        const xml = generateJUnitXML(failureResult);
        expect(xml).toContain('failures="1"');
        expect(xml).toContain('message="Missing alt text"');
        expect(xml).toContain('type="critical"');
        expect(xml).toContain('classname="1.1.1"');
        expect(xml).toContain('<system-out>');
        expect(xml).toContain('Target: img');
        expect(xml).toContain('HTML: &lt;img src=&quot;bad.jpg&quot;&gt;');
    });

    it('should handle special characters correctly', () => {
        const specialResult: ScanResult = {
            ...mockResult,
            metadata: {
                ...mockResult.metadata,
                pageTitle: 'Title <with> & "chars"'
            }
        };
        const xml = generateJUnitXML(specialResult);
        expect(xml).toContain('value="Title &lt;with&gt; &amp; &quot;chars&quot;"');
    });
});
