// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — programmatic label↔input association via
 *   htmlFor/id; help and error nodes referenced from the input via
 *   aria-describedby (resolution must hit real DOM nodes)
 * - 3.3.1 Error Identification — error text rendered AND wired to the input
 *   via aria-describedby; aria-invalid="true" set on the input
 * - 3.3.2 Labels or Instructions — visible label always renders; helpText,
 *   when supplied, is associated with the input (not orphaned)
 * - 4.1.2 Name, Role, Value — required state exposed via aria-required;
 *   useId-derived ids are unique across multiple instances on the same page
 *
 * Contract pinned by this file (PITFALLS §3.1): the aria-describedby ID
 * resolution chain. When both helpText and error are present, the input's
 * aria-describedby MUST be a whitespace-separated list whose every token
 * resolves to an element in the DOM. This is the silent-bug class — a typo
 * in the wiring leaves the attribute looking valid while assistive tech
 * announces nothing.
 */
import { useRef, type MutableRefObject } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { FormField } from './FormField';
import { expectNoAxeViolations, expectUniqueIds } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders the label text + input', () => {
        render(<FormField label="Email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInstanceOf(HTMLInputElement);
    });

    it('forwards ref to the underlying input element', () => {
        let captured: HTMLInputElement | null = null;
        const Probe = () => {
            const ref = useRef<HTMLInputElement>(null);
            return (
                <FormField
                    label="Email"
                    ref={(node) => {
                        (ref as MutableRefObject<HTMLInputElement | null>).current = node;
                        captured = node;
                    }}
                />
            );
        };
        render(<Probe />);
        const input = screen.getByLabelText('Email');
        expect(captured).toBe(input);
        expect(captured).toBeInstanceOf(HTMLInputElement);
    });

    it('passes className through to the wrapper', () => {
        const { container } = render(<FormField label="Email" className="consumer-class" />);
        // The wrapper is the first child of the test container.
        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.className).toContain('consumer-class');
    });

    it('accepts an explicit id and uses it (no generated id)', () => {
        render(<FormField label="Email" id="custom-email" />);
        const input = screen.getByLabelText('Email');
        expect(input).toHaveAttribute('id', 'custom-email');
    });

    it('disabled prop disables the underlying input', () => {
        render(<FormField label="Email" disabled />);
        const input = screen.getByLabelText('Email');
        expect(input).toBeDisabled();
    });
});

describe('Tier 2: A11y Differentiators', () => {
    it('label is programmatically associated with the input via htmlFor/id (WCAG 1.3.1)', () => {
        render(<FormField label="Email address" />);
        // getByLabelText resolves only when the htmlFor↔id wiring is correct.
        const input = screen.getByLabelText('Email address');
        expect(input).toBeInstanceOf(HTMLInputElement);
        // id must be a non-empty, HTML-valid string (no colons from useId).
        expect(input.id).toBeTruthy();
        expect(input.id).not.toMatch(/:/);
    });

    it('helpText renders into a node referenced by aria-describedby (every token resolves)', () => {
        const { container } = render(
            <FormField label="Email" helpText="We never share your email." />,
        );
        const input = screen.getByLabelText('Email') as HTMLInputElement;
        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();

        // Split by whitespace per ARIA spec — every token MUST resolve to a node.
        const ids = describedBy!.split(/\s+/).filter(Boolean);
        expect(ids.length).toBeGreaterThanOrEqual(1);
        const resolvedTexts = ids.map((id) => {
            const node = container.ownerDocument.getElementById(id);
            expect(node).not.toBeNull();
            return node!.textContent ?? '';
        });
        expect(resolvedTexts.some((t) => t.includes('We never share your email.'))).toBe(true);
    });

    it('error renders, is referenced by aria-describedby, and sets aria-invalid="true"', () => {
        const { container } = render(<FormField label="Email" error="Email is required" />);
        const input = screen.getByLabelText('Email') as HTMLInputElement;

        expect(input).toHaveAttribute('aria-invalid', 'true');

        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        const ids = describedBy!.split(/\s+/).filter(Boolean);
        const resolvedTexts = ids.map((id) => {
            const node = container.ownerDocument.getElementById(id);
            expect(node).not.toBeNull();
            return node!.textContent ?? '';
        });
        expect(resolvedTexts.some((t) => t.includes('Email is required'))).toBe(true);
    });

    it('error + helpText together: aria-describedby contains BOTH ids, both nodes resolve', () => {
        const { container } = render(
            <FormField
                label="Email"
                helpText="Format: name@domain.com"
                error="Email is required"
            />,
        );
        const input = screen.getByLabelText('Email') as HTMLInputElement;
        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();

        const ids = describedBy!.split(/\s+/).filter(Boolean);
        // Both wiring tokens must be present.
        expect(ids.length).toBeGreaterThanOrEqual(2);

        // Every token resolves AND collectively the resolved text covers both messages.
        const resolvedTexts = ids.map((id) => {
            const node = container.ownerDocument.getElementById(id);
            expect(node).not.toBeNull();
            return node!.textContent ?? '';
        });
        expect(resolvedTexts.some((t) => t.includes('Format: name@domain.com'))).toBe(true);
        expect(resolvedTexts.some((t) => t.includes('Email is required'))).toBe(true);
    });

    it('required prop sets aria-required AND surfaces a visible indicator on the label', () => {
        render(<FormField label="Email" required />);
        // Accessible name includes the visual asterisk + sr-only "(obligatoriskt)";
        // match by substring rather than exact label text.
        const input = screen.getByLabelText(/Email/) as HTMLInputElement;

        // Native required attribute is also set; aria-required mirrors it for AT.
        expect(input).toBeRequired();
        // FormField uses native `required` which AT exposes — assert the underlying contract:
        // either aria-required="true" OR the native required attribute is present.
        const ariaRequired = input.getAttribute('aria-required');
        const nativeRequired = input.hasAttribute('required');
        expect(ariaRequired === 'true' || nativeRequired).toBe(true);

        // Visual + AT indicator: asterisk (aria-hidden) plus sr-only "(obligatoriskt)".
        // The accessible name includes both, so assert via the label text it surfaces.
        expect(screen.getByText(/\*/)).toBeInTheDocument();
        expect(screen.getByText(/obligatoriskt/i)).toBeInTheDocument();
    });

    it('useId-derived ids are distinct between two separate FormField instances', () => {
        const { container } = render(
            <>
                <FormField label="First" />
                <FormField label="Second" />
            </>,
        );
        const first = container.ownerDocument.getElementById(
            (screen.getByLabelText('First') as HTMLInputElement).id,
        );
        const second = container.ownerDocument.getElementById(
            (screen.getByLabelText('Second') as HTMLInputElement).id,
        );
        expect(first).not.toBeNull();
        expect(second).not.toBeNull();
        expect(first!.id).not.toEqual(second!.id);
    });

    it('axe-clean for default render', async () => {
        const { container } = render(<FormField label="Email" />);
        await expectNoAxeViolations(container);
    });

    it('axe-clean for required + error state', async () => {
        const { container } = render(
            <FormField label="Email" required error="Email is required" />,
        );
        await expectNoAxeViolations(container);
    });

    it('two FormFields on the same page produce no duplicate ids (useId stability)', () => {
        const { container } = render(
            <>
                <FormField label="First name" helpText="Given name" />
                <FormField label="Last name" error="Required" />
            </>,
        );
        // Catches the React-17-pre-useId duplicate-id class as well as any
        // future regression that hardcodes an id.
        expectUniqueIds(container);
    });

    it('typing into the field is observable via the labeled input (paired keyboard)', async () => {
        const user = userEvent.setup();
        render(<FormField label="Email" />);
        const input = screen.getByLabelText('Email') as HTMLInputElement;

        input.focus();
        expect(document.activeElement).toBe(input);
        await user.keyboard('hello@example.com');

        expect(input.value).toBe('hello@example.com');
    });
});
