import React from 'react';
import { NavItem } from '../types';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, activeId, onNavigate, isMobile = false }) => {

  const NavLink = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const isActive = activeId === item.href;
    const isChildActive = item.children?.some(child => child.href === activeId);

    // We expand if active or if a child is active
    const isOpen = isActive || isChildActive;

    return (
      <li className="mb-1" style={{ color: '#000000', backgroundColor: '#ffffff', listStyle: 'none' }}>
        <button
          onClick={() => onNavigate(item.href)}
          aria-current={isActive ? 'page' : undefined}
          className={`
            group w-full flex items-center justify-between py-2 pr-3 pl-3 text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
            ${isActive
              ? 'bg-primary-50 text-black font-bold'
              : 'bg-white text-black hover:bg-slate-100'}
            ${depth > 0 ? 'ml-4 border-l border-slate-200 pl-4' : ''}
          `}
          style={{ color: '#000000', backgroundColor: isActive ? '#f0f9ff' : '#ffffff' }}
        >
          <span>{item.title}</span>
        </button>

        {item.children && (
          <motion.ul
            initial={false}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-1 space-y-1 overflow-hidden"
          >
            {item.children.map(child => (
              <NavLink key={child.id} item={child} depth={depth + 1} />
            ))}
          </motion.ul>
        )}
      </li>
    );
  };

  return (
    <nav
      aria-label="Main Navigation"
      className={`h-full ${isMobile ? 'p-4' : 'py-8 px-6'} overflow-y-auto`}
    >
      <ul className="space-y-4" style={{ color: '#000000', backgroundColor: '#ffffff', listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map(item => (
          <React.Fragment key={item.id}>
            {/* If it's a top level section header logic vs clickable link logic */}
            {item.children ? (
              <li className="mb-2" style={{ listStyle: 'none' }}>
                <div className="mb-2">
                  <h3 className="px-3 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2" style={{ color: '#000000' }}>
                    {item.title}
                  </h3>
                  <ul className="space-y-1" style={{ listStyle: 'none', padding: 0 }}>
                    {item.children.map(child => (
                      <NavLink key={child.id} item={child} />
                    ))}
                  </ul>
                </div>
              </li>
            ) : (
              <NavLink item={item} />
            )}
          </React.Fragment>
        ))}
      </ul>

      {/* Footer / Meta info inside sidebar */}
      <div className="mt-8 pt-8 border-t border-slate-200 px-3">


        <div className="mb-4 p-3 bg-slate-50 rounded-md border border-slate-200">
          <p className="text-xs font-semibold text-slate-900 mb-1">Need help?</p>
          <a href="https://holmdigital.se/tillganglighetsanalys" target="_blank" className="text-xs text-slate-900 hover:text-primary-900 block">
            Book an Expert Audit →
          </a>
        </div>

        <p className="text-xs text-slate-900 font-medium" style={{ color: '#000000' }}>
          v1.4.2 &bull; WCAG 2.1 AA
        </p>
      </div>
    </nav>
  );
};
