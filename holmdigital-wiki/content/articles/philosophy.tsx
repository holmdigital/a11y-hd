import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ArticleData } from '../../types';

export const philosophyArticle: ArticleData = {
    id: 'philosophy',
    title: 'Accessibility Philosophy',
    description: 'Accessibility is not a feature; it is a fundamental human right.',
    lastUpdated: 'December 08, 2025',
    sections: [],
    content: (
        <>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                We believe that accessibility should be "shifted left"—handled as early as possible in the development lifecycle.
                Instead of fixing bugs after they are found, we provide tools to prevent them from being written in the first place.
            </p>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 my-8">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Core Principles</h3>
                <ul className="space-y-4">
                    <li className="flex gap-3">
                        <CheckCircle className="text-green-600 h-6 w-6 flex-shrink-0" />
                        <div>
                            <strong className="block text-slate-900">Perceivable</strong>
                            <span className="text-slate-600">Information must be presented in ways users can perceive (e.g., text alternatives, sufficient contrast).</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <CheckCircle className="text-green-600 h-6 w-6 flex-shrink-0" />
                        <div>
                            <strong className="block text-slate-900">Operable</strong>
                            <span className="text-slate-600">Interface components and navigation must be operable (e.g., keyboard accessible, no timing traps).</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <CheckCircle className="text-green-600 h-6 w-6 flex-shrink-0" />
                        <div>
                            <strong className="block text-slate-900">Understandable</strong>
                            <span className="text-slate-600">Information and operation must be understandable (e.g., readable text, predictable behavior).</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <CheckCircle className="text-green-600 h-6 w-6 flex-shrink-0" />
                        <div>
                            <strong className="block text-slate-900">Robust</strong>
                            <span className="text-slate-600">Content must be robust enough to be interpreted reliably (e.g., valid HTML parsing).</span>
                        </div>
                    </li>
                </ul>
            </div>
        </>
    )
};


