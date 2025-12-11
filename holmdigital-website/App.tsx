
import React, { useState, useEffect } from 'react';
import { Menu, X, Search, ChevronRight, BookOpen } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, ToastProvider } from '@holmdigital/components';

import { Sidebar } from './components/Sidebar';
import { ArticleViewer } from './components/ArticleViewer';
import { SearchDialog } from './components/SearchDialog';
import { NAV_ITEMS, MOCK_ARTICLES } from './constants';
import { ArticleData } from './types';

// Blog Imports
import { BlogProvider, useBlog } from './context/BlogContext';
import { BlogList } from './components/blog/BlogList';
import { BlogPostView } from './components/blog/BlogPostView';
import { LatestPosts } from './components/blog/LatestPosts';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';

// Helper component for Content Switching
const MainContent = ({
  currentRoute,
  handleNavigate,
  breadcrumbs,
  currentArticle
}: {
  currentRoute: string;
  handleNavigate: (id: string, type?: 'article' | 'page', slug?: string) => void;
  breadcrumbs: string[];
  currentArticle: ArticleData;
}) => {
  const { isAdmin } = useBlog();
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  const slug = urlParams.get('slug');

  if (page === 'admin') {
    if (!isAdmin) {
      return <AdminLogin onLoginSuccess={() => handleNavigate('admin', 'page')} />;
    }
    return <AdminDashboard />;
  }

  if (page === 'login') {
    return <AdminLogin onLoginSuccess={() => handleNavigate('admin', 'page')} />;
  }

  if (page === 'blog') {
    return <BlogList onNavigate={(s) => handleNavigate('post', 'page', s)} />;
  }

  if (page === 'post' && slug) {
    return <BlogPostView slug={slug} onBack={() => handleNavigate('blog', 'page')} />;
  }

  return (
    <>
      <ArticleViewer article={currentArticle} breadcrumb={breadcrumbs} />
      {/* Show Latest Posts on Homepage (intro) */}
      {currentRoute === 'intro' && (
        <div className="max-w-4xl mx-auto px-8 mb-12">
          <LatestPosts
            onNavigate={(slug) => {
              if (slug) handleNavigate('post', 'page', slug);
              else handleNavigate('blog', 'page');
            }}
          />
        </div>
      )}
    </>
  );
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Initialize state from URL query parameter
  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    // If we have a page param, use that as the 'route' ID (e.g., 'blog', 'admin')
    if (page) return page;
    return params.get('article') || 'intro';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialState);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      if (page) {
        setCurrentRoute(page);
      } else {
        setCurrentRoute(params.get('article') || 'intro');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Intercept internal link clicks for SPA navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href) {
        const url = new URL(target.href);
        // Check if it's a local link with ?article=
        if (url.origin === window.location.origin && url.searchParams.has('article')) {
          e.preventDefault();
          const articleId = url.searchParams.get('article');
          if (articleId) handleNavigate(articleId);
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Routing logic
  const handleNavigate = (id: string, type: 'article' | 'page' = 'article', slug?: string) => {
    setCurrentRoute(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL without reload
    const url = new URL(window.location.href);

    // Clear existing
    url.searchParams.delete('article');
    url.searchParams.delete('page');
    url.searchParams.delete('slug');

    if (type === 'article') {
      url.searchParams.set('article', id);
    } else {
      url.searchParams.set('page', id);
      if (slug) url.searchParams.set('slug', slug);
    }

    window.history.pushState({}, '', url);
  };

  // Resolve current article or fallback
  const currentArticle: ArticleData = MOCK_ARTICLES[currentRoute] || MOCK_ARTICLES['intro'];

  // Calculate breadcrumbs based on nav structure
  const getBreadcrumbs = (id: string): string[] => {
    for (const item of NAV_ITEMS) {
      if (item.href === id) return [item.title];
      if (item.children) {
        const child = item.children.find(c => c.href === id);
        if (child) return [item.title, child.title];
      }
    }
    return ['Hem'];
  };

  const breadcrumbs = getBreadcrumbs(currentRoute);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BlogProvider>
      <ToastProvider>
        <div className="min-h-screen bg-white">
          {/* Skip Link for Accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-4 focus:ring-primary-300"
          >
            Skip to content
          </a>

          {/* Header */}
          <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 bg-white/95 supports-backdrop-blur:bg-white/60">
            <div className="max-w-8xl mx-auto">
              <div className="py-4 border-b border-slate-900/10 lg:px-8 lg:border-0 px-4 mx-4 lg:mx-0">
                <div className="relative flex items-center justify-between">

                  {/* Logo / Title */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
                      aria-label="Open navigation"
                    >
                      <Menu className="h-6 w-6" />
                    </button>

                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleNavigate('intro'); }}
                      className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-1"
                      aria-label="Holm Digital - Home"
                    >
                      <img src="/logo.jpg" alt="Holm Digital" className="h-14 md:h-16 w-auto object-contain" />
                    </a>

                    <div className="h-6 w-px bg-slate-200 mx-4 hidden sm:block"></div>

                    <a
                      href={import.meta.env.PROD ? "/wiki/" : "http://localhost:3002"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-1 hover:bg-slate-50 transition-colors"
                      aria-label="HolmDigital Wiki"
                    >
                      <div className="bg-slate-100 p-1.5 rounded-lg">
                        <BookOpen className="h-5 w-5 text-slate-600" />
                      </div>
                      <span className="text-slate-900 font-bold hidden sm:inline-block">
                        wiki<span className="text-primary-900">.holmdigital</span>
                      </span>
                    </a>
                  </div>

                  {/* Search Trigger */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="hidden lg:flex items-center w-72 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-4 pr-2 hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors group"
                      aria-label="Search documentation"
                    >
                      <Search className="h-4 w-4 mr-3 group-hover:text-slate-800" />
                      <span className="mr-auto">Quick search...</span>
                      <kbd className="font-sans font-semibold text-slate-500 border border-slate-200 rounded px-1.5 text-xs">⌘K</kbd>
                    </button>

                    <button
                      onClick={() => setSearchOpen(true)}
                      className="lg:hidden p-2 text-slate-600 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
                      aria-label="Search documentation"
                    >
                      <Search className="h-6 w-6" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </header>

          <div className="relative max-w-8xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed z-20 inset-0 top-[3.8125rem] left-[max(0px,calc(50%-45rem))] right-auto w-[19rem] pb-10 pl-8 pr-6 overflow-y-auto border-r border-slate-900/10 bg-white/50 backdrop-blur-[2px]">
              <Sidebar
                items={NAV_ITEMS}
                activeId={currentRoute}
                onNavigate={(id) => handleNavigate(id)}
              />
            </div>

            {/* Main Content Area */}
            <main className="lg:pl-[19rem] relative z-10" id="main-content">

              <MainContent
                currentRoute={currentRoute}
                handleNavigate={handleNavigate}
                breadcrumbs={breadcrumbs}
                currentArticle={currentArticle}
              />

              <footer className="mt-24 border-t border-slate-200 py-12 text-center text-sm text-slate-700">
                <p>
                  &copy; {new Date().getFullYear()} Holm Digital AB. 076 310 62 86.<br />
                  Alla Mänskliga Rättigheter bevarade för alltid. Underhålls av Holm Digital
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => handleNavigate('login', 'page')}
                    className="text-xs text-slate-700 hover:text-slate-900 transition-colors underline"
                  >
                    Logga in (Admin)
                  </button>
                </div>
              </footer>

            </main>
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                  aria-hidden="true"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                  className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden border-r border-slate-200"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navigation Menu"
                >
                  <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
                    <span className="font-bold text-slate-900">Navigation</span>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Close navigation"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="h-full overflow-y-auto pb-20">
                    <Sidebar
                      items={NAV_ITEMS}
                      activeId={currentRoute}
                      onNavigate={(id) => { handleNavigate(id); setSidebarOpen(false); }}
                      isMobile={true}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <SearchDialog
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onNavigate={(id) => handleNavigate(id)}
          />
        </div>
      </ToastProvider >
    </BlogProvider >
  );
}