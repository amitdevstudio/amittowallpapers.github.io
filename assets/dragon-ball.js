import { wallpapers } from './wallpaper.js';

const allWallpapers = [];

// Filter ONLY Bleach wallpapers
wallpapers.forEach(item => {
  if (item.tags.includes('Dragon Ball')) {
    item.images.forEach(img => {
      allWallpapers.push({
        character: item.character,
        type: item.type.toLowerCase(),
        tags: item.tags,
        url: img.url,
        date: img.date // Make sure each image has date!
      });
    });
  }
});

// Sort newest first by date
allWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// Split into desktop & mobile
const desktopWallpapers = allWallpapers.filter(w => w.type === 'desktop');
const mobileWallpapers = allWallpapers.filter(w => w.type === 'mobile');

// Initialize Show More for each type
initShowMore(desktopWallpapers, 'desktop-grid', 'desktop-show-more');
initShowMore(mobileWallpapers, 'mobile-grid', 'mobile-show-more');

// Show More chunk loader
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

  renderChunk(); // Initial render

  button.addEventListener('click', renderChunk);
}

// Render a single card
function renderCard(wallpaper, grid) {
  const card = document.createElement('div');
  card.className = "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6";

  const storageKey = `likes_${wallpaper.url}`;
  const viewsKey = `views_${wallpaper.url}`;

  if (!localStorage.getItem(storageKey)) {
    localStorage.setItem(storageKey, randomRange(20000, 40000));
  }
  if (!localStorage.getItem(viewsKey)) {
    localStorage.setItem(viewsKey, randomRange(50000, 100000));
  }

  let likes = parseInt(localStorage.getItem(storageKey), 10);
  let views = parseInt(localStorage.getItem(viewsKey), 10);

  if (views <= likes) {
    views = likes + randomRange(10000, 50000);
    localStorage.setItem(viewsKey, views);
  }

  card.innerHTML = `
  <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}&mobile=${encodeURIComponent(wallpaper.mobile)}&tablet=${encodeURIComponent(wallpaper.tablet)}&desktop=${encodeURIComponent(wallpaper.desktop)}" 
     target="_blank" class="relative group block overflow-hidden rounded-lg">
    <img loading="lazy"
      src="${wallpaper.url}" 
      alt="${wallpaper.character}" 
      class="w-auto object-fill mx-auto transition-transform duration-300 ease-in-out ${wallpaper.type.toLowerCase() === 'mobile' ? 'h-80' : 'h-60'} group-hover:scale-105 group-hover:brightness-110" 
    />
    <span class="absolute z-10 top-3 left-3 ${wallpaper.type.toLowerCase() === 'desktop' ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
      ${wallpaper.type.charAt(0).toUpperCase() + wallpaper.type.slice(1)}
    </span>
  </a>
    <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
      <div class="flex gap-2">
        <a href="${wallpaper.url}" download class="bg-blue-600 hover:bg-blue-700 active:bg-blue-600 px-3 py-1 rounded">
          <i class="fa-solid fa-download mr-1 text-white"></i>Download
        </a>
        <button class="likeBtn cursor-pointer bg-[#00C249] px-3 py-1 rounded text-white">
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

    if (views <= likes) {
      views = likes + randomRange(10000, 50000);
      localStorage.setItem(viewsKey, views);
    }

    localStorage.setItem(storageKey, likes);
    likeCountSpan.innerText = formatNumber(likes);
    likeIcon.classList.toggle('far', !userLiked);
    likeIcon.classList.toggle('fas', userLiked);
  });
}

// Helpers
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}