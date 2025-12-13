import React from 'react';
import { Info, CheckCircle } from 'lucide-react';
import { ArticleData } from '../../../types';
import { DialogDemo } from '../../../components/DialogDemo';
import { PropsTable } from '../../../components/PropsTable';

export const modalsArticle: ArticleData = {
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

            <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">Dialog Props</h3>
            <PropsTable props={[
                {
                    name: 'isOpen',
                    type: 'boolean',
                    required: true,
                    description: 'Controls visibility. Handles body scroll locking when true.'
                },
                {
                    name: 'title',
                    type: 'string',
                    required: true,
                    description: 'Linked to the dialog container via aria-labelledby. Essential for context.'
                },
                {
                    name: 'description',
                    type: 'string',
                    description: 'Linked via aria-describedby. Use for additional instructions.'
                },
                {
                    name: 'variant',
                    type: "'default' | 'alert'",
                    default: "'default'",
                    description: "Use 'alert' for destructive actions (e.g., delete confirmation). Changes title color."
                }
            ]} />

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
};
