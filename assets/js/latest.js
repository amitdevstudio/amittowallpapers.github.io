import { wallpapers } from './wallpaper.js';

const latestGrid = document.getElementById('latestwallpaperGrid');
const showMoreBtn = document.getElementById('latest-show-more');

if (!latestGrid) {
  console.error("latestGrid not found!");
}

// -------------------------------
const latestWallpapers = [];

// PROCESS DATA
wallpapers.forEach(item => {

  // IMAGES
  if (Array.isArray(item.images)) {
    item.images.forEach(img => {
      latestWallpapers.push({
        character: item.character || '',
        type: (item.type || '').toLowerCase(),
        tags: item.tags || [],
        url: img,
        date: item.date || new Date().toISOString(),
        isVideo: false
      });
    });
  }

  // VIDEOS
  if (Array.isArray(item.videos)) {
    item.videos.forEach(video => {
      latestWallpapers.push({
        character: item.character || '',
        type: (item.type || '').toLowerCase(),
        tags: item.tags || [],
        url: video.preview || '',
        download: video.download || '',
        date: video.date || new Date().toISOString(),
        isVideo: true
      });
    });
  }

});

// SORT (NEWEST FIRST)
latestWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// -------------------------------
let visibleCount = 6;

// INITIAL RENDER
renderLatest(latestWallpapers.slice(0, visibleCount));

// SHOW MORE
showMoreBtn.addEventListener('click', () => {
  visibleCount += 6;
  renderLatest(latestWallpapers.slice(0, visibleCount));

  if (visibleCount >= latestWallpapers.length) {
    showMoreBtn.style.display = 'none';
  }
});

// -------------------------------
function renderLatest(list) {
  latestGrid.innerHTML = '';

  list.forEach(wallpaper => {

    const uniqueId = wallpaper.url;
    const wpData = window.wallpaperStorage.getWallpaper(uniqueId, wallpaper.character);

    let likes = wpData.likes;
    let views = wpData.views;

    const card = document.createElement('div');
    card.className = "break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6";

    // MEDIA
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
        <img src="${wallpaper.url}"
          class="wallpaper-img w-full h-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-110"/>
      `;
    }

    mediaHTML += `</div>`;

    // CARD UI
    card.innerHTML = `
      <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}"
         target="_blank"
         class="block overflow-hidden rounded-lg">

        ${mediaHTML}

        <span class="absolute z-10 top-3 left-3 ${wallpaper.type.includes('desktop') ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
          ${wallpaper.type}
        </span>
      </a>

      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <div class="flex gap-2">
          <a href="${wallpaper.download || wallpaper.url}" download
             class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">
            Download
          </a>

          <button class="likeBtn bg-green-600 px-3 py-1 rounded text-white">
            <i class="likeIcon far fa-thumbs-up mr-1"></i>
            <span class="likeCount">${formatNumber(likes)}</span>
          </button>
        </div>

        <div class="text-xs text-gray-400">
          👁 ${formatNumber(views)}
        </div>
      </div>

      <div class="px-4 py-4 flex flex-wrap gap-2 text-sm">
        ${wallpaper.tags.map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`).join('')}
      </div>
    `;

    latestGrid.appendChild(card);

    const media = card.querySelector('.wallpaper-img');
    const loader = card.querySelector('.loader-container');

    // LOAD EFFECT
    if (wallpaper.isVideo) {
      media.addEventListener('loadeddata', () => {
        loader.style.display = 'none';
      });

      card.addEventListener('mouseenter', () => media.play());
      card.addEventListener('mouseleave', () => {
        media.pause();
        media.currentTime = 0;
      });
    } else {
      media.addEventListener('load', () => {
        loader.style.display = 'none';
      });
    }

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
