

if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
requestAnimationFrame(() => window.scrollTo(0, 0));

(function () {
  const projectData = window._heroProjectData;
  if (!projectData) return;

  const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);
  const container = document.getElementById('info-canvas');
  
  if (container) {
    container.setAttribute('data-cr-project-src', blobUrl);
    CoreRenderer.init().then(() => {
      URL.revokeObjectURL(blobUrl);
    }).catch(err => {
      console.error('CoreRenderer init failed:', err);
    });
  }
})();

document.querySelectorAll('[data-chr]').forEach(function (el) {
  const text = el.dataset.chr;
  el.removeAttribute('data-chr');
  el.innerHTML = '';
  Array.from(text).forEach(function (ch, i) {
    if (ch === ' ') {
      el.insertAdjacentHTML('beforeend', '<span style="width:0.35em;display:inline-block">&nbsp;</span>');
      return;
    }
    const wrap = document.createElement('span');
    wrap.className = 'ch-wrap';
    wrap.style.setProperty('--i', i);
    const chHTML = window.getCharHTML ? window.getCharHTML(ch) : ch;
    wrap.innerHTML = '<span class="ch-top">' + chHTML + '</span><span class="ch-bot">' + chHTML + '</span>';
    el.appendChild(wrap);
  });
});

const fromIndexTransition = sessionStorage.getItem('info-transition') === '1';
const backBtnEl = document.getElementById('back-btn');
let isLeavingWithFade = false;
let introTl = null;

function isOnBackTrapState() {
  return !!(window.history.state && window.history.state.__infoBackTrap);
}

function ensureBackTrapState() {
  if (!fromIndexTransition) return;
  if (isOnBackTrapState()) return;
  if (!(window.history && window.history.pushState)) return;
  window.history.pushState({ __infoBackTrap: true }, '', window.location.href);
}

ensureBackTrapState();

function returnToIndexWithFade(historySteps) {
  if (isLeavingWithFade) return;
  isLeavingWithFade = true;

  const overlay = document.getElementById('intro-overlay');
  const title = document.getElementById('page-title');
  gsap.killTweensOf([overlay, title]);
  overlay.style.pointerEvents = 'auto';

  const tl = gsap.timeline({
    onComplete: function () {
      sessionStorage.setItem('index-return-fade', 'info');
      if (historySteps > 0 && window.history.length > historySteps) {
        window.history.go(-historySteps);
        return;
      }
      window.location.href = 'index.html';
    }
  });

  tl.to(title, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0);
  tl.to(overlay, { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 0.1);
}

backBtnEl.addEventListener('click', function (e) {
  e.preventDefault();
  const steps = fromIndexTransition ? (isOnBackTrapState() ? 2 : 1) : 0;
  returnToIndexWithFade(steps);
});

window.addEventListener('popstate', function () {
  if (!fromIndexTransition || isLeavingWithFade) return;
  returnToIndexWithFade(1);
});

function playInfoIntro() {
  const overlay = document.getElementById('intro-overlay');
  const title = document.getElementById('page-title');
  const backBtn = document.getElementById('back-btn');
  const main = document.getElementById('info-main');
  const bottom = document.getElementById('info-bottom');

  const fromIndex = fromIndexTransition;
  sessionStorage.removeItem('info-transition');

  const tl = gsap.timeline();
  introTl = tl;

  if (fromIndex) {
    gsap.set(overlay, { opacity: 1 });
    gsap.set(title, { opacity: 1 });
    tl.to(overlay, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.1);
  } else {
    gsap.set(overlay, { opacity: 1 });
    gsap.set(title, { opacity: 0 });
    tl.to(overlay, { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0);
    tl.to(title, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.2);
  }

  const t0 = fromIndex ? 0.5 : 0.35;
  tl.to(main, { opacity: 1, duration: 1.1, ease: 'power2.out' }, t0);
  tl.to(backBtn, { opacity: 1, duration: 0.6, ease: 'power2.out' }, t0 + 0.2);
  tl.to(bottom, { opacity: 1, duration: 0.7, ease: 'power2.out' }, t0 + 0.3);
  tl.add(function () { main.classList.add('ready'); }, t0 + 0.4);
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(playInfoIntro);
} else {
  window.addEventListener('load', playInfoIntro);
}

window.addEventListener('pageshow', function (e) {
  isLeavingWithFade = false;
  ensureBackTrapState();
  if (!e.persisted) return;
  const overlay = document.getElementById('intro-overlay');
  const title = document.getElementById('page-title');
  const backBtn = document.getElementById('back-btn');
  const main = document.getElementById('info-main');
  const bottom = document.getElementById('info-bottom');

  gsap.killTweensOf([overlay, title, backBtn, main, bottom]);
  gsap.set(overlay, { opacity: 0 });
  overlay.style.pointerEvents = 'none';
  gsap.set([title, backBtn, main, bottom], { opacity: 1 });
  main.classList.add('ready');
});

document.addEventListener('visibilitychange', function () {
  if (document.hidden) return;
  if (introTl && introTl.progress() < 1) introTl.progress(1);
});
