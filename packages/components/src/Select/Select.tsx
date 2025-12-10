import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectContextType {
    value: string;
    onChange: (value: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    highlightedIndex: number;
    setHighlightedIndex: (index: number) => void;
    optionsRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
}

export const Select = ({ value, onChange, children }: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const optionsRef = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
                setHighlightedIndex(0);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(prev + 1, optionsRef.current.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < optionsRef.current.length) {
                    const option = optionsRef.current[highlightedIndex];
                    if (option) {
                        option.click();
                    }
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
        }
    };

    return (
        <SelectContext.Provider value={{ value, onChange, isOpen, setIsOpen, highlightedIndex, setHighlightedIndex, optionsRef }}>
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

    return (
        <button
            type="button"
            onClick={() => context.setIsOpen(!context.isOpen)}
            aria-haspopup="listbox"
            aria-expanded={context.isOpen}
            className={`flex items-center justify-between w-full px-4 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${className}`}
        >
            <span className={context.value ? "text-slate-900" : "text-slate-500"}>
                {children || placeholder}
            </span>
            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </button>
    );
};

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
    const context = useContext(SelectContext);

    // Reset options ref when content renders
    useEffect(() => {
        if (context && context.isOpen) {
            context.optionsRef.current = [];
        }
    }, [context?.isOpen]);

    if (!context || !context.isOpen) return null;

    return (
        <div
            className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none"
            role="listbox"
        >
            {children}
        </div>
    );
};

export const SelectItem = ({ value, children }: { value: string, children: React.ReactNode }) => {
    const context = useContext(SelectContext);
    if (!context) throw new Error("SelectItem must be used within Select");

    const isSelected = context.value === value;
    const index = context.optionsRef.current.length; // Capture current index

    return (
        <div
            ref={(el) => { context.optionsRef.current[index] = el; }}
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
            {isSelected && <Check className="w-4 h-4 text-slate-900" />}
        </div>
    );
};
