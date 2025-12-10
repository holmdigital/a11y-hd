import React from 'react';
import { ArticleData } from '../types';
import { ChevronRight, Calendar, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArticleViewerProps {
  article: ArticleData;
  breadcrumb: string[];
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({ article, breadcrumb }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">

        {/* Main Content Column */}
        <main className="lg:col-span-9 xl:col-span-8" id="main-content" tabIndex={-1}>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-sm text-slate-600">
            <span className="hover:text-slate-900 transition-colors">Docs</span>
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />
                <span
                  className={idx === breadcrumb.length - 1 ? "font-medium text-slate-900" : "hover:text-slate-900 transition-colors"}
                  aria-current={idx === breadcrumb.length - 1 ? 'page' : undefined}
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>

          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <header className="mb-10 pb-10 border-b border-slate-200">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                {article.title}
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-6">
                {article.description}
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.lastUpdated}>{article.lastUpdated}</time>
              </div>

            </header>

            {/* Content Body */}
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
              {article.content}
            </div>

            {/* Article Footer Navigation */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between">
              <div className="text-right ml-auto">
                {/* Placeholder for 'Next Article' logic if implemented */}
              </div>
            </div>
          </motion.div>
        </main>

        {/* Right Sidebar (Table of Contents) */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-4 pl-8">
          <div className="sticky top-24 space-y-8">
            {article.sections.length > 0 && (
              <nav aria-labelledby="toc-heading">
                <h2 id="toc-heading" className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  On this page
                </h2>
                <ul className="space-y-3 text-sm">
                  {article.sections.map(section => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="text-slate-600 hover:text-primary-600 hover:underline block transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Need help?</h3>
              <p className="text-xs text-slate-600 mb-3">
                Join our accessibility slack channel or open an issue on GitHub.
              </p>
              <button className="text-xs font-medium text-primary-700 hover:text-primary-800">
                Contact Support &rarr;
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div >
  );
};
