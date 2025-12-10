/**
 * Virtual DOM Implementation för @holmdigital/engine
 * 
 * Syfte: 
 * 1. Skapa en platt representation av DOM-trädet inklusive Shadow DOM
 * 2. Hantera skillnader mellan 'composed' träd (som användaren ser) och fysisk DOM
 * 3. Möjliggöra analys av inkapslade stilar och attribut i Web Components
 */

import type { Page } from 'puppeteer';

/**
 * En virtuell nod som representerar ett element i det sammansatta trädet
 */
export interface VirtualNode {
    nodeId: string;
    tagName: string;
    attributes: Record<string, string>;
    children: VirtualNode[];
    parentId?: string;
    isShadowRoot?: boolean;
    shadowMode?: 'open' | 'closed';
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    computedStyle?: Record<string, string>;
    textContent?: string;
}

/**
 * Konfiguration för Virtual DOM-byggare
 */
export interface VirtualDOMConfig {
    includeComputedStyle?: string[];
    maxDepth?: number;
}

export class VirtualDOMBuilder {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Bygg ett virtuellt träd av hela sidan
     */
    async build(config: VirtualDOMConfig = {}): Promise<VirtualNode> {
        // Vi injicerar ett skript i webbläsaren för att traversera DOM och Shadow DOM effektivt
        // Detta undviker dyra round-trips mellan Node och Browser för varje nod

        return await this.page.evaluate((config) => {
            let nodeIdCounter = 0;

            function generateId(): string {
                return `vn-${++nodeIdCounter}`;
            }

            function getAttributes(element: Element): Record<string, string> {
                const attrs: Record<string, string> = {};
                for (let i = 0; i < element.attributes.length; i++) {
                    const attr = element.attributes[i];
                    attrs[attr.name] = attr.value;
                }
                return attrs;
            }

            function getRect(element: Element) {
                const r = element.getBoundingClientRect();
                return {
                    x: r.x,
                    y: r.y,
                    width: r.width,
                    height: r.height
                };
            }

            function traverse(
                node: Node,
                parent?: VirtualNode,
                depth: number = 0
            ): VirtualNode | null {
                if (!node) return null;
                if (config.maxDepth && depth > config.maxDepth) return null;
                if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return null;

                const element = node as Element | DocumentFragment;

                // Hantera DocumentFragment (Shadow Root)
                const isShadowRoot = node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
                const tagName = isShadowRoot ? '#shadow-root' : (element as Element).tagName.toLowerCase();

                // Hämta attribut och computed style (endast för Element)
                const attributes = !isShadowRoot ? getAttributes(element as Element) : {};
                let computedStyle: Record<string, string> | undefined;

                if (!isShadowRoot && config.includeComputedStyle) {
                    const style = window.getComputedStyle(element as Element);
                    computedStyle = {};
                    config.includeComputedStyle.forEach((prop: any) => {
                        computedStyle![prop] = style.getPropertyValue(prop);
                    });
                }

                const vNode: VirtualNode = {
                    nodeId: generateId(),
                    tagName,
                    attributes,
                    children: [],
                    parentId: parent?.nodeId,
                    isShadowRoot,
                    rect: !isShadowRoot ? getRect(element as Element) : { x: 0, y: 0, width: 0, height: 0 },
                    computedStyle,
                    textContent: node.textContent || undefined
                };

                if (isShadowRoot && (node as ShadowRoot).mode) {
                    vNode.shadowMode = (node as ShadowRoot).mode;
                }

                // Traversera barn (Light DOM)
                if (element.childNodes) {
                    Array.from(element.childNodes).forEach(child => {
                        if (child.nodeType === Node.ELEMENT_NODE) {
                            const childVNode = traverse(child, vNode, depth + 1);
                            if (childVNode) vNode.children.push(childVNode);
                        }
                    });
                }

                // Traversera Shadow DOM om det finns
                if (!isShadowRoot && (element as Element).shadowRoot) {
                    const shadowVNode = traverse((element as Element).shadowRoot!, vNode, depth + 1);
                    if (shadowVNode) vNode.children.push(shadowVNode);
                }

                return vNode;
            }

            // Starta traversering från document.body
            if (!document.body) {
                // Fallback för sidor utan body (t.ex. frameset)
                return {
                    nodeId: 'root-fallback',
                    tagName: 'body',
                    attributes: {},
                    children: [],
                    rect: { x: 0, y: 0, width: 0, height: 0 }
                };
            }
            return traverse(document.body);
        }, config as any) as unknown as VirtualNode;
    }
}
