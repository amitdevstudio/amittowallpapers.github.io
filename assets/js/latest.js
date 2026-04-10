import { wallpapers } from './wallpaper.js';

const latestGrid = document.getElementById('latestwallpaperGrid');
const showMoreBtn = document.getElementById('latest-show-more');

const latestWallpapers = [];

// -------------------------------
wallpapers.forEach(item => {
  if (Array.isArray(item.images)) {
    item.images.forEach(img => {
      latestWallpapers.push({
        character: item.character || '',
        type: (item.type || '').toLowerCase(),
        tags: item.tags || [],
        url: img.url,
        date: img.date || new Date().toISOString(),
        isVideo: false
      });
    });
  }

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

latestWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// -------------------------------
let visibleCount = 6;

render(latestWallpapers.slice(0, visibleCount));

showMoreBtn.addEventListener('click', () => {
  visibleCount += 6;
  render(latestWallpapers.slice(0, visibleCount));

  if (visibleCount >= latestWallpapers.length) {
    showMoreBtn.style.display = 'none';
  }
});
