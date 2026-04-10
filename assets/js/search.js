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
// DEBOUNCE UTILITY
function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// -------------------------------
// FIXED FILTER (EMPTY = ALL WALLPAPERS)
function filterWallpapers(q) {
  const term = String(q || '').toLowerCase().trim();
  
  // 🔥 KEY FIX: empty search returns ALL wallpapers
  if (!term) return allWallpapers;

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

  // Empty state
  if (!list || list.length === 0) {
    searchGrid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center h-64 text-gray-400 text-center p-8">
        <div class="text-4xl mb-4">🔍</div>
        <div class="text-xl font-medium mb-2">No wallpapers found</div>
        <div class="text-sm">Try searching for characters, types, or tags</div>
      </div>
    `;
    return;
  }

  // Render cards
  const fragment = document.createDocumentFragment();
  list.forEach(w => {
    try {
      fragment.appendChild(createCard(w));
    } catch (error) {
      console.warn('Failed to create card:', w);
    }
  });
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
    <div class="
      relative group overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black/90 
      shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-800/50
      ${widthClass} max-w-sm mx-auto
    ">
      
      <!-- LOADER -->
      <div class="loader-container absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
        <div class="loader w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>

      <!-- MEDIA -->
      <a href="wallpaper.html?title=${encodeURIComponent(w.character)}&img=${encodeURIComponent(w.url)}&download=${encodeURIComponent(w.download)}&isVideo=${w.isVideo}"
         target="_blank"
         class="block w-full h-full group-hover:scale-[1.02] transition-transform duration-700">
        
        ${w.isVideo ? `
          <video class="wallpaper-img w-full object-cover ${height}" 
                 muted loop playsinline preload="none"
                 poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPlZpZGVvPC90ZXh0Pjwvc3ZnPg==">
            <source src="${w.url}" type="video/mp4">
          </video>
        ` : `
          <img class="wallpaper-img w-full object-cover ${height}" 
               src="${w.url}" 
               loading="lazy"
               alt="${w.character} wallpaper"
               onerror="this.parentElement.querySelector('.loader-container').classList.add('fade-out')"
               data-loaded="false"/>
        `}

      </a>

      <!-- TYPE BADGE -->
      <span class="absolute top-4 left-4 z-20 ${badgeColor} text-white px-3 py-1.5 text-xs font-semibold rounded-full shadow-lg">
        ${type.includes('desktop') ? '🖥️ PC' : '📱 Phone'}
      </span>

      <!-- CHARACTER NAME -->
      <div class="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 text-sm font-semibold rounded-xl truncate z-20 shadow-2xl">
        ${w.character}
      </div>
    </div>
  `;

  // Media load handlers
  const media = card.querySelector('.wallpaper-img');
  const loader = card.querySelector('.loader-container');
  
  const hideLoader = () => {
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 300);
    }
    if (media) media.dataset.loaded = 'true';
  };

  if (media) {
    if (media.tagName === 'VIDEO') {
      media.addEventListener('loadeddata', hideLoader, { once: true });
      media.addEventListener('mouseenter', () => media.play().catch(() => {}));
      media.addEventListener('mouseleave', () => {
        media.pause();
        media.currentTime = 0;
      });
    } else {
      media.addEventListener('load', hideLoader, { once: true });
      media.addEventListener('error', hideLoader, { once: true });
      
      // Immediate check
      if (media.complete && media.naturalWidth > 0) {
        hideLoader();
      }
    }
  }

  return card;
}

// -------------------------------
// FIXED INITIALIZATION (KEY FIX HERE)
function initSearch() {
  if (!searchGrid || !searchInput) {
    console.warn('Search DOM elements not found');
    return;
  }

  // 1. Set input value from URL (NO auto-search)
  if (query) {
    searchInput.value = query;
  }

  // 2. ALWAYS start with ALL wallpapers
  renderSearchResults(allWallpapers);
}

// -------------------------------
// LIVE SEARCH HANDLER
function setupLiveSearch() {
  if (!searchInput || !searchGrid) return;

  const debouncedSearch = debounce((searchTerm) => {
    const trimmedTerm = String(searchTerm || '').trim();
    
    // Update URL
    const url = new URL(window.location.href);
    if (trimmedTerm) {
      url.searchParams.set('q', trimmedTerm);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url);

    // Render results
    if (trimmedTerm) {
      renderSearchResults(filterWallpapers(trimmedTerm));
    } else {
      renderSearchResults(allWallpapers); // Show ALL when empty
    }
  }, 250);

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  // Clear button support
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      debouncedSearch('');
    }
  });
}

// -------------------------------
// CSS INJECTION
const style = document.createElement('style');
style.textContent = `
  .wallpaper-card { contain: layout style paint; }
  .loader-container { 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  }
  .loader-container.fade-out { 
    opacity: 0 !important; 
    pointer-events: none; 
  }
  .wallpaper-img { 
    transition: opacity 0.5s ease, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94); 
  }
  .wallpaper-img[data-loaded="true"] { opacity: 1; }
`;
style.setAttribute('data-search-styles', '');
document.head.appendChild(style);

// -------------------------------
// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  setupLiveSearch();
});

// Export for testing (optional)
window.searchDebug = { allWallpapers, filterWallpapers };
