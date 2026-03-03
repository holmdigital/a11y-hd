import en from '../locales/en.json';
import sv from '../locales/sv.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import fi from '../locales/fi.json';
import dk from '../locales/dk.json';
import no from '../locales/no.json';

import nl from '../locales/nl.json';

type LocaleData = typeof en;
type Paths<T> = T extends object ? { [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}` }[keyof T] : never;
type LocaleKey = Paths<LocaleData>;

const locales: Record<string, LocaleData> = {
    en,
    sv,
    de,
    fr,
    es,
    nl,
    fi,
    dk,
    no,
    'en-gb': en,
    'en-us': en,
    'en-ca': en,
    'da': dk,
    'nb': no // Norwegian Bokmål alias
};

let currentLang = 'en';

export function setLanguage(lang: string) {
    if (locales[lang]) {
        currentLang = lang;
    } else {
        console.warn(`Language '${lang}' not found, falling back to 'en'.`);
        currentLang = 'en';
    }
}

export function t(key: LocaleKey, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: unknown = locales[currentLang];

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
        } else {
            // Fallback to English if key missing in current lang
            let fallbackValue: unknown = locales['en'];
            for (const fk of keys) {
                if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
                    fallbackValue = (fallbackValue as Record<string, unknown>)[fk];
                } else {
                    return key; // Key not found
                }
            }
            value = fallbackValue;
            break;
        }
    }

    if (typeof value !== 'string') return key;

    if (params) {
        return value.replace(/{(\w+)}/g, (_, k) => {
            return params[k] !== undefined ? String(params[k]) : `{${k}}`;
        });
    }

    return value;
}

export function getCurrentLang() {
    return currentLang;
}
