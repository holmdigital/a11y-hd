import React from 'react';

export interface PropDef {
    name: string;
    type: string;
    default?: string;
    description: string;
    required?: boolean;
}

interface PropsTableProps {
    props: PropDef[];
    title?: string;
}

export const PropsTable: React.FC<PropsTableProps> = ({ props, title = 'Props Reference' }) => {
    return (
        <div className="mb-12">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
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
                        {props.map((prop) => (
                            <tr key={prop.name}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 font-mono text-blue-600 font-medium">
                                    {prop.name} {prop.required && <span className="text-red-500">*</span>}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-slate-600 font-mono text-xs">{prop.type}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-slate-500 font-mono text-xs">{prop.default || '-'}</td>
                                <td className="px-3 py-4 text-slate-600">{prop.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
