import React, { useEffect, useState } from 'react';

// --- lucide-react optional peer dependency (PUB-06) ----------------------
type LucideIconLike = React.ComponentType<{
    className?: string;
    size?: number | string;
    strokeWidth?: number;
    'aria-hidden'?: boolean | string;
}>;

const lucideCache: Record<string, LucideIconLike | null> = {};
let importAttempted = false;
let importPromise: Promise<Record<string, LucideIconLike | null>> | null = null;

function loadLucide(): Promise<Record<string, LucideIconLike | null>> {
    if (importAttempted) return Promise.resolve(lucideCache);
    if (importPromise) return importPromise;
    importPromise = import('lucide-react')
        .then((m) => {
            const mod = m as Record<string, unknown>;
            lucideCache.Info = (mod.Info ?? null) as LucideIconLike | null;
            lucideCache.AlertCircle = (mod.AlertCircle ?? null) as LucideIconLike | null;
            importAttempted = true;
            return lucideCache;
        })
        .catch(() => {
            importAttempted = true;
            return lucideCache;
        });
    return importPromise;
}

function useLucideIcon(name: string): LucideIconLike | null {
    const [Icon, setIcon] = useState<LucideIconLike | null>(lucideCache[name] ?? null);
    useEffect(() => {
        if (importAttempted) {
            setIcon(lucideCache[name] ?? null);
            return;
        }
        let mounted = true;
        loadLucide().then(() => {
            if (mounted) setIcon(lucideCache[name] ?? null);
        });
        return () => {
            mounted = false;
        };
    }, [name]);
    return Icon;
}
// -------------------------------------------------------------------------

export interface HelpTextProps {
    /**
     * Unique ID is required so strictly associated inputs can reference it via aria-describedby.
     */
    id: string;
    /**
     * The help text content.
     */
    children: React.ReactNode;
    /**
     * Semantic variant
     * - default: Neutral formatting (gray)
     * - error: Error formatting (red), often used with aria-invalid on input
     * - valid: Success formatting (green)
     */
    variant?: 'default' | 'error' | 'valid';
    /**
     * Whether to show an icon based on variant.
     */
    showIcon?: boolean;
    className?: string;
}

const InfoIconOrGlyph = () => {
    const Icon = useLucideIcon('Info');
    if (Icon) return <Icon size={14} aria-hidden="true" />;
    return (
        <span
            className="hd-helptext-info-fallback-glyph"
            data-testid="helptext-info-fallback-glyph"
            aria-hidden="true"
        >
            ℹ
        </span>
    );
};

const AlertCircleIconOrGlyph = () => {
    const Icon = useLucideIcon('AlertCircle');
    if (Icon) return <Icon size={14} aria-hidden="true" />;
    return (
        <span
            className="hd-helptext-error-fallback-glyph"
            data-testid="helptext-error-fallback-glyph"
            aria-hidden="true"
        >
            ⚠
        </span>
    );
};

/**
 * HelpText
 *
 * Provides additional context, instructions, or error messages for form fields.
 * ALWAYS reference this component's `id` in the `aria-describedby` attribute of the input.
 */
export const HelpText: React.FC<HelpTextProps> = ({
    id,
    children,
    variant = 'default',
    showIcon = false,
    className = ''
}) => {
    const getColor = () => {
        switch (variant) {
            case 'error': return '#EF4444'; // Red-500
            case 'valid': return '#10B981'; // Green-500
            default: return '#6B7280'; // Gray-500
        }
    };

    const style: React.CSSProperties = {
        fontSize: '0.875rem',
        marginTop: '0.25rem',
        color: getColor(),
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
    };

    const Icon = () => {
        if (!showIcon) return null;
        if (variant === 'error') return <AlertCircleIconOrGlyph />;
        if (variant === 'default') return <InfoIconOrGlyph />;
        return null;
    };

    return (
        <div
            id={id}
            className={`hd-help-text ${className}`}
            style={style}
        >
            <Icon />
            <span>{children}</span>
        </div>
    );
};
