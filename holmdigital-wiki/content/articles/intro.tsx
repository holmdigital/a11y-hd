import React from 'react';
import { LayoutTemplate, CheckCircle } from 'lucide-react';
import { ArticleData } from '../../types';

export const introArticle: ArticleData = {
    id: 'intro',
    title: 'Welcome to HolmDigital Wiki',
    description: 'The central documentation hub for our accessibility testing suite and design system.',
    lastUpdated: 'October 24, 2023',
    sections: [
        { id: 'overview', title: 'Overview' },
        { id: 'features', title: 'Key Features' },
    ],
    content: (
        <>
            <div className="prose prose-slate max-w-none">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                    <h3 className="text-blue-900 text-lg font-semibold mt-0 mb-2">Internal Documentation Hub</h3>
                    <p className="text-blue-800 m-0">
                        This Wiki serves as the central knowledge base for HolmDigital's development standards,
                        accessibility testing suite, and component library.
                    </p>
                </div>

                <h2>Overview</h2>
                <p>
                    Our mission is to build digital experiences that are accessible to everyone. This wiki documents
                    the tools and standards we use to achieve that goal, specifically mapped to <strong>WCAG 2.1 AA</strong>,
                    <strong>EN 301 549</strong>, and national regulations (DOS-lagen, BITV 2.0, RGAA).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="p-6 rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                            <LayoutTemplate className="h-6 w-6 text-primary-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Component Library</h3>
                        <p className="text-slate-600 text-sm mb-4">
                            Accessible-by-default React components that automatically pass our audits.
                        </p>
                        <a href="?article=components" className="text-primary-600 font-medium text-sm hover:underline">View Components →</a>
                    </div>

                    <div className="p-6 rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Automated Testing</h3>
                        <p className="text-slate-600 text-sm mb-4">
                            Our engine checks for compliance against 50+ rules derived from EU law.
                        </p>
                        <a href="?article=standards" className="text-primary-600 font-medium text-sm hover:underline">Explore Rules →</a>
                    </div>
                </div>
            </div>
        </>
    )
};
