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

// prefill
if (searchInput && query) {
  searchInput.value = query;
}

// initial load
if (searchGrid) {
  if (query) {
    renderSearchResults(filterWallpapers(query));
  } else {
    renderSearchResults(allWallpapers); // default state
  }
}

// -------------------------------
// DEBOUNCE
function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// -------------------------------
// LIVE SEARCH
if (searchInput && searchGrid) {
  searchInput.addEventListener(
    'input',
    debounce((e) => {
      const q = e.target.value.trim();

      const url = new URL(window.location.href);

      if (q) url.searchParams.set('q', q);
      else url.searchParams.delete('q');

      window.history.replaceState({}, '', url);

      // 🔥 IMPORTANT FIX
      if (!q) {
        renderSearchResults(allWallpapers); // reset full grid
      } else {
        renderSearchResults(filterWallpapers(q));
      }
    }, 200)
  );
}

// -------------------------------
// FILTER
function filterWallpapers(q) {
  const term = String(q || '').toLowerCase().trim();
  if (!term) return [];

  return allWallpapers.filter(w => {
    const character = String(w.character || '').toLowerCase();
    const type = String(w.type || '').toLowerCase();

    const tags = Array.isArray(w.tags)
      ? w.tags.map(t => String(t || '').toLowerCase())
      : [];

    return (
      character.includes(term) ||
      type.includes(term) ||
      tags.some(tag => tag.includes(term))
    );
  });
}

// -------------------------------
// RENDER (NO "SHOWING RESULTS" LINE)
function renderSearchResults(list) {
  if (!searchGrid) return;

  searchGrid.innerHTML = '';

  // 🔥 ONLY EMPTY STATE MESSAGE
  if (!list.length) {
    searchGrid.innerHTML = `
      <div class="col-span-full flex items-center justify-center h-48 text-gray-400">
        No wallpapers found
      </div>
    `;
    return;
  }

  list.forEach(wallpaper => createCard(wallpaper, searchGrid));
}

// -------------------------------
// CARD
function createCard(wallpaper, grid) {

  const uniqueId = wallpaper.url;

  const wpData = window.wallpaperStorage.getWallpaper(
    uniqueId,
    wallpaper.character || 'Unknown'
  );

  const likes = wpData.likes;
  const views = wpData.views;

  const type = String(wallpaper.type || '');

  const isMobile = type === 'mobile';
  const isDesktop = type.includes('desktop');

  const mediaHeight = isMobile ? 'h-80' : 'h-60';
  const badgeBg = isDesktop ? 'bg-red-600' : 'bg-green-600';

  const card = document.createElement('div');

  card.className = `
    wallpaper-card break-inside-avoid overflow-hidden
    flex justify-center mb-6
  `;

  card.innerHTML = `
    <div class="
      relative group overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg

      ${isMobile
        ? 'w-[85%] sm:w-[70%] md:w-[60%]'
        : 'w-full'
      }
    ">

      <div class="loader-container absolute inset-0 flex items-center justify-center bg-black/40 z-10">
        <div class="loader"><div></div><div></div><div></div></div>
      </div>

      <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}"
         target="_blank"
         class="block">

        ${wallpaper.isVideo
          ? `<video loop muted playsinline
              class="wallpaper-img w-full object-cover opacity-0 transition duration-300 ${mediaHeight}">
              <source src="${wallpaper.url}">
            </video>`
          : `<img src="${wallpaper.url}"
              class="wallpaper-img w-full object-cover opacity-0 transition duration-300 ${mediaHeight}"/>`
        }

      </a>

      <span class="absolute top-3 left-3 ${badgeBg} text-white px-2 py-1 text-xs rounded">
        ${type}
      </span>

      <div class="flex justify-between items-center px-4 py-3 border-t border-gray-700">

        <a href="${wallpaper.download || wallpaper.url}"
           download
           class="bg-blue-600 px-3 py-1 text-white text-sm rounded">
          Download
        </a>

        <button class="likeBtn bg-green-600 px-3 py-1 text-white text-sm rounded">
          ❤️ ${formatNumber(likes)}
        </button>

      </div>

    </div>
  `;

  grid.appendChild(card);
}

// -------------------------------
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}
