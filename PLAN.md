# PLAN.md

The phased roadmap for this project. This changes rarely — for day-to-day
status, see [TODO.md](TODO.md). Read alongside [CLAUDE.md](CLAUDE.md) at the
start of every session.

## Product vision — four phases

1. **Invite guests, collect RSVP** — the site's first job. Personalized
   invite links, conversational RSVP flow.
2. **Help guests navigate the wedding** — event schedule, venue details, dress
   code, maps, FAQs.
3. **Guest-uploaded memories** — photos/videos/captions/comments/likes from
   guests, before and during the wedding.
4. **Official albums** — published wedding photos, wedding film, thank-you
   note. The site keeps living after the wedding, not torn down.

## Build steps (from the original brief)

1. Information architecture — done (implicitly, via the section order below)
2. Wireframes — done (implicitly, skipped formal deliverable, went straight to design system + build)
3. Design system — done, v1 (editorial) → v2 (scrapbook) → v3 (Petal
   Blush, current, 2026-07-19), see CLAUDE.md
4. HTML implementation — done, all 10 sections
5. CSS implementation — done, mobile-first + responsive layers
6. Animations — done: scroll-reveal system, plus hero load-in choreography
   (names -> photo -> date/CTA) built into the real site in `js/animations.js`
7. JavaScript implementation — done: navigation, RSVP flow, gallery/memories,
   content rendering, mock API layer
8. Responsive layouts — done and verified on mobile viewport
9. Backend APIs — **not started**. Currently `MockAPI` in `js/utils.js`
   (localStorage-backed) stands in for a real backend. See "Backend
   (future-ready)" below for the shape it should take.
10. Deploy — **not started**. When choosing a host: check whether it
    respects the `_headers` file at the project root (Netlify, Cloudflare
    Pages both do, automatically) for `Cache-Control` — if the chosen host
    doesn't support custom headers (e.g. GitHub Pages, a bare S3 bucket),
    the `?v=N` versioning on every CSS/JS tag in `index.html` (see
    CLAUDE.md's caching gotcha) is the fallback that still works
    everywhere with zero configuration, so nothing is strictly blocked on
    this — just worth checking either way once a host is picked.

## Section-by-section design status

**Superseded 2026-07-19**: the site's visual language pivoted from
"scrapbook" to **"Petal Blush"** (romantic rose/blush/gold), ported from an
external Figma Make reference the user supplied — see CLAUDE.md's Design
System section for the full token/font/feature list. The **"exhibition"
rule** (one dominant visual, one text placard, one action if any, generous
negative space per screen — full definition in CLAUDE.md) still governs
layout/composition; the palette pivot changed colors/type/some structure
(Our Story in particular), not this underlying rule.

**Also as of 2026-07-19: Gallery, Guest Memories, Guestbook, Wedding Film,
and FAQ are commented out of the live site** (not deleted — user request,
see TODO.md), so their rows below describe code that exists but isn't
currently rendered. Don't propose further design work on them until the
user un-hides them.

| Section | Structural build | Current palette | Exhibition rule applied |
|---|---|---|---|
| Hero | done, plus a live countdown timer + floating-photo animation (2026-07-19) | Petal Blush | **done** — photo unveiled first (dominant visual), names+date is one placard, one CTA |
| Invitation | done | Petal Blush (restored "Together with their families" eyebrow line, 2026-07-19) | **done** — one placard, card is the dominant visual, zero action |
| Our Story | done, real content (4 real milestones + photos) | Petal Blush — **structurally rebuilt 2026-07-19**: ghost-outline year numerals + gold milestone labels replaced the old central spine/marker, plus a subtle scroll-scrubbed parallax on each photo | still the alternating card grid (multiple co-equal visuals per screen) — the one-milestone-per-screen sequencing explored via design-lead ("The Story Writes Itself" mockup) was never built; not currently planned unless the user asks again |
| Events | done, real content (4 real events, all details TBD) | Petal Blush — **restructured 2026-07-19**: dress code moved to a header badge, description moved to an italic closing quote, grid changed to a clean 2x2 (was 3-then-1). **Further restructured 2026-07-21**: each card now has a themed illustration banner (real artwork, transparent PNGs, a per-event gradient wash + soft edge-fade mask) and the badge text now spells out "Dress code: TBA" instead of a bare value — see CLAUDE.md's Design System section. | **explicitly declined by the user (2026-07-18)** for the one-program/gold-thread redesign; card-grid layout stays, just restyled. Settled — don't re-propose. |
| RSVP | done — static form (fields deliberately unchanged through the 2026-07-19 palette pivot per explicit user correction) | Petal Blush | **done** — one paper-card dominant visual, one placard, one action (submit) |
| Sealed coda | done (2026-07-18) — a small mystery-motif screen for the hidden sections below, with a wax-seal "Pressed Seal" stamp animation (2026-07-19) | Petal Blush | **done** — zero action, one placard, the site's most literal "restraint is the anticipation" screen |
| Footer | done | Petal Blush (script couple names) | **done** |
| Gallery / Guest Memories / Wedding Film / Guestbook / FAQ | done, but **currently hidden** (commented out, 2026-07-18) | Petal Blush tokens exist in the commented-out markup, not visually verified live | not started — moot until un-hidden |

A combined mockup covering the sections above (built 2026-07-18,
`https://claude.ai/code/artifact/f7c1d9d7-8032-40aa-b1c0-bafb7e2bd97e`) was
never confirmed as a batch and predates both the palette pivot and the
sections being hidden — treat it as historical reference only.

Separately, three small **contextual copy additions** ("more is coming"
notes) were spec'd and shipped 2026-07-18 for FAQ, Guestbook, and the
Footer — since FAQ and Guestbook are now hidden, only the Footer's version
of this is currently live (and even that was simplified further on
2026-07-19, see TODO.md). Mockup:
`https://claude.ai/code/artifact/71e7b0a6-7462-4bad-820d-aac9ffc3664a`.

## Backend (future-ready) — target shape when Step 9 starts

**RSVP now has a real (partial) backend, ahead of the rest (2026-07-18).**
Rather than a custom server + database for `POST /rsvp` specifically, RSVP
submissions go to a **Google Apps Script Web App bound to a Google Sheet**
in the couple's own Drive — zero server to host, fits the site's static/no-
build-step constraint, and literally satisfies "stored in a Google Sheet
linked in my Google Drive." See `scripts/google-apps-script/` (`Code.gs` +
`SETUP.md`) for the script and setup steps, and `js/utils.js`'s
`submitRSVP` for the frontend integration — it posts to
`WEDDING_CONTENT.integrations.rsvpEndpoint` when configured, and falls back
to the local-only mock when it isn't (so development isn't blocked on the
Google-side setup, which requires the user's own Google account and can't
be done by Claude Code). This is a deliberate one-off exception to the
"real backend = Step 9, not started" status below — it doesn't imply the
other endpoints get the same treatment; each would need its own
build-vs-buy decision when it's actually tackled.

Suggested endpoints for everything else (from the original brief, mirrored
by `MockAPI` today):

```
GET  /invite/:guestId
POST /rsvp
GET  /events
GET  /gallery
POST /memories
GET  /memories
POST /comments
POST /likes
```

Database tables needed: Guests, Invites, RSVP, Events, Photos, Videos,
Comments, Likes, Guestbook.

Admin panel (not started): upload official photos/videos, approve guest
uploads, view RSVP stats, export RSVP CSV, edit events, send reminders, manage
invitations.

Authentication: invite-token based, one unique URL per guest/family
(`/invite/anubhav-family` style), already partially modeled today via the
`?guest=` query param + `WEDDING_CONTENT.guests` mock directory in
`content.js`.
