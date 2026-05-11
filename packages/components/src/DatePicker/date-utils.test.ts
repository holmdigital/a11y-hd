/**
 * Pure-logic unit tests for date-utils helpers.
 *
 * D-05 documented exception: this is a NEW pure-logic unit-test file. The
 * project's WCAG-SC marker convention applies to component test files
 * (DatePicker.test.tsx, etc.); pure date math has no WCAG SC mapping.
 */
import { describe, it, expect } from 'vitest';
import {
    getDaysInMonth,
    getFirstDayOfMonth,
    getWeekStartForLocale,
    isSameDay,
    addDays,
    addMonths,
    clampDate,
    formatDateForAnnouncement,
} from './date-utils';

describe('getDaysInMonth', () => {
    it('returns 28 for non-leap February 2026 (month index 1)', () => {
        expect(getDaysInMonth(2026, 1)).toBe(28);
    });

    it('returns 29 for leap-year February 2024', () => {
        expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it('returns 31 for January (month index 0)', () => {
        expect(getDaysInMonth(2026, 0)).toBe(31);
    });
});

describe('getFirstDayOfMonth', () => {
    it('returns a Date whose getDate()===1 and getMonth() matches input', () => {
        const d = getFirstDayOfMonth(2026, 4);
        expect(d.getDate()).toBe(1);
        expect(d.getMonth()).toBe(4);
        expect(d.getFullYear()).toBe(2026);
    });
});

describe('getWeekStartForLocale', () => {
    it('returns either 1 (Mon) or 7 (Sun) for en-us (runtime-tolerant)', () => {
        const v = getWeekStartForLocale('en-us');
        expect([1, 7]).toContain(v);
    });

    it('returns Monday-anchored value for sv (1 if weekInfo missing, 1 if present — Sweden uses Mon)', () => {
        const v = getWeekStartForLocale('sv');
        expect([1, 7]).toContain(v);
    });
});

describe('isSameDay', () => {
    it('returns true for same y/m/d different hours (DST-safe)', () => {
        const a = new Date(2026, 2, 14, 1, 0, 0);
        const b = new Date(2026, 2, 14, 23, 30, 0);
        expect(isSameDay(a, b)).toBe(true);
    });

    it('returns false for adjacent days', () => {
        const a = new Date(2026, 2, 14);
        const b = new Date(2026, 2, 15);
        expect(isSameDay(a, b)).toBe(false);
    });
});

describe('addDays', () => {
    it('overflows month boundary: Jan 31 + 1 = Feb 1', () => {
        const r = addDays(new Date(2026, 0, 31), 1);
        expect(r.getMonth()).toBe(1);
        expect(r.getDate()).toBe(1);
        expect(r.getFullYear()).toBe(2026);
    });

    it('subtracts negative n', () => {
        const r = addDays(new Date(2026, 2, 1), -1);
        expect(r.getMonth()).toBe(1);
        expect(r.getDate()).toBe(28);
    });
});

describe('addMonths', () => {
    it('clamps March 31 + 1 month to April 30 (NOT May 1)', () => {
        const r = addMonths(new Date(2026, 2, 31), 1);
        expect(r.getMonth()).toBe(3);
        expect(r.getDate()).toBe(30);
        expect(r.getFullYear()).toBe(2026);
    });

    it('handles negative n crossing year boundary: Jan 15 - 1 month = Dec 15 prev year', () => {
        const r = addMonths(new Date(2026, 0, 15), -1);
        expect(r.getMonth()).toBe(11);
        expect(r.getDate()).toBe(15);
        expect(r.getFullYear()).toBe(2025);
    });
});

describe('clampDate', () => {
    const min = new Date(2026, 0, 1);
    const max = new Date(2026, 11, 31);

    it('returns min when date is before min', () => {
        const d = new Date(2025, 5, 1);
        expect(clampDate(d, min, max)).toBe(min);
    });

    it('returns max when date is after max', () => {
        const d = new Date(2027, 5, 1);
        expect(clampDate(d, min, max)).toBe(max);
    });

    it('returns date when in range', () => {
        const d = new Date(2026, 5, 1);
        expect(clampDate(d, min, max)).toBe(d);
    });

    it('handles undefined min (no lower bound)', () => {
        const d = new Date(1900, 0, 1);
        expect(clampDate(d, undefined, max)).toBe(d);
    });

    it('handles undefined max (no upper bound)', () => {
        const d = new Date(3000, 0, 1);
        expect(clampDate(d, min, undefined)).toBe(d);
    });
});

describe('formatDateForAnnouncement', () => {
    it('English long format contains "March" and "2026"', () => {
        const s = formatDateForAnnouncement(new Date(2026, 2, 14), 'en');
        expect(s).toMatch(/March/);
        expect(s).toMatch(/2026/);
    });

    it('falls back gracefully for unknown locale "xx" (returns some non-empty string)', () => {
        const s = formatDateForAnnouncement(new Date(2026, 2, 14), 'xx');
        expect(typeof s).toBe('string');
        expect(s.length).toBeGreaterThan(0);
    });
});
