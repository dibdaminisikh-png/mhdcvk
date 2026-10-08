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
  const easing = 'cubic-bezier(.16,1,.3,1)';
  let timeline = null;
  try {
    if (typeof ScrollTimeline !== 'undefined' && CSS.supports('animation-range-end','1px') && 'rangeStart' in Animation.prototype)
      timeline = new ScrollTimeline({source:document.documentElement,axis:'block'});
  } catch (_) { /* The frame-based path works without scroll timelines. */ }
  const reveals = [...root.querySelectorAll('[data-reveal]')].map(el => {
    const effects = [];
    const add = (target,from,to) => effects.push({target,frames:[from,to],animation:null});
    const style = el.dataset.reveal;
    if (style === 'plane') add(el,{opacity:0,transform:'perspective(1200px) rotateX(12deg) translateY(55px)'},{opacity:1,transform:'none'});
    if (style === 'shutter') {
      add(el,{transform:'translateY(20px)'},{transform:'none'});
      add(el.querySelector('.c-card-inner'),{clipPath:'inset(0 0 100% 0 round 18px)'},{clipPath:'inset(0 0 0 0 round 18px)'});
    }
    if (style === 'focus') add(el,{opacity:0,filter:'blur(12px)',transform:'scale(.96)'},{opacity:1,filter:'blur(0px)',transform:'none'});
    if (style === 'ink') {
      add(el,{opacity:0,transform:'translateX(-20px)'},{opacity:1,transform:'none'});
      [...el.children].forEach(child => add(child,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}));
    }
    if (style === 'light') add(el,{opacity:0,filter:'blur(6px)',transform:'translateY(20px)'},{opacity:1,filter:'blur(0px)',transform:'none'});
    return {el,effects,top:0,value:-1,visible:false,key:'',native:false};
  });
  function configureScene(scene) {
    const key = `${scene.top}:${height}:${reduced.matches}`;
    if (scene.key === key) return;
    scene.key = key;scene.value = -1;
    const useNative = !!timeline && !reduced.matches;
    if (scene.native === useNative && scene.effects.every(effect => effect.animation)) {
      if (useNative) scene.effects.forEach(effect => {
        effect.animation.rangeStart = `${scene.top-height*.9}px`;
        effect.animation.rangeEnd = `${scene.top-height*.56}px`;
      });
      return;
    }
    scene.effects.forEach(effect => effect.animation?.cancel());
    scene.native = useNative;
    const nativeOptions = {timeline,rangeStart:`${scene.top-height*.9}px`,rangeEnd:`${scene.top-height*.56}px`,fill:'both',easing};
    try {
      scene.effects.forEach(effect => {
        effect.animation = effect.target.animate(effect.frames,scene.native ? nativeOptions : {duration:1000,fill:'both',easing});
        if (!scene.native) {effect.animation.pause();effect.animation.currentTime = 0;}
      });
    } catch (_) {
      scene.native = false;
      scene.effects.forEach(effect => {
        effect.animation?.cancel();
        effect.animation = effect.target.animate(effect.frames,{duration:1000,fill:'both',easing});
        effect.animation.pause();effect.animation.currentTime = 0;
      });
    }
  }
  const tools = [...root.querySelectorAll('.c-tool')].map(el => ({icon:el.querySelector('.c-tool-icon'),top:0,left:0,width:0,halfHeight:0,value:-1}));
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const composition = root.querySelector('.c-composition');
  const ambient = root.querySelector('.c-ambient');
  const progress = root.querySelector('.c-progress');
  let frame = 0, pointer = null, pointerDirty = false, cardPoint = null, lastCard = null;
  let height = innerHeight, width = innerWidth, maxScroll = 1, compositionTop = 0, compositionHeight = 0, lastProgress = -1;
  let lastPointerType = finePointer.matches ? 'mouse' : 'touch';
  let progressAnimation = null;
  if (timeline) {
    try {progressAnimation = progress.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{timeline,fill:'both'});}
    catch (_) { /* Progress has the same frame-based fallback. */ }
  }
  function readToolLights(y) {
    const scrollLighting = lastPointerType !== 'mouse';
    return tools.map(tool => {
      if (scrollLighting) return smooth(clamp((height*.78-(tool.top-y))/Math.max(1,height*.22)));
      if (!pointer || dialog.open) return 0;
      // An icon farther than its light radius cannot react; avoid querying its box.
      if (Math.abs(tool.top-y-pointer.y) > tool.halfHeight+100 || pointer.x < tool.left-100 || pointer.x > tool.left+tool.width+100) return 0;
      const rect = tool.icon.getBoundingClientRect();
      const dx = Math.max(rect.left-pointer.x,0,pointer.x-rect.right);
      const dy = Math.max(rect.top-pointer.y,0,pointer.y-rect.bottom);
      return smooth(clamp(1-Math.hypot(dx,dy)/60));
    });
  }
  function update() {
    frame = 0;
    const y = scrollY;
    // Finish every geometry read before changing any styles or animation times.
    const lights = readToolLights(y);
    const compositionRect = pointerDirty && pointer && !reduced.matches && compositionTop-y < height && compositionTop+compositionHeight-y > 0 ? composition.getBoundingClientRect() : null;
    const cardRect = pointerDirty && cardPoint && !reduced.matches ? cardPoint.card.getBoundingClientRect() : null;
    if (!progressAnimation) {
      const value = clamp(y/maxScroll);
      if (value !== lastProgress) {lastProgress = value;progress.style.transform = `scaleX(${value})`;}
    }
    reveals.forEach(scene => {
      const value = reduced.matches ? 1 : clamp((height*.9-(scene.top-y))/Math.max(1,height*.34));
      if (Math.abs(value-scene.value) < .0001) return;
      scene.value = value;
      if (!scene.native) scene.effects.forEach(effect => effect.animation.currentTime = value*1000);
      const visible = value >= .999;
      if (visible !== scene.visible) {scene.visible = visible;scene.el.classList.toggle('is-visible',visible);}
    });
    tools.forEach((tool,index) => {
      const value = lights[index];
      if (Math.abs(value-tool.value) > .001) {tool.value = value;tool.icon.style.setProperty('--tool-light',value.toFixed(4));}
    });
    if (pointerDirty && pointer && !reduced.matches) {
      // Limit inherited light variables to the ambient layer, not the whole portfolio.
      ambient.style.setProperty('--c-x',`${pointer.x}px`);ambient.style.setProperty('--c-y',`${pointer.y}px`);
      if (compositionRect) {
        composition.style.setProperty('--rx',String(Math.max(-1,Math.min(1,(pointer.x-(compositionRect.left+compositionRect.width/2))/width*2))));
        composition.style.setProperty('--ry',String(Math.max(-1,Math.min(1,(pointer.y-(compositionRect.top+compositionRect.height/2))/height*2))));
      }
      if (cardRect) {
        cardPoint.card.style.setProperty('--gx',`${pointer.x-cardRect.left}px`);cardPoint.card.style.setProperty('--gy',`${pointer.y-cardRect.top}px`);
        cardPoint.card.style.setProperty('--tx',String((pointer.x-cardRect.left)/cardRect.width*2-1));
        cardPoint.card.style.setProperty('--ty',String((pointer.y-cardRect.top)/cardRect.height*2-1));
      }
    }
    pointerDirty = false;
  }
  function schedule() {if (!frame) frame = requestAnimationFrame(update);}
  function measure() {
    if (frame) {cancelAnimationFrame(frame);frame = 0;}
    height = innerHeight;width = innerWidth;maxScroll = Math.max(1,document.documentElement.scrollHeight-height);
    compositionTop = documentTop(composition);compositionHeight = composition.offsetHeight;
    reveals.forEach(scene => scene.top = documentTop(scene.el));
    tools.forEach(tool => {
      tool.halfHeight = tool.icon.offsetHeight/2;tool.top = documentTop(tool.icon)+tool.halfHeight;tool.width = tool.icon.offsetWidth;
      let left = 0;for (let node = tool.icon;node;node = node.offsetParent) left += node.offsetLeft;
      tool.left = left;
    });
    reveals.forEach(configureScene);
    update();
  }
  function resetCard() {
    if (lastCard) {lastCard.style.setProperty('--tx','0');lastCard.style.setProperty('--ty','0');}
    lastCard = null;cardPoint = null;
  }
  root.addEventListener('pointermove',event => {
    if (event.pointerType !== 'mouse') return;
    lastPointerType = 'mouse';pointer = {x:event.clientX,y:event.clientY};pointerDirty = true;
    const card = event.target.closest('.c-card-inner');
    if (card !== lastCard) {resetCard();lastCard = card;}
    cardPoint = card ? {card} : null;schedule();
  },{passive:true});
  root.addEventListener('pointerleave',event => {
    if (event.pointerType !== 'mouse') return;
    pointer = null;resetCard();schedule();
  });
  root.addEventListener('pointerdown',event => {
    lastPointerType = event.pointerType;
    if (event.pointerType !== 'mouse') {pointer = null;resetCard();schedule();}
  },{passive:true});
  root.addEventListener('focusin',event => {
    const scene = reveals.find(scene => scene.el.contains(event.target));
    if (scene && scene.value < .99) {scene.el.scrollIntoView({block:'center',behavior:'instant'});schedule();}
  });
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure);
  reduced.addEventListener('change',measure);
  finePointer.addEventListener('change', () => {lastPointerType = finePointer.matches ? 'mouse' : 'touch';pointer = null;measure();});
  new ResizeObserver(measure).observe(root);
  document.fonts.ready.then(measure);
  dialog.addEventListener('close',schedule);
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
