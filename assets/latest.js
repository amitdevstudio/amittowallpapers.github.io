import { wallpapers } from './wallpaper.js';

const wallpaperGrid = document.getElementById('latestwallpaperGrid');

// ✅ Flatten all wallpapers
const allWallpapers = [];
wallpapers.forEach(wp => {
  wp.images.forEach(img => {
    allWallpapers.push({
      character: wp.character,
      type: wp.type,
      tags: wp.tags,
      url: img.url,
      date: img.date
    });
  });
});

// ✅ Sort by newest date and take only 6
const latestWallpapers = allWallpapers
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 6);

// ✅ Render immediately
renderWallpapers(latestWallpapers);


function renderWallpapers(list) {
  wallpaperGrid.innerHTML = '';

  list.forEach(wallpaper => {
    const storageKey = `likes_${wallpaper.url}`;
    const viewKey = `views_${wallpaper.url}`;

    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, Math.floor(Math.random() * (100000 - 20000 + 1)) + 20000);
    }
    if (!localStorage.getItem(viewKey)) {
      localStorage.setItem(viewKey, Math.floor(Math.random() * (200000 - 50000 + 1)) + 50000);
    }

    let likes = parseInt(localStorage.getItem(storageKey), 10);
    const views = parseInt(localStorage.getItem(viewKey), 10);

    const card = document.createElement('div');
    card.className = "card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6";

    card.innerHTML = `
  <a href="${wallpaper.url}" class="relative group block overflow-hidden rounded-lg">
    <img loading="lazy"
      src="${wallpaper.url}" 
      alt="${wallpaper.character}" 
      class="w-auto object-fill mx-auto transition-transform duration-300 ease-in-out ${wallpaper.type.toLowerCase() === 'mobile' ? 'h-80' : 'h-60'} group-hover:scale-105 group-hover:brightness-110" 
    />
    <span class="absolute top-3 left-3 ${wallpaper.type.toLowerCase() === 'desktop' ? 'bg-red-600' : 'bg-green-600'
      } text-white px-2 py-1 text-xs rounded-lg">
      ${wallpaper.type.charAt(0).toUpperCase() + wallpaper.type.slice(1)}
    </span>
  </a>
  <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
    <div class="flex flex-wrap gap-2">
      <a href="${wallpaper.url}" download class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">
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
    <span class="font-bold">
      <i class="fa-solid fa-tags mr-1"></i>Tags:
    </span>
    ${wallpaper.tags.map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`).join('')}
  </div>
`;

    wallpaperGrid.appendChild(card);

    const likeBtn = card.querySelector('.likeBtn');
    const icon = card.querySelector('.likeIcon');
    const countSpan = card.querySelector('.likeCount');

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
      countSpan.innerText = formatNumber(likes);
      icon.classList.toggle('far', !userLiked);
      icon.classList.toggle('fas', userLiked);
    });
  });
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (Math.floor(num / 100) / 10).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}
