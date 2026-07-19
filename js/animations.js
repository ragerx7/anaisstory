/**
 * animations.js
 * Smooth scrolling (Lenis) + scroll-triggered reveals (GSAP/ScrollTrigger).
 * Kept deliberately restrained: fades and small upward motion only, no
 * flashy transforms, matching the editorial design direction.
 */

const Animations = (() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initSmoothScroll = () => {
    if (prefersReducedMotion || typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    window.lenisInstance = lenis;

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    if (typeof gsap !== 'undefined' && gsap.ticker) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.on('scroll', ScrollTrigger && ScrollTrigger.update);
    }
  };

  /**
   * Reveals [data-reveal]/.timeline-item elements not yet processed. Safe to
   * call repeatedly — content rendered asynchronously after the initial
   * page load (e.g. the gallery or memories feed, which wait on the mock
   * API) has no reveal animation wired up until this runs again, so callers
   * that inject such content re-invoke this afterward rather than leaving
   * it stuck at the [data-reveal] CSS default of opacity:0.
   */
  const revealNew = () => {
    if (typeof gsap === 'undefined') {
      // Graceful fallback: reveal everything immediately if GSAP failed to load.
      // is-in-view included alongside is-visible/is-revealed so anything
      // keyed off the real on-screen moment (see the GSAP path below)
      // still shows its landed state instead of staying stuck invisible.
      Utils.qsa('[data-reveal]:not(.is-revealed)').forEach((el) => {
        el.classList.add('is-visible', 'is-revealed', 'is-in-view');
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    Utils.qsa('[data-reveal]:not(.is-revealed)').forEach((el) => {
      el.classList.add('is-revealed');
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          // .is-revealed above is added to every element immediately (it's
          // just a re-processing guard) — it does NOT mean the element has
          // actually scrolled into view yet. Anything that needs to key off
          // the real, on-screen reveal moment (e.g. the seal-stamp CSS
          // animation in components.css) must use .is-in-view instead,
          // added here in onStart, which only fires when this tween
          // actually starts playing (i.e. when ScrollTrigger's condition
          // is met).
          onStart: () => el.classList.add('is-in-view'),
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    // Story timeline entries reveal in sequence, alternating from either side.
    Utils.qsa('.timeline-item:not(.is-revealed)').forEach((item, index) => {
      item.classList.add('is-revealed');
      const fromX = index % 2 === 0 ? -24 : 24;
      gsap.fromTo(
        item,
        { opacity: 0, x: fromX },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: item, start: 'top 80%', once: true },
        }
      );
    });
  };

  /**
   * Subtle parallax on Our Story photos: each photo pans a few percent as
   * its milestone scrolls through the viewport, scrubbed to scroll
   * position (not a one-time reveal). Photos are pre-scaled up slightly
   * so the pan has headroom to move within without exposing the parent's
   * background at the top/bottom edge (the parent already clips overflow
   * for the gradient-wash ::after in components.css).
   */
  const initStoryParallax = () => {
    if (typeof gsap === 'undefined' || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    Utils.qsa('.timeline-item__photo img').forEach((img) => {
      gsap.set(img, { scale: 1.15 });
      gsap.fromTo(
        img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.timeline-item'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });
  };

  /**
   * One-time hero load-in choreography: the feature photo (the one
   * dominant visual) settles into place first, then the names/date
   * placard fades up, then the CTA. Runs unconditionally on load rather
   * than through the generic [data-reveal] scroll-trigger system, since
   * the hero is already in view the moment the page loads — nothing here
   * needs a scroll trigger.
   *
   * Every element this animates FROM an offset/hidden state has that state
   * set in components.css (search "Load-in sequence" there). The instant
   * fallback below must cover the same set of elements, or a missing GSAP
   * load / prefers-reduced-motion would strand them invisible forever.
   */
  const initHeroSequence = () => {
    const content = Utils.qs('.hero__content');
    if (!content) return;

    const photo = Utils.qs('.hero__photo-frame', content);
    const eyebrow = Utils.qs('.hero__eyebrow', content);
    const names = Utils.qs('h1', content);
    const date = Utils.qs('.hero__date', content);
    const countdown = Utils.qs('.hero__countdown', content);
    const cta = Utils.qs('.btn', content);
    const ctaCaption = Utils.qs('.hero__cta-caption', content);

    const revealInstantly = () => {
      [photo, eyebrow, names, date, countdown, cta, ctaCaption].forEach((el) => {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    };

    if (typeof gsap === 'undefined' || prefersReducedMotion) {
      revealInstantly();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline();

    if (photo) tl.to(photo, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' });
    if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.25');
    if (names) tl.to(names, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.2');
    if (date) tl.to(date, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');
    if (countdown) tl.to(countdown, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.15');
    if (cta) tl.to(cta, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.15');
    if (ctaCaption) tl.to(ctaCaption, { opacity: 1, duration: 0.35, ease: 'power2.out' }, '-=0.1');
  };

  const init = () => {
    initSmoothScroll();
    initHeroSequence();
    initStoryParallax();
    revealNew();
  };

  return { init, revealNew };
})();
