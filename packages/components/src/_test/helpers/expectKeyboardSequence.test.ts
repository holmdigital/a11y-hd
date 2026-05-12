/**
 * Meta-tests for expectKeyboardSequence.
 * D-04: happy + failure-mode required.
 */
import { describe, it, expect } from 'vitest';
import { expectKeyboardSequence } from '../helpers';

describe('expectKeyboardSequence', () => {
    it('drives keyboard and verifies focus (happy path)', async () => {
        const a = document.createElement('button');
        a.id = 'a';
        a.textContent = 'A';
        const b = document.createElement('button');
        b.id = 'b';
        b.textContent = 'B';
        document.body.append(a, b);
        a.focus();
        await expectKeyboardSequence([{ key: '{Tab}', expectFocusOn: b }]);
        document.body.removeChild(a);
        document.body.removeChild(b);
    });

    it('throws on empty steps array (failure-mode)', async () => {
        await expect(expectKeyboardSequence([])).rejects.toThrow(/non-empty array/);
    });

    it('throws on step with empty key (failure-mode)', async () => {
        await expect(expectKeyboardSequence([{ key: '' }])).rejects.toThrow(/empty\/invalid key/);
    });

    it('throws when focus does not land on expected element (failure-mode)', async () => {
        const a = document.createElement('button');
        a.id = 'lonely';
        document.body.appendChild(a);
        a.focus();
        const phantom = document.createElement('button');
        await expect(
            expectKeyboardSequence([{ key: '{Tab}', expectFocusOn: phantom }]),
        ).rejects.toThrow(/expected focus on/);
        document.body.removeChild(a);
    });
});
