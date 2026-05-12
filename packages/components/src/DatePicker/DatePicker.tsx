import type React from 'react';
import { useId, useState, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import './DatePicker.css';
import {
    addDays,
    addMonths,
    getFirstDayOfMonth,
    getWeekStartForLocale,
    isSameDay,
    clampDate,
} from './date-utils';
import { useFocusTrap } from '../_hooks/useFocusTrap';
import { LiveRegion } from '../LiveRegion/LiveRegion';
import { getDateAnnouncement } from '../_i18n/live-region-strings';

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
    /** Called when a date is committed (Enter / Space / click on a non-disabled cell) */
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
 * - Plan 28-01: base render + structural ARIA
 * - Plan 28-02: APG keyboard handler + roving tabindex + focus trap + commit logic
 *   (WCAG 2.1.1 Keyboard, 2.4.3 Focus Order, 2.4.7 Focus Visible via :focus-visible in CSS)
 * - Plan 28-03: live-region announcement on commit (TC-10-LIVE, WCAG 4.1.3)
 *   — `<LiveRegion>` mounted as last child of outer wrapper; `announcement`
 *   state updated in commitDate + cell onClick via getDateAnnouncement(locale, date).
 *   Phase 27 D-04 `hasInteracted` ref kept for cross-widget consistency.
 *
 * APG keyboard matrix implemented here:
 * | Key                  | Action                                              |
 * |----------------------|-----------------------------------------------------|
 * | ArrowLeft / Right    | focusedDate ± 1 day                                 |
 * | ArrowUp / Down       | focusedDate ± 7 days                                |
 * | Home / End           | week start / week end (locale-aware weekStart)      |
 * | PageUp / PageDown    | addMonths(focusedDate, ∓1)                          |
 * | Shift+PageUp / Down  | addMonths(focusedDate, ∓12) (year jump)             |
 * | Enter / Space        | commit focusedDate (if not disabled)                |
 * | Escape               | close, no commit, return focus to trigger           |
 * | Tab / Shift+Tab      | cycle inside dialog (handled by useFocusTrap)       |
 */
export function DatePicker({
    label,
    description,
    error,
    className = '',
    value,
    onChange,
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

    // The cell carrying tabindex=0 (roving anchor for APG keyboard).
    // Initialised when the dialog opens; persists across open/close cycles.
    const [focusedDate, setFocusedDate] = useState<Date | null>(null);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    // Map from date.getTime() → cell button element, for imperative focus.
    const focusCellRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    // Plan 28-03 (TC-10-LIVE): live-region announcement state + no-mount-announce gate.
    // `<LiveRegion>` internally guards against empty `message`, so initial mount
    // does NOT announce. `hasInteracted` is kept per Phase 27 D-04 pattern for
    // cross-widget consistency and to future-proof complex announcement paths.
    const [announcement, setAnnouncement] = useState<string>('');
    const hasInteracted = useRef(false);

    // When the dialog opens, initialise focusedDate and advance cursor to match.
    useEffect(() => {
        if (!isOpen) return;
        const anchor = clampDate(value ?? today, minDate, maxDate);
        setFocusedDate(anchor);
        // Ensure cursor page contains the anchor.
        if (
            anchor.getMonth() !== cursor.getMonth() ||
            anchor.getFullYear() !== cursor.getFullYear()
        ) {
            setCursor(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // After the grid re-renders with the new focusedDate, imperatively focus the cell.
    useLayoutEffect(() => {
        if (!isOpen || !focusedDate) return;
        const cell = focusCellRefs.current.get(focusedDate.getTime());
        if (cell && typeof cell.focus === 'function') {
            cell.focus();
        }
    }, [isOpen, focusedDate]);

    // Engage the focus trap while the dialog is open.
    // useFocusTrap will move focus to the first focusable element inside popupRef
    // when `isOpen` flips true; our useLayoutEffect above then re-focuses the
    // specific roving cell.
    useFocusTrap(popupRef, isOpen);

    // Click-outside-to-close.
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

    // --- Commit and close helpers ---

    const commitDate = (date: Date) => {
        const clamped = clampDate(date, minDate, maxDate);
        if (!isSameDay(clamped, date)) return; // out-of-bounds — no-op
        onChange?.(clamped);
        hasInteracted.current = true;
        setAnnouncement(getDateAnnouncement(locale, clamped));
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    const closeAndReturnFocus = () => {
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    // --- APG keyboard handler on the grid ---

    const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!focusedDate) return;
        let next: Date | null = null;

        switch (e.key) {
            case 'ArrowLeft':
                next = addDays(focusedDate, -1);
                break;
            case 'ArrowRight':
                next = addDays(focusedDate, 1);
                break;
            case 'ArrowUp':
                next = addDays(focusedDate, -7);
                break;
            case 'ArrowDown':
                next = addDays(focusedDate, 7);
                break;
            case 'Home': {
                // Jump to first day of current week (locale-aware weekStart).
                const isoDay = ((focusedDate.getDay() + 6) % 7) + 1;
                const back = (isoDay - weekStart + 7) % 7;
                next = addDays(focusedDate, -back);
                break;
            }
            case 'End': {
                // Jump to last day of current week.
                const isoDay = ((focusedDate.getDay() + 6) % 7) + 1;
                const forward = (6 - ((isoDay - weekStart + 7) % 7));
                next = addDays(focusedDate, forward);
                break;
            }
            case 'PageUp':
                next = e.shiftKey ? addMonths(focusedDate, -12) : addMonths(focusedDate, -1);
                break;
            case 'PageDown':
                next = e.shiftKey ? addMonths(focusedDate, 12) : addMonths(focusedDate, 1);
                break;
            case 'Enter':
            case ' ':
            case 'Spacebar': // legacy IE/Edge alias
                e.preventDefault();
                commitDate(focusedDate);
                return;
            case 'Escape':
                e.preventDefault();
                closeAndReturnFocus();
                return;
            default:
                return;
        }

        if (next) {
            e.preventDefault();
            const clamped = clampDate(next, minDate, maxDate);
            setFocusedDate(clamped);
            // Advance cursor page if the new focusedDate is outside the visible month.
            if (
                clamped.getMonth() !== cursor.getMonth() ||
                clamped.getFullYear() !== cursor.getFullYear()
            ) {
                setCursor(new Date(clamped.getFullYear(), clamped.getMonth(), 1));
            }
        }
    };

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
                            onClick={() => setCursor((c) => addMonths(c, -12))}
                        >‹‹</button>
                        <button
                            type="button"
                            className="hd-datepicker__nav"
                            aria-label="Previous month"
                            data-nav="prev-month"
                            onClick={() => setCursor((c) => addMonths(c, -1))}
                        >‹</button>
                        <div id={dialogTitleId} className="hd-datepicker__title">
                            {monthYearLabel}
                        </div>
                        <button
                            type="button"
                            className="hd-datepicker__nav"
                            aria-label="Next month"
                            data-nav="next-month"
                            onClick={() => setCursor((c) => addMonths(c, 1))}
                        >›</button>
                        <button
                            type="button"
                            className="hd-datepicker__nav"
                            aria-label="Next year"
                            data-nav="next-year"
                            onClick={() => setCursor((c) => addMonths(c, 12))}
                        >››</button>
                    </div>
                    <div
                        id={gridId}
                        role="grid"
                        aria-labelledby={dialogTitleId}
                        className="hd-datepicker__grid"
                        onKeyDown={onGridKeyDown}
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
                                    const isFocused = !!focusedDate && isSameDay(d, focusedDate);
                                    return (
                                        <button
                                            key={d.getTime()}
                                            type="button"
                                            role="gridcell"
                                            ref={(node) => {
                                                if (node) {
                                                    focusCellRefs.current.set(d.getTime(), node);
                                                } else {
                                                    focusCellRefs.current.delete(d.getTime());
                                                }
                                            }}
                                            aria-selected={isSelected || undefined}
                                            aria-current={isToday ? 'date' : undefined}
                                            aria-disabled={isDisabled || undefined}
                                            tabIndex={isFocused ? 0 : -1}
                                            data-state={dataState}
                                            data-in-month={inMonth ? 'true' : 'false'}
                                            className="hd-datepicker__cell"
                                            onClick={() => {
                                                if (isDisabled) return;
                                                setFocusedDate(d);
                                                onChange?.(d);
                                                hasInteracted.current = true;
                                                setAnnouncement(getDateAnnouncement(locale, d));
                                                setIsOpen(false);
                                                triggerRef.current?.focus();
                                            }}
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
            <LiveRegion message={announcement} ariaLive="polite" />
        </div>
    );
}

DatePicker.displayName = 'DatePicker';
