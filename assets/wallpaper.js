const wallpaperGrid = document.getElementById('wallpaperGrid');
const searchInput = document.getElementById('searchInput');

export const wallpapers = [
  // Naruto
  {
    character: "Itachi",
    type: "Desktop",
    tags: ["Naruto", "Anime", "Itachi", "Desktop"],
    images: [
      "assets/images/wallpapers/naruto/desktop/itachi/1.jpg",
      "assets/images/wallpapers/naruto/desktop/itachi/2.jpg",
      "assets/images/wallpapers/naruto/desktop/itachi/3.jpg",
      "assets/images/wallpapers/naruto/desktop/itachi/4.jpg",
    ]
  },
  {
    character: "Itachi",
    type: "Mobile",
    tags: ["Naruto", "Anime", "Itachi", "Mobile"],
    images: [
      "assets/images/wallpapers/naruto/mobile/itachi/1.jpg",
      "assets/images/wallpapers/naruto/mobile/itachi/2.jpg",
      "assets/images/wallpapers/naruto/mobile/itachi/3.jpg",
      "assets/images/wallpapers/naruto/mobile/itachi/4.jpg",
      "assets/images/wallpapers/naruto/mobile/itachi/5.jpg",
    ]
  },
  {
    character: "Naruto",
    type: "desktop",
    tags: ["Naruto", "Anime", "Desktop"],
    images: [
      "assets/images/wallpapers/naruto/desktop/naruto/1.jpg",
      "assets/images/wallpapers/naruto/desktop/naruto/2.jpg"
    ]
  },
  {
    character: "Naruto",
    type: "Mobile",
    tags: ["Naruto", "Anime", "Mobile"],
    images: [
      "assets/images/wallpapers/naruto/mobile/naruto/1.jpg",
      "assets/images/wallpapers/naruto/mobile/naruto/2.jpg"
    ]
  },
  {
    character: "Kakashi",
    type: "Desktop",
    tags: ["Naruto", "Anime", "Desktop", "Kakashi"],
    images: [
      "assets/images/wallpapers/naruto/desktop/kakashi/1.jpg",
      "assets/images/wallpapers/naruto/desktop/kakashi/2.jpg",
      "assets/images/wallpapers/naruto/desktop/kakashi/3.jpg",
      "assets/images/wallpapers/naruto/desktop/kakashi/4.jpg",
      "assets/images/wallpapers/naruto/desktop/kakashi/5.jpg",
      "assets/images/wallpapers/naruto/desktop/kakashi/6.png",
      "assets/images/wallpapers/naruto/desktop/kakashi/7.png",
      "assets/images/wallpapers/naruto/desktop/kakashi/8.png",
      "assets/images/wallpapers/naruto/desktop/kakashi/9.png",
      "assets/images/wallpapers/naruto/desktop/kakashi/10.png",
    ]
  },
  {
    character: "Akatsuki",
    type: "Mobile",
    tags: ["Naruto", "Anime", "Mobile", "Akatsuki"],
    images: [
      "assets/images/wallpapers/naruto/mobile/akatsuki/1.jpg",
    ]
  },
  // Bleach
  {
    character: "Aizen",
    type: "Mobile",
    tags: ["Bleach", "Anime", "Mobile", "Aizen"],
    images: [
      "assets/images/wallpapers/bleach/mobile/aizen/1.jpg",
    ]
  },
  {
    character: "Ichigo",
    type: "Desktop",
    tags: ["Bleach", "Anime", "Desktop", "Ichigo"],
    images: [
      "assets/images/wallpapers/bleach/desktop/ichigo/1.jpg",
      "assets/images/wallpapers/bleach/desktop/ichigo/2.jpg",
      "assets/images/wallpapers/bleach/desktop/ichigo/3.png",
      "assets/images/wallpapers/bleach/desktop/ichigo/4.jpg",
      "assets/images/wallpapers/bleach/desktop/ichigo/5.jpg",
      "assets/images/wallpapers/bleach/desktop/ichigo/6.jpg",
      "assets/images/wallpapers/bleach/desktop/ichigo/7.png",
      "assets/images/wallpapers/bleach/desktop/ichigo/8.jpg",
      "assets/images/wallpapers/bleach/desktop/ichigo/9.jpg",
    ]
  },
  {
    character: "Ichigo",
    type: "Mobile",
    tags: ["Bleach", "Anime", "Mobile", "Ichigo"],
    images: [
      "assets/images/wallpapers/bleach/mobile/ichigo/1.jpg",
      "assets/images/wallpapers/bleach/mobile/ichigo/2.jpg",
      "assets/images/wallpapers/bleach/mobile/ichigo/3.jpg",
      "assets/images/wallpapers/bleach/mobile/ichigo/4.jpg",
      "assets/images/wallpapers/bleach/mobile/ichigo/5.jpg",
      "assets/images/wallpapers/bleach/mobile/ichigo/6.jpg",
    ]
  },
  {
    character: "Rukia",
    type: "Desktop",
    tags: ["Bleach", "Anime", "Desktop", "Rukia"],
    images: [
      "assets/images/wallpapers/bleach/desktop/rukia/1.png",
      "assets/images/wallpapers/bleach/desktop/rukia/2.png",
    ]
  },
  {
    character: "Grimmjow",
    type: "Mobile",
    tags: ["Bleach", "Anime", "Mobile", "Grimmjow"],
    images: [
      "assets/images/wallpapers/bleach/mobile/grimmjow/1.jpg",
    ]
  },
  {
    character: "Toshiro",
    type: "Mobile",
    tags: ["Bleach", "Anime", "Mobile", "Toshiro"],
    images: [
      "assets/images/wallpapers/bleach/mobile/toshiro/1.jpg",
      "assets/images/wallpapers/bleach/mobile/toshiro/2.jpg",
    ]
  },
  {
    character: "Urahara",
    type: "Mobile",
    tags: ["Bleach", "Anime", "Mobile", "Urahara"],
    images: [
      "assets/images/wallpapers/bleach/mobile/urahara/1.jpg",
    ]
  },
  // One Piece
    {
    character: "Luffy",
    type: "Desktop",
    tags: ["One Piece", "Anime", "Desktop", "Luffy"],
    images: [
      "assets/images/wallpapers/one-piece/desktop/luffy/1.png",
      "assets/images/wallpapers/one-piece/desktop/luffy/2.png",
      "assets/images/wallpapers/one-piece/desktop/luffy/3.jpg",  
      "assets/images/wallpapers/one-piece/desktop/luffy/4.jpg", 
      "assets/images/wallpapers/one-piece/desktop/luffy/5.jpg", 
    ]
  },
    {
    character: "Luffy",
    type: "Mobile",
    tags: ["One Piece", "Anime", "Mobile", "Luffy"],
    images: [
      "assets/images/wallpapers/one-piece/mobile/luffy/1.jpg",
      "assets/images/wallpapers/one-piece/mobile/luffy/2.jpg",
      "assets/images/wallpapers/one-piece/mobile/luffy/3.jpg", ,
      "assets/images/wallpapers/one-piece/mobile/luffy/4.jpg", ,
      "assets/images/wallpapers/one-piece/mobile/luffy/5.jpg", ,
      "assets/images/wallpapers/one-piece/mobile/luffy/6.jpg", ,
      "assets/images/wallpapers/one-piece/mobile/luffy/7.jpg", ,
      "assets/images/wallpapers/one-piece/mobile/luffy/8.jpg", ,
      "assets/images/wallpapers/one-piece/mobile/luffy/9.jpg", ,
      "assets/images/wallpapers/one-piece/mobile/luffy/10.jpg", ,
      "assets/images/wallpapers/one-piece/mobile/luffy/11.jpg", ,
      "assets/images/wallpapers/one-piece/mobile/luffy/12.jpg", ,
      "assets/images/wallpapers/one-piece/mobile/luffy/13.jpg", ,
    ]
  },
    {
    character: "Zoro",
    type: "Desktop",
    tags: ["One Piece", "Anime", "Desktop", "Zoro"],
    images: [
      "assets/images/wallpapers/one-piece/desktop/zoro/1.jpg",
      "assets/images/wallpapers/one-piece/desktop/zoro/2.jpg",
      "assets/images/wallpapers/one-piece/desktop/zoro/3.jpg", 
      "assets/images/wallpapers/one-piece/desktop/zoro/4.jpg", 
      "assets/images/wallpapers/one-piece/desktop/zoro/5.jpg", 
      "assets/images/wallpapers/one-piece/desktop/zoro/6.jpg", 
      "assets/images/wallpapers/one-piece/desktop/zoro/7.jpg", 
    ]
  },
    {
    character: "Zoro",
    type: "Mobile",
    tags: ["One Piece", "Anime", "Mobile", "Zoro"],
    images: [
      "assets/images/wallpapers/one-piece/mobile/zoro/1.jpg",
      "assets/images/wallpapers/one-piece/mobile/zoro/2.jpg",
      "assets/images/wallpapers/one-piece/mobile/zoro/3.jpg", 
      "assets/images/wallpapers/one-piece/mobile/zoro/4.jpg", 
      "assets/images/wallpapers/one-piece/mobile/zoro/5.jpg", 
      "assets/images/wallpapers/one-piece/mobile/zoro/6.jpg", 
      "assets/images/wallpapers/one-piece/mobile/zoro/7.jpg", 
    ]
  },
  // Add more wallpaper objects here...
];
// === Flatten them into allWallpapers ===
const allWallpapers = [];
wallpapers.forEach(wp => {
  wp.images.forEach(url => {
    allWallpapers.push({
      character: wp.character,
      type: wp.type,
      tags: wp.tags,
      url: url
    });
  });
});

// ✅ === Clear the grid initially (DO NOT show wallpapers yet) ===
wallpaperGrid.innerHTML = '';

// ✅ === NO renderWallpapers(allWallpapers) call ===
// This keeps them hidden until search

// === Your search logic ===
searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim().toLowerCase();

  if (!term) {
    // Clear results if search is empty
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

// === Your renderWallpapers logic ===
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

  list.forEach(wallpaper => {
    const storageKey = `likes_${wallpaper.url}`;
    const viewKey = `views_${wallpaper.url}`;

    // ✅ Make sure you get likes >20k and views >50k if new
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, Math.floor(Math.random() * (100000 - 20000 + 1)) + 20000);
    }
    if (!localStorage.getItem(viewKey)) {
      localStorage.setItem(viewKey, Math.floor(Math.random() * (200000 - 50000 + 1)) + 50000);
    }

    let likes = parseInt(localStorage.getItem(storageKey), 10);
    const views = parseInt(localStorage.getItem(viewKey), 10);

    const card = document.createElement('div');
    card.className = "card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6";

    card.innerHTML = `
      <a href="${wallpaper.url}" class="relative block">
        <img src="${wallpaper.url}" alt="${wallpaper.character}" class="w-full object-cover rounded-lg" />
        <span class="absolute top-3 left-3 ${wallpaper.type === 'desktop' ? 'bg-red-600' : 'bg-green-600'} text-white px-2 py-1 text-xs rounded-lg">
          ${wallpaper.type.charAt(0).toUpperCase() + wallpaper.type.slice(1)}
        </span>
      </a>
      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <div class="flex gap-2">
          <a href="${wallpaper.url}" download class="bg-blue-600 hover:bg-blue-700 active:bg-blue-600 px-3 py-1 rounded text-white">
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

    const likeBtn = card.querySelector('.likeBtn');
    const icon = card.querySelector('.likeIcon');
    const countSpan = card.querySelector('.likeCount');

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
      countSpan.innerText = formatNumber(likes);
      icon.classList.toggle('far', !userLiked);
      icon.classList.toggle('fas', userLiked);
    });
  });
}

// === Helper ===
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (Math.floor(num / 100) / 10).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}