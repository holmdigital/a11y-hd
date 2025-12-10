'use client';

import { useState } from 'react';
import {
    getAllConvergenceRules,
    getAllTags,
    searchRulesByTags
} from '@holmdigital/standards';
import type { ConvergenceRule } from '@holmdigital/standards';

export default function RegulatoryMapper() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<string>('');

    const allRules = getAllConvergenceRules();
    const allTags = getAllTags();

    const filteredRules = allRules.filter(rule => {
        const matchesSearch =
            rule.wcagTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rule.wcagCriteria.includes(searchTerm) ||
            rule.en301549Criteria.includes(searchTerm);

        const matchesTag = selectedTag ? rule.tags.includes(selectedTag) : true;

        return matchesSearch && matchesTag;
    });

    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Sök WCAG (t.ex. '1.4.3' eller 'contrast')..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="p-3 border border-gray-300 rounded-lg shadow-sm"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                >
                    <option value="">Alla taggar</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-6">
                {filteredRules.map((rule) => (
                    <RuleCard key={rule.ruleId} rule={rule} />
                ))}
            </div>
        </div>
    );
}

function RuleCard({ rule }: { rule: ConvergenceRule }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{rule.wcagTitle}</h3>
                    <span className="text-sm text-gray-500 font-mono">{rule.ruleId}</span>
                </div>
                <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${rule.holmdigitalInsight.diggRisk === 'critical' ? 'bg-red-100 text-red-800' :
                        rule.holmdigitalInsight.diggRisk === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        Risk: {rule.holmdigitalInsight.diggRisk.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-800 rounded-full">
                        {rule.wcagLevel}
                    </span>
                </div>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Regulatorisk Mappning</h4>
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-600">WCAG 2.2</span>
                                <span className="font-mono font-medium">{rule.wcagCriteria}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-600">EN 301 549</span>
                                <span className="font-mono font-medium">{rule.en301549Criteria}</span>
                            </div>
                            <div className="block">
                                <span className="text-gray-600 text-sm block mb-1">DOS-lagen Reference</span>
                                <span className="font-medium text-sm text-gray-900 bg-yellow-50 px-2 py-1 rounded">
                                    {rule.dosLagenReference}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-4">HolmDigital Insight</h4>
                        <p className="mt-2 text-sm text-gray-700 italic border-l-4 border-primary-500 pl-3">
                            {rule.holmdigitalInsight.swedishInterpretation}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Remediation</h4>
                    <p className="text-sm text-gray-700">{rule.remediation.description}</p>

                    {rule.remediation.component && (
                        <div className="mt-4">
                            <span className="text-xs text-gray-500 font-bold uppercase">Rekommenderad Komponent</span>
                            <div className="mt-1 flex items-center gap-2 text-primary-600 font-mono text-sm bg-white p-2 rounded border border-gray-200">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                {rule.remediation.component}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
