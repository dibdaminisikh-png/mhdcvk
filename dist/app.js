(() => {
  const toggle = document.querySelector('#language-toggle');
  const translated = [...document.querySelectorAll('[data-en]')];
  const attributes = [...document.querySelectorAll('[data-en-aria], [data-en-alt]')];
  const originalText = new Map(translated.map(el => [el, el.innerHTML]));
  const originalAttributes = new Map(attributes.map(el => [el, { label: el.getAttribute('aria-label'), alt: el.getAttribute('alt') }]));
  const description = document.querySelector('meta[name="description"]');
  const originalDescription = description.content;
  const setLanguage = language => {
    const english = language === 'en';
    document.documentElement.lang = english ? 'en' : 'fa';
    document.documentElement.dir = english ? 'ltr' : 'rtl';
    translated.forEach(el => { el.innerHTML = english ? el.dataset.en : originalText.get(el); });
    attributes.forEach(el => {
      if (el.dataset.enAria) el.setAttribute('aria-label', english ? el.dataset.enAria : originalAttributes.get(el).label);
      if (el.dataset.enAlt) el.setAttribute('alt', english ? el.dataset.enAlt : originalAttributes.get(el).alt);
    });
    document.title = english ? 'Mehdi Khorsand | Graphic Designer & AI Artist' : 'مهدی خرسند | گرافیست و AI Artist';
    description.content = english ? 'Mehdi Khorsand’s visual résumé: graphic design, YouTube thumbnails, posters, social media, documentary editing and AI video teasers.' : originalDescription;
    toggle.textContent = english ? 'فا' : 'EN';
    toggle.lang = english ? 'fa' : 'en';
    toggle.setAttribute('aria-label', english ? 'تغییر زبان به فارسی' : 'Switch to English');
    try { localStorage.setItem('portfolio-language', english ? 'en' : 'fa'); } catch {}
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => setLanguage(document.documentElement.lang === 'fa' ? 'en' : 'fa'));
  try { if (localStorage.getItem('portfolio-language') === 'en') setLanguage('en'); } catch {}
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    document.body.classList.add('motion-ready');
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  const progress = document.querySelector('.progress');
  let scheduled = false;
  const update = () => {
    const length = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${length > 0 ? Math.min(1, scrollY / length) : 0})`;
    scheduled = false;
  };
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
  const details = [...document.querySelectorAll('.experience details')];
  let openBeforePrint = [];
  addEventListener('beforeprint', () => { openBeforePrint = details.map(el => el.open); details.forEach(el => el.open = true); });
  addEventListener('afterprint', () => details.forEach((el, i) => el.open = openBeforePrint[i] ?? false));
  document.querySelector('#print-resume').addEventListener('click', () => window.print());
})();
