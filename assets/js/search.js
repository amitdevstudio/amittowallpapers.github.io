function createCard(wallpaper, grid) {

  const uniqueId = wallpaper.url || wallpaper.preview;
  const characterName = wallpaper.character || 'Unknown';

  const wpData = window.wallpaperStorage.getWallpaper(uniqueId, characterName);
  let likes = wpData.likes;
  let views = wpData.views;

  const card = document.createElement('div');
  card.className =
    "wallpaper-card break-inside-avoid overflow-hidden rounded-xl bg-[#1a1a1a] shadow-lg mb-6";

  let mediaHTML = `
    <div class="relative group">
      <div class="loader-container absolute inset-0 flex items-center justify-center bg-black/40 z-10">
        <div class="loader"><div></div><div></div><div></div></div>
      </div>
  `;

  if (wallpaper.isVideo) {
    mediaHTML += `
      <video loop muted playsinline
        class="wallpaper-img w-full object-fill mx-auto opacity-0 transition duration-300 group-hover:scale-105 group-hover:brightness-110 ${wallpaper.type === 'mobile' ? 'h-80' : 'h-60'}">
        <source src="${wallpaper.url}" type="video/mp4">
      </video>
    `;
  } else {
    mediaHTML += `
      <img src="${wallpaper.url}"
        class="wallpaper-img w-full object-fill mx-auto opacity-0 transition duration-300 group-hover:scale-105 group-hover:brightness-110 ${wallpaper.type === 'mobile' ? 'h-80' : 'h-60'}"/>
    `;
  }

  mediaHTML += `</div>`;

  card.innerHTML = `
    <a href="wallpaper.html?title=${encodeURIComponent(wallpaper.character)}&img=${encodeURIComponent(wallpaper.url)}"
       target="_blank"
       class="block overflow-hidden rounded-lg">

      ${mediaHTML}

      <span class="absolute z-10 top-3 left-3 ${
        wallpaper.type.includes('desktop') ? 'bg-red-600' : 'bg-green-600'
      } text-white px-2 py-1 text-xs rounded-lg">
        ${wallpaper.type}
      </span>
    </a>

    <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
      <div class="flex gap-2">
        <a href="${wallpaper.url}"
           download
           class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">
          Download
        </a>

        <button class="likeBtn bg-green-600 px-3 py-1 rounded text-white">
          <i class="likeIcon far fa-thumbs-up mr-1"></i>
          <span class="likeCount">${formatNumber(likes)}</span>
        </button>
      </div>

      <div class="text-xs text-gray-400">
        👁 ${formatNumber(views)}
      </div>
    </div>

    <div class="px-4 py-4 flex flex-wrap gap-2 text-sm">
      ${wallpaper.tags
        .map(tag => `<span class="bg-gray-800 px-3 py-1 rounded-full">${tag}</span>`)
        .join('')}
    </div>
  `;

  grid.appendChild(card);

  // ---------------- loader fix
  const media = card.querySelector('.wallpaper-img');
  const loader = card.querySelector('.loader-container');

  function hideLoader() {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      media.style.opacity = '1';
    }, 300);
  }

  if (wallpaper.isVideo) {
    media.addEventListener('loadeddata', hideLoader);
    card.addEventListener('mouseenter', () => media.play());
    card.addEventListener('mouseleave', () => {
      media.pause();
      media.currentTime = 0;
    });
  } else {
    media.addEventListener('load', hideLoader);
  }

  // LIKE
  const likeBtn = card.querySelector('.likeBtn');
  const likeIcon = card.querySelector('.likeIcon');
  const likeCount = card.querySelector('.likeCount');

  const isLiked = window.wallpaperStorage.getUserLiked(uniqueId);

  likeIcon.classList.toggle('fas', isLiked);
  likeIcon.classList.toggle('far', !isLiked);

  likeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const current = window.wallpaperStorage.getUserLiked(uniqueId);
    const updatedLikes = window.wallpaperStorage.updateLikes(
      uniqueId,
      current ? -1 : 1
    );

    window.wallpaperStorage.setUserLiked(uniqueId, !current);

    likeCount.innerText = formatNumber(updatedLikes);
    likeIcon.classList.toggle('fas');
    likeIcon.classList.toggle('far');
  });
}
