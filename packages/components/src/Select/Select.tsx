import React, { useState, useRef, useEffect, useId, createContext, useContext } from 'react';

// --- lucide-react optional peer dependency (PUB-06) ----------------------
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
            const mod = m as Record<string, unknown>;
            lucideCache.ChevronDown = (mod.ChevronDown ?? null) as LucideIconLike | null;
            lucideCache.Check = (mod.Check ?? null) as LucideIconLike | null;
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

const ChevronDownIconOrGlyph = () => {
    const Icon = useLucideIcon('ChevronDown');
    if (Icon) return <Icon className="w-4 h-4 ml-2 opacity-50" aria-hidden="true" />;
    return (
        <span
            className="ml-2 opacity-50 hd-select-chevron-fallback-glyph"
            data-testid="select-chevron-fallback-glyph"
            aria-hidden="true"
        >
            ▾
        </span>
    );
};

const CheckIconOrGlyph = () => {
    const Icon = useLucideIcon('Check');
    if (Icon) return <Icon className="w-4 h-4 text-slate-900" aria-hidden="true" />;
    return (
        <span
            className="hd-select-check-fallback-glyph text-slate-900"
            data-testid="select-check-fallback-glyph"
            aria-hidden="true"
        >
            ✓
        </span>
    );
};
// -------------------------------------------------------------------------

interface SelectContextType {
    value: string;
    onChange: (value: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    highlightedIndex: number;
    setHighlightedIndex: (index: number) => void;
    listboxRef: React.RefObject<HTMLDivElement>;
    /** Stable id for the listbox; trigger references it via aria-controls. */
    listboxId: string;
    /** Stable id prefix for option elements (used by aria-activedescendant). */
    optionIdPrefix: string;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
}

// Type-ahead reset window. After this many ms of inactivity the buffer clears.
const TYPE_AHEAD_RESET_MS = 500;
// PageUp / PageDown jump size.
const PAGE_JUMP = 10;

export const Select = ({ value, onChange, children }: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const listboxRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const reactId = useId();
    const listboxId = `${reactId}-listbox`;
    const optionIdPrefix = `${reactId}-option`;

    // Type-ahead state.
    const typeAheadRef = useRef('');
    const typeAheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => () => {
        if (typeAheadTimeoutRef.current !== null) clearTimeout(typeAheadTimeoutRef.current);
    }, []);

    // Read options live from the DOM so we don't depend on ref-array commit timing.
    const getOptions = (): HTMLDivElement[] => {
        const list = listboxRef.current;
        if (!list) return [];
        return Array.from(list.querySelectorAll<HTMLDivElement>('[role="option"]'));
    };
    const lastIndex = () => getOptions().length - 1;

    const findOptionByPrefix = (prefix: string): number => {
        const lower = prefix.toLowerCase();
        return getOptions().findIndex(el => (el.textContent ?? '').toLowerCase().trim().startsWith(lower));
    };

    const handleTypeAhead = (key: string) => {
        if (typeAheadTimeoutRef.current !== null) clearTimeout(typeAheadTimeoutRef.current);
        typeAheadRef.current += key.toLowerCase();
        typeAheadTimeoutRef.current = setTimeout(() => {
            typeAheadRef.current = '';
        }, TYPE_AHEAD_RESET_MS);
        const idx = findOptionByPrefix(typeAheadRef.current);
        if (idx >= 0) {
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(idx);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
                setHighlightedIndex(0);
                return;
            }
            // Type-ahead while collapsed should also open the listbox.
            if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                handleTypeAhead(e.key);
                return;
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(prev + 1, lastIndex()));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Home':
                e.preventDefault();
                setHighlightedIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setHighlightedIndex(lastIndex());
                break;
            case 'PageDown':
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(prev + PAGE_JUMP, lastIndex()));
                break;
            case 'PageUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - PAGE_JUMP, 0));
                break;
            case 'Enter':
            case ' ': {
                e.preventDefault();
                const opts = getOptions();
                if (highlightedIndex >= 0 && highlightedIndex < opts.length) {
                    opts[highlightedIndex].click();
                }
                break;
            }
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
                break;
            case 'Tab':
                setIsOpen(false);
                break;
            default:
                if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    handleTypeAhead(e.key);
                }
        }
    };

    return (
        <SelectContext.Provider value={{
            value, onChange, isOpen, setIsOpen,
            highlightedIndex, setHighlightedIndex,
            listboxRef, listboxId, optionIdPrefix
        }}>
            <div
                ref={containerRef}
                className="relative inline-block text-left w-full"
                onKeyDown={handleKeyDown}
            >
                {children}
            </div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger = ({ children, className = '', placeholder = 'Select...' }: { children?: React.ReactNode, className?: string, placeholder?: string }) => {
    const context = useContext(SelectContext);
    if (!context) throw new Error("SelectTrigger must be used within Select");

    const activeOptionId = context.isOpen && context.highlightedIndex >= 0
        ? `${context.optionIdPrefix}-${context.highlightedIndex}`
        : undefined;

    return (
        <button
            type="button"
            onClick={() => context.setIsOpen(!context.isOpen)}
            aria-haspopup="listbox"
            aria-expanded={context.isOpen}
            aria-controls={context.listboxId}
            aria-activedescendant={activeOptionId}
            className={`flex items-center justify-between w-full px-4 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${className}`}
        >
            <span className={context.value ? "text-slate-900" : "text-slate-500"}>
                {children || placeholder}
            </span>
            <ChevronDownIconOrGlyph />
        </button>
    );
};

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
    const context = useContext(SelectContext);
    if (!context || !context.isOpen) return null;

    // Inject the natural index into each SelectItem child so options can carry
    // stable ids without depending on ref-commit timing.
    const indexedChildren = React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<SelectItemInternalProps>, { __index: index });
    });

    return (
        <div
            ref={context.listboxRef}
            id={context.listboxId}
            className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none"
            role="listbox"
            tabIndex={-1}
        >
            {indexedChildren}
        </div>
    );
};

interface SelectItemInternalProps {
    value: string;
    children: React.ReactNode;
    /** @internal Injected by SelectContent — do not pass directly. */
    __index?: number;
}

export const SelectItem = ({ value, children, __index }: SelectItemInternalProps) => {
    const context = useContext(SelectContext);
    if (!context) throw new Error("SelectItem must be used within Select");

    const isSelected = context.value === value;
    const index = __index ?? 0;
    const optionId = `${context.optionIdPrefix}-${index}`;

    return (
        <div
            id={optionId}
            role="option"
            aria-selected={isSelected}
            onClick={() => {
                context.onChange(value);
                context.setIsOpen(false);
            }}
            className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer ${context.highlightedIndex === index ? 'bg-slate-100' : ''
                } ${isSelected ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-700'}`}
        >
            {children}
            {isSelected && <CheckIconOrGlyph />}
        </div>
    );
};
