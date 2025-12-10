import React from 'react';
import { SkipLink, NavigationMenu, NavItem, Breadcrumbs, BreadcrumbItem } from '@holmdigital/components';

export const NavigationDemo = () => {
    const mainMenuItems: NavItem[] = [
        { label: 'Home', href: '#' },
        {
            label: 'Services',
            children: [
                { label: 'Development', href: '#development' },
                { label: 'Design', href: '#design' },
                { label: 'Accessibility', href: '#a11y' }
            ]
        },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' }
    ];

    return (
        <div className="not-prose space-y-12">
            {/* SkipLink Demo */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">1. Skip Link (Skip to Content)</h3>
                <p className="text-slate-600 mb-6">
                    A hidden link that becomes visible on focus. Try clicking here and then pressing <kbd className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-700 font-mono">Tab</kbd> (or Shift+Tab if you clicked below).
                </p>

                <div className="relative p-8 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[200px]">
                    <SkipLink
                        targetId="demo-content"
                        style={{ position: 'absolute', top: '1rem', left: '1rem' }}
                        className="!transform-none !translate-y-0 opacity-50 focus:opacity-100 focus:ring-4"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('demo-content')?.focus();
                        }}
                    >
                        Skip to Main Content (Demo)
                    </SkipLink>

                    <div className="mt-16 space-y-4">
                        <div className="h-4 bg-slate-200 w-3/4 rounded"></div>
                        <div className="h-4 bg-slate-200 w-1/2 rounded"></div>
                        <div className="h-4 bg-slate-200 w-5/6 rounded"></div>
                        <div
                            id="demo-content"
                            tabIndex={-1}
                            className="p-4 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <span className="font-semibold text-primary-700">Main Content (Target)</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-slate-900 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-slate-300">
                        {`import { SkipLink } from '@holmdigital/components';

// Place at the top of your app (e.g., in App.tsx or Layout)
<body>
  <SkipLink targetId="main-content" />
  
  <nav>...</nav>
  
  <main id="main-content">
    ...
  </main>
</body>`}
                    </pre>
                </div>
            </div>

            {/* Breadcrumbs Demo */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">2. Breadcrumbs</h3>
                <p className="text-slate-600 mb-6">
                    Helps users understand their location (WCAG 2.4.8).
                    Separators and <code>aria-current</code> are handled automatically.
                </p>

                <div className="p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <Breadcrumbs>
                        <BreadcrumbItem href="#">Home</BreadcrumbItem>
                        <BreadcrumbItem href="#">Components</BreadcrumbItem>
                        <BreadcrumbItem isCurrent>Navigation</BreadcrumbItem>
                    </Breadcrumbs>
                </div>

                <div className="mt-4 p-4 bg-slate-900 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-slate-300">
                        {`import { Breadcrumbs, BreadcrumbItem } from '@holmdigital/components';

<Breadcrumbs>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
  <BreadcrumbItem isCurrent>Page</BreadcrumbItem>
</Breadcrumbs>`}
                    </pre>
                </div>
            </div>

            {/* Navigation Menu Demo */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">3. Navigation Menu</h3>
                <p className="text-slate-600 mb-6">
                    An accessible menu handling dropdowns with correct ARIA attributes and keyboard support.
                </p>

                <div className="p-8 bg-white border border-slate-200 rounded-xl shadow-sm min-h-[300px]">
                    <NavigationMenu items={mainMenuItems} />
                </div>

                <div className="mt-4 p-4 bg-slate-900 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-slate-300">
                        {`import { NavigationMenu } from '@holmdigital/components';

const items = [
  { label: 'Home', href: '/' },
  { 
    label: 'Services', 
    children: [
      { label: 'Web', href: '/web' },
      { label: 'App', href: '/app' }
    ] 
  }
];

<NavigationMenu items={items} />`}
                    </pre>
                </div>
            </div>
        </div>
    );
};
