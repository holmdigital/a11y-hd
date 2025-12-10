import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Tabs, TabsList, TabTrigger, TabsContent } from '@holmdigital/components';
import { Info, HelpCircle, FileText } from 'lucide-react';

export const ContentDemo = () => {
    return (
        <div className="space-y-12 max-w-4xl">
            {/* Accordion Section */}
            <section>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Accordion</h2>
                    <p className="text-slate-600">
                        A vertically stacked set of interactive headings that each reveal a section of content.
                        Perfect for FAQs or organizing complex forms.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <Accordion type="single" defaultValue="item-1">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Is this accessible?</AccordionTrigger>
                            <AccordionContent>
                                Yes. It adheres to the WAI-ARIA design pattern for accordions, including
                                correct role usage and aria-expanded management.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Can I have multiple items open?</AccordionTrigger>
                            <AccordionContent>
                                Yes! Just change the <code>type</code> prop from 'single' to 'multiple'.
                                This allows users to expand multiple sections simultaneously.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Is it styled?</AccordionTrigger>
                            <AccordionContent>
                                It comes with a clean, minimal default style using Slate colors,
                                but can be easily overridden via className.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            {/* Tabs Section */}
            <section>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Tabs</h2>
                    <p className="text-slate-600">
                        A set of layered sections of content that are displayed one at a time.
                        Includes full keyboard support (Arrows, Home, End).
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <Tabs defaultValue="account">
                        <TabsList className="mb-4">
                            <TabTrigger value="account">Account</TabTrigger>
                            <TabTrigger value="password">Password</TabTrigger>
                            <TabTrigger value="settings">Settings</TabTrigger>
                        </TabsList>

                        <TabsContent value="account">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h3 className="font-semibold text-slate-900 mb-1">Account Information</h3>
                                <p className="text-sm text-slate-600">Manage your profile details and preferences here.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="password">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h3 className="font-semibold text-slate-900 mb-1">Change Password</h3>
                                <p className="text-sm text-slate-600">Ensure your account is secure with a strong password.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="settings">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h3 className="font-semibold text-slate-900 mb-1">Preferences</h3>
                                <p className="text-sm text-slate-600">Customize your interface and notification settings.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
};
