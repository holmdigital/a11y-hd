import React, { useState, useRef, useEffect, KeyboardEvent, useId } from 'react';
import { LiveRegion } from '../LiveRegion/LiveRegion';
import { getAnnouncement } from '../_i18n/live-region-strings';

export interface ComboboxOption {
    value: string;
    label: string;
}

export interface ComboboxProps {
    /**
     * Label for the combobox
     */
    label: string;

    /**
     * Helper text displayed below the label
     */
    description?: string;

    /**
     * Error message
     */
    error?: string;

    /**
     * Array of options to display
     */
    options: ComboboxOption[];

    /**
     * Callback when an option is selected
     */
    onChange: (value: string | null) => void;

    /**
     * Current selected value
     */
    value?: string | null;

    /**
     * Placeholder text
     */
    placeholder?: string;

    /**
     * Additional class names
     */
    className?: string;

    /**
     * BCP-47 locale code for live-region announcement text.
     * Defaults to 'en'. Unknown locales fall back to English.
     * Phase 27 (TC-09-LIVE): added for APG live-region localization.
     */
    locale?: string;
}

/**
 * Accessible Combobox (Autocomplete) Component
 * Implements WAI-ARIA 1.2 Combobox with Listbox Popup pattern.
 * Supports filtering, keyboard navigation, and screen reader announcements.
 *
 * @wcag 1.3.1 Info and Relationships, 2.1.1 Keyboard, 2.4.3 Focus Order, 4.1.2 Name Role Value, 4.1.3 Status Messages
 */
export const Combobox: React.FC<ComboboxProps> = ({
    label,
    description,
    error,
    options,
    onChange,
    value,
    placeholder = 'Type to search...',
    className = '',
    locale = 'en'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const id = useId();
    const listboxId = `${id}-listbox`;
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    // Filter options based on input
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Live-region announcement for filtered-results count (TC-09-LIVE).
    // D-04: hasInteracted ref suppresses the initial-mount announcement.
    // D-03: 300ms debounce so rapid typing does not flood the screen reader.
    const [announcement, setAnnouncement] = useState('');
    const hasInteracted = useRef(false);

    useEffect(() => {
        if (!hasInteracted.current) return;
        const timer = setTimeout(() => {
            setAnnouncement(
                getAnnouncement('combobox.results', locale, filteredOptions.length)
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [filteredOptions.length, locale]);

    // Sync input value with selected prop when it changes externally
    useEffect(() => {
        if (value) {
            const selectedOption = options.find(o => o.value === value);
            if (selectedOption) {
                setInputValue(selectedOption.label);
            }
        } else {
            setInputValue('');
        }
    }, [value, options]);

    // Handle outside click to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setFocusedIndex(-1);
                // Reset input to selected value if no selection was made
                if (value) {
                    const selectedOption = options.find(o => o.value === value);
                    if (selectedOption) setInputValue(selectedOption.label);
                } else {
                    setInputValue('');
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value, options]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        hasInteracted.current = true;
        setInputValue(e.target.value);
        setIsOpen(true);
        setFocusedIndex(-1);
        if (e.target.value === '') {
            onChange(null);
        }
    };

    const handleOptionSelect = (option: ComboboxOption) => {
        onChange(option.value);
        setInputValue(option.label);
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            setIsOpen(true);
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (isOpen && focusedIndex >= 0) {
                    handleOptionSelect(filteredOptions[focusedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
                setFocusedIndex(-1);
                // Reset to valid state
                if (value) {
                    const selectedOption = options.find(o => o.value === value);
                    if (selectedOption) setInputValue(selectedOption.label);
                } else {
                    setInputValue('');
                }
                break;
            case 'Home':
                if (isOpen) {
                    e.preventDefault();
                    setFocusedIndex(0);
                }
                break;
            case 'End':
                if (isOpen) {
                    e.preventDefault();
                    setFocusedIndex(filteredOptions.length - 1);
                }
                break;
            case 'PageDown':
                if (isOpen) {
                    e.preventDefault();
                    setFocusedIndex(prev => Math.min(prev + 10, filteredOptions.length - 1));
                }
                break;
            case 'PageUp':
                if (isOpen) {
                    e.preventDefault();
                    setFocusedIndex(prev => Math.max(prev - 10, 0));
                }
                break;
            case 'Tab':
                setIsOpen(false);
                break;
        }
    };

    const styles: Record<string, React.CSSProperties> = {
        container: {
            position: 'relative',
            marginBottom: '1rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        label: {
            display: 'block',
            fontWeight: 600,
            marginBottom: '0.25rem',
            color: '#1e293b'
        },
        description: {
            fontSize: '0.875rem',
            color: '#64748b',
            marginBottom: '0.5rem'
        },
        error: {
            fontSize: '0.875rem',
            color: '#dc2626',
            marginTop: '0.25rem'
        },
        input: {
            width: '100%',
            padding: '0.5rem 0.75rem',
            fontSize: '1rem',
            border: `1px solid ${error ? '#dc2626' : '#cbd5e1'}`,
            borderRadius: '0.375rem',
            outline: 'none',
            boxSizing: 'border-box'
        },
        listbox: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #cbd5e1',
            borderRadius: '0.375rem',
            backgroundColor: 'white',
            zIndex: 10,
            marginTop: '0.25rem',
            padding: 0,
            listStyle: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        },
        option: {
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
        },
        activeOption: {
            backgroundColor: '#e2e8f0',
            color: '#0f172a'
        },
        noResults: {
            padding: '0.5rem 0.75rem',
            color: '#64748b',
            fontStyle: 'italic'
        }
    };

    return (
        <div ref={containerRef} className={className} style={styles.container}>
            <label
                id={labelId}
                htmlFor={id}
                style={styles.label}
            >
                {label}
            </label>

            {description && (
                <div id={descriptionId} style={styles.description}>
                    {description}
                </div>
            )}

            <input
                ref={inputRef}
                id={id}
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-controls={listboxId}
                aria-activedescendant={focusedIndex >= 0 ? `${id}-option-${focusedIndex}` : undefined}
                aria-invalid={!!error}
                aria-describedby={
                    [
                        description ? descriptionId : null,
                        error ? errorId : null
                    ].filter(Boolean).join(' ') || undefined
                }
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                style={{
                    ...styles.input,
                    ...(isOpen ? { borderColor: '#3b82f6', ring: '2px solid #93c5fd' } : {})
                }}
            />

            {error && (
                <div id={errorId} style={styles.error} role="alert">
                    {error}
                </div>
            )}

            {isOpen && (
                <ul
                    ref={listboxRef}
                    id={listboxId}
                    role="listbox"
                    aria-label={label}
                    style={styles.listbox}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => {
                            const isSelected = value === option.value;
                            const isFocused = focusedIndex === index;

                            return (
                                <li
                                    key={option.value}
                                    id={`${id}-option-${index}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => handleOptionSelect(option)}
                                    // Use onMouseEnter instead of onFocus since focus stays on input
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    style={{
                                        ...styles.option,
                                        ...(isFocused ? styles.activeOption : {}),
                                        ...(isSelected ? { fontWeight: 'bold' } : {})
                                    }}
                                >
                                    {option.label}
                                    {isSelected && <span aria-hidden="true" style={{ float: 'right' }}>✓</span>}
                                </li>
                            );
                        })
                    ) : (
                        <li style={styles.noResults}>
                            No results found
                        </li>
                    )}
                </ul>
            )}

            <LiveRegion message={announcement} ariaLive="polite" />
        </div>
    );
};
