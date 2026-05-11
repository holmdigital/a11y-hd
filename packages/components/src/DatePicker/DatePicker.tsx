import { useId, useState, useRef, useMemo, useEffect } from 'react';
import './DatePicker.css';
import {
    getFirstDayOfMonth,
    getWeekStartForLocale,
    isSameDay,
    clampDate,
} from './date-utils';

export interface DatePickerProps {
    /** Label for the date picker — wired to the trigger button via aria-labelledby */
    label: string;
    /** Optional helper text shown below the label */
    description?: string;
    /** Optional error message (renders with role="alert") */
    error?: string;
    /** Consumer className appended to outer wrapper */
    className?: string;
    /**
     * Selected date.
     * BREAKING in v0.7 (Phase 28): was `string` via InputHTMLAttributes in v0.6
     * and earlier. See packages/components/CHANGELOG.md for migration guidance.
     */
    value?: Date;
    /** Called when a date is committed (commit logic wired in Plan 28-02) */
    onChange?: (date: Date) => void;
    /** Minimum allowed date (inclusive). Cells before this render as aria-disabled. */
    minDate?: Date;
    /** Maximum allowed date (inclusive). Cells after this render as aria-disabled. */
    maxDate?: Date;
    /** BCP-47 locale for date formatting and week-start (default 'en') */
    locale?: string;
    /** Placeholder text shown on the trigger when no value selected */
    placeholder?: string;
}

/**
 * Accessible DatePicker with W3C APG dialog-grid calendar UI.
 *
 * Phase 28 v0.7 — replaces the v0.6 native `<input type="date">` implementation.
 * - Plan 28-01: base render + structural ARIA (this file)
 * - Plan 28-02: APG keyboard handler + focus trap
 * - Plan 28-03: live-region announcement on commit (TC-10-LIVE)
 */
export function DatePicker({
    label,
    description,
    error,
    className = '',
    value,
    onChange: _onChange, // wired in Plan 28-02
    minDate,
    maxDate,
    locale = 'en',
    placeholder = 'Pick a date',
}: DatePickerProps) {
    const baseId = useId();
    const labelId = `${baseId}-label`;
    const descriptionId = `${baseId}-description`;
    const errorId = `${baseId}-error`;
    const dialogId = `${baseId}-dialog`;
    const dialogTitleId = `${baseId}-dialog-title`;
    const gridId = `${baseId}-grid`;

    const today = useMemo(() => new Date(), []);
    const [isOpen, setIsOpen] = useState(false);
    // Cursor month/year for the currently-rendered calendar page.
    // Initialised from `value` if present, else from today.
    const [cursor, setCursor] = useState<Date>(() => {
        const seed = value ?? today;
        return new Date(seed.getFullYear(), seed.getMonth(), 1);
    });
    // Cursor re-sync deferred to Plan 28-02. setCursor reserved so React keeps
    // the state slot live for that wiring; reference it here to silence
    // unused-setter lint without changing behaviour.
    void setCursor;

    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    // Click-outside-to-close (Plan 28-01 minimal version; 28-02 adds Escape).
    useEffect(() => {
        if (!isOpen) return;
        const onDocClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                popupRef.current && !popupRef.current.contains(target)
                && triggerRef.current && !triggerRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [isOpen]);

    const weekStart = getWeekStartForLocale(locale); // 1=Mon ... 7=Sun (ISO)
    const monthYearLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(cursor);

    // Compute the 42-cell grid: start from the first weekday of the cursor month,
    // back up to the closest preceding weekStart day, render 6 weeks (42 cells).
    const gridCells: Date[] = useMemo(() => {
        const firstOfMonth = getFirstDayOfMonth(cursor.getFullYear(), cursor.getMonth());
        // JS Date.getDay(): 0=Sun ... 6=Sat. Convert to ISO 1=Mon...7=Sun.
        const isoDay = ((firstOfMonth.getDay() + 6) % 7) + 1;
        const leadingBlanks = (isoDay - weekStart + 7) % 7;
        const start = new Date(firstOfMonth);
        start.setDate(start.getDate() - leadingBlanks);
        const cells: Date[] = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            cells.push(d);
        }
        return cells;
    }, [cursor, weekStart]);

    // Day-of-week header labels (Mon, Tue, ...) — locale-aware.
    const dayHeaders: string[] = useMemo(() => {
        const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
        // Anchor at a known Monday (2026-01-05 is a Monday) and walk through
        // 7 days starting from weekStart offset.
        const monday = new Date(2026, 0, 5);
        const headers: string[] = [];
        for (let i = 0; i < 7; i++) {
            const offset = (weekStart - 1 + i) % 7;
            const d = new Date(monday);
            d.setDate(monday.getDate() + offset);
            headers.push(fmt.format(d));
        }
        return headers;
    }, [locale, weekStart]);

    // Trigger label: formatted date if value present, placeholder otherwise.
    const triggerLabel = value
        ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(value)
        : placeholder;

    const describedByIds = [
        description ? descriptionId : null,
        error ? errorId : null,
    ].filter(Boolean).join(' ') || undefined;

    return (
        <div className={`hd-datepicker ${className}`.trim()}>
            <div id={labelId} className="hd-datepicker__label">{label}</div>
            {description && (
                <div id={descriptionId} className="hd-datepicker__description">{description}</div>
            )}
            <button
                ref={triggerRef}
                type="button"
                className="hd-datepicker__trigger"
                aria-labelledby={labelId}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls={dialogId}
                aria-describedby={describedByIds}
                aria-invalid={error ? true : undefined}
                onClick={() => setIsOpen((o) => !o)}
            >
                {triggerLabel}
            </button>
            {error && (
                <div id={errorId} className="hd-datepicker__error" role="alert">{error}</div>
            )}
            {isOpen && (
                <div
                    ref={popupRef}
                    id={dialogId}
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby={dialogTitleId}
                    className="hd-datepicker__popup"
                >
                    <div className="hd-datepicker__header">
                        <button
                            type="button"
                            className="hd-datepicker__nav"
                            aria-label="Previous year"
                            data-nav="prev-year"
                            /* Plan 28-02 wires onClick */
                        >‹‹</button>
                        <button
                            type="button"
                            className="hd-datepicker__nav"
                            aria-label="Previous month"
                            data-nav="prev-month"
                        >‹</button>
                        <div id={dialogTitleId} className="hd-datepicker__title">
                            {monthYearLabel}
                        </div>
                        <button
                            type="button"
                            className="hd-datepicker__nav"
                            aria-label="Next month"
                            data-nav="next-month"
                        >›</button>
                        <button
                            type="button"
                            className="hd-datepicker__nav"
                            aria-label="Next year"
                            data-nav="next-year"
                        >››</button>
                    </div>
                    <div
                        id={gridId}
                        role="grid"
                        aria-labelledby={dialogTitleId}
                        className="hd-datepicker__grid"
                    >
                        <div role="row" className="hd-datepicker__weekdays">
                            {dayHeaders.map((h, i) => (
                                <span key={i} role="columnheader" className="hd-datepicker__weekday">{h}</span>
                            ))}
                        </div>
                        {[0, 1, 2, 3, 4, 5].map((week) => (
                            <div key={week} role="row" className="hd-datepicker__week">
                                {gridCells.slice(week * 7, week * 7 + 7).map((d) => {
                                    const inMonth = d.getMonth() === cursor.getMonth();
                                    const isToday = isSameDay(d, today);
                                    const isSelected = !!value && isSameDay(d, value);
                                    const clamped = clampDate(d, minDate, maxDate);
                                    const isDisabled = !isSameDay(clamped, d);
                                    const dataState = isSelected ? 'selected' : isToday ? 'today' : undefined;
                                    return (
                                        <button
                                            key={d.getTime()}
                                            type="button"
                                            role="gridcell"
                                            aria-selected={isSelected || undefined}
                                            aria-current={isToday ? 'date' : undefined}
                                            aria-disabled={isDisabled || undefined}
                                            tabIndex={-1}
                                            data-state={dataState}
                                            data-in-month={inMonth ? 'true' : 'false'}
                                            className="hd-datepicker__cell"
                                            /* Plan 28-02 wires onClick + keyboard */
                                        >
                                            {d.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

DatePicker.displayName = 'DatePicker';
