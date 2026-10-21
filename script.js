(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.navigation');
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', e => { if (!e.target.closest('.header-inner')) setOpen(false); });
  }
  // Keep every collection visible when JavaScript is unavailable.
  const filters = [...document.querySelectorAll('[data-filter]')];
  const groups = [...document.querySelectorAll('[data-category]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    filters.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    groups.forEach(group => { group.hidden = selected !== 'all' && group.dataset.category !== selected; });
    const live = document.querySelector('.filter-status');
    if (live) live.textContent = selected === 'all' ? 'Toutes les réalisations sont affichées.' : button.textContent + ' : réalisations affichées.';
  }));
  document.querySelectorAll('.support-carousel').forEach(carousel => {
    const controls = [...document.querySelectorAll('[data-carousel]')].filter(button => button.dataset.carousel === carousel.id);
    const update = () => controls.forEach(button => {
      button.disabled = Number(button.dataset.direction) < 0 ? carousel.scrollLeft <= 2 : carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2;
    });
    controls.forEach(button => button.addEventListener('click', () => {
      const card = carousel.querySelector('.work-card');
      const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
      carousel.scrollBy({ left: Number(button.dataset.direction) * ((card?.getBoundingClientRect().width || carousel.clientWidth) + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }));
    carousel.addEventListener('scroll', update, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(carousel);
    update();
  });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08 });
    document.querySelectorAll('.section-title-row, .service-item, .method-step, .project-group-head, .work-card, .portfolio-end, .contact-copy, .form-shell').forEach(element => {
      element.classList.add('reveal');
      observer.observe(element);
    });
    document.documentElement.classList.add('motion-ready');
    reducedMotion.addEventListener('change', event => {
      if (event.matches) document.documentElement.classList.remove('motion-ready');
    });
  }
  const motionToggle = document.querySelector('.motion-toggle');
  if (motionToggle && !reducedMotion.matches) {
    motionToggle.hidden = false;
    motionToggle.addEventListener('click', () => {
      const paused = document.documentElement.classList.toggle('motion-paused');
      motionToggle.setAttribute('aria-pressed', String(paused));
      motionToggle.setAttribute('aria-label', paused ? 'Reprendre les animations' : 'Mettre les animations en pause');
      motionToggle.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
    });
  }
  const progress = document.querySelector('.reading-progress');
  const header = document.querySelector('.header');
  let scrollFrame = false;
  const updateScroll = () => {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
    header?.classList.toggle('has-scrolled', window.scrollY > 20);
    scrollFrame = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollFrame) { scrollFrame = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll);
  filters.forEach(button => button.addEventListener('click', updateScroll));
  updateScroll();
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const text = ["Demande de contact — BT com’", '',
      `Nom / structure : ${values.get('name')}`,
      `Adresse e-mail : ${values.get('email')}`,
      `Prestation : ${values.get('service')}`, '',
      'Description du projet :', String(values.get('message'))].join('\n');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Votre demande est copiée. Vous pouvez maintenant la coller dans votre messagerie. Aucun message n’a été envoyé.';
      status.className = 'success';
    } catch (err) {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      fallback.setAttribute('readonly', '');
      fallback.style.cssText = 'position:fixed;top:10px;left:10px;opacity:0';
      document.body.appendChild(fallback);
      fallback.select();
      const copied = document.execCommand('copy');
      fallback.remove();
      if (copied) {
        status.textContent = 'Votre demande est copiée. Aucun message n’a été envoyé.';
        status.className = 'success';
      } else {
        status.textContent = 'Copie indisponible sur ce navigateur. Sélectionnez et copiez vos informations manuellement.';
        status.className = 'error';
      }
    }
  });
})();
