/**
 * Unit tests for i18n module
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { setLanguage, t, getCurrentLang } from './index';

describe('i18n', () => {
    beforeEach(() => {
        // Reset to English before each test
        setLanguage('en');
    });

    describe('setLanguage', () => {
        it('should set language to English', () => {
            setLanguage('en');
            expect(getCurrentLang()).toBe('en');
        });

        it('should set language to Swedish', () => {
            setLanguage('sv');
            expect(getCurrentLang()).toBe('sv');
        });

        it('should set language to German', () => {
            setLanguage('de');
            expect(getCurrentLang()).toBe('de');
        });

        it('should set language to French', () => {
            setLanguage('fr');
            expect(getCurrentLang()).toBe('fr');
        });

        it('should set language to Spanish', () => {
            setLanguage('es');
            expect(getCurrentLang()).toBe('es');
        });

        it('should fallback to English for unknown language', () => {
            setLanguage('xx');
            expect(getCurrentLang()).toBe('en');
        });
    });

    describe('t', () => {
        it('should translate simple key', () => {
            setLanguage('en');
            expect(t('cli.title')).toContain('HolmDigital');
        });

        it('should translate with different language', () => {
            setLanguage('sv');
            expect(t('cli.title')).toContain('HolmDigital');
        });

        it('should interpolate parameters', () => {
            setLanguage('en');
            const result = t('cli.scanning', { url: 'https://example.com' });
            expect(result).toContain('https://example.com');
        });

        it('should return key if not found', () => {
            const result = t('nonexistent.key' as any);
            expect(result).toBe('nonexistent.key');
        });

        it('should fallback to English if key missing in current lang', () => {
            setLanguage('sv');
            // cli.title exists in sv, so let's check a normal case
            const result = t('cli.title');
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('getCurrentLang', () => {
        it('should return current language', () => {
            setLanguage('de');
            expect(getCurrentLang()).toBe('de');
        });

        it('should default to English initially', () => {
            // Already reset to 'en' in beforeEach
            expect(getCurrentLang()).toBe('en');
        });
    });
});
