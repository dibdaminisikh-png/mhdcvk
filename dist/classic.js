(() => {
  'use strict';
  const root = document.querySelector('#classic-root');
  const data = window.Portfolio;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const grid = root.querySelector('.c-work-grid');
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 7h10v10M7 17 17 7"/></svg>';
  const subtitles = ['The first impression','An idea, distilled','A moment of attention','Stories in motion','A different kind of possible','An experience online','Design you can hold'];
  data.categories.forEach((category,index) => {
    const card = document.createElement('article');
    card.className = 'c-work-card';card.dataset.reveal = index % 3 === 1 ? 'shutter' : 'plane';
    card.innerHTML = `<div class="c-card-inner"><div class="c-card-art c-cell-${index}" role="img" aria-label="Temporary illustration for ${category.title}"></div><div class="c-card-glint"></div><div class="c-card-copy"><div><h3>${category.title}</h3><p>${subtitles[index]}</p></div><button class="c-card-open" type="button" aria-label="Explore ${category.title}" data-classic-category="${index}">${arrow}</button></div></div>`;
    grid.append(card);
  });
  root.querySelectorAll('[data-portfolio-link]').forEach(link => link.href = data[link.dataset.portfolioLink]);
  root.querySelector('.c-year').textContent = new Date().getFullYear();

  const dialog = document.querySelector('#classic-dialog');
  root.querySelectorAll('[data-classic-category]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.classicCategory), category = data.categories[index];
    dialog.querySelector('h2').textContent = category.title;
    dialog.querySelector('.c-dialog-description').textContent = category.description;
    dialog.querySelector('.c-dialog-art').className = `c-dialog-art c-cell-${index}`;
    dialog.showModal();document.body.classList.add('c-dialog-open');
  }));
  dialog.querySelector('.c-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {if (event.target === dialog) dialog.close();});
  dialog.addEventListener('close', () => document.body.classList.remove('c-dialog-open'));

  // Content exists immediately; the observer only reveals it as it enters the viewport.
  root.classList.add('c-motion');
  const reveals = [...root.querySelectorAll('[data-reveal]')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');observer.unobserve(entry.target);
    });
  }, {threshold:.12,rootMargin:'0px 0px -25px 0px'});
  reveals.forEach(el => observer.observe(el));
  function adaptMotion() {
    if (reduced.matches) reveals.forEach(el => el.classList.add('is-visible'));
    root.classList.toggle('c-motion',!reduced.matches);
  }
  reduced.addEventListener('change',adaptMotion);adaptMotion();

  let pointer = null, pointerFrame = 0;
  const composition = root.querySelector('.c-composition');
  function updatePointer() {
    pointerFrame = 0;if (!pointer || reduced.matches) return;
    root.style.setProperty('--c-x',`${pointer.x}px`);root.style.setProperty('--c-y',`${pointer.y}px`);
    const rect = composition.getBoundingClientRect();
    composition.style.setProperty('--rx',String(Math.max(-1,Math.min(1,(pointer.x-(rect.left+rect.width/2))/innerWidth*2))));
    composition.style.setProperty('--ry',String(Math.max(-1,Math.min(1,(pointer.y-(rect.top+rect.height/2))/innerHeight*2))));
  }
  root.addEventListener('pointermove',event => {
    if (event.pointerType !== 'mouse' || reduced.matches) return;
    pointer = {x:event.clientX,y:event.clientY};
    if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
  },{passive:true});
  root.querySelectorAll('.c-card-inner').forEach(card => {
    card.addEventListener('pointermove',event => {
      if (event.pointerType !== 'mouse' || reduced.matches) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--gx',`${event.clientX-rect.left}px`);card.style.setProperty('--gy',`${event.clientY-rect.top}px`);
      card.style.setProperty('--tx',String((event.clientX-rect.left)/rect.width*2-1));
      card.style.setProperty('--ty',String((event.clientY-rect.top)/rect.height*2-1));
    },{passive:true});
    card.addEventListener('pointerleave', () => {card.style.setProperty('--tx','0');card.style.setProperty('--ty','0');});
  });
  const progress = root.querySelector('.c-progress');
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    progress.style.transform = `scaleX(${Math.max(0,Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)))})`;
  }
  addEventListener('scroll', () => {if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);},{passive:true});
  addEventListener('resize',updateScroll);updateScroll();
})();
