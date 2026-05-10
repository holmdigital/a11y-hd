/**
 * Reusable test primitives for @holmdigital/components.
 * Re-exports expectNoAxeViolations from ./axe so consumers have one import path.
 */
import userEvent from '@testing-library/user-event';
export { expectNoAxeViolations } from './axe';

/**
 * Assert that no two elements inside `root` share an `id` attribute.
 * Catches the duplicate-ID bug that breaks aria-labelledby / htmlFor
 * resolution when a component is rendered twice on a page.
 */
export function expectUniqueIds(root: HTMLElement | Document | null): void {
    if (!root) {
        throw new Error('expectUniqueIds: root must be a non-null HTMLElement or Document');
    }
    const els = root.querySelectorAll('[id]');
    const seen = new Map<string, number>();
    els.forEach((el) => {
        const id = el.getAttribute('id')!;
        seen.set(id, (seen.get(id) ?? 0) + 1);
    });
    const dups = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
    if (dups.length) {
        throw new Error(`expectUniqueIds: duplicate id(s) found: ${dups.join(', ')}`);
    }
}

export interface KeyboardStep {
    /** user-event keyboard syntax e.g. '{Tab}', '{ArrowDown}', 'a' */
    key: string;
    /** Optional: assert document.activeElement equals this element after the step */
    expectFocusOn?: HTMLElement | (() => HTMLElement);
}

/**
 * Drive a sequence of keyboard inputs via user-event and assert focus
 * lands on the expected element after each step (when provided).
 * Use for APG keyboard contract assertions (Tab cycles, arrow roving, etc.).
 */
export async function expectKeyboardSequence(steps: KeyboardStep[]): Promise<void> {
    if (!Array.isArray(steps) || steps.length === 0) {
        throw new Error('expectKeyboardSequence: steps must be a non-empty array');
    }
    const user = userEvent.setup();
    for (const [i, step] of steps.entries()) {
        if (!step.key || typeof step.key !== 'string') {
            throw new Error(`expectKeyboardSequence: step ${i} has empty/invalid key`);
        }
        await user.keyboard(step.key);
        if (step.expectFocusOn) {
            const target =
                typeof step.expectFocusOn === 'function' ? step.expectFocusOn() : step.expectFocusOn;
            if (document.activeElement !== target) {
                throw new Error(
                    `expectKeyboardSequence: step ${i} (${step.key}) — expected focus on ${target.tagName}#${
                        target.id || '(no id)'
                    } but was ${document.activeElement?.tagName ?? 'null'}`,
                );
            }
        }
    }
}
