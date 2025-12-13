import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ArticleData } from '../../types';
import { FilterableList } from '../../components/FilterableList';
import { RULES_DATA, MOCK_MANUAL_CHECKS } from '../../constants';

export const standardsArticle: ArticleData = {
    id: 'standards',
    title: 'Standards Explorer',
    description: 'Explore our database of WCAG rules, impact assessments, and remediation strategies.',
    lastUpdated: 'November 10, 2023',
    sections: [
        { id: 'explorer', title: 'Rule Database' }
    ],
    content: (
        <>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Use the explorer below to filter through our supported accessibility rules.
                Cards indicate the WCAG compliance level and the severity of a failure.
            </p>

            <div id="explorer" className="not-prose scroll-mt-24">
                <FilterableList rules={RULES_DATA} />
            </div>

            <div className="mt-12 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">How we determine Impact</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Our impact scoring model is derived from the <a href="#" className="text-primary-600 hover:underline">ACT Rules Format</a>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                        <div>
                            <span className="font-semibold text-sm text-slate-900 block">Critical</span>
                            <span className="text-xs text-slate-600">Stops a user from completing a task.</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        <div>
                            <span className="font-semibold text-sm text-slate-900 block">Serious</span>
                            <span className="text-xs text-slate-600">Causes significant frustration or delay.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16">
                <h2 id="manual-checks" className="text-2xl font-bold text-slate-900 mb-6 scroll-mt-24">Manual Verification Checks (ICT)</h2>
                <p className="text-slate-600 mb-6">
                    These checks cover requirements that cannot be fully automated (e.g., hardware interaction, documentation quality).
                    They are mapped to <strong>EN 301 549</strong> chapters.
                </p>

                <div className="space-y-6">
                    {MOCK_MANUAL_CHECKS.map((check) => (
                        <div key={check.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                    {check.id} (Ch. {check.chapter})
                                </span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${check.eaaRelevance === 'high' ? 'bg-amber-100 text-amber-800' :
                                    check.eaaRelevance === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    Priority: {check.eaaRelevance.toUpperCase()}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{check.title}</h3>
                            <p className="text-slate-700 mb-4">{check.description}</p>

                            <div className="bg-slate-50 p-4 rounded-md space-y-3">
                                <div>
                                    <strong className="text-slate-900 text-sm block mb-1">Checklist Item:</strong>
                                    <div className="flex items-start gap-2 text-slate-700 text-sm">
                                        <CheckCircle size={16} className="mt-0.5 text-slate-600" />
                                        <span>{check.checklistItem}</span>
                                    </div>
                                </div>
                                <div>
                                    <strong className="text-slate-900 text-sm block mb-1">Guidance:</strong>
                                    <p className="text-sm text-slate-600 italic border-l-2 border-primary-300 pl-3">
                                        {check.swedishGuidance}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
};
