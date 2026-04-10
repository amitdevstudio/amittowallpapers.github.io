import { wallpapers } from './wallpaper.js';

// -------------------------------
// FLATTEN DATA SAFELY
const allWallpapers = [];

wallpapers.forEach(item => {

  if (Array.isArray(item.images)) {
    item.images.forEach(img => {
      allWallpapers.push({
        character: String(item.character || ''),
        type: String(item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags : [],
        url: img.url || '',
        download: img.url || '',
        date: img.date || new Date().toISOString(),
        isVideo: false
      });
    });
  }

  if (Array.isArray(item.videos)) {
    item.videos.forEach(video => {
      allWallpapers.push({
        character: String(item.character || ''),
        type: String(item.type || '').toLowerCase(),
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

// -------------------------------
// INIT LOAD (IMPORTANT FIX)
if (searchGrid) {
  if (query) {
    searchInput.value = query;
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
      const q = String(e.target.value || '').trim();

      const url = new URL(window.location.href);

      if (q) url.searchParams.set('q', q);
      else url.searchParams.delete('q');

      window.history.replaceState({}, '', url);

      // 🔥 RESET HANDLING FIX
      if (!q) {
        renderSearchResults(allWallpapers);
        return;
      }

      renderSearchResults(filterWallpapers(q));
    }, 150)
  );
}

// -------------------------------
// FILTER (100% SAFE)
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
// RENDER (NO HEADING, NO SPACE BUG)
function renderSearchResults(list) {
  if (!searchGrid) return;

  searchGrid.innerHTML = '';

  // 🔥 EMPTY STATE (NO EXTRA SPACE ISSUE)
  if (!list || list.length === 0) {
    searchGrid.innerHTML = `
      <div class="col-span-full flex items-center justify-center h-48 text-gray-400">
        No wallpapers found
      </div>
    `;
    return;
  }

  list.forEach(w => searchGrid.appendChild(createCard(w)));
}

// -------------------------------
// CARD
function createCard(w) {

  const card = document.createElement('div');

  const type = String(w.type || '');
  const isMobile = type === 'mobile';
  const isDesktop = type.includes('desktop');

  const height = isMobile ? 'h-80' : 'h-60';
  const badge = isDesktop ? 'bg-red-600' : 'bg-green-600';

  card.className = "wallpaper-card break-inside-avoid mb-6 flex justify-center";

  card.innerHTML = `
    <div class="
      relative group overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg
      ${isMobile ? 'w-[85%] sm:w-[70%] md:w-[60%]' : 'w-full'}
    ">

      <!-- LOADER -->
      <div class="loader-container absolute inset-0 flex items-center justify-center bg-black/40 z-20">
        <div class="loader"><div></div><div></div><div></div></div>
      </div>

      <a href="wallpaper.html?title=${encodeURIComponent(w.character)}&img=${encodeURIComponent(w.url)}"
         target="_blank"
         class="block">

        ${w.isVideo
          ? `<video class="wallpaper-img w-full object-cover ${height}" muted loop playsinline>
              <source src="${w.url}">
            </video>`
          : `<img src="${w.url}" class="wallpaper-img w-full object-cover ${height}"/>`
        }

      </a>

      <span class="absolute top-3 left-3 ${badge} text-white px-2 py-1 text-xs rounded">
        ${type}
      </span>

    </div>
  `;

  return card;
}

// -------------------------------
