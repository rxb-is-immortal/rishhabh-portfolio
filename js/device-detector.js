(function() {
  const STORAGE_KEY = 'user-device-view';
  
  // 1. Apply saved preference immediately if it exists
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    applyDeviceClass(saved);
    triggerInit(saved);
    return;
  }

  // 2. Otherwise, perform auto-detection for initial parse classes
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  var isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || isTouch;
  applyDeviceClass(isMobileUA ? 'mobile' : 'desktop');

  // 3. Inject the device selector modal overlay once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // Double check if preference was written concurrently
    if (localStorage.getItem(STORAGE_KEY)) {
      triggerInit(localStorage.getItem(STORAGE_KEY));
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'device-selector-overlay';

    // Premium UI design styles for the selection modal
    const style = document.createElement('style');
    style.innerHTML = `
      #device-selector-overlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        background: rgba(10, 10, 10, 0.65);
        backdrop-filter: blur(35px);
        -webkit-backdrop-filter: blur(35px);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: #f0f0f0;
        opacity: 0;
        transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
      }
      .ds-container {
        width: min(90vw, 750px);
        background: rgba(15, 15, 15, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 28px;
        padding: 3.5rem 3rem;
        text-align: center;
        box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255,255,255,0.1);
        transform: scale(0.95) translateY(20px);
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ds-title {
        font-family: 'Breton', sans-serif;
        font-size: clamp(1.8rem, 3.5vw, 2.4rem);
        font-weight: 300;
        letter-spacing: 0.02em;
        margin-bottom: 0.7rem;
        text-transform: uppercase;
        color: #fff;
      }
      .ds-subtitle {
        font-size: clamp(0.85rem, 1.6vw, 1rem);
        color: rgba(255, 255, 255, 0.45);
        margin-bottom: 3.2rem;
        line-height: 1.6;
        max-width: 520px;
        margin-left: auto;
        margin-right: auto;
      }
      .ds-options {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }
      .ds-option {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 20px;
        padding: 2.5rem 1.2rem;
        cursor: pointer;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.2rem;
      }
      .ds-icon {
        font-size: 2.8rem;
        line-height: 1;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ds-opt-name {
        font-family: 'Breton', sans-serif;
        font-size: 1.05rem;
        letter-spacing: 0.05em;
        font-weight: 600;
        text-transform: uppercase;
        color: #fff;
      }
      .ds-opt-desc {
        font-size: 0.72rem;
        color: rgba(255, 255, 255, 0.35);
        line-height: 1.4;
      }
      /* Hover kinetics (Desktop-only) */
      .is-desktop .ds-option:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-8px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.15);
      }
      .is-desktop .ds-option:hover .ds-icon {
        transform: scale(1.2);
      }
      .ds-option:active {
        transform: scale(0.96);
      }
      
      @media (max-width: 768px) {
        .ds-container {
          padding: 2.2rem 1.5rem;
        }
        .ds-options {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .ds-option {
          padding: 1.5rem 1.2rem;
          flex-direction: row;
          text-align: left;
          gap: 1.2rem;
        }
        .ds-icon {
          font-size: 2.2rem;
        }
        .ds-text-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
      }
    `;
    document.head.appendChild(style);

    // Inject overlay HTML
    overlay.innerHTML = `
      <div class="ds-container">
        <h2 class="ds-title">Select Viewport</h2>
        <p class="ds-subtitle">To ensure complete layout smoothness and compatibility, please select your viewing device:</p>
        <div class="ds-options">
          <div class="ds-option" data-device="mobile">
            <span class="ds-icon">📱</span>
            <div class="ds-text-wrap">
              <span class="ds-opt-name">Mobile</span>
              <span class="ds-opt-desc">Compact layout, native touch scrolling</span>
            </div>
          </div>
          <div class="ds-option" data-device="tablet">
            <span class="ds-icon">📟</span>
            <div class="ds-text-wrap">
              <span class="ds-opt-name">Tablet</span>
              <span class="ds-opt-desc">Adaptive columns, medium scale spacing</span>
            </div>
          </div>
          <div class="ds-option" data-device="desktop">
            <span class="ds-icon">💻</span>
            <div class="ds-text-wrap">
              <span class="ds-opt-name">Desktop</span>
              <span class="ds-opt-desc">Full 3D parallax, Lenis smooth scroll</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Fade overlay and container in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.querySelector('.ds-container').style.transform = 'scale(1) translateY(0)';
    });

    // Option selection handler
    overlay.querySelectorAll('.ds-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = btn.dataset.device;
        localStorage.setItem(STORAGE_KEY, choice);
        applyDeviceClass(choice);

        // Fade overlay out
        overlay.style.opacity = '0';
        overlay.querySelector('.ds-container').style.transform = 'scale(0.95) translateY(20px)';
        setTimeout(() => {
          overlay.remove();
          triggerInit(choice);
        }, 600);
      });
    });
  });

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
})();
