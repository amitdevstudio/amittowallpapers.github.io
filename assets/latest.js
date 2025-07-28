// latest.js
import { wallpapers } from './wallpaper.js'; // This path assumes latest.js is in the same directory as wallpaper.js

const wallpaperGrid = document.getElementById('latestwallpaperGrid');

// Flatten all wallpapers
const allWallpapers = []; // Corrected spelling here
wallpapers.forEach(wp => {
  wp.images.forEach(img => {
    allWallpapers.push({ // Corrected spelling here
      character: wp.character,
      type: wp.type,
      tags: wp.tags,
      url: img.url,
      date: img.date
    });
  });
});

// Sort by newest date and take only 6
const latestWallpapers = allWallpapers
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 6);

// Render immediately
renderWallpapers(latestWallpapers);


function renderWallpapers(list) {
  wallpaperGrid.innerHTML = '';

  list.forEach(wallpaper => {
    const storageKey = `likes_${wallpaper.url}`;
    const viewKey = `views_${wallpaper.url}`;
    const likedStateKey = `liked_${wallpaper.url}`; // New: Key for liked state persistence

    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, Math.floor(Math.random() * (100000 - 20000 + 1)) + 20000);
    }
    if (!localStorage.getItem(viewKey)) {
      localStorage.setItem(viewKey, Math.floor(Math.random() * (200000 - 50000 + 1)) + 50000);
    }

    let likes = parseInt(localStorage.getItem(storageKey), 10);
    let views = parseInt(localStorage.getItem(viewKey), 10);

    // Ensure views are always greater than likes (consistency check)
    if (views <= likes) {
      views = likes + (Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000); // Add a random buffer
      localStorage.setItem(viewKey, views);
    }

    // We load userLiked, but we will NOT use it for initial icon state (always 'far')
    // let userLiked = localStorage.getItem(likedStateKey) === 'true'; // This line is not needed for initial visual state anymore

    const card = document.createElement('div');
    card.className = "card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6";

    card.innerHTML = `
    <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}&mobile=${encodeURIComponent(wallpaper.mobile || '')}&tablet=${encodeURIComponent(wallpaper.tablet || '')}&desktop=${encodeURIComponent(wallpaper.desktop || '')}"
      target="_blank" class="relative group block overflow-hidden rounded-lg">
      <img loading="lazy"
        src="${wallpaper.url}"
        alt="${wallpaper.character}"
        class="w-auto object-fill mx-auto transition-transform duration-300 ease-in-out ${wallpaper.type.toLowerCase() === 'mobile' ? 'h-80' : 'h-60'} group-hover:scale-105 group-hover:brightness-110"
      />
      <span class="absolute z-10 top-3 left-3 ${wallpaper.type.toLowerCase() === 'desktop' ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
        ${wallpaper.type.charAt(0).toUpperCase() + wallpaper.type.slice(1)}
      </span>
  </a>
  <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
    <div class="flex flex-wrap gap-2">
      <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}&mobile=${encodeURIComponent(wallpaper.mobile || '')}&tablet=${encodeURIComponent(wallpaper.tablet || '')}&desktop=${encodeURIComponent(wallpaper.desktop || '')}"
         class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">
        <i class="fa-solid fa-download mr-1"></i>Download
      </a>
      <button class="likeBtn cursor-pointer bg-green-600 px-3 py-1 rounded text-white" data-wallpaper-url="${wallpaper.url}">
        <i class="likeIcon far fa-thumbs-up mr-1"></i> <span class="likeCount">${formatNumber(likes)}</span>
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

    const index = list.indexOf(wallpaper); // for delay

    // Set AOS attributes directly on the card
    card.setAttribute('data-aos', 'zoom-in'); // or use 'fade-up', 'flip-up', etc.
    card.setAttribute('data-aos-delay', `${index * 100}`); // 0ms, 100ms, 200ms...
    card.setAttribute('data-aos-duration', '600'); // animation duration in ms

    wallpaperGrid.appendChild(card);

    const likeBtn = card.querySelector('.likeBtn');
    const icon = card.querySelector('.likeIcon');
    const countSpan = card.querySelector('.likeCount');
    const currentCardWallpaperUrl = wallpaper.url;

    likeBtn.addEventListener('click', () => {
      // Re-read current likes from localStorage
      let currentLikes = parseInt(localStorage.getItem(`likes_${currentCardWallpaperUrl}`), 10);
      // Check the current VISUAL state of the icon (important for the logic!)
      let isCurrentlyVisualyLiked = icon.classList.contains('fas');

      if (!isCurrentlyVisualyLiked) { // If it's currently showing 'far' (unliked visually)
        currentLikes++;
        localStorage.setItem(`liked_${currentCardWallpaperUrl}`, 'true'); // Save actual liked state
        icon.classList.remove('far');
        icon.classList.add('fas');
      } else { // If it's currently showing 'fas' (liked visually)
        currentLikes--;
        localStorage.setItem(`liked_${currentCardWallpaperUrl}`, 'false'); // Save actual unliked state
        icon.classList.remove('fas');
        icon.classList.add('far');
      }
      localStorage.setItem(storageKey, currentLikes); // Save the updated count
      countSpan.innerText = formatNumber(currentLikes);
    });
  });
}

// Consistent formatNumber function
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}