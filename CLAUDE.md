# CLAUDE.md

Persistent project memory for Claude Code sessions on this repo. Read this file
fully at the start of every session — it survives context compaction; the
conversation history does not.

**At the start of every session, also read [PLAN.md](PLAN.md),
[TODO.md](TODO.md), and [HANDOFF.md](HANDOFF.md) in full.** PLAN.md is the
phased roadmap (rarely changes). TODO.md is the live checklist of what's done,
in progress, and blocked (changes often — update it as you go, don't just
append). HANDOFF.md is a **snapshot of the most recent session** — what got
done, key decisions and why, bugs fixed, and what to do first next — written
so a brand-new session can get oriented from that one file alone.

**At the end of a session** (or when context is running low, or the user asks
for a handoff), **rewrite HANDOFF.md in full** to reflect the session that
just happened. It's a snapshot, not a running log — replace the previous
content, don't append to it. Also update TODO.md's status at the same time so
the two stay consistent with each other.

**Keep all four docs (this file, PLAN.md, TODO.md, HANDOFF.md) in sync as you
go, not just at session end.** When something meaningful happens mid-session,
update the doc(s) it touches immediately, right after the work:
- Finish or unblock a TODO item → check it off / move it in TODO.md.
- Make a real design or architecture decision → log it in this file
  (Architecture patterns / Design system / Rejected directions) or in
  PLAN.md's status table, whichever it affects.
- Find and fix a bug worth remembering → add it to CLAUDE.md's gotchas if
  it's a pattern that could recur, and note it under TODO.md's "Done".
- A section's roadmap status changes → update PLAN.md's status table.

Treat this as part of finishing the work, the same way you'd expect tests
updated alongside a code change — not a separate cleanup pass to defer.

## What this is

A wedding website for Naisargi & Anubhav, February 24 2027, Vadodara, Gujarat.
Single-page scrolling site, static frontend, with one real backend
integration so far (RSVP → Google Sheet, see Architecture patterns below);
everything else is still `MockAPI`/localStorage.

⚠️ **The site is already being shared with real guests (confirmed
2026-07-18), well before it's finished.** This isn't a private dev sandbox
anymore — treat live-site changes with the care that implies (verify before
calling something done, don't ship visibly broken states even temporarily).
It also explains a real design decision: sections that aren't finished yet
get **contextual, in-place "more is coming" framing** (see the Design
system section's "more is coming" notes), not a site-wide "under
construction" banner — a guest today should feel like they're seeing a
warm, living site that grows as the wedding approaches, not a work in
progress.

## Design workflow (mandatory)

Any UI/UX, visual design, or design-system related request or change — a new
feature's UX, a redesign, a color/typography/emotion assessment, "make this
more appealing/immersive" — **must go through the `design-lead` subagent**
(`.claude/agents/design-lead.md`), not be decided unilaterally. Invoke it
**before implementation** on any new feature or visual change, to define the
UX/UI requirements engineers should build to.

**Design-lead is not re-invoked after implementation (changed 2026-07-17 at
the user's explicit request).** It acts as a creative visual, illustrator,
animator, and UI/UX design specialist: it gives direction and a build-ready
spec once, and that engagement is done. Engineering (the main agent) owns
fidelity to that spec from there — verify the built result against the spec
yourself (the `verify` skill and the browser-preview verification workflow
are the right tools for this), rather than looping design-lead back in as a
second reviewer. Engineering still doesn't make independent design/UX calls
that aren't in the spec; if something the spec didn't anticipate comes up
during implementation, that's a new design question and goes back through
design-lead as a fresh, scoped ask — not a general post-hoc review pass.

Engineering implements what design-lead specifies. If a request is ambiguous
about whether it's a "design" question, err toward invoking design-lead —
the cost of asking is low, the cost of skipping it and shipping something
the user has to redirect is high.

**Mockup first, confirm, then implement (mandatory, added 2026-07-17 after
the user explicitly asked for this process).** For any design iteration —
a new visual direction, a redesign, a theme change — build a mockup first
(a Claude Artifact; see the existing GSAP-in-Artifacts CDN-blocked caveat
below) and get the user's explicit confirmation on it **before** touching
`index.html`/`css/*.css`/`js/*.js`. Do not implement a design change
directly into the real site on the first pass, even if the direction seems
obviously right or was already discussed.

## Tech stack constraints (do not deviate without asking)

- Vanilla HTML5 / CSS3 / JavaScript only. No React, Angular, Vue, or any build
  step. Files are served as-is.
- GSAP + ScrollTrigger, Lenis (smooth scroll), Lucide (icons) — all loaded via
  CDN `<script>` tags in `index.html`. This is fine for the real site (normal
  CSP). It is **not** fine inside a Claude Artifact mockup — Artifacts block
  external CDN requests entirely, so any animation mockup built as an Artifact
  must use plain CSS `@keyframes`/vanilla JS instead of GSAP.
- Mobile-first CSS. Base rules in `style.css`/`components.css` target phones;
  `responsive.css` layers on tablet (`≥768px`) and desktop (`≥1024px`)
  enhancements.

## File map

```
index.html              All 10 sections, semantic HTML, SEO/OG/JSON-LD meta
css/style.css           Design tokens (:root vars), reset, typography, layout primitives
css/components.css      Section-specific styles (hero, cards, RSVP, gallery, etc.)
css/responsive.css      Tablet/desktop breakpoint overrides
css/animations.css      [data-reveal] contract + keyframes
js/content.js           Single source of truth for copy/dates/events/guests
js/utils.js             Helpers + MockAPI (localStorage-backed fake backend)
js/navigation.js        Sticky header, mobile menu, active-link highlighting
js/animations.js        Lenis init + scroll-reveal system (see gotcha below)
js/rsvp.js              Conversational RSVP flow (branching question state machine)
js/gallery.js           Official gallery (locked/unlocked) + guest memories feed
js/app.js               Orchestrator: renders Story/Events/FAQ/Film/Guestbook, boots other modules
assets/images/          Real photos + placeholder SVGs (see Asset inventory below)
```

## Architecture patterns

**`content.js` is the single source of truth** for couple names, wedding
date/city, events, story milestones, FAQs, guestbook seed, and the mock guest
directory. Exception: the hero `<h1>` and meta/OG/JSON-LD tags hardcode the
real names/date directly in `index.html` for SEO and no-JS rendering — if you
change the couple's details, update both `content.js` and those hardcoded
spots in `index.html`.

**`MockAPI` in `utils.js`** mirrors the real backend API shape the project
will eventually need (`GET /invite/:guestId`, `POST /rsvp`, `GET /events`,
`GET /gallery`, `POST /memories`, etc.), backed by `localStorage` with a
simulated ~400ms network delay. When a real backend exists, only this file's
function bodies change — every caller already awaits these like real network
calls.

**`MockAPI.submitRSVP` is a partial exception to the above (2026-07-18)** —
it's no longer purely mock. It always writes to `localStorage` first (so the
RSVP form's "need to change something?" resume flow has something to read),
then additionally POSTs to a **Google Apps Script Web App** bound to a
Google Sheet in the couple's Drive, when `WEDDING_CONTENT.integrations.
rsvpEndpoint` is configured — see `scripts/google-apps-script/SETUP.md` for
the (manual, one-time, user-only) setup and `Code.gs` for the script that
receives the POST and appends a row. Uses `Content-Type: text/plain` to
avoid a CORS preflight, which Apps Script Web Apps don't handle; if that
still hits CORS trouble in practice, SETUP.md documents the `no-cors`
fallback (fire-and-forget, no readable response). A shared secret travels
in the payload as a spam deterrent — **not real security**, since anything
in this site's client-side JS is publicly readable; don't treat the sheet
as access-controlled.

**RSVP form gained an `arrivalPlan` field + a stay-reassurance note,
2026-07-20** (a deliberate, user-requested reopening of the "RSVP form
fields stay exactly as they were" lock recorded in the Design System
section below — see that note for why the lock existed in the first
place; this is a scoped, explicit exception to it, not a reversal).
`js/rsvp.js`: a new optional free-text input ("When do you think you'll
arrive?", id `rsvp-arrival`) sits directly after the guest-count stepper,
followed by a quiet `.rsvp-stay-note` aside ("Coming from out of town?
Your stay is taken care of — we'll share the details soon.", Lucide
`bed-double` icon). Both are wrapped in the same `.guest-count-group`
class as the stepper and collapse/reveal together via a new
`yesOnlyGroups` array in `wireForm()` — before this, only the stepper
had that behavior; now the toggle logic loops over all three so a
future fourth "yes-only" field just needs to join the array. The field
is deliberately plain text, not a date picker — the value is explicitly
tentative, and a real date control would misrepresent a soft signal as
a hard one. `arrivalPlan` flows into the submit payload the same way
every other field does, which means it also flows into the Google Sheet
POST via `MockAPI.submitRSVP` — **but `Code.gs` (the receiving Apps
Script) needed a matching update** (added `'Arrival Plan'` to `HEADERS`
and the `appendRow` call, positioned between Guest Count and Phone) and
that file only runs after the couple manually redeploys it in
script.google.com — a code change here does **not** ship itself the way
the rest of the site does. Flag this to the user explicitly whenever
`Code.gs` changes: the live Sheet won't get the new column until they
redeploy. New submissions before that redeploy will still work (Apps
Script ignores unmapped payload keys) — they just silently won't be
captured in the sheet, so tell the user before they rely on it.

**Guest personalization**: reads `?guest=<id>` from the URL, looks up
`WEDDING_CONTENT.guests` in `content.js`, and populates `[data-guest-name]`
elements + `window.currentGuest`. This is the stand-in for real invite tokens.

**`scripts/grade-candid-photo.py`** (added 2026-07-18, Python + Pillow) is the
reusable recipe for turning a real candid phone photo into something that
belongs next to the site's warm paper/ink palette: crop to 4:3 (per-photo box,
keep every subject fully in frame, sacrifice background before a subject),
resize to a 1000x750 master, a fixed warm white-balance/contrast/saturation
grade, a 6% wash toward `--color-bg-raised`, and a subtle warm-biased
vignette — then export as a compressed, EXIF-stripped JPEG under ~160KB. The
grade steps are deliberately constant across photos so a growing photo set
reads as one graded family; the only per-photo knobs are the crop box and,
for very differently-lit source photos, `--blue-factor` (lower for
cooler/fluorescent-lit sources, higher for already-warm tungsten/sunset
sources). Framing/mat/shadow/tilt are deliberately CSS concerns, not baked
into the image — see the `.invitation-card` precedent for how paper-object
framing is done at the CSS layer. First used on `story-1.jpg`.

**Scroll-reveal system (`animations.js`)** — ⚠️ real gotcha, already bit us
once: elements with `data-reveal` fade in via GSAP ScrollTrigger, set up once
in `Animations.init()` by scanning the DOM. **Any content rendered
asynchronously after that scan runs (gallery lock state, guest memory cards —
both wait on `MockAPI`'s fake latency) never gets picked up and stays stuck at
`opacity: 0` forever**, unless the code that inserts it calls
`Animations.revealNew()` afterward. `Animations.revealNew()` is idempotent
(guards via an `.is-revealed` class) so it's safe to call repeatedly — call it
after inserting *any* new `[data-reveal]` content, not just on first load
(e.g. infinite-scroll pagination, filter changes that add new cards).

⚠️ **A second, easy-to-repeat gotcha found 2026-07-18 building "the pressed
seal" motion**: `.is-revealed` is added to *every* `[data-reveal]` element
immediately/synchronously when `revealNew()` runs — it's purely a
re-processing guard, not a signal that the element has actually scrolled
into view (the real reveal is a separate GSAP tween deferred by its own
ScrollTrigger). CSS or JS that needs to key off the element *actually
becoming visible on screen* (e.g. a child animation that should play when
its parent card enters the viewport, not at page load) must use
`.is-in-view` instead — added inside the tween's `onStart` callback, which
only fires when ScrollTrigger's condition is actually met. Getting this
wrong is silent and easy to miss: the mis-keyed animation still plays and
completes correctly, just off-screen within ~1s of page load, so it looks
totally fine in a DOM/computed-style check and only reveals itself as
broken when a human actually scrolls down expecting to see it happen.

**Hero load-in sequence (`initHeroSequence()` in `animations.js`)**: as of
the 2026-07-17 exhibition rebuild, the photo is unveiled first —
`.hero__photo-frame` settles into place → names (`h1`) fade up → date → CTA.
This order matches the confirmed "exhibition" rule (see Design system below):
the photo is the one dominant visual and is seen before its placard. This is
separate from the generic `[data-reveal]` system since the hero is always in
view on load (no scroll trigger needed). The general principle from the
reveal-system gotcha above applies here too, just with a different failure
mode: every element this animates FROM a hidden/offset CSS state (set in
`components.css` under "Load-in sequence") **must** have a matching
instant-reveal path in `initHeroSequence()`'s `revealInstantly()` fallback
(used when GSAP fails to load, or `prefers-reduced-motion` is set) —
otherwise that state strands the element invisible forever. If you add a new
animated element to this sequence, add it to both the CSS initial-state
rules, the GSAP timeline, and the `revealInstantly()` list — all three, not
just one or two.

**Sticker-outline photo effect** (currently unused, but documented since it
may be reused for future real photos elsewhere on the site, e.g. Our Story):
the "cutout with hand-drawn marker outline" look is a stack of ~8 small
`drop-shadow()` filters in a ring around a transparent PNG, plus one soft
shadow for depth. ⚠️ **Keep the shadow count small (~8, not 16) and the
displayed image modestly sized (~130–200px tall)** — a heavier version (16
shadows on full-resolution source images) hung the browser renderer during
testing. This technique is **no longer used in the hero** — the hero was
rebuilt around a single finished photo asset (see Design system below) that
already has its own die-cut outline baked into the image, so the live
drop-shadow-ring CSS was removed from `.hero__feature-photo`.

**Caching gotcha, and the permanent fix (superseded the old workflow,
2026-07-18)**: the local dev server (`python3 -m http.server`, via
`.claude/launch.json` → `wedding-static-server`) sends no cache-control
headers at all, and browsers cache CSS/JS from it extremely aggressively —
a plain reload, and even opening a **brand-new tab**, can keep serving a
stale file indefinitely, with no console error to signal it. This isn't
just a local annoyance: it's the same failure mode a real guest could hit
post-deployment if the couple ever pushes an update after launch (a fixed
venue address, the gallery unlocking after the wedding) — most static
hosts don't fully solve this out of the box either, unless their headers
are explicitly configured.

The fix, now permanent and baked into the site itself rather than a
temporary testing step: **every local CSS/JS `<link>`/`<script>` tag in
`index.html` carries a `?v=N` query string** (all sharing the same number
right now — `?v=1`). **Whenever you change any CSS or JS file, bump every
one of these `?v=N` values together, by the same increment, and leave the
bump in place — don't strip it back out.** A shared version number is
deliberate: cache-busting only the one file you most recently touched
while leaving others at an old version serves a broken *mix* of old and
new code (see the 2026-07-18 incident below) — bumping them all together
every time removes that failure mode entirely. This also means the site
never ships with stale assets to a returning guest after a real update,
independent of whatever the eventual host's own cache headers do.
Reassigning `.href`/`.src` on already-loaded DOM nodes via a JS snippet
works live for `<link>` stylesheets but does **not** reliably re-fetch/
re-execute already-run `<script>` tags — the query string has to be in the
HTML source before the page loads for scripts, so this must be a real file
edit, not a live console patch.

This is a **baseline**, not a replacement for proper `Cache-Control`
headers at the hosting layer once Step 10 (deployment) happens — see
PLAN.md's Backend/Deployment notes. The version-query-string convention
works on any host with zero configuration; real headers (e.g. a host's
`_headers` file) are the more robust fix and still worth setting up
wherever the site ends up hosted.

⚠️ **The mixed-staleness failure mode bit twice in one verification
session (2026-07-18, RSVP form rebuild)**, before this permanent
convention existed, in a way worth remembering even though the fix above
prevents it going forward: cache-busting **one** changed file while
leaving **another** changed file un-busted served a broken mix — e.g.
fresh `rsvp.js` (new form markup) paired with stale `components.css`
produced a real-looking bug, `.field-error` elements stuck visible with no
`has-error` class present. This is exactly why the `?v=N` bump must apply
to *every* asset tag together, every time, not just the one file that
changed.

⚠️ **RETRACTED, 2026-07-19**: earlier the same day this doc claimed a
recurring "RSVP stuck under the header" report across multiple sessions
was a Browser-preview-pane screenshot-compositing glitch, not a real
site bug — that diagnosis was wrong. It **is a real, reproducible CSS
bug**, root-caused and fixed the same day; see the `.site-header::before`
gotcha below. The original DOM check that seemed to clear it only
checked at `scrollY: 0` before `.site-header--scrolled` had ever
activated, which is exactly the one state the bug doesn't occur in — a
false negative, not proof of a screenshot artifact. Given this, the
*other* historical "compositing glitch" mentions in TODO.md
(2026-07-18 onward) were quite possibly this same bug misdiagnosed each
time, not a tool artifact — if something like this comes up again,
root-cause it with `getComputedStyle()`/`getBoundingClientRect()` in the
*actual* triggering state (scrolled, menu state, etc.) before reaching
for "the screenshot tool glitched," which turned out to be the wrong
default assumption here.

⚠️ **`backdrop-filter` on `.site-header` broke the mobile nav's hidden
state — fixed 2026-07-19, root cause worth knowing if this pattern comes
up elsewhere.** `backdrop-filter` (like `transform`/`filter`/
`will-change`) makes the element it's set on a new **containing block**
for any `position: fixed` descendants. `.site-nav` (the mobile
full-screen menu, `position: fixed; inset: 0`) is nested inside
`.site-header`, and `.site-header--scrolled` had `backdrop-filter:
blur(12px)` directly on `.site-header` itself — so once a guest scrolled
past the 40px threshold, `.site-nav`'s `inset: 0` started resolving
against `.site-header`'s own ~69px-tall box instead of the viewport.
Its `translateY(-100%)` "hidden" transform then only moved it up by
that wrongly-short height, leaving the bottom of the centered nav (the
rose "RSVP" pill) visibly peeking out from under the header, at every
scroll position, on every page load past the scroll threshold — this is
what the two retracted "compositing glitch" write-ups above were
actually seeing. **Fix**: moved the frosted-glass fill (`background-
color`, `backdrop-filter`, `box-shadow`) off `.site-header` itself and
onto a `.site-header::before` pseudo-element instead. A pseudo-element
isn't a real DOM ancestor of `.site-nav`, so it can't become its
containing block — `.site-header` stays "clean" and `.site-nav`'s fixed
positioning resolves against the true viewport again. Verified: mobile
nav overlay now measures the full viewport height and translates fully
off-screen in both the pre-scroll and post-scroll (`.site-header--
scrolled`) states; desktop nav layout and the frosted-glass visual are
unchanged. **The general lesson**: any future `backdrop-filter`/
`filter`/`transform` added to an element that contains a `position:
fixed` descendant needs the same pseudo-element (or DOM-sibling)
treatment — putting it directly on the ancestor will silently break
that descendant's fixed positioning the same way.

⚠️ **A second, compounding bug, found and fixed the same day (2026-07-19)
while verifying the fix above on mobile**: the hero's atmospheric blur
"blobs" (`.hero::before`/`::after`) are deliberately positioned with
negative offsets (`left: -8%`, `right: -10%`) to bleed off the section's
edge for atmosphere, but `.hero` had no `overflow: hidden` to contain
that bleed. Result: real, measurable horizontal page overflow — 38px at
a 375px viewport (confirmed via `documentElement.scrollWidth` 413 vs
`clientWidth` 375). `body` already had `overflow-x: hidden` (see the
reset rules near the top of `style.css`), but that alone doesn't
reliably stop document-level horizontal overflow — `html` is the
element that actually controls it in most engines, and `html` had no
overflow rule at all. Because `.site-header` is `position: fixed`, its
containing block picked up that overflowed width too, so the header
rendered ~38px wider than the true viewport — which is what made the
logo/nav look shifted/doubled in screenshots at every scroll position,
not just near the hero. **Two-part fix**: added `overflow: hidden` to
`.hero` itself (contains the actual bleed at its source) and
`overflow-x: hidden` to `html` (global safety net, matching the existing
`body` rule, so any *future* bleeding decorative element doesn't
reintroduce this class of bug). Verified post-fix at 375px:
`documentElement.scrollWidth` now equals `clientWidth` exactly (375),
`.site-header` measures the correct 375px, hero photo/shadow/gradient
render unclipped, desktop layout unaffected.

## Design system — current direction: "Petal Blush" (romantic rose/gold)

**Superseded the "scrapbook" rust-paper palette on 2026-07-19.** The user
commissioned a full Figma Make replica of the site in a new romantic
rose/blush/gold direction (source: the folder shared as "Wedding Website
Color Palette-2" — kept locally by the user, not checked into this repo)
and asked for the real site to be brought in line with it, with two
explicit, non-negotiable corrections vs. that reference: (1) the RSVP
form's fields stay exactly as they already were on the real site (Name /
Will you attend yes-no / guest-count stepper / optional phone / optional
message) — no email field, no "Joyfully accepts / Regretfully declines"
relabeling; (2) Events stays the real 4-event list (Mehendi, Sangeet &
Cocktails, Haldi, Wedding) with every date/venue/dress-code field honestly
`TBD`, not the reference's fabricated 4-event list (with a "Reception"
instead of Haldi) and invented specific dates/venues/dress codes. Both of
those were deliberately NOT ported. This is not a reversion of the
"scrapbook" pivot's own reasoning (paper/warmth over premium-editorial
minimalism) — it's a second, later palette pivot on top of that decision,
this time toward romance/rose rather than paper/rust. Don't revert to
rust-paper without being asked, same as scrapbook itself was never reverted
to premium-editorial.

Current palette/tokens (in `css/style.css` `:root`):
- `--color-bg: #fdf6f0` (ivory), `--color-bg-raised: #fff8f4` (card)
- `--color-text: #3b2a24` (deep warm brown ink), `--color-text-secondary: #6b4c44`
- `--color-accent: #8b3a52` ("Bridal Rose") — the base accent, used everywhere
  headings/links/icons need color
- `--color-accent-deep: #5c3040` / `--color-accent-deep-hover: #6d3a4d` /
  `--color-on-accent-deep: #fff8f4` — the **festive peak role**, same
  purpose as before (kept through both palette pivots): the hero's primary
  CTA (`.btn--festive`), RSVP's submit button, and full-bleed/deep-background
  moments. Value changed from the old maroon `#6e2a2f` to the new plum
  `#5c3040` to match Petal Blush's rose family.
- `--color-gold: #c9935a` ("Champagne Gold") — still a **micro-accent only**
  (hairline rules, the Events card top accent bar's gradient partner). Never
  used as a fill.
- **New tokens this palette added, no equivalent existed before**:
  `--color-blush: #f2c4ce` (decorative washes — hero's radial glow blobs,
  the Invitation card's washi tape), `--color-mauve: #c4879a` (the hero
  eyebrow, countdown separators, ghost-year ink-only stroke color — a
  distinct secondary-accent role from `--color-text-secondary`),
  `--color-peach: #f5c4a0` (hero's second decorative blob only).
- `--paper-grain: none`. The grain texture asset (`assets/images/
  paper-grain.svg`) is **kept on disk but no longer applied** — Petal Blush
  is a clean flat/gradient look with no paper texture, matching the Figma
  reference exactly. Every consumer of `--paper-grain` (`body`,
  `.section--alt`) still works unchanged: the token just resolves to an
  inert `none` background-image layer now, so no call sites needed editing.
- `--shadow-soft`: unchanged in structure, still a visible two-layer shadow;
  only the tinted colors inside individual shadow/glow declarations across
  `components.css` were re-tinted from the old rust rgba values to the new
  rose/plum ones (e.g. `rgba(156,82,48,...)` → `rgba(139,58,82,...)`).
- **Typography, changed fonts entirely**: `--font-heading` is now Playfair
  Display (was Cormorant Garamond), `--font-body` is now Jost (was Inter),
  and a **new third face**, `--font-script` (Pinyon Script), was added
  specifically for the couple's names — used at the hero H1, the site
  logo/footer names, `.eyebrow` (Our Journey / Schedule / Save us the
  honour), and nowhere else (it's a display-only face, never used for
  anything read at length). Correction, 2026-07-19: this doc previously
  claimed `.eyebrow` used italic Playfair instead of script "for
  legibility" — that was never actually true in the shipped CSS (`.eyebrow`
  has always been `--font-script`); the note was aspirational/stale and is
  removed here rather than perpetuated.
- **Site-wide heading weight, 2026-07-19**: `h1,h2,h3,h4` moved from
  semibold (600, with `-0.01em` tracking) to regular (400, no tracking)
  everywhere, to match the Figma reference's consistently light Playfair
  treatment — see the design-lead spec in that day's session for the full
  before/after table. A new `--color-text-muted` token (`#8a6a5e`, a
  WCAG-AA-corrected value — the reference's own `#9c7c70` fails AA at the
  micro-label sizes it's used on) was added for the tertiary-ink role
  (hero city/countdown labels, event detail labels, footer note, RSVP
  change-link, "(optional)" tags). **One same-day, explicit user-directed
  exception to the new regular-weight rule**: the hero H1 (couple's names)
  now has `color: var(--color-accent)` explicitly set — it had no explicit
  color before this and was inheriting `--color-text` brown; `.eyebrow`'s
  color was already correct. Both were briefly also set to `font-weight:
  700` the same day (a **browser-synthesized/faux bold**, since Pinyon
  Script only ships one static weight) but that was reverted back to 400
  a few hours later at the user's request — color stayed, weight didn't.
  If bold is ever wanted here again, remember it'll be faux-bold on this
  typeface, not a true bold cut.
- **Hero CTA copy + a new caption, 2026-07-19**: the button changed from
  "Celebrate With Us" to a plain "RSVP", with a new small italic line,
  `.hero__cta-caption`, underneath it to recover the warmth the longer
  button copy used to carry. Styled after the same "warm italic Playfair
  aside" voice as `.invitation-card__line`. Wired into the hero load-in
  sequence per the gotcha above. **Copy corrected 2026-07-20**: the
  original line, "Let us know you'll be there," read as an instruction
  aimed at the guest (a task, not a welcome) and the user flagged it as
  rude. Replaced with **"We can't wait to celebrate with you."** —
  expresses the couple's own feeling instead of directing the guest's
  action, and happens to already match the existing voice of the RSVP
  success message in `js/rsvp.js` ("We can't wait to celebrate with you,
  {name}..."), so the two now reinforce each other rather than
  coincidentally overlapping.
- **Event card "TBD" consistency fix, 2026-07-19**: the literal string
  `TBD` was rendering three different ways in the same card (the dress-code
  badge in mauve, the datetime line in bold rose, the venue value in bold
  brown) — flagged as inconsistent. `js/app.js`'s `renderEvents()` now
  conditionally adds an `.is-tbd` class to each of those three elements
  only when the underlying value is literally `'TBD'`; a shared CSS rule in
  `components.css` renders all three identically (`--color-text-muted`,
  italic, weight 400) while that class is present. Once real dates/venues
  replace `'TBD'` in `content.js`, the class stops being added and each
  element automatically reverts to its original distinct styling (bold
  rose datetime, bold brown venue, mauve badge) — no follow-up code change
  needed when the real details land.
- **Real event dates landed, 2026-07-20** — the first real details to
  replace a `TBD`, and the first case the "no follow-up needed" claim
  above didn't fully hold: `content.js`'s four events now have real
  `date` values (Mehendi & Sangeet: February 23, 2027; Haldi & Wedding:
  February 24, 2027), while `time`, `venue`, and `dressCode` all stay
  `'TBD'` — still genuinely unknown. This created a **partial** TBD state
  the original all-or-nothing `isTbdDatetime` check couldn't express: it
  only knew "both date and time are TBD" vs. "neither is," so a known
  date next to an unknown time would have rendered as the confusing
  literal string "February 23, 2027 · TBD". `renderEvents()` now branches
  on `dateKnown`/`timeKnown` independently and wraps only the *unknown*
  half in an inline `<span class="is-tbd">time to be announced</span>`
  (lowercase, reads as a continuation of the date rather than a shout);
  the CSS rule that used to target `.event-card__datetime.is-tbd` as a
  compound class on the whole `<p>` was changed to the descendant
  selector `.event-card__datetime .is-tbd` so it reaches that inner span
  instead. Separately, the raw `'TBD'` sentinel shown to guests for the
  dress-code badge and venue was upgraded to the friendlier "To be
  announced" via a `revealLabel()` display-mapping helper in
  `renderEvents()` — the underlying data value is still the bare string
  `'TBD'` (so the `=== 'TBD'` conditionals driving `.is-tbd` still work
  unchanged), only what's *displayed* to guests changed. When time/venue/
  dress-code eventually get real values too, no further code change is
  needed — same self-cleaning behavior as before, just now correct for
  mixed known/unknown states too.
- **Event names finalized + time-of-day added, same day (2026-07-20)**:
  `content.js` event names are now Mehendi, **Sangeet Night** (was
  "Sangeet & Cocktails"), **Haldi Holi** (was "Haldi"), and **The
  Wedding** (was "Wedding"). Also added a new `timeOfDay` field
  (`'Morning'` for Mehendi/Haldi, `'Night'` for Sangeet/Wedding) — the
  couple knows which half of the day each function falls in well before
  they'll have an exact clock time, and that's real, useful information
  for a guest planning travel, so it shouldn't wait behind the exact-time
  TBD. `renderEvents()`'s date-known/time-unknown branch (see the note
  above) now checks for `event.timeOfDay` first and, when present, renders
  `"{date} · {timeOfDay} — exact time to be announced"` instead of the
  plainer `"{date} · time to be announced"` — only the still-unknown
  "exact time" fragment is muted; the date and time-of-day both render at
  full confirmed weight since both are real. Falls back to the old
  wording automatically for any event without a `timeOfDay` set. Also
  fixed a factual inconsistency this surfaced: Mehendi's description
  said "an evening of celebration" while the actual function is a
  morning one — corrected to "a morning of celebration."
- **Header logo (`.site-logo`) switched from script to serif, 2026-07-20**
  — the user flagged the "N & A" header wordmark as illegible, and it was:
  Pinyon Script (`--font-script`) depends on a run of joined letters and
  word context to read cleanly, and three isolated glyphs ("N", "&", "A")
  with no such context made the ampersand's loops blur into the adjacent
  caps at any header-appropriate size — this isn't a pixel-size problem,
  it's structural to using a connecting script face for a short
  abbreviation. Switched to `--font-heading` (Playfair Display, already
  the site's heading voice) at `1.375rem`/500 weight/`0.08em`
  letter-spacing/`line-height: 1`, plus a `color-deep` hover/focus state.
  Content stays literal `N & A` (keep the spaces around the ampersand —
  combined with the tracking they're what makes it read as a deliberate
  mark rather than a clump). This deliberately diverges from the hero H1
  and footer signature, which correctly keep Pinyon Script — those are
  full-name display moments at true display scale where a connecting
  script has the context to work; the header logo is a small
  always-visible nav anchor optimizing for instant recognition, a
  different job. Verified: weight 500 was already in the Google Fonts
  `@import` (no font-load change needed); logo measures perfectly
  vertically centered in both the tall (~93px) and scrolled/frosted
  (~62px) header states despite Playfair's different vertical metrics
  from Pinyon Script.
- **Invitation card copy + RSVP arrival label, several revisions,
  2026-07-20 — current final state.** The card went through three passes
  the same day before landing: first only `.invitation-card__line`
  changed ("come celebrate the start of our forever" → "we'd love
  nothing more than to have you there"), keeping "You're Invited" and
  "Together with their families". Second pass fixed a real voice bug the
  user caught — the site is written in first person throughout (hero
  "We're Getting Married", footer "our friends and family", RSVP success
  "we can't wait to celebrate with you"), but the eyebrow said "**their**
  families," a third-person slip. Third pass, the user supplied the
  entire card's final copy directly, superseding both prior passes:
  - `.invitation-card__eyebrow`: **"A little note from us"**
  - `.invitation-card__title` (h2): **"We'd Love You to Be There"**
  - `.invitation-card__line`: **"Because celebrations are better with
    the people we love."**

  This does reverse the earlier design-lead read that "You're Invited"
  was the strongest possible heading and shouldn't move — that call was
  correct *given* the second-person-address convention, but the user's
  explicit priority (first-person voice, consistent with the rest of the
  site) outranks it, and "We'd Love You to Be There" satisfies both (first
  person *and* still addressed to the guest). Don't revert to "You're
  Invited" thinking it's restoring a better version — this was a
  deliberate, direct, final instruction. The longer heading wraps to two
  lines within the card's 440px max-width/2.5rem padding, which reads
  fine (still one placard utterance, not two) — verified at both desktop
  and 375px mobile width, no CSS changes were needed.

  Separately, the RSVP arrival-plan field label went through its own two
  revisions the same day: "When do you think you'll arrive?" → "When are
  you hoping to arrive?" → **current final copy: "When can we expect to
  welcome you?"** (user's explicit direction), which frames the field as
  the couple anticipating the guest rather than asking the guest to
  report their plans.

  General pattern worth remembering for future copy requests on this
  site: check whether the flagged phrase is actually the problem, or
  whether the issue is in an adjacent line (the first `.invitation-card__
  line` pass fixed the wrong line's tone, not wrong exactly, but the
  eyebrow bug was the more substantive catch) — diagnose the specific
  voice/person issue before rewriting. And when a design-lead
  recommendation and a later, more specific explicit user instruction
  conflict, the explicit instruction wins — design-lead specs are a
  starting point for engineering judgment calls, not a lock against the
  user's own direct, final word.
- **Section headers simplified to one label + restyled to match the hero
  name, 2026-07-20.** Story/Events/RSVP used to stack a small script
  eyebrow above a separate Playfair `<h2>` (e.g. "Our Journey" +
  "Our Story") — flagged as redundant. Removed the eyebrow `<span>` from
  all three, keeping one `<h2>` each: Story → "Our Story", Events →
  "Events", **RSVP → "Save us the honour"** (the eyebrow's text became
  the heading; "RSVP" was dropped deliberately since it already appears
  in the nav link and hero CTA — "Save us the honour" was the more
  distinctive phrase worth being this section's one label). The
  `id`/`aria-labelledby` pairing was preserved on the surviving `<h2>`
  in each case, not left dangling. Same day, added `.section-heading h2
  { font-family: var(--font-script); color: var(--color-accent); }` to
  `style.css` — these three headings now render in Pinyon Script/rose
  like "Naisargi & Anubhav" in the hero, instead of plain Playfair
  brown. Scoped to `.section-heading h2` only, so the Invitation card's
  heading (`.invitation-card__title`, a different class) is unaffected.
  This also silently applies to the still-hidden Gallery/Memories/
  Guestbook/FAQ sections, which share the same template — dormant until
  those return, no action needed then. Also updated Events' subtitle:
  "Everything you need to join us for each celebration." → "...We
  cannot wait to share these moments with you."
- Accent motifs (thread lines + heart SVG) that used to be the hero's
  signature "one bold moment" remain **retired** — the hero still leans on
  the single finished focal photo asset (see Architecture patterns / Hero
  below), now sitting on the new blush/peach gradient + blob atmosphere
  instead of flat paper. Don't re-add the thread/heart motif next to that
  image, same reasoning as before.
- **New features added alongside the palette, not purely cosmetic**: a live
  countdown timer in the hero (`#hero-countdown`, updated every second by
  `initCountdown()` in `js/app.js`, target `2027-02-24T18:00:00+05:30` —
  same instant as the JSON-LD `startDate`), a visible hero eyebrow ("We're
  Getting Married," replacing the old `visually-hidden` version), a pill-
  styled RSVP link in the desktop nav (`.site-nav__cta`, desktop-only via
  `responsive.css`), a frosted-glass nav background on scroll (was a flat
  `--color-bg` fill), and Our Story's timeline dropped its central spine +
  floating year marker for a large ghost-outline year number
  (`-webkit-text-stroke`, WebKit/Blink-only — same technique and same
  limitation as the Figma reference itself) plus a small gold caption label
  per milestone (new `label` field on each `content.js` story entry: "The
  Beginning," "Made It Official," "She Said Yes," "Forever Starts Here").
  All new hero elements (eyebrow, countdown, and — as of 2026-07-19 — the
  CTA caption below) were added to `initHeroSequence()`'s GSAP timeline
  **and** its `revealInstantly()` fallback in `js/animations.js` — see that function's existing gotcha
  about every animated hero element needing both.
- **Known follow-up, not yet addressed**: `story-4.jpg` (the "Coming Soon"
  graphic for the 2027 milestone) was designed against the old rust/maroon
  scrapbook palette and now visually clashes with Petal Blush's rose tones.
  Left as-is for this pass since it's a content asset, not a token — flag
  for a redesign or regrade pass later, tracked in TODO.md.

**The governing layout rule — "exhibition," confirmed 2026-07-17.** After
exploring four broad creative directions (Editorial, Gallery, Cinema,
Journey — see that session's HANDOFF.md), the user converged on a specific,
precise rule that now governs every screen, thinking backwards from
`wedding-childhood-pic.jpg` as the site's fixed focal point:

- **One dominant visual** per screen — carries ~50-65% of the visual weight.
  No second image/visual of comparable weight on the same screen.
- **One text "placard"** — a title plus at most one caption, readable in a
  single breath (e.g. the hero's names + date is ONE placard, not two — it's
  one utterance, "who + when"). A section eyebrow *and* heading *and* a
  framing sub-sentence *and* a body paragraph is multiple units and violates
  this.
- **One intentional action, if any** — zero is the default and is *correct*
  for contemplative screens (Story, Gallery-locked, Footer). Only Hero and
  RSVP genuinely need an action.
- **Generous negative space** — ≥35% of the viewport stays empty paper.

This is implemented in the hero now: the photo is unveiled first (dominant
visual), the names+date is one placard, the CTA is the one action. Two
things were *removed* to make room for it — the stacked paper-card that used
to sit behind the photo (`.hero__photo-frame::before`, now deleted — it was
a second frame competing with the die-cut card's own baked-in border), and
the oversized H1 (was up to 96px via `--fs-hero`, now `clamp(2.5rem, 6vw,
4rem)` so the names read as the photo's caption, not a second focal
element). Gallery's locked state was rebuilt the same way: one sealed
frame (the Invitation's heart-seal motif, reused), one caption, zero action
— restraint itself is the anticipation.

**Not yet extended (open, needs a decision before starting):** the
Invitation, Our Story, Events, and other sections still use the older
`eyebrow -> centered h2 -> centered sub-line -> card grid` template, which
violates the exhibition rule on multiple counts at once (Invitation alone
stacks a seal + eyebrow + heading + message = one visual, several text
units; Events/Story are card grids = many co-equal visuals, not one).
Applying the exhibition rule there is a bigger structural change (it turns
each card grid into a one-thing-per-screen sequence) than the token-level
work already done, and per this project's established pattern, needs the
user's explicit go-ahead per section before starting — don't do it
unprompted. Tracked in TODO.md.

**Illustration — confirmed scope, 2026-07-17.** In response to a Pinterest
reference (a densely-illustrated Russian wedding-template site — hand-drawn
timeline icons, an illustrated calendar strip, a hand-lettered headline
face), a design-lead review drew a precise line: illustration is welcome
**only at caption/punctuation scale** (~16-24px, a single recurring
hand-drawn heart/sprig used as a section-divider or eyebrow ornament on
**text-led sections only** — FAQ, Guestbook, dividers). It is explicitly
**not** welcome as a widget, an icon-per-item timeline, an illustrated
calendar, or a hand-lettered primary headline face — all of those recreate
the museum-density the exhibition rule exists to avoid. The hero and any
gallery focal screens are **permanently closed** to added illustration: the
photo already bakes in its own hearts/hand-lettering, so anything added
there would be a second illustrative source competing with the one visual
that's supposed to dominate. See HANDOFF.md for the full reasoning; a small
mockup of the proposed heart motif at true scale is pending user
confirmation before implementation (per the mockup-first rule below).

**Rejected directions** (don't reintroduce without the user asking again):
- Literal cartoon/illustrated "face on cartoon body" treatments (memes) — too
  far from the site's tone, reads as a WhatsApp sticker rather than a wedding
  site.
- Fabricating a single "combined hug" photo from the couple's two separate
  individual childhood photos — they didn't know each other as kids; a
  composited "hug" would misrepresent a moment that never happened. The
  hero's current focal asset (`wedding-childhood-pic.jpg`) does **not**
  violate this: it die-cuts the two real, separately-taken photos side by
  side with explicit GROOM/BRIDE labels — same honesty, no fabricated shared
  moment.
- A full-site pivot to a dark-maroon/gold palette (explored mid-session on
  2026-07-16/17 as an alternative hero direction, then abandoned in favor of
  the photo-focal approach) — don't revive this as a site-wide reskin. Deep
  maroon/gold now exist only as the narrow "festive peak" accent role above.

## Asset inventory (assets/images/)

- `wedding-childhood-story-v5-transparent.webp` — **final, in-use** hero
  focal `<img src>` (converted 2026-07-19, same day as the PNG swap below).
  The PNG source is genuinely transparent (832x1296, `mode: RGBA`, alpha
  spans 0-255) but weighed ~1.1MB — the heaviest hero image the site had
  shipped. Re-encoded as lossy WebP with alpha preserved (Pillow,
  `quality=82, method=6`) → **~107KB, a ~90% reduction**, visually
  indistinguishable from the PNG at display size (checked directly, both
  the photographic areas and the hard-edged hand-drawn hearts/text).
  `index.html`'s hero `<img src>` points at this `.webp` file. **The
  OG/Twitter/JSON-LD meta tags deliberately still point at the `.png`**
  (see below), not this WebP — that's a one-time server-side fetch by a
  link-preview crawler, not something every visitor's browser pays for,
  and WebP support across crawlers (WhatsApp/iMessage/X card validators)
  is less consistent than in real browsers, so the safer/universal format
  was kept there on purpose.
- `wedding-childhood-story-v5-transparent.png` — the PNG source for the
  `.webp` above; still referenced by the OG/Twitter/JSON-LD meta tags (see
  above for why). Same die-cut composition (both real childhood photos
  with hand-drawn hearts, GROOM/BRIDE labels, "WE'RE GETTING MARRIED!"
  banner), genuinely transparent, 832x1296, ~1.1MB.
- `wedding-childhood-story-v3.png` — the previous hero image (see above),
  live for only part of one session before the v5-transparent swap. Opaque
  white background (no alpha), 667KB. Kept on disk, unreferenced.
- `wedding-childhood-pic.jpg` — the original hero focal image, superseded
  by the v3/v5 die-cut-on-transparent direction. 700x914, ~195KB,
  recompressed from an original 2MB/896x1170 PNG — see HANDOFF.md for the
  design-lead review that flagged the original as an LCP problem. Kept on
  disk, unreferenced, in case the swap needs reverting.
- `wedding-childhood-story-pink.png`, `wedding-childhood-story-v2.png` —
  earlier iterations of the same die-cut composition explored before v5
  was picked. Reference only, not rendered on the site.
- `anubhav-cutout.png`, `naisargi-cutout.png` — the same two childhood photos
  as individual background-removed cutouts (real alpha transparency),
  head-through-torso, proportion-matched. No longer rendered directly in the
  hero, but kept as they're the honest source material behind the die-cut
  composite and may be reused elsewhere (e.g. Our Story).
- `anubhav-childhood.jpeg`, `naisargi-childhood.jpeg` — original source photos
  with backgrounds intact. Reference only, not rendered on the site.
- `anubhav-childhood-without-background.png`,
  `naisargi-childhood-without-background.png` — user-provided background-removed
  versions before the head-through-torso crop was applied. Reference only.
- `paper-grain.svg` — tileable noise texture for the paper background.
- `hero.svg`, `film-thumbnail.svg` — remaining placeholder art (film
  thumbnail; `hero.svg` is no longer referenced anywhere — the OG/Twitter/
  JSON-LD meta tags were fixed to point at the real hero photo back on
  2026-07-18, see TODO.md's Housekeeping entry for that date. This doc had
  drifted and still claimed otherwise; corrected 2026-07-19).
- `story-1.webp`..`story-4.webp` — **in-use, all four Our Story milestones**
  (`content.js`'s `photo` fields, converted to WebP 2026-07-19 for load
  time; the underlying photo content/grading is unchanged from the
  `.jpg` originals below). `story-1`/`story-2`/`story-4` re-encoded at
  Pillow `quality=82`, netting 17-42% smaller; `story-3` needed
  `quality=72` to actually beat its JPEG (WebP doesn't always win over an
  already-well-compressed JPEG on high-texture/noisy content — tested at
  82 first, it came out *larger* than the JPEG, so quality was stepped
  down until it won). All four checked visually side-by-side with the
  source JPEGs — no visible artifacts at display size.
- `story-1.jpg`..`story-4.jpg` — the JPEG originals the `.webp` files above
  were converted from; no longer referenced by `content.js` but kept on
  disk (2026-07-18). `story-1.jpg`/`story-2.jpg`/`story-3.jpg` are real
  candid photos (meeting at the Meesho office, an early-relationship
  candid, and the proposal, respectively), each cropped to 4:3 and graded
  via `scripts/grade-candid-photo.py` (see Architecture patterns below) to
  match the site's warm palette — 1000x750, EXIF stripped, under 160KB
  each. `story-4.jpg` is different in kind: a designed "Coming Soon" graphic
  (maroon background, cream serif type, a thin decorative line motif),
  cropped to 4:3 but **not** color-graded like the others since it's
  already a finished asset, not a candid photo — correct for now since the
  wedding (Feb 24, 2027) hasn't happened; replace with a real wedding photo
  after the fact, then it should go through the same grading script as the
  others for consistency (and then the same JPEG→WebP conversion this note
  describes). These supersede `story-1.svg`..`story-4.svg`, which are no
  longer referenced by `content.js` but are left in place, unused. The
  original, ungraded source photos are kept alongside the finals as the
  source of truth if a grade ever needs re-running with different
  parameters — don't delete them: `story-placeholder-1.JPG`
  (source for `story-1.jpg`), `story-milestone-2-v2.png` (source for
  `story-2.jpg` — a second, better-cropped version of the same moment
  swapped in 2026-07-18, superseding the original `story-milestone-2.jpeg`,
  which is also kept but no longer the active source), `story-milestone-3.jpeg`
  (source for `story-3.jpg`), `story-milestone-4.jpg` (source for
  `story-4.jpg`, the original square 1080x1080 "Coming Soon" graphic before
  its 4:3 crop).

## Open questions / pending user decisions

Track these in TODO.md as they get resolved — don't assume answers.
