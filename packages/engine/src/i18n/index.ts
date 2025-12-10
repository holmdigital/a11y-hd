import en from '../locales/en.json';
import sv from '../locales/sv.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';

type LocaleData = typeof en;
type Paths<T> = T extends object ? { [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}` }[keyof T] : never;
type LocaleKey = Paths<LocaleData>;

const locales: Record<string, LocaleData> = {
    en,
    sv,
    de,
    fr,
    es
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
    let value: any = locales[currentLang];

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k as keyof typeof value];
        } else {
            // Fallback to English if key missing in current lang
            let fallbackValue: any = locales['en'];
            for (const fk of keys) {
                if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
                    fallbackValue = fallbackValue[fk as keyof typeof fallbackValue];
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
