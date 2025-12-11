import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, ExternalLink, ChevronDown, ChevronUp, AlertCircle, Info, Zap } from 'lucide-react';

interface Violation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    wcagCriteria: string;
    en301549?: string;
    dosLagen?: boolean;
    nodes: number;
    selectors: string[];
}

interface ScanResult {
    violations: Violation[];
    passes: number;
    url: string;
    timestamp: string;
}

const impactConfig = {
    critical: { color: '#ef4444', bg: '#fef2f2', icon: AlertCircle, label: 'Kritisk' },
    serious: { color: '#f97316', bg: '#fff7ed', icon: AlertTriangle, label: 'Allvarlig' },
    moderate: { color: '#eab308', bg: '#fefce8', icon: Info, label: 'Måttlig' },
    minor: { color: '#3b82f6', bg: '#eff6ff', icon: Zap, label: 'Mindre' },
};

export function Popup() {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleScan = async () => {
        setScanning(true);
        setError(null);
        setResult(null);
        setExpandedId(null);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.id || !tab.url) {
                throw new Error('Ingen aktiv flik hittades');
            }

            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Kan inte skanna webbläsarens interna sidor');
            }

            const response = await chrome.runtime.sendMessage({
                type: 'SCAN_PAGE',
                tabId: tab.id,
                url: tab.url
            });

            if (response.error) {
                throw new Error(response.error);
            }

            setResult(response.result);

            // Highlight violations
            if (response.result.violations.length > 0) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['assets/overlay.ts-DObSc-pB.js'],
                    });
                    await new Promise(r => setTimeout(r, 100));
                    await chrome.tabs.sendMessage(tab.id, {
                        type: 'HIGHLIGHT_VIOLATIONS',
                        violations: response.result.violations
                    });
                } catch {
                    // Highlighting is optional
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Skanningen misslyckades');
        } finally {
            setScanning(false);
        }
    };

    const getStats = () => {
        if (!result) return { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 };
        return result.violations.reduce((acc, v) => {
            acc.total += v.nodes;
            acc[v.impact] = (acc[v.impact] || 0) + v.nodes;
            return acc;
        }, { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 });
    };

    const stats = getStats();
    const hasCritical = stats.critical > 0 || stats.serious > 0;

    return (
        <div className="popup">
            {/* Header */}
            <header className="header">
                <div className="logo">
                    <span>HD</span>
                </div>
                <div className="header-text">
                    <h1>Tillgänglighetsskanner</h1>
                    <p className="header-sub">WCAG · EN 301 549 · DOS-lagen</p>
                </div>
            </header>

            {/* Scan Button */}
            <button className="scan-btn" onClick={handleScan} disabled={scanning}>
                {scanning ? (
                    <>
                        <div className="spinner" />
                        Skannar...
                    </>
                ) : (
                    <>
                        <Search size={18} />
                        Skanna denna sida
                    </>
                )}
            </button>

            {/* Error State */}
            {error && (
                <div className="error-box">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="results">
                    {/* Stats Bar */}
                    <div className="stats-bar">
                        <div className={`score-badge ${hasCritical ? 'fail' : 'pass'}`}>
                            {hasCritical ? 'UNDERKÄND' : 'GODKÄND'}
                        </div>
                        <div className="stats-grid">
                            <div className="stat">
                                <span className="stat-value">{stats.total}</span>
                                <span className="stat-label">Problem</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{result.passes}</span>
                                <span className="stat-label">Godkända</span>
                            </div>
                        </div>
                    </div>

                    {/* Impact Summary */}
                    {stats.total > 0 && (
                        <div className="impact-summary">
                            {stats.critical > 0 && (
                                <div className="impact-chip critical">
                                    <AlertCircle size={12} /> {stats.critical} kritiska
                                </div>
                            )}
                            {stats.serious > 0 && (
                                <div className="impact-chip serious">
                                    <AlertTriangle size={12} /> {stats.serious} allvarliga
                                </div>
                            )}
                            {stats.moderate > 0 && (
                                <div className="impact-chip moderate">
                                    <Info size={12} /> {stats.moderate} måttliga
                                </div>
                            )}
                            {stats.minor > 0 && (
                                <div className="impact-chip minor">
                                    <Zap size={12} /> {stats.minor} mindre
                                </div>
                            )}
                        </div>
                    )}

                    {/* No Issues */}
                    {result.violations.length === 0 ? (
                        <div className="success-box">
                            <CheckCircle size={40} />
                            <h3>Inga problem hittades!</h3>
                            <p>Denna sida har inga upptäckta tillgänglighetsfel.</p>
                        </div>
                    ) : (
                        /* Violation List */
                        <div className="violation-list">
                            {result.violations.map((v) => {
                                const config = impactConfig[v.impact];
                                const Icon = config.icon;
                                const isExpanded = expandedId === v.id;

                                return (
                                    <div
                                        key={v.id}
                                        className={`violation-card ${v.impact}`}
                                        onClick={() => setExpandedId(isExpanded ? null : v.id)}
                                    >
                                        <div className="violation-header">
                                            <div className="violation-icon" style={{ background: config.bg }}>
                                                <Icon size={16} color={config.color} />
                                            </div>
                                            <div className="violation-info">
                                                <div className="violation-title">{v.description}</div>
                                                <div className="violation-badges">
                                                    <span className="badge wcag">WCAG {v.wcagCriteria}</span>
                                                    {v.en301549 && <span className="badge en">EN {v.en301549}</span>}
                                                    {v.dosLagen && <span className="badge dos">DOS</span>}
                                                    <span className="badge count">{v.nodes} st</span>
                                                </div>
                                            </div>
                                            <div className="violation-expand">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="violation-details">
                                                <div className="detail-row">
                                                    <span className="detail-label">Regel:</span>
                                                    <code>{v.id}</code>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Allvarlighet:</span>
                                                    <span style={{ color: config.color }}>{config.label}</span>
                                                </div>
                                                {v.selectors && v.selectors.length > 0 && (
                                                    <div className="detail-row selectors">
                                                        <span className="detail-label">Element:</span>
                                                        <div className="selector-list">
                                                            {v.selectors.slice(0, 3).map((s, i) => (
                                                                <code key={i}>{s}</code>
                                                            ))}
                                                            {v.selectors.length > 3 && (
                                                                <span className="more">+{v.selectors.length - 3} till</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <a
                                                    href={`https://dequeuniversity.com/rules/axe/4.10/${v.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="learn-more"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Läs mer om hur du åtgärdar detta →
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <footer className="footer">
                <a href="https://wiki.holmdigital.se" target="_blank" rel="noopener noreferrer">
                    Dokumentation <ExternalLink size={10} />
                </a>
                <span className="divider">·</span>
                <span>v0.3.1 Holm Digital AB</span>
            </footer>
        </div>
    );
}
