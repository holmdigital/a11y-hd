import React, { useState } from 'react';
import { Dialog, Modal, Button, FormField } from '@holmdigital/components';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export const DialogDemo = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

    return (
        <div className="not-prose space-y-8">
            {/* Standard Dialog Demo */}
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-bold text-slate-900 mb-4 text-xl">Standard Dialog</h3>
                    <p className="text-slate-600 mb-4">
                        A non-modal dialog (conceptually) or a standard modal.
                        Our <code>Dialog</code> component uses the native <code>&lt;dialog&gt;</code> element.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        Open Standard Dialog
                    </Button>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg">
                    <h4 className="font-semibold text-sm text-slate-900 mb-2">Code Example</h4>
                    <pre className="text-xs bg-white p-3 rounded border border-slate-100 overflow-x-auto text-slate-600">
                        {`<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  description="Make changes to your profile here."
>
  <YourContent />
</Dialog>`}
                    </pre>
                </div>
            </div>

            {/* Modal/Alert Demo */}
            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <div>
                    <h3 className="font-bold text-slate-900 mb-4 text-xl">Alert Modal</h3>
                    <p className="text-slate-600 mb-4">
                        Destructive actions should use the <code>variant="alert"</code> prop to warn users.
                    </p>
                    <Button variant="danger" onClick={() => setIsAlertDialogOpen(true)}>
                        Delete Account
                    </Button>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg">
                    <h4 className="font-semibold text-sm text-slate-900 mb-2">Code Example</h4>
                    <pre className="text-xs bg-white p-3 rounded border border-slate-100 overflow-x-auto text-slate-600">
                        {`<Dialog
  variant="alert"
  title="Are you sure?"
  isOpen={isOpen}
  onClose={close}
>
  <p>This action cannot be undone.</p>
  <Button variant="danger">Delete</Button>
</Dialog>`}
                    </pre>
                </div>
            </div>

            {/* Form Modal Demo */}
            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <div>
                    <h3 className="font-bold text-slate-900 mb-4 text-xl">Form in Modal</h3>
                    <p className="text-slate-600 mb-4">
                        Modals trap focus correctly, making them safe for complex forms.
                    </p>
                    <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                        Open Form Modal
                    </Button>
                </div>
            </div>


            {/* --- THE ACTUAL COMPONENTS RENDERED HERE --- */}

            <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Edit Profile"
                description="Make changes to your profile here. Click save when you're done."
            >
                <div className="space-y-4 py-4">
                    <div className="p-4 bg-slate-50 rounded-md text-sm text-slate-600">
                        This is a standard dialog content area. You can put anything here.
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsDialogOpen(false)}>Save Changes</Button>
                    </div>
                </div>
            </Dialog>

            <Dialog
                isOpen={isAlertDialogOpen}
                onClose={() => setIsAlertDialogOpen(false)}
                title="Delete Account"
                variant="alert"
                description="Are you sure you want to delete your account? This action cannot be undone."
            >
                <div className="space-y-4 py-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 text-red-800 rounded-md text-sm">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                        <p>All your data will be permanently removed from our servers forever. This is a very long warning text to test wrapping.</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setIsAlertDialogOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={() => setIsAlertDialogOpen(false)}>Yes, Delete Account</Button>
                    </div>
                </div>
            </Dialog>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Subscription Details"
            >
                <div className="space-y-4 py-4">
                    <FormField
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        helpText="We will send the receipt here"
                    />
                    <FormField
                        label="Card Number"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
                        <Button onClick={() => setIsModalOpen(false)}>Subscribe</Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};
