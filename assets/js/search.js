import { wallpapers } from './wallpaper.js';

// -------------------------------
// FLATTEN ALL DATA (SAFE)
const allWallpapers = [];

wallpapers.forEach(item => {
  // Images
  if (Array.isArray(item.images)) {
    item.images.forEach(img => {
      allWallpapers.push({
        character: String(item.character || ''),
        type: String(item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags.map(t => String(t || '')) : [],
        url: img.url || '',
        download: img.url || '',
        date: img.date || new Date().toISOString(),
        isVideo: false
      });
    });
  }

  // Videos
  if (Array.isArray(item.videos)) {
    item.videos.forEach(video => {
      allWallpapers.push({
        character: String(item.character || ''),
        type: String(item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags.map(t => String(t || '')) : [],
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
// DEBOUNCE
function debounce(fn, delay = 250) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// -------------------------------
// 🔥 FIXED FILTER - EMPTY RETURNS ALL
function filterWallpapers(q) {
  const term = String(q || '').toLowerCase().trim();
  
  // CRITICAL FIX: Empty search = ALL wallpapers
  if (term.length === 0) {
    return allWallpapers;
  }

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
// RENDER RESULTS
function renderSearchResults(list) {
  if (!searchGrid) {
    console.warn('searchGrid not found');
    return;
  }

  searchGrid.innerHTML = '';

  if (!list || list.length === 0) {
    searchGrid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center h-64 p-8 text-center">
        <div class="text-4xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-300 mb-2">No Results Found</h3>
        <p class="text-gray-500">Try different keywords like character names or tags</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  list.forEach(w => fragment.appendChild(createCard(w)));
  searchGrid.appendChild(fragment);
}

// -------------------------------
// CREATE CARD
function createCard(w) {
  const card = document.createElement('div');
  const type = String(w.type || '').toLowerCase();
  const isMobile = type.includes('mobile');
  const isDesktop = type.includes('desktop');
  
  const height = isMobile ? 'h-80' : 'h-60';
  const badgeColor = isDesktop ? 'bg-red-600' : 'bg-green-600';
  const widthClass = isMobile ? 'w-[85%] sm:w-[70%] md:w-[60%]' : 'w-full';

  card.className = 'wallpaper-card break-inside-avoid mb-6 w-full flex justify-center';

  card.innerHTML = `
    <div class="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-black/95 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-slate-800/50 ${widthClass} max-w-sm mx-auto">
      
      <!-- LOADER -->
      <div class="loader-container absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20 transition-opacity duration-300">
        <div class="w-12 h-12 border-4 border-slate-600/50 border-t-white rounded-full animate-spin"></div>
      </div>

      <!-- LINK -->
      <a href="wallpaper.html?title=${encodeURIComponent(w.character)}&img=${encodeURIComponent(w.url)}&download=${encodeURIComponent(w.download)}&isVideo=${w.isVideo}" target="_blank" class="block w-full h-full relative group-hover:scale-[1.02] transition-all duration-700">

        ${w.isVideo ? `
          <video class="wallpaper-img w-full object-cover ${height} opacity-0 transition-opacity duration-700" muted loop playsinline preload="metadata">
            <source src="${w.url}" type="video/mp4">
          </video>
        ` : `
          <img class="wallpaper-img w-full object-cover ${height} opacity-0 transition-opacity duration-700" 
               src="${w.url}" loading="lazy" alt="${w.character} wallpaper" 
               onerror="this.closest('.wallpaper-card').querySelector('.loader-container').classList.add('opacity-0')"/>
        `}

      </a>

      <!-- BADGE -->
      <span class="absolute top-4 left-4 z-30 ${badgeColor} text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-lg">
        ${isDesktop ? '🖥️ PC' : '📱 Mobile'}
      </span>

      <!-- CHARACTER -->
      <div class="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md text-white px-4 py-2 text-sm font-semibold rounded-xl truncate z-30 shadow-2xl">
        ${w.character}
      </div>

    </div>
  `;

  // Loader handlers
  const media = card.querySelector('.wallpaper-img');
  const loader = card.querySelector('.loader-container');
  
  if (media && loader) {
    const hideLoader = () => {
      loader.classList.add('opacity-0');
      media.classList.remove('opacity-0');
      setTimeout(() => loader.remove(), 300);
    };

    if (media.tagName === 'VIDEO') {
      media.addEventListener('loadeddata', hideLoader, { once: true });
      card.addEventListener('mouseenter', () => media.play().catch(() => {}));
      card.addEventListener('mouseleave', () => {
        media.pause();
        media.currentTime = 0;
      });
    } else {
      media.addEventListener('load', hideLoader, { once: true });
      media.addEventListener('error', hideLoader, { once: true });
      
      if (media.complete && media.naturalWidth > 0) {
        hideLoader();
      }
    }
  }

  return card;
}

// -------------------------------
// 🔥 FIXED INITIALIZATION
function initSearch() {
  if (!searchGrid) {
    console.warn('searchGrid element missing');
    return;
  }

  if (searchInput && query) {
    searchInput.value = query; // Set input from URL
  }

  // ALWAYS start with ALL wallpapers
  console.log(`🌟 Initial load: ${allWallpapers.length} wallpapers`);
  renderSearchResults(allWallpapers);
}

// -------------------------------
// 🔥 FIXED LIVE SEARCH
function setupLiveSearch() {
  if (!searchInput || !searchGrid) return;

  const debouncedSearch = debounce((value) => {
    const trimmedValue = String(value || '').trim();
    
    // Update URL
    const url = new URL(window.location.href);
    if (trimmedValue.length > 0) {
      url.searchParams.set('q', trimmedValue);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url);

    // FIXED LOGIC: Filter ONLY when there's a search term
    const results = trimmedValue.length > 0 
      ? filterWallpapers(trimmedValue)
      : allWallpapers;

    console.log(`🔍 "${trimmedValue}" → ${results.length} results`);
    renderSearchResults(results);
  }, 250);

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  // ESC clears search
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.target.value = '';
      debouncedSearch('');
    }
  });
}

// -------------------------------
// STYLES
if (!document.querySelector('style[data-search]')) {
  const style = document.createElement('style');
  style.setAttribute('data-search', '');
  style.textContent = `
    .wallpaper-card { contain: layout style paint; }
    .loader-container { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
    .wallpaper-img { transition: opacity 0.6s ease-out; }
  `;
  document.head.appendChild(style);
}

// -------------------------------
// INIT ON DOM READY
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  setupLiveSearch();
});

// Debug export
window.__searchDebug = { allWallpapers, filterWallpapers };
