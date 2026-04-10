import { wallpapers } from './wallpaper.js';

// -------------------------------
// FLATTEN DATA SAFELY
const allWallpapers = [];

wallpapers.forEach(item => {
  // Handle images
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

  // Handle videos
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
// INIT LOAD (FIXED)
function init() {
  if (!searchGrid || !searchInput) {
    console.warn('Required DOM elements not found');
    return;
  }

  // Set initial search input value
  searchInput.value = query;
  
  // Render initial results
  const initialResults = query ? filterWallpapers(query) : allWallpapers;
  renderSearchResults(initialResults);
}

// -------------------------------
// DEBOUNCE (IMPROVED)
function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// -------------------------------
// LIVE SEARCH (FIXED)
function setupSearch() {
  if (!searchInput || !searchGrid) return;

  const debouncedSearch = debounce((value) => {
    const url = new URL(window.location.href);
    
    if (value.trim()) {
      url.searchParams.set('q', value.trim());
    } else {
      url.searchParams.delete('q');
    }

    window.history.replaceState({}, '', url);
    renderSearchResults(value.trim() ? filterWallpapers(value) : allWallpapers);
  }, 250);

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });
}

// -------------------------------
// FILTER (OPTIMIZED)
function filterWallpapers(q) {
  const term = String(q || '').toLowerCase().trim();
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
// RENDER (FIXED - BETTER ERROR HANDLING)
function renderSearchResults(list) {
  if (!searchGrid) {
    console.warn('searchGrid element not found');
    return;
  }

  searchGrid.innerHTML = '';

  if (!list || list.length === 0) {
    searchGrid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center h-64 text-gray-400 text-center p-8">
        <div class="text-2xl mb-2">🔍</div>
        <div>No wallpapers found</div>
        <div class="text-sm mt-1">Try different keywords</div>
      </div>
    `;
    return;
  }

  list.forEach(w => {
    try {
      const card = createCard(w);
      searchGrid.appendChild(card);
    } catch (error) {
      console.warn('Failed to create card:', error, w);
    }
  });
}

// -------------------------------
// CARD (FIXED - BETTER VIDEO HANDLING & LAZY LOADING)
function createCard(w) {
  const card = document.createElement('div');
  const type = String(w.type || '').toLowerCase();
  const isMobile = type === 'mobile';
  const isDesktop = type.includes('desktop');
  
  const height = isMobile ? 'h-80' : 'h-60';
  const badgeColor = isDesktop ? 'bg-red-600' : 'bg-green-600';
  const widthClass = isMobile ? 'w-[85%] sm:w-[70%] md:w-[60%]' : 'w-full';

  card.className = "wallpaper-card break-inside-avoid mb-6 w-full flex justify-center";

  card.innerHTML = `
    <div class="
      relative group overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg hover:shadow-2xl transition-all duration-300
      ${widthClass}
      max-w-sm mx-auto
    ">
      <!-- LOADER -->
      <div class="loader-container absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 opacity-100 transition-opacity duration-500">
        <div class="loader w-12 h-12">
          <div></div><div></div><div></div>
        </div>
      </div>

      <!-- IMAGE/VIDEO CONTAINER -->
      <a href="wallpaper.html?title=${encodeURIComponent(w.character)}&img=${encodeURIComponent(w.url)}&download=${encodeURIComponent(w.download)}&isVideo=${w.isVideo}"
         target="_blank"
         class="block w-full h-full relative group-hover:scale-105 transition-transform duration-500">

        ${w.isVideo ? `
          <video 
            class="wallpaper-img w-full object-cover ${height} opacity-0 transition-opacity duration-700"
            muted 
            loop 
            playsinline 
            preload="none"
            poster="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
            data-loaded="false">
            <source src="${w.url}" type="video/mp4">
          </video>
        ` : `
          <img 
            src="${w.url}" 
            loading="lazy"
            class="wallpaper-img w-full object-cover ${height} opacity-0 transition-opacity duration-700"
            alt="${w.character} wallpaper"
            onerror="this.style.display='none';this.parentElement.querySelector('.loader-container').style.opacity='1'"
            data-loaded="false"/>
        `}

      </a>

      <!-- TYPE BADGE -->
      <span class="absolute top-3 left-3 ${badgeColor} text-white px-3 py-1 text-xs font-medium rounded-full shadow-md z-10">
        ${type.replace('desktop', 'PC').replace('mobile', 'Phone')}
      </span>

      <!-- CHARACTER NAME (OPTIONAL) -->
      ${w.character ? `
        <div class="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 text-xs rounded-lg truncate z-10">
          ${w.character}
        </div>
      ` : ''}
    </div>
  `;

  // Add image/video load handlers
  const media = card.querySelector('.wallpaper-img');
  const loader = card.querySelector('.loader-container');
  
  if (media) {
    media.addEventListener('load', () => {
      media.dataset.loaded = 'true';
      media.style.opacity = '1';
      if (loader) loader.style.opacity = '0';
    });
    
    if (media.tagName === 'VIDEO') {
      media.addEventListener('loadeddata', () => {
        media.dataset.loaded = 'true';
        media.style.opacity = '1';
        if (loader) loader.style.opacity = '0';
      });
      
      // Play on viewport intersection (performance)
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && media.dataset.loaded === 'true') {
            media.play().catch(() => {}); // Silent fail
          }
        });
      });
      observer.observe(media);
    }
  }

  return card;
}

// -------------------------------
// CSS FOR LOADER (ADD TO YOUR STYLESHEET)
const loaderCSS = `
<style>
.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.wallpaper-card { contain: layout style; }
</style>`;

// -------------------------------
// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
  // Inject loader CSS
  if (!document.querySelector('style[data-loader]')) {
    document.head.insertAdjacentHTML('beforeend', loaderCSS);
  }
  
  init();
  setupSearch();
});
