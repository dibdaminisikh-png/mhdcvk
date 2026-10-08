/* MAHDI outlines on a 4.94s loop, with one second removed from the solid hold. */
(() => {
  'use strict';
  const host = document.querySelector('.hero-logo');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const ns = 'http://www.w3.org/2000/svg';
  const create = name => document.createElementNS(ns, name);
  const ease = t => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
  let copies = [], visible = true, frame = 0;

  window.PortfolioLogoReady = fetch(new URL('assets/mahdi-outlines.json', document.baseURI))
    .then(response => { if (!response.ok) throw new Error('Logo outlines unavailable'); return response.json(); })
    .then(glyphs => {
      function makeLogo() {
        const svg = create('svg');
        svg.classList.add('logo-animation');
        svg.setAttribute('viewBox', '0 0 2787 900');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('aria-hidden', 'true');
        const letters = glyphs.map(glyph => {
          const group = create('g');
          const back = create('path'), sides = create('path'), front = create('path');
          group.classList.add('logo-glyph');
          back.setAttribute('fill', 'none');
          back.setAttribute('stroke', 'currentColor');
          sides.setAttribute('fill', 'none');
          sides.setAttribute('stroke', 'currentColor');
          front.setAttribute('fill', 'currentColor');
          front.setAttribute('fill-rule', 'nonzero');
          [back, sides].forEach(path => {path.setAttribute('vector-effect','non-scaling-stroke');path.setAttribute('stroke-width','1.2');});
          group.append(back, sides, front);svg.append(group);
          return {glyph, group, back, sides, front};
        });
        letters.forEach((letter, i) => {
          renderLetter(letter, 1, i);
          letter.group.dataset.staticFront = letter.front.getAttribute('d');
        });
        host.append(svg);
        return {svg, letters};
      }
      function renderLetter(letter, progress, index) {
        // The solid hold and hidden phase reuse exactly the same projected glyph.
        if (letter.progress === progress) return;
        letter.progress = progress;
        const {glyph, group, back, sides, front} = letter;
        if (progress <= .001) {group.style.opacity = '0';return;}
        group.style.opacity = '1';
        const scale = .03 + .97 * ease(progress);
        const angle = (1 - ease(progress)) * Math.PI * .57;
        const twist = (1 - ease(progress)) * (index % 2 ? -.22 : .22);
        const center = glyph.width / 2;
        function project(point, depth) {
          let x = point[0] - center, y = point[1] - 450;
          let z = y * Math.sin(angle) + depth * Math.cos(angle);
          y = y * Math.cos(angle) - depth * Math.sin(angle);
          const turnedX = x * Math.cos(twist) + z * Math.sin(twist);
          z = -x * Math.sin(twist) + z * Math.cos(twist);
          const perspective = 2400 / (2400 - z);
          return [glyph.x + center + turnedX * perspective * scale, 450 + y * perspective * scale];
        }
        const path = depth => glyph.contours.map(contour => contour.map((point, i) => {
          const p = project(point, depth);
          return `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`;
        }).join('') + 'Z').join('');
        back.setAttribute('d', path(-80));
        front.setAttribute('d', path(0));
        sides.setAttribute('d', glyph.contours.map(contour => contour.filter((_, i) => i % 3 === 0).map(point => {
          const a = project(point, -80), b = project(point, 0);
          return `M${a[0].toFixed(1)},${a[1].toFixed(1)}L${b[0].toFixed(1)},${b[1].toFixed(1)}`;
        }).join('')).join(''));
        back.style.opacity = sides.style.opacity = String(Math.min(1, (1 - progress) * 8));
      }
      function paint(time) {
        frame = 0;
        const phase = time / 1000 % 4.94;
        const master = copies[0].letters;
        master.forEach((letter, i) => {
          const entering = (phase - .12 - i * .105) / .65;
          const leaving = (phase - 3.85 - (4 - i) * .105) / .65;
          renderLetter(letter, reduced.matches ? 1 : Math.max(0, Math.min(1, entering, 1 - leaving)), i);
        });
        // All three mobile copies share the same contours and phase. Project once.
        copies.slice(1).forEach(({letters}) => letters.forEach((letter,i) => {
          const source = master[i];
          if (letter.progress === source.progress) return;
          letter.progress = source.progress;letter.group.style.opacity = source.group.style.opacity;
          if (source.progress <= .001) return;
          ['front','back','sides'].forEach(name => letter[name].setAttribute('d',source[name].getAttribute('d')));
          letter.back.style.opacity = source.back.style.opacity;letter.sides.style.opacity = source.sides.style.opacity;
        }));
        if (visible && !reduced.matches && !document.hidden) frame = requestAnimationFrame(paint);
      }
      function wake() { if (!frame) frame = requestAnimationFrame(paint); }
      function rebuild() {
        copies.forEach(({svg}) => svg.remove());
        copies = Array.from({length:mobile.matches ? 3 : 1}, makeLogo);
        host.classList.add('logo-ready');
        wake();
      }
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) wake();else {cancelAnimationFrame(frame);frame = 0;}
      }).observe(host);
      document.addEventListener('visibilitychange', () => {if (!document.hidden && visible) wake();});
      mobile.addEventListener('change', rebuild);
      reduced.addEventListener('change', wake);
      rebuild();
    }).catch(() => { /* The accessible text wordmark remains if the asset cannot load. */ });
})();
