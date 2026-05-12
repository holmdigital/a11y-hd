// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — the `level` prop renders the correct
 *   semantic h1..h6 element. This is the entire point of the component:
 *   programmatic heading level must match the visual/intended level so
 *   assistive tech can build a correct document outline.
 * - 2.4.6 Headings and Labels — heading-level navigation (screen-reader
 *   "next heading at level N" jumps) works only when each Heading renders
 *   the matching native tag; pinning the level→tag mapping protects this.
 * - 4.1.2 Name, Role, Value — the `heading` role is conferred by the
 *   native h1..h6 tag; axe-clean smoke confirms no role/name violations.
 *
 * Template note: mirrors the Phase 22 template-setter (Button.test.tsx).
 * Heading.tsx uses `React.createElement` with a narrow union to dodge
 * TS2590 (see CLAUDE.md "Known Issues & Solutions") — this suite pins
 * the level→tag contract so any future JSX-Tag refactor that re-triggers
 * TS2590 (or silently renders the wrong tag) fails loudly here first.
 */
import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Heading } from './Heading';
import { expectNoAxeViolations } from '../_test/helpers';

describe('Tier 1: Table Stakes', () => {
    it('mounts and renders children', () => {
        render(<Heading level={1}>Page Title</Heading>);
        expect(
            screen.getByRole('heading', { name: /page title/i }),
        ).toBeInTheDocument();
    });

    it('forwards ref to the rendered heading element', () => {
        let captured: HTMLHeadingElement | null = null;
        const Probe = () => {
            const ref = useRef<HTMLHeadingElement>(null);
            return (
                <Heading
                    level={2}
                    ref={(node) => {
                        ref.current = node;
                        captured = node;
                    }}
                >
                    Section
                </Heading>
            );
        };
        render(<Probe />);
        const heading = screen.getByRole('heading', { name: /section/i });
        expect(captured).toBe(heading);
        expect(captured).toBeInstanceOf(HTMLHeadingElement);
        expect((captured as unknown as HTMLHeadingElement).tagName).toBe('H2');
    });

    it('appends consumer className additively', () => {
        render(
            <Heading level={2} className="extra">
                Styled
            </Heading>,
        );
        const heading = screen.getByRole('heading', { name: /styled/i });
        expect(heading).toHaveClass('extra');
    });

    it('passes arbitrary HTML attributes (id, data-*, aria-*) through to the heading', () => {
        render(
            <Heading level={3} id="sec" data-foo="bar" aria-label="Custom Label">
                x
            </Heading>,
        );
        const heading = screen.getByRole('heading', { name: /custom label/i });
        expect(heading).toHaveAttribute('id', 'sec');
        expect(heading).toHaveAttribute('data-foo', 'bar');
    });
});

describe('Tier 2: A11y Differentiators (Semantic Heading Level)', () => {
    it.each([1, 2, 3, 4, 5, 6] as const)(
        'level=%i renders an h%i element (semantic level matches rendered tag)',
        (level) => {
            render(<Heading level={level}>Heading {level}</Heading>);
            const heading = screen.getByRole('heading', { level });
            expect(heading.tagName).toBe(`H${level}`);
        },
    );

    it('screen-reader heading navigation: each level is queryable by getByRole heading+level', () => {
        render(
            <>
                <Heading level={1}>One</Heading>
                <Heading level={2}>Two</Heading>
                <Heading level={3}>Three</Heading>
            </>,
        );
        expect(screen.getByRole('heading', { level: 1, name: /one/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: /two/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3, name: /three/i })).toBeInTheDocument();
    });

    it('axe-clean for h1 + body content (WCAG 1.3.1 / 4.1.2 smoke)', async () => {
        const { container } = render(
            <>
                <Heading level={1}>Page</Heading>
                <p>body copy</p>
            </>,
        );
        await expectNoAxeViolations(container);
    });

    it('axe-clean for h3 (representative non-h1 level)', async () => {
        const { container } = render(
            <>
                <Heading level={1}>Page</Heading>
                <Heading level={2}>Section</Heading>
                <Heading level={3}>Subsection</Heading>
                <p>body copy</p>
            </>,
        );
        await expectNoAxeViolations(container);
    });
});
