import { wallpapers } from './wallpaper.js';

const allWallpapers = [];

// Filter Sword Art Online only 
wallpapers.forEach(item => {
  if (Array.isArray(item.tags) && item.tags.includes('Sword Art Online')) {
    if (Array.isArray(item.images)) {
      item.images.forEach(img => {
        allWallpapers.push({
          character: item.character || 'Unknown',
          type: item.type ? item.type.toLowerCase() : 'desktop',
          tags: item.tags || [],
          url: img.url,
          date: img.date || new Date().toISOString()
        });
      });
    }
  }
});

// Sort newest first
allWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// Split into desktop/mobile
const desktopWallpapers = allWallpapers.filter(w => w.type === 'desktop');
const mobileWallpapers = allWallpapers.filter(w => w.type === 'mobile');

// Initialize with show more
initShowMore(desktopWallpapers, 'desktop-grid', 'desktop-show-more');
initShowMore(mobileWallpapers, 'mobile-grid', 'mobile-show-more');

// Generic chunk loader
function initShowMore(wallpapers, gridId, buttonId) {
  const grid = document.getElementById(gridId);
  const button = document.getElementById(buttonId);
  const chunkSize = 4;
  let currentIndex = 0;

  function renderChunk() {
    const nextItems = wallpapers.slice(currentIndex, currentIndex + chunkSize);
    nextItems.forEach(wallpaper => renderCard(wallpaper, grid));
    currentIndex += chunkSize;

    if (currentIndex >= wallpapers.length) {
      button.style.display = 'none';
    }
  }

  renderChunk(); // initial render

  button.addEventListener('click', renderChunk);
}

// Render card (with single loader)
function renderCard(wallpaper, grid) {
  const card = document.createElement('div');
  card.className =
    "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg relative";

  const uniqueId = wallpaper.url || 'unknown';
  const characterName = wallpaper.character || 'Unknown';
  const wpData = window.wallpaperStorage.getWallpaper(uniqueId, characterName);
  let likes = wpData.likes;
  const views = wpData.views;

  card.innerHTML = `
  <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}&mobile=${encodeURIComponent(wallpaper.mobile)}&tablet=${encodeURIComponent(wallpaper.tablet)}&desktop=${encodeURIComponent(wallpaper.desktop)}" 
     target="_blank" class="relative group block overflow-hidden rounded-lg">
    
    <!-- Dot Loader -->
    <div class="absolute inset-0 flex items-center justify-center bg-black/40 loader">
      <div></div><div></div><div></div>
    </div>

    <!-- Image -->
    <img 
      src="${wallpaper.url}" 
      alt="${wallpaper.character}" 
      class="wallpaper-img w-auto object-fill mx-auto opacity-0 transition-opacity duration-500 group-hover:scale-105 ${wallpaper.type.toLowerCase() === 'mobile' ? 'h-80' : 'h-60'} group-hover:brightness-110" 
      loading="lazy"
    />
    
    <span class="absolute z-10 top-3 left-3 ${wallpaper.type.toLowerCase() === 'desktop' ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
      ${wallpaper.type.charAt(0).toUpperCase() + wallpaper.type.slice(1)}
    </span>
  </a>
  <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
    <div class="flex gap-2">
      <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}&mobile=${encodeURIComponent(wallpaper.mobile)}&tablet=${encodeURIComponent(wallpaper.tablet)}&desktop=${encodeURIComponent(wallpaper.desktop)}"
          target="_blank" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">
        <i class="fa-solid fa-download mr-1"></i>Download
      </a>
      <button class="likeBtn cursor-pointer bg-green-600 px-3 py-1 rounded text-white">
        <i class="likeIcon far fa-thumbs-up mr-1"></i>
        <span class="likeCount">${formatNumber(likes)}</span>
      </button>
    </div>
    <div class="text-xs text-gray-400">
      <i class="fa-solid fa-eye ml-1 mr-1"></i>${formatNumber(views)}
    </div>
  </div>
  <div class="px-4 py-4 flex flex-wrap gap-2 text-sm">
    <span class="font-bold"><i class="fa-solid fa-tags mr-1"></i>Tags:</span>
    ${wallpaper.tags.map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`).join('')}
  </div>
`;

  grid.appendChild(card);

  // Loader -> Image fade logic
  const img = card.querySelector('.wallpaper-img');
  const loader = card.querySelector('.loader');

  img.addEventListener('load', () => {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.5s ease';
    setTimeout(() => loader.style.display = 'none', 500);
    img.classList.remove('opacity-0');
  });

  // Like button logic
  const likeBtn = card.querySelector('.likeBtn');
  const likeIcon = card.querySelector('.likeIcon');
  const likeCountSpan = card.querySelector('.likeCount');

  const isUserLiked = window.wallpaperStorage.getUserLiked(uniqueId);
  likeIcon.classList.toggle('fas', isUserLiked);
  likeIcon.classList.toggle('far', !isUserLiked);

  likeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isCurrentlyLiked = window.wallpaperStorage.getUserLiked(uniqueId);
    const newLikesCount = window.wallpaperStorage.updateLikes(uniqueId, isCurrentlyLiked ? -1 : 1);
    window.wallpaperStorage.setUserLiked(uniqueId, !isCurrentlyLiked);
    
    likeCountSpan.innerText = formatNumber(newLikesCount);
    likeIcon.classList.toggle('far');
    likeIcon.classList.toggle('fas');
  });
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}
