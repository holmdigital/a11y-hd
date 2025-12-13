import React from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { ArticleData } from '../../../types';
import { CodeBlock } from '../../../components/CodeBlock';

export const structureArticle: ArticleData = {
    id: 'content-structure',
    title: 'Structure & Content',
    description: 'How to use Semantic HTML, Headings, and Landmarks to create a robust page structure.',
    lastUpdated: 'December 12, 2025',
    sections: [
        { id: 'semantics', title: 'Semantic HTML' },
        { id: 'headings', title: 'Headings Hierarchy' },
        { id: 'landmarks', title: 'Landmarks' }
    ],
    content: (
        <>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Visual structure is not enough. We must use <strong>Semantic HTML</strong> to communicate the structure of our content
                to assistive technologies. A `div` that looks like a button is not a button; a `span` that looks like a heading is not a heading.
            </p>

            {/* REGULATORY CONTEXT */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-md">
                <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Regulatory Context
                </h4>
                <p className="text-sm text-blue-800">
                    <strong>Info and Relationships (WCAG 1.3.1)</strong> requires that information, structure, and relationships conveyed through
                    presentation can be programmatically determined.
                    <br /><br />
                    <strong>Headings and Labels (WCAG 2.4.6)</strong> requires headings to describe the topic or purpose.
                    <br /><br />
                    <strong>EN 301 549 (9.1.3.1)</strong> mirrors this requirement for all ICT products.
                </p>
            </div>

            <h2 id="semantics" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">1. Semantic HTML</h2>
            <p className="text-slate-600 mb-4">
                Always use the correct HTML element for the job. Use `button` for actions, `a` for links, `table` for tabular data, etc.
            </p>
            <div className="grid md:grid-cols-2 gap-6 my-6">
                <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                    <h4 className="flex items-center gap-2 font-bold text-green-800 mb-2">
                        <CheckCircle className="h-4 w-4" /> Do this
                    </h4>
                    <CodeBlock code={`<button onClick={save}>Save</button>`} language="tsx" />
                    <p className="text-xs text-green-700 mt-2">Native keyboard support, focus handling, and role announcement.</p>
                </div>
                <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                    <h4 className="flex items-center gap-2 font-bold text-red-800 mb-2">
                        <AlertTriangle className="h-4 w-4" /> Don't do this
                    </h4>
                    <CodeBlock code={`<div className="btn" onClick={save}>Save</div>`} language="tsx" />
                    <p className="text-xs text-red-700 mt-2">No keyboard focus, no "button" role, "clickable" div hell.</p>
                </div>
            </div>

            <h2 id="headings" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">2. Headings Hierarchy</h2>
            <p className="text-slate-600 mb-4">
                Screen reader users often browse by headings to get an overview of the page. Structure your page like a document outline.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-6">
                <li><strong>One `h1` per page:</strong> Usually the page title.</li>
                <li><strong>Don't skip levels:</strong> Do not jump from `h2` to `h4`.</li>
                <li><strong>Don't pick by size:</strong> Use CSS to style the heading, not the tag (e.g., <code>&lt;h2 className="text-sm"&gt;</code>).</li>
            </ul>

            <h2 id="landmarks" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">3. Landmarks</h2>
            <p className="text-slate-600 mb-4">
                Landmarks allow users to jump between major sections of the page.
            </p>
            <CodeBlock code={`<body>
  <header> <!-- Banner -->
    <nav> <!-- Navigation -->
      ...
    </nav>
  </header>
  
  <main> <!-- Main Content -->
    <h1>Page Title</h1>
    ...
    <aside> <!-- Complementary -->
      ...
    </aside>
  </main>
  
  <footer> <!-- Contentinfo -->
    ...
  </footer>
</body>`} language="html" />
        </>
    )
};
