# TODO.md

Live checklist. Update this as you go — reflect current reality, don't just
append a log. Read alongside [CLAUDE.md](CLAUDE.md) and [PLAN.md](PLAN.md) at
the start of every session.

## Done

- Full site scaffold: all 10 sections, mobile-first CSS, JS modules (nav,
  animations, RSVP flow, gallery/memories, content rendering)
- Real couple details wired in: Naisargi & Anubhav, Feb 24 2027, Vadodara,
  Gujarat; event dates aligned (Haldi/Mehendi Feb 22, Sangeet Feb 23,
  Wedding/Reception Feb 24)
- Global redesign to the "scrapbook" direction: paper-grain background,
  ink/rust palette, Cormorant Garamond bold headings — applied site-wide via
  CSS tokens
- Hero section rebuilt again (2026-07-17): dropped the thread+heart motif and
  the two separate cutout photos in favor of a single finished focal image
  (`assets/images/wedding-childhood-pic.jpg`) — both real childhood photos
  die-cut onto one scalloped card with hand-drawn hearts, GROOM/BRIDE labels,
  and a "WE'RE GETTING MARRIED!" banner baked into the asset. Order is now
  h1 names -> feature photo -> date/city -> outline CTA. Resized/recompressed
  from a 2MB PNG to a 195KB JPEG (design-lead review flagged the original as
  an LCP problem); added a desktop-width step in responsive.css; added a
  visually-hidden "We're getting married!" line plus a plainer alt text so
  the announcement survives image failure. GSAP hero load-in sequence in
  `js/animations.js` updated to match (names -> photo -> date/CTA).
- Invitation section fully rebuilt: tilted keepsake card, washi tape, heart
  seal
- Mobile responsive pass done: fixed hero photos overflowing off-screen
  (was fixed 200px height regardless of viewport)
- `design-lead` subagent (.claude/agents/design-lead.md) rewritten to the
  user-supplied canonical prompt, and CLAUDE.md updated with a mandatory
  rule: any UI/UX/design-related request must go through it, before
  implementation and again for review
- Design-lead review of overall site emotional impact (2026-07-17): full
  diagnosis + prioritized P0-P6 recommendations, see HANDOFF.md. Implemented
  P1-P3 this session (hero atmosphere, palette depth, typography scale — see
  below); P0/P4-P6 are next-phase, pending user go-ahead
- Hero atmosphere pass (P1): warm radial glow behind the photo, a stacked
  paper-card `::before` peeking behind `.hero__photo-frame` (photo now reads
  as a keepsake laid on a table, not a flat image), the date restyled bigger
  with gold hairline rules + a small-caps city line, and the CTA switched
  from outline to a filled `--color-accent-deep` "festive" button
  (`.btn--festive`)
- Palette depth pass (P2): brightened `--color-bg-raised` for real card
  separation, added `--color-accent-deep`/`--color-gold` as sparingly-used
  festive-peak/micro-accent roles (not a site-wide reskin), widened
  `--shadow-soft` so raised surfaces are visible
- Typography scale pass (P3): bumped `--fs-h2` to display scale and global
  heading weight to 600, restyled `.eyebrow` from cold uppercase-tracked
  Inter to a warm italic Cormorant lead-in (applies to all ~9 sections that
  used it)
- Real bug fixed: gallery lock message / guest memory cards could get stuck
  permanently invisible (`opacity: 0`) because they render asynchronously
  after the scroll-reveal scan runs — see CLAUDE.md's scroll-reveal gotcha
- Pre-existing bug fixed: Our Story placeholder SVG labels were off-by-one
  (`story-2.svg` said "How We Met" instead of "Moving In Together", etc.) —
  root cause was zsh's 1-indexed arrays in the generation script
- Cleared test data (fake memory/RSVP entries from QA) from localStorage
- Explored four independent, unconverged creative directions (Editorial,
  Gallery, Cinema, Journey) at the user's request, each as a full
  vision/moodboard/screen-treatment/critique — see that session's
  HANDOFF.md and the presentation Artifact. Not implemented; pure exploration.
- **Converged and confirmed (2026-07-17): the "exhibition" layout rule** —
  one dominant visual, one text placard, one action if any, generous
  negative space, per screen, thinking backwards from
  `wedding-childhood-pic.jpg` as the fixed focal point. Full definition in
  CLAUDE.md's Design system section. Mocked up (Hero + Gallery-locked +
  RSVP) and confirmed by the user before implementing.
- **Implemented the confirmed exhibition hero**: photo now unveiled first
  (dominant visual), names+date is one placard, one CTA. Removed the
  stacked paper-card `::before` (competed with the photo's own frame) and
  shrank the H1 from up to 96px to `clamp(2.5rem, 6vw, 4rem)` (now reads as
  caption, not a second focal element). `initHeroSequence()` in
  `js/animations.js` reordered to match (photo -> names -> date -> CTA).
- **Implemented the confirmed Gallery locked-state treatment**: replaced
  the generic dashed-box + Lucide lock icon with one sealed frame (reusing
  the Invitation's heart-seal SVG), one caption, zero action.
- **Design-lead assessment: illustration, in response to a Pinterest
  reference.** Verdict: yes, but only at caption/punctuation scale (a
  single recurring ~16-24px hand-drawn heart/sprig on text-led sections —
  FAQ, Guestbook, dividers), never as a widget/icon-timeline/illustrated
  calendar/hand-lettered headline (all of which the reference had, and all
  of which would recreate the density the exhibition rule exists to avoid).
  The hero and gallery focal screens are permanently closed to added
  illustration — the photo already bakes in its own hearts/lettering.
  **Mockup built and published** (reuses the Invitation heart-seal path at
  ~1/8th scale, in gold, as an eyebrow ornament + a divider mark) — link in
  HANDOFF.md's "Artifacts published this session." Awaiting user reaction.
- Implemented hero/gallery changes shown to the user live at
  `localhost:4173` (mobile + desktop) and visually confirmed to match the
  approved mockup — no gaps found.
- **Extended the exhibition rule to Invitation (2026-07-17).** Design-lead
  spec'd it, a mockup Artifact with live copy/seal-position/viewport
  controls was built and confirmed (Warm copy — "You're Invited" / "come
  celebrate the start of our forever" — seal at bottom as the closing mark).
  Implemented: `.keepsake-card` renamed to `.invitation-card`, eyebrow +
  heading + message collapsed into one title + one caption, a gold hairline
  inner rule added (the card itself is now the dominant visual, dressed as
  a real invitation), `.section-inner--narrow` dropped in favor of the
  card's own `max-width: 440px`, extra desktop vertical padding
  (`clamp(120px, 16vh, 200px)`) added in `responsive.css` for negative
  space, zero CTA (confirmed correct — RSVP owns the site's one action).
  Post-implementation design-lead review: **approved, ship as-is** — one
  polish fix applied from that review (hard `<br>` in the caption replaced
  with `max-width` + `text-wrap: balance` so it degrades gracefully on
  narrow phones instead of orphaning). `content.js`'s unused `invitation`
  object (dead data, never read by `app.js`) synced to the new copy for
  consistency.
- **First real candid photo added (2026-07-18).** `Our Story` milestone 1
  ("Meeting Each Other") now uses a real photo — the couple at their office
  at Meesho — replacing the `story-1.svg` placeholder. Design-lead
  defined a concrete, reusable "real candid photo → scrapbook paper" grade
  recipe (crop-to-4:3 keeping all subjects in frame, a warm white-balance
  push, gentle contrast/saturation nudges, a 6% warm wash toward
  `--color-bg-raised`, and a subtle warm-biased vignette — mat/shadow/tilt
  deliberately left to CSS, not baked into the asset). Implemented as a
  reusable script, `scripts/grade-candid-photo.py` (Pillow), so future real
  photos (more Story milestones, Events, Gallery) can reuse the same
  pipeline — only the crop box and, for very differently-lit source photos,
  the blue-channel factor need to change per photo. Output: `story-1.jpg`,
  1000x750, 147KB, EXIF stripped.
- **All four Our Story milestones now real (2026-07-18).** Real timeline
  confirmed by the user: Meeting Each Other (2024, Meesho office),
  Officially Started Dating (2025), The Proposal (2026), Our Wedding (2027
  — hasn't happened yet). Display shows year only, not exact dates (per
  explicit user request), though `content.js` originally held exact dates
  for milestones 2-4 before that request. Milestones 2 and 3 got real
  candid photos (`story-2.jpg`, `story-3.jpg`) through the same
  `grade-candid-photo.py` pipeline as milestone 1. Milestone 4 got a
  designed "Coming Soon" graphic (`story-4.jpg`) instead of a real photo —
  correct, since the wedding hasn't happened. One source-file mixup was
  caught and corrected before shipping: the candid selfie and the "Coming
  Soon" graphic were initially uploaded under swapped/mistyped filenames;
  confirmed the correct mapping with the user before processing. The
  chronological-inconsistency issue flagged in the previous entry is now
  fully resolved. Milestone 2's photo was later swapped for a better crop
  (`story-milestone-2-v2.png`, same moment, more headroom) — no content.js
  change needed since it reuses the `story-2.jpg` filename.
- **Events updated to real 4-event list, all details explicitly TBD
  (2026-07-18).** Real order confirmed: Mehendi → Sangeet & Cocktails →
  Haldi → Wedding (Reception dropped from the original 5-event
  placeholder list). Design-lead first proposed a redesign for this
  details-TBD state (one program list on a gold thread instead of a card
  grid, since showing fake-looking specific times/venues/a working "View
  on map" button would be actively misleading, not just generic —
  mockup: `https://claude.ai/code/artifact/5fbad13c-ae63-4930-b446-2c24c283c34b`).
  **The user explicitly preferred keeping the existing card-grid layout**
  and just marking each field `TBD` — a legitimate override, implemented
  directly since it reuses the already-shipped layout (a content change,
  not a new design). `renderEvents()` in `js/app.js` now shows a single
  "TBD" for date+time (not "TBD · TBD") and omits the map button entirely
  when `mapUrl` is `null`, so there's no dead-looking control. See TODO's
  "Blocked on user input" for the live TBD fields.
- **RSVP rebuilt as a static form, and given a real backend (2026-07-18).**
  Two linked pieces of work:
  - **UX pivot, user-directed**: replaced `rsvp.js`'s conversational
    one-question-at-a-time chat flow with a single static paper-card form —
    Name (mandatory) → Will you attend? (mandatory) → How many of you?
    (guest count, defaults to 1, auto-collapses if "I can't make it" is
    selected) → Phone (optional) → Message for the bride & groom
    (optional). Design-lead spec'd the field order, the collapsing
    guest-count behavior, warm-maroon (not red) error states, and an
    in-place success-state swap (heart-seal + personalized message,
    differing copy for attending vs. declining) — mockup:
    `https://claude.ai/code/artifact/b0fdb1d6-373f-4562-8f4d-f399269262d5`,
    confirmed by the user before implementation. `.rsvp-flow`'s old
    `.rsvp-message`/`.rsvp-choices`/`.rsvp-input-form` CSS fully replaced
    with `.rsvp-card`/`.field-*`/`.attend-btn`/`.stepper` rules in
    `components.css`. Section background switched from `.section--alt` to
    plain paper so the raised card reads as an object on it. Copy: eyebrow
    "Save us the honour," caption "A few quick details — under a minute,
    we promise."
  - **Real backend**: RSVPs now actually persist to a Google Sheet in the
    user's Drive via a Google Apps Script Web App (`scripts/google-apps-
    script/Code.gs` + `SETUP.md`), not just `localStorage`. `MockAPI.
    submitRSVP` in `js/utils.js` posts to `WEDDING_CONTENT.integrations.
    rsvpEndpoint` when configured, always caches locally too, and falls
    back gracefully to local-only when the endpoint isn't set. The user
    completed the manual Google-side setup and it's verified working end
    to end (see "Blocked on user input" — resolved).
  - **Real bug caught during verification**: the success caption originally
    read "...celebrate with you in Vadodara, Gujarat, {name}" (used the
    full `WEDDING_CONTENT.wedding.city` string, which already contains a
    comma, creating an awkward triple-comma read) — simplified to drop the
    city mention entirely rather than fight the phrasing.
  - **Gotcha reinforced**: the dev-server caching issue (see CLAUDE.md)
    bit twice in a row during this verification — stripping the `?dev=N`
    cache-buster from one changed file while leaving another un-busted
    served a stale mix of old/new code with no console error, briefly
    looking like a real regression (a stale `rsvp.js` rendering the old
    chat flow, then stale `components.css` making `.field-error` always
    visible). Both were resolved by re-busting every touched file
    together, not just the most recently edited one.
  - **Real bug fixed (2026-07-18, later same day)**: the Name field's
    prefill logic (`guestName()` in `js/rsvp.js`) prefilled from
    `window.currentGuest.displayName` unconditionally — including the
    generic `default` guest object's `displayName: 'Guest'` when there's
    no personalized `?guest=` link in the URL. Since the couple is sharing
    one plain link over WhatsApp, not personalized links, every visitor
    saw the literal word "Guest" sitting in the Name field and had to
    delete it before typing their own name. Fixed by only prefilling when
    `window.currentGuest.guestId !== 'default'` — personalized links
    (e.g. `?guest=anubhav-family`) still correctly prefill "Anubhav &
    Family"; the plain link now leaves the field empty with just the
    "Your name" placeholder. `?v=N` bumped 5→6. Verified live in both
    cases, no console errors.
- **"More is coming" notes implemented (2026-07-18).** Three small,
  copy-only additions — no new component, no site-wide banner (see
  CLAUDE.md's "site is live with real guests" note for why a banner was
  explicitly rejected). All in a new shared `.quiet-note` style (italic
  Cormorant Garamond 500, `--color-text-secondary`, floats on paper, same
  register as `.eyebrow` but quieter):
  - **FAQ**: a closing line under a new `.faq-hairline` (short gold rule)
    below the last Q&A — *"That's everything we know so far — more answers
    will find their way here as the day draws near."*
  - **Guestbook**: a lead-in between the heading and the form —
    *"Our families left the first note. Add yours below — the wall fills
    as more of you arrive."*
  - **Footer**: one line, the only genuinely site-wide signal —
    *"New pages open here as the day draws near."*
  Mockup: `https://claude.ai/code/artifact/71e7b0a6-7462-4bad-820d-aac9ffc3664a`.
  Verified live (DOM-confirmed opacity/positioning; the Browser pane's
  known screenshot-compositing glitch produced a blank screenshot despite
  correct underlying state — see CLAUDE.md). Independent of the
  illustration micro-motif mockup (still unconfirmed, see next item) — if
  that motif is ever confirmed, its natural home is next to the FAQ note/
  footer line, not part of this change.
- **"Sealed coda" — a subtle mystery motif for the hidden sections
  (2026-07-18).** Design-lead spec'd a single quiet screen right before the
  footer (not scattered hints, not naming Gallery/Memories/Guestbook/Film
  anywhere) — reuses the Invitation/Gallery-locked heart-seal, a heading
  held a full step under `--fs-h2` scale so it reads as a hush not a second
  focal point, one italic caption, zero action, same paper background (no
  tonal shift). Register is deliberately "mystery" (plants a want) rather
  than the shipped "more is coming" notes' "reassurance" (soothes a worry)
  — see that session's mockup for the full reasoning:
  `https://claude.ai/code/artifact/50fe53f2-2f52-469b-843a-b53549d94212`.
  User confirmed: wax-seal motif (not the alternate empty-photo-corners
  option), copy "There's more to this book than you can open today." /
  "The seals loosen in their own time." Implemented as a new `.sealed-coda`
  section in `index.html` (last section inside `<main>`, before
  `</main>`/the footer) + matching rules in `components.css` — no new
  tokens, reuses `--color-accent`/`--color-text`/`--color-text-secondary`/
  the existing `--fs-*` scale/`.quiet-note` voice/the `[data-reveal]`
  contract (single reveal target, same fade-up as every other section —
  no bespoke animation added). The footer's old "New pages open here as
  the day draws near" line was consolidated into this new section and
  removed from the footer (`.site-footer__growth-note` CSS rule deleted as
  now-unused) so the two forward-looking notes don't double up back-to-back
  — footer is now just names + the guest sign-off line. All `?v=N` asset
  tags bumped 2→3 (CSS changed). Verified live at mobile and desktop
  widths: renders after FAQ/before footer, correct scale relationship to
  real section headings, no console errors.
  - **Follow-up (same day, user request)**: with the coda now covering that
    "more is coming" beat at the very end of the page, the FAQ's own
    closing note ("That's everything we know so far...") and its
    `.faq-hairline` divider were redundant right above it — removed both
    from `index.html`, and deleted the now-unused `.faq-hairline`/
    `.faq-closing-note` CSS rules from `components.css`. FAQ now ends at
    the last Q&A and flows straight into the coda. `?v=N` bumped 3→4.
    Verified live: no stray hairline, no console errors. The Footer's line
    and the Guestbook's intro note are untouched by this — those were kept
    deliberately per CLAUDE.md's "each section uses different phrasing"
    note; only FAQ's was judged redundant now that the coda exists.
  - **Follow-up 2 (same day, user request): the whole FAQ section is now
    also commented out**, same pattern as Gallery/Memories/Guestbook/Film
    — `<section id="faq">` in `index.html` wrapped in a comment, not
    deleted. `renderFaqs()` in `js/app.js` already null-guards on
    `#faq-list` missing, so no JS changes needed. Page now flows straight
    from RSVP to the sealed coda to the footer. No `?v=N` bump needed (no
    CSS/JS touched, only `index.html` markup). Verified live: no console
    errors.
  - **"The Pressed Seal" motion implemented (2026-07-18).** Design-lead's
    motion candidate #4, mocked up and confirmed (motif: wax seal, no idle
    breathing — shipped off, matching the mockup's default recommendation).
    Both the Invitation's and the sealed coda's heart-seal SVGs now stamp
    in ~0.35s after their parent card/block settles — a small
    press-and-overshoot with a brief `drop-shadow` bloom, via a
    `seal-stamp`/`seal-stamp-soft` CSS keyframe (the `-soft` variant lands
    at the coda seal's existing 0.9 opacity instead of full strength).
    `prefers-reduced-motion` override added for both (shows the landed
    state instantly, no animation).
    - **Real bug, caught by the user actually looking for the animation
      and not seeing it play**: the first implementation keyed both
      keyframes off `.is-revealed` — but `Animations.revealNew()` adds
      `.is-revealed` to *every* `[data-reveal]` element immediately/
      synchronously as a re-processing guard, regardless of scroll
      position; it does **not** mean the element has actually scrolled
      into view (the real reveal is a separately-deferred GSAP tween tied
      to its own ScrollTrigger). So the stamp animation was firing and
      fully completing within ~1.2s of page load, off-screen, for every
      section on the page at once — by the time a guest actually scrolled
      down, the seal was already sitting in its landed state with nothing
      left to see. Fixed properly: `js/animations.js`'s `revealNew()` now
      adds a second class, `.is-in-view`, inside the GSAP tween's
      `onStart` callback — which only fires when the tween actually
      begins playing, i.e. exactly when ScrollTrigger's condition is met.
      Both seal keyframes now key off `.is-in-view` instead of
      `.is-revealed`. The no-GSAP fallback path (`revealNew()`'s
      `typeof gsap === 'undefined'` branch) also grants `.is-in-view`
      immediately alongside `.is-visible`/`.is-revealed`, so the seal
      still shows its landed state rather than staying stuck invisible
      when GSAP fails to load. Verified live: at scroll position 0 the
      Invitation card and sealed coda are both genuinely `opacity: 0`
      (`.is-in-view` false) despite `.is-revealed` already being `true`;
      scrolling each into view adds `.is-in-view` and the stamp animation
      plays for real at that moment. `?v=N` bumped 7→8
      (`animations.js` + `components.css` changed). No console errors.
  - **Real bug fixed, footer copy (2026-07-18)**: same root cause pattern
    as the RSVP name-field bug above — the footer's `<span
    data-guest-name>` was populated from `window.currentGuest.displayName`,
    which is the literal string `"Guest"` for anyone on the plain shared
    link (no personalized `?guest=` param). Footer read "Made with love,
    ♥ for our guest, Guest." — a visibly repeated, awkward "guest." Fixed
    by dropping the dynamic guest name from the footer entirely per user
    request; static copy now reads "Made with love, ♥ for our friends and
    family." `[data-guest-name]` had no other usages in the codebase
    (confirmed via grep), so nothing else was affected by removing it.
- **Gallery, Guest Memories, Guestbook, and Wedding Film sections removed
  from the live site for now (2026-07-18), user request.** This is a
  deliberate exception to CLAUDE.md's usual "in-place more-is-coming
  framing over removal" rule for the live site — asked the user to choose
  explicitly given that tension for the first three, and they chose full
  removal over giving all three "coming soon" framing (Gallery already had
  that; Memories/Guestbook didn't); Film was removed the same way right
  after, same pattern. Nav links and all four `<section>` blocks in
  `index.html` are commented out, not deleted (this repo has no git history
  to fall back on, so commenting out is the safe reversible form) —
  restoring them later is a matter of un-commenting both the nav links and
  the section blocks. No JS changes were needed: `Gallery.init()`,
  `renderGuestbook()`, `setupGuestbookForm()`, and `renderFilm()` in
  `gallery.js`/`app.js` already null-guard on their target elements
  missing. Verified in the browser: no console errors, remaining sections
  (Story → Events → RSVP → FAQ) flow correctly with no gap.

## In progress / next up

- [ ] **Get the user's reaction to the illustration micro-motif mockup**
      (built 2026-07-17, link in that session's HANDOFF.md — heart/sprig
      ornament for FAQ/Guestbook at caption scale) — still not confirmed,
      tweaked, or rejected. Note: the "more is coming" notes above were
      spec'd to be independent of this motif (don't wait on it), but if
      the heart motif is later confirmed, its natural home is right next
      to the FAQ closing note / footer line (see that design-lead spec's
      "optional future hook").
- [ ] **Extend the exhibition rule to the remaining sections.** Confirmed
      and shipped on Hero, Gallery(locked), Invitation. **Status is now
      genuinely mixed per section — don't assume uniform progress:**
      - **Our Story**: real content is done (see Done — 4 real
        milestones/photos), but the *visual* exhibition-rule redesign
        (one-milestone-per-screen sequencing, a festive-peak finale on
        2027) was never implemented — it's still the original card/
        timeline grid, just with real data in it now. Structural redesign
        still needs the user's go-ahead.
      - **Events**: **exhibition-rule redesign explicitly declined by the
        user (2026-07-18)** — kept the existing card grid deliberately
        (see Done). Don't re-propose unless asked; this one's settled, not
        just "not started."
      - **RSVP**: **no longer "needs polish" — it was fully rebuilt as a
        static form (2026-07-18, see Done)**, a different and larger
        change than the visual-polish-only plan this bullet used to
        describe. RSVP is done, full stop, not part of this remaining-work
        list anymore.
      - **Gallery(unlocked) → Guest Memories → Wedding Film → Guestbook →
        FAQ → Footer**: genuinely not started, still the original
        card-grid-to-sequence conversion work described in the 2026-07-17
        design-lead review (full text in that session's HANDOFF.md). A
        combined mockup covering all of these was built 2026-07-18
        (`https://claude.ai/code/artifact/f7c1d9d7-8032-40aa-b1c0-bafb7e2bd97e`)
        but **was never confirmed as a batch** — the user instead made
        separate, different, per-section calls on Story/Events/RSVP as
        each came up (see above), diverging from that mockup's specific
        proposals for Story and Events. Treat that combined mockup as
        reference/inspiration only for the sections still untouched
        (Gallery/Memories/Film/Guestbook/FAQ), not as pre-approved —
        confirm per section, same as everything else has gone.
- [ ] **P4 — cut framing prose.** Remove the descriptive sub-sentence under
      most section headings; let content lead instead of narrating a label.
- [ ] **P5 — design photo-shaped slots now, even while empty.** Largely
      overtaken by events: Hero, Our Story (all 4 milestones), and Story's
      "Coming Soon" graphic are now real/designed rather than generic
      placeholders. Still genuinely open for **Events and Gallery/Film**,
      which have no photo slots designed yet. Getting more real photos
      from the couple remains valuable but is no longer the single
      blocking gap it was.
- [ ] **P6 — purposeful motion beyond uniform fades.** One or two moments
      (parallax on a full-bleed photo band, sequential story reveal), not
      motion for its own sake. Lower priority than P4/P5.
- [x] **Housekeeping — fixed 2026-07-18**: `index.html`'s `og:image`/
      `twitter:image`/JSON-LD `image`/`og:url`/canonical all used to point
      at `https://example.com/` and the old `assets/images/hero.svg`
      placeholder. Prompted by the site going live at
      `https://ragerx7.github.io/anaisstory/` and being shared over
      WhatsApp — WhatsApp/Facebook-style link crawlers need an **absolute**
      image URL (a relative path won't reliably resolve) and generally
      don't render SVG previews well, so both were real bugs, not just
      staleness. Now point at the real deployed URL and
      `wedding-childhood-pic.jpg` (absolute URL), with `og:image:width`
      (700) / `height` (914) / `type` (image/jpeg) added so crawlers don't
      have to guess. **Not yet live** — this is a local edit; see the note
      below on pushing it to `main` for GitHub Pages to pick it up.

## Blocked on user input — don't assume, ask again if it comes up

- ~~**RSVP → Google Sheet setup**~~ — **confirmed genuinely working,
  2026-07-18**, after a bumpy verification (worth understanding, see
  below). Sequence of events: (1) client-side tests of 3 submissions
  through the real form showed clean success with no console errors — (2)
  the user checked the actual sheet and it was completely empty, no header
  row at all — (3) a direct debug-probe `fetch` (bypassing the site's own
  code) got back `{"success":true}` from the endpoint — (4) the user
  checked the sheet again and this time the debug-probe row **was**
  there, with the correct header row and all columns (Timestamp, Guest ID,
  Name, Attending, Guest Count, Phone, Message) matching `Code.gs`
  exactly. **Root cause of the earlier empty-sheet moment was never
  conclusively identified** — most likely the user's Google-side setup
  (deployment/authorization) simply wasn't fully finished yet when the
  first 3 submissions went out, and had completed by the time of the
  debug probe; timestamp ordering in the conversation is consistent with
  that. If it silently stops writing again, check the Apps Script
  Executions log (View → Executions in the script editor) first — that's
  the direct ground-truth diagnostic, and Claude Code can't see it.
  ~~A real client bug surfaced during this investigation~~ — **fixed same
  day**: `MockAPI.submitRSVP` in `js/utils.js` now explicitly checks for
  `result.success === false` (an Apps Script rejection, e.g. a bad secret)
  and flags it (`sheetError`/`sheetErrorReason`, logged via
  `console.error`) instead of silently treating it as a full success —
  verified with a deliberately-wrong-secret test. The guest still isn't
  blocked (local cache always succeeds first), but a real rejection is no
  longer indistinguishable from a real success. Test rows ("Debug Probe",
  "Final Verification") have been deleted from the sheet by the user.
- **Formula-injection hardening added to `Code.gs` (2026-07-18)**, prompted
  by the user asking whether the Apps Script URL/secret could be used to
  compromise their Google Drive more broadly. Answer given: no — the
  script only ever does what `doPost()` codes (append one row to one
  sheet), a caller doesn't inherit the owner's broader Drive permissions.
  But a real, separate risk exists regardless of the script's own
  permissions: Google Sheets evaluates cell text starting with `=`/`+`/
  `-`/`@` as a live formula when the sheet is opened, so an untrusted
  Name/Phone/Message could smuggle in something like `=IMPORTXML(...)`.
  Added `sanitizeForSheet()` to `Code.gs`, prefixing any such value with a
  leading apostrophe so Sheets always renders it as plain text.
  **Needs the user to redeploy** — copy the updated `Code.gs` into the
  live Apps Script editor and use Deploy → Manage deployments → Edit →
  New version, or this fix doesn't take effect. See SETUP.md's updated
  "Redeploying after editing Code.gs" section.
- **Root cause found for RSVPs silently not reaching the sheet again
  (2026-07-18)**: very likely the redeploy instruction directly above.
  The repo's `Code.gs` had `SHARED_SECRET = 'REPLACE_WITH_YOUR_OWN_SECRET'`
  — a placeholder, not the user's real secret — while SETUP.md told the
  user to "copy the current contents of Code.gs... replacing what's
  there" for the formula-injection fix. Following that literally would
  silently overwrite the live script's real secret with the placeholder,
  breaking the match with `content.js`'s secret and causing every
  submission to fail server-side as `Unauthorized` (`doPost` rejects
  before ever appending a row) — with no client-visible error, since the
  UI only surfaces `sheetError` to the console, not to the guest. Not
  100%-confirmed against the live Apps Script Executions log (that's the
  one ground-truth source Claude Code can't see — user should check it if
  this recurs), but the docs/repo inconsistency is real and sufficient
  explanation on its own.
  **Fixed as part of the user's own request to rotate the secret
  anyway**: generated a fresh secret, set it in both `js/content.js`
  (`rsvpSecret`) and `scripts/google-apps-script/Code.gs`
  (`SHARED_SECRET`) — so the repo file is finally in sync with what's
  actually deployable, closing off this whole bug class (copying `Code.gs`
  wholesale is now safe, since the file *is* the real secret, not a
  placeholder). SETUP.md's "Redeploying after editing Code.gs" section
  updated with this history and the exact redeploy steps needed now.
  **Still needs the user to redeploy** (same mechanism as above) — until
  they paste the new `Code.gs` into the Apps Script editor and ship
  Deploy → Manage deployments → Edit → New version, the live endpoint is
  still checking the *old* secret and submissions will keep failing.
  `?v=N` bumped 4→5 (`content.js` changed).
- **Permanent asset-versioning convention adopted, replacing the old
  temporary cache-busting workflow (2026-07-18).** Prompted by the user
  asking whether the caching pain from this session would recur once the
  site goes live post-deployment — real concern, not dev-only: any static
  host serving plain filenames with permissive/no cache headers has the
  same risk for a guest who visited before a post-launch update. Fix:
  every local CSS/JS tag in `index.html` now carries a shared `?v=1` query
  string, permanently (not stripped after verification like the old
  `?dev=N` pattern was) — bump every one of them together whenever any
  CSS/JS file changes, going forward. Also added a `_headers` file at the
  project root (recognized automatically by Netlify/Cloudflare Pages,
  inert elsewhere) setting `Cache-Control: no-cache` as a second line of
  defense at the hosting layer. CLAUDE.md's caching gotcha section rewritten
  to document the new convention as the standing workflow.
- **RSVP deadline + gift registry info**: previously drafted as "RSVP by Jan
  24 / Gift registry" placeholder row, then explicitly removed at the user's
  request ("remove it for now, will add later"). Add back once real info
  exists.
- **Gallery / Guest Memories / Guestbook / Wedding Film / FAQ**: removed
  from nav + page (commented out in `index.html`, see Done) at the user's
  request, "we'll add them later." Un-comment when these are ready to go
  live again — no code rewrite needed, the sections and their JS are
  untouched. **When any of these come back, revisit the "sealed coda"
  section below** — its whole premise is that these sections are still
  hidden; it should shrink or retire as they return, not stay put
  unchanged.
- **Venue names/addresses/dress codes/dates/times** for each event: now
  explicitly `TBD` in `content.js` (updated 2026-07-18, genuinely unknown,
  not generic placeholder text) — real event list and order confirmed as
  Mehendi → Sangeet & Cocktails → Haldi → Wedding (Reception dropped). Fill
  in as details are confirmed; each field renders as-is once it's no
  longer `TBD`/`null`.
- ~~**Our Story milestones**~~ — **fully resolved 2026-07-18.** All four
  now use the couple's real timeline and real images (see Done): Meeting
  Each Other (2024, real photo), Officially Started Dating (2025, real
  photo), The Proposal (2026, real photo), Our Wedding (2027 — hasn't
  happened yet, correctly a designed "Coming Soon" graphic rather than a
  real photo). Display shows year only, not exact dates, per explicit user
  request. Chronology reads correctly in order.
  **One thing still needs the user's confirmation**: they first said they
  met "in 2025," then a follow-up message said "2024" — went with 2024 as
  the newer, more explicit statement, but this hasn't been explicitly
  reconfirmed. Ask again if it resurfaces.
- **Envelope-shower / cash-gift custom** (`Lluvia de sobres` style, seen in a
  reference image): asked whether this applies to this wedding, never
  answered directly — don't add it without confirming.

## Not started

- Real backend (Step 9 in PLAN.md) for everything except RSVP — RSVP now
  has a real backend (Google Sheet via Apps Script, see Done); every other
  `MockAPI` call (memories, guestbook, likes/comments, gallery) is still
  localStorage-only.
- Deployment (Step 10) — see PLAN.md's notes on `Cache-Control` /
  `_headers` considerations, already prepared for whenever a host is
  chosen.
- Admin panel
