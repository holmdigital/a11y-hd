
import { describe, it, expect } from 'vitest';
import * as Components from './index';

describe('Components Package', () => {
    it('should export all components', () => {
        const exports = Object.keys(Components);
        expect(exports).toContain('Button');
        expect(exports).toContain('Dialog');
        expect(exports).toContain('Modal');
        // Add more checks as needed
        expect(exports.length).toBeGreaterThan(10);
    });

    it('should have Button component', () => {
        expect(Components.Button).toBeDefined();
    });
});
