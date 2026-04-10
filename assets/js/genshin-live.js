// genshin-live.js
import { wallpapers } from './wallpaper.js';

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("genshin-wallpapers");
  if (!container) return;

  // Filter only Genshin Impact wallpapers
  const genshinWallpapers = wallpapers.filter(wp => wp.tags.includes("Genshin Impact"));

  // Show first 4 featured wallpapers
  const featuredWallpapers = genshinWallpapers.slice(0, 4);

  featuredWallpapers.forEach((wp, index) => {
    const videoSrc = wp.videos[0].preview;
    const downloadSrc = wp.videos[0].download;
    const uniqueId = videoSrc;
    const characterName = wp.character || 'Unknown';
    const wpData = window.wallpaperStorage.getWallpaper(uniqueId, characterName);
    let likes = wpData.likes;
    let views = wpData.views;

    const card = document.createElement("div");
    card.className = "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6 relative";

    const badgesHTML = `
      <div class="absolute top-3 left-3 flex flex-row gap-2 z-10">
        <span class="${wp.type.includes('Desktop') ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
          ${wp.type.includes('Desktop') ? 'Desktop' : 'Mobile'}
        </span>
        <span class="bg-purple-600 text-white px-2 py-1 text-xs rounded-lg">Live</span>
      </div>
    `;

    const mediaHTML = `
      <div class="video-wrapper relative bg-[#1a1a1a] overflow-hidden h-60">
        <div class="loader-container absolute inset-0 flex items-center justify-center">
          <div class="loader">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <video muted playsinline preload="metadata" 
          class="preview-video w-auto h-full object-cover mx-auto opacity-0 transition-opacity duration-500"
          style="background-color: #1a1a1a;">
          <source data-src="${videoSrc}" type="video/webm">
        </video>
      </div>
    `;

    card.innerHTML = `
      <a href="wallpaper.html?title=${encodeURIComponent(wp.character)}&img=${encodeURIComponent(videoSrc)}&download=${encodeURIComponent(downloadSrc)}" 
         target="_blank" class="relative block overflow-hidden rounded-lg">
        ${mediaHTML}
        ${badgesHTML}
      </a>
      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <div class="flex gap-2">
          <a href="wallpaper.html?title=${encodeURIComponent(wp.character)}&img=${encodeURIComponent(videoSrc)}&download=${encodeURIComponent(downloadSrc)}" 
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
        ${wp.tags.map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`).join('')}
      </div>
    `;

    container.appendChild(card);

    // Video lazy loading and loader handling
    const video = card.querySelector('.preview-video');
    const source = video.querySelector('source');
    const loaderContainer = card.querySelector('.loader-container');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !source.src) {
          source.src = source.dataset.src;
          video.load();

          video.addEventListener('loadeddata', () => {
            loaderContainer.style.opacity = '0';
            loaderContainer.style.transition = 'opacity 0.5s ease';
            setTimeout(() => loaderContainer.style.display = 'none', 500);
            video.classList.remove('opacity-0');
          }, { once: true });

          observer.unobserve(video);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(video);

    // Play video on hover
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

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseVideo();
    });

    video.addEventListener('mouseenter', playVideo);
    video.addEventListener('mouseleave', pauseVideo);
    video.addEventListener('touchstart', playVideo);
    video.addEventListener('touchend', pauseVideo);
    video.addEventListener('ended', () => pauseVideo());

    // Like button logic
    const likeBtn = card.querySelector('.likeBtn');
    const likeIcon = card.querySelector('.likeIcon');
    const likeCountSpan = card.querySelector('.likeCount');

    const isUserLiked = window.wallpaperStorage.getUserLiked(uniqueId);
    likeIcon.classList.toggle('fas', isUserLiked);
    likeIcon.classList.toggle('far', !isUserLiked);

    likeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isCurrentlyLiked = window.wallpaperStorage.getUserLiked(uniqueId);
      const newLikesCount = window.wallpaperStorage.updateLikes(uniqueId, isCurrentlyLiked ? -1 : 1);
      window.wallpaperStorage.setUserLiked(uniqueId, !isCurrentlyLiked);
      
      likeCountSpan.innerText = formatNumber(newLikesCount);
      likeIcon.classList.toggle('far');
      likeIcon.classList.toggle('fas');
    });
  });
});

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}