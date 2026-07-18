/**
 * rsvp.js
 * Static RSVP form — Name, Will you attend?, Guest count (collapses when
 * not attending), Phone, Message. Renders once as a single paper card;
 * submits via MockAPI.submitRSVP, which posts to the configured Google
 * Sheet endpoint when set (see js/utils.js and scripts/google-apps-script/).
 */

const RSVP = (() => {
  let container;
  let attending = null; // 'yes' | 'no' | null
  let guestCount = 1;

  const guestName = () => (window.currentGuest && window.currentGuest.displayName) || '';
  const maxGuests = () => (window.currentGuest && window.currentGuest.maxGuests) || 8;

  const renderForm = (prefill = {}) => {
    attending = prefill.attending === true ? 'yes' : prefill.attending === false ? 'no' : null;
    guestCount = prefill.guests || 1;

    container.innerHTML = `
      <div class="rsvp-card" data-reveal>
        <form class="rsvp-form" id="rsvp-form" novalidate>
          <div class="field-group" id="field-name">
            <label class="field-label" for="rsvp-name">Name</label>
            <input class="field-input" id="rsvp-name" name="name" type="text" placeholder="Your name"
              value="${prefill.name || guestName() || ''}" autocomplete="name" />
            <p class="field-error">We&rsquo;d love to know who&rsquo;s coming.</p>
          </div>

          <div class="field-group" id="field-attend">
            <span class="field-label">Will you attend?</span>
            <div class="attend-choices" role="group" aria-label="Will you attend?">
              <button type="button" class="attend-btn" data-attend="yes">Yes, I&rsquo;ll be there</button>
              <button type="button" class="attend-btn" data-attend="no">I can&rsquo;t make it</button>
            </div>
            <p class="field-error">Just let us know if you&rsquo;ll be there.</p>
          </div>

          <div class="field-group guest-count-group" id="field-guests">
            <span class="field-label">How many of you?</span>
            <p class="guest-count-helper">Including yourself.${
              window.currentGuest ? ` Your invitation is for up to ${maxGuests()}.` : ''
            }</p>
            <div class="stepper">
              <button type="button" id="step-down" aria-label="Decrease guest count">&minus;</button>
              <span class="count-value" id="count-value">${guestCount}</span>
              <button type="button" id="step-up" aria-label="Increase guest count">+</button>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label" for="rsvp-phone">Phone number <span class="field-optional">(optional)</span></label>
            <input class="field-input" id="rsvp-phone" name="phone" type="tel" placeholder="+91 98765 43210"
              value="${prefill.phone || ''}" autocomplete="tel" />
          </div>

          <div class="field-group">
            <label class="field-label" for="rsvp-message">Any message for the bride &amp; groom? <span class="field-optional">(optional)</span></label>
            <textarea class="field-textarea" id="rsvp-message" name="message" rows="3"
              placeholder="A blessing, a memory, a song request&hellip;">${prefill.message || ''}</textarea>
          </div>

          <button type="submit" class="btn btn--festive rsvp-submit" id="rsvp-submit">Send RSVP</button>
        </form>

        <div class="rsvp-success" id="rsvp-success" hidden>
          <svg class="rsvp-success__seal" viewBox="0 0 34 34" aria-hidden="true">
            <path d="M17,29 C8,22.5 3.5,17 3.5,11.5 C3.5,6.5 7.5,3.5 11.5,3.5 C13.8,3.5 15.8,4.7 17,6.7 C18.2,4.7 20.2,3.5 22.5,3.5 C26.5,3.5 30.5,6.5 30.5,11.5 C30.5,17 26,22.5 17,29 Z" fill="var(--color-accent)" />
          </svg>
          <h3 id="rsvp-success-heading"></h3>
          <p id="rsvp-success-caption"></p>
          <button type="button" class="rsvp-change-link" id="rsvp-change">Need to change something?</button>
        </div>
      </div>`;

    wireForm();
  };

  const wireForm = () => {
    const form = Utils.qs('#rsvp-form', container);
    const attendBtns = Utils.qsa('.attend-btn', container);
    const nameGroup = Utils.qs('#field-name', container);
    const attendGroup = Utils.qs('#field-attend', container);
    const guestGroup = Utils.qs('#field-guests', container);
    const stepDown = Utils.qs('#step-down', container);
    const stepUp = Utils.qs('#step-up', container);
    const countValue = Utils.qs('#count-value', container);
    const submitBtn = Utils.qs('#rsvp-submit', container);

    const updateStepper = () => {
      countValue.textContent = guestCount;
      stepDown.disabled = guestCount <= 1;
      stepUp.disabled = guestCount >= maxGuests();
    };
    updateStepper();

    if (attending) {
      attendBtns.forEach((b) => b.classList.toggle('is-selected', b.dataset.attend === attending));
      if (attending === 'no') {
        guestGroup.classList.add('is-collapsed');
        submitBtn.textContent = 'Send my regrets';
      }
    }

    stepDown.addEventListener('click', () => {
      if (guestCount > 1) {
        guestCount--;
        updateStepper();
      }
    });
    stepUp.addEventListener('click', () => {
      if (guestCount < maxGuests()) {
        guestCount++;
        updateStepper();
      }
    });

    attendBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        attendBtns.forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        attending = btn.dataset.attend;
        attendGroup.classList.remove('has-error');
        if (attending === 'no') {
          guestGroup.classList.add('is-collapsed');
          submitBtn.textContent = 'Send my regrets';
        } else {
          guestGroup.classList.remove('is-collapsed');
          submitBtn.textContent = 'Send RSVP';
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = Utils.qs('#rsvp-name', form).value.trim();
      let valid = true;

      nameGroup.classList.toggle('has-error', !name);
      if (!name) valid = false;
      attendGroup.classList.toggle('has-error', !attending);
      if (!attending) valid = false;
      if (!valid) return;

      const payload = {
        guestId: window.currentGuest?.guestId,
        name,
        attending: attending === 'yes',
        guests: attending === 'yes' ? guestCount : null,
        phone: Utils.qs('#rsvp-phone', form).value.trim(),
        message: Utils.qs('#rsvp-message', form).value.trim(),
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        await MockAPI.submitRSVP(payload);
        showSuccess(payload);
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = attending === 'no' ? 'Send my regrets' : 'Send RSVP';
      }
    });

    Utils.qs('#rsvp-change', container)?.addEventListener('click', () => {
      renderForm({
        name: Utils.qs('#rsvp-name', container)?.value,
        attending: attending === 'yes',
        guests: guestCount,
        phone: Utils.qs('#rsvp-phone', container)?.value,
        message: Utils.qs('#rsvp-message', container)?.value,
      });
    });
  };

  const showSuccess = (payload) => {
    const form = Utils.qs('#rsvp-form', container);
    const success = Utils.qs('#rsvp-success', container);
    const headline = Utils.qs('#rsvp-success-heading', container);
    const caption = Utils.qs('#rsvp-success-caption', container);
    const displayName = payload.name || 'there';

    if (payload.attending) {
      headline.textContent = "You're on the list.";
      caption.textContent = `We can't wait to celebrate with you, ${displayName}. We'll share the finer details closer to the day.`;
    } else {
      headline.textContent = "We'll miss you.";
      caption.textContent = `Thank you for letting us know, ${displayName} — you'll be with us in spirit.`;
    }

    form.hidden = true;
    success.hidden = false;
  };

  const init = () => {
    container = Utils.qs('#rsvp-flow');
    if (!container) return;
    renderForm();
  };

  return { init };
})();
