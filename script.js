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
