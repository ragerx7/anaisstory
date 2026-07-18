/**
 * navigation.js
 * Sticky header behavior: shrinks on scroll, mobile menu with focus trap,
 * active-link highlighting, and smooth in-page scrolling (delegates the
 * actual scroll physics to Lenis when available, set up in animations.js).
 */

const Navigation = (() => {
  let header;
  let toggleBtn;
  let menu;
  let releaseFocusTrap = () => {};

  const closeMenu = () => {
    menu.setAttribute('data-open', 'false');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    releaseFocusTrap();
  };

  const openMenu = () => {
    menu.setAttribute('data-open', 'true');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    releaseFocusTrap = Utils.trapFocus(menu);
    const firstLink = Utils.qs('a', menu);
    if (firstLink) firstLink.focus();
  };

  const handleToggleClick = () => {
    const isOpen = menu.getAttribute('data-open') === 'true';
    isOpen ? closeMenu() : openMenu();
  };

  const handleShrinkOnScroll = Utils.throttle(() => {
    header.classList.toggle('site-header--scrolled', window.scrollY > 40);
  }, 100);

  const handleNavLinkClick = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = Utils.qs(href);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(target, { offset: -80 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    history.pushState(null, '', href);
  };

  const setupActiveLinkObserver = () => {
    const sections = Utils.qsa('main > section[id]');
    const links = Utils.qsa('.site-nav a');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  };

  const init = () => {
    header = Utils.qs('.site-header');
    toggleBtn = Utils.qs('.nav-toggle');
    menu = Utils.qs('.site-nav');
    if (!header || !toggleBtn || !menu) return;

    toggleBtn.addEventListener('click', handleToggleClick);
    Utils.qsa('a', menu).forEach((link) => link.addEventListener('click', handleNavLinkClick));
    Utils.qsa('a[href^="#"]', document).forEach((link) => {
      if (!menu.contains(link)) link.addEventListener('click', handleNavLinkClick);
    });

    window.addEventListener('scroll', handleShrinkOnScroll, { passive: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.getAttribute('data-open') === 'true') closeMenu();
    });

    setupActiveLinkObserver();
  };

  return { init };
})();
