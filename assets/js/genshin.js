import { wallpapers } from './wallpaper.js';

const allWallpapers = [];

// Filter Genshin Impact only
wallpapers.forEach(item => {
  if (Array.isArray(item.tags) && item.tags.includes('Genshin Impact')) {

    // Use images OR videos
    if (Array.isArray(item.images)) {
      item.images.forEach(img => {
        allWallpapers.push({
          character: item.character || 'Unknown',
          type: item.type ? item.type.toLowerCase() : 'desktop',
          tags: item.tags || [],
          url: img.url,
          date: img.date || new Date().toISOString(),
          mediaType: 'image'
        });
      });
    }

    if (Array.isArray(item.videos)) {
      item.videos.forEach(vid => {
        allWallpapers.push({
          character: item.character || 'Unknown',
          type: item.type ? item.type.toLowerCase() : 'desktop',
          tags: item.tags || [],
          url: vid.preview,
          download: vid.download,
          date: vid.date || new Date().toISOString(),
          mediaType: 'video'
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

function initShowMore(wallpapers, gridId, buttonId) {
  const grid = document.getElementById(gridId);
  const button = document.getElementById(buttonId);
  if (!grid || !button) return;

  const chunkSize = 4;
  let currentIndex = 0;

  function renderChunk() {
    const nextItems = wallpapers.slice(currentIndex, currentIndex + chunkSize);
    nextItems.forEach(item => renderCard(item, grid));
    currentIndex += chunkSize;

    if (currentIndex >= wallpapers.length) button.style.display = 'none';
  }

  renderChunk(); // initial
  button.addEventListener('click', renderChunk);
}

// Render card
function renderCard(item, grid) {
  const card = document.createElement('div');
  card.className = "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg relative";

  const characterName = item.character || 'Unknown';
  const wpData = window.wallpaperStorage.getWallpaper(characterName);
  let likes = wpData.likes;
  const views = wpData.views;

  // Media HTML
  let mediaHTML = '';
  if (item.mediaType === 'image') {
    mediaHTML = `<img 
      src="${item.url}" 
      alt="${item.character}" 
      class="wallpaper-img w-full object-cover opacity-0 transition-opacity duration-500 group-hover:scale-105" 
      loading="lazy"
    />`;
  } else if (item.mediaType === 'video') {
    mediaHTML = `<video class="wallpaper-video w-full h-48 object-cover" autoplay muted loop playsinline>
      <source src="${item.url}" type="video/mp4">
      Your browser does not support the video tag.
    </video>`;
  }

  card.innerHTML = `
  <a href="${item.download || item.url}" target="_blank" class="relative group block overflow-hidden rounded-lg">
    <div class="absolute inset-0 flex items-center justify-center bg-black/40 loader">
      <div></div><div></div><div></div>
    </div>

    ${mediaHTML}

    <span class="absolute z-10 top-3 left-3 ${item.type==='desktop' ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
      ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
    </span>
  </a>

  <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
    <div class="flex gap-2">
      <a href="${item.download || item.url}" target="_blank" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">
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
    ${item.tags.map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`).join('')}
  </div>
  `;

  grid.appendChild(card);

  // Loader fade
  const img = card.querySelector('.wallpaper-img') || card.querySelector('.wallpaper-video');
  const loader = card.querySelector('.loader');

  if (img) {
    img.addEventListener('load', () => {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.5s ease';
      setTimeout(() => loader.style.display = 'none', 500);
      if (img.tagName === 'IMG') img.classList.remove('opacity-0');
    });
  }

  // Like button
  const likeBtn = card.querySelector('.likeBtn');
  const likeIcon = card.querySelector('.likeIcon');
  const likeCountSpan = card.querySelector('.likeCount');

  const isUserLiked = window.wallpaperStorage.getUserLiked(characterName);
  likeIcon.classList.toggle('fas', isUserLiked);
  likeIcon.classList.toggle('far', !isUserLiked);

  likeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isCurrentlyLiked = window.wallpaperStorage.getUserLiked(characterName);
    const newLikesCount = window.wallpaperStorage.updateLikes(characterName, isCurrentlyLiked ? -1 : 1);
    window.wallpaperStorage.setUserLiked(characterName, !isCurrentlyLiked);
    
    likeCountSpan.innerText = formatNumber(newLikesCount);
    likeIcon.classList.toggle('far');
    likeIcon.classList.toggle('fas');
  });
}

// Helpers
function randomRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function formatNumber(num) {
  if (num >= 1_000_000) return (num/1_000_000).toFixed(1).replace(/\.0$/,'')+'M';
  if (num >= 1_000) return (num/1000).toFixed(1).replace(/\.0$/,'')+'k';
  return num.toString();
}