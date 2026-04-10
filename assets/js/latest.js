import { wallpapers } from './wallpaper.js';

const latestGrid = document.getElementById('latestwallpaperGrid');
const showMoreBtn = document.getElementById('latest-show-more');

const latestWallpapers = [];

// -------------------------------
// FLATTEN DATA (Naruto filter + SAFE)
wallpapers.forEach(item => {
  if (Array.isArray(item.tags) && item.tags.includes('Naruto')) {
    // Images
    if (Array.isArray(item.images)) {
      item.images.forEach(img => {
        latestWallpapers.push({
          id: `${item.character}-${img.url?.slice(-20)}`,
          character: String(item.character || 'Unknown'),
          type: String(item.type || 'desktop').toLowerCase(),
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
        latestWallpapers.push({
          id: `${item.character}-${video.preview?.slice(-20)}`,
          character: String(item.character || 'Unknown'),
          type: String(item.type || 'desktop').toLowerCase(),
          tags: Array.isArray(item.tags) ? item.tags.map(t => String(t || '')) : [],
          url: video.preview || '',
          download: video.download || video.preview || '',
          date: video.date || new Date().toISOString(),
          isVideo: true
        });
      });
    }
  }
});

// -------------------------------
// SORT NEWEST FIRST (SAFE DATE HANDLING)
latestWallpapers.sort((a, b) => {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();
  return dateB - dateA;
});

let visibleCount = 6;

// -------------------------------
// INIT (DOM READY + ERROR HANDLING)
function initLatest() {
  if (!latestGrid) {
    console.warn('latestwallpaperGrid not found');
    return;
  }

  renderLatest(latestWallpapers.slice(0, visibleCount));
  setupShowMore();
}

// -------------------------------
// SHOW MORE BUTTON
function setupShowMore() {
  if (!showMoreBtn) return;

  showMoreBtn.addEventListener('click', () => {
    visibleCount += 6;
    renderLatest(latestWallpapers.slice(0, visibleCount));

    if (visibleCount >= latestWallpapers.length) {
      showMoreBtn.style.display = 'none';
    }
  });
}

// -------------------------------
// MAIN RENDER (FULLY FIXED)
function renderLatest(list) {
  if (!latestGrid) return;

  // Preserve grid layout while updating content
  const fragment = document.createDocumentFragment();
  
  list.forEach(wallpaper => {
    try {
      const card = createLatestCard(wallpaper);
      fragment.appendChild(card);
    } catch (error) {
      console.warn('Failed to create latest card:', error, wallpaper);
    }
  });

  latestGrid.innerHTML = '';
  latestGrid.appendChild(fragment);

  // Re-attach event listeners for new cards
  attachCardListeners();
}

// -------------------------------
// CARD FACTORY (CLEAN & REUSABLE)
function createLatestCard(wallpaper) {
  const type = String(wallpaper.type || '').toLowerCase();
  const isMobile = type.includes('mobile');
  const isDesktop = type.includes('desktop');
  
  const mediaHeight = isMobile ? 'h-80' : 'h-60';
  const badgeBg = isDesktop ? 'bg-red-600' : 'bg-green-600';
  const widthClass = isMobile ? 'w-[85%] sm:w-[70%] md:w-[60%]' : 'w-full';

  const card = document.createElement('div');
  card.className = 'latest-card break-inside-avoid mb-6 w-full flex justify-center';
  card.dataset.id = wallpaper.id;

  // Get stats safely
  let likes = 0;
  let views = 0;
  try {
    const wpData = window.wallpaperStorage?.getWallpaper(wallpaper.id, wallpaper.character);
    likes = wpData?.likes || 0;
    views = wpData?.views || 0;
  } catch (e) {
    // Fallback to 0
  }

  const isLiked = window.wallpaperStorage?.getUserLiked(wallpaper.id) || false;

  card.innerHTML = `
    <div class="
      relative group overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/90 
      shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-800/50
      ${widthClass} max-w-sm mx-auto backdrop-blur-sm
    ">
      
      <!-- LOADER -->
      <div class="loader-container absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-20">
        <div class="loader w-10 h-10 border-3 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>

      <!-- MEDIA -->
      <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}&download=${encodeURIComponent(wallpaper.download)}&isVideo=${wallpaper.isVideo}"
         target="_blank" 
         class="block relative group/media hover:scale-105 transition-transform duration-700">
        
        ${wallpaper.isVideo ? `
          <video class="media-element w-full object-cover ${mediaHeight}" 
                 muted loop playsinline preload="none" 
                 poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPlZpZGVvPC90ZXh0Pjwvc3ZnPg==">
            <source src="${wallpaper.url}" type="video/mp4">
          </video>
        ` : `
          <img class="media-element w-full object-cover ${mediaHeight}" 
               src="${wallpaper.url}" 
               loading="lazy" 
               alt="${wallpaper.character} Naruto wallpaper"
               onerror="handleImageError(this)"
               data-loaded="false"/>
        `}

      </a>

      <!-- TYPE BADGE -->
      <span class="absolute top-4 left-4 z-20 ${badgeBg} text-white px-3 py-1.5 text-xs font-semibold rounded-full shadow-lg">
        ${type === 'desktop' ? '🖥️ PC' : '📱 Phone'}
      </span>

      <!-- CHARACTER NAME -->
      <div class="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 text-sm font-medium rounded-xl truncate z-20 shadow-2xl">
        ${wallpaper.character}
      </div>

      <!-- ACTIONS BAR -->
      <div class="absolute bottom-2 right-4 flex gap-2 z-20">
        <a href="${wallpaper.download || wallpaper.url}" 
           download="${wallpaper.character}.naruto.${wallpaper.isVideo ? 'mp4' : 'jpg'}"
           class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-xl text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1">
          ⬇️ DL
        </a>
      </div>

      <!-- STATS BAR -->
      <div class="absolute top-16 right-4 flex flex-col gap-2 text-xs text-white/90 z-20">
        <div class="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
          ❤️ ${formatNumber(likes)}
        </div>
        <div class="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
          👁 ${formatNumber(views)}
        </div>
      </div>

      <!-- TAGS (SCROLLABLE) -->
      <div class="px-4 pb-4 pt-20 flex flex-wrap gap-1.5 overflow-hidden max-h-16">
        ${Array.isArray(wallpaper.tags) 
          ? wallpaper.tags.slice(0, 6).map(tag => 
              `<span class="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-white border border-purple-500/50 hover:bg-purple-600/100 transition-all duration-200">${tag}</span>`
            ).join('')
          : ''
        }
      </div>
    </div>
  `;

  return card;
}

// -------------------------------
// EVENT HANDLERS
function attachCardListeners() {
  // Media load handlers
  document.querySelectorAll('.latest-card .media-element').forEach(media => {
    const card = media.closest('.latest-card');
    const loader = card?.querySelector('.loader-container');
    
    const hideLoader = () => {
      loader?.classList.add('fade-out');
      setTimeout(() => loader?.remove(), 300);
    };

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
      
      if (media.complete && media.naturalWidth > 0) {
        hideLoader();
      }
    }
  });

  // Like buttons
  document.querySelectorAll('.latest-card .likeBtn').forEach(btn => {
    const card = btn.closest('.latest-card');
    const wallpaperId = card?.dataset.id;
    
    if (!wallpaperId || !window.wallpaperStorage) return;

    const icon = btn.querySelector('.likeIcon');
    const count = btn.querySelector('.likeCount');
    
    const isLiked = window.wallpaperStorage.getUserLiked(wallpaperId);
    if (icon) {
      icon.classList.toggle('fas', isLiked);
      icon.classList.toggle('far', !isLiked);
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const current = window.wallpaperStorage.getUserLiked(wallpaperId);
      const next = !current;
      
      const updatedLikes = window.wallpaperStorage.updateLikes(wallpaperId, next ? 1 : -1);
      window.wallpaperStorage.setUserLiked(wallpaperId, next);
      
      if (count) count.textContent = formatNumber(updatedLikes);
      if (icon) {
        icon.classList.toggle('fas', next);
        icon.classList.toggle('far', !next);
      }
    });
  });
}

// -------------------------------
// UTILITIES
function formatNumber(num) {
  num = Math.floor(Number(num) || 0);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function handleImageError(img) {
  img.style.display = 'none';
  const card = img.closest('.latest-card');
  const loader = card?.querySelector('.loader-container');
  loader?.classList.add('fade-out');
}

// -------------------------------
// CSS INJECTION
const style = document.createElement('style');
style.textContent = `
  .latest-card { contain: layout style paint; }
  .loader-container { transition: all 0.3s ease; }
  .loader-container.fade-out { opacity: 0 !important; }
  .media-element { transition: opacity 0.5s ease, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
  .media-element[data-loaded="true"] { opacity: 1; }
`;
style.setAttribute('data-latest-styles', '');
document.head.appendChild(style);

// -------------------------------
// INITIALIZE
document.addEventListener('DOMContentLoaded', initLatest);
