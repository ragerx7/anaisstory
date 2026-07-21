# HANDOFF.md

Session handoff note. This is a **snapshot, not a log** — rewrite it in full
at the end of a session (or when context is running low), don't append to
it. The goal is that a brand-new session can read this one file and pick up
instantly, without re-deriving anything from conversation history.

For durable facts that don't change session-to-session, see CLAUDE.md
(architecture/constraints) and PLAN.md (roadmap). This file is specifically
"what's the state of things *right now*, and what should the next session do
first."

---

## Last session: 2026-07-21 (two Claude Code sessions ran concurrently
against this same repo most of the day — this snapshot merges both)

This is a real, confirmed pattern this project keeps hitting (see the
concurrent-editing gotcha in CLAUDE.md) — not a one-off. If you're picking
this up, assume another session may still be active; re-read files fresh
before editing rather than trusting this doc or an earlier in-conversation
read.

### Thread A — mobile nav fix, Events-card illustrations, Bollywood copy
exploration (a sibling session; the previous version of this file was its
handoff, summarized here rather than lost)

- **RSVP message field label**: "Any message for the bride & groom?" → **"Any
  message for us?"** (third→first person fix, `js/rsvp.js`).
- **Mobile nav link states, real bug fixed**: the mobile menu's three links
  looked inconsistent (boxed/rose/plain) because `:focus-visible` and
  `.is-active` both only set `color`, leaving the browser's native focus
  ring to fill the gap. Design-lead spec'd a two-channel fix (rose ring for
  interaction, gold underline for active section); user asked to keep only
  hover + active-section styling, not custom focus-visible. Shipped.
- **Events cards gained illustration banners** — this is the "henna hands /
  bangles" image seen mid-way through Thread B below; it turned out to
  already be this thread's in-progress work, not a mystery new asset.
  Several real iterations: a "ghost chip" dress-code badge was rejected
  (didn't name the category), replaced with a labeled micro-tag, then the
  user supplied their own **externally-built design file** (a `.dc.html`
  export from a design tool, four labeled options) and picked directly from
  it — see CLAUDE.md's gotcha: treat these as already-decided specs to
  implement literally, not a fresh design-lead question. Final state: a
  "Dress code: TBA" inline header badge + a themed illustration banner per
  event (`.event-card__illo--${event.id}`), each with its own gradient wash,
  using **transparent** PNGs (a second external file supplied after an
  opaque-background + blend-mode experiment was tried and reverted).
  `event.photo`/`photoAlt` now live in `js/content.js`.
- **"Bollywood/pop" copy voice — spec'd and mocked up, still NOT
  implemented.** Full voice charter + old→new copy table exist (design-lead
  spec + Artifact mockup: `https://claude.ai/code/artifact/603c0ac1-150d-4725-b0ad-959a4aee9b19`),
  covering hero/invitation/section headings/Our Story/events/RSVP
  success/guestbook. Awaiting the user's go-ahead on the overall direction
  and a specific pick on the RSVP success headline ("You said haan!" vs.
  safer alternates). **Don't assume this is wanted or abandoned — ask.**

### Thread B — this session: section-header/typography cleanup, real event
dates, RSVP arrival field, header logo legibility, and one real CSS bug
chased through two wrong theories to the actual root cause

- **Section headers simplified to one label each**: Story/Events/RSVP used
  to stack a script eyebrow above a separate Playfair `<h2>` — removed the
  eyebrow, kept one heading per section (Story → "Our Story", Events →
  "Events", RSVP → **"Save us the honour"**, deliberately dropping the
  literal word "RSVP" since it's already in the nav/hero). Then restyled
  all three (plus later "The seals loosen in their own time," then
  reverted at the user's request) to Pinyon Script + `--color-accent`,
  matching the hero name treatment — **every** `--font-script` use on the
  site now pairs with `--color-accent`, no exceptions currently live.
- **Header logo ("N & A") legibility fix**: was Pinyon Script at 28px,
  flagged unreadable — three isolated glyphs with no word-context to
  disambiguate the ampersand's loops, a structural problem no size fixes.
  Design-lead's call: switch to `--font-heading` (Playfair Display),
  1.375rem/500 weight/0.08em tracking, keep script for the hero H1/footer
  signature only (true display moments, different job from a nav anchor).
- **Real event dates landed**: Mehendi & Sangeet Night → Feb 23, 2027;
  Haldi Holi & The Wedding → Feb 24, 2027 (time/venue/dress-code still
  genuinely `TBD`). Added a `timeOfDay` field (Morning/Night) so guests get
  useful travel info ahead of exact times — renders as "{date} ·
  {timeOfDay} — exact time to be announced," only the truly-unknown part
  muted. Event names finalized: Sangeet Night, Haldi Holi, The Wedding.
- **RSVP additions**: hero CTA caption → "We can't wait to celebrate with
  you." (was an instruction aimed at the guest, now the couple's own
  feeling). New optional "arrival plan" field ("When can we expect to
  welcome you?", went through two earlier copy revisions first) + a
  stay-reassurance note ("Coming from out of town? Your stay is taken care
  of...") — both share the guest-count stepper's collapse/reveal group.
  `Code.gs` updated with an "Arrival Plan" column — **user still needs to
  manually redeploy the Apps Script** for their live Sheet to receive it;
  also needs the column manually inserted in the existing sheet (redeploy
  alone won't add it — the header-row auto-create only fires on a
  completely empty sheet).
- **Invitation card rewritten** (three passes, final copy is the user's own
  direct instruction): eyebrow "A little note from us", heading "We'd Love
  You to Be There", line "Because celebrations are better with the people
  we love." Along the way caught a real first/third-person voice bug
  ("their families" → "our families") independent of the final rewrite.
- **Two real CSS bugs found and fixed, both worth reading the full
  CLAUDE.md gotchas for:**
  1. `backdrop-filter` directly on `.site-header` was making it a
     containing block for its `position: fixed` child `.site-nav` (the
     mobile menu) — the menu's "hidden" translate only moved it by its own
     wrongly-short height, leaving the RSVP pill visibly stuck under the
     header at every scroll position. Fixed by moving the blur onto a
     `::before` pseudo-element instead (not a real DOM ancestor, can't
     become a containing block).
  2. **Story photos were cropping subjects off the sides — this took two
     attempts.** First theory (plausible, wrong): the scroll-parallax's
     `gsap.set(img, {scale: 1.15})` was zooming in on both axes when only
     vertical headroom was needed — fixed to `scaleX:1, scaleY:1.15`, and
     it genuinely does remove one real source of unwanted crop, but **the
     user checked again with a fresh screenshot and it was still
     cropped.** Real root cause, found by cloning the live DOM node and
     bisecting: the `<img>` had HTML `width="480" height="360"`
     attributes *alongside* a CSS `aspect-ratio: 4/3` rule — this specific
     rendering engine let the literal `height="360"` attribute win over
     the CSS-derived height, making the box 327×360 instead of 327×245 at
     mobile width, so `object-fit: cover` cropped ~32% of the image width
     to fill the too-tall box. Fixed by removing the HTML attributes
     entirely (the CSS `aspect-ratio` alone is enough, no layout-shift
     risk). **General lesson, now in CLAUDE.md: never add HTML
     `width`/`height` attributes to an `<img>` that already has a CSS
     `aspect-ratio` rule targeting it, even if the ratios match exactly.**
- Also hit the project's documented caching gotcha multiple times during
  verification (a `?nocache=` query param on the URL forces past it) —
  not new, just a reminder it applies to your own verification, not only
  real guests.

---

## Do this first, next session

1. **Ask about the Bollywood/pop copy direction before doing anything else
   copy-related** — fully spec'd and mocked up (Thread A), not confirmed
   or implemented. Don't assume wanted or abandoned.
2. **Confirm whether the user has redeployed `Code.gs`** and manually
   added the "Arrival Plan" column to their live Google Sheet — both are
   required and neither happens automatically; RSVP submissions work
   either way, they just silently won't be captured in the sheet column
   until this is done.
3. **Re-read the actual current state of any file before editing it** —
   the concurrent-editing pattern is real and recurring, confirmed again
   today across both threads (files changing mid-session without this
   conversation's own edits, `?v=N` jumping unexpectedly, `git log`
   showing commits with content already reflected in a session's own
   in-progress reads).
4. Everything else from prior sessions is unchanged — see TODO.md's "Not
   started" and remaining "Blocked on user input" (`story-4.jpg` regrade,
   the exhibition-rule layout extension to Our Story/Gallery/Memories/
   Guestbook/Film, real venue/time/dress-code values).

## Where things live (quick pointers, full detail in CLAUDE.md)

- Section headings: `.section-heading h2` in `style.css` (Pinyon
  Script + `--color-accent`, applies to Story/Events/RSVP now, and
  silently to Gallery/Memories/Guestbook/FAQ whenever those return).
- Header logo: `.site-logo` in `css/components.css`.
- RSVP arrival field + stay note: `js/rsvp.js` (`#field-arrival`,
  `#field-stay-note`, both inside the `yesOnlyGroups` collapse array),
  `.rsvp-stay-note` styles in `components.css`, `Code.gs` for the sheet
  column (not yet redeployed).
- Event dates/names/timeOfDay: `js/content.js`'s `events` array;
  rendering logic (including the mixed known-date/unknown-time branch)
  in `renderEvents()`, `js/app.js`.
- Event card illustrations (Thread A): `event.photo`/`photoAlt` in
  `js/content.js`, `.event-card__illo` family in `components.css`,
  transparent PNGs in `assets/images/`.
- Mobile nav link states (Thread A): `.site-nav a`/`a:hover`/`a.is-active`
  in `components.css`; focus-visible stays the global rule in `style.css`.
- Story-photo parallax + the HTML-attribute bug: `initStoryParallax()` in
  `js/animations.js`; the `<img>` template in `renderStory()`/`app.js`
  (no longer carries `width`/`height` attributes — don't re-add them).
- Bollywood/pop copy mockup (not implemented):
  `https://claude.ai/code/artifact/603c0ac1-150d-4725-b0ad-959a4aee9b19`
- Caching convention: `?v=N` on every CSS/JS tag in `index.html`, now at
  `v=41` — bump every tag together on any CSS/JS change.
- Dev server: `.claude/launch.json` → `wedding-static-server` (port 4173)
  or `wedding-static-server-alt` (port 4174, fallback if 4173 is held by
  a concurrent session).

## Nothing has been pushed

`git status`/`git log` confirm every change described above (both
threads) is local and uncommitted — nothing from 2026-07-21 is on
`origin/main` or the deployed GitHub Pages site yet. If the user reports
seeing old behavior on the *live* site, that's expected, not a bug.
