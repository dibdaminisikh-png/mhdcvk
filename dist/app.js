(() => {
  'use strict';
  const names = ['Youtube Thumbnails', 'Posters', 'Social media Posts', 'Video Productions', 'Ai Videos', 'Web', 'Printed products'];
  const descriptions = [
    'Bold compositions, expressive imagery and a little visual mischief. Thumbnails designed to make the first impression count.',
    'Big ideas on a single page. Posters that bring imagery, type and composition together with personality.',
    'A little less scrolling, a little more stopping. Social posts built around a clear visual identity.',
    'Real people, real stories, and the occasional long day on set. Documentary production with a filming crew, followed by editing that shapes the story.',
    'Ideas that do not need to wait for a camera. AI-generated teasers, brought together with design, editing and a curious eye.',
    'A corner of the internet with a personality. Creative web concepts and visual experiences.',
    'Ideas you can actually hold. Posters, stationery, packaging and other printed possibilities.'
  ];
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
  let active = 0;
  let scheduled = false;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const step = 360 / cards.length;
  function markActive(index) {
    active = clamp(index, 0, cards.length - 1);
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === active);
      card.querySelector('button').tabIndex = reduced || i === active ? 0 : -1;
      card.querySelector('button').disabled = !reduced && i !== active;
    });
    if (label.textContent !== names[active]) label.textContent = names[active];
    prev.disabled = active === 0;
    next.disabled = active === cards.length - 1;
  }
  function layout() {
    document.body.classList.toggle('js-carousel', !reduced);
    if (!reduced) {
      const width = cards[0].offsetWidth;
      const radius = (width + innerWidth * (innerWidth < 600 ? .16 : .3)) / (2 * Math.tan(Math.PI / cards.length));
      ring.style.setProperty('--radius', `${radius}px`);
      cards.forEach((card, i) => card.style.setProperty('--angle', `${i * step}deg`));
    }
    update();
  }
  function update() {
    scheduled = false;
    if (!reduced) {
      const travel = Math.max(1, carousel.offsetHeight - innerHeight);
      const progress = clamp((scrollY - carousel.offsetTop) / travel, 0, 1);
      const position = progress * (cards.length - 1);
      ring.style.setProperty('--rotation', `${-position * step}deg`);
      markActive(Math.round(position));
      const rect = statement.getBoundingClientRect();
      const reveal = clamp((innerHeight - rect.top) / (innerHeight * .75), 0, 1);
      statement.querySelectorAll('h1>span').forEach((line, i) => {
        const direction = i % 2 ? 1 : -1;
        line.style.transform = `translateX(${direction * (1 - reveal) * innerWidth * .18}px)`;
      });
    }
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
  function goTo(index) {
    index = clamp(index, 0, cards.length - 1);
    if (reduced) {
      viewport.scrollTo({left:cards[index].offsetLeft - (viewport.clientWidth - cards[index].clientWidth) / 2,behavior:'auto'});
      markActive(index);
    } else {
      const travel = carousel.offsetHeight - innerHeight;
      window.scrollTo({top: carousel.offsetTop + index / (cards.length - 1) * travel, behavior:'smooth'});
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
