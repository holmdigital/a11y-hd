/**
 * Axe-core injection script
 * This file bundles axe-core and exposes it to the page
 */
import axe from 'axe-core';

// Expose axe globally for the scan
(window as any).axe = axe;
