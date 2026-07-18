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

## Design system — current direction: "scrapbook"

The site pivoted **away** from the original brief's "premium editorial,
Apple/Airbnb/Aesop" direction to a warmer **paper/scrapbook aesthetic** after
the user reviewed several Pinterest/Instagram references. This was a
deliberate, explicit user decision — don't revert toward the original
minimal-editorial look without being asked.

Current palette/tokens (in `css/style.css` `:root`):
- `--color-bg: #ede3d0` (paper), `--color-bg-raised: #faf6ec` (card — brightened
  from the original `#f7f1e4` so raised surfaces read as objects on the paper
  rather than nearly-identical values that dissolve into the background)
- `--color-text: #3d2a1a` (ink), `--color-text-secondary: #6b5138`
- `--color-accent: #9c5230` (rust) — the base warm accent, used everywhere
- `--color-accent-deep: #6e2a2f` / `--color-accent-deep-hover: #85373d` /
  `--color-on-accent-deep: #fdf6ea` — a **festive peak role**, added after a
  design-lead review flagged the palette as too monochromatic-warm with no
  emotional "peak." Used sparingly: the hero's primary CTA (`.btn--festive`)
  and, going forward, 1-2 full-bleed/deep-background moments elsewhere. This
  is **not** the abandoned dark-maroon full-site pivot (see Rejected
  directions) — it's an accent role on top of the paper base, not a reskin.
- `--color-gold: #b98729` — a **micro-accent only** (hairline rules, small
  dividers, e.g. the hero date's flanking lines). Never used as a fill.
- `--paper-grain`: a tiled SVG turbulence texture (`assets/images/paper-grain.svg`),
  applied to `body` and `.section--alt` backgrounds
- `--shadow-soft`: bumped to a genuinely visible (but still soft) two-layer
  shadow — the original was so subtle that raised cards barely separated
  from the page.
- Headings: Cormorant Garamond, weight 600 globally (bumped from 500 — a
  design-lead review found the type system was under-using scale/weight
  contrast, the single biggest lever for editorial emotion). `--fs-h2` was
  also bumped to `clamp(2.25rem, 5vw, 3.25rem)` (from `clamp(1.75rem, 3.5vw,
  2.5rem)`) so section headings read as display-scale moments, not mid-sized
  labels.
- `.eyebrow`: italic Cormorant Garamond, not uppercase-tracked Inter. The old
  tracked-caps kicker was flagged as the coldest, most template-like element
  on the site (it repeated identically on all ~9 non-hero sections) — the
  italic-serif treatment reads as a warm handwritten lead-in instead.
- Accent motifs (thread lines + heart SVG) that used to be the hero's
  signature "one bold moment" have been **retired** — the hero now leans on
  a single finished focal photo asset instead (see Architecture patterns /
  Hero below). Don't re-add the thread/heart motif next to that image; it
  would be genuinely redundant, the asset already has hand-drawn hearts
  baked in. The "spend boldness in one place" principle still holds, the
  mechanism just moved from a live SVG motif to the photo + its atmosphere.

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

- `wedding-childhood-pic.jpg` — **final, in-use** hero focal image. Both real
  childhood photos die-cut onto one scalloped card with hand-drawn hearts,
  GROOM/BRIDE labels, and a "WE'RE GETTING MARRIED!" banner baked into the
  asset. 700x914, ~195KB (recompressed from an original 2MB/896x1170 PNG —
  see HANDOFF.md for the design-lead review that flagged the original as an
  LCP problem). This superseded the two-separate-cutouts hero treatment.
- `anubhav-cutout.png`, `naisargi-cutout.png` — the same two childhood photos
  as individual background-removed cutouts (real alpha transparency),
  head-through-torso, proportion-matched. No longer rendered directly in the
  hero (superseded by `wedding-childhood-pic.jpg` above), but kept as they're
  the honest source material behind that composite and may be reused
  elsewhere (e.g. Our Story).
- `anubhav-childhood.jpeg`, `naisargi-childhood.jpeg` — original source photos
  with backgrounds intact. Reference only, not rendered on the site.
- `anubhav-childhood-without-background.png`,
  `naisargi-childhood-without-background.png` — user-provided background-removed
  versions before the head-through-torso crop was applied. Reference only.
- `paper-grain.svg` — tileable noise texture for the paper background.
- `hero.svg`, `film-thumbnail.svg` — remaining placeholder art (hero OG/meta
  fallback, film thumbnail). **Note**: `index.html`'s OG/Twitter/JSON-LD meta
  tags still point at `hero.svg`, not the real hero photo — a guest sharing
  the link will see the stale placeholder in the preview card. Flagged, not
  yet fixed.
- `story-1.jpg`..`story-4.jpg` — **real images, in use, all four Our Story
  milestones** (2026-07-18). `story-1.jpg`/`story-2.jpg`/`story-3.jpg` are
  real candid photos (meeting at the Meesho office, an early-relationship
  candid, and the proposal, respectively), each cropped to 4:3 and graded
  via `scripts/grade-candid-photo.py` (see Architecture patterns below) to
  match the site's warm palette — 1000x750, EXIF stripped, under 160KB
  each. `story-4.jpg` is different in kind: a designed "Coming Soon" graphic
  (maroon background, cream serif type, a thin decorative line motif),
  cropped to 4:3 but **not** color-graded like the others since it's
  already a finished asset, not a candid photo — correct for now since the
  wedding (Feb 24, 2027) hasn't happened; replace with a real wedding photo
  after the fact, then it should go through the same grading script as the
  others for consistency. These supersede `story-1.svg`..`story-4.svg`,
  which are no longer referenced by `content.js` but are left in place,
  unused. The original, ungraded source photos are kept alongside the
  finals as the source of truth if a grade ever needs re-running with
  different parameters — don't delete them: `story-placeholder-1.JPG`
  (source for `story-1.jpg`), `story-milestone-2-v2.png` (source for
  `story-2.jpg` — a second, better-cropped version of the same moment
  swapped in 2026-07-18, superseding the original `story-milestone-2.jpeg`,
  which is also kept but no longer the active source), `story-milestone-3.jpeg`
  (source for `story-3.jpg`), `story-milestone-4.jpg` (source for
  `story-4.jpg`, the original square 1080x1080 "Coming Soon" graphic before
  its 4:3 crop).

## Open questions / pending user decisions

Track these in TODO.md as they get resolved — don't assume answers.
