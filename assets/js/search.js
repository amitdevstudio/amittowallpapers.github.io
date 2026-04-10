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
// SEARCH LOGIC — reads ?q= from the URL
const searchGrid = document.getElementById('wallpaperGrid');
const searchInput = document.getElementById('searchInput');

const params = new URLSearchParams(window.location.search);
const query = params.get('q') || '';

// Pre-fill the search input with the current query
if (searchInput && query) {
  searchInput.value = query;
}

// Run search on load if there's a query param
if (query && searchGrid) {
  const results = filterWallpapers(query);
  renderSearchResults(results, query);
}

// Re-run search on Enter keypress (also updates the URL)
if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      const url = new URL(window.location.href);
      if (q) { url.searchParams.set('q', q); } else { url.searchParams.delete('q'); }
      window.location.href = url.toString();
    }
  });
}

// -------------------------------
// FILTER: matches character name, tags, or type
function filterWallpapers(q) {
  const term = q.toLowerCase().trim();
  if (!term) return [];

  return allWallpapers.filter(w => {
    return (
      w.character.toLowerCase().includes(term) ||
      w.type.includes(term) ||
      w.tags.some(tag => tag.toLowerCase().includes(term))
    );
  });
}

// -------------------------------
// RENDER SEARCH RESULTS into #wallpaperGrid
function renderSearchResults(list, query) {
  if (!searchGrid) return;

  searchGrid.innerHTML = '';

  // Show a result count heading
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
// CARD BUILDER
function createCard(wallpaper, grid) {

  const uniqueId = wallpaper.url || wallpaper.preview;
  const characterName = wallpaper.character || 'Unknown';

  const wpData = window.wallpaperStorage.getWallpaper(uniqueId, characterName);
  let likes = wpData.likes;
  let views = wpData.views;

  const isMobile = wallpaper.type === 'mobile';
  const isDesktop = wallpaper.type.includes('desktop');
  const mediaHeight = isMobile ? 'h-80' : 'h-60';
  const badgeBg = isDesktop ? 'bg-red-600' : 'bg-green-600';

  const card = document.createElement('div');
  card.className =
    "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6";

  // FIX: relative wrapper OUTSIDE <a> so loader + badge position correctly
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
        ${wallpaper.type}
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
      ${wallpaper.tags
        .map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`)
        .join('')}
    </div>
  `;

  grid.appendChild(card);

  // ---------------- LOADER FIX (same as latest.js)
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
    if (media.readyState >= 2) {
      hideLoader();
    } else {
      media.addEventListener('loadeddata', hideLoader, { once: true });
      setTimeout(() => {
        if (loader.style.display !== 'none') hideLoader();
      }, 4000);
    }

    card.addEventListener('mouseenter', () => media.play().catch(() => {}));
    card.addEventListener('mouseleave', () => {
      media.pause();
      media.currentTime = 0;
    });
  } else {
    // FIX: handle cached images that are already .complete
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
    const updatedLikes = window.wallpaperStorage.updateLikes(
      uniqueId,
      current ? -1 : 1
    );

    window.wallpaperStorage.setUserLiked(uniqueId, !current);

    likeCount.innerText = formatNumber(updatedLikes);
    likeIcon.classList.toggle('fas');
    likeIcon.classList.toggle('far');
  });
}

// -------------------------------
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}
