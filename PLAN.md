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
3. Design system — done, v1 (editorial) then revised to v2 (scrapbook), see CLAUDE.md
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

The site's visual language is the "scrapbook" palette/type system (see
CLAUDE.md). As of 2026-07-17, layout/composition is governed by a second,
more specific rule on top of that palette — the confirmed **"exhibition"
rule**: one dominant visual, one text placard, one action (if any), generous
negative space, per screen (full definition in CLAUDE.md's Design system
section). Status of applying it:

| Section | Structural build | Scrapbook palette | Exhibition rule applied |
|---|---|---|---|
| Hero | done | done | **done** — photo unveiled first (dominant visual), names+date is one placard, one CTA. Stacked paper-card and oversized H1 removed to make room for it |
| Gallery (locked state) | done | done | **done** — one sealed frame (heart-seal motif), one caption, zero action |
| Invitation | done | done (keepsake card, washi tape, heart seal) | **done** — collapsed eyebrow+heading+message into one placard ("You're Invited" / "come celebrate the start of our forever"), card itself is the dominant visual (gold hairline inner rule added), seal moved to bottom as a closing mark, zero action, extra desktop negative space |
| Our Story | done, real content (4 real milestones + photos, 2026-07-18) | inherits global tokens only | not started — card/timeline grid is multiple co-equal visuals, needs one-milestone-per-screen sequencing |
| Events | done, real content (4 real events, all details TBD, 2026-07-18) | inherits global tokens only | **explicitly declined by the user (2026-07-18)** — design-lead proposed a one-program/gold-thread redesign for the details-TBD state; the user preferred keeping the existing card-grid layout as-is, just with TBD values. Not planned to revisit unless asked. |
| RSVP | done — rebuilt as a static form (2026-07-18), superseding the conversational flow, at the user's explicit direction | done — paper card, warm-maroon errors, gold hairline | **done** — one paper-card dominant visual, one placard, one action (submit); design-lead spec'd and mockup-confirmed |
| Gallery (unlocked state) | done | inherits global tokens only | not started — will need one-photo-focal treatment when it unlocks |
| Guest Memories | done | inherits global tokens only | not started |
| Wedding Film | done | inherits global tokens only | not started |
| Guestbook | done | inherits global tokens only | not started |
| FAQ | done | inherits global tokens only | not started |
| Footer | done | inherits global tokens only | not started — confirmed mockup treats this as "one closing mark, one line, minimal utility chrome" |

Extending the exhibition rule to Our Story and the still-untouched sections
(Gallery-unlocked, Memories, Film, Guestbook, FAQ, Footer) is a real
structural change — it turns each card grid into a one-thing-per-screen
sequence — not just a token pass. Per this project's established
one-section-at-a-time pattern, get the user's go-ahead before starting.
Events is settled (see table row above) — don't re-propose it. **Note**: a
combined mockup covering all the still-untouched sections was built
2026-07-18 (`https://claude.ai/code/artifact/f7c1d9d7-8032-40aa-b1c0-bafb7e2bd97e`)
but was never confirmed as a batch — treat it as reference only, confirm
each section individually as it comes up, the same way Story/Events/RSVP
each ended up going their own way rather than following that mockup as
originally proposed.

Separately, three small **contextual copy additions** ("more is coming"
notes) were spec'd and mockup-confirmed 2026-07-18 for FAQ, Guestbook, and
the Footer — not an exhibition-rule pass, just short reassurance copy in
the existing italic-serif "quiet aside" voice, explicitly **not** a
site-wide banner (design-lead's call, given the site is now seen by real
guests — see CLAUDE.md). Mockup:
`https://claude.ai/code/artifact/71e7b0a6-7462-4bad-820d-aac9ffc3664a`.
See TODO.md for implementation status.

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
