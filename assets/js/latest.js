import { wallpapers } from './wallpaper.js';

const latestGrid = document.getElementById('latestGrid');
const wallpaperGrid = document.getElementById('wallpaperGrid');
const searchInput = document.getElementById('searchInput');

const latestWallpapers = [];
const allWallpapers = [];

// -------------------------------
// PROCESS DATA
wallpapers.forEach(item => {

  // ✅ IMAGES
  if (Array.isArray(item.images)) {
    item.images.forEach(img => {

      const data = {
        character: String(item.character || ''),
        type: String(item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags : [],
        url: String(img),
        date: item.date || new Date().toISOString(),
        isVideo: false
      };

      latestWallpapers.push(data);
      allWallpapers.push(data);
    });
  }

  // ✅ VIDEOS (FIXED POSITION)
  if (Array.isArray(item.videos)) {
    item.videos.forEach(video => {
      allWallpapers.push({
        character: String(item.character || ''),
        type: String(item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags : [],
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
// SHOW LATEST (TOP 6)
latestWallpapers
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 6)
  .forEach(wp => {
    latestGrid.innerHTML += `
      <div class="bg-[#1a1a1a] rounded-xl overflow-hidden">
        <img src="${wp.url}" class="w-full h-48 object-cover">
        <div class="p-3">
          <h3 class="text-white text-sm">${wp.character}</h3>
        </div>
      </div>
    `;
  });

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

    if (term === 'live' || term === 'live wallpaper') return wp.isVideo;

    return (
      character.includes(term) ||
      type.includes(term) ||
      wp.tags.some(tag => tag.toLowerCase().includes(term))
    );
  });

  renderWallpapers(filtered);
});
