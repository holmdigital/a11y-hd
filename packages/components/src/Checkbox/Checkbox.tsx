import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className = '', checked, onCheckedChange, onChange, label, disabled, id, ...props }, ref) => {

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked);
            onChange?.(e);
        };

        const generatedId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={`flex items-start ${className}`}>
                <div className="flex items-center h-5">
                    <div className="relative">
                        <input
                            id={generatedId}
                            type="checkbox"
                            ref={ref}
                            className="peer sr-only"
                            checked={checked}
                            onChange={handleChange}
                            disabled={disabled}
                            {...props}
                        />
                        {/* Styled Box */}
                        <div
                            className={`
                h-5 w-5 rounded border border-slate-300 bg-white shadow-sm transition-all
                peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2
                peer-checked:bg-primary-600 peer-checked:border-primary-600
                peer-disabled:cursor-not-allowed peer-disabled:opacity-50
                hover:border-primary-400
                flex items-center justify-center
              `}
                            aria-hidden="true"
                        >
                            <Check className={`h-3.5 w-3.5 text-white transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                        </div>
                    </div>
                </div>
                <label
                    htmlFor={generatedId}
                    className={`ml-3 text-sm font-medium ${disabled ? 'text-slate-400' : 'text-slate-700'} cursor-pointer select-none`}
                >
                    {label}
                </label>
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';
