import React from 'react';
import { Terminal } from 'lucide-react';
import { ArticleData } from '../../types';
import { CodeBlock } from '../../components/CodeBlock';

export const installationArticle: ArticleData = {
    id: 'installation',
    title: 'Installation',
    description: 'How to install and set up the HolmDigital testing suite.',
    lastUpdated: 'December 09, 2025',
    sections: [
        { id: 'prerequisites', title: 'Prerequisites' },
        { id: 'npm-install', title: 'NPM Installation' },
        { id: 'localization', title: 'Localization' },
    ],
    content: (
        <>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                The HolmDigital suite is modular. You can install only what you need, but we recommend the full toolkit for the best experience.
            </p>

            <h2 id="prerequisites" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">0. Prerequisites</h2>
            <p className="text-slate-600 mb-4">
                Our packages are published to the <strong>GitHub Package Registry</strong>. Before installing, configure npm to use GitHub for the <code>@holmdigital</code> scope:
            </p>

            <CodeBlock code={`# One-time setup: Configure npm registry for @holmdigital scope
npm config set @holmdigital:registry https://npm.pkg.github.com`} language="bash" />

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
                <p className="text-sm text-amber-700">
                    <strong>Note:</strong> If you are in a CI/CD environment (like GitHub Actions), you may need to authenticate with a <code>GITHUB_TOKEN</code>.
                    See the <a href="?article=ci-cd" className="underline">CI/CD Integration</a> guide for details.
                </p>
            </div>

            <h2 id="packages" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">1. The Packages</h2>
            <div className="space-y-4 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-primary-400 hover:shadow-md transition-all gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Terminal className="w-5 h-5 text-slate-600" />
                            <strong className="text-slate-900 text-lg">@holmdigital/engine</strong>
                        </div>
                        <p className="text-slate-600 text-sm m-0">Core scanning engine and audit tools.</p>
                    </div>
                    <CodeBlock code="npm install @holmdigital/engine" language="bash" />
                </div>
            </div>
        </>
    )
};
