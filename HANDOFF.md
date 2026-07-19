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

## Last session: 2026-07-19 (very long session — bug fixes, a wide design
exploration, then a full palette pivot ported from an external reference)

Roughly in order:

### Part 1 — Section removal, a real motion bug, two real content bugs

- **Gallery, Guest Memories, Guestbook, Wedding Film, and FAQ removed from
  the live site** (commented out in `index.html`, not deleted — trivial to
  restore). This was flagged as tension with CLAUDE.md's usual "in-place
  more-is-coming framing over outright removal" rule for a live site; asked
  the user to choose explicitly, and they chose full removal for all five,
  one at a time as each came up.
- **"The Pressed Seal" motion implemented** (wax-seal stamp-in animation on
  the Invitation card and the sealed coda) — and a **real, easy-to-repeat
  bug found and fixed** in the process: `Animations.revealNew()`'s
  `.is-revealed` class is added to *every* `[data-reveal]` element
  immediately at page load as a re-processing guard — it does **not** mean
  the element is on-screen yet. The stamp animation was keyed off that
  class by mistake, so it played out fully within ~1s of page load,
  off-screen, for every section at once — invisible by the time a guest
  actually scrolled there. Fixed by adding a second class, `.is-in-view`,
  inside the GSAP tween's `onStart` callback (fires only when
  ScrollTrigger's condition is actually met) — now documented as a
  standing gotcha in CLAUDE.md.
- **Two real content bugs fixed**, same root cause: the generic fallback
  guest object's `displayName` is literally the string `"Guest"` for
  anyone on the plain shared link (no personalized `?guest=` param) — (1)
  the RSVP Name field was prefilling with the literal word "Guest,"
  forcing every visitor to delete it first (fixed: only prefill for
  genuinely personalized links); (2) the footer read "Made with love, ♥
  for our guest, Guest" (fixed: dropped the dynamic guest name, static
  copy now "Made with love, ♥ for our friends and family").
- **RSVP → Google Sheet silently stopped saving** — likely root cause
  found: `SETUP.md` had instructed "copy the current contents of Code.gs
  into your Apps Script editor, replacing what's there" for an earlier fix,
  but the repo's `Code.gs` still had the placeholder secret
  `REPLACE_WITH_YOUR_OWN_SECRET`, not the real one — following that
  instruction would silently overwrite the live secret, breaking the match
  with `content.js` and causing every submission to fail server-side as
  `Unauthorized`. Fixed by rotating to a new secret and setting it
  identically in both `content.js` and `Code.gs`, so the repo file is
  finally safe to copy-paste wholesale. **User still needs to redeploy**
  the updated `Code.gs` (paste into the Apps Script editor, Deploy →
  Manage deployments → Edit → New version) — not yet confirmed done.
- **Real Open Graph / WhatsApp-preview bug fixed**: `og:image`/
  `twitter:image`/canonical/`og:url` were still pointing at
  `https://example.com/` and the stale `hero.svg` placeholder. Now point
  at the real deployed URL (`https://ragerx7.github.io/anaisstory/`) and
  the real hero photo, with explicit width/height/type so crawlers don't
  have to guess.

### Part 2 — A wide design exploration (six motion candidates, then three
full theme directions) — **none of this was the direction ultimately
adopted**, see Part 3

Six motion candidates explored via design-lead (immersive-but-minimal
brief): a reimagined Our Story sequence ("The Story Writes Itself" — a
single scroll-scrubbed ink rail, superseding an earlier busier "Turning the
Pages" pass), the Pressed Seal (implemented, see Part 1), a full-bleed
parallax band, drawn-in-ink ornaments, and a "lit paper" ambient glow.
Mockups: `https://claude.ai/code/artifact/0323a40b-a0de-484c-90f9-a1c9cd66b1a6`
(original Turning Pages + Pressed Seal), `https://claude.ai/code/artifact/1e36f5d1-eb93-418f-8368-4cd74670b96e`
(Full-Bleed Band/Drawn-in-Ink/Lit Paper), `https://claude.ai/code/artifact/f918d9c9-bd0f-4e22-aed7-410899f64eca`
(Story Writes Itself, after user feedback that the first pass "clashed").
**None of the non-Pressed-Seal candidates were confirmed or built.**

Separately, three full palette/theme directions were explored (Pop Wedding,
Hip Wedding, Traditional Indian Wedding) via design-lead, plus a
feeling-first "First Light" direction (deep romantic love / immense joy /
anticipation, built around a sunrise metaphor). Swatch/type board:
`https://claude.ai/code/artifact/f6151dfe-f418-4f48-92cb-293c368e7281`. Full
mockups were built locally for Pop Wedding and First Light but **neither was
ever actually published/shown to the user** — both attempts were
interrupted mid-build when the user pivoted to Part 3 instead. **Treat all
of Part 2 as genuine, un-adopted exploration** — if the user asks about any
of these later, they were explored and set aside, not forgotten.

### Part 3 — The actual adopted direction: "Petal Blush," ported from an
external Figma Make reference

The user had a full working site replica built externally (Figma Make,
React/Vite/Tailwind) and shared the exported source folder directly
(a local `Downloads/` path, not in this repo) with an explicit instruction
to implement it for real, plus two non-negotiable corrections: (1) RSVP
keeps its real fields exactly as they were (no email field, no "Joyfully
accepts/Regretfully declines" relabeling); (2) Events keeps the real
4-event list (Mehendi/Sangeet & Cocktails/Haldi/Wedding, everything
honestly `TBD`), not the reference's fabricated 4-event list/specifics.
This session treated a complete external reference implementation as
already serving the "mockup, confirmed" step (see the updated
`feedback_mockup_first_workflow` memory) — went straight to porting it
rather than building another internal mockup of someone else's mockup.

**What shipped** (full detail in CLAUDE.md's Design System section and
TODO.md's Done list — this is the summary):
- New palette (`--color-accent: #8b3a52` "Bridal Rose," plus new
  `--color-blush`/`--color-mauve`/`--color-peach` roles) and fonts
  (Playfair Display + Jost + a new script face, Pinyon Script, for the
  couple's names and nav logo initials only).
- New real features: a live countdown timer in the hero, a visible "We're
  Getting Married" eyebrow, a frosted-glass nav on scroll, a pill-styled
  RSVP nav link, a subtle scroll-scrubbed parallax on Our Story's photos,
  ghost-outline year numerals + gold milestone labels replacing the old
  timeline spine/marker, a recurring "❧" ornament divider under section
  headings, and the Invitation's restored "Together with their families"
  eyebrow line.
- What was explicitly **not** ported: the reference's fictional
  2018→2023 Story narrative (kept the real 2024→2027 Meesho timeline), its
  RSVP email field/relabeled buttons, and its fabricated Events specifics —
  all per the user's own corrections above.

**This took three follow-up rounds to actually land, and the lesson from
that is now a saved memory** (`feedback_systematic_reference_audit`):
repeated "background/foreground/gradient/spacing/padding doesn't match"
feedback meant real, findable gaps each time (a shared `--shadow-soft`
token never re-tinted from the old palette — probably the single biggest
cause, since it silently backs shadows everywhere; a gradient stop
literally misread — reference's `${color}55` is a hex-alpha suffix, not a
stop *position*; container widths/gaps/paddings approximated instead of
copied exactly; a real structural bug where padding on the wrong element
broke an absolutely-positioned decorative bar's alignment). **If the user
reports this kind of mismatch again, do a full value-by-value audit of the
reference source immediately — don't do another round of spot-fixes.**

### Part 4 — Doc/memory sync (this pass)

This rewrite, plus: two new memories saved
(`feedback_systematic_reference_audit`, `project_wedding_site_current_state`),
one existing memory extended (`feedback_mockup_first_workflow`, new clause
about external reference implementations skipping the internal-mockup
step), CLAUDE.md's Design System section already rewritten in full earlier
in the session to reflect Petal Blush (not appended — the old scrapbook
section's content was replaced), TODO.md kept current throughout via
incremental updates rather than done at the end, and PLAN.md's stale
"scrapbook" references and section-status table corrected in this pass.

---

## Do this first, next session

1. **Ask whether the `Code.gs` redeploy happened** (Part 1) — both the
   formula-injection fix *and* the secret rotation need the user to
   manually redeploy in the Apps Script editor; unconfirmed either way. If
   RSVPs still aren't reaching the Sheet, this is the first thing to check.
2. **If the user reports any further "doesn't match" feedback on the
   Petal Blush port, go straight to a systematic value-by-value audit of
   the reference source** (see `feedback_systematic_reference_audit`) —
   don't spot-fix again; three rounds of that already happened this
   session before it actually worked.
3. **`story-4.jpg`** (the "Coming Soon" 2027 milestone graphic) was
   designed for the old maroon scrapbook palette and now clashes with
   Petal Blush — flagged, not fixed. Needs a regrade or redesign pass.
4. **The six motion candidates and three theme explorations from Part 2
   are genuinely unresolved**, not rejected — if the user brings any of
   them up (Pop/Hip/Traditional/First-Light palettes, the full-bleed
   parallax band, drawn-in-ink ornaments, lit paper), they were explored
   and set aside when the Figma reference came in, not forgotten or
   declined. Ask before assuming Petal Blush is final if it comes up.
5. **The illustration micro-motif mockup** (heart/sprig ornament for
   FAQ/Guestbook, from a much earlier session) is likely fully stale now —
   it was scoped against the old scrapbook palette *and* against FAQ/
   Guestbook, both of which have since changed (new palette; FAQ/Guestbook
   are now hidden sections). Don't revive without re-confirming scope.
6. **Extending further design work to the now-hidden sections** (Gallery/
   Memories/Guestbook/Film/FAQ) doesn't apply until they're un-hidden —
   see TODO.md's "Blocked on user input" for the un-hide trigger.

## Where things live (quick pointers, full detail in CLAUDE.md)

- Palette/type tokens: `css/style.css` `:root` — "Petal Blush," see
  CLAUDE.md's Design System section for the full token table and history.
- Countdown timer: `initCountdown()` in `js/app.js`, markup in `index.html`
  `#hero-countdown`.
- Story ghost-year/parallax: `renderStory()` in `js/app.js` (markup),
  `.timeline-item__year`/`.ornament` in `css/components.css`,
  `initStoryParallax()` in `js/animations.js`.
- Events real data: `js/content.js` (`events` array, all `TBD`),
  `renderEvents()` in `js/app.js` (now wraps card content in
  `.event-card__body` — padding lives there, not on `.event-card` itself,
  so the top accent bar stays flush with the true edge).
- RSVP form + backend: `js/rsvp.js`, `js/utils.js` (`submitRSVP`),
  `scripts/google-apps-script/` (`Code.gs` + `SETUP.md`),
  `WEDDING_CONTENT.integrations` in `js/content.js`.
- The `.is-in-view` vs `.is-revealed` distinction (real gotcha, see Part 1):
  `js/animations.js`'s `revealNew()` and CLAUDE.md's scroll-reveal section.
- Caching convention: `?v=N` on every CSS/JS tag in `index.html` (now at
  `v=12`), plus `_headers` at the project root.
- Hidden sections (commented out, not deleted): Gallery/Memories/
  Guestbook/Film/FAQ blocks in `index.html`, clearly marked with HTML
  comments giving the removal date.
- Dev server: `.claude/launch.json` → `wedding-static-server` (port 4173).
  A second config, `figma-reference-site`, points at the external Figma
  Make export folder (port 5173) — only useful if that folder still
  exists at the path recorded there; ask the user if it's needed again.

## Artifacts published this session (all private to the user's account)

- Sealed coda mystery-motif mockup — confirmed and shipped:
  `https://claude.ai/code/artifact/50fe53f2-2f52-469b-843a-b53549d94212`
- Turning the Pages (original) + The Pressed Seal — Pressed Seal
  **confirmed and shipped**, Turning the Pages **superseded** by the next
  link below: `https://claude.ai/code/artifact/0323a40b-a0de-484c-90f9-a1c9cd66b1a6`
- Full-Bleed Band / Drawn-in-Ink / Lit Paper — explored, **not adopted**:
  `https://claude.ai/code/artifact/1e36f5d1-eb93-418f-8368-4cd74670b96e`
- The Story Writes Itself (reimagined Turning the Pages) — explored,
  **not built** (superseded by the Petal Blush port's own Story treatment):
  `https://claude.ai/code/artifact/f918d9c9-bd0f-4e22-aed7-410899f64eca`
- Pop/Hip/Traditional Indian swatch-and-type board — explored, **not
  adopted**: `https://claude.ai/code/artifact/f6151dfe-f418-4f48-92cb-293c368e7281`
- Pop Wedding full mockup and First Light full mockup — both built as
  local files, **neither was ever published/shown** (interrupted when the
  user pivoted to the Figma reference) — not linked since no live URL
  exists for either.
