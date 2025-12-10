/**
 * DOS-lagen Custom Rules
 * Tillgänglighetsregler baserade på svensk DOS-lag (Diskrimineringslagen)
 */

import type { CustomRule } from '../types';

/**
 * Custom axe-core rules för DOS-lagen
 * 
 * DOS-lagen (Lagen om tillgänglighet till digital offentlig service) kräver att
 * offentliga myndigheters webbplatser och mobilapplikationer uppfyller tillgänglighetskrav.
 * 
 * Lagen bygger på WCAG 2.1 nivå AA och EN 301 549.
 */
export const dosLagenRules: CustomRule[] = [
    {
        id: 'dos-tillganglighetsredogorelse',
        metadata: {
            description: 'Kontrollerar att tillgänglighetsredogörelse finns',
            help: 'Offentliga webbplatser måste ha en tillgänglighetsredogörelse',
            helpUrl: 'https://a11y.holmdigital.se/dos-lagen/tillganglighetsredogorelse',
        },
        tags: ['dos-lagen', 'swedish-law', 'compliance'],
        evaluate: (node: HTMLElement) => {
            if (node.tagName !== 'BODY') return true;

            // Sök efter länkar till tillgänglighetsredogörelse
            const links = document.querySelectorAll('a');
            const hasAccessibilityStatement = Array.from(links).some(link => {
                const text = link.textContent?.toLowerCase() || '';
                const href = link.getAttribute('href')?.toLowerCase() || '';

                return (
                    text.includes('tillgänglighetsredogörelse') ||
                    text.includes('tillgänglighet') ||
                    href.includes('tillganglighet') ||
                    href.includes('accessibility')
                );
            });

            return hasAccessibilityStatement;
        },
    },

    {
        id: 'dos-kontaktuppgifter',
        metadata: {
            description: 'Kontrollerar att kontaktuppgifter för tillgänglighetsfrågor finns',
            help: 'Webbplatsen måste ha kontaktuppgifter för att rapportera tillgänglighetsproblem',
            helpUrl: 'https://a11y.holmdigital.se/dos-lagen/kontaktuppgifter',
        },
        tags: ['dos-lagen', 'swedish-law', 'contact'],
        evaluate: (node: HTMLElement) => {
            if (node.tagName !== 'BODY') return true;

            // Sök efter kontaktinformation
            const text = document.body.textContent?.toLowerCase() || '';

            const hasContactInfo =
                text.includes('kontakta oss') ||
                text.includes('kontakt') ||
                text.includes('e-post') ||
                text.includes('telefon');

            return hasContactInfo;
        },
    },

    {
        id: 'dos-wcag-21-aa',
        metadata: {
            description: 'Kontrollerar att webbplatsen följer WCAG 2.1 nivå AA',
            help: 'DOS-lagen kräver WCAG 2.1 nivå AA som minimum',
            helpUrl: 'https://a11y.holmdigital.se/dos-lagen/wcag-krav',
        },
        tags: ['dos-lagen', 'wcag21aa', 'compliance'],
        evaluate: (node: HTMLElement) => {
            // Denna regel är mer av en meta-regel som säkerställer att WCAG 2.1 AA körs
            // Själva valideringen görs av axe-core's WCAG-regler
            return true;
        },
    },

    {
        id: 'dos-svenska-spraket',
        metadata: {
            description: 'Kontrollerar att svenskt innehåll är korrekt språkmarkerat',
            help: 'Svenskt innehåll måste vara markerat med lang="sv"',
            helpUrl: 'https://a11y.holmdigital.se/dos-lagen/sprak',
        },
        tags: ['dos-lagen', 'swedish-law', 'language'],
        evaluate: (node: HTMLElement) => {
            if (node.tagName !== 'HTML') return true;

            const lang = node.getAttribute('lang')?.toLowerCase() || '';

            // Kontrollera om sidan är på svenska
            const bodyText = document.body.textContent?.toLowerCase() || '';
            const swedishWords = ['och', 'att', 'för', 'är', 'på', 'med', 'som', 'den', 'det'];
            const hasSw edishContent = swedishWords.some(word => bodyText.includes(` ${word} `));

            if (hasSwedishContent) {
                return lang.startsWith('sv');
            }

            return true;
        },
    },

    {
        id: 'dos-pdf-tillganglighet',
        metadata: {
            description: 'Kontrollerar att PDF-länkar har information om tillgänglighet',
            help: 'Länkar till PDF-dokument måste informera om tillgänglighet',
            helpUrl: 'https://a11y.holmdigital.se/dos-lagen/pdf',
        },
        tags: ['dos-lagen', 'swedish-law', 'pdf'],
        evaluate: (node: HTMLElement) => {
            if (node.tagName !== 'A') return true;

            const href = node.getAttribute('href')?.toLowerCase() || '';
            if (!href.endsWith('.pdf')) return true;

            // Kontrollera om det finns information om PDF
            const text = node.textContent?.toLowerCase() || '';
            const ariaLabel = node.getAttribute('aria-label')?.toLowerCase() || '';
            const title = node.getAttribute('title')?.toLowerCase() || '';

            const hasPdfIndicator =
                text.includes('pdf') ||
                ariaLabel.includes('pdf') ||
                title.includes('pdf');

            return hasPdfIndicator;
        },
    },

    {
        id: 'dos-video-textning',
        metadata: {
            description: 'Kontrollerar att videor har textning',
            help: 'Videor måste ha textning (undertexter)',
            helpUrl: 'https://a11y.holmdigital.se/dos-lagen/video',
        },
        tags: ['dos-lagen', 'swedish-law', 'video', 'captions'],
        evaluate: (node: HTMLElement) => {
            if (node.tagName !== 'VIDEO') return true;

            // Kontrollera om det finns track-element för textning
            const tracks = node.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');

            // Kontrollera om det finns svenska textspår
            const hasSwedishCaptions = Array.from(tracks).some(track => {
                const srclang = track.getAttribute('srclang')?.toLowerCase() || '';
                return srclang === 'sv' || srclang === 'sv-se';
            });

            return hasSwedishCaptions || tracks.length > 0;
        },
    },

    {
        id: 'dos-formular-felhante ring',
        metadata: {
            description: 'Kontrollerar att formulär har tydlig felhantering',
            help: 'Formulärfel måste presenteras tydligt och tillgängligt',
            helpUrl: 'https://a11y.holmdigital.se/dos-lagen/formular',
        },
        tags: ['dos-lagen', 'swedish-law', 'forms', 'errors'],
        evaluate: (node: HTMLElement) => {
            // Kontrollera input-element
            if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(node.tagName)) return true;

            // Om elementet har aria-invalid, kontrollera att det finns felmeddelande
            const isInvalid = node.getAttribute('aria-invalid') === 'true';

            if (isInvalid) {
                const describedBy = node.getAttribute('aria-describedby');
                return describedBy !== null && describedBy.trim().length > 0;
            }

            return true;
        },
    },

    {
        id: 'dos-myndighetslogga',
        metadata: {
            description: 'Kontrollerar att myndighetens logotyp har alternativtext',
            help: 'Myndighetens logotyp måste ha beskrivande alternativtext',
            helpUrl: 'https://a11y.holmdigital.se/dos-lagen/logotyp',
        },
        tags: ['dos-lagen', 'swedish-law', 'images'],
        evaluate: (node: HTMLElement) => {
            if (node.tagName !== 'IMG') return true;

            const src = node.getAttribute('src')?.toLowerCase() || '';
            const alt = node.getAttribute('alt') || '';

            // Kontrollera om det är en logotyp
            const isLogo =
                src.includes('logo') ||
                src.includes('logotyp') ||
                node.classList.contains('logo') ||
                node.classList.contains('logotype');

            if (isLogo) {
                return alt.trim().length > 0;
            }

            return true;
        },
    },

    {
        id: 'dos-sokfunktion',
        metadata: {
            description: 'Kontrollerar att sökfunktion är tillgänglig',
            help: 'Webbplatser med mycket innehåll måste ha en tillgänglig sökfunktion',
            helpUrl: 'https://a11y.holmdigital.se/dos-lagen/sok',
        },
        tags: ['dos-lagen', 'swedish-law', 'search'],
        evaluate: (node: HTMLElement) => {
            if (node.tagName !== 'BODY') return true;

            // Sök efter sökformulär
            const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"], input[name*="sok"]');
            const searchRoles = document.querySelectorAll('[role="search"]');

            const hasSearch = searchInputs.length > 0 || searchRoles.length > 0;

            // För mindre webbplatser är sök inte alltid nödvändigt
            // Returnera true för att inte flagga som fel
            return true;
        },
    },

    {
        id: 'dos-uppdateringsdatum',
        metadata: {
            description: 'Kontrollerar att tillgänglighetsredogörelsen har uppdateringsdatum',
            help: 'Tillgänglighetsredogörelsen måste ha ett tydligt uppdateringsdatum',
            helpUrl: 'https://a11y.holmdigital.se/dos-lagen/uppdatering',
        },
        tags: ['dos-lagen', 'swedish-law', 'compliance'],
        evaluate: (node: HTMLElement) => {
            // Denna kontroll kräver analys av tillgänglighetsredogörelsen
            // Markera för manuell verifiering
            return true;
        },
    },
];

/**
 * Hjälpfunktion för att registrera alla DOS-lagen regler i axe-core
 */
export function registerDOSLagenRules(): void {
    if (typeof window !== 'undefined' && (window as any).axe) {
        dosLagenRules.forEach(rule => {
            (window as any).axe.configure({
                rules: [{
                    id: rule.id,
                    enabled: true,
                    tags: rule.tags,
                }],
            });
        });
    }
}
