import React, { forwardRef, useEffect, useState } from 'react';

// --- lucide-react optional peer dependency (PUB-06) ----------------------
// We import lucide-react dynamically so consumers who don't install it get
// a Unicode text-glyph fallback instead of a hard import error.
type LucideIconLike = React.ComponentType<{
    className?: string;
    size?: number | string;
    strokeWidth?: number;
    'aria-hidden'?: boolean | string;
}>;

const lucideCache: Record<string, LucideIconLike | null> = {};
let importAttempted = false;
let importPromise: Promise<Record<string, LucideIconLike | null>> | null = null;

function loadLucide(): Promise<Record<string, LucideIconLike | null>> {
    if (importAttempted) return Promise.resolve(lucideCache);
    if (importPromise) return importPromise;
    importPromise = import('lucide-react')
        .then((m) => {
            lucideCache.Check = ((m as Record<string, unknown>).Check ?? null) as LucideIconLike | null;
            importAttempted = true;
            return lucideCache;
        })
        .catch(() => {
            importAttempted = true;
            return lucideCache;
        });
    return importPromise;
}

function useLucideIcon(name: string): LucideIconLike | null {
    const [Icon, setIcon] = useState<LucideIconLike | null>(lucideCache[name] ?? null);
    useEffect(() => {
        if (importAttempted) {
            setIcon(lucideCache[name] ?? null);
            return;
        }
        let mounted = true;
        loadLucide().then(() => {
            if (mounted) setIcon(lucideCache[name] ?? null);
        });
        return () => {
            mounted = false;
        };
    }, [name]);
    return Icon;
}
// -------------------------------------------------------------------------

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    onCheckedChange?: (checked: boolean) => void;
}

const CheckIconOrGlyph = ({ checked }: { checked?: boolean }) => {
    const Icon = useLucideIcon('Check');
    const opacityClass = checked ? 'opacity-100' : 'opacity-0';
    if (Icon) {
        return (
            <Icon
                className={`h-3.5 w-3.5 text-white transition-opacity ${opacityClass}`}
                strokeWidth={3}
                aria-hidden="true"
            />
        );
    }
    return (
        <span
            className={`hd-checkbox-fallback-glyph text-white text-xs leading-none transition-opacity ${opacityClass}`}
            data-testid="checkbox-fallback-glyph"
            aria-hidden="true"
        >
            ✓
        </span>
    );
};

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
                            <CheckIconOrGlyph checked={!!checked} />
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
