// Progressive enhancement only. Access and permission are always checked by the server.
for (const button of document.querySelectorAll('[data-interest-toggle]')) {
  button.addEventListener('click', () => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    const opening = panel.hidden;
    panel.hidden = !opening;
    button.setAttribute('aria-expanded', String(opening));
    if (opening) panel.querySelector('button')?.focus();
  });
}
for (const form of document.querySelectorAll('[data-permission-form]')) {
  form.addEventListener('input', event => {
    if (event.target.name !== 'consent') {
      const consent = form.querySelector('[name="consent"]');
      if (consent) consent.checked = false;
    }
  });
}
const claimForm = document.querySelector('[data-claim-form]');
if (claimForm) {
  const fragment = new URLSearchParams(location.hash.slice(1));
  const token = fragment.get('token') || fragment.get('claim') || '';
  const tokenField = claimForm.querySelector('[data-claim-token]');
  const button = claimForm.querySelector('[data-claim-button]');
  const help = claimForm.querySelector('[data-claim-help]');
  if (token && tokenField) {
    tokenField.value = token;
    button.disabled = false;
    history.replaceState(null, '', location.pathname + location.search);
  } else {
    help.textContent = 'This page needs a complete private email link. Request a fresh link below if yours has expired.';
  }
}
// Keep browser validation and keyboard submission native; do not auto-submit claims.
const notice = document.querySelector('[data-notice]');
if (notice && location.hash === '#status') notice.focus();
