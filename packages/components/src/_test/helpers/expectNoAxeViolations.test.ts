/**
 * Meta-tests for expectNoAxeViolations.
 * D-04: happy + failure-mode required.
 */
import { describe, it, expect } from 'vitest';
import { expectNoAxeViolations } from '../axe';

describe('expectNoAxeViolations', () => {
    it('passes on accessible markup (happy path)', async () => {
        const div = document.createElement('div');
        div.innerHTML = '<button type="button" aria-label="Close">×</button>';
        document.body.appendChild(div);
        await expect(expectNoAxeViolations(div)).resolves.toBeUndefined();
        document.body.removeChild(div);
    });

    it('throws on inaccessible markup (failure-mode)', async () => {
        const div = document.createElement('div');
        // <input> with no label — axe rule "label" should fire (not in disabled list).
        div.innerHTML = '<input type="text" />';
        document.body.appendChild(div);
        await expect(expectNoAxeViolations(div)).rejects.toThrow();
        document.body.removeChild(div);
    });

    it('throws when container is not an HTMLElement (failure-mode)', async () => {
        // @ts-expect-error — testing the runtime guard
        await expect(expectNoAxeViolations(null)).rejects.toThrow(/HTMLElement/);
    });
});
