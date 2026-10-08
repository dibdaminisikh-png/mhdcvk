(() => {
  'use strict';
  const entry = document.querySelector('.style-entry');
  const status = document.querySelector('.entry-status');
  const buttons = [...document.querySelectorAll('.choose-style')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const caption = document.querySelector('.entry-caption');
  const files = new Map();
  let choosing = false, captionAnimation = null;
  history.scrollRestoration = 'manual';
  // A reload always starts at the choice, even after a portfolio anchor was visited.
  if (location.hash) history.replaceState(null,'',location.pathname+location.search);
  window.scrollTo({top:0,behavior:'instant'});

  function swingCaption() {
    if (reduced.matches || choosing || entry.hidden) return;
    const resting = getComputedStyle(caption).transform;
    captionAnimation?.cancel();
    captionAnimation = caption.animate([
      {transform:resting},
      {transform:'rotate(2.5deg)',offset:.18},
      {transform:'rotate(-6deg)',offset:.42},
      {transform:'rotate(-1deg)',offset:.65},
      {transform:'rotate(-3.7deg)',offset:.83},
      {transform:'rotate(-3deg)'}
    ],{duration:1250,easing:'ease-in-out'});
  }
  const pageReady = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => addEventListener('load',resolve,{once:true}));
  Promise.all([pageReady,document.fonts.ready]).then(swingCaption);
  caption.addEventListener('pointerenter',event => {if (event.pointerType === 'mouse') swingCaption();});
  caption.addEventListener('pointerdown',event => {if (event.pointerType !== 'mouse') swingCaption();});
  reduced.addEventListener('change', () => {if (reduced.matches) captionAnimation?.cancel();});

  function loadFile(path,type) {
    const key = `${type}:${path}`;
    if (files.has(key)) return files.get(key);
    const promise = new Promise((resolve,reject) => {
      const el = document.createElement(type === 'style' ? 'link' : 'script');
      if (type === 'style') {el.rel = 'stylesheet';el.href = `${path}?v=caption-20261008`;}
      else {el.src = `${path}?v=caption-20261008`;el.async = false;}
      el.onload = resolve;
      el.onerror = () => {files.delete(key);el.remove();reject(new Error('Style could not load'));};
      document.head.append(el);
    });
    files.set(key,promise);return promise;
  }
  async function enter(mode) {
    if (choosing) return;
    choosing = true;buttons.forEach(button => button.disabled = true);
    captionAnimation?.cancel();
    entry.setAttribute('aria-busy','true');status.textContent = 'Opening your world…';
    const root = document.querySelector(`#${mode}-root`);
    try {
      if (mode === 'funky') await Promise.all([loadFile('style.css','style'),loadFile('interactions.css','style')]);
      else await loadFile('classic.css','style');
      document.body.dataset.mode = mode;document.body.classList.add('is-entering');root.hidden = false;
      document.querySelector('meta[name="theme-color"]').content = mode === 'funky' ? '#ff5354' : '#0c1023';
      if (mode === 'funky') {
        await loadFile('app.js','script');
        await loadFile('logo-motion.js','script');
        await loadFile('assets/vendor/matter.min.js','script');
        await loadFile('interactions.js','script');
      } else await loadFile('classic.js','script');
      entry.classList.add('is-leaving');status.textContent = '';
      await new Promise(resolve => setTimeout(resolve,reduced.matches ? 0 : 850));
      entry.hidden = true;entry.inert = true;
      document.body.classList.remove('is-entering');
      window.scrollTo({top:0,behavior:'instant'});
      const heading = root.querySelector('h1');
      heading.tabIndex = -1;heading.focus({preventScroll:true});
    } catch (error) {
      root.hidden = true;document.body.dataset.mode = 'choose';document.body.classList.remove('is-entering');
      entry.classList.remove('is-leaving');status.textContent = 'Couldn’t open this style. Please try again.';
      choosing = false;buttons.forEach(button => button.disabled = false);
    } finally {entry.setAttribute('aria-busy','false');}
  }
  buttons.forEach(button => button.addEventListener('click', () => enter(button.dataset.style)));
  document.querySelectorAll('.style-world').forEach(world => {
    let point = null, frame = 0;
    function update() {
      frame = 0;if (!point || reduced.matches || choosing) return;
      const rect = world.getBoundingClientRect();
      world.style.setProperty('--wx',String((point.x-rect.left)/rect.width*2-1));
      world.style.setProperty('--wy',String((point.y-rect.top)/rect.height*2-1));
    }
    world.addEventListener('pointermove',event => {
      if (event.pointerType !== 'mouse') return;
      point = {x:event.clientX,y:event.clientY};if (!frame) frame = requestAnimationFrame(update);
    },{passive:true});
    world.addEventListener('pointerleave', () => {
      point = null;world.style.setProperty('--wx','0');world.style.setProperty('--wy','0');
    });
  });
  addEventListener('pageshow',event => {if (event.persisted) location.reload();});
})();
