/**
 * app.js
 * Entry point: renders content-driven sections (Story, Events, Guestbook,
 * FAQs, Film) from content.js, personalizes the page for the invited guest,
 * and boots the other modules. Gallery/Memories rendering lives in
 * gallery.js; the RSVP flow lives in rsvp.js — both are self-contained.
 */

const App = (() => {
  const renderStory = () => {
    const track = Utils.qs('#story-timeline');
    if (!track) return;

    track.innerHTML = WEDDING_CONTENT.story
      .map(
        (milestone, index) => `
        <article class="timeline-item" role="listitem" aria-label="${milestone.year}: ${milestone.title}">
          <div class="timeline-item__photo">
            <img src="${milestone.photo}" alt="${milestone.photoAlt}" loading="lazy" />
          </div>
          <div class="timeline-item__copy">
            <span class="timeline-item__year" aria-hidden="true">${milestone.year}</span>
            <p class="timeline-item__label">${milestone.label}</p>
            <h3>${milestone.title}</h3>
            <p>${milestone.description}</p>
          </div>
        </article>`
      )
      .join('');
  };

  const renderEvents = () => {
    const grid = Utils.qs('#events-grid');
    if (!grid) return;

    // A bare 'TBD' reads fine as a standalone label (the dress-code badge,
    // the venue value) but not stitched into a sentence next to a real
    // date ("February 23, 2027 · TBD") — so the datetime line spells out
    // "time to be announced" instead, and everywhere else displays the
    // friendlier "To be announced" rather than the raw sentinel value.
    const revealLabel = (value) => (value === 'TBD' ? 'To be announced' : value);

    grid.innerHTML = WEDDING_CONTENT.events
      .map((event) => {
        const dateKnown = event.date !== 'TBD';
        const timeKnown = event.time !== 'TBD';
        let datetime;
        if (dateKnown && timeKnown) {
          datetime = `${event.date} &middot; ${event.time}`;
        } else if (dateKnown && event.timeOfDay) {
          // Exact clock time isn't set yet, but which part of the day is
          // already known (Mehendi/Haldi mornings, Sangeet/Wedding nights)
          // — surface that now instead of a flat "time to be announced",
          // and keep only the still-genuinely-unknown part muted.
          datetime = `${event.date} &middot; ${event.timeOfDay} <span class="is-tbd">&mdash; exact time to be announced</span>`;
        } else if (dateKnown) {
          datetime = `${event.date} &middot; <span class="is-tbd">time to be announced</span>`;
        } else if (timeKnown) {
          datetime = `<span class="is-tbd">date to be announced</span> &middot; ${event.time}`;
        } else {
          datetime = '<span class="is-tbd">To be announced</span>';
        }
        const mapLink = event.mapUrl
          ? `<a class="btn btn--outline" href="${event.mapUrl}" target="_blank" rel="noopener noreferrer"
               aria-label="Open ${event.name} venue in Google Maps">
              <span data-lucide="map-pin" aria-hidden="true"></span> View on map
            </a>`
          : '';
        // Badge text spells out the category ("Dress code: …") instead of a
        // bare value, so the badge is never ambiguous about what it's
        // labeling — on both the TBD and (later) confirmed states.
        const isTbdDress = event.dressCode === 'TBD';
        const dressBadgeValue = isTbdDress ? 'TBA' : event.dressCode;
        return `
        <article class="event-card has-illo" data-reveal aria-labelledby="event-${event.id}-name">
          <div class="event-card__illo event-card__illo--${event.id}">
            <img src="${event.photo}" alt="${event.photoAlt}" loading="lazy" width="1920" height="1080" />
          </div>
          <div class="event-card__body">
            <div class="event-card__header">
              <h3 id="event-${event.id}-name">${event.name}</h3>
              <span class="event-card__badge${isTbdDress ? ' is-tbd' : ''}">Dress code: ${dressBadgeValue}</span>
            </div>
            <p class="event-card__datetime">${datetime}</p>
            <dl class="event-card__details">
              <div>
                <dt>Venue</dt>
                <dd${event.venue === 'TBD' ? ' class="is-tbd"' : ''}>${revealLabel(event.venue)}</dd>
              </div>
            </dl>
            <p class="event-card__quote">&ldquo;${event.description}&rdquo;</p>
            ${mapLink}
          </div>
        </article>`;
      })
      .join('');
  };

  const renderFaqs = () => {
    const list = Utils.qs('#faq-list');
    if (!list) return;

    list.innerHTML = WEDDING_CONTENT.faqs
      .map(
        (faq, index) => `
        <div class="faq-item" data-reveal>
          <button class="faq-item__question" aria-expanded="false" aria-controls="faq-answer-${index}" id="faq-question-${index}">
            <span>${faq.question}</span>
            <span class="faq-item__icon" data-lucide="plus" aria-hidden="true"></span>
          </button>
          <div class="faq-item__answer" id="faq-answer-${index}" role="region" aria-labelledby="faq-question-${index}" hidden>
            <p>${faq.answer}</p>
          </div>
        </div>`
      )
      .join('');

    Utils.qsa('.faq-item__question', list).forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const answer = document.getElementById(btn.getAttribute('aria-controls'));
        btn.setAttribute('aria-expanded', String(!expanded));
        answer.hidden = expanded;
      });
    });
  };

  const renderFilm = () => {
    const container = Utils.qs('#film-player');
    if (!container) return;

    if (!WEDDING_CONTENT.film.videoUrl) {
      container.innerHTML = `
        <div class="film-placeholder">
          <img src="${WEDDING_CONTENT.film.thumbnail}" alt="${WEDDING_CONTENT.film.thumbnailAlt}" loading="lazy" />
          <p>The wedding film will premiere here after the celebrations.</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <button class="film-thumbnail" aria-label="Play wedding film">
        <img src="${WEDDING_CONTENT.film.thumbnail}" alt="${WEDDING_CONTENT.film.thumbnailAlt}" loading="lazy" />
        <span class="film-thumbnail__play" data-lucide="play" aria-hidden="true"></span>
      </button>`;

    Utils.qs('.film-thumbnail', container).addEventListener('click', () => {
      container.innerHTML = `
        <div class="film-embed">
          <iframe src="${WEDDING_CONTENT.film.videoUrl}" title="${WEDDING_CONTENT.film.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>`;
    });
  };

  const renderGuestbook = async () => {
    const list = Utils.qs('#guestbook-list');
    if (!list) return;
    const entries = await MockAPI.getGuestbook();
    list.innerHTML = entries
      .map(
        (entry) => `
        <blockquote class="guestbook-card" data-reveal>
          <p>&ldquo;${entry.message}&rdquo;</p>
          <cite>&mdash; ${entry.name}</cite>
        </blockquote>`
      )
      .join('');
  };

  const setupGuestbookForm = () => {
    const form = Utils.qs('#guestbook-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = Utils.qs('#guestbook-name', form).value.trim();
      const message = Utils.qs('#guestbook-message', form).value.trim();
      const status = Utils.qs('.form-status', form);

      if (!name || !message) {
        status.textContent = 'Please fill in both your name and a message.';
        status.dataset.state = 'error';
        return;
      }

      status.textContent = 'Posting your message...';
      status.dataset.state = 'pending';
      await MockAPI.submitGuestbookEntry({ name, message });
      form.reset();
      status.textContent = 'Thank you for your message!';
      status.dataset.state = 'success';
      renderGuestbook();
    });
  };

  const personalizeForGuest = async () => {
    const guestId = Utils.getGuestIdFromUrl();
    const invite = await MockAPI.getInvite(guestId);
    Utils.qsa('[data-guest-name]').forEach((el) => {
      el.textContent = invite.displayName;
    });
    window.currentGuest = invite;
  };

  const populateStaticCopy = () => {
    Utils.qsa('[data-couple-names]').forEach((el) => {
      el.textContent = `${WEDDING_CONTENT.couple.partner1} & ${WEDDING_CONTENT.couple.partner2}`;
    });
    Utils.qsa('[data-couple-initials]').forEach((el) => {
      el.textContent = `${WEDDING_CONTENT.couple.partner1.charAt(0)} & ${WEDDING_CONTENT.couple.partner2.charAt(0)}`;
    });
    Utils.qsa('[data-wedding-date]').forEach((el) => {
      el.textContent = WEDDING_CONTENT.wedding.displayDate;
    });
    Utils.qsa('[data-wedding-city]').forEach((el) => {
      el.textContent = WEDDING_CONTENT.wedding.city;
    });
  };

  const initLucideIcons = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  const initCountdown = () => {
    const container = Utils.qs('#hero-countdown');
    if (!container) return;

    const target = new Date('2027-02-24T18:00:00+05:30').getTime();
    const daysEl = Utils.qs('[data-countdown="days"]', container);
    const hoursEl = Utils.qs('[data-countdown="hours"]', container);
    const minsEl = Utils.qs('[data-countdown="minutes"]', container);
    const secsEl = Utils.qs('[data-countdown="seconds"]', container);

    const update = () => {
      const diff = Math.max(0, target - Date.now());
      daysEl.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
      hoursEl.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
      minsEl.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      secsEl.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    };

    update();
    setInterval(update, 1000);
  };

  const init = async () => {
    populateStaticCopy();
    initCountdown();
    renderStory();
    renderEvents();
    renderFaqs();
    renderFilm();
    setupGuestbookForm();
    await Promise.all([personalizeForGuest(), renderGuestbook()]);

    Navigation.init();
    if (typeof RSVP !== 'undefined') RSVP.init();
    if (typeof Gallery !== 'undefined') Gallery.init();

    initLucideIcons();
    Animations.init();
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
