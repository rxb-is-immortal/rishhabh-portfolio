/**
 * theme.js — Color theme switcher
 * Persists selection via localStorage, applies via data-theme on <html>
 */

(function () {
  'use strict';

  const THEMES = [
    { id: 'red',      label: 'Red',      swatch: 'red'      },
    { id: 'purple',   label: 'Purple',   swatch: 'purple'   },
    { id: 'green',    label: 'Green',    swatch: 'green'    },
    { id: 'cyan',     label: 'Cyan',     swatch: 'cyan'     },
    { id: 'offwhite', label: 'Off-White', swatch: 'offwhite' },
  ];

  const STORAGE_KEY = 'portfolio-theme';

  /* ── Apply theme to <html> ── */
  function applyTheme(id) {
    const root = document.documentElement;
    if (id === 'red') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', id);
    }
    localStorage.setItem(STORAGE_KEY, id);
  }

  /* ── Get saved or default theme ── */
  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'red';
  }

  /* ── Build switcher HTML ── */
  function buildSwitcher(currentId) {
    const wrapper = document.createElement('div');
    wrapper.className = 'theme-switcher';
    wrapper.setAttribute('id', 'theme-switcher');
    wrapper.setAttribute('aria-label', 'Color theme switcher');

    // Panel (rendered first so it sits above trigger in stacking)
    const panel = document.createElement('div');
    panel.className = 'theme-panel';
    panel.setAttribute('id', 'theme-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Choose color theme');

    const panelLabel = document.createElement('div');
    panelLabel.className = 'theme-panel-label';
    panelLabel.textContent = 'Color Theme';

    const options = document.createElement('div');
    options.className = 'theme-options';

    THEMES.forEach(theme => {
      const btn = document.createElement('button');
      btn.className = 'theme-option' + (theme.id === currentId ? ' active' : '');
      btn.setAttribute('data-theme-id', theme.id);
      btn.setAttribute('aria-label', `Set theme to ${theme.label}`);
      btn.setAttribute('type', 'button');

      const swatch = document.createElement('span');
      swatch.className = 'theme-option-swatch';
      swatch.setAttribute('data-swatch', theme.swatch);

      const name = document.createElement('span');
      name.className = 'theme-option-name';
      name.textContent = theme.label;

      const check = document.createElement('span');
      check.className = 'theme-option-check';
      check.innerHTML = `<svg viewBox="0 0 16 16"><polyline points="2,9 6,13 14,4"/></svg>`;

      btn.appendChild(swatch);
      btn.appendChild(name);
      btn.appendChild(check);
      options.appendChild(btn);
    });

    panel.appendChild(panelLabel);
    panel.appendChild(options);

    // Trigger button
    const trigger = document.createElement('button');
    trigger.className = 'theme-trigger';
    trigger.setAttribute('id', 'theme-trigger');
    trigger.setAttribute('type', 'button');
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Open color theme switcher');

    const dot = document.createElement('span');
    dot.className = 'theme-trigger-dot';

    const lbl = document.createElement('span');
    lbl.className = 'theme-trigger-label';
    lbl.textContent = 'Theme';

    trigger.appendChild(dot);
    trigger.appendChild(lbl);

    wrapper.appendChild(panel);
    wrapper.appendChild(trigger);

    return { wrapper, trigger, panel, options };
  }

  /* ── Update active state in options list ── */
  function updateActive(options, id) {
    options.querySelectorAll('.theme-option').forEach(btn => {
      const isActive = btn.getAttribute('data-theme-id') === id;
      btn.classList.toggle('active', isActive);
    });
  }

  /* ── Main init ── */
  function init() {
    const currentId = getSavedTheme();
    applyTheme(currentId);

    const { wrapper, trigger, panel, options } = buildSwitcher(currentId);
    document.body.appendChild(wrapper);

    let isOpen = false;

    function open() {
      isOpen = true;
      panel.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      isOpen = false;
      panel.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function toggle() {
      isOpen ? close() : open();
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (isOpen && !wrapper.contains(e.target)) {
        close();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
    });

    // Theme option clicks
    options.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-theme-id]');
      if (!btn) return;
      const id = btn.getAttribute('data-theme-id');

      // Animate hero tint — fade out, swap theme, fade back in
      const tint = document.getElementById('hero-tint');
      if (tint) {
        tint.style.transition = 'opacity 0.22s ease';
        tint.style.opacity = '0';
        setTimeout(() => {
          applyTheme(id);
          updateActive(options, id);
          tint.style.opacity = '1';
        }, 220);
      } else {
        applyTheme(id);
        updateActive(options, id);
      }

      // Animate the trigger dot
      const dot = trigger.querySelector('.theme-trigger-dot');
      if (dot) {
        dot.style.transition = 'background 0.4s ease, box-shadow 0.4s ease, transform 0.2s ease';
        dot.style.transform = 'scale(0.7)';
        setTimeout(() => { dot.style.transform = 'scale(1)'; }, 200);
      }
      setTimeout(close, 200);
    });
  }

  // Run as early as possible (before paint to avoid flash)
  if (document.readyState === 'loading') {
    // Apply theme immediately (before DOM loads)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved !== 'red') {
      document.documentElement.setAttribute('data-theme', saved);
    }
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
