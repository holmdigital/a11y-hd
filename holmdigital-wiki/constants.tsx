import React from 'react';
import { NavItem, ArticleData, Rule } from './types';
import { Terminal, AlertTriangle, CheckCircle, Info, LayoutTemplate } from 'lucide-react';
import { FilterableList } from './components/FilterableList';
import { DialogDemo } from './components/DialogDemo';
import { NavigationDemo } from './components/NavigationDemo';
import { ContentDemo } from './components/ContentDemo';
import { FormPrimitivesDemo } from './components/FormPrimitivesDemo';
import { ToastDemo } from './components/ToastDemo';
import { TooltipDemo } from './components/TooltipDemo';


import { getAllConvergenceRules, getICTManualChecklist, ConvergenceRule, EAAImpact } from '@holmdigital/standards';

// --- DATA MAPPING ---
// Helper to map EAA Impact (lowercase) to Wiki Impact (Capitalized)
const mapImpact = (impact: EAAImpact): 'Critical' | 'Serious' | 'Moderate' | 'Minor' => {
  switch (impact) {
    case 'critical': return 'Critical';
    case 'high': return 'Serious';
    case 'medium': return 'Moderate';
    case 'low': return 'Minor';
    default: return 'Minor';
  }
};

// Fetch real data from standards package
const realRules = getAllConvergenceRules();
const manualChecks = getICTManualChecklist();

export const RULES_DATA: Rule[] = realRules.map((r: any) => ({
  id: r.ruleId,
  name: r.en301549Title || r.wcagTitle || r.ruleId,
  wcagId: r.wcagCriteria,
  wcagLevel: r.wcagLevel,
  impact: mapImpact(r.holmdigitalInsight.eaaImpact),
  description: r.remediation.description,
  tags: r.tags,
  technicalGuidance: r.remediation.technicalGuidance,
  commonMistakes: r.holmdigitalInsight.commonMistakes,
  whyItMatters: r.holmdigitalInsight.priorityRationale,
  codeExample: r.remediation.codeExample,
  insight: r.holmdigitalInsight.swedishInterpretation // Using this as general insight/context
}));


// --- NAVIGATION ---
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'intro',
    title: 'Introduction',
    href: 'intro',
    children: [
      { id: 'about', title: 'About HolmDigital', href: 'about' },
      { id: 'philosophy', title: 'Accessibility Philosophy', href: 'philosophy' },
    ],
  },
  {
    id: 'standards',
    title: 'Standards Explorer',
    href: 'standards',
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    href: 'getting-started',
    children: [
      { id: 'installation', title: 'Installation', href: 'installation' },
      { id: 'config', title: 'Configuration', href: 'configuration' },
      { id: 'ci-cd', title: 'CI/CD Integration', href: 'ci-cd' },
    ],
  },
  {
    id: 'components',
    title: 'Core Components',
    href: 'components',
    children: [
      { id: 'buttons', title: 'Buttons & Links', href: 'buttons' },
      { id: 'forms', title: 'Form Controls', href: 'forms' },
      { id: 'modals', title: 'Dialogs & Modals', href: 'modals' },
      { id: 'feedback', title: 'Feedback & Overlays', href: 'feedback' },
      { id: 'navigation', title: 'Navigation', href: 'navigation' },
      { id: 'content-structure', title: 'Structure & Content', href: 'content-structure' },
    ],
  },
];

// --- CONTENT MAPPING ---
export const MOCK_ARTICLES: Record<string, ArticleData> = {
  'intro': {
    id: 'intro',
    title: 'Welcome to HolmDigital Wiki',
    description: 'The central documentation hub for our accessibility testing suite and design system.',
    lastUpdated: 'October 24, 2023',
    sections: [
      { id: 'overview', title: 'Overview' },
      { id: 'features', title: 'Key Features' },
    ],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
            <h3 className="text-blue-900 text-lg font-semibold mt-0 mb-2">Internal Documentation Hub</h3>
            <p className="text-blue-800 m-0">
              This Wiki serves as the central knowledge base for HolmDigital's development standards,
              accessibility testing suite, and component library.
            </p>
          </div>

          <h2>Overview</h2>
          <p>
            Our mission is to build digital experiences that are accessible to everyone. This wiki documents
            the tools and standards we use to achieve that goal, specifically mapped to <strong>WCAG 2.1 AA</strong>,
            <strong>EN 301 549</strong>, and national regulations (DOS-lagen, BITV 2.0, RGAA).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="p-6 rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <LayoutTemplate className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Component Library</h3>
              <p className="text-slate-600 text-sm mb-4">
                Accessible-by-default React components that automatically pass our audits.
              </p>
              <a href="?article=components" className="text-primary-600 font-medium text-sm hover:underline">View Components →</a>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Automated Testing</h3>
              <p className="text-slate-600 text-sm mb-4">
                Our engine checks for compliance against 50+ rules derived from EU law.
              </p>
              <a href="?article=standards" className="text-primary-600 font-medium text-sm hover:underline">Explore Rules →</a>
            </div>
          </div>
        </div>
      </>
    )
  },
  'about': {
    id: 'about',
    title: 'About HolmDigital',
    description: 'Digital Accessibility, SEO & Web Development Consulting.',
    lastUpdated: 'December 10, 2025',
    sections: [
      { id: 'services', title: 'Our Services' },
      { id: 'audit', title: 'Accessibility Audit' },
      { id: 'seo', title: 'SEO' }
    ],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <p className="lead text-xl text-slate-600">
            Holm Digital helps companies grow through accessible and result-oriented digital solutions
            that create visibility, impact, and long-term success.
          </p>

          <div className="my-8">
            <h2 id="audit">Accessibility Analysis (WCAG 2.2)</h2>
            <p>
              I help companies reach more customers through an analysis of the website's usability,
              identifying hidden barriers without the need to rebuild the entire site or risk legal consequences.
            </p>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h4 className="mt-0 text-slate-900">Expert Audit Options</h4>
              <ul className="mb-4">
                <li><strong>Small Report:</strong> 5-10 prioritized remarks</li>
                <li><strong>Medium Report:</strong> 15-30 remarks</li>
                <li><strong>Full WCAG Audit:</strong> 50-100+ remarks with detailed action plan</li>
              </ul>
              <a
                href="https://holmdigital.se/tillganglighetsanalys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Book an Analysis
              </a>
            </div>
          </div>

          <div className="my-8">
            <h2 id="seo">Search Engine Optimization (SEO)</h2>
            <p>
              Optimizing your website and content to improve visibility and ranking on search engine result lists.
              By optimizing your site, I help Google find your homepage. The goal is to attract organic traffic
              that converts.
            </p>
            <a
              href="https://holmdigital.se/sokmotoroptimering"
              className="text-primary-600 font-semibold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read more about SEO Services →
            </a>
          </div>

          <div className="my-8">
            <h2 id="dev">Web Development</h2>
            <p>
              Helping you develop your website, e-commerce, or app with new pages, analysis tools, forms, or content.
              Also available for building completely new websites from scratch with accessibility built-in.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div>
              <h3 className="mt-0 mb-2">Need a custom solution?</h3>
              <p className="mb-0 text-slate-600">Contact us to discuss your specific needs.</p>
            </div>
            <a
              href="https://holmdigital.se/kontakt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Contact HolmDigital
            </a>
          </div>

        </div>
      </>
    )
  },
  'standards': {
    id: 'standards',
    title: 'Standards Explorer',
    description: 'Explore our database of WCAG rules, impact assessments, and remediation strategies.',
    lastUpdated: 'November 10, 2023',
    sections: [
      { id: 'explorer', title: 'Rule Database' }
    ],
    content: (
      <>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Use the explorer below to filter through our supported accessibility rules.
          Cards indicate the WCAG compliance level and the severity of a failure.
        </p>

        <div id="explorer" className="not-prose scroll-mt-24">
          <FilterableList rules={RULES_DATA} />
        </div>

        <div className="mt-12 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-2">How we determine Impact</h3>
          <p className="text-sm text-slate-600 mb-4">
            Our impact scoring model is derived from the <a href="#" className="text-primary-600 hover:underline">ACT Rules Format</a>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
              <div>
                <span className="font-semibold text-sm text-slate-900 block">Critical</span>
                <span className="text-xs text-slate-600">Stops a user from completing a task.</span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
              <div>
                <span className="font-semibold text-sm text-slate-900 block">Serious</span>
                <span className="text-xs text-slate-600">Causes significant frustration or delay.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 id="manual-checks" className="text-2xl font-bold text-slate-900 mb-6 scroll-mt-24">Manual Verification Checks (ICT)</h2>
          <p className="text-slate-600 mb-6">
            These checks cover requirements that cannot be fully automated (e.g., hardware interaction, documentation quality).
            They are mapped to <strong>EN 301 549</strong> chapters.
          </p>

          <div className="space-y-6">
            {manualChecks.map((check) => (
              <div key={check.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {check.id} (Ch. {check.chapter})
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${check.eaaRelevance === 'high' ? 'bg-amber-100 text-amber-800' :
                    check.eaaRelevance === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                    Priority: {check.eaaRelevance.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{check.title}</h3>
                <p className="text-slate-700 mb-4">{check.description}</p>

                <div className="bg-slate-50 p-4 rounded-md space-y-3">
                  <div>
                    <strong className="text-slate-900 text-sm block mb-1">Checklist Item:</strong>
                    <div className="flex items-start gap-2 text-slate-700 text-sm">
                      <CheckCircle size={16} className="mt-0.5 text-slate-600" />
                      <span>{check.checklistItem}</span>
                    </div>
                  </div>
                  <div>
                    <strong className="text-slate-900 text-sm block mb-1">Guidance:</strong>
                    <p className="text-sm text-slate-600 italic border-l-2 border-primary-300 pl-3">
                      {check.swedishGuidance}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  },

  'philosophy': {
    id: 'philosophy',
    title: 'Accessibility Philosophy',
    description: 'Accessibility is not a feature; it is a fundamental human right.',
    lastUpdated: 'December 08, 2025',
    sections: [],
    content: (
      <>
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          We believe that accessibility should be "shifted left"—handled as early as possible in the development lifecycle.
          Instead of fixing bugs after they are found, we provide tools to prevent them from being written in the first place.
        </p>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 my-8">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Core Principles</h3>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <CheckCircle className="text-green-600 h-6 w-6 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900">Perceivable</strong>
                <span className="text-slate-600">Information must be presented in ways users can perceive (e.g., text alternatives, sufficient contrast).</span>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="text-green-600 h-6 w-6 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900">Operable</strong>
                <span className="text-slate-600">Interface components and navigation must be operable (e.g., keyboard accessible, no timing traps).</span>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="text-green-600 h-6 w-6 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900">Understandable</strong>
                <span className="text-slate-600">Information and operation must be understandable (e.g., readable text, predictable behavior).</span>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="text-green-600 h-6 w-6 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900">Robust</strong>
                <span className="text-slate-600">Content must be robust enough to be interpreted reliably (e.g., valid HTML parsing).</span>
              </div>
            </li>
          </ul>
        </div>
      </>
    )
  },
  'features': {
    id: 'features',
    title: 'Key Features',
    description: 'Under construction.',
    lastUpdated: 'December 08, 2025',
    sections: [],
    content: <p>Content coming soon.</p>
  },
  'configuration': {
    id: 'config',
    title: 'Configuration',
    description: 'Configure the engine and scanner for your specific needs.',
    lastUpdated: 'December 08, 2025',
    sections: [],
    content: (
      <>
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          The scanner can be configured via a <code>holmdigital.config.js</code> file or CLI arguments.
        </p>
        <h3 className="text-lg font-bold text-slate-900 mb-4">CLI Options</h3>
        <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto mb-6">
          {`npx hd-a11y-scan <url> [options]

Options:
  --ci          Run in CI mode (exit code 1 on failure)
  --json        Output results as JSON
  --pdf         Generate a PDF report
  --viewport    Set viewport size (e.g., "mobile", "desktop")`}
        </pre>
      </>
    )
  },
  'ci-cd': {
    id: 'ci-cd',
    title: 'CI/CD Integration',
    description: 'Automate accessibility testing in your build pipelines.',
    lastUpdated: 'December 09, 2025',
    sections: [
      { id: 'github', title: 'GitHub Actions' },
      { id: 'gitlab', title: 'GitLab CI' }
    ],
    content: (
      <>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          The <code>@holmdigital/engine</code> is designed to fail builds when accessibility violations are detected.
          Use the <code>--ci</code> flag to ensure the process exits with code 1.
        </p>

        <h2 id="github" className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24">GitHub Actions</h2>
        <div className="bg-slate-900 rounded-lg p-4 mb-8 overflow-x-auto">
          <pre className="text-sm font-mono text-slate-50">
            {`name: Accessibility Check
on: [push, pull_request]

jobs:
  a11y-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      
      - name: Build Application
        run: npm run build
      
      - name: Start Server
        run: npm start &
        env:
          PORT: 3000
      
      - name: Run Accessibility Scan
        run: npx hd-a11y-scan http://localhost:3000 --ci
        continue-on-error: false`}
          </pre>
        </div>

        <h2 id="gitlab" className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24">GitLab CI</h2>
        <div className="bg-slate-900 rounded-lg p-4 mb-8 overflow-x-auto">
          <pre className="text-sm font-mono text-slate-50">
            {`a11y_check:
  image: node:18
  stage: test
  script:
    - npm ci
    - npm run build
    - npm start &
    - sleep 10
    - npx hd-a11y-scan http://localhost:3000 --ci
  allow_failure: false`}
          </pre>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <strong>Tip:</strong> You can also generate a JSON report using the <code>--json</code> flag
                and upload it as a build artifact for deeper analysis.
              </p>
            </div>
          </div>
        </div>
      </>
    )
  },
  'buttons': {
    id: 'buttons',
    title: 'Buttons & Links',
    description: 'Prescriptive Button component that guarantees contrast and touch target size.',
    lastUpdated: 'December 08, 2025',
    sections: [],
    content: (
      <>
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          The <code>Button</code> component is designed to solve common WCAG failures automatically.
          It enforces color contrast ratios and minimum touch target sizes (44x44px).
        </p>

        {/* REGULATORY CONTEXT */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-md">
          <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Regulatory Context
          </h4>
          <p className="text-sm text-blue-800">
            Audits frequently fail buttons for <strong>poor contrast (WCAG 1.4.3)</strong> or <strong>missing focus indicators (WCAG 2.4.7)</strong>.
            In strict environments (like public sector), "ghost buttons" without borders often fail <strong>Non-text Contrast (1.4.11)</strong>.
            This component guarantees satisfying all these criteria by default.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Compliance Features</h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <span><strong>WCAG 1.4.3:</strong> Pre-validated contrast ratios for all variants.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <span><strong>WCAG 2.4.7:</strong> High-visibility focus indicators.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <span><strong>EN 301 549:</strong> Minimum touch target size (44px).</span>
              </li>
            </ul>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg">
            <h3 className="font-bold text-slate-900 mb-4">Example Usage</h3>
            <pre className="text-sm overflow-x-auto bg-white p-4 rounded border border-slate-100">
              {`import { Button } from '@holmdigital/components';

export const MyForm = () => (
  <Button 
    variant="primary" 
    onClick={() => submit()}
    isLoading={isSubmitting}
  >
    Submit Form
  </Button>
);`}
            </pre>
          </div>
        </div>

        {/* PROPS TABLE */}
        <h3 className="text-xl font-bold text-slate-900 mb-4">Props Reference</h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">Prop</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Type</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Default</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm">
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">variant</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">'primary' | 'secondary' | 'ghost' | 'danger'</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">'primary'</td>
                <td className="px-3 py-4 text-slate-600">Visual style. All variants maintain accessible contrast.</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">isLoading</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">boolean</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">false</td>
                <td className="px-3 py-4 text-slate-600">Shows loading spinner and disables interaction. announces state to screen readers.</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">type</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">'button' | 'submit' | 'reset'</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">'button'</td>
                <td className="px-3 py-4 text-slate-600">HTML button type.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    )
  },
  'forms': {
    id: 'forms',
    title: 'Form Controls',
    description: 'Accessible form fields, checkboxes, and radio groups.',
    lastUpdated: 'December 09, 2025',
    sections: [],
    content: (
      <>
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          Forms are notoriously difficult to get right. Our accessible primitives handle IDs, labels,
          keyboard navigation, and error messaging automatically.
        </p>

        {/* REGULATORY CONTEXT */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-md">
          <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Regulatory Context
          </h4>
          <p className="text-sm text-blue-800">
            <strong>Info and Relationships (WCAG 1.3.1)</strong> and <strong>Labels or Instructions (3.3.2)</strong> are
            top failure points. If an error message is visible but not programmatically linked (via <code>aria-describedby</code>)
            to the input, screen reader users will not know why the form failed. This component automates that linkage.
          </p>
        </div>

        <FormPrimitivesDemo />

        {/* PROPS TABLE */}
        <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">FormField Props</h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg mb-12">
          <table className="min-w-full divide-y divide-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">Prop</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Type</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Required</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm">
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">label</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">string</td>
                <td className="whitespace-nowrap px-3 py-4 text-green-600 font-bold">Yes</td>
                <td className="px-3 py-4 text-slate-600">Visible text label. Cannot be hidden (use <code>ScreenReaderOnly</code> if absolutely necessary, but discouraged).</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">error</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">string</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">No</td>
                <td className="px-3 py-4 text-slate-600">Error message. Automatically sets <code>aria-invalid="true"</code> and links via <code>aria-describedby</code>.</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">helpText</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">string</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">No</td>
                <td className="px-3 py-4 text-slate-600">Instructions shown below input. Automatically linked via <code>aria-describedby</code>.</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">required</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">boolean</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">No</td>
                <td className="px-3 py-4 text-slate-600">Adds visual indicator (*) and sets <code>aria-required="true"</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    )
  },
  'modals': {
    id: 'modals',
    title: 'Dialogs & Modals',
    description: 'Accessible modal dialogs with focus trapping.',
    lastUpdated: 'December 08, 2025',
    sections: [],
    content: (
      <>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          The <code>Dialog</code> and <code>Modal</code> components provide accessible, focus-trapping overlays
          using the native HTML <code>&lt;dialog&gt;</code> element. They handle managing <code>aria-modal</code>,
          focus restoration, and backdrop interaction automatically.
        </p>

        {/* REGULATORY CONTEXT */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-md">
          <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Regulatory Context
          </h4>
          <p className="text-sm text-blue-800">
            <strong>No Keyboard Trap (2.1.2)</strong> is a critical "Blocker" issue. Users must always be able to escape a modal (usually ESC key).
            Ideally, focus should loop within the modal (Focus Trap).
            Failure to implement this correctly is one of the most severe accessibility violations possible.
          </p>
        </div>

        <DialogDemo />

        {/* PROPS TABLE */}
        <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">Dialog Props</h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg mb-12">
          <table className="min-w-full divide-y divide-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">Prop</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Type</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Required</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm">
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">isOpen</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">boolean</td>
                <td className="whitespace-nowrap px-3 py-4 text-green-600 font-bold">Yes</td>
                <td className="px-3 py-4 text-slate-600">Controls visibility. Handles body scroll locking when true.</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">title</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">string</td>
                <td className="whitespace-nowrap px-3 py-4 text-green-600 font-bold">Yes</td>
                <td className="px-3 py-4 text-slate-600">Linked to the dialog container via <code>aria-labelledby</code>. Essential for context.</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">description</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">string</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">No</td>
                <td className="px-3 py-4 text-slate-600">Linked via <code>aria-describedby</code>. Use for additional instructions.</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600">variant</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">'default' | 'alert'</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">'default'</td>
                <td className="px-3 py-4 text-slate-600">Use 'alert' for destructive actions (e.g., delete confirmation). Changes title color.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Accessibility Features</h3>
          <ul className="grid sm:grid-cols-2 gap-4">
            <li className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900">Focus Trap</strong>
                <span className="text-sm text-slate-600">Keyboard focus is constrained within the modal while open.</span>
              </div>
            </li>
            <li className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900">Escape to Close</strong>
                <span className="text-sm text-slate-600">Native support for closing via the ESC key.</span>
              </div>
            </li>
            <li className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900">Scroll Locking</strong>
                <span className="text-sm text-slate-600">Prevents background scrolling when the modal is active.</span>
              </div>
            </li>
            <li className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900">Screen Reader Support</strong>
                <span className="text-sm text-slate-600">Uses <code>aria-labelledby</code> and <code>aria-describedby</code> automatically.</span>
              </div>
            </li>
          </ul>
        </div>
      </>
    )

  },
  'installation': {
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

        <h2 id="packages" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">1. The Packages</h2>
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-primary-400 hover:shadow-md transition-all gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Terminal className="w-5 h-5 text-slate-600" />
                <strong className="text-slate-900 text-lg">@holmdigital/engine</strong>
              </div>
              <p className="text-slate-600">Automated testing, crawling, and reporting engine.</p>
            </div>
            <code className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg font-mono text-sm text-slate-700 whitespace-nowrap overflow-x-auto">
              npm install @holmdigital/engine
            </code>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-primary-400 hover:shadow-md transition-all gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutTemplate className="w-5 h-5 text-slate-600" />
                <strong className="text-slate-900 text-lg">@holmdigital/components</strong>
              </div>
              <p className="text-slate-600">Accessible React UI kit with pre-built compliance.</p>
            </div>
            <code className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg font-mono text-sm text-slate-700 whitespace-nowrap overflow-x-auto">
              npm install @holmdigital/components
            </code>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-primary-400 hover:shadow-md transition-all gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-slate-600" />
                <strong className="text-slate-900 text-lg">@holmdigital/standards</strong>
              </div>
              <p className="text-slate-600">The raw rule definitions and logic (Advanced).</p>
            </div>
            <code className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg font-mono text-sm text-slate-700 whitespace-nowrap overflow-x-auto">
              npm install @holmdigital/standards
            </code>
          </div>
        </div>

        <h2 id="setup" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">2. Configuration</h2>

        <h3 className="text-lg font-semibold text-slate-900 mb-2">Tailwind CSS (Required for Components)</h3>
        <p className="text-slate-600 mb-4">
          If you use our components, you must tell Tailwind where to find them. Add this to your <code>tailwind.config.js</code>:
        </p>
        <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto mb-8 text-sm font-mono">
          {`module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    // Add this line to include HolmDigital components:
    "./node_modules/@holmdigital/components/dist/**/*.{js,mjs}" 
  ],
  // ...
}`}
        </pre>

        <h2 id="usage" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">3. Basic Usage</h2>

        <h3 className="text-lg font-semibold text-slate-900 mb-2">Running a Scan</h3>
        <p className="text-slate-600 mb-4">
          Test any URL immediately (even localhost):
        </p>
        <div className="bg-slate-900 rounded-lg p-3 mb-6">
          <code className="text-primary-300 font-mono text-sm">npx hd-a11y-scan http://localhost:3000</code>
        </div>

        <h2 id="localization" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">4. Localization</h2>
        <p className="text-slate-600 mb-4">
          The engine supports multiple languages for CLI output and reports.
          Use the <code>--lang</code> flag to specify your preferred language (default is <code>en</code>).
        </p>
        <div className="bg-slate-900 rounded-lg p-3 mb-6">
          <code className="text-primary-300 font-mono text-sm">npx hd-a11y-scan http://localhost:3000 --lang sv</code>
        </div>
        <p className="text-slate-600 mb-4">
          <strong>Supported Languages:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
          <li><code>en</code>: English (International Standards / EN 301 549)</li>
          <li><code>sv</code>: Swedish (Includes lag 2018:1937 / DOS-lagen references)</li>
          <li><code>de</code>: German (BITV 2.0 / EN 301 549)</li>
          <li><code>fr</code>: French (RGAA 4.1)</li>
          <li><code>es</code>: Spanish (UNE 139803:2012)</li>
        </ul>
      </>
    )
  },
  'content-structure': {
    id: 'content-structure',
    title: 'Structure & Content',
    description: 'Components for organizing content: Accordion, Tabs, and specialized lists.',
    lastUpdated: 'December 09, 2025',
    sections: [],
    content: (
      <>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Structuring content correctly is vital for cognitive accessibility.
          <strong> Accordions</strong> and <strong>Tabs</strong> help reduce cognitive load by progressive disclosure.
        </p>

        <ContentDemo />
      </>
    )
  },
  'navigation': {
    id: 'navigation',
    title: 'Navigation Components',
    description: 'Accessible navigation patterns including SkipLinks and Menus.',
    lastUpdated: 'December 09, 2025',
    sections: [],
    content: (
      <>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Robust navigation is critical for DOS compliance. We provide pre-built components for
          <strong> Bypass Blocks</strong> (Skip Link) and accessible dropdown menus.
        </p>

        <NavigationDemo />

        <div className="mt-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Why is this critical?</h3>
          <ul className="grid sm:grid-cols-2 gap-4">
            <li className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900">WCAG 2.4.1 (Bypass Blocks)</strong>
                <span className="text-sm text-slate-600">Users must be able to skip repetitive content like headers.</span>
              </div>
            </li>
            <li className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900">WCAG 2.1.1 (Keyboard)</strong>
                <span className="text-sm text-slate-600">Menus must be fully operable without a mouse.</span>
              </div>
            </li>
          </ul>
        </div>
      </>
    )
  },
  'feedback': {
    id: 'feedback',
    title: 'Feedback Components',
    description: 'Components for communicating status and feedback: Toast, Tooltip, etc.',
    lastUpdated: 'December 09, 2025',
    sections: [],
    content: (
      <>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Providing clear feedback is essential for a good user experience and accessibility.
          Use <strong>Toast</strong> notifications for transient updates.
        </p>

        <ToastDemo />
        <TooltipDemo />
      </>
    )
  }
};