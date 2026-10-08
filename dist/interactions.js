(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('#site-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  let menuTimer = 0;

  function closeMenu(after) {
    if (!menu.open) {after?.();return;}
    clearTimeout(menuTimer);
    menu.classList.add('is-closing');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuTimer = setTimeout(() => {
      menu.close();
      menu.classList.remove('is-open','is-opening','is-closing');
      if (!document.querySelector('#work-dialog').open) document.body.classList.remove('dialog-open');
      after?.();
    }, reduced.matches ? 0 : 700);
  }
  menuToggle.addEventListener('click', () => {
    if (menu.open) {closeMenu();return;}
    clearTimeout(menuTimer);
    menu.classList.remove('is-closing','is-open');
    menu.classList.add('is-opening');
    menu.showModal();
    document.body.classList.add('dialog-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    // Force the initial offscreen positions before starting the staggered entrance.
    void menu.offsetWidth;
    menu.classList.add('is-open');
  });
  document.querySelector('.menu-close').addEventListener('click', () => closeMenu());
  document.querySelector('.menu-scrim').addEventListener('click', () => closeMenu());
  menu.addEventListener('cancel', event => {event.preventDefault();closeMenu();});
  menu.addEventListener('close', () => {
    clearTimeout(menuTimer);
    menuToggle.setAttribute('aria-expanded','false');
    menu.classList.remove('is-open','is-opening','is-closing');
  });
  menu.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    closeMenu(() => {
      target?.scrollIntoView({behavior:reduced.matches ? 'instant' : 'smooth'});
      history.replaceState(null,'',link.getAttribute('href'));
    });
  }));

  // Reference stickers perform a single quick rotation or springy scale on hover.
  const stickerAnimations = new WeakMap();
  document.querySelectorAll('.hero-sticker,.skill-sticker,.heart-sticker,.contact-hand').forEach(sticker => {
    sticker.draggable = false;
    function react() {
      if (reduced.matches || document.body.classList.contains('physics-active')) return;
      stickerAnimations.get(sticker)?.cancel();
      const bounce = sticker.matches('.cursor-sticker,.heart-sticker');
      const transforms = bounce
        ? ['scale(1)','scale(1.2)','scale(1.15)','scale(.97)','scale(1)']
        : ['rotate(0deg)','rotate(25deg)','rotate(25deg)','rotate(-4deg)','rotate(0deg)'];
      const animation = sticker.animate(transforms.map((transform,i) => ({transform,offset:[0,.15,.45,.8,1][i]})), {duration:950,easing:'cubic-bezier(.2,.8,.2,1)'});
      stickerAnimations.set(sticker,animation);
    }
    sticker.addEventListener('pointerenter', react);
    sticker.addEventListener('pointerdown', event => {if (event.pointerType !== 'mouse') react();});
  });

  const chaosButton = document.querySelector('#dont-click');
  let matterReady = null;
  function loadMatter() {
    if (typeof Matter !== 'undefined') return Promise.resolve();
    if (matterReady) return matterReady;
    matterReady = new Promise((resolve,reject) => {
      const script = document.createElement('script');
      script.src = 'assets/vendor/matter.min.js?v=load-20261008';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        matterReady = null;script.remove();reject(new Error('Physics could not load'));
      };
      document.head.append(script);
    });
    return matterReady;
  }
  function warmPhysics() {loadMatter().catch(() => {});}
  // Physics is not part of entry. Warm its single shared request once Funky is ready.
  document.querySelector('#funky-root').addEventListener('portfolio:ready', () => {
    if ('requestIdleCallback' in window) requestIdleCallback(warmPhysics,{timeout:1000});
    else setTimeout(warmPhysics,0);
    const footerObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        warmPhysics();footerObserver.disconnect();
      }
    },{rootMargin:'1500px'});
    footerObserver.observe(document.querySelector('#footer'));
  },{once:true});
  chaosButton.addEventListener('pointerenter',warmPhysics);
  chaosButton.addEventListener('pointerdown',warmPhysics,{passive:true});
  chaosButton.addEventListener('focus',warmPhysics);
  let session = null;
  function restore() {
    if (!session) return;
    const {frame, engine, overlay, controls, sources, resize, visibility, keydown} = session;
    cancelAnimationFrame(frame);
    removeEventListener('resize',resize);
    document.removeEventListener('visibilitychange',visibility);
    document.removeEventListener('keydown',keydown);
    Matter.Composite.clear(engine.world,false);
    Matter.Engine.clear(engine);
    overlay.remove();controls.remove();
    sources.forEach(source => source.classList.remove('physics-source-hidden'));
    document.documentElement.classList.remove('physics-active');
    document.body.classList.remove('physics-active');
    session = null;
    chaosButton.focus({preventScroll:true});
  }
  function startPhysics() {
    if (session) return;
    const {Engine,Bodies,Body,Composite,Constraint,Query,Vector} = Matter;
    const engine = Engine.create({enableSleeping:false});
    const overlay = document.createElement('div');
    overlay.className = 'physics-overlay';overlay.setAttribute('aria-hidden','true');
    const controls = document.createElement('div');
    controls.className = 'physics-controls';controls.setAttribute('role','status');
    const hint = document.createElement('span');hint.textContent = 'Grab, drag & throw. You broke it.';
    const reset = document.createElement('button');reset.type = 'button';reset.textContent = 'Put it back';
    controls.append(hint,reset);reset.addEventListener('click',restore);
    const sources = [...document.querySelectorAll('.logo-animation,.hero-sticker,.skill-sticker,.heart-sticker,.contact-hand,.contact-invitation')].filter(el => el.getBoundingClientRect().width > 0);
    const objects = [];
    const boundaries = [];
    let pointer = null, drag = null, lastTime = 0, accumulator = 0;
    let width = innerWidth, height = innerHeight;

    // Clone visuals into a fixed scene so clipping and ancestor transforms cannot trap them.
    sources.forEach((source,i) => {
      const rect = source.getBoundingClientRect();
      const factor = Math.min(1, width * .78 / rect.width, height * .28 / rect.height);
      const w = rect.width * factor, h = rect.height * factor;
      const clone = source.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      clone.classList.remove('physics-source-hidden');clone.classList.add('physics-object');
      clone.style.width = `${w}px`;clone.style.height = `${h}px`;
      clone.style.color = getComputedStyle(source).color;
      if (clone.tagName === 'P') {clone.style.fontSize = `${parseFloat(getComputedStyle(source).fontSize) * factor}px`;clone.style.fontWeight = getComputedStyle(source).fontWeight;}
      if (clone.tagName === 'IMG') {clone.loading = 'eager';clone.draggable = false;}
      // An offscreen logo can have been paused mid-loop; use a fully formed face for the fall.
      clone.querySelectorAll('.logo-glyph').forEach(glyph => {
        glyph.style.opacity = '1';
        const paths = glyph.querySelectorAll('path');
        paths[0].style.display = paths[1].style.display = 'none';
        paths[2].setAttribute('d',glyph.dataset.staticFront);
      });
      overlay.append(clone);
      const onScreen = rect.top < height && rect.bottom > 0;
      const x = onScreen ? Math.max(w/2,Math.min(width-w/2,rect.left+rect.width/2)) : w/2 + (width-w) * ((i*.381966+.12)%1);
      const y = onScreen ? Math.max(h/2,Math.min(height-h/2,rect.top+rect.height/2)) : -h/2 - 80 - i*75;
      const body = Bodies.rectangle(x,y,w,h,{restitution:.3,friction:.5,frictionAir:.008,density:.005,angle:(Math.random()-.5)*.15});
      Body.setVelocity(body,{x:(Math.random()-.5)*3,y:onScreen ? 1 : 6});
      objects.push({body,clone,w,h});source.classList.add('physics-source-hidden');
    });
    Composite.add(engine.world,objects.map(object => object.body));
    function draw() {
      objects.forEach(({body,clone,w,h}) => {clone.style.transform = `translate3d(${body.position.x-w/2}px,${body.position.y-h/2}px,0) rotate(${body.angle}rad)`;});
    }
    function resize() {
      width = innerWidth;height = innerHeight;
      boundaries.forEach(body => Composite.remove(engine.world,body));boundaries.length = 0;
      const options = {isStatic:true,friction:1};
      boundaries.push(Bodies.rectangle(width/2,height+250,width+1000,500,options),Bodies.rectangle(-250,height/2,500,height*6,options),Bodies.rectangle(width+250,height/2,500,height*6,options));
      Composite.add(engine.world,boundaries);
      objects.forEach(({body,w,h}) => {if (body.position.y > height || body.position.x < 0 || body.position.x > width) Body.setPosition(body,{x:Math.max(w/2,Math.min(width-w/2,body.position.x)),y:Math.min(height-h/2,body.position.y)});});
    }
    function release(event) {
      if (pointer && event && event.pointerId !== pointer.id) return;
      if (drag) Composite.remove(engine.world,drag);
      drag = null;pointer = null;overlay.classList.remove('is-dragging');
    }
    overlay.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      const point = {x:event.clientX,y:event.clientY};
      pointer = {...point,id:event.pointerId,pressed:true};overlay.setPointerCapture(event.pointerId);
      const body = Query.point(objects.map(object => object.body),point).at(-1);
      if (!body) return;
      const offset = Vector.sub(point,body.position);
      drag = Constraint.create({pointA:point,bodyB:body,pointB:offset,length:0,stiffness:.2,damping:.1});
      Composite.add(engine.world,drag);overlay.classList.add('is-dragging');
    });
    overlay.addEventListener('pointermove', event => {
      if (pointer?.pressed && event.pointerId !== pointer.id) return;
      pointer = {x:event.clientX,y:event.clientY,id:event.pointerId,pressed:pointer?.pressed || false};
      if (drag) drag.pointA = {x:event.clientX,y:event.clientY};
    });
    overlay.addEventListener('pointerup',release);
    overlay.addEventListener('pointercancel',release);
    overlay.addEventListener('lostpointercapture',release);
    overlay.addEventListener('pointerleave',event => {if (!pointer?.pressed) release(event);});
    overlay.addEventListener('wheel',event => event.preventDefault(),{passive:false});
    function tick(time) {
      if (!session) return;
      accumulator += Math.min(50,lastTime ? time-lastTime : 16.667);lastTime = time;
      while (accumulator >= 16.667) {
        if (pointer && !pointer.pressed) objects.forEach(({body}) => {
          const dx = body.position.x-pointer.x, dy = body.position.y-pointer.y, distance = Math.hypot(dx,dy);
          if (distance > 1 && distance < 120) {
            const force = (1-distance/120)*.004*body.mass;
            Body.applyForce(body,body.position,{x:dx/distance*force,y:dy/distance*force});
          }
        });
        Engine.update(engine,16.667);accumulator -= 16.667;
      }
      draw();session.frame = requestAnimationFrame(tick);
    }
    function visibility() {
      cancelAnimationFrame(session?.frame);
      if (!document.hidden && session) {lastTime = 0;session.frame = requestAnimationFrame(tick);}
    }
    function keydown(event) {if (event.key === 'Escape') {event.preventDefault();restore();}}
    session = {engine,overlay,controls,sources,objects,frame:0,resize,visibility,keydown};
    document.body.append(overlay,controls);
    document.documentElement.classList.add('physics-active');document.body.classList.add('physics-active');
    resize();draw();
    addEventListener('resize',resize);
    document.addEventListener('visibilitychange',visibility);
    document.addEventListener('keydown',keydown);
    reset.focus({preventScroll:true});
    session.frame = requestAnimationFrame(tick);
  }
  chaosButton.addEventListener('click', () => {
    if (typeof Matter !== 'undefined') startPhysics();
    else loadMatter().then(startPhysics).catch(() => {});
  });
})();
