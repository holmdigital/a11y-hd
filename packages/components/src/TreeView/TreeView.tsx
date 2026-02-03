import React, { useState, useRef, useEffect } from 'react';

export interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
}

export interface TreeViewProps {
    data: TreeNode[];
    ariaLabel?: string;
    className?: string;
    onSelect?: (node: TreeNode) => void;
}

/**
 * Accessible TreeView Component
 * 
 * Implements the WAI-ARIA Tree View pattern.
 * - Single tab stop (roving tabindex).
 * - Arrow keys to navigate (Up/Down/Left/Right).
 * - Home/End to jump to start/end.
 * - Enter/Space to select/toggle.
 * - Proper aria-expanded/aria-selected roles.
 */
export const TreeView: React.FC<TreeViewProps> = ({
    data,
    ariaLabel = 'Tree View',
    className = '',
    onSelect
}) => {
    // Flatten visible nodes for easier keyboard navigation calculations
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [focusedId, setFocusedId] = useState<string | null>(data.length > 0 ? data[0].id : null);

    // Store references to buttons for focus management
    const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const toggleExpand = (nodeId: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedIds(newExpanded);
    };

    // Recursive function to flatten visible nodes
    const getVisibleNodes = (nodes: TreeNode[]): TreeNode[] => {
        let visible: TreeNode[] = [];
        for (const node of nodes) {
            visible.push(node);
            if (node.children && expandedIds.has(node.id)) {
                visible = visible.concat(getVisibleNodes(node.children));
            }
        }
        return visible;
    };

    const handleKeyDown = (e: React.KeyboardEvent, node: TreeNode) => {
        const visibleNodes = getVisibleNodes(data);
        const currentIndex = visibleNodes.findIndex(n => n.id === node.id);

        switch (e.key) {
            case 'ArrowDown': {
                e.preventDefault();
                if (currentIndex < visibleNodes.length - 1) {
                    const nextNode = visibleNodes[currentIndex + 1];
                    setFocusedId(nextNode.id);
                }
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                if (currentIndex > 0) {
                    const prevNode = visibleNodes[currentIndex - 1];
                    setFocusedId(prevNode.id);
                }
                break;
            }
            case 'ArrowRight': {
                e.preventDefault();
                if (node.children && !expandedIds.has(node.id)) {
                    toggleExpand(node.id);
                } else if (node.children && expandedIds.has(node.id)) {
                    // Move to first child
                    if (currentIndex < visibleNodes.length - 1) {
                        setFocusedId(visibleNodes[currentIndex + 1].id);
                    }
                }
                break;
            }
            case 'ArrowLeft': {
                e.preventDefault();
                if (node.children && expandedIds.has(node.id)) {
                    toggleExpand(node.id); // Collapse
                } else {
                    // Move to parent
                    // This creates a O(N) lookup which is acceptable for UI tree sizes
                    const parent = findParent(data, node.id);
                    if (parent) {
                        setFocusedId(parent.id);
                    }
                }
                break;
            }
            case 'Home': {
                e.preventDefault();
                if (visibleNodes.length > 0) {
                    setFocusedId(visibleNodes[0].id);
                }
                break;
            }
            case 'End': {
                e.preventDefault();
                if (visibleNodes.length > 0) {
                    setFocusedId(visibleNodes[visibleNodes.length - 1].id);
                }
                break;
            }
            case 'Enter':
            case ' ': {
                e.preventDefault();
                if (onSelect) onSelect(node);
                setSelectedId(node.id);
                if (node.children) {
                    toggleExpand(node.id);
                }
                break;
            }
        }
    };

    // Helper to find parent
    const findParent = (nodes: TreeNode[], childId: string, parent: TreeNode | null = null): TreeNode | null => {
        for (const node of nodes) {
            if (node.id === childId) return parent;
            if (node.children) {
                const found = findParent(node.children, childId, node);
                if (found) return found;
            }
        }
        return null;
    };

    // Focus effect
    useEffect(() => {
        if (focusedId) {
            const el = nodeRefs.current.get(focusedId);
            if (el) el.focus();
        }
    }, [focusedId]);

    const renderTree = (nodes: TreeNode[], level = 1) => {
        return (
            <ul role="group" style={{ paddingLeft: level > 1 ? '1.5rem' : 0, listStyle: 'none', margin: 0 }}>
                {nodes.map(node => {
                    const isExpanded = expandedIds.has(node.id);
                    const hasChildren = node.children && node.children.length > 0;

                    return (
                        <li key={node.id} role="none">
                            <div
                                ref={el => {
                                    if (el) nodeRefs.current.set(node.id, el);
                                    else nodeRefs.current.delete(node.id);
                                }}
                                role="treeitem"
                                aria-expanded={hasChildren ? isExpanded : undefined}
                                aria-selected={selectedId === node.id}
                                aria-level={level}
                                tabIndex={focusedId === node.id ? 0 : -1}
                                onClick={() => {
                                    setFocusedId(node.id);
                                    setSelectedId(node.id);
                                    if (hasChildren) toggleExpand(node.id);
                                    if (onSelect) onSelect(node);
                                }}
                                onKeyDown={(e) => handleKeyDown(e, node)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    outline: 'none',
                                    backgroundColor: selectedId === node.id ? '#e0f2fe' : 'transparent', // Sky-100
                                    color: selectedId === node.id ? '#0369a1' : 'inherit', // Sky-700
                                    border: focusedId === node.id ? '1px solid #0ea5e9' : '1px solid transparent', // Sky-500
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {hasChildren && (
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {isExpanded ? '▼' : '▶'}
                                    </span>
                                )}
                                {!hasChildren && <span style={{ width: '0.75rem' }} />}
                                {node.label}
                            </div>
                            {hasChildren && isExpanded && renderTree(node.children!, level + 1)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const styles: Record<string, React.CSSProperties> = {
        container: {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            border: '1px solid #cbd5e1',
            borderRadius: '0.375rem',
            padding: '1rem',
            backgroundColor: 'white'
        }
    };

    return (
        <div className={className} style={styles.container}>
            <ul role="tree" aria-label={ariaLabel} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {data.map(node => {
                    // We only render top level here, children handled by recursion
                    // But wait, renderTree returns a UL.
                    // IMPORTANT: The root role="tree" usually contains items directly or role="group".
                    // Ideally we reuse renderTree logic but without the storage UL if possible, 
                    // or purely use the recursive render.

                    // Let's adopt a slightly cleaner recursive render that doesn't create extra ULs at root if not needed,
                    // but WAI-ARIA usually expects `role="treeitem"` as direct children of `role="tree"` or `role="group"`.

                    // Let's inline the logic for the root to be safe
                    const isExpanded = expandedIds.has(node.id);
                    const hasChildren = node.children && node.children.length > 0;

                    return (
                        <li key={node.id} role="none">
                            <div
                                ref={el => {
                                    if (el) nodeRefs.current.set(node.id, el);
                                    else nodeRefs.current.delete(node.id);
                                }}
                                role="treeitem"
                                aria-expanded={hasChildren ? isExpanded : undefined}
                                aria-selected={selectedId === node.id}
                                aria-level={1}
                                tabIndex={focusedId === node.id ? 0 : -1}
                                onClick={() => {
                                    setFocusedId(node.id);
                                    setSelectedId(node.id);
                                    if (hasChildren) toggleExpand(node.id);
                                    if (onSelect) onSelect(node);
                                }}
                                onKeyDown={(e) => handleKeyDown(e, node)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    outline: 'none',
                                    backgroundColor: selectedId === node.id ? '#e0f2fe' : 'transparent',
                                    color: selectedId === node.id ? '#0369a1' : 'inherit',
                                    border: focusedId === node.id ? '1px solid #0ea5e9' : '1px solid transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {hasChildren && (
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {isExpanded ? '▼' : '▶'}
                                    </span>
                                )}
                                {!hasChildren && <span style={{ width: '0.75rem' }} />}
                                {node.label}
                            </div>
                            {hasChildren && isExpanded && renderTree(node.children!, 2)}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
