/**
 * content.js
 * Single source of truth for all site copy, dates, events, and media.
 * Replace placeholder values here (and only here) when real details are ready —
 * no other file should hardcode couple names, dates, venues, or photo paths.
 */

const WEDDING_CONTENT = {
  couple: {
    partner1: 'Naisargi',
    partner2: 'Anubhav',
    hashtag: '#NaisargiAndAnubhav',
  },

  wedding: {
    isoDate: '2027-02-24',
    displayDate: 'February 24, 2027',
    city: 'Vadodara, Gujarat',
  },

  // Fill in after completing scripts/google-apps-script/SETUP.md. Until
  // rsvpEndpoint is set, RSVP submissions fall back to a localStorage-only
  // mock (see MockAPI.submitRSVP in js/utils.js) so the form still works
  // during development.
  integrations: {
    rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbyMUOsZlPEUyZ-x6_Tphlb7IsKwJiSQw6CX1LLnchkoegBU0mDht1051uICXdZgDyWl7g/exec',
    rsvpSecret: 'SEe48vQzOm2kdo7fKxpEEqhW',
  },

  invitation: {
    heading: "You're Invited",
    body: 'come celebrate the start of our forever',
  },

  story: [
    {
      year: '2024',
      label: 'The Beginning',
      title: 'Meeting Each Other',
      description: 'We met at our office at Meesho — and everything changed from there.',
      photo: 'assets/images/story-1.webp',
      photoAlt: 'Naisargi and Anubhav at the Meesho office, where they first met',
    },
    {
      year: '2025',
      label: 'Made It Official',
      title: 'Officially Started Dating',
      description: 'What began at the office became something more — and we made it official.',
      photo: 'assets/images/story-2.webp',
      photoAlt: 'Naisargi and Anubhav sharing a laugh together',
    },
    {
      year: '2026',
      label: 'She Said Yes',
      title: 'The Proposal',
      description: 'A question asked, and a yes that changed everything.',
      photo: 'assets/images/story-3.webp',
      photoAlt: 'The moment of the proposal',
    },
    {
      year: '2027',
      label: 'Forever Starts Here',
      title: 'Our Wedding',
      description: 'And now, surrounded by everyone we love, we begin our next chapter.',
      photo: 'assets/images/story-4.webp',
      photoAlt: 'Coming soon — the wedding day is still ahead of us',
    },
  ],

  events: [
    {
      id: 'mehendi',
      name: 'Mehendi',
      date: 'TBD',
      time: 'TBD',
      venue: 'TBD',
      address: null,
      mapUrl: null,
      dressCode: 'TBD',
      description: 'Intricate henna, live music, and an evening of celebration.',
    },
    {
      id: 'sangeet',
      name: 'Sangeet & Cocktails',
      date: 'TBD',
      time: 'TBD',
      venue: 'TBD',
      address: null,
      mapUrl: null,
      dressCode: 'TBD',
      description: 'A night of music, dance, and cocktails as our families come together.',
    },
    {
      id: 'haldi',
      name: 'Haldi',
      date: 'TBD',
      time: 'TBD',
      venue: 'TBD',
      address: null,
      mapUrl: null,
      dressCode: 'TBD',
      description: 'A joyful morning of turmeric, laughter, and family tradition.',
    },
    {
      id: 'wedding',
      name: 'Wedding',
      date: 'TBD',
      time: 'TBD',
      venue: 'TBD',
      address: null,
      mapUrl: null,
      dressCode: 'TBD',
      description: 'The ceremony uniting our two families as one.',
    },
  ],

  gallery: {
    // Flip to true once photos from the wedding are ready to publish.
    unlocked: false,
    lockedMessage: 'Gallery opens after the celebrations.',
    photos: [],
  },

  memories: {
    enabled: true,
    emptyStateMessage: 'Be the first to share a memory from the celebrations.',
  },

  film: {
    title: 'Our Wedding Film',
    videoUrl: '', // e.g. a YouTube/Vimeo embed URL, filled in during Phase 4
    thumbnail: 'assets/images/film-thumbnail.svg',
    thumbnailAlt: 'Wedding film cover still',
  },

  guestbook: [
    {
      name: 'The Families',
      message: 'Wishing you a lifetime of love and laughter. We cannot wait to celebrate with you.',
    },
  ],

  faqs: [
    {
      question: 'What should I wear?',
      answer: 'Each event has a suggested dress code listed in the Events section above.',
    },
    {
      question: 'Is there parking at the venue?',
      answer: 'Yes, on-site parking will be available at every venue.',
    },
    {
      question: 'Can I bring a plus one?',
      answer: 'Please refer to your invitation — the RSVP form will reflect your allotted guest count.',
    },
  ],

  /**
   * Mock guest directory used to personalize the site via ?guest=<id> until
   * a real backend (GET /invite/:guestId) replaces this in Step 9.
   */
  guests: {
    'anubhav-family': { displayName: 'Anubhav & Family', maxGuests: 4 },
    default: { displayName: 'Guest', maxGuests: 2 },
  },
};
