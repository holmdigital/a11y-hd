import React, { useState } from 'react';
import { Checkbox, RadioGroup, Switch, FormField } from '@holmdigital/components';
import { SelectDemo } from './SelectDemo';

export const FormPrimitivesDemo = () => {
    const [notifications, setNotifications] = useState(true);
    const [theme, setTheme] = useState('system');

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Text Fields</h2>
                <p className="text-slate-600 mb-6">
                    Accessible input fields with integrated labels, helper text, and error messaging.
                </p>

                <div className="p-8 border rounded-lg bg-slate-50 space-y-6">
                    <FormField
                        label="Email Address"
                        type="email"
                        id="demo-email"
                        placeholder="you@example.com"
                        helpText="We'll never share your email."
                    />

                    <FormField
                        label="Password"
                        type="password"
                        id="demo-password"
                        required
                        error="Password must be at least 8 characters"
                    />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Checkbox</h2>
                <p className="text-slate-600 mb-6">
                    A control that allows the user to toggle between checked and not checked.
                </p>

                <div className="p-8 border rounded-lg bg-slate-50 space-y-6">
                    <Checkbox
                        label="Enable email notifications"
                        checked={notifications}
                        onCheckedChange={setNotifications}
                    />

                    <Checkbox
                        label="Subscribe to newsletter (Disabled)"
                        disabled
                    />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Switch / Toggle</h2>
                <p className="text-slate-600 mb-6">
                    A control that allows the user to toggle between checked and not checked.
                </p>
                <div className="p-8 border rounded-lg bg-slate-50 space-y-6">
                    <Switch
                        label="Airplane Mode"
                        checked={notifications}
                        onCheckedChange={setNotifications}
                    />
                    <Switch
                        label="Bluetooth (Disabled)"
                        checked={true}
                        onCheckedChange={() => { }}
                        disabled
                    />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Radio Group</h2>
                <p className="text-slate-600 mb-6">
                    A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.
                </p>

                <div className="p-8 border rounded-lg bg-slate-50">
                    <RadioGroup
                        name="theme-preference"
                        label="Select Theme"
                        value={theme}
                        onChange={setTheme}
                        options={[
                            { label: 'System Default', value: 'system' },
                            { label: 'Light Mode', value: 'light' },
                            { label: 'Dark Mode', value: 'dark' },
                            { label: 'High Contrast', value: 'contrast', disabled: true },
                        ]}
                    />

                    <div className="mt-6 text-sm text-slate-600">
                        Selected value: <code className="bg-slate-200 px-1 rounded">{theme}</code>
                    </div>
                </div>
            </div>

            <div>
                <SelectDemo />
            </div>
        </div>
    );
};
