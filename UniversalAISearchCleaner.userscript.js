// ==UserScript==
// @name         Universal AI Search Cleaner (ByeByeAI)
// @namespace    https://github.com/gatornotade
// @version      2.0.0
// @description  Forces Google Web Mode (udm=14) and strips AI summaries across all search engines.
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  /* 1. Google Web Mode Enforcer (udm=14) */
  try {
    const host = window.location.hostname;
    const path = window.location.pathname;
    if (host.includes('google.') && (path === '/search' || path.startsWith('/search'))) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('q') && !urlParams.has('udm') && !urlParams.has('tbm')) {
        urlParams.set('udm', '14');
        window.location.replace(`${window.location.origin}${path}?${urlParams.toString()}`);
        return;
      }
    }
  } catch (_) {}

  /* 2. Generic & Engine-Specific AI Selectors */
  const AI_SELECTORS = [
    /* Google */
    'div[data-attrid="wa:/description"]',
    'div[jsname="N760b"]',
    '#super-search-ai',
    'div:has(> [aria-label*="AI Overview" i])',
    'div:has(> [aria-label*="Resumen de IA" i])',
    'div:has(> [aria-label*="Resumen creado por IA" i])',
    '[data-entityname*="AI Overview"]',
    '.g-blk:has([data-async-context*="ai_overview"])',

    /* Bing / Copilot */
    '#b_copilot',
    '.b_side_copilot',
    '.copilot-banner',
    '[data-priority="ai-overview"]',

    /* DuckDuckGo */
    '[data-testid="duckassist"]',

    /* Brave Search */
    '[data-type="summarizer"]',
    '#summarizer-container',
    '.summarizer',

    /* Yahoo & Ecosia */
    '.search-ai-overview',
    '.ecosia-ai-card',

    /* Universal Attribute Matching */
    '[data-testid*="ai-overview" i]',
    '[data-testid*="ai-summary" i]',
    '[aria-label*="AI Overview" i]',
    '[aria-label*="AI Summary" i]',
    '[aria-label*="Resumen de IA" i]',
    '[aria-label*="Resumen generado por IA" i]',
    '[id*="ai-overview" i]',
    '[class*="ai-overview" i]'
  ];

  /* 3. Style Injection */
  const injectStyles = () => {
    const style = document.createElement('style');
    style.id = 'universal-ai-cleaner-css';
    style.textContent = `
      ${AI_SELECTORS.join(',\n')} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        max-height: 0 !important;
        pointer-events: none !important;
        overflow: hidden !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  };

  if (document.head || document.documentElement) {
    injectStyles();
  } else {
    document.addEventListener('DOMContentLoaded', injectStyles);
  }

  /* 4. Mutation Observer */
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!node || node.nodeType !== 1) return;
        for (const sel of AI_SELECTORS) {
          if (node.matches && node.matches(sel)) {
            node.remove();
            return;
          }
        }
      });
    }
  });

  const initObserver = () => {
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
