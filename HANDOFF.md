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

## Last session: 2026-07-18 (very long session, many distinct threads)

Picked up from the prior session's "do this first" list (illustration
micro-motif reaction, extending the exhibition rule, `og:image` fix — all
three are **still open**, see "Do this first" below). What actually
happened instead was a much bigger arc: a full creative-direction
re-exploration, real content landing across two sections, a complete RSVP
rebuild with a real backend, and a permanent fix to a caching problem that
had been dogging verification all session. Roughly in order:

### Part 1 — Broad creative exploration, then explicit reconvergence on the existing direction

User asked for a from-scratch creative exploration ("think like Creative
Directors... avoid default wedding aesthetics... floral borders, mandalas,
glitter, gold ornaments, hearts") — explicitly declared the already-shipped
gold accent, heart-seal motif, and even Hero/Gallery/Invitation open to
being replaced if something stronger emerged. Ran **four independent,
parallel design-lead explorations** (no visibility into each other):
- **Aavkaar — The Art of Being Expected** (Luxury Hospitality)
- **The February Issue** (Fashion Editorial)
- **The Hour Between** (Architecture of Light — Gujarat stepwells/jali)
- **Above the Title** (Cinematic Overture — dark-to-light, act structure)

Built a comparison presentation Artifact with real mockups per direction:
`https://claude.ai/code/artifact/4219f654-39ee-4a7a-b872-e4b1100b9113`

**The user's actual decision: stick with the already-shipped
scrapbook/exhibition direction, not any of the four new territories** —
"let's proceed with the earlier finalised design. And extend it to all
sections." So the whole exploration was genuinely just an exploration; the
confirmed direction from 2026-07-17 stands, unchanged.

### Part 2 — Extending the exhibition rule: real per-section divergence, not a batch

Got design-lead specs for Story/Events/RSVP (one call) and Gallery/
Memories/Film/Guestbook/FAQ/Footer (a second, parallel call), then built
one large combined mockup covering all remaining sections:
`https://claude.ai/code/artifact/f7c1d9d7-8032-40aa-b1c0-bafb7e2bd97e`

**This mockup was never confirmed as a batch.** Instead, as each section
came up individually over the rest of the session, the user made separate,
often-different calls:
- **Our Story**: got **real content**, not the mockup's visual redesign
  (see Part 3) — still the original card/timeline grid structurally.
- **Events**: **exhibition-rule redesign explicitly declined** — user
  preferred keeping the existing card grid as-is (see Part 4).
- **RSVP**: got a **completely different, fresh redesign** — a static
  form, not the mockup's "polish the conversational flow" proposal (see
  Part 5) — a separate design-lead engagement entirely.
- **Gallery(unlocked)/Memories/Film/Guestbook/FAQ/Footer**: genuinely
  untouched. The combined mockup is reference material for these, **not**
  pre-approved — confirm per section when it comes up, same pattern as
  everything else.

**Lesson for future sessions**: don't assume "a mockup was built" implies
"the mockup will be followed" — this user makes real, sometimes
significant, per-section calls as work actually happens, more than once
diverging from what was mocked up. Always check TODO.md's actual per-
section status, not just "was a mockup shown."

### Part 3 — Our Story: real photos and real timeline

User supplied real photos and corrected the generic placeholder timeline
across two rounds:
- Milestone 1 (Meeting Each Other): real photo from the Meesho office
  (where they met), graded via a new reusable script,
  `scripts/grade-candid-photo.py` (Pillow — crop-to-4:3, warm white-
  balance push, 6% wash toward `--color-bg-raised`, subtle vignette; mat/
  shadow/tilt deliberately left to CSS). First real candid photo on the
  site besides the illustrated hero composite.
- Full real timeline confirmed: **2024 Meeting Each Other → 2025
  Officially Started Dating → 2026 The Proposal → 2027 Our Wedding**
  (hasn't happened yet). Milestones 2 and 3 got real photos through the
  same grading script; milestone 4 got a designed "Coming Soon" graphic
  (not a real photo — correct, since the wedding hasn't happened). Display
  shows **year only**, not exact dates, per explicit user request.
- One unresolved thread: user first said they met "in 2025," a later
  message said "2024" — went with 2024 as newer/more explicit, **never
  explicitly reconfirmed**. Ask again if it resurfaces.
- Milestone 2's photo was later swapped for a better-cropped version of
  the same moment (`story-milestone-2-v2.png`) — no code change needed,
  same output filename.
- **The exhibition-rule visual redesign for Our Story (one-milestone-per-
  screen sequencing) was never implemented** — only the content changed,
  inside the original template. Still open, needs go-ahead.

### Part 4 — Events: real list, TBD details, user overrode the proposed redesign

Real event list/order confirmed: **Mehendi → Sangeet & Cocktails → Haldi →
Wedding** (Reception dropped from the original 5-event placeholder list).
All details (date/time/venue/dress code) are genuinely unknown, not just
generic placeholders — design-lead proposed a redesign for this state (one
program list on a gold thread, mockup:
`https://claude.ai/code/artifact/5fbad13c-ae63-4930-b446-2c24c283c34b`),
but **the user explicitly preferred keeping the existing card-grid
layout** and just marking every field `TBD`. Implemented directly (content
change, not a new design, since it reused the shipped layout):
`renderEvents()` shows one "TBD" for date+time (not "TBD · TBD"), omits
the map button entirely when there's no real `mapUrl` (no dead-looking
control). This is **settled** — don't re-propose the redesign unless asked.

### Part 5 — RSVP: full rebuild, real backend, several rounds of hardening

The biggest single thread this session. In order:

1. **UX pivot** — user wanted a static form instead of the conversational
   flow: Name (mandatory) → Will you attend? (mandatory) → How many of you?
   (guest count, defaults 1, **auto-collapses if declining** — added back
   in after an initial simpler field list) → Phone (optional) → Message
   (optional). Design-lead spec'd field order, the collapsing behavior,
   warm-maroon (not red) errors, an in-place success-state swap with
   different copy for attending vs. declining. Mockup, confirmed:
   `https://claude.ai/code/artifact/b0fdb1d6-373f-4562-8f4d-f399269262d5`.
   Fully rewrote `js/rsvp.js` (was a branching state machine, now a single
   static-render + wire-up module) and `.rsvp*` CSS in `components.css`.

2. **Real backend** — user wants RSVP data in a Google Sheet in their own
   Drive. Built a **Google Apps Script Web App** bound to a Sheet
   (`scripts/google-apps-script/Code.gs` + `SETUP.md`) — zero server to
   host, fits the site's static/no-build-step constraint. `MockAPI.
   submitRSVP` posts to `WEDDING_CONTENT.integrations.rsvpEndpoint` when
   configured, always caches locally too, falls back gracefully when not
   configured. **User completed the manual Google-side setup themselves**
   (Claude Code has no access to their Google account for this part).

3. **Verification saga, worth knowing about**: client-side tests showed
   clean success with no console errors and were reported as "done" — the
   user then checked the actual sheet and it was **completely empty**. A
   direct debug-probe fetch got back `{"success":true}` from the endpoint,
   and by the time the user re-checked, the row **was** there. Root cause
   never conclusively identified (most likely the user's Google-side setup
   simply wasn't fully finished/propagated during the first few
   submissions). See the new memory `feedback_verify_against_ground_truth`
   for the general lesson this produced: don't declare an external
   integration done from client-side signals alone when the user can check
   the authoritative source — ask them to, and believe them over your own
   tests if they report a mismatch.

4. **Real bug found and fixed during that investigation**: `submitRSVP`
   never checked whether the Apps Script's response actually indicated
   success — an explicit `{success:false}` (e.g. bad secret) would
   silently show the guest a success message. Fixed: now detects
   `result.success === false`, logs it, flags it (`sheetError`/
   `sheetErrorReason`), without blocking the guest (local cache always
   succeeds first).

5. **Security hardening**: user asked two good security questions —
   whether the secret is exposed to browser users (yes, unavoidably, for
   any static site — explained the exact mechanism), and whether the
   script URL could be used to compromise their broader Google Drive (no —
   the script can only do what `doPost()` codes, a caller doesn't inherit
   the owner's permissions; but flagged a real, separate risk: Sheets
   formula injection via `=`/`+`/`-`/`@`-prefixed text). Added
   `sanitizeForSheet()` to `Code.gs` to neutralize it. **User needs to
   redeploy** the updated `Code.gs` (copy into the live Apps Script editor,
   Deploy → Manage deployments → Edit → New version) — not yet confirmed
   done.

### Part 6 — The caching problem, finally fixed permanently

This bit repeatedly all session (documented as a "gotcha" since
2026-07-17, reinforced twice more this session) — the local dev server
sends no cache-control headers, and the browser (both the testing tool's
and the user's own) kept serving stale JS/CSS with zero error, looking
exactly like real regressions multiple times (a stale `rsvp.js` rendering
the old chat flow after the rebuild; stale `components.css` making
`.field-error` always visible). The user asked directly whether this would
recur post-deployment — real concern, not dev-only, since any static host
with permissive cache headers has the same risk for a guest who visited
before a post-launch update.

**Fixed permanently, not just for this session**: every local CSS/JS tag
in `index.html` now carries a shared `?v=1` query string, kept in the
shipped file (not stripped after verification like the old temporary
`?dev=N` pattern was). **Going forward: whenever any CSS/JS file changes,
bump every `?v=N` together** — this is now the standing workflow,
replacing "add `?dev=N`, verify, strip it." Also added a `_headers` file
at the project root (Netlify/Cloudflare Pages read this automatically,
harmless elsewhere) setting `Cache-Control: no-cache` as a second line of
defense. CLAUDE.md's caching gotcha section was rewritten to document this
as the new standing convention, not just a historical incident.

### Part 7 — "More is coming" notes: spec'd, mockup-confirmed, and shipped

User wants guests to understand a few more things (design polish, more
content) are coming as the wedding approaches, without it reading as a
"site under construction" apology. Design-lead's call, worth remembering:
**no site-wide banner** — Gallery/Memories/Film already handle this
contextually ("Gallery opens after the celebrations," etc.), and a banner
would cast doubt over the *finished* sections too. The real gap was
narrower: FAQ and Guestbook had no such framing. Spec'd three small,
copy-only additions (no new components), each with deliberately different
phrasing for *how* that section fills in:
- **FAQ** (closing line under a gold hairline): *"That's everything we
  know so far — more answers will find their way here as the day draws
  near."*
- **Guestbook** (lead-in between heading and form): *"Our families left
  the first note. Add yours below — the wall fills as more of you
  arrive."*
- **Footer** (the one genuinely site-wide line): *"New pages open here as
  the day draws near."*

Mockup, confirmed: `https://claude.ai/code/artifact/71e7b0a6-7462-4bad-820d-aac9ffc3664a`

**Implemented and verified same session** (after the doc-sync pass below,
per the user's explicit requested order — docs/memory first, then build):
new shared `.quiet-note` CSS rule (italic Cormorant Garamond 500,
`--color-text-secondary`, no container, same register as `.eyebrow` but
quieter) plus `.faq-hairline`, `.faq-closing-note`, `.guestbook-intro-note`,
`.site-footer__growth-note` in `components.css`; the three lines of markup
added directly in `index.html` (FAQ: after `#faq-list`; Guestbook: between
`.section-heading` and `#guestbook-form`; Footer: between the couple-names
line and the existing `.site-footer__note`). Verified via direct DOM
inspection (opacity 1, correct positioning, correct text) — the Browser
pane's known screenshot-compositing glitch produced a blank screenshot
despite confirmed-correct underlying state, consistent with that
documented issue elsewhere in this file and in CLAUDE.md.

### Part 8 — This doc-sync pass

The user explicitly asked, before implementing Part 7, to bring all docs
and memory fully up to date first — this rewrite, plus corrections to
several stale bits of TODO.md (the old "RSVP just needs polish" line was
replaced by RSVP's actual full rebuild; Our Story's real-content-vs-
visual-redesign distinction was muddled and is now explicit; the combined
mockup's batch-vs-per-section status is now explicit everywhere it's
referenced), PLAN.md (mockup links, Events settled, backend status), and
CLAUDE.md (the "site is already live with real guests" fact, which
explains Part 7's no-banner decision). Two new cross-session memories
added: `user_anubhav_profile` and `feedback_verify_against_ground_truth`.
Part 7 itself was then implemented immediately after this sync, in the
same session (see above) — so unlike most of this file's other "Do this
first" items, that one is now done, not still pending.

---

## Do this first, next session

1. **Ask whether the `Code.gs` redeploy happened** (Part 5, step 5) — the
   formula-injection fix needs the user to manually redeploy; unconfirmed.
2. **Get the user's reaction to the illustration micro-motif mockup**
   (built 2026-07-17, link in that session's own handoff/TODO history —
   heart/sprig ornament for FAQ/Guestbook at caption scale) — still open
   after two full sessions. Note: per design-lead's Part 7 spec, this
   motif is independent of the already-shipped "more is coming" notes
   (they didn't wait on it), but if it's ever confirmed, its natural home
   is right next to the FAQ closing note / footer line.
3. **Ask about extending the exhibition rule further** — Our Story's
   visual redesign (content is done, structure isn't) and the six
   still-untouched sections (Gallery-unlocked → Guestbook, listed in
   priority order in TODO.md) are all still open, one-section-at-a-time,
   user's call on order/whether at all.
4. **Housekeeping**: `og:image`/`twitter:image`/JSON-LD still point at the
   stale `hero.svg` placeholder — now higher priority than before, since
   the site is confirmed live with real guests (a shared link's preview
   card is a live gap, not just a someday fix).
5. **Confirm the "met in 2024 vs 2025" discrepancy** (Part 3) if it
   resurfaces — never explicitly reconfirmed after the switch to 2024.

## Where things live (quick pointers, full detail in CLAUDE.md)

- RSVP form + backend: `js/rsvp.js`, `js/utils.js` (`submitRSVP`),
  `scripts/google-apps-script/` (`Code.gs` + `SETUP.md`),
  `WEDDING_CONTENT.integrations` in `js/content.js`
- Our Story real content/photos: `js/content.js` (`story` array),
  `scripts/grade-candid-photo.py`, `assets/images/story-1.jpg`..`story-4.jpg`
- Events TBD state: `js/content.js` (`events` array), `renderEvents()` in
  `js/app.js`
- Caching convention: `?v=N` on every CSS/JS tag in `index.html`, plus
  `_headers` at the project root — full explanation in CLAUDE.md
- The exhibition rule (full definition) + the "site is live with real
  guests" note: CLAUDE.md's Design system / "What this is" sections
- Design-lead subagent: `.claude/agents/design-lead.md` — no longer
  re-invoked for post-implementation review, spec's-once-and-done (see
  CLAUDE.md's "Design workflow" section, changed 2026-07-17)
- Dev server: `.claude/launch.json` → `wedding-static-server` (port 4173)

## Artifacts published this session (all private to the user's account)

- Four-territories creative exploration (Hospitality/Editorial/
  Architecture/Cinema) — explored, **not adopted**, user kept the existing
  direction: `https://claude.ai/code/artifact/4219f654-39ee-4a7a-b872-e4b1100b9113`
- Combined mockup, all remaining sections — reference only, **not**
  batch-confirmed: `https://claude.ai/code/artifact/f7c1d9d7-8032-40aa-b1c0-bafb7e2bd97e`
- Events TBD-state redesign — **declined** by the user, kept existing
  layout instead: `https://claude.ai/code/artifact/5fbad13c-ae63-4930-b446-2c24c283c34b`
- RSVP static form — **confirmed and shipped**:
  `https://claude.ai/code/artifact/b0fdb1d6-373f-4562-8f4d-f399269262d5`
- "More is coming" notes (FAQ/Guestbook/Footer) — **confirmed and
  shipped**: `https://claude.ai/code/artifact/71e7b0a6-7462-4bad-820d-aac9ffc3664a`
- (From the prior 2026-07-17 session, still relevant/open: the illustration
  micro-motif mockup — link in that session's history, see "Do this first" #2)
