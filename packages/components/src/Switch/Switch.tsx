import React from 'react';

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    id?: string;
}

export const Switch = ({ checked, onCheckedChange, disabled = false, label, id }: SwitchProps) => {
    const generatedId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    const handleClick = () => {
        if (!disabled) {
            onCheckedChange(!checked);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCheckedChange(!checked);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                id={generatedId}
                disabled={disabled}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
                    ${checked ? 'bg-primary-600' : 'bg-slate-200'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                <span
                    className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${checked ? 'translate-x-6' : 'translate-x-1'}
                    `}
                />
            </button>
            {label && (
                <label
                    htmlFor={generatedId}
                    className={`text-sm font-medium text-slate-700 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleClick}
                >
                    {label}
                </label>
            )}
        </div>
    );
};
