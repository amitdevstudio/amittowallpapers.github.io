import { wallpapers } from './wallpaper.js';
// === Get the grid and search input ===
const wallpaperGrid = document.getElementById('wallpaperGrid');
const searchInput = document.getElementById('searchInput');

// === Flatten all images with meta ===
const allWallpapers = [];
wallpapers.forEach(item => {
  item.images.forEach(img => {
    allWallpapers.push({
      character: item.character,
      type: item.type.toLowerCase(),
      tags: item.tags,
      url: img.url,
      date: img.date
    });
  });
});

// ✅ Always newest first for search results
allWallpapers.sort((a, b) => new Date(b.date) - new Date(a.date));

// ✅ Clear initially
wallpaperGrid.innerHTML = '';

// === Search logic ===
searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim().toLowerCase();

  if (!term) {
    wallpaperGrid.innerHTML = '';
    return;
  }

  const filtered = allWallpapers.filter(wp =>
    wp.character.toLowerCase().includes(term) ||
    wp.type.toLowerCase().includes(term) ||
    wp.tags.some(tag => tag.toLowerCase().includes(term))
  );

  renderWallpapers(filtered);
});

// === Render wallpapers to the grid ===
function renderWallpapers(list) {
  wallpaperGrid.innerHTML = '';

  if (list.length === 0) {
    wallpaperGrid.innerHTML = `
      <div class="flex flex-col justify-center mt-8 w-full items-center h-48z text-center mx-auto space-y-1 p-2">
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
    const storageKey = `likes_${wallpaper.url}`;
    const viewsKey = `views_${wallpaper.url}`;

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
    card.className = "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6";

    card.innerHTML = `
  <a href="${wallpaper.url}" class="relative group block overflow-hidden rounded-lg">
    <img loading="lazy"
      src="${wallpaper.url}" 
      alt="${wallpaper.character}" 
      class="w-auto object-fill mx-auto transition-transform duration-300 ease-in-out ${wallpaper.type.toLowerCase() === 'mobile' ? 'h-80' : 'h-60'} group-hover:scale-105 group-hover:brightness-110" 
    />
    <span class="absolute top-3 left-3 ${wallpaper.type.toLowerCase() === 'desktop' ? 'bg-red-600' : 'bg-green-600'
      } text-white px-2 py-1 text-xs rounded-lg">
      ${wallpaper.type.charAt(0).toUpperCase() + wallpaper.type.slice(1)}
    </span>
  </a>
  <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
    <div class="flex flex-wrap gap-2">
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
    <span class="font-bold">
      <i class="fa-solid fa-tags mr-1"></i>Tags:
    </span>
    ${wallpaper.tags.map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`).join('')}
  </div>
`;


    wallpaperGrid.appendChild(card);

    const likeBtn = card.querySelector('.likeBtn');
    const likeIcon = card.querySelector('.likeIcon');
    const likeCountSpan = card.querySelector('.likeCount');

    let userLiked = false;

    likeBtn.addEventListener('click', () => {
      if (!userLiked) {
        likes++;
        userLiked = true;
      } else {
        likes--;
        userLiked = false;
      }
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