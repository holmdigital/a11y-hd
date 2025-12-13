import React from 'react';
import { Info } from 'lucide-react';
import { ArticleData } from '../../../types';
import { FormPrimitivesDemo } from '../../../components/FormPrimitivesDemo';
import { PropsTable } from '../../../components/PropsTable';

export const formsArticle: ArticleData = {
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

            <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">FormField Props</h3>
            <PropsTable props={[
                {
                    name: 'label',
                    type: 'string',
                    required: true,
                    description: 'Visible text label. Cannot be hidden (use ScreenReaderOnly if absolutely necessary, but discouraged).'
                },
                {
                    name: 'error',
                    type: 'string',
                    description: 'Error message. Automatically sets aria-invalid="true" and links via aria-describedby.'
                },
                {
                    name: 'helpText',
                    type: 'string',
                    description: 'Instructions shown below input. Automatically linked via aria-describedby.'
                },
                {
                    name: 'required',
                    type: 'boolean',
                    description: 'Adds visual indicator (*) and sets aria-required="true".'
                }
            ]} />
        </>
    )
};
