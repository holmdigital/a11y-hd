import React from 'react';
import { Button, useToast } from '@holmdigital/components';

export const ToastDemo = () => {
    const { addToast } = useToast();

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Toast Notifications</h3>
            <p className="text-slate-600">
                Accessible toast notifications that announce to screen readers via aria-live regions.
            </p>

            <div className="p-8 border rounded-lg bg-slate-50 flex flex-wrap gap-4">
                <Button
                    variant="primary"
                    onClick={() => addToast({
                        title: 'Success!',
                        description: 'Your changes have been saved successfully.',
                        type: 'success'
                    })}
                >
                    Show Success
                </Button>

                <Button
                    variant="secondary"
                    onClick={() => addToast({
                        title: 'Scheduled Maintenance',
                        description: 'System update in 10 minutes.',
                        type: 'info'
                    })}
                >
                    Show Info
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => addToast({
                        title: 'Connection Lost',
                        description: 'Please check your internet connection.',
                        type: 'warning'
                    })}
                >
                    Show Warning
                </Button>

                <Button
                    variant="primary"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => addToast({
                        title: 'Critical Error',
                        description: 'Failed to delete the database.',
                        type: 'error',
                        action: {
                            label: 'Retry',
                            onClick: () => addToast({ title: 'Retrying...', type: 'info' })
                        }
                    })}
                >
                    Show Error with Action
                </Button>
            </div>
        </div>
    );
};
