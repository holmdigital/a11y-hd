
import React from 'react';
import { ArticleData } from '../../types';
import { Shield, AlertTriangle, Scale, Lock } from 'lucide-react';

export const featuresArticle: ArticleData = {
    id: 'features',
    title: 'Key Features & Compliance',
    description: 'How HolmDigital ensures compliance with EAA, DOS-lagen, and WCAG 2.1 AA.',
    lastUpdated: 'December 12, 2025',
    sections: [
        { id: 'legal', title: 'Legal Landscape' },
        { id: 'risk', title: 'Risk Management' },
        { id: 'eaa', title: 'European Accessibility Act' },
    ],
    content: (
        <>
            <p className="lead text-xl text-slate-600 mb-8">
                In today's digital landscape, accessibility is not just a "nice-to-have"—it's a legal requirement.
                HolmDigital provides the tooling ensuring you stay compliant with the <strong>European Accessibility Act (EAA)</strong>
                and national implementations like Sweden's <strong>DOS-lagen</strong>.
            </p>

            {/* LEGAL LANDSCAPE */}
            <div className="my-12">
                <h2 id="legal" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 scroll-mt-24">
                    <Scale className="h-8 w-8 text-primary-600" />
                    The Legal Landscape
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <strong className="block text-lg text-slate-900 mb-2">DOS-lagen</strong>
                        <p className="text-slate-600 text-sm mb-4">
                            "Lagen om tillgänglighet till digital offentlig service" applies to all public sector bodies in Sweden.
                            Failure to comply can result in supervision by DIGG.
                        </p>
                        <div className="text-xs font-mono bg-slate-100 p-2 rounded text-slate-700">Supported</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <strong className="block text-lg text-slate-900 mb-2">European Accessibility Act (EAA)</strong>
                        <p className="text-slate-600 text-sm mb-4">
                            Starting June 2025, accessibility requirements extend to e-commerce, banking, and private sector services.
                        </p>
                        <div className="text-xs font-mono bg-slate-100 p-2 rounded text-slate-700">Ready for 2025</div>
                    </div>
                </div>
            </div>

            {/* RISK MANAGEMENT */}
            <div className="my-12">
                <h2 id="risk" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 scroll-mt-24">
                    <Shield className="h-8 w-8 text-emerald-600" />
                    Risk Management Strategy
                </h2>
                <p className="text-slate-600 mb-6">
                    We categorize accessibility failures based on <strong>Real User Impact</strong> and <strong>Legal Risk</strong>.
                    Not all bugs are equal.
                </p>

                <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                        <div>
                            <strong className="text-red-900 block">Critical (Blocker)</strong>
                            <p className="text-red-800 text-sm">
                                A user cannot complete a primary task (e.g., "Checkout button not working with keyboard").
                                <br /><strong>Action:</strong> Blocks deployment immediately.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                        <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                        <div>
                            <strong className="text-amber-900 block">Serious (High Risk)</strong>
                            <p className="text-amber-800 text-sm">
                                Significant frustration or delay. High risk of legal complaint.
                                <br /><strong>Action:</strong> Must be fixed before next release.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AUTOMATION */}
            <div className="my-12 bg-slate-900 text-white p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">The "Shift Left" Advantage</h2>
                <p className="text-slate-300 mb-6">
                    Fixing accessibility issues in production costs <strong>100x more</strong> than fixing them during design/development.
                </p>
                <div className="grid sm:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
                        <strong className="block text-2xl font-bold text-emerald-400 mb-1">Automated</strong>
                        <span className="text-sm text-slate-400">CI/CD Checks</span>
                    </div>
                    <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
                        <strong className="block text-2xl font-bold text-blue-400 mb-1">Prescriptive</strong>
                        <span className="text-sm text-slate-400">Ready-made Components</span>
                    </div>
                    <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
                        <strong className="block text-2xl font-bold text-purple-400 mb-1">Standardized</strong>
                        <span className="text-sm text-slate-400">EN 301 549 Mapped</span>
                    </div>
                </div>
            </div>
        </>
    )
};
