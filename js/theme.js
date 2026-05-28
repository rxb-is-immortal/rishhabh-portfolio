/**
 * theme.js — Color theme switcher
 * Persists selection via localStorage, applies via data-theme on <html>
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'portfolio-theme';

  /* ── Apply theme to <html> ── */
  function applyTheme(id) {
    const root = document.documentElement;
    if (id === 'red') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', id);
    }
  }

  /* ── Get saved or default theme ── */
  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'red';
  }

  /* ── Main init ── */
  function init() {
    const currentId = getSavedTheme();
    applyTheme(currentId);
  }

  // Run as early as possible (before paint to avoid flash)
  if (document.readyState === 'loading') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved !== 'red') {
      document.documentElement.setAttribute('data-theme', saved);
    }
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
