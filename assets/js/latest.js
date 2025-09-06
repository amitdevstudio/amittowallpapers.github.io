// latest.js
import { wallpapers } from './wallpaper.js';

const wallpaperGrid = document.getElementById('latestwallpaperGrid');

// -------------------------------
// Flatten all wallpapers (static + live)
const allWallpapers = [];

wallpapers.forEach(item => {
  // Static wallpapers
  if (item.images) {
    item.images.forEach(img => {
      allWallpapers.push({
        character: item.character,
        type: item.type,
        tags: item.tags,
        url: img.url,
        date: img.date
      });
    });
  }

  // Live wallpapers
  if (item.videos) {
    item.videos.forEach(video => {
      allWallpapers.push({
        character: item.character,
        type: item.type,
        tags: item.tags,
        url: video.download, // download link
        preview: video.preview, // preview video
        date: video.date
      });
    });
  }
});

// Sort by newest date and take top 6
const latestWallpapers = allWallpapers
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 6);

renderWallpapers(latestWallpapers);

// -------------------------------
function renderWallpapers(list) {
  wallpaperGrid.innerHTML = '';

  list.forEach((wallpaper, index) => {
    // Use preview URL for live wallpapers, normal URL for static
    const storageKey = wallpaper.preview ? `likes_${wallpaper.preview}` : `likes_${wallpaper.url}`;
    const viewsKey   = wallpaper.preview ? `views_${wallpaper.preview}` : `views_${wallpaper.url}`;

    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, randomRange(20000, 100000));
    }
    if (!localStorage.getItem(viewsKey)) {
      localStorage.setItem(viewsKey, randomRange(50000, 200000));
    }

    let likes = parseInt(localStorage.getItem(storageKey), 10);
    let views = parseInt(localStorage.getItem(viewsKey), 10);

    if (views <= likes) {
      views = likes + randomRange(10000, 50000);
      localStorage.setItem(viewsKey, views);
    }

    const card = document.createElement('div');
    card.className = "card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6 relative";

    const placeholder = 'https://dummyimage.com/400x225/1a1a1a/ffffff.png&text=Live+Wallpaper';

    // -------------------------------
    // Media HTML
    let mediaHTML = '';
    if (wallpaper.preview) {
      // Live wallpaper
      mediaHTML = `
        <video muted loop playsinline preload="none"
          style="background: url('${placeholder}') center center / cover no-repeat;"
          class="preview-video w-auto object-cover mx-auto ${wallpaper.type.toLowerCase().includes('mobile') ? 'h-80' : 'h-60'}">
          <source data-src="${wallpaper.preview}" type="video/webm">
        </video>
      `;
    } else {
      // Static wallpaper
      mediaHTML = `<img loading="lazy" src="${wallpaper.url}" alt="${wallpaper.character}" class="w-auto object-cover mx-auto ${wallpaper.type.toLowerCase().includes('mobile') ? 'h-80' : 'h-60'}">`;
    }

    // -------------------------------
    // Badges
    const badgesHTML = `
      <div class="absolute top-3 left-3 flex flex-row gap-2 z-10">
        <span class="${wallpaper.type.toLowerCase().includes('desktop') ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
          ${wallpaper.type.toLowerCase().includes('desktop') ? 'Desktop' : 'Mobile'}
        </span>
        ${wallpaper.preview ? `<span class="bg-purple-600 text-white px-2 py-1 text-xs rounded-lg">Live</span>` : ''}
      </div>
    `;

    // -------------------------------
    card.innerHTML = `
      <a href="${wallpaper.url}" target="_blank" class="relative block overflow-hidden rounded-lg">
        ${mediaHTML}
        ${badgesHTML}
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

    // -------------------------------
    // Lazy-load & hover only on video (desktop)
    if (wallpaper.preview) {
      const video = card.querySelector('.preview-video');
      const source = video.querySelector('source');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !source.src) {
            source.src = source.dataset.src;
            video.load();
            observer.unobserve(video);
          }
        });
      }, { threshold: 0.25 });

      observer.observe(video);

      // Hover only on video area (desktop)
      video.addEventListener('mouseenter', () => {
        if (!window.matchMedia("(hover: none)").matches && source.src) video.play();
      });
      video.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
    }

    // -------------------------------
    // Likes logic
    const likeBtn = card.querySelector('.likeBtn');
    const likeIcon = card.querySelector('.likeIcon');
    const likeCountSpan = card.querySelector('.likeCount');

    let userLiked = false;
    likeBtn.addEventListener('click', () => {
      if (!userLiked) { likes++; userLiked = true; }
      else { likes--; userLiked = false; }
      localStorage.setItem(storageKey, likes);
      likeCountSpan.innerText = formatNumber(likes);
      likeIcon.classList.toggle('far', !userLiked);
      likeIcon.classList.toggle('fas', userLiked);
    });
  });
}

// -------------------------------
// Helpers
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}
