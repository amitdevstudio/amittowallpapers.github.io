import { wallpapers } from './wallpaper.js';

// ✅ Only run if the page has a Latest section
const latestGrid = document.getElementById('latestGrid');
if (latestGrid) {
  // Get ONLY the last 6, newest first
  const latestWallpapers = wallpapers.slice(-6).reverse();

  latestGrid.innerHTML = ''; // Clear just in case

  latestWallpapers.forEach(wallpaper => {
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
    card.className = "bg-[#18181b] rounded-lg overflow-hidden shadow-lg";

    card.innerHTML = `
      <a href="${wallpaper.url}" class="relative">
        <img 
          src="${wallpaper.url}" 
          alt="${wallpaper.character}" 
          class="w-auto mx-auto object-fill ${wallpaper.type === 'mobile' ? 'h-120' : 'h-60'} rounded-lg" 
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
        ${wallpaper.tags.map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`).join('')}
      </div>
    `;

    latestGrid.appendChild(card);

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

  function formatNumber(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  }
}
