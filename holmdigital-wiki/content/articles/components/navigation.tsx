import React from 'react';
import { Info, CheckCircle } from 'lucide-react';
import { ArticleData } from '../../../types';
import { CodeBlock } from '../../../components/CodeBlock';
import { NavigationDemo } from '../../../components/NavigationDemo';

export const navigationArticle: ArticleData = {
    id: 'navigation',
    title: 'Navigation',
    description: 'Skip links, consistent menus, and wayfinding for accessible navigation.',
    lastUpdated: 'December 12, 2025',
    sections: [
        { id: 'bypass', title: 'Bypass Blocks (Skip Link)' },
        { id: 'consistent', title: 'Consistent Navigation' },
        { id: 'focus', title: 'Focus Indication' }
    ],
    content: (
        <>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Users must be able to navigate your content efficiently. For keyboard and screen reader users, this means providing shortcuts
                to skip repetitive content and clear indications of where they are.
            </p>

            {/* REGULATORY CONTEXT */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-md">
                <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Regulatory Context
                </h4>
                <p className="text-sm text-blue-800">
                    <strong>Bypass Blocks (WCAG 2.4.1)</strong>: A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.
                    <br /><br />
                    <strong>Focus Visible (WCAG 2.4.7)</strong>: Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.
                    <br /><br />
                    <strong>Consistent Navigation (WCAG 3.2.3)</strong>: Navigational mechanisms that are repeated on multiple Web pages occur in the same relative order.
                </p>
            </div>

            <h2 id="bypass" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">1. Skip to Content</h2>
            <p className="text-slate-600 mb-4">
                Every page must have a "Skip to main content" link as the very first focusable element. This allows keyboard users to jump straight to the content
                without tabbing through the entire navigation menu on every page load.
            </p>
            <CodeBlock code={`/* Tailwind class for visually hidden but focusable skip link */
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-primary-600 focus:text-white focus:p-4 focus:z-50"
>
  Skip to main content
</a>`} language="tsx" />

            <h2 id="consistent" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">2. Consistent Navigation</h2>
            <p className="text-slate-600 mb-4">
                Keep your primary navigation, search, and footer in the same place across the site. Using a consistent layout component handles this automatically.
            </p>
            <NavigationDemo />

            <h2 id="focus" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">3. Visble Focus</h2>
            <p className="text-slate-600 mb-4">
                Never remove the default focus outline (`outline: none`) unless you replace it with something better.
            </p>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Best Practices</h4>
                <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Use a high-contrast outline color (often blue or black/white double line).</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Ensure the outline has at least <strong>3:1 contrast</strong> against the background.</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Consider using `focus-visible` to only show the ring for keyboard users, if preferred design-wise.</span>
                    </li>
                </ul>
            </div>
        </>
    )
};
