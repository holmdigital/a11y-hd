import React, { useState, useMemo } from 'react';
import { Rule } from '../types';
import { RuleCard } from './RuleCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';

interface FilterableListProps {
  rules: Rule[];
}

export const FilterableList: React.FC<FilterableListProps> = ({ rules }) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Extract unique tags and impact levels for filters
  const filters = useMemo(() => {
    const tags = new Set<string>(['All']);
    // Add Impact levels as high-priority filters
    tags.add('Critical');
    tags.add('AA');

    rules.forEach(rule => {
      // We can add logic here to add all tags if we wanted, 
      // but for UI cleanliness let's stick to key ones or the explicit tags
      rule.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags);
  }, [rules]);

  const filteredRules = useMemo(() => {
    if (activeFilter === 'All') return rules;
    return rules.filter(rule =>
      rule.tags.includes(activeFilter) ||
      rule.impact === activeFilter ||
      rule.wcagLevel === activeFilter
    );
  }, [rules, activeFilter]);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center mr-2 text-slate-600">
          <Filter size={16} />
          <span className="text-xs font-semibold ml-2 uppercase tracking-wide">Filters</span>
        </div>
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${activeFilter === filter
                ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-600 ring-offset-2'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}
            `}
            aria-pressed={activeFilter === filter}
          >
            {filter}
          </button>
        ))}

        {activeFilter !== 'All' && (
          <button
            onClick={() => setActiveFilter('All')}
            className="ml-auto text-xs text-slate-600 hover:text-red-500 flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Results Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <AnimatePresence mode='popLayout'>
          {filteredRules.map(rule => (
            <motion.div
              key={rule.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <RuleCard rule={rule} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredRules.length === 0 && (
        <div className="text-center py-12 text-slate-600">
          No rules found matching this filter.
        </div>
      )}
    </div>
  );
};