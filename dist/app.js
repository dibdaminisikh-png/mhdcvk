(() => {
  'use strict';
  const names = window.Portfolio.categories.map(category => category.title);
  const descriptions = window.Portfolio.categories.map(category => category.description);
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = reducedQuery.matches;
  const carousel = document.querySelector('.carousel');
  const viewport = document.querySelector('.carousel-viewport');
  const ring = document.querySelector('.carousel-ring');
  const cards = [...document.querySelectorAll('.category-card')];
  const label = document.querySelector('.carousel-label');
  const prev = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  const statement = document.querySelector('.hero-statement');
  const buttons = cards.map(card => card.querySelector('button'));
  const lines = [...statement.querySelectorAll('h1>span')];
  let active = -1, scheduled = false;
  let height = innerHeight, width = innerWidth, carouselTop = 0, travel = 1, statementTop = 0, radius = 0;
  let lastRotation = null, lastReveal = null, nativeAnimations = [];
  let layoutKey = '';
  let timeline = null;
  try {
    if (typeof ScrollTimeline !== 'undefined' && CSS.supports('animation-range-end','1px') && 'rangeStart' in Animation.prototype)
      timeline = new ScrollTimeline({source:document.documentElement,axis:'block'});
  } catch (_) { /* Older engines use the cached frame-based path. */ }
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const step = 360 / cards.length;
  function documentTop(el) {let top = 0;for (let node = el;node;node = node.offsetParent) top += node.offsetTop;return top;}
  function markActive(index,force = false) {
    index = clamp(index,0,cards.length-1);
    if (!force && index === active) return;
    active = index;
    cards.forEach((card,i) => {
      card.classList.toggle('is-active',i === active);
      const tabIndex = reduced || i === active ? 0 : -1, disabled = !reduced && i !== active;
      if (buttons[i].tabIndex !== tabIndex) buttons[i].tabIndex = tabIndex;
      if (buttons[i].disabled !== disabled) buttons[i].disabled = disabled;
    });
    if (label.textContent !== names[active]) label.textContent = names[active];
    prev.disabled = active === 0;next.disabled = active === cards.length-1;
  }
  function layout() {
    height = innerHeight;width = innerWidth;
    document.body.classList.toggle('js-carousel',!reduced);
    if (!reduced) {
      const cardWidth = cards[0].offsetWidth;
      radius = (cardWidth+width*(width<600 ? .16 : .3))/(2*Math.tan(Math.PI/cards.length));
      ring.style.setProperty('--radius',`${radius}px`);
      cards.forEach((card,i) => card.style.setProperty('--angle',`${i*step}deg`));
    } else ring.style.removeProperty('transform');
    carouselTop = documentTop(carousel);travel = Math.max(1,carousel.offsetHeight-height);statementTop = documentTop(statement);
    const key = `${width}:${height}:${radius}:${carouselTop}:${travel}:${statementTop}:${reduced}`;
    if (key === layoutKey) {update();return;}
    layoutKey = key;
    lastRotation = lastReveal = null;
    if (timeline && !reduced) {
      try {
        const frames = [[
          {transform:`translateZ(${-radius}px) rotateY(0deg)`},
          {transform:`translateZ(${-radius}px) rotateY(${-step*(cards.length-1)}deg)`}
        ],...lines.map((line,i) => [
          {transform:`translateX(${(i%2 ? 1 : -1)*width*.18}px)`},{transform:'translateX(0px)'}
        ])];
        const ranges = [[carouselTop,carouselTop+travel],...lines.map(() => [statementTop-height,statementTop-height*.25])];
        if (nativeAnimations.length) nativeAnimations.forEach((animation,i) => {
          animation.effect.setKeyframes(frames[i]);
          animation.rangeStart = `${ranges[i][0]}px`;animation.rangeEnd = `${ranges[i][1]}px`;
        });
        else [ring,...lines].forEach((target,i) => nativeAnimations.push(target.animate(frames[i],{timeline,rangeStart:`${ranges[i][0]}px`,rangeEnd:`${ranges[i][1]}px`,fill:'both'})));
      } catch (_) {nativeAnimations.forEach(animation => animation.cancel());nativeAnimations = [];}
    } else {nativeAnimations.forEach(animation => animation.cancel());nativeAnimations = [];}
    markActive(Math.max(0,active),true);update();
  }
  function update() {
    scheduled = false;
    if (reduced) return;
    const y = scrollY, position = clamp((y-carouselTop)/travel,0,1)*(cards.length-1);
    markActive(Math.round(position));
    if (nativeAnimations.length) return;
    const rotation = -position*step;
    if (rotation !== lastRotation) {
      lastRotation = rotation;
      // Updating transform directly avoids cascading a changing custom property to every card.
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rotation}deg)`;
    }
    const reveal = clamp((height-(statementTop-y))/(height*.75),0,1);
    if (reveal !== lastReveal) {
      lastReveal = reveal;
      lines.forEach((line,i) => line.style.transform = `translateX(${(i%2 ? 1 : -1)*(1-reveal)*width*.18}px)`);
    }
  }
  function schedule() {if (!scheduled) {scheduled = true;requestAnimationFrame(update);}}
  function goTo(index) {
    index = clamp(index, 0, cards.length - 1);
    if (reduced) {
      viewport.scrollTo({left:cards[index].offsetLeft - (viewport.clientWidth - cards[index].clientWidth) / 2,behavior:'auto'});
      markActive(index);
    } else {
      window.scrollTo({top:carouselTop+index/(cards.length-1)*travel,behavior:'smooth'});
    }
  }
  prev.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', layout);
  viewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(active + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(active - 1); }
  });
  viewport.tabIndex = 0;
  viewport.setAttribute('aria-label', 'Explore creative disciplines. Use left and right arrow keys.');
  viewport.addEventListener('scroll', () => {
    if (!reduced) return;
    const center = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
    const distances = cards.map(card => Math.abs(card.getBoundingClientRect().left + card.clientWidth / 2 - center));
    markActive(distances.indexOf(Math.min(...distances)));
  }, {passive:true});
  let pointerStart = null;
  viewport.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || reduced || event.button !== 0) return;
    pointerStart = {id:event.pointerId,x:event.clientX,y:event.clientY,index:active};
  });
  viewport.addEventListener('pointerup', event => {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      goTo(pointerStart.index + (dx < 0 ? 1 : -1));
    }
    pointerStart = null;
  });
  viewport.addEventListener('pointercancel', () => {pointerStart = null;});
  reducedQuery.addEventListener('change', () => {reduced = reducedQuery.matches;layout();});
  layout();
  document.fonts.ready.then(layout);
  new ResizeObserver(layout).observe(document.querySelector('#funky-root'));
  const menu = document.querySelector('#site-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const workDialog = document.querySelector('#work-dialog');
  function openDialog(dialog) { dialog.showModal();document.body.classList.add('dialog-open'); }
  function closeDialog(dialog) { dialog.close(); }
  [menu, workDialog].forEach(dialog => {
    dialog.addEventListener('close', () => {
      if (!menu.open && !workDialog.open) document.body.classList.remove('dialog-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(dialog); });
  });
  document.querySelector('.work-close').addEventListener('click', () => closeDialog(workDialog));
  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.category);
    document.querySelector('#work-dialog-title').textContent = names[index];
    document.querySelector('#work-dialog-description').textContent = descriptions[index];
    document.querySelector('.dialog-art').className = `dialog-art gallery-cell cell-${index}`;
    openDialog(workDialog);
  }));
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
