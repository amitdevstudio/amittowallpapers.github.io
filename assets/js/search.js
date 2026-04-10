import { wallpapers } from './wallpaper.js';

// -------------------------------
// FLATTEN DATA
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
const initialQuery = params.get('q') || '';

// -------------------------------
// CORE UTILITIES
const debounce = (fn, delay = 250) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// -------------------------------
// FILTER LOGIC - FIXED
const filterWallpapers = (query) => {
  const term = String(query || '').toLowerCase().trim();
  
  // EMPTY QUERY = SHOW ALL
  if (!term) return allWallpapers;

  return allWallpapers.filter(wp => {
    const char = String(wp.character || '').toLowerCase();
    const type = String(wp.type || '').toLowerCase();
    const tags = Array.isArray(wp.tags) ? wp.tags : [];

    return char.includes(term) || 
           type.includes(term) || 
           tags.some(tag => String(tag || '').toLowerCase().includes(term));
  });
};

// -------------------------------
// RENDER - NO CHANGES TO DESIGN
const renderSearchResults = (wallpapers) => {
  if (!searchGrid) return;

  searchGrid.innerHTML = '';

  if (!wallpapers?.length) {
    searchGrid.innerHTML = `
      <div class="col-span-full flex items-center justify-center h-48 text-gray-400">
        No wallpapers found
      </div>
    `;
    return;
  }

  wallpapers.forEach(w => searchGrid.appendChild(createCard(w)));
};

// -------------------------------
// ORIGINAL CARD DESIGN - UNCHANGED
const createCard = (w) => {
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

  // Loader logic
  const img = card.querySelector('.wallpaper-img');
  const loader = card.querySelector('.loader-container');
  
  const hideLoader = () => {
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }
  };

  if (img) {
    if (img.tagName === 'VIDEO') {
      img.addEventListener('loadeddata', hideLoader, { once: true });
    } else {
      img.addEventListener('load', hideLoader, { once: true });
      img.addEventListener('error', hideLoader, { once: true });
      if (img.complete) hideLoader();
    }
  }

  return card;
};

// -------------------------------
// INITIAL LOAD - FIXED
const init = () => {
  if (!searchGrid) {
    console.error('wallpaperGrid not found');
    return;
  }

  // Set input value from URL params
  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  // ALWAYS show all wallpapers first
  renderSearchResults(allWallpapers);
};

// -------------------------------
// LIVE SEARCH - FIXED
const setupSearch = () => {
  if (!searchInput || !searchGrid) return;

  const searchHandler = debounce((query) => {
    const results = filterWallpapers(query);
    renderSearchResults(results);

    // Update URL
    const url = new URL(window.location.href);
    const trimmedQuery = String(query || '').trim();
    if (trimmedQuery) {
      url.searchParams.set('q', trimmedQuery);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url);
  }, 200);

  searchInput.addEventListener('input', (e) => {
    searchHandler(e.target.value);
  });

  // ESC clears search
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchHandler('');
    }
  });
};

// -------------------------------
// EXECUTE
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupSearch();
});

// -------------------------------
// CSS (minimal)
const style = document.createElement('style');
style.textContent = `
  .loader {
    width: 40px; height: 40px;
    border: 4px solid #333; border-top: 4px solid #fff;
    border-radius: 50%; animation: spin 1s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loader-container { transition: opacity 0.3s ease; }
`;
document.head.appendChild(style);
