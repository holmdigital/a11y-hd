import React from 'react';
import { ArticleData, NavItem } from '../types';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArticleViewerProps {
  article: ArticleData;
  breadcrumb: string[];
  navItems: NavItem[];
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({ article, breadcrumb, navItems }) => {
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
              <p className="text-xl text-slate-600 leading-relaxed">
                {article.description}
              </p>
            </header>

            {/* Content Body */}
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
              {article.content}
            </div>

            {/* Article Footer Navigation */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between">
              {(() => {
                // Flatten nav items to find next/prev
                const flattenNav = (items: any[]): any[] => {
                  return items.reduce((acc, item) => {
                    acc.push(item);
                    if (item.children) acc.push(...item.children);
                    return acc;
                  }, []);
                };

                const flatNav = flattenNav(navItems);
                const currentIndex = flatNav.findIndex(item => item.href === article.id);
                const prevItem = currentIndex > 0 ? flatNav[currentIndex - 1] : null;
                const nextItem = currentIndex < flatNav.length - 1 ? flatNav[currentIndex + 1] : null;

                return (
                  <>
                    <div className="flex-1">
                      {prevItem && (
                        <a href={`?article=${prevItem.href}`} className="group flex flex-col text-slate-600 hover:text-primary-600 no-underline">
                          <span className="text-sm text-slate-500 font-medium mb-1">← Previous</span>
                          <span className="text-lg font-bold group-hover:underline">{prevItem.title}</span>
                        </a>
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      {nextItem && (
                        <a href={`?article=${nextItem.href}`} className="group flex flex-col items-end text-slate-600 hover:text-primary-600 no-underline">
                          <span className="text-sm text-slate-500 font-medium mb-1">Next →</span>
                          <span className="text-lg font-bold group-hover:underline">{nextItem.title}</span>
                        </a>
                      )}
                    </div>
                  </>
                );
              })()}
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
                Get expert accessibility auditing and consulting from Holm Digital.
              </p>
              <a
                href="https://holmdigital.se/#kontakt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary-700 hover:text-primary-800"
              >
                Contact us &rarr;
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div >
  );
};
