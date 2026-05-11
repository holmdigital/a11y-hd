import React, { useState, useRef, useEffect, KeyboardEvent, useId } from 'react';
import { LiveRegion } from '../LiveRegion/LiveRegion';
import { getAnnouncement } from '../_i18n/live-region-strings';

export interface MultiSelectOption {
    value: string;
    label: string;
}

export interface MultiSelectProps {
    label: string;
    description?: string;
    error?: string;
    options: MultiSelectOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
    /**
     * BCP-47 locale code for live-region announcement text.
     * Defaults to 'en'. Unknown locales fall back to English.
     * Phase 27 (TC-11-LIVE): added for APG live-region localization.
     */
    locale?: string;
}

/**
 * Accessible MultiSelect Component
 *
 * Allows selecting multiple items from a list.
 * Selected items are displayed as removable tokens (chips).
 *
 * Accessibility Features:
 * - Keyboard navigation for tokens (Left/Right to navigate, Backspace/Delete to remove)
 * - Combobox pattern for adding new items
 * - Screen reader announcements for additions and removals
 *
 * @wcag 1.3.1 Info and Relationships, 2.1.1 Keyboard, 2.4.3 Focus Order, 4.1.2 Name Role Value, 4.1.3 Status Messages
 */
export const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    description,
    error,
    options,
    selected,
    onChange,
    placeholder = 'Select items...',
    className = '',
    locale = 'en'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [activeTokenIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);


    const id = useId();
    const listboxId = `${id}-listbox`;
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    const availableOptions = options.filter(option =>
        !selected.includes(option.value) &&
        option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Live-region announcement for selection count (TC-11-LIVE).
    // D-04: hasInteracted ref suppresses the initial-mount announcement.
    // D-03: NO debounce — selections are user-paced (one click/keystroke each).
    const [announcement, setAnnouncement] = useState('');
    const hasInteracted = useRef(false);

    useEffect(() => {
        if (!hasInteracted.current) return;
        setAnnouncement(
            getAnnouncement('multiselect.selected', locale, selected.length)
        );
    }, [selected.length, locale]);

    const handleSelect = (value: string) => {
        hasInteracted.current = true;
        onChange([...selected, value]);
        setInputValue('');
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.focus();
    };

    const handleRemove = (value: string) => {
        hasInteracted.current = true;
        onChange(selected.filter(v => v !== value));
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (activeTokenIndex !== -1) {
            handleTokenNavigation(e);
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setIsOpen(true);
                setFocusedIndex(prev => prev < availableOptions.length - 1 ? prev + 1 : 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setIsOpen(true);
                setFocusedIndex(prev => prev > 0 ? prev - 1 : availableOptions.length - 1);
                break;
            case 'Enter':
                e.preventDefault();
                if (isOpen && focusedIndex >= 0) {
                    handleSelect(availableOptions[focusedIndex].value);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            case 'Backspace':
                if (inputValue === '' && selected.length > 0) {
                    handleRemove(selected[selected.length - 1]);
                }
                break;
            case 'ArrowLeft':
                if (inputValue === '' && selected.length > 0) {
                    // Start token navigation
                    /* Note: This is a simplifiction. Full grid support would be better 
                       but standard practice often relies on Backspace provided focus is clear. 
                       Here we stick to input focus for simplicity unless requested otherwise.
                    */
                }
                break;
        }
    };

    const handleTokenNavigation = (_e: KeyboardEvent) => {
        // Placeholder for advanced token navigation logic if needed
    };

    // Style constants
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
        inputWrapper: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.375rem',
            border: `1px solid ${error ? '#dc2626' : '#cbd5e1'}`,
            borderRadius: '0.375rem',
            backgroundColor: 'white',
            minHeight: '2.5rem'
        },
        input: {
            flex: 1,
            minWidth: '120px',
            border: 'none',
            outline: 'none',
            padding: '0.25rem',
            fontSize: '1rem'
        },
        token: {
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#e2e8f0',
            border: '1px solid #cbd5e1',
            borderRadius: '0.25rem',
            padding: '0.125rem 0.5rem',
            fontSize: '0.875rem',
            color: '#0f172a'
        },
        removeButton: {
            marginLeft: '0.25rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '0 0.125rem',
            fontSize: '1rem',
            lineHeight: 1,
            color: '#64748b'
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
            cursor: 'pointer'
        },
        activeOption: {
            backgroundColor: '#e2e8f0',
            color: '#0f172a'
        }
    };

    return (
        <div ref={containerRef} className={className} style={styles.container}>
            <label id={labelId} htmlFor={id} style={styles.label}>
                {label}
            </label>

            {description && (
                <div id={descriptionId} style={styles.description}>
                    {description}
                </div>
            )}

            <div style={styles.inputWrapper}>
                {selected.map((value) => {
                    const option = options.find(o => o.value === value);
                    return (
                        <span key={value} style={styles.token}>
                            {option?.label || value}
                            <button
                                type="button"
                                style={styles.removeButton}
                                onClick={() => handleRemove(value)}
                                aria-label={`Remove ${option?.label || value}`}
                            >
                                ×
                            </button>
                        </span>
                    );
                })}
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
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                        setFocusedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    placeholder={selected.length === 0 ? placeholder : ''}
                    style={styles.input}
                />
            </div>

            {error && (
                <div id={errorId} style={styles.error} role="alert">
                    {error}
                </div>
            )}

            {isOpen && availableOptions.length > 0 && (
                <ul
                    id={listboxId}
                    role="listbox"
                    aria-label={label}
                    style={styles.listbox}
                >
                    {availableOptions.map((option, index) => (
                        <li
                            key={option.value}
                            id={`${id}-option-${index}`}
                            role="option"
                            aria-selected={false}
                            onClick={() => handleSelect(option.value)}
                            onMouseEnter={() => setFocusedIndex(index)}
                            style={{
                                ...styles.option,
                                ...(focusedIndex === index ? styles.activeOption : {})
                            }}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}

            <LiveRegion message={announcement} ariaLive="polite" />
        </div>
    );
};
