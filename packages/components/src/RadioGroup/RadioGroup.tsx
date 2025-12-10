import { forwardRef } from 'react';

export interface RadioOption {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface RadioGroupProps {
    name: string;
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    label?: string; // Group label
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ name, options, value, onChange, orientation = 'vertical', className = '', label }, ref) => {
        return (
            <div
                ref={ref}
                className={`${className}`}
                role="radiogroup"
                aria-labelledby={label ? `${name}-label` : undefined}
            >
                {label && (
                    <div id={`${name}-label`} className="text-sm font-medium text-slate-900 mb-2">
                        {label}
                    </div>
                )}
                <div className={`flex ${orientation === 'vertical' ? 'flex-col space-y-3' : 'flex-row space-x-6'}`}>
                    {options.map((option) => {
                        const optionId = `${name}-${option.value}`;
                        const isChecked = value === option.value;

                        return (
                            <div key={option.value} className="flex items-center">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        id={optionId}
                                        name={name}
                                        type="radio"
                                        value={option.value}
                                        checked={isChecked}
                                        disabled={option.disabled}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                onChange?.(option.value);
                                            }
                                        }}
                                        className="peer sr-only"
                                    />
                                    {/* Outer Circle */}
                                    <div
                                        className={`
                      h-5 w-5 rounded-full border border-slate-300 bg-white shadow-sm transition-all
                      peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2
                      peer-checked:border-primary-600 peer-checked:bg-white
                      peer-disabled:cursor-not-allowed peer-disabled:opacity-50
                      hover:border-primary-400
                    `}
                                        aria-hidden="true"
                                    />
                                    {/* Inner Dot */}
                                    <div
                                        className={`
                      absolute h-2.5 w-2.5 rounded-full bg-primary-600 transition-transform duration-200 scale-0
                      ${isChecked ? 'scale-100' : ''}
                    `}
                                    />
                                </div>
                                <label
                                    htmlFor={optionId}
                                    className={`ml-3 text-sm font-medium ${option.disabled ? 'text-slate-400' : 'text-slate-700'} cursor-pointer select-none`}
                                >
                                    {option.label}
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);

RadioGroup.displayName = 'RadioGroup';
