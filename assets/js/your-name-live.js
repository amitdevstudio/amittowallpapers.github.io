import { wallpapers } from './wallpaper.js';

const liveWallpapers = [];

// Flatten Your Name live wallpapers
wallpapers.forEach(item => {
  if (item.tags.includes('Your Name') && item.type.toLowerCase().includes('live')) {
    if (item.videos) {
      item.videos.forEach(video => {
        liveWallpapers.push({
          character: item.character,
          type: item.type,
          tags: item.tags,
          preview: video.preview,
          download: video.download,
          date: video.date
        });
      });
    }
  }
});

// Sort newest first
liveWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// Split desktop & mobile
const desktopLiveWallpapers = liveWallpapers.filter(w => w.type.toLowerCase() === 'desktop live');
const mobileLiveWallpapers = liveWallpapers.filter(w => w.type.toLowerCase() === 'mobile live');

// Initialize show more sections
initShowMore(desktopLiveWallpapers, 'live-desktop-grid', 'live-desktop-show-more');
initShowMore(mobileLiveWallpapers, 'live-mobile-grid', 'live-mobile-show-more');

// -------------------------------
// Generic chunk loader
function initShowMore(wallpapers, gridId, buttonId) {
  const grid = document.getElementById(gridId);
  const button = document.getElementById(buttonId);
  const chunkSize = 4;
  let currentIndex = 0;

  function renderChunk() {
    const nextItems = wallpapers.slice(currentIndex, currentIndex + chunkSize);
    nextItems.forEach(wp => renderLiveCard(wp, grid));
    currentIndex += chunkSize;

    if (currentIndex >= wallpapers.length) button.style.display = 'none';
  }

  renderChunk();
  button.addEventListener('click', renderChunk);
}

// -------------------------------
// Render single live wallpaper card
function renderLiveCard(wallpaper, grid) {
  const card = document.createElement('div');
  card.className = "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6 relative";

  const uniqueId = wallpaper.preview || wallpaper.download;
  const characterName = wallpaper.character || 'Unknown';
  const wpData = window.wallpaperStorage.getWallpaper(uniqueId, characterName);
  let likes = wpData.likes;
  let views = wpData.views;

  let mediaHTML = '';
  if (wallpaper.preview) {
    mediaHTML = `
  <div class="video-wrapper relative bg-[#1a1a1a] overflow-hidden ${wallpaper.type === 'Mobile Live' ? 'h-80' : 'h-60'}">
    <!-- Loader container (centered with 3 dots) -->
    <div class="loader-container absolute inset-0 flex items-center justify-center">
      <div class="loader">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>

    <!-- Video -->
    <video muted playsinline preload="metadata" 
      class="preview-video w-auto h-full object-fill mx-auto opacity-0 transition-opacity duration-500"
      style="background-color: #1a1a1a;">
      <source data-src="${wallpaper.preview}" type="video/webm">
    </video>
  </div>
`;

  } else {
    mediaHTML = `<img loading="lazy" src="${wallpaper.download}" alt="${wallpaper.character}" class="w-auto object mx-auto ${wallpaper.type === 'Mobile Live' ? 'h-80' : 'h-60'}">`;
  }


  // Badges
  const badgesHTML = `
    <div class="absolute top-3 left-3 flex flex-row gap-2 z-10">
      <span class="${wallpaper.type.includes('Desktop') ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
        ${wallpaper.type.includes('Desktop') ? 'Desktop' : 'Mobile'}
      </span>
      ${wallpaper.preview ? `<span class="bg-purple-600 text-white px-2 py-1 text-xs rounded-lg">Live</span>` : ''}
    </div>
  `;

  card.innerHTML = `
    <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.preview)}&download=${encodeURIComponent(wallpaper.download)}" 
       target="_blank" class="relative block overflow-hidden rounded-lg">
      ${mediaHTML}
      ${badgesHTML}
    </a>
    <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
      <div class="flex gap-2">
        <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.preview)}&download=${encodeURIComponent(wallpaper.download)}" 
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

  // -------------------------------
  // Lazy-load video + loader handling
  if (wallpaper.preview) {
    const video = card.querySelector('.preview-video');
    const source = video.querySelector('source');
    const loaderContainer = card.querySelector('.loader-container');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !source.src) {
          source.src = source.dataset.src;
          video.load();

          video.addEventListener('loadeddata', () => {
            // Fade out loader
            loaderContainer.style.opacity = '0';
            loaderContainer.style.transition = 'opacity 0.5s ease';
            setTimeout(() => loaderContainer.style.display = 'none', 500);

            // Fade in video
            video.classList.remove('opacity-0');
          }, { once: true });

          observer.unobserve(video);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(video);

    // Play video only on hover (desktop) or tap (mobile) - with performance optimization
    let isPlaying = false;
    
    const playVideo = () => {
      if (source.src && !isPlaying) {
        isPlaying = true;
        video.play().catch(() => {});
      }
    };

    const pauseVideo = () => {
      if (isPlaying) {
        isPlaying = false;
        video.pause();
        video.currentTime = 0;
      }
    };

    // Use visibility API to pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseVideo();
      }
    });

    video.addEventListener('mouseenter', playVideo);
    video.addEventListener('mouseleave', pauseVideo);
    video.addEventListener('touchstart', playVideo);
    video.addEventListener('touchend', pauseVideo);
    
    // Prevent multiple loop plays by resetting on end
    video.addEventListener('ended', () => {
      pauseVideo();
    });
  }

  // Likes button logic
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

// -------------------------------
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}