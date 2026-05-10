/**
 * Meta-tests for expectUniqueIds.
 * D-04: happy + failure-mode required.
 */
import { describe, it, expect } from 'vitest';
import { expectUniqueIds } from '../helpers';

describe('expectUniqueIds', () => {
    it('passes when all ids are unique (happy path)', () => {
        const div = document.createElement('div');
        div.innerHTML = '<span id="a"></span><span id="b"></span>';
        expect(() => expectUniqueIds(div)).not.toThrow();
    });

    it('passes on container with no ids', () => {
        const div = document.createElement('div');
        div.innerHTML = '<span></span>';
        expect(() => expectUniqueIds(div)).not.toThrow();
    });

    it('throws listing duplicates (failure-mode)', () => {
        const div = document.createElement('div');
        div.innerHTML = '<span id="dup"></span><span id="dup"></span><span id="ok"></span>';
        expect(() => expectUniqueIds(div)).toThrow(/duplicate id\(s\) found: dup/);
    });

    it('throws on null root (failure-mode)', () => {
        expect(() => expectUniqueIds(null)).toThrow(/non-null/);
    });
});
