// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.1.1 Non-text Content — when lucide-react is absent the icon falls back
 *   to a Unicode glyph; the glyph is decorative (aria-hidden) and the text
 *   content of <span>{children}</span> conveys meaning to AT.
 * - 1.3.1 Info and Relationships — `id` prop is required and stable so the
 *   input that owns the HelpText can wire `aria-describedby={id}` to it.
 * - 3.3.1 Error Identification — `variant="error"` renders the alert glyph and
 *   error styling that the input pairs with `aria-invalid="true"`.
 * - 3.3.2 Labels or Instructions — neutral variant supplies supplemental
 *   instructions without affecting the input's accessible name.
 *
 * D-05 EXCEPTION: This is a NEW test file (the single allowed exception in
 * Plan 26-04). HelpText had no prior test coverage and the lucide-fallback
 * regression test requires a host file. Documented in 26-04-SUMMARY.md.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// File-scoped lucide-react stub (PUB-06 Strategy A): forces the glyph-fallback
// path so the test runs deterministically whether or not lucide is installed.
vi.mock('lucide-react', () => ({}));

import { HelpText } from './HelpText';
import { expectNoAxeViolations } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('renders children text content', () => {
        render(<HelpText id="ht-1">We will never share your email.</HelpText>);
        expect(screen.getByText(/we will never share/i)).toBeInTheDocument();
    });

    it('applies the supplied id so inputs can reference it via aria-describedby (WCAG 1.3.1)', () => {
        render(<HelpText id="pinned-help-id">Help</HelpText>);
        // Use getElementById (not querySelector on a class selector — D-02a)
        const el = document.getElementById('pinned-help-id');
        expect(el).not.toBeNull();
        expect(el).toHaveTextContent(/help/i);
    });

    it('axe-clean for default render', async () => {
        const { container } = render(<HelpText id="ht-axe">Default help text</HelpText>);
        await expectNoAxeViolations(container);
    });
});

describe('lucide-react fallback (PUB-06)', () => {
    // WCAG 1.1.1 Non-text Content, 1.3.1 Info and Relationships.
    // Fallback glyphs carry aria-hidden="true" so the wrapping text node
    // (<span>{children}</span>) is the AT-visible content.

    it('default variant with showIcon renders the ℹ glyph fallback when lucide-react is absent', async () => {
        render(<HelpText id="ht-info" showIcon>Heads up</HelpText>);
        await waitFor(() => {
            expect(screen.getByTestId('helptext-info-fallback-glyph')).toBeInTheDocument();
        });
        expect(screen.getByTestId('helptext-info-fallback-glyph')).toHaveTextContent('ℹ');
        expect(screen.getByTestId('helptext-info-fallback-glyph')).toHaveAttribute('aria-hidden', 'true');
    });

    it('error variant with showIcon renders the ⚠ glyph fallback when lucide-react is absent', async () => {
        render(<HelpText id="ht-err" variant="error" showIcon>Required field</HelpText>);
        await waitFor(() => {
            expect(screen.getByTestId('helptext-error-fallback-glyph')).toBeInTheDocument();
        });
        expect(screen.getByTestId('helptext-error-fallback-glyph')).toHaveTextContent('⚠');
        expect(screen.getByTestId('helptext-error-fallback-glyph')).toHaveAttribute('aria-hidden', 'true');
    });
});
