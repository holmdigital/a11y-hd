import React, { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@holmdigital/components';

export const SelectDemo = () => {
    const [role, setRole] = useState('viewer');

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Select / Dropdown</h3>
            <p className="text-slate-600">
                A custom accessible select component with full keyboard support (Arrows, Enter, Esc).
            </p>

            <div className="p-8 border rounded-lg bg-slate-50 w-full max-w-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    User Role
                </label>
                <Select value={role} onChange={setRole}>
                    <SelectTrigger>
                        {role === 'admin' ? 'Administrator' :
                            role === 'editor' ? 'Editor' :
                                role === 'viewer' ? 'Viewer' : 'Select Role...'}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="guest">Guest (Limited)</SelectItem>
                    </SelectContent>
                </Select>

                <div className="mt-4 text-sm text-slate-600">
                    Current Role: <code className="bg-slate-200 px-1 rounded">{role}</code>
                </div>
            </div>
        </div>
    );
};
