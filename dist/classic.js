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

  const clamp = value => Math.max(0,Math.min(1,value));
  const smooth = value => value*value*(3-2*value);
  // Layout coordinates ignore reveal transforms, so scrubbing never feeds back into measurement.
  function documentTop(el) {
    let top = 0;
    for (let node = el;node;node = node.offsetParent) top += node.offsetTop;
    return top;
  }
  function pausedAnimation(el,from,to) {
    const animation = el.animate([from,to],{duration:1000,fill:'both',easing:'cubic-bezier(.16,1,.3,1)'});
    animation.pause();animation.currentTime = 0;
    return animation;
  }
  const reveals = [...root.querySelectorAll('[data-reveal]')].map(el => {
    const animations = [];
    const style = el.dataset.reveal;
    if (style === 'plane') animations.push(pausedAnimation(el,{opacity:0,transform:'perspective(1200px) rotateX(12deg) translateY(55px)'},{opacity:1,transform:'none'}));
    if (style === 'shutter') {
      animations.push(pausedAnimation(el,{transform:'translateY(20px)'},{transform:'none'}));
      animations.push(pausedAnimation(el.querySelector('.c-card-inner'),{clipPath:'inset(0 0 100% 0 round 18px)'},{clipPath:'inset(0 0 0 0 round 18px)'}));
    }
    if (style === 'focus') animations.push(pausedAnimation(el,{opacity:0,filter:'blur(12px)',transform:'scale(.96)'},{opacity:1,filter:'blur(0px)',transform:'none'}));
    if (style === 'ink') {
      animations.push(pausedAnimation(el,{opacity:0,transform:'translateX(-20px)'},{opacity:1,transform:'none'}));
      [...el.children].forEach(child => animations.push(pausedAnimation(child,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'})));
    }
    if (style === 'light') animations.push(pausedAnimation(el,{opacity:0,filter:'blur(6px)',transform:'translateY(20px)'},{opacity:1,filter:'blur(0px)',transform:'none'}));
    return {el,animations,top:0,value:-1};
  });
  const tools = [...root.querySelectorAll('.c-tool')].map(el => ({el,icon:el.querySelector('.c-tool-icon'),top:0,value:-1}));
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let pointer = null, pointerFrame = 0, lastPointerType = finePointer.matches ? 'mouse' : 'touch';
  const composition = root.querySelector('.c-composition');
  function updatePointer() {
    pointerFrame = 0;
    updateToolLights();
    if (!pointer || reduced.matches) return;
    root.style.setProperty('--c-x',`${pointer.x}px`);root.style.setProperty('--c-y',`${pointer.y}px`);
    const rect = composition.getBoundingClientRect();
    composition.style.setProperty('--rx',String(Math.max(-1,Math.min(1,(pointer.x-(rect.left+rect.width/2))/innerWidth*2))));
    composition.style.setProperty('--ry',String(Math.max(-1,Math.min(1,(pointer.y-(rect.top+rect.height/2))/innerHeight*2))));
  }
  root.addEventListener('pointermove',event => {
    if (event.pointerType !== 'mouse') return;
    lastPointerType = 'mouse';
    pointer = {x:event.clientX,y:event.clientY};
    if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
  },{passive:true});
  root.addEventListener('pointerleave',event => {
    if (event.pointerType !== 'mouse') return;
    pointer = null;updateToolLights();
  });
  root.addEventListener('pointerdown',event => {
    lastPointerType = event.pointerType;
    if (event.pointerType !== 'mouse') {pointer = null;updateToolLights();}
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
  function updateToolLights() {
    const scrollLighting = lastPointerType !== 'mouse';
    const rectangles = !scrollLighting && pointer ? tools.map(tool => tool.icon.getBoundingClientRect()) : [];
    tools.forEach((tool,index) => {
      let value = 0;
      if (scrollLighting) value = smooth(clamp((innerHeight*.78-(tool.top-scrollY))/Math.max(1,innerHeight*.22)));
      else if (pointer && !dialog.open) {
        const rect = rectangles[index];
        const dx = Math.max(rect.left-pointer.x,0,pointer.x-rect.right);
        const dy = Math.max(rect.top-pointer.y,0,pointer.y-rect.bottom);
        value = smooth(clamp(1-Math.hypot(dx,dy)/60));
      }
      if (Math.abs(value-tool.value) > .001) {
        tool.value = value;tool.icon.style.setProperty('--tool-light',value.toFixed(4));
      }
    });
  }
  function updateScroll() {
    scrollFrame = 0;
    progress.style.transform = `scaleX(${Math.max(0,Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)))})`;
    reveals.forEach(scene => {
      const value = reduced.matches ? 1 : clamp((innerHeight*.9-(scene.top-scrollY))/Math.max(1,innerHeight*.34));
      if (Math.abs(value-scene.value) < .0001) return;
      scene.value = value;scene.animations.forEach(animation => animation.currentTime = value*1000);
      scene.el.classList.toggle('is-visible',value >= .999);
    });
    updateToolLights();
  }
  function scheduleScroll() {if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);}
  function measure() {
    reveals.forEach(scene => scene.top = documentTop(scene.el));
    tools.forEach(tool => tool.top = documentTop(tool.icon)+tool.icon.offsetHeight/2);
    updateScroll();
  }
  root.addEventListener('focusin',event => {
    const scene = reveals.find(scene => scene.el.contains(event.target));
    if (scene && scene.value < .99) {
      scene.el.scrollIntoView({block:'center',behavior:'instant'});updateScroll();
    }
  });
  addEventListener('scroll',scheduleScroll,{passive:true});
  addEventListener('resize',measure);
  reduced.addEventListener('change',measure);
  finePointer.addEventListener('change', () => {lastPointerType = finePointer.matches ? 'mouse' : 'touch';pointer = null;measure();});
  // Font loading and responsive wrapping can move later sections without a window resize.
  new ResizeObserver(measure).observe(root);
  document.fonts.ready.then(measure);
  dialog.addEventListener('close',scheduleScroll);
  measure();

  const socialButtons = [...root.querySelectorAll('.c-contact-links .c-button')];
  socialButtons.forEach(button => {
    let touchId = null;
    button.addEventListener('pointerenter',event => {if (event.pointerType === 'mouse') button.classList.add('is-pointed');});
    button.addEventListener('pointerleave', () => button.classList.remove('is-pointed','is-pressed'));
    button.addEventListener('pointerdown',event => {
      if (event.pointerType === 'mouse') return;
      touchId = event.pointerId;button.classList.add('is-pressed');
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('pointermove',event => {
      if (touchId !== event.pointerId) return;
      const rect = button.getBoundingClientRect();
      button.classList.toggle('is-pressed',event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom);
    },{passive:true});
    function release(event) {
      if (event && touchId !== event.pointerId) return;
      touchId = null;button.classList.remove('is-pressed');
    }
    ['pointerup','pointercancel','lostpointercapture'].forEach(name => button.addEventListener(name,release));
    addEventListener('blur', () => {release();button.classList.remove('is-pointed');});
  });
})();
