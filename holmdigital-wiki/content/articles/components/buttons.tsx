import React from 'react';
import { Info, CheckCircle } from 'lucide-react';
import { ArticleData } from '../../../types';
import { Button } from '@holmdigital/components';
import { CodeBlock } from '../../../components/CodeBlock';
import { PropsTable } from '../../../components/PropsTable';

export const buttonsArticle: ArticleData = {
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
                    <CodeBlock code={`import { Button } from '@holmdigital/components';

export const MyForm = () => (
  <Button 
    variant="primary" 
    onClick={() => submit()}
    isLoading={isSubmitting}
  >
    Submit Form
  </Button>
);`} language="tsx" />
                </div>
            </div>

            {/* PROPS TABLE */}
            <PropsTable props={[
                {
                    name: 'variant',
                    type: "'primary' | 'secondary' | 'ghost' | 'danger'",
                    default: "'primary'",
                    description: 'Visual style. All variants maintain accessible contrast.'
                },
                {
                    name: 'isLoading',
                    type: 'boolean',
                    default: 'false',
                    description: 'Shows loading spinner and disables interaction. Announces state to screen readers.'
                },
                {
                    name: 'type',
                    type: "'button' | 'submit' | 'reset'",
                    default: "'button'",
                    description: 'HTML button type.'
                }
            ]} />
        </>
    )
};
