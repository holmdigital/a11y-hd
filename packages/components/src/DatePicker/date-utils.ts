/**
 * DatePicker internal date helpers — Phase 28 D-02.
 *
 * Vanilla `Date` + `Intl` only. No new dependencies.
 *
 * Internal module: excluded from tsup public-entry glob via the
 * `!src/DatePicker/date-utils.ts` line in tsup.config.ts. Bundled into
 * DatePicker.{js,mjs} when DatePicker is imported.
 */

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): Date {
    return new Date(year, month, 1);
}

/**
 * Returns ISO 8601 week-start day number: 1 = Monday, 7 = Sunday.
 * Uses `Intl.Locale(locale).weekInfo?.firstDay` where available;
 * falls back to Monday (1) for runtimes without `weekInfo` (older Node,
 * older browsers).
 */
export function getWeekStartForLocale(locale: string): number {
    try {
        const info = (new Intl.Locale(locale) as unknown as { weekInfo?: { firstDay?: number } }).weekInfo;
        if (info && typeof info.firstDay === 'number') return info.firstDay;
    } catch {
        /* fall through */
    }
    return 1;
}

/** Compares year/month/date triples — DST-safe (does NOT compare timestamps). */
export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function addDays(date: Date, n: number): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
}

/**
 * Month-overflow-safe: `addMonths(2026-03-31, 1) === 2026-04-30` (clamped to
 * last day of target month), NOT 2026-05-01 (naive `setMonth` behaviour).
 */
export function addMonths(date: Date, n: number): Date {
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const targetYear = y + Math.floor((m + n) / 12);
    const targetMonth = (((m + n) % 12) + 12) % 12;
    const daysInTarget = getDaysInMonth(targetYear, targetMonth);
    return new Date(targetYear, targetMonth, Math.min(d, daysInTarget));
}

export function clampDate(date: Date, min?: Date, max?: Date): Date {
    if (min && date.getTime() < min.getTime()) return min;
    if (max && date.getTime() > max.getTime()) return max;
    return date;
}

export function formatDateForAnnouncement(date: Date, locale: string): string {
    try {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date);
    } catch {
        return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(date);
    }
}
