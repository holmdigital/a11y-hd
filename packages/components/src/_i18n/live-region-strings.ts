/**
 * Shared live-region announcement strings for APG widgets.
 *
 * Phase 27 (TC-09-LIVE, TC-11-LIVE): two announcement keys × 16 locales.
 * Plural strategy is simple 0 / 1 / N branching per D-02. Complex plural
 * languages (Polish, Czech, Russian) get accurate translations but the
 * branching stays simple — `Intl.PluralRules` migration deferred to v0.8.
 *
 * Phase 28 (TC-10-LIVE): adds `datepicker.selected` (3rd key) and a sibling
 * `getDateAnnouncement(locale, date)` helper. Non-English `Selected:`
 * prefixes are DRAFT translations needing native-speaker review per
 * Phase 27 precedent.
 *
 * Internal utility — `_i18n/` is excluded from tsup build entries
 * (see tsup.config.ts). Consumers should NOT import directly; this module
 * is bundled into Combobox/MultiSelect when those components are imported.
 *
 * Translations marked "DRAFT" need native-speaker review before publish.
 */

export type LiveRegionLocale =
    | 'sv' | 'en' | 'en-gb' | 'en-us' | 'en-ca' | 'en-au'
    | 'de' | 'fr' | 'es' | 'nl' | 'it' | 'pt'
    | 'da' | 'no' | 'fi' | 'pl';

export type LiveRegionKey = 'combobox.results' | 'multiselect.selected' | 'datepicker.selected';

type AnnouncementFn = (count: number) => string;

type AnnouncementTable = Record<LiveRegionLocale, AnnouncementFn>;

/**
 * Locale alias map. Matches AccessibilityStatement.tsx lines 389–394.
 * Accepts BCP-47-ish input (incl. `nb`, `dk`) and resolves to a canonical
 * locale code in our table.
 */
const LOCALE_ALIASES: Record<string, LiveRegionLocale> = {
    sv: 'sv', en: 'en',
    no: 'no', nb: 'no',
    da: 'da', dk: 'da',
    de: 'de', fr: 'fr', es: 'es', fi: 'fi', nl: 'nl',
    it: 'it', pt: 'pt', pl: 'pl',
    'en-gb': 'en-gb', 'en-us': 'en-us', 'en-ca': 'en-ca', 'en-au': 'en-au',
};

// ---------------------------------------------------------------------------
// combobox.results — filtered-options count announcement
// ---------------------------------------------------------------------------

const COMBOBOX_RESULTS: AnnouncementTable = {
    en: (n) => n === 0 ? 'No results' : n === 1 ? '1 result' : `${n} results`,
    'en-gb': (n) => n === 0 ? 'No results' : n === 1 ? '1 result' : `${n} results`,
    'en-us': (n) => n === 0 ? 'No results' : n === 1 ? '1 result' : `${n} results`,
    'en-ca': (n) => n === 0 ? 'No results' : n === 1 ? '1 result' : `${n} results`,
    'en-au': (n) => n === 0 ? 'No results' : n === 1 ? '1 result' : `${n} results`,
    sv: (n) => n === 0 ? 'Inga träffar' : n === 1 ? '1 träff' : `${n} träffar`,
    de: (n) => n === 0 ? 'Keine Ergebnisse' : n === 1 ? '1 Ergebnis' : `${n} Ergebnisse`,
    fr: (n) => n === 0 ? 'Aucun résultat' : n === 1 ? '1 résultat' : `${n} résultats`,
    es: (n) => n === 0 ? 'Sin resultados' : n === 1 ? '1 resultado' : `${n} resultados`,
    nl: (n) => n === 0 ? 'Geen resultaten' : n === 1 ? '1 resultaat' : `${n} resultaten`,
    it: (n) => n === 0 ? 'Nessun risultato' : n === 1 ? '1 risultato' : `${n} risultati`,
    pt: (n) => n === 0 ? 'Sem resultados' : n === 1 ? '1 resultado' : `${n} resultados`,
    da: (n) => n === 0 ? 'Ingen resultater' : n === 1 ? '1 resultat' : `${n} resultater`,
    no: (n) => n === 0 ? 'Ingen treff' : n === 1 ? '1 treff' : `${n} treff`,
    fi: (n) => n === 0 ? 'Ei tuloksia' : n === 1 ? '1 tulos' : `${n} tulosta`,
    pl: (n) => n === 0 ? 'Brak wyników' : n === 1 ? '1 wynik' : `${n} wyników`,
};

// ---------------------------------------------------------------------------
// multiselect.selected — selection count announcement
// ---------------------------------------------------------------------------

const MULTISELECT_SELECTED: AnnouncementTable = {
    en: (n) => n === 0 ? 'No items selected' : n === 1 ? '1 item selected' : `${n} items selected`,
    'en-gb': (n) => n === 0 ? 'No items selected' : n === 1 ? '1 item selected' : `${n} items selected`,
    'en-us': (n) => n === 0 ? 'No items selected' : n === 1 ? '1 item selected' : `${n} items selected`,
    'en-ca': (n) => n === 0 ? 'No items selected' : n === 1 ? '1 item selected' : `${n} items selected`,
    'en-au': (n) => n === 0 ? 'No items selected' : n === 1 ? '1 item selected' : `${n} items selected`,
    sv: (n) => n === 0 ? 'Inga valda' : n === 1 ? '1 vald' : `${n} valda`,
    de: (n) => n === 0 ? 'Nichts ausgewählt' : n === 1 ? '1 Element ausgewählt' : `${n} Elemente ausgewählt`,
    fr: (n) => n === 0 ? 'Aucun élément sélectionné' : n === 1 ? '1 élément sélectionné' : `${n} éléments sélectionnés`,
    es: (n) => n === 0 ? 'Nada seleccionado' : n === 1 ? '1 elemento seleccionado' : `${n} elementos seleccionados`,
    nl: (n) => n === 0 ? 'Niets geselecteerd' : n === 1 ? '1 item geselecteerd' : `${n} items geselecteerd`,
    it: (n) => n === 0 ? 'Nessun elemento selezionato' : n === 1 ? '1 elemento selezionato' : `${n} elementi selezionati`,
    pt: (n) => n === 0 ? 'Nada selecionado' : n === 1 ? '1 item selecionado' : `${n} itens selecionados`,
    da: (n) => n === 0 ? 'Intet valgt' : n === 1 ? '1 valgt' : `${n} valgt`,
    no: (n) => n === 0 ? 'Ingen valgt' : n === 1 ? '1 valgt' : `${n} valgt`,
    fi: (n) => n === 0 ? 'Ei valintoja' : n === 1 ? '1 valittu' : `${n} valittua`,
    pl: (n) => n === 0 ? 'Brak wybranych' : n === 1 ? '1 wybrany' : `${n} wybranych`,
};

export const LIVE_REGION_STRINGS = {
    'combobox.results': COMBOBOX_RESULTS,
    'multiselect.selected': MULTISELECT_SELECTED,
} as const;

// ---------------------------------------------------------------------------
// datepicker.selected — Phase 28 TC-10-LIVE
//
// Distinct shape from the count-based AnnouncementTable above: this table
// holds the localised "Selected: " PREFIX. The localised long-form date
// itself is composed at call time via `Intl.DateTimeFormat(locale, { dateStyle: 'long' })`
// inside getDateAnnouncement, so the prefix table holds plain strings, not
// functions. Per D-06, do NOT shoehorn into AnnouncementTable — cleaner types
// via a dedicated table + dedicated helper.
//
// All 11 non-English strings (sv/de/fr/es/nl/it/pt/da/no/fi/pl) ship as
// DRAFT translations needing native-speaker review (Phase 27 precedent).
// Swedish å/ä/ö, German ü, French é must be preserved verbatim (MEMORY).
// ---------------------------------------------------------------------------

const DATEPICKER_SELECTED_PREFIX: Record<LiveRegionLocale, string> = {
    en: 'Selected: ',
    'en-gb': 'Selected: ',
    'en-us': 'Selected: ',
    'en-ca': 'Selected: ',
    'en-au': 'Selected: ',
    sv: 'Valt: ',
    de: 'Ausgewählt: ',
    fr: 'Sélectionné : ', // French space-before-colon per D-06
    es: 'Seleccionado: ',
    nl: 'Geselecteerd: ',
    it: 'Selezionato: ',
    pt: 'Selecionado: ',
    da: 'Valgt: ',
    no: 'Valgt: ',
    fi: 'Valittu: ',
    pl: 'Wybrano: ',
};

/**
 * Resolve an announcement string for the given key, locale, and count.
 * Falls back to English for unknown locales (mirrors AccessibilityStatement
 * line 401 pattern). Accepts BCP-47 aliases via LOCALE_ALIASES.
 */
export function getAnnouncement(
    key: LiveRegionKey,
    locale: string | undefined,
    count: number
): string {
    const canonical: LiveRegionLocale =
        (locale && LOCALE_ALIASES[locale]) ?? 'en';
    // Only count-based tables are reachable through this overload.
    const table = LIVE_REGION_STRINGS[key as 'combobox.results' | 'multiselect.selected'];
    const fn = table[canonical] ?? table.en;
    return fn(count);
}

/**
 * Compose a localised "Selected: {long date}" string for the DatePicker
 * live-region announcement (TC-10-LIVE).
 *
 * Falls back to English when locale is unknown (mirrors getAnnouncement).
 * Accepts BCP-47 aliases (`nb` → no, `dk` → da) via LOCALE_ALIASES.
 *
 * Inlines its own Intl.DateTimeFormat call rather than depending on the
 * DatePicker's date-utils module — `_i18n/` is the foundation layer and
 * importing from a component subdir would invert the dependency arrow.
 */
export function getDateAnnouncement(
    locale: string | undefined,
    date: Date
): string {
    const canonical: LiveRegionLocale =
        (locale && LOCALE_ALIASES[locale]) ?? 'en';
    const prefix = DATEPICKER_SELECTED_PREFIX[canonical] ?? DATEPICKER_SELECTED_PREFIX.en;
    let formatted: string;
    try {
        formatted = new Intl.DateTimeFormat(canonical, { dateStyle: 'long' }).format(date);
    } catch {
        formatted = new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(date);
    }
    return `${prefix}${formatted}`;
}
