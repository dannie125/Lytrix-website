const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-navigation');
const solutions = document.querySelector('.solutions-nav');
if (solutions) {
  document.addEventListener('click', event => {
    if (!solutions.contains(event.target)) solutions.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && solutions.open) {
      solutions.open = false;
      solutions.querySelector('summary').focus();
      event.stopImmediatePropagation();
    }
  });
  solutions.addEventListener('click', event => {
    if (event.target.closest('a')) solutions.open = false;
  });
}
if (menuButton && nav) {
  menuButton.hidden = false;
  const closeMenu = () => {
    if (solutions) solutions.open = false;
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);
}

