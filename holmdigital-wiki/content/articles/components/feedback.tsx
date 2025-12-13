import React from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { ArticleData } from '../../../types';
import { CodeBlock } from '../../../components/CodeBlock';
import { ToastDemo } from '../../../components/ToastDemo';

export const feedbackArticle: ArticleData = {
    id: 'feedback',
    title: 'Feedback & Overlays',
    description: 'Communicating status changes, errors, and using overlays accessible.',
    lastUpdated: 'December 12, 2025',
    sections: [
        { id: 'status', title: 'Status Messages (Toasts)' },
        { id: 'overlays', title: 'Non-Modal Overlays' },
        { id: 'timing', title: 'Timing & Persistence' }
    ],
    content: (
        <>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Users need to know when their actions have succeeded or failed. This feedback must be perceptible to everyone,
                including screen reader users who might not be looking at the part of the screen where a message appears.
            </p>

            {/* REGULATORY CONTEXT */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-md">
                <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Regulatory Context
                </h4>
                <p className="text-sm text-blue-800">
                    <strong>Status Messages (WCAG 4.1.3)</strong>: In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.
                    <br /><br />
                    <strong>Timing Adjustable (WCAG 2.2.1)</strong>: Users must have enough time to read and use content.
                </p>
            </div>

            <h2 id="status" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">1. Status Messages (Toasts)</h2>
            <p className="text-slate-600 mb-4">
                Transient messages like "Changes saved" should be announced by screen readers immediately, but should <strong>not</strong> move keyboard focus.
                Use `role="status"` (polite) or `role="alert"` (assertive).
            </p>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6">
                <h4 className="font-bold text-slate-900 mb-4">Live Demo</h4>
                <ToastDemo />
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-6">
                <div className="border border-slate-200 p-4 rounded-lg">
                    <strong className="block mb-2 text-slate-900">Success / Info</strong>
                    <CodeBlock code={`<div role="status">
  Changes saved successfully.
</div>`} language="html" />
                    <p className="text-sm text-slate-600 mt-2">
                        Screen reader waits for silence, then speaks. Good for non-critical updates.
                    </p>
                </div>
                <div className="border border-slate-200 p-4 rounded-lg">
                    <strong className="block mb-2 text-slate-900">Errors / Critical</strong>
                    <CodeBlock code={`<div role="alert">
  Connection lost. Retrying...
</div>`} language="html" />
                    <p className="text-sm text-slate-600 mt-2">
                        Screen reader interrupts immediately. Use sparingly.
                    </p>
                </div>
            </div>

            <h2 id="overlays" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">2. Non-Modal Overlays</h2>
            <p className="text-slate-600 mb-4">
                Popovers, dropdowns, and drawers that are <em>not</em> modal (i.e., you can still interact with the rest of the page) require careful focus management.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-6">
                <li><strong>Focus Order:</strong> If opening a dropdown moves focus into it, closing it must return focus to the trigger.</li>
                <li><strong>Esc Key:</strong> The Escape key should always close the overlay and return focus.</li>
                <li><strong>Outside Click:</strong> Clicking outside should close the overlay.</li>
            </ul>

            <h2 id="timing" className="text-2xl font-bold text-slate-900 mb-4 mt-8 scroll-mt-24">3. Timing & Persistence</h2>
            <p className="text-slate-600 mb-4">
                Do not make messages disappear automatically if they contain critical information or require action, unless the user can adjust the timing.
            </p>
            <div className="border-l-4 border-amber-500 bg-amber-50 p-4">
                <p className="text-amber-800 text-sm">
                    <strong>Best Practice:</strong> Make error messages persistent (require a user click to dismiss). Make success messages disappear after ~5 seconds, but ensure they are still available in a notification center or log if relevant.
                </p>
            </div>
        </>
    )
};
