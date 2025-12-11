import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface Violation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    wcagCriteria: string;
    en301549?: string;
    dosLagen?: boolean;
    nodes: number;
}

interface ScanResult {
    violations: Violation[];
    passes: number;
    url: string;
    timestamp: string;
}

export function Popup() {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async () => {
        setScanning(true);
        setError(null);
        setResult(null);

        try {
            // Get the current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.id || !tab.url) {
                throw new Error('No active tab found');
            }

            // Can't scan chrome:// or extension pages
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot scan browser internal pages');
            }

            // Send message to background script to run scan
            const response = await chrome.runtime.sendMessage({
                type: 'SCAN_PAGE',
                tabId: tab.id,
                url: tab.url
            });

            if (response.error) {
                throw new Error(response.error);
            }

            setResult(response.result);

            // Send violations to content script for highlighting
            if (response.result.violations.length > 0) {
                await chrome.tabs.sendMessage(tab.id, {
                    type: 'HIGHLIGHT_VIOLATIONS',
                    violations: response.result.violations
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Scan failed');
        } finally {
            setScanning(false);
        }
    };

    const getScoreClass = () => {
        if (!result) return '';
        return result.violations.some(v => v.impact === 'critical' || v.impact === 'serious')
            ? 'fail'
            : 'pass';
    };

    const getViolationCount = () => {
        if (!result) return 0;
        return result.violations.reduce((sum, v) => sum + v.nodes, 0);
    };

    return (
        <div className="popup">
            <header className="header">
                <div className="logo">HD</div>
                <h1>Accessibility Scanner</h1>
            </header>

            <button
                className="scan-btn"
                onClick={handleScan}
                disabled={scanning}
            >
                {scanning ? (
                    <>
                        <div className="spinner" />
                        Scanning...
                    </>
                ) : (
                    <>
                        <Search size={16} />
                        Scan This Page
                    </>
                )}
            </button>

            {error && (
                <div className="results">
                    <div className="empty-state">
                        <AlertTriangle size={32} color="#ef4444" />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="results">
                    <div className="results-header">
                        <h2>
                            {result.violations.length === 0
                                ? 'No Issues Found!'
                                : `${getViolationCount()} Issues Found`
                            }
                        </h2>
                        <span className={`score ${getScoreClass()}`}>
                            {getScoreClass() === 'pass' ? 'PASS' : 'FAIL'}
                        </span>
                    </div>

                    {result.violations.length === 0 ? (
                        <div className="empty-state">
                            <CheckCircle size={32} color="#10b981" />
                            <p>Great job! This page has no detected accessibility violations.</p>
                        </div>
                    ) : (
                        <div className="violation-list">
                            {result.violations.map((v) => (
                                <div key={v.id} className={`violation ${v.impact}`}>
                                    <div className="violation-title">{v.description}</div>
                                    <div className="violation-meta">
                                        <span className="badge wcag">WCAG {v.wcagCriteria}</span>
                                        {v.en301549 && (
                                            <span className="badge en">EN {v.en301549}</span>
                                        )}
                                        {v.dosLagen && (
                                            <span className="badge dos">DOS-lagen</span>
                                        )}
                                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94a3b8' }}>
                                            {v.nodes} element{v.nodes > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <footer className="footer">
                <a href="https://wiki.holmdigital.se" target="_blank" rel="noopener noreferrer">
                    Documentation <ExternalLink size={10} style={{ marginLeft: 2 }} />
                </a>
                {' · '}
                <span>v0.3.1 by Holm Digital AB</span>
            </footer>
        </div>
    );
}
