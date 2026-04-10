import { wallpapers } from './wallpaper.js';

const wallpaperGrid = document.getElementById('wallpaperGrid');
const searchInput = document.getElementById('searchInput');

const allWallpapers = [];

// -------------------------------
wallpapers.forEach(item => {
  if (Array.isArray(item.images)) {
    item.images.forEach(img => {
      allWallpapers.push({
        character: String(item.character || ''),
        type: String(item.type || '').toLowerCase(),
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
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
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        url: String(video.preview || ''),
        download: String(video.download || ''),
        date: video.date || new Date().toISOString(),
        isVideo: true
      });
    });
  }
});

allWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// -------------------------------
searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim().toLowerCase();

  if (!term) {
    wallpaperGrid.innerHTML = '';
    return;
  }

  const filtered = allWallpapers.filter(wp => {
    if (term === 'live') return wp.isVideo;

    return (
      wp.character.toLowerCase().includes(term) ||
      wp.type.toLowerCase().includes(term) ||
      wp.tags.some(tag => tag.toLowerCase().includes(term))
    );
  });

  render(filtered);
});

// -------------------------------
function render(list) {
  wallpaperGrid.innerHTML = '';
  list.forEach(wp => createCard(wp));
}
