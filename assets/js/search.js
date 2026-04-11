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
// DEBOUNCE
const debounce = (fn, delay = 250) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// -------------------------------
// FILTER
const filterWallpapers = (query) => {
  const term = String(query || '').toLowerCase().trim();

  if (!term) return [];

  return allWallpapers.filter(wp => {
    const char = wp.character.toLowerCase();
    const type = wp.type.toLowerCase();

    return (
      char.includes(term) ||
      type.includes(term) ||
      wp.tags.some(tag => tag.toLowerCase().includes(term))
    );
  });
};

// -------------------------------
// RENDER
const renderSearchResults = (wallpapers) => {
  if (!searchGrid) return;

  searchGrid.innerHTML = '';

  if (!wallpapers.length) {
    searchGrid.innerHTML = `
      <div class="col-span-full flex items-center justify-center h-48 text-gray-400">
        No wallpapers found
      </div>
    `;
    return;
  }

  wallpapers.forEach(w => {
    searchGrid.appendChild(createCard(w));
  });
};

// -------------------------------
// CARD
const createCard = (w) => {
  const card = document.createElement('div');

  const isMobile = w.type === 'mobile';
  const isDesktop = w.type.includes('desktop');

  const height = isMobile ? 'h-80' : 'h-60';
  const badge = isDesktop ? 'bg-red-600' : 'bg-green-600';

  card.className = "wallpaper-card break-inside-avoid mb-6 flex justify-center";

  card.innerHTML = `
    <div class="relative group overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg
      ${isMobile ? 'w-[85%] sm:w-[70%] md:w-[60%]' : 'w-full'}">

      <div class="loader-container absolute inset-0 flex items-center justify-center bg-black/40 z-20">
        <div class="loader"></div>
      </div>

      <a href="wallpaper.html?title=${encodeURIComponent(w.character)}&img=${encodeURIComponent(w.url)}"
         target="_blank" class="block">

        ${
          w.isVideo
            ? `<video class="wallpaper-img w-full object-cover ${height}" muted loop playsinline>
                <source src="${w.url}">
               </video>`
            : `<img src="${w.url}" class="wallpaper-img w-full object-cover ${height}" />`
        }

      </a>

      <span class="absolute top-3 left-3 ${badge} text-white px-2 py-1 text-xs rounded">
        ${w.type}
      </span>
    </div>
  `;

  const media = card.querySelector('.wallpaper-img');
  const loader = card.querySelector('.loader-container');

  // hide media initially
  if (media) {
    media.style.opacity = '0';
    media.style.transition = 'opacity 0.4s ease';
  }

  const hideLoader = () => {
    if (loader) {
      loader.style.opacity = '0';

      if (media) media.style.opacity = '1';

      setTimeout(() => loader.remove(), 300);
    }
  };

  if (media) {
    if (media.tagName === 'VIDEO') {
      media.addEventListener('loadeddata', () => {
        media.play().catch(() => {});
        hideLoader();
      }, { once: true });
    } else {
      media.addEventListener('load', hideLoader, { once: true });
      media.addEventListener('error', hideLoader, { once: true });
      if (media.complete) hideLoader();
    }
  }

  return card;
};

// -------------------------------
// INIT
const init = () => {
  if (!searchGrid) return;

  // Set input from URL
  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  if (initialQuery) {
    renderSearchResults(filterWallpapers(initialQuery));
  } else {
    // show nothing initially (clean UX)
    searchGrid.innerHTML = `
      <div class="col-span-full flex items-center justify-center h-48 text-gray-400">
        Start typing to search wallpapers...
      </div>
    `;
  }
};

// -------------------------------
// SEARCH
const setupSearch = () => {
  if (!searchInput) return;

  const handleSearch = debounce((query) => {
    const results = filterWallpapers(query);
    renderSearchResults(results);

    // update URL
    const url = new URL(window.location.href);
    if (query.trim()) {
      url.searchParams.set('q', query.trim());
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url);
  }, 200);

  searchInput.addEventListener('input', (e) => {
    handleSearch(e.target.value);
  });

  // ESC clears search
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      handleSearch('');
    }
  });
};

// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupSearch();
});

// -------------------------------
// CSS
const style = document.createElement('style');
style.textContent = `
.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loader-container {
  transition: opacity 0.3s ease;
}
`;
document.head.appendChild(style);
