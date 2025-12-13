import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAV_ITEMS, MOCK_ARTICLES } from '../constants';
import { NavItem } from '../types';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten nav items for search
  const getAllItems = (items: NavItem[]): { id: string; title: string; parent?: string }[] => {
    let flat: { id: string; title: string; parent?: string }[] = [];
    items.forEach(item => {
      flat.push({ id: item.href, title: item.title });
      if (item.children) {
        item.children.forEach(child => {
          flat.push({ id: child.href, title: child.title, parent: item.title });
        });
      }
    });
    return flat;
  };

  const allItems = getAllItems(NAV_ITEMS);

  const filteredItems = query
    ? allItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.parent && item.parent.toLowerCase().includes(query.toLowerCase())) ||
      (MOCK_ARTICLES[item.id]?.description?.toLowerCase().includes(query.toLowerCase())) // Search description too
    )
    : allItems;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden flex flex-col max-h-[70vh]"
          >
            <div className="flex items-center border-b border-slate-100 px-4 py-3">
              <Search className="h-5 w-5 text-slate-600 mr-3" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-900 placeholder:text-slate-600 text-base"
                placeholder="Search documentation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-activedescendant={filteredItems[0]?.id ? `result-${filteredItems[0].id}` : undefined}
              />
              <button
                onClick={onClose}
                className="ml-2 p-1 rounded-md text-slate-600 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              id="search-results"
              className="overflow-y-auto flex-1 p-2 space-y-1"
            >
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-slate-600">
                  <p>No results found for "{query}"</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    id={`result-${item.id}`}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-3 text-left rounded-lg group hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-slate-600 mr-3 group-hover:text-primary-500" />
                      <div>
                        <div className="text-sm font-medium text-slate-700 group-hover:text-primary-700">
                          {item.title}
                        </div>
                        {item.parent && (
                          <div className="text-xs text-slate-600">
                            in {item.parent}
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
              <span>
                <kbd className="font-sans px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-slate-600 font-medium mx-1">↑</kbd>
                <kbd className="font-sans px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-slate-600 font-medium mx-1">↓</kbd>
                to navigate
              </span>
              <span>
                <kbd className="font-sans px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-slate-600 font-medium mx-1">Enter</kbd>
                to select
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
