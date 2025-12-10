import React from 'react';
import { Button, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@holmdigital/components';
import { HelpCircle, AlertCircle } from 'lucide-react';

export const TooltipDemo = () => {
    return (
        <TooltipProvider>
            <div className="space-y-6 mt-8">
                <h3 className="text-xl font-bold text-slate-900 border-t border-slate-200 pt-8">Tooltips</h3>
                <p className="text-slate-600">
                    Accessible tooltips that appear on hover and focus. They use <code>aria-describedby</code> to provide additional context.
                </p>

                <div className="p-8 border rounded-lg bg-slate-50 flex flex-wrap gap-8 items-center">

                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="secondary" className="gap-2">
                                <HelpCircle className="w-4 h-4" />
                                Hover me
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            This is helpful information
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-200">
                                <AlertCircle className="w-5 h-5" />
                                <span className="sr-only">Warning details</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-amber-600">
                            Critical warning message
                        </TooltipContent>
                    </Tooltip>

                    <div className="text-slate-600">
                        You can also tooltip <Tooltip>
                            <TooltipTrigger className="text-primary-600 underline decoration-dotted cursor-help">
                                inline text
                            </TooltipTrigger>
                            <TooltipContent>
                                Like this!
                            </TooltipContent>
                        </Tooltip> quite easily.
                    </div>

                </div>
            </div>
        </TooltipProvider>
    );
};
