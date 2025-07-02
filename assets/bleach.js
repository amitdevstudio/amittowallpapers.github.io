import { wallpapers } from './wallpaper.js';

const allWallpapers = [];

// ✅ Only include One Piece wallpapers
wallpapers.forEach(item => {
  if (item.tags.includes('Bleach')) {
    item.images.forEach(url => {
      allWallpapers.push({
        character: item.character,
        type: item.type,
        tags: item.tags,
        url: url
      });
    });
  }
});

shuffle(allWallpapers);

const desktopWallpapers = allWallpapers.filter(w => w.type.toLowerCase() === 'desktop');
const mobileWallpapers = allWallpapers.filter(w => w.type.toLowerCase() === 'mobile');

renderWallpapers(desktopWallpapers, 'desktop-grid');
renderWallpapers(mobileWallpapers, 'mobile-grid');

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function renderWallpapers(wallpapers, containerId) {
  const grid = document.getElementById(containerId);

  wallpapers.forEach(wallpaper => {
    const card = document.createElement('div');
    card.className = "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg";

    const storageKeyLikes = `likes_${wallpaper.url}`;
    const storageKeyViews = `views_${wallpaper.url}`;

    let likes = localStorage.getItem(storageKeyLikes);
    let views = localStorage.getItem(storageKeyViews);

    // ✅ If no likes saved yet, create 20k–40k
    if (!likes) {
      likes = randomRange(20000, 40000);
      localStorage.setItem(storageKeyLikes, likes);
    } else {
      likes = parseInt(likes, 10);
    }

    // ✅ If no views saved yet, make sure views > likes
    if (!views) {
      views = likes + randomRange(10000, 100000); // Always bigger
      localStorage.setItem(storageKeyViews, views);
    } else {
      views = parseInt(views, 10);
    }

    // ✅ If views are somehow not greater, fix them
    if (views <= likes) {
      views = likes + randomRange(10000, 100000);
      localStorage.setItem(storageKeyViews, views);
    }

    card.innerHTML = `
      <a href="${wallpaper.url}" class="relative">
        <img 
          src="${wallpaper.url}" 
          alt="${wallpaper.character}" 
          class="w-auto mx-auto object-fit ${wallpaper.type === 'mobile' ? 'h-120' : 'h-60'} rounded-lg" 
        />
        <span class="absolute top-3 left-3 ${wallpaper.type === 'desktop' ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
          ${wallpaper.type.charAt(0).toUpperCase() + wallpaper.type.slice(1)}
        </span>
      </a>
      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <div class="flex gap-2">
          <a href="${wallpaper.url}" download class="bg-blue-600 hover:bg-blue-700 active:bg-blue-600 px-3 py-1 rounded">
            <i class="fa-solid fa-download mr-1 text-white"></i>Download
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
        ${wallpaper.tags.map(tag => `
          <span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>
        `).join('')}
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

      // ✅ After like change, re-check views > likes
      if (views <= likes) {
        views = likes + randomRange(10000, 50000);
        localStorage.setItem(storageKeyViews, views);
      }

      localStorage.setItem(storageKeyLikes, likes);
      likeCountSpan.innerText = formatNumber(likes);
      likeIcon.classList.toggle('far', !userLiked);
      likeIcon.classList.toggle('fas', userLiked);

      // Optionally update views on UI too if you display them dynamically
    });
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