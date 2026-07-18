# RSVP → Google Sheet setup

One-time manual setup. This part needs your Google account, so it can't be
done from Claude Code — the steps below are exact and should take about
five minutes.

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   blank spreadsheet. Name it something like "Naisargi & Anubhav — RSVPs".
   It'll live wherever you create it in your Drive.
2. In the sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder `myFunction() {}` code, and paste in the full
   contents of [`Code.gs`](Code.gs) from this folder.
4. Change the `SHARED_SECRET` constant near the top of the script to any
   random string of your own choosing. Save the script (⌘S / Ctrl+S).
5. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   (This makes the URL a public POST endpoint — that's expected and required
   so the static site can reach it. See the security note below.)
6. Click **Deploy**, then **Authorize access** when prompted — it needs
   permission to edit the sheet it's bound to. You'll likely see an
   "unverified app" warning since this is your own private script; click
   **Advanced → Go to (project name) (unsafe)** to proceed. This warning is
   normal for personal scripts that haven't gone through Google's public
   app-review process — it's still only accessible to you as the owner.
7. Copy the **Web app URL** it gives you (ends in `/exec`).
8. Open `js/content.js` in the project and fill in:
   - `WEDDING_CONTENT.integrations.rsvpEndpoint` — the URL from step 7.
   - `WEDDING_CONTENT.integrations.rsvpSecret` — the same string you set in
     step 4.
9. Submit a test RSVP on the live site and confirm a row appears in the
   sheet (it'll add a bold header row automatically on the first submission).

## Security note — please read this

The shared secret in step 4 is a **spam deterrent, not real access
control**. It lives in the site's public JavaScript (`content.js`), so
anyone who views the page source can read it. It stops the URL from being
casually spammed by bots that scan for open Apps Script endpoints, but it
will not stop someone who's specifically looking at your site's code and
chooses to copy it. For a small personal wedding site this is a reasonable
trade-off — nobody is likely to specifically target it — but don't treat
the sheet as a security boundary, and don't ask the RSVP form for anything
more sensitive than what's already there (name, phone, a message).

**What someone with the URL + secret actually can and can't do**: they can
only trigger exactly what `doPost()` does — append one row to this one
sheet. The script runs with your Google account's permissions ("Execute
as: Me"), but a caller doesn't inherit those permissions; they can't browse
your Drive, read other files, or do anything the code doesn't explicitly
do. This is not a path to broader account access — the worst case is spam
rows in this sheet.

**Formula injection, and why `Code.gs` sanitizes text fields**: if a
submitted Name/Phone/Message starts with `=`, `+`, `-`, or `@`, Google
Sheets can interpret it as a live formula the moment you open the file
(e.g. `=IMPORTXML(...)` reaching out to an external URL) — this is a known
risk for any system that writes untrusted text into a spreadsheet, separate
from the Apps Script's own permissions. `Code.gs`'s `sanitizeForSheet()`
prefixes any such value with an apostrophe so Sheets always renders it as
plain text. If you edit `Code.gs` yourself later, keep that guard in place.

## If submissions don't show up

Apps Script Web Apps can occasionally be inconsistent with CORS when called
from `fetch()` in a browser. If you open the browser console on the RSVP
section and see a CORS error after submitting, the fallback is switching
the `fetch` call in `js/utils.js`'s `submitRSVP` to `mode: 'no-cors'` — it
will still deliver the POST, you just won't get a readable success/error
response back in the browser (the UI will optimistically show success).
`js/utils.js` has a comment marking exactly where to make that change.

## Redeploying after editing Code.gs

Any time you change the Apps Script code later, you must use
**Deploy → Manage deployments → Edit (pencil icon) → New version** —
otherwise the live URL keeps serving the old code.

**You need to do this now**: `Code.gs` was updated (2026-07-18) to add the
formula-injection sanitizing described above. Copy the current contents of
[`Code.gs`](Code.gs) into your Apps Script editor (replacing what's there),
save, then **Deploy → Manage deployments → Edit → New version → Deploy**.
The endpoint URL and your secret stay the same — only the code changes.
