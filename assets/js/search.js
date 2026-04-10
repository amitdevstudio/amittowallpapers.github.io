import { wallpapers } from './wallpaper.js';

// -------------------------------
// FLATTEN ALL WALLPAPERS
const allWallpapers = [];

wallpapers.forEach(item => {
  if (Array.isArray(item.images)) {
    item.images.forEach(img => {
      allWallpapers.push({
        character: item.character || '',
        type: (item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags : [],
        url: img.url,
        download: img.url,
        date: img.date || new Date().toISOString(),
        isVideo: false
      });
    });
  }

  if (Array.isArray(item.videos)) {
    item.videos.forEach(video => {
      allWallpapers.push({
        character: item.character || '',
        type: (item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags : [],
        url: video.preview || '',
        download: video.download || video.preview || '',
        date: video.date || new Date().toISOString(),
        isVideo: true
      });
    });
  }
});

// -------------------------------
const searchGrid = document.getElementById('wallpaperGrid');
const searchInput = document.getElementById('searchInput');

const params = new URLSearchParams(window.location.search);
const query = params.get('q') || '';

// prefill input
if (searchInput && query) {
  searchInput.value = query;
}

// initial render
if (query && searchGrid) {
  const results = filterWallpapers(query);
  renderSearchResults(results, query);
}

// -------------------------------
// LIVE SEARCH (DEBOUNCED)
function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

if (searchInput && searchGrid) {
  searchInput.addEventListener(
    'input',
    debounce((e) => {
      const q = e.target.value.trim();

      // update URL without reload
      const url = new URL(window.location.href);
      if (q) url.searchParams.set('q', q);
      else url.searchParams.delete('q');
      window.history.replaceState({}, '', url);

      const results = filterWallpapers(q);
      renderSearchResults(results, q);
    }, 200)
  );
}

// -------------------------------
// FILTER LOGIC
function filterWallpapers(q) {
  const term = q.toLowerCase().trim();
  if (!term) return [];

  return allWallpapers.filter(w => {
    const character = (w.character || '').toLowerCase();
    const type = (w.type || '').toLowerCase();
    const tags = Array.isArray(w.tags) ? w.tags : [];

    return (
      character.includes(term) ||
      type.includes(term) ||
      tags.some(tag => (tag || '').toLowerCase().includes(term))
    );
  });
}

// -------------------------------
// RENDER RESULTS
function renderSearchResults(list, query) {
  if (!searchGrid) return;

  searchGrid.innerHTML = '';

  const heading = document.createElement('p');
  heading.className = 'col-span-full text-gray-400 text-sm mb-4 px-2';

  heading.textContent = list.length
    ? `Showing ${list.length} result${list.length !== 1 ? 's' : ''} for "${query}"`
    : `No results found for "${query}"`;

  searchGrid.appendChild(heading);

  if (!list.length) return;

  list.forEach(wallpaper => createCard(wallpaper, searchGrid));
}

// -------------------------------
// CARD CREATION
function createCard(wallpaper, grid) {

  const uniqueId = wallpaper.url; // FIXED
  const characterName = wallpaper.character || 'Unknown';

  const wpData = window.wallpaperStorage.getWallpaper(uniqueId, characterName);
  let likes = wpData.likes;
  let views = wpData.views;

  const type = wallpaper.type || '';
  const isMobile = type === 'mobile';
  const isDesktop = type.includes('desktop');

  const mediaHeight = isMobile ? 'h-80' : 'h-60';
  const badgeBg = isDesktop ? 'bg-red-600' : 'bg-green-600';

  const card = document.createElement('div');
  card.className =
    "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6";

  card.innerHTML = `
    <div class="relative group overflow-hidden rounded-t-lg">

      <div class="loader-container absolute inset-0 flex items-center justify-center bg-black/40 z-10">
        <div class="loader"><div></div><div></div><div></div></div>
      </div>

      <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}"
         target="_blank"
         class="block">

        ${wallpaper.isVideo
          ? `<video loop muted playsinline
              class="wallpaper-img w-full object-fill mx-auto opacity-0 transition duration-300 group-hover:scale-105 group-hover:brightness-110 ${mediaHeight}">
              <source src="${wallpaper.url}" type="video/mp4">
             </video>`
          : `<img src="${wallpaper.url}"
              class="wallpaper-img w-full object-fill mx-auto opacity-0 transition duration-300 group-hover:scale-105 group-hover:brightness-110 ${mediaHeight}"/>`
        }

      </a>

      <span class="absolute z-20 top-3 left-3 ${badgeBg} text-white px-2 py-1 text-xs rounded-lg pointer-events-none">
        ${type}
      </span>

    </div>

    <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
      <div class="flex gap-2">

        <a href="${wallpaper.download || wallpaper.url}"
           download
           class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm">
          Download
        </a>

        <button class="likeBtn bg-green-600 px-3 py-1 rounded text-white text-sm">
          <i class="likeIcon far fa-thumbs-up mr-1"></i>
          <span class="likeCount">${formatNumber(likes)}</span>
        </button>

      </div>

      <div class="text-xs text-gray-400">
        👁 ${formatNumber(views)}
      </div>
    </div>

    <div class="px-4 py-4 flex flex-wrap gap-2 text-sm">
      ${(wallpaper.tags || [])
        .map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`)
        .join('')}
    </div>
  `;

  grid.appendChild(card);

  // ---------------- LOADER
  const media = card.querySelector('.wallpaper-img');
  const loader = card.querySelector('.loader-container');

  function hideLoader() {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      media.style.opacity = '1';
    }, 300);
  }

  if (wallpaper.isVideo) {
    media.addEventListener('loadeddata', hideLoader, { once: true });
    media.addEventListener('canplay', hideLoader, { once: true });

    setTimeout(() => {
      if (loader.style.display !== 'none') hideLoader();
    }, 4000);

    card.addEventListener('mouseenter', () => media.play().catch(() => {}));
    card.addEventListener('mouseleave', () => {
      media.pause();
      media.currentTime = 0;
    });
  } else {
    if (media.complete && media.naturalWidth > 0) {
      hideLoader();
    } else {
      media.addEventListener('load', hideLoader, { once: true });
      media.addEventListener('error', hideLoader, { once: true });
    }
  }

  // ---------------- LIKE SYSTEM
  const likeBtn = card.querySelector('.likeBtn');
  const likeIcon = card.querySelector('.likeIcon');
  const likeCount = card.querySelector('.likeCount');

  const isLiked = window.wallpaperStorage.getUserLiked(uniqueId);

  likeIcon.classList.toggle('fas', isLiked);
  likeIcon.classList.toggle('far', !isLiked);

  likeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const current = window.wallpaperStorage.getUserLiked(uniqueId);
    const next = !current;

    const updatedLikes = window.wallpaperStorage.updateLikes(
      uniqueId,
      next ? 1 : -1
    );

    window.wallpaperStorage.setUserLiked(uniqueId, next);

    likeCount.innerText = formatNumber(updatedLikes);

    likeIcon.classList.toggle('fas', next);
    likeIcon.classList.toggle('far', !next);
  });
}

// -------------------------------
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}
