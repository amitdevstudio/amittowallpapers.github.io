import { wallpapers } from './wallpaper.js';

const wallpaperGrid = document.getElementById('wallpaperGrid');
const searchInput = document.getElementById('searchInput');

const allWallpapers = [];

// -------------------------------
// FORMAT DATA
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

// -------------------------------
// SORT (NEWEST FIRST)
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
    const isLive = wp.isVideo;

    if (term === 'live' || term === 'live wallpaper') return isLive;

    return (
      character.includes(term) ||
      type.includes(term) ||
      wp.tags.some(tag => tag.toLowerCase().includes(term)) ||
      (isLive && 'live wallpaper'.includes(term))
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

    // ✅ FIXED MEDIA (UNIFORM SIZE)
    let mediaHTML = `
      <div class="relative group w-full ${wallpaper.type === 'mobile' ? 'aspect-[9/16]' : 'aspect-[16/9]'} overflow-hidden bg-black">

        <div class="loader-container absolute inset-0 flex items-center justify-center">
          <div class="loader"><div></div><div></div><div></div></div>
        </div>
    `;

    if (wallpaper.isVideo) {
      mediaHTML += `
        <video loop muted playsinline
          class="wallpaper-img w-full h-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-110">
          <source src="${wallpaper.url}" type="video/mp4">
        </video>
      `;
    } else {
      mediaHTML += `
        <img loading="lazy" src="${wallpaper.url}" alt="${wallpaper.character}"
          class="wallpaper-img w-full h-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-110"/>
      `;
    }

    mediaHTML += `</div>`;

    // -------------------------------
    card.innerHTML = `
      <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}"
         target="_blank"
         class="block overflow-hidden rounded-lg">
        ${mediaHTML}

        <span class="absolute z-10 top-3 left-3 ${wallpaper.type.includes('desktop') ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
          ${wallpaper.type.charAt(0).toUpperCase() + wallpaper.type.slice(1)}
        </span>
      </a>

      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <div class="flex gap-2">
          <a href="${wallpaper.url}" download
             class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">
            Download
          </a>

          <button class="likeBtn cursor-pointer bg-green-600 px-3 py-1 rounded text-white">
            <i class="likeIcon far fa-thumbs-up mr-1"></i>
            <span class="likeCount">${formatNumber(likes)}</span>
          </button>
        </div>

        <div class="text-xs text-gray-400">
          👁 ${formatNumber(views)}
        </div>
      </div>

      <div class="px-4 py-4 flex flex-wrap gap-2 text-sm">
        <span class="font-bold">Tags:</span>
        ${wallpaper.tags.map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`).join('')}
      </div>
    `;

    wallpaperGrid.appendChild(card);

    const media = card.querySelector('.wallpaper-img');
    const loader = card.querySelector('.loader-container');

    // -------------------------------
    // LOAD EFFECT
    if (wallpaper.isVideo) {
      media.addEventListener('loadeddata', () => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 400);
      });

      card.addEventListener('mouseenter', () => media.play());
      card.addEventListener('mouseleave', () => {
        media.pause();
        media.currentTime = 0;
      });
    } else {
      media.addEventListener('load', () => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 400);
      });
    }

    // -------------------------------
    // LIKE SYSTEM
    const likeBtn = card.querySelector('.likeBtn');
    const likeIcon = card.querySelector('.likeIcon');
    const likeCount = card.querySelector('.likeCount');

    const isLiked = window.wallpaperStorage.getUserLiked(uniqueId);

    likeIcon.classList.toggle('fas', isLiked);
    likeIcon.classList.toggle('far', !isLiked);

    likeBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const current = window.wallpaperStorage.getUserLiked(uniqueId);
      const updatedLikes = window.wallpaperStorage.updateLikes(uniqueId, current ? -1 : 1);

      window.wallpaperStorage.setUserLiked(uniqueId, !current);

      likeCount.innerText = formatNumber(updatedLikes);

      likeIcon.classList.toggle('fas');
      likeIcon.classList.toggle('far');
    });
  });
}

// -------------------------------
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}
