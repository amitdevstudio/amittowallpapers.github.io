import { wallpapers } from './wallpaper.js';
// === Get the grid and search input ===
const wallpaperGrid = document.getElementById('wallpaperGrid');
const searchInput = document.getElementById('searchInput');

// === Flatten all images with meta ===
// === Flatten all images + videos for search ===
const allWallpapers = [];

wallpapers.forEach(item => {
  // --- Static images
  if (item.images && Array.isArray(item.images)) {
    item.images.forEach(img => {
      allWallpapers.push({
        character: item.character,
        type: item.type.toLowerCase(),
        tags: item.tags,
        url: img.url,
        date: img.date,
        mobile: img.mobile || '',
        tablet: img.tablet || '',
        desktop: img.desktop || ''
      });
    });
  }

  // --- Live videos
  if (item.videos && Array.isArray(item.videos)) {
    item.videos.forEach(video => {
      allWallpapers.push({
        character: item.character,
        type: item.type.toLowerCase(),
        tags: item.tags,
        preview: video.preview,
        download: video.download,
        date: video.date
      });
    });
  }
});


// Always newest first for search results
allWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// Clear initially
wallpaperGrid.innerHTML = '';

// === Search logic ===
searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim().toLowerCase();

  if (!term) {
    wallpaperGrid.innerHTML = '';
    return;
  }

  const filtered = allWallpapers.filter(wp => {
    // Ensure wp.character and wp.type are strings before calling toLowerCase()
    const character = typeof wp.character === 'string' ? wp.character.toLowerCase() : '';
    const type = typeof wp.type === 'string' ? wp.type.toLowerCase() : '';

    return character.includes(term) ||
      type.includes(term) ||
      (Array.isArray(wp.tags) && wp.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(term)));
  });

  renderWallpapers(filtered);
});

// === Render wallpapers to the grid ===
function renderWallpapers(list) {
  wallpaperGrid.innerHTML = '';

  if (list.length === 0) {
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

  list.forEach((wallpaper) => {
    const storageKey = `likes_${wallpaper.url || wallpaper.preview}`;
    const viewsKey = `views_${wallpaper.url || wallpaper.preview}`;

    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, randomRange(20000, 40000));
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
    card.className =
      "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6 relative";

    // -------------------------------
    // Unified Media (with loader)
    const isVideo = !!wallpaper.preview;
    const mediaHTML = `
      <div class="media-wrapper relative bg-[#1a1a1a] overflow-hidden">
        <div class="loader-container absolute inset-0 flex items-center justify-center">
          <div class="loader"><div></div><div></div><div></div></div>
        </div>
        ${
          isVideo
            ? `<video muted loop playsinline preload="none"
                class="preview-video w-full object-cover opacity-0 transition-opacity duration-500">
                <source data-src="${wallpaper.preview}" type="video/webm">
              </video>`
            : `<img 
                src="${wallpaper.url}" 
                alt="${wallpaper.character}" 
                class="wallpaper-img w-auto mx-auto object-cover opacity-0 ${wallpaper.type.toLowerCase() === 'mobile' ? 'h-80' : 'h-60'} transition-opacity duration-500"
                loading="lazy"
              />`
        }
      </div>
    `;

    // Badges
    const badgesHTML = `
      <div class="absolute top-3 left-3 flex flex-row gap-2 z-10">
        <span class="${
          wallpaper.type.toLowerCase().includes('desktop')
            ? 'bg-red-600'
            : 'bg-green-600'
        } text-white px-2 py-1 text-xs rounded-lg">
          ${wallpaper.type.charAt(0).toUpperCase() + wallpaper.type.slice(1)}
        </span>
        ${isVideo ? `<span class="bg-purple-600 text-white px-2 py-1 text-xs rounded-lg">Live</span>` : ''}
      </div>
    `;

    card.innerHTML = `
      <a href="${wallpaper.url || wallpaper.download}" target="_blank" class="relative block overflow-hidden rounded-lg">
        ${mediaHTML}
        ${badgesHTML}
      </a>
      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <div class="flex flex-wrap gap-2">
          <a href="${wallpaper.url || wallpaper.download}" download class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">
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
    // Loader fade logic (unified)
    if (isVideo) {
      const video = card.querySelector('.preview-video');
      const source = video.querySelector('source');
      const loader = card.querySelector('.loader-container');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !source.src) {
            source.src = source.dataset.src;
            video.load();

            video.addEventListener('loadeddata', () => {
              loader.style.opacity = '0';
              loader.style.transition = 'opacity 0.5s ease';
              setTimeout(() => loader.style.display = 'none', 500);
              video.classList.remove('opacity-0');
            }, { once: true });

            observer.unobserve(video);
          }
        });
      }, { threshold: 0.25 });
      observer.observe(video);

      // Hover / Touch play
      video.addEventListener('mouseenter', () => { if (source.src) video.play(); });
      video.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
      video.addEventListener('touchstart', () => { if (source.src) video.play(); });
      video.addEventListener('touchend', () => { video.pause(); video.currentTime = 0; });
    } else {
      const img = card.querySelector('.wallpaper-img');
      const loader = card.querySelector('.loader-container');
      img.addEventListener('load', () => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => loader.style.display = 'none', 500);
        img.classList.remove('opacity-0');
      });
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

// === Helpers ===
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}