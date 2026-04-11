import { wallpapers } from './wallpaper.js';

const wallpaperGrid = document.getElementById('wallpaperGrid');
const searchInput = document.getElementById('searchInput');

const allWallpapers = [];

// -------------------------------
// BUILD DATA
wallpapers.forEach(item => {
  if (Array.isArray(item.images)) {
    item.images.forEach(img => {
      allWallpapers.push({
        character: String(item.character || ''),
        type: String(item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        url: String(img.url || ''),
        date: img.date || new Date().toISOString(),
        mobile: img.mobile || '',
        tablet: img.tablet || '',
        desktop: img.desktop || '',
        isVideo: false
      });
    });
  }

  if (Array.isArray(item.videos)) {
    item.videos.forEach(video => {
      allWallpapers.push({
        character: String(item.character || ''),
        type: String(item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        url: String(video.preview || ''),
        preview: String(video.preview || ''),
        download: String(video.download || ''),
        date: video.date || new Date().toISOString(),
        isVideo: true
      });
    });
  }
});

allWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// -------------------------------
// SEARCH
searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    wallpaperGrid.innerHTML = '';
    return;
  }

  const filtered = allWallpapers.filter(wp => {
    const character = wp.character.toLowerCase();
    const type = wp.type.toLowerCase();

    if (term === 'live') return wp.isVideo;

    return (
      character.includes(term) ||
      type.includes(term) ||
      wp.tags.some(tag => tag.toLowerCase().includes(term))
    );
  });

  renderWallpapers(filtered);
});

// -------------------------------
// RENDER
function renderWallpapers(list) {
  wallpaperGrid.innerHTML = '';

  if (!list.length) {
    wallpaperGrid.innerHTML = `
      <div class="text-center text-white mt-10">
        No wallpapers found.
      </div>
    `;
    return;
  }

  list.forEach(wallpaper => renderCard(wallpaper, wallpaperGrid));
}

// -------------------------------
// CARD (FIXED LOADER)
function renderCard(wallpaper, grid) {
  const card = document.createElement('div');
  card.className =
    "break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg relative";

  const uniqueId = wallpaper.url || wallpaper.preview;
  const wpData = window.wallpaperStorage.getWallpaper(uniqueId, wallpaper.character);

  const isMobile = wallpaper.type.includes('mobile');

  card.innerHTML = `
    <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}"
       class="block relative group overflow-hidden rounded-lg">

      <!-- LOADER -->
      <div class="absolute inset-0 flex items-center justify-center bg-black/60 loader">
        <div class="dot-loader"><div></div><div></div><div></div></div>
      </div>

      ${
        wallpaper.isVideo
          ? `<video class="wallpaper-img w-full ${isMobile ? 'h-80' : 'h-60'} object-cover opacity-0" muted loop playsinline>
               <source src="${wallpaper.url}">
             </video>`
          : `<img src="${wallpaper.url}" class="wallpaper-img w-full ${isMobile ? 'h-80' : 'h-60'} object-cover opacity-0"/>`
      }

      <span class="absolute top-3 left-3 px-2 py-1 text-xs rounded text-white
        ${wallpaper.type.includes('desktop') ? 'bg-red-600' : 'bg-green-600'}">
        ${wallpaper.type}
      </span>
    </a>

    <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
      <button class="likeBtn bg-green-600 px-3 py-1 rounded text-white">
        <i class="likeIcon far fa-thumbs-up"></i>
        <span class="likeCount">${formatNumber(wpData.likes)}</span>
      </button>

      <div class="text-xs text-gray-400">👁 ${formatNumber(wpData.views)}</div>
    </div>
  `;

  grid.appendChild(card);

  const media = card.querySelector('.wallpaper-img');
  const loader = card.querySelector('.loader');

  function hideLoader() {
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 300);
    media.style.opacity = '1';
  }

  if (media.tagName === 'IMG') {
    if (media.complete) hideLoader();
    else media.addEventListener('load', hideLoader);
  } else {
    media.addEventListener('loadeddata', hideLoader);
  }

  // LIKE
  const likeBtn = card.querySelector('.likeBtn');
  const likeIcon = card.querySelector('.likeIcon');
  const likeCount = card.querySelector('.likeCount');

  const isLiked = window.wallpaperStorage.getUserLiked(uniqueId);

  likeIcon.classList.toggle('fas', isLiked);
  likeIcon.classList.toggle('far', !isLiked);

  likeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const current = window.wallpaperStorage.getUserLiked(uniqueId);
    const updated = window.wallpaperStorage.updateLikes(uniqueId, current ? -1 : 1);

    window.wallpaperStorage.setUserLiked(uniqueId, !current);

    likeCount.innerText = formatNumber(updated);
    likeIcon.classList.toggle('fas');
    likeIcon.classList.toggle('far');
  });
}

// -------------------------------
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
  return num;
}
