(function() {
  'use strict';
  
  const STORAGE_KEY = 'user-device-view';
  
  // Clean up any old manual selector preferences
  localStorage.removeItem(STORAGE_KEY);

  function detectDevice() {
    const width = window.innerWidth;
    if (width <= 768) {
      return 'mobile';
    } else if (width > 768 && width <= 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  const device = detectDevice();
  applyDeviceClass(device);

  function applyDeviceClass(device) {
    const root = document.documentElement;
    root.classList.remove('is-mobile', 'is-desktop', 'is-tablet');
    if (device === 'mobile') {
      root.classList.add('is-mobile');
    } else if (device === 'tablet') {
      root.classList.add('is-tablet');
    } else {
      root.classList.add('is-desktop');
    }
  }

  function triggerInit(device) {
    window.dispatchEvent(new CustomEvent('deviceSelected', { detail: device }));
  }

  // Trigger init event once DOM is ready or immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      triggerInit(device);
    });
  } else {
    triggerInit(device);
  }
})();
