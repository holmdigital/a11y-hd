
import { describe, it, expect } from 'vitest';
import { generateBadgeUrl, generateBadgeMarkdown } from './badge-generator';

describe('Badge Generator', () => {
    it('should generate correct URL for score 100', () => {
        const url = generateBadgeUrl(100);
        expect(url).toBe('https://img.shields.io/badge/HolmDigital_Engine-100%25-00703C?style=flat-square');
    });

    it('should return null for score < 100', () => {
        const url = generateBadgeUrl(99);
        expect(url).toBeNull();
    });

    it('should generate correct markdown for score 100', () => {
        const markdown = generateBadgeMarkdown(100);
        expect(markdown).toBe('![Accessibility Status: 100% Compliant](https://img.shields.io/badge/HolmDigital_Engine-100%25-00703C?style=flat-square)');
    });

    it('should return null markdown for score < 100', () => {
        const markdown = generateBadgeMarkdown(90);
        expect(markdown).toBeNull();
    });
});
