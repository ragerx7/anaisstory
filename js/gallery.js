/**
 * gallery.js
 * Official Gallery (locked pre-wedding, filterable masonry post-wedding) and
 * the Guest Memories feed (uploads, likes, comments, infinite scroll).
 */

const Gallery = (() => {
  const MEMORIES_PAGE_SIZE = 6;
  let memoriesCache = [];
  let memoriesRendered = 0;
  let memoriesSentinelObserver;

  /* ---- Official gallery ------------------------------------------------ */

  const renderLockedGallery = (container) => {
    container.innerHTML = `
      <div class="gallery-locked" data-reveal>
        <div class="gallery-locked__frame">
          <svg class="gallery-locked__seal" viewBox="0 0 34 34" aria-hidden="true">
            <path d="M17,29 C8,22.5 3.5,17 3.5,11.5 C3.5,6.5 7.5,3.5 11.5,3.5 C13.8,3.5 15.8,4.7 17,6.7 C18.2,4.7 20.2,3.5 22.5,3.5 C26.5,3.5 30.5,6.5 30.5,11.5 C30.5,17 26,22.5 17,29 Z" fill="var(--color-accent)" />
          </svg>
        </div>
        <p>${WEDDING_CONTENT.gallery.lockedMessage}</p>
      </div>`;
  };

  const renderUnlockedGallery = (container, photos) => {
    const categories = ['all', ...new Set(photos.map((p) => p.category))];

    container.innerHTML = `
      <div class="gallery-filters" role="tablist" aria-label="Filter gallery by event">
        ${categories
          .map(
            (cat, i) => `
            <button type="button" class="filter-pill ${i === 0 ? 'is-active' : ''}" role="tab"
              aria-selected="${i === 0}" data-filter="${cat}">${cat}</button>`
          )
          .join('')}
      </div>
      <div class="gallery-grid" id="gallery-grid"></div>`;

    const grid = Utils.qs('#gallery-grid', container);
    const renderGrid = (filter) => {
      const filtered = filter === 'all' ? photos : photos.filter((p) => p.category === filter);
      grid.innerHTML = filtered
        .map(
          (photo) => `
          <figure class="gallery-item">
            <img src="${photo.src}" alt="${photo.alt}" loading="lazy" />
          </figure>`
        )
        .join('');
    };
    renderGrid('all');

    Utils.qsa('.filter-pill', container).forEach((pill) => {
      pill.addEventListener('click', () => {
        Utils.qsa('.filter-pill', container).forEach((p) => {
          p.classList.remove('is-active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('is-active');
        pill.setAttribute('aria-selected', 'true');
        renderGrid(pill.dataset.filter);
      });
    });
  };

  const initOfficialGallery = async () => {
    const container = Utils.qs('#gallery-content');
    if (!container) return;
    const gallery = await MockAPI.getGallery();
    if (!gallery.unlocked || !gallery.photos.length) {
      renderLockedGallery(container);
    } else {
      renderUnlockedGallery(container, gallery.photos);
    }
    if (typeof Animations !== 'undefined') Animations.revealNew();
  };

  /* ---- Guest memories ---------------------------------------------------- */

  const memoryCardHtml = (memory) => `
    <article class="memory-card" data-id="${memory.id}" data-reveal>
      ${memory.imageDataUrl ? `<img src="${memory.imageDataUrl}" alt="Memory shared by ${memory.authorName}" loading="lazy" />` : ''}
      <div class="memory-card__body">
        <p class="memory-card__caption"><strong>${memory.authorName}</strong> ${memory.caption || ''}</p>
        <div class="memory-card__actions">
          <button type="button" class="memory-like" aria-label="Like this memory">
            <span data-lucide="heart" aria-hidden="true"></span> <span class="memory-like__count">${memory.likes}</span>
          </button>
          <button type="button" class="memory-comment-toggle" aria-label="Comment on this memory">
            <span data-lucide="message-circle" aria-hidden="true"></span> <span>${memory.comments.length}</span>
          </button>
        </div>
        <div class="memory-card__comments" hidden>
          <ul>
            ${memory.comments.map((c) => `<li><strong>${c.author}:</strong> ${c.text}</li>`).join('')}
          </ul>
          <form class="memory-comment-form">
            <label class="visually-hidden" for="comment-${memory.id}">Add a comment</label>
            <input id="comment-${memory.id}" type="text" placeholder="Add a comment" required />
            <button type="submit" class="btn btn--outline btn--small">Post</button>
          </form>
        </div>
      </div>
    </article>`;

  const wireMemoryCard = (feed, memory) => {
    const card = Utils.qs(`[data-id="${memory.id}"]`, feed);
    if (!card) return;

    Utils.qs('.memory-like', card).addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      const result = await MockAPI.submitLike({ memoryId: memory.id });
      Utils.qs('.memory-like__count', btn).textContent = result.likes;
      btn.disabled = false;
    });

    Utils.qs('.memory-comment-toggle', card).addEventListener('click', () => {
      const commentsEl = Utils.qs('.memory-card__comments', card);
      commentsEl.hidden = !commentsEl.hidden;
    });

    Utils.qs('.memory-comment-form', card).addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = Utils.qs('input', e.currentTarget);
      const text = input.value.trim();
      if (!text) return;
      const author = (window.currentGuest && window.currentGuest.displayName) || 'Guest';
      await MockAPI.submitComment({ memoryId: memory.id, author, text });
      Utils.qs('ul', card).insertAdjacentHTML('beforeend', `<li><strong>${author}:</strong> ${text}</li>`);
      memory.comments.push({ author, text });
      Utils.qs('.memory-comment-toggle span:last-child', card).textContent = memory.comments.length;
      input.value = '';
    });
  };

  const renderNextMemoriesPage = (feed) => {
    const nextBatch = memoriesCache.slice(memoriesRendered, memoriesRendered + MEMORIES_PAGE_SIZE);
    nextBatch.forEach((memory) => {
      feed.insertAdjacentHTML('beforeend', memoryCardHtml(memory));
      wireMemoryCard(feed, memory);
    });
    memoriesRendered += nextBatch.length;

    const sentinel = Utils.qs('#memories-sentinel', feed.parentElement);
    if (sentinel) sentinel.style.display = memoriesRendered >= memoriesCache.length ? 'none' : 'block';
    if (typeof Animations !== 'undefined') Animations.revealNew();
  };

  const setupInfiniteScroll = (feed) => {
    const sentinel = document.createElement('div');
    sentinel.id = 'memories-sentinel';
    feed.parentElement.appendChild(sentinel);

    if (memoriesSentinelObserver) memoriesSentinelObserver.disconnect();
    memoriesSentinelObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) renderNextMemoriesPage(feed);
    });
    memoriesSentinelObserver.observe(sentinel);
  };

  const refreshMemoriesFeed = async () => {
    const feed = Utils.qs('#memories-feed');
    if (!feed) return;
    memoriesCache = await MockAPI.getMemories();
    memoriesRendered = 0;
    feed.innerHTML = '';

    if (!memoriesCache.length) {
      feed.innerHTML = `<p class="memories-empty">${WEDDING_CONTENT.memories.emptyStateMessage}</p>`;
      return;
    }

    renderNextMemoriesPage(feed);
    setupInfiniteScroll(feed);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  const setupUploadForm = () => {
    const form = Utils.qs('#memory-upload-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = Utils.qs('#memory-photo', form);
      const captionInput = Utils.qs('#memory-caption', form);
      const status = Utils.qs('.form-status', form);
      const file = fileInput.files[0];

      if (!file) {
        status.textContent = 'Please choose a photo to upload.';
        status.dataset.state = 'error';
        return;
      }

      status.textContent = 'Uploading...';
      status.dataset.state = 'pending';

      const reader = new FileReader();
      reader.onload = async () => {
        await MockAPI.submitMemory({
          authorName: (window.currentGuest && window.currentGuest.displayName) || 'Guest',
          caption: captionInput.value.trim(),
          imageDataUrl: reader.result,
        });
        form.reset();
        status.textContent = 'Thanks for sharing! Your memory is pending approval.';
        status.dataset.state = 'success';
        refreshMemoriesFeed();
      };
      reader.readAsDataURL(file);
    });
  };

  const init = async () => {
    setupUploadForm();
    await Promise.all([initOfficialGallery(), refreshMemoriesFeed()]);
  };

  return { init };
})();
