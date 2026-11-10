/**
 * Centralised vitest setup for @holmdigital/components.
 *
 * Two responsibilities:
 *   1. Extend Vitest's expect with jest-dom + axe matchers.
 *   2. Polyfill the 7 jsdom gaps that block our component contract tests.
 *
 * Per .planning/phases/22-test-infra-and-first-7-components/22-CONTEXT.md TI-02
 * + .planning/research/PITFALLS.md §3.4 / §4.2.
 */
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';
// @chialab/vitest-axe 0.19.x exposes matchers as the default export of the main entry.
// The "./matchers" subpath only carries types, no runtime — see node_modules/@chialab/vitest-axe/package.json.
import axeMatchers from '@chialab/vitest-axe';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Typutökning för vitest 5 (Intern #125 punkt B).
//
// Vitest 5 deklarerar `Assertion<R, T>` och `Matchers<R, T>` med två
// typparametrar. jest-doms egen vitest-utökning (7.0.1) och den tidigare
// `interface Assertion<T = any>` här har bara en, och då slutar
// sammanslagningen verka: TS2428 här och TS2339 på toHaveAttribute,
// toBeInTheDocument med flera i varje test.
//
// Vi utökar därför `Matchers`, som `Assertion` ärver från, med exakt samma
// typparametrar som vitest 5. `AsymmetricMatchersContaining` ärver
// `Matchers<any>` och får matcharna därifrån.
//
// `toHaveNoViolations` lägger @chialab/vitest-axe till vid körning utan att
// utöka vitests typer. Den deklareras här så att src/_test/axe.ts typkontrolleras.
declare module 'vitest' {
    // `T` används inte men måste finnas: typparametrarna ska vara identiska med vitests.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extends TestingLibraryMatchers<any, R> {
        toHaveNoViolations(): R;
    }
}

expect.extend({ ...jestDomMatchers, ...axeMatchers });

afterEach(() => cleanup());

// 1. IntersectionObserver — components see "observer present, never fires".
class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
}
Reflect.set(globalThis, 'IntersectionObserver', MockIntersectionObserver);

// 2. ResizeObserver — same contract.
class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
Reflect.set(globalThis, 'ResizeObserver', MockResizeObserver);

// 3. matchMedia — false-by-default so prefers-reduced-motion logic short-circuits to "no preference".
if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = (query: string) =>
        ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        }) as MediaQueryList;
}

// 4. offsetParent — useFocusTrap.ts filters focusables by `el.offsetParent !== null`.
//    jsdom returns null for layout-less elements; return parentElement so the filter passes.
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get(this: HTMLElement) {
        return this.parentElement;
    },
});

// 5. HTMLDialogElement.showModal / close — relocated semantics from Dialog.test.tsx lines 9–19.
//    NOTE: Dialog.test.tsx keeps its inline polyfill until TC-04 (Modal plan) — belt-and-braces.
if (typeof HTMLDialogElement !== 'undefined') {
    if (!HTMLDialogElement.prototype.showModal) {
        HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
            this.setAttribute('open', '');
        };
    }
    if (!HTMLDialogElement.prototype.close) {
        HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
            this.removeAttribute('open');
            this.dispatchEvent(new Event('close'));
        };
    }
}

// 6. Element.animate — return a stub Animation-like object.
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
    Reflect.set(Element.prototype, 'animate', () => ({
        finished: Promise.resolve(),
        cancel: () => {},
        finish: () => {},
        play: () => {},
        pause: () => {},
    }));
}

// 7. scrollIntoView — no-op.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () {};
}
