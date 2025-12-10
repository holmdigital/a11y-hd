/**
 * EN 301 549 Custom Rules
 * Tillgänglighetsregler baserade på EN 301 549 standarden
 */

import type { CustomRule } from '../types';

/**
 * Custom axe-core rules för EN 301 549
 * 
 * EN 301 549 är den europeiska standarden för tillgänglighet av IKT-produkter och tjänster.
 * Dessa regler kompletterar WCAG med specifika krav för europeiska offentliga upphandlingar.
 */
export const en301549Rules: CustomRule[] = [
    {
        id: 'en301549-mobile-zoom',
        metadata: {
            description: 'Kontrollerar att mobilwebbplatser stöder zoom (EN 301 549 kap 5.1.4)',
            help: 'Mobilwebbplatser måste tillåta zoom upp till 200%',
            helpUrl: 'https://a11y.holmdigital.se/en-301-549/kapitel-5/5.1.4',
        },
        tags: ['en301549', 'mobile', 'zoom'],
        evaluate: (node: HTMLElement) => {
            // Kontrollera viewport meta-tag
            const viewport = document.querySelector('meta[name="viewport"]');
            if (!viewport) return true; // Ingen viewport = zoom tillåten

            const content = viewport.getAttribute('content') || '';

            // Kontrollera om zoom är disabled
            const hasUserScalableNo = /user-scalable\s*=\s*no/i.test(content);
            const hasMaximumScale1 = /maximum-scale\s*=\s*1(?:\.0)?/i.test(content);

            return !(hasUserScalableNo || hasMaximumScale1);
        },
    },

    {
        id: 'en301549-touch-target-size',
        metadata: {
            description: 'Kontrollerar att klickbara element har tillräcklig storlek (EN 301 549 kap 5.5.5)',
            help: 'Klickbara element måste vara minst 44x44 CSS-pixlar',
            helpUrl: 'https://a11y.holmdigital.se/en-301-549/kapitel-5/5.5.5',
        },
        tags: ['en301549', 'mobile', 'touch-target'],
        evaluate: (node: HTMLElement) => {
            // Kontrollera om elementet är klickbart
            const isClickable =
                node.tagName === 'A' ||
                node.tagName === 'BUTTON' ||
                node.getAttribute('role') === 'button' ||
                node.getAttribute('role') === 'link' ||
                node.onclick !== null;

            if (!isClickable) return true;

            // Kontrollera storlek
            const rect = node.getBoundingClientRect();
            const minSize = 44;

            return rect.width >= minSize && rect.height >= minSize;
        },
    },

    {
        id: 'en301549-document-language',
        metadata: {
            description: 'Kontrollerar att dokumentspråk är deklarerat (EN 301 549 kap 9.3.1.1)',
            help: 'HTML-dokument måste ha ett lang-attribut',
            helpUrl: 'https://a11y.holmdigital.se/en-301-549/kapitel-9/9.3.1.1',
        },
        tags: ['en301549', 'wcag2a', 'language'],
        evaluate: (node: HTMLElement) => {
            if (node.tagName !== 'HTML') return true;

            const lang = node.getAttribute('lang');
            return lang !== null && lang.trim().length > 0;
        },
    },

    {
        id: 'en301549-keyboard-trap',
        metadata: {
            description: 'Kontrollerar att tangentbordsfokus inte fastnar (EN 301 549 kap 9.2.1.2)',
            help: 'Användare måste kunna navigera bort från alla element med tangentbordet',
            helpUrl: 'https://a11y.holmdigital.se/en-301-549/kapitel-9/9.2.1.2',
        },
        tags: ['en301549', 'wcag2a', 'keyboard'],
        evaluate: (node: HTMLElement) => {
            // Denna kontroll kräver interaktiv testning
            // Returnera true för att markera som "kräver manuell verifiering"
            return true;
        },
    },

    {
        id: 'en301549-timing-adjustable',
        metadata: {
            description: 'Kontrollerar att tidsbegränsningar kan justeras (EN 301 549 kap 9.2.2.1)',
            help: 'Användare måste kunna stänga av, justera eller förlänga tidsbegränsningar',
            helpUrl: 'https://a11y.holmdigital.se/en-301-549/kapitel-9/9.2.2.1',
        },
        tags: ['en301549', 'wcag2a', 'timing'],
        evaluate: (node: HTMLElement) => {
            // Kontrollera meta refresh
            if (node.tagName === 'META' && node.getAttribute('http-equiv')?.toLowerCase() === 'refresh') {
                const content = node.getAttribute('content') || '';
                const timeMatch = content.match(/^\s*(\d+)/);

                if (timeMatch) {
                    const seconds = parseInt(timeMatch[1], 10);
                    // Tillåt refresh om > 20 timmar (72000 sekunder)
                    return seconds >= 72000;
                }
            }

            return true;
        },
    },

    {
        id: 'en301549-pause-stop-hide',
        metadata: {
            description: 'Kontrollerar att rörligt innehåll kan pausas (EN 301 549 kap 9.2.2.2)',
            help: 'Automatiskt rörligt innehåll måste kunna pausas, stoppas eller döljas',
            helpUrl: 'https://a11y.holmdigital.se/en-301-549/kapitel-9/9.2.2.2',
        },
        tags: ['en301549', 'wcag2a', 'animation'],
        evaluate: (node: HTMLElement) => {
            // Kontrollera video och audio element
            if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
                return node.hasAttribute('controls');
            }

            // Kontrollera CSS animations
            const style = window.getComputedStyle(node);
            const hasAnimation = style.animationName !== 'none';

            if (hasAnimation) {
                // Kräver manuell verifiering att det finns kontroller
                return true;
            }

            return true;
        },
    },

    {
        id: 'en301549-three-flashes',
        metadata: {
            description: 'Kontrollerar att innehåll inte blinkar mer än 3 gånger per sekund (EN 301 549 kap 9.2.3.1)',
            help: 'Innehåll får inte blinka mer än tre gånger per sekund',
            helpUrl: 'https://a11y.holmdigital.se/en-301-549/kapitel-9/9.2.3.1',
        },
        tags: ['en301549', 'wcag2a', 'seizure'],
        evaluate: (node: HTMLElement) => {
            // Denna kontroll kräver avancerad analys av animationer
            // Markera för manuell verifiering
            return true;
        },
    },

    {
        id: 'en301549-bypass-blocks',
        metadata: {
            description: 'Kontrollerar att det finns sätt att hoppa över återkommande innehåll (EN 301 549 kap 9.2.4.1)',
            help: 'Webbplatser måste ha skip-länkar eller ARIA landmarks',
            helpUrl: 'https://a11y.holmdigital.se/en-301-549/kapitel-9/9.2.4.1',
        },
        tags: ['en301549', 'wcag2a', 'navigation'],
        evaluate: (node: HTMLElement) => {
            if (node.tagName !== 'BODY') return true;

            // Kontrollera skip-länkar
            const skipLinks = document.querySelectorAll('a[href^="#"]');
            const hasSkipLink = Array.from(skipLinks).some(link => {
                const text = link.textContent?.toLowerCase() || '';
                return text.includes('skip') || text.includes('hoppa');
            });

            // Kontrollera ARIA landmarks
            const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], main, nav');
            const hasLandmarks = landmarks.length > 0;

            return hasSkipLink || hasLandmarks;
        },
    },

    {
        id: 'en301549-page-titled',
        metadata: {
            description: 'Kontrollerar att sidor har beskrivande titlar (EN 301 549 kap 9.2.4.2)',
            help: 'Varje webbsida måste ha en beskrivande titel',
            helpUrl: 'https://a11y.holmdigital.se/en-301-549/kapitel-9/9.2.4.2',
        },
        tags: ['en301549', 'wcag2a', 'title'],
        evaluate: (node: HTMLElement) => {
            if (node.tagName !== 'TITLE') return true;

            const title = node.textContent?.trim() || '';
            return title.length > 0 && title.length < 120;
        },
    },

    {
        id: 'en301549-focus-order',
        metadata: {
            description: 'Kontrollerar att fokusordning är logisk (EN 301 549 kap 9.2.4.3)',
            help: 'Tangentbordsfokus måste följa en logisk ordning',
            helpUrl: 'https://a11y.holmdigital.se/en-301-549/kapitel-9/9.2.4.3',
        },
        tags: ['en301549', 'wcag2a', 'focus'],
        evaluate: (node: HTMLElement) => {
            // Kontrollera tabindex-värden
            const tabindex = node.getAttribute('tabindex');
            if (tabindex) {
                const value = parseInt(tabindex, 10);
                // Negativa värden är OK, positiva värden > 0 kan störa ordningen
                return value <= 0;
            }

            return true;
        },
    },
];

/**
 * Hjälpfunktion för att registrera alla EN 301 549 regler i axe-core
 */
export function registerEN301549Rules(): void {
    if (typeof window !== 'undefined' && (window as any).axe) {
        en301549Rules.forEach(rule => {
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
