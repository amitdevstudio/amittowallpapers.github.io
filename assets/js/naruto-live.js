import { wallpapers } from './wallpaper.js';

const liveWallpapers = [];

// ✅ Filter only Naruto live wallpapers
wallpapers.forEach(item => {
  if (item.tags.includes('Naruto') && item.type.toLowerCase().includes('live')) {
    liveWallpapers.push({
      character: item.character,
      type: item.type.toLowerCase(), // "desktop-live" or "mobile-live"
      tags: item.tags,
      preview: item.preview,   // use preview for webm
      download: item.download, // use mp4 for download
      date: item.date
    });
  }
});


// ✅ Sort newest first
liveWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// ✅ Split into desktop/mobile live
const desktopLiveWallpapers = liveWallpapers.filter(w => w.type === 'desktop-live');
const mobileLiveWallpapers = liveWallpapers.filter(w => w.type === 'mobile-live');

// ✅ Initialize "show more" for both
initShowMore(desktopLiveWallpapers, 'live-desktop-grid', 'live-desktop-show-more');
initShowMore(mobileLiveWallpapers, 'live-mobile-grid', 'live-mobile-show-more');

// -------------------------------
// Functions
// -------------------------------

// Generic chunk loader
function initShowMore(wallpapers, gridId, buttonId) {
  const grid = document.getElementById(gridId);
  const button = document.getElementById(buttonId);
  const chunkSize = 4;
  let currentIndex = 0;

  function renderChunk() {
    const nextItems = wallpapers.slice(currentIndex, currentIndex + chunkSize);
    nextItems.forEach(wallpaper => renderLiveCard(wallpaper, grid));
    currentIndex += chunkSize;

    if (currentIndex >= wallpapers.length) {
      button.style.display = 'none';
    }
  }

  renderChunk(); // initial render

  button.addEventListener('click', renderChunk);
}

// Render live wallpaper card
function renderLiveCard(wallpaper, grid) {
  const card = document.createElement('div');
  card.className =
    "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg";

  const storageKey = `likes_${wallpaper.preview}`;
  const viewsKey = `views_${wallpaper.preview}`;

  if (!localStorage.getItem(storageKey)) {
    localStorage.setItem(storageKey, randomRange(200, 2000));
  }
  if (!localStorage.getItem(viewsKey)) {
    localStorage.setItem(viewsKey, randomRange(500, 50000));
  }

  let likes = parseInt(localStorage.getItem(storageKey), 10);
  const views = parseInt(localStorage.getItem(viewsKey), 10);

  card.innerHTML = `
    <a href="${wallpaper.download}" target="_blank" class="relative group block overflow-hidden rounded-lg">
      <video autoplay loop muted playsinline
        class="w-auto object-cover mx-auto transition-transform duration-300 ease-in-out ${wallpaper.type === 'mobile-live' ? 'h-80' : 'h-60'} group-hover:scale-105 group-hover:brightness-110">
        <source src="${wallpaper.preview}" type="video/webm">
        <source src="${wallpaper.download}" type="video/mp4">
      </video>
      <span class="absolute z-10 top-3 left-3 bg-purple-600 text-white px-2 py-1 text-xs rounded-lg">
        ${wallpaper.type === 'desktop-live' ? 'Desktop Live' : 'Mobile Live'}
      </span>
    </a>
    <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
      <div class="flex gap-2">
        <a href="${wallpaper.download}" download class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">
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

  // ✅ Likes logic stays same
  const likeBtn = card.querySelector('.likeBtn');
  const likeIcon = card.querySelector('.likeIcon');
  const likeCountSpan = card.querySelector('.likeCount');

  let userLiked = false;
  likeBtn.addEventListener('click', () => {
    if (!userLiked) {
      likes++;
      userLiked = true;
    } else {
      likes--;
      userLiked = false;
    }
    localStorage.setItem(storageKey, likes);
    likeCountSpan.innerText = formatNumber(likes);
    likeIcon.classList.toggle('far', !userLiked);
    likeIcon.classList.toggle('fas', userLiked);
  });
}

// -------------------------------
// Helpers
// -------------------------------
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}
// Example: 1500 -> 1.5k, 2000000 -> 2M
// -------------------------------
// End of amittowallpapers.github.io-main/assets/naruto-live.js