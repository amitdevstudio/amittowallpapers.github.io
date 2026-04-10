import { wallpapers } from './wallpaper.js';

const wallpaperGrid = document.getElementById('latestwallpaperGrid');
const showMoreBtn = document.getElementById('latest-show-more');
const sortContainer = document.getElementById('sortContainer');

// Initialize sort buttons when DOM is ready
if (sortContainer && window.wallpaperSortHelper) {
  window.wallpaperSortHelper.createSortButtons(sortContainer);
}

// --- Flatten all wallpapers ---
const allWallpapers = [];

wallpapers.forEach(wp => {
  if (Array.isArray(wp.images)) {
    wp.images.forEach(img => {
      allWallpapers.push({
        character: String(wp.character || ''),
        type: String(wp.type || '').toLowerCase(),
        tags: Array.isArray(wp.tags) ? wp.tags.map(tag => String(tag)) : [],
        url: String(img.url || ''),
        date: img.date || new Date().toISOString(),
        mobile: img.mobile || '',
        tablet: img.tablet || '',
        desktop: img.desktop || '',
        isVideo: false
      });
    });
  }
  if (Array.isArray(wp.videos)) {
    wp.videos.forEach(video => {
      allWallpapers.push({
        character: String(wp.character || ''),
        type: String(wp.type || '').toLowerCase(),
        tags: Array.isArray(wp.tags) ? wp.tags.map(tag => String(tag)) : [],
        url: String(video.preview || ''),
        preview: String(video.preview || ''),
        download: String(video.download || ''),
        date: video.date || new Date().toISOString(),
        isVideo: true
      });
    });
  }
});

// --- Sort newest first ---
const sortedWallpapers = allWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// --- Take only first 60 wallpapers ---
const limitedWallpapers = sortedWallpapers.slice(0, 60);

// --- Pagination ---
let currentIndex = 0;
const batchSize = 6; // wallpapers per batch

renderNextBatch();
if (showMoreBtn) showMoreBtn.addEventListener('click', renderNextBatch);

// --- Render next batch ---
function renderNextBatch() {
  const nextBatch = limitedWallpapers.slice(currentIndex, currentIndex + batchSize);

  if (nextBatch.length === 0 && currentIndex === 0) {
    wallpaperGrid.innerHTML = `
      <div class="flex flex-col items-center justify-center h-96 text-center text-white mx-auto">
        <p class="text-lg font-semibold">No wallpapers found.</p>
        <p class="text-sm text-gray-400 mt-2">Please try a different search term.</p>
      </div>
    `;
    if (showMoreBtn) showMoreBtn.style.display = 'none';
    return;
  }

  // Add a column break to force new items below
  if (currentIndex > 0) {
    const breakElement = document.createElement('div');
    breakElement.style.columnSpan = 'all';
    breakElement.style.height = '0px';
    wallpaperGrid.appendChild(breakElement);
  }

  nextBatch.forEach((wallpaper, idx) => {
    // pass current index for staggered AOS delay
    renderCard(wallpaper, wallpaperGrid, currentIndex + idx);
  });

  currentIndex += batchSize;
  if (currentIndex >= limitedWallpapers.length && showMoreBtn) showMoreBtn.style.display = 'none';

  // Refresh AOS to apply animations to new cards
  if (window.AOS) AOS.refresh();
}

// --- Render individual card ---
function renderCard(wallpaper, grid, index = 0) {
  const card = document.createElement('div');
  card.className = "wallpaper-card break-inside-avoid overflow-hidden border-gray-700 border-1 rounded-xl bg-[#1a1a1a] mb-6";

  // --- AOS animation with staggered delay ---
  card.setAttribute('data-aos', 'zoom-in');
  card.setAttribute('data-aos-duration', '800');
  card.setAttribute('data-aos-delay', '100'); // 100ms per card

  const uniqueId = wallpaper.url || wallpaper.preview;
  const characterName = wallpaper.character || 'Unknown';
  const wpData = window.wallpaperStorage.getWallpaper(uniqueId, characterName);
  let likes = wpData.likes;
  let views = wpData.views;

  // --- Media HTML with loader ---
  let mediaHTML = '';
  if (wallpaper.isVideo) {
    mediaHTML = `
      <div class="relative group">
        <div class="loader-container absolute inset-0 flex items-center justify-center">
          <div class="loader"><div></div><div></div><div></div></div>
        </div>
        <video loop muted playsinline class="wallpaper-img w-fit h-48 sm:h-56 md:h-64 object-cover opacity-0 transition-opacity duration-500 group-hover:scale-105">
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
        <img loading="lazy" src="${wallpaper.url}" alt="${wallpaper.character}" class="wallpaper-img w-full h-48 sm:h-56 md:h-64 object-cover opacity-0 transition-opacity duration-500 group-hover:scale-105"/>
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

  grid.appendChild(card);

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

  // --- Like button ---
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

// --- Helpers ---
function randomRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}
