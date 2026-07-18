/**
 * utils.js
 * Shared helpers and a mock API layer.
 *
 * MockAPI mirrors the shape of the real backend described in the project
 * spec (GET /invite/:guestId, POST /rsvp, GET /events, GET /gallery,
 * POST /memories, GET /memories, POST /comments, POST /likes). It persists
 * to localStorage and simulates network latency so the rest of the app can
 * be written against real async calls. When Step 9 (real backend) ships,
 * only the function bodies in this file change — callers stay the same.
 */

const Utils = (() => {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const debounce = (fn, wait = 150) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  const throttle = (fn, limit = 150) => {
    let inThrottle = false;
    return (...args) => {
      if (inThrottle) return;
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    };
  };

  const formatDate = (isoOrDisplayDate) => {
    const parsed = new Date(isoOrDisplayDate);
    if (Number.isNaN(parsed.getTime())) return isoOrDisplayDate;
    return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getGuestIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('guest') || null;
  };

  /** Traps Tab focus within a container, e.g. for a modal or mobile menu. */
  const trapFocus = (container) => {
    const focusable = qsa(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      container
    );
    if (!focusable.length) return () => {};
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeydown = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeydown);
    return () => container.removeEventListener('keydown', handleKeydown);
  };

  return { qs, qsa, debounce, throttle, formatDate, getGuestIdFromUrl, trapFocus };
})();

const MockAPI = (() => {
  const LATENCY_MS = 400;
  const STORAGE_KEYS = {
    rsvps: 'wedding_rsvps',
    memories: 'wedding_memories',
    likes: 'wedding_likes',
    comments: 'wedding_comments',
    guestbook: 'wedding_guestbook',
  };

  const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

  const readList = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  const writeList = (key, list) => localStorage.setItem(key, JSON.stringify(list));

  /** GET /invite/:guestId */
  const getInvite = async (guestId) => {
    const guest = WEDDING_CONTENT.guests[guestId] || WEDDING_CONTENT.guests.default;
    return delay({ guestId: guestId || 'default', ...guest });
  };

  /**
   * POST /rsvp
   * Always caches locally (so the "need to change something?" resume flow
   * has something to read back), and additionally posts to the Google Sheet
   * endpoint when one is configured (see scripts/google-apps-script/SETUP.md).
   * Falls back to the local-only mock when rsvpEndpoint isn't set yet, so
   * the form keeps working during development before that's configured.
   */
  const submitRSVP = async (payload) => {
    const rsvps = readList(STORAGE_KEYS.rsvps);
    const record = { id: crypto.randomUUID(), submittedAt: new Date().toISOString(), ...payload };
    rsvps.push(record);
    writeList(STORAGE_KEYS.rsvps, rsvps);

    const { rsvpEndpoint, rsvpSecret } = WEDDING_CONTENT.integrations || {};
    if (!rsvpEndpoint) {
      return delay({ success: true, record });
    }

    try {
      // text/plain avoids a CORS preflight OPTIONS request, which Apps
      // Script Web Apps don't handle. If submissions aren't reaching the
      // sheet, see SETUP.md's CORS fallback (mode: 'no-cors' below).
      const response = await fetch(rsvpEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...payload, secret: rsvpSecret }),
        // mode: 'no-cors', // fallback — see SETUP.md if the request above fails in the console
      });
      const result = await response.json();

      // The Apps Script can respond HTTP 200 with { success: false } (bad
      // secret, missing fields) without ever throwing — that's not a network
      // error, so the try/catch below won't see it. Treat it the same way:
      // the guest isn't blocked (local cache above already succeeded), but
      // this must not be silently indistinguishable from a real sheet write.
      if (result.success === false) {
        console.error('RSVP sheet submission rejected, saved locally only:', result.error);
        return { success: true, record, sheetError: true, sheetErrorReason: result.error };
      }

      return { ...result, record };
    } catch (err) {
      // The local cache above already succeeded, so the guest isn't blocked —
      // but surface this so it's visible during setup/testing.
      console.error('RSVP sheet submission failed, saved locally only:', err);
      return { success: true, record, sheetError: true };
    }
  };

  /** GET /events */
  const getEvents = async () => delay(WEDDING_CONTENT.events);

  /** GET /gallery */
  const getGallery = async () => delay(WEDDING_CONTENT.gallery);

  /** POST /memories */
  const submitMemory = async (payload) => {
    const memories = readList(STORAGE_KEYS.memories);
    const record = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      approved: false,
      ...payload,
    };
    memories.unshift(record);
    writeList(STORAGE_KEYS.memories, memories);
    return delay({ success: true, record });
  };

  /** GET /memories */
  const getMemories = async () => delay(readList(STORAGE_KEYS.memories));

  /** POST /comments */
  const submitComment = async ({ memoryId, author, text }) => {
    const memories = readList(STORAGE_KEYS.memories);
    const memory = memories.find((m) => m.id === memoryId);
    if (memory) {
      memory.comments.push({ author, text, createdAt: new Date().toISOString() });
      writeList(STORAGE_KEYS.memories, memories);
    }
    return delay({ success: true });
  };

  /** POST /likes */
  const submitLike = async ({ memoryId }) => {
    const memories = readList(STORAGE_KEYS.memories);
    const memory = memories.find((m) => m.id === memoryId);
    if (memory) {
      memory.likes += 1;
      writeList(STORAGE_KEYS.memories, memories);
    }
    return delay({ success: true, likes: memory ? memory.likes : 0 });
  };

  /** GET/POST guestbook (not in original API list, follows the same pattern) */
  const getGuestbook = async () => delay([...WEDDING_CONTENT.guestbook, ...readList(STORAGE_KEYS.guestbook)]);

  const submitGuestbookEntry = async ({ name, message }) => {
    const entries = readList(STORAGE_KEYS.guestbook);
    const record = { name, message, createdAt: new Date().toISOString() };
    entries.push(record);
    writeList(STORAGE_KEYS.guestbook, entries);
    return delay({ success: true, record });
  };

  return {
    getInvite,
    submitRSVP,
    getEvents,
    getGallery,
    submitMemory,
    getMemories,
    submitComment,
    submitLike,
    getGuestbook,
    submitGuestbookEntry,
  };
})();
