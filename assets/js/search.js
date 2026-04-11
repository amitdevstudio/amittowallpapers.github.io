import { wallpapers } from './wallpaper.js';

const wallpaperGrid = document.getElementById('wallpaperGrid');
const searchInput = document.getElementById('searchInput');

const allWallpapers = [];

wallpapers.forEach(item => {
  if (Array.isArray(item.images)) {
    item.images.forEach(img => {
      allWallpapers.push({
        character: String(item.character || ''),
        type: String(item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags.map(tag => String(tag)) : [],
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
        tags: Array.isArray(item.tags) ? item.tags.map(tag => String(tag)) : [],
        url: String(video.preview || ''),
        preview: String(video.preview || ''),
        download: String(video.download || ''),
        date: video.date || new Date().toISOString(),
        isVideo: true
      });
    });
  }
});

// Always newest first
allWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) { wallpaperGrid.innerHTML = ''; return; }

  const filtered = allWallpapers.filter(wp => {
    const character = String(wp.character || '').toLowerCase();
    const type = String(wp.type || '').toLowerCase();
    const isLive = !!wp.isVideo;

    if (term === 'live' || term === 'live wallpaper') return isLive;

    return character.includes(term) ||
           type.includes(term) ||
           (Array.isArray(wp.tags) && wp.tags.some(tag => String(tag || '').toLowerCase().includes(term))) ||
           (isLive && 'live wallpaper'.includes(term));
  });

  renderWallpapers(filtered);
});

function renderWallpapers(list) {
  wallpaperGrid.innerHTML = '';

  if (!list.length) {
    wallpaperGrid.innerHTML = `
      <div class="flex flex-col justify-center mt-8 w-full items-center h-48 text-center mx-auto space-y-1 p-2">
        <p class="text-white text-lg font-semibold">
          No wallpapers found matching your search.<br>
          Can't find what you want? 
          <a href="#contact" class="text-yellow-500 font-semibold hover:underline">
            Request your wallpaper!
          </a>
        </p>
      </div>
    `;
    return;
  }

  list.forEach(wallpaper => {
    const uniqueId = wallpaper.url || wallpaper.preview;
    const characterName = wallpaper.character || 'Unknown';
    const wpData = window.wallpaperStorage.getWallpaper(uniqueId, characterName);
    let likes = wpData.likes;
    let views = wpData.views;

    const card = document.createElement('div');
    card.className = "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6";

    // Media with loader
    let mediaHTML = '';
    if (wallpaper.isVideo) {
      mediaHTML = `
        <div class="relative group">
          <div class="loader-container absolute inset-0 flex items-center justify-center">
            <div class="loader"><div></div><div></div><div></div></div>
          </div>
          <video loop muted playsinline class="wallpaper-img w-auto object-fill mx-auto transition-transform duration-300 ease-in-out ${wallpaper.type === 'mobile' ? 'h-80' : 'h-60'} group-hover:scale-105 group-hover:brightness-110">
            <source src="${wallpaper.url}" type="video/mp4">
          </video>
        </div>
      `;
    } else {
      mediaHTML = `
        <div class="relative group">
          <div class="loader-container absolute inset-0 flex items-center justify-center">
            <div class="loader"><div></div><div></div><div></div></div>
          </div>
          <img loading="lazy" src="${wallpaper.url}" alt="${wallpaper.character}" class="wallpaper-img w-auto object-fill mx-auto transition-transform duration-300 ease-in-out ${wallpaper.type === 'mobile' ? 'h-80' : 'h-60'} group-hover:scale-105 group-hover:brightness-110"/>
        </div>
      `;
    }

    card.innerHTML = `
      <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}" target="_blank" class="relative block overflow-hidden rounded-lg">
        ${mediaHTML}
        <span class="absolute z-10 top-3 left-3 ${wallpaper.type.includes('desktop') ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
          ${wallpaper.type.charAt(0).toUpperCase() + wallpaper.type.slice(1)}
        </span>
      </a>
      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <div class="flex gap-2">
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
        <span class="font-bold"><i class="fa-solid fa-tags mr-1"></i>Tags:</span>
        ${wallpaper.tags.map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`).join('')}
      </div>
    `;

    wallpaperGrid.appendChild(card);

    const media = card.querySelector('.wallpaper-img');
    const loaderContainer = card.querySelector('.loader-container');

    if (wallpaper.isVideo) {
      media.addEventListener('loadeddata', () => {
        loaderContainer.style.opacity = '0';
        setTimeout(() => loaderContainer.style.display = 'none', 500);
        media.classList.remove('opacity-0');
      });
      card.addEventListener('mouseenter', () => media.play());
      card.addEventListener('mouseleave', () => { media.pause(); media.currentTime = 0; });
    } else {
      media.addEventListener('load', () => {
        loaderContainer.style.opacity = '0';
        setTimeout(() => loaderContainer.style.display = 'none', 500);
        media.classList.remove('opacity-0');
      });
    }

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
  });
}

function randomRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}