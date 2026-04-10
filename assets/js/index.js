import { wallpapers } from './wallpaper.js';

// -------------------------------
// GRID REFERENCES
const wallpaperGrid = document.getElementById('wallpaperGrid');
const latestWallpaperGrid = document.getElementById('latestwallpaperGrid');

// -------------------------------
// UI TOGGLE LOGIC
const toggleOpen = document.getElementById("toggleOpen");
const toggleClose = document.getElementById("toggleClose");
const collapseMenu = document.getElementById("collapseMenu");
const menuOverlay = document.getElementById("menuOverlay");

function openMenu() {
  collapseMenu.classList.remove("max-lg:hidden");
  menuOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  collapseMenu.classList.add("max-lg:hidden");
  menuOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

if (toggleOpen && toggleClose && collapseMenu && menuOverlay) {
  toggleOpen.addEventListener("click", openMenu);
  toggleClose.addEventListener("click", closeMenu);
  menuOverlay.addEventListener("click", closeMenu);

  document.querySelectorAll("#collapseMenu a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}

// -------------------------------
// CATEGORY SHOW/HIDE
const showMoreBtn = document.getElementById("showMoreCategories");
const showLessBtn = document.getElementById("showLessCategories");
const moreCategories = document.querySelectorAll(".more-category");

if (showMoreBtn && showLessBtn) {
  showMoreBtn.addEventListener("click", () => {
    moreCategories.forEach(card => card.classList.remove("hidden"));
    showMoreBtn.classList.add("hidden");
    showLessBtn.classList.remove("hidden");
  });

  showLessBtn.addEventListener("click", () => {
    moreCategories.forEach(card => card.classList.add("hidden"));
    showMoreBtn.classList.remove("hidden");
    showLessBtn.classList.add("hidden");
  });
}

// -------------------------------
// BACK TO TOP
const backToTopButton = document.getElementById('back-to-top');

if (backToTopButton) {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.remove('hidden');
    } else {
      backToTopButton.classList.add('hidden');
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// -------------------------------
// CARD CREATION (FIXED MOBILE CENTER ISSUE)
function createWallpaperCard(wp) {

  const isMobile = (wp.type || '').toLowerCase() === 'mobile';

  return `
    <div class="
      mb-4 break-inside-avoid
      flex justify-center
    ">

      <div class="
        relative overflow-hidden rounded-xl shadow-lg group
        ${isMobile
          ? 'w-[85%] sm:w-[70%] md:w-[60%]'   /* 🔥 MOBILE CENTER FIX */
          : 'w-full'
        }
      ">

        <img 
          src="${wp.src}" 
          alt="${wp.alt}" 
          loading="lazy"
          class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          onerror="this.onerror=null;this.src='https://placehold.co/600x400/1e293b/cbd5e1?text=Image+Error';"
        />

        <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">

          <h3 class="text-white text-base font-medium">${wp.alt}</h3>

          <div class="flex space-x-2 mt-2">

            <button onclick="downloadImage('${wp.src}')"
              class="text-white bg-yellow-600/90 hover:bg-yellow-500 text-xs px-3 py-1 rounded-full">
              Download
            </button>

          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------
// RENDER FUNCTION
function renderWallpapers(list, container) {
  container.innerHTML = '';

  if (!list || !list.length) {
    container.innerHTML = `
      <div class="col-span-full flex justify-center items-center h-48 text-center">
        <p class="text-white">No wallpapers found</p>
      </div>
    `;
    return;
  }

  list.forEach(wp => {
    container.innerHTML += createWallpaperCard(wp);
  });
}

// -------------------------------
// DOWNLOAD FUNCTION
window.downloadImage = function(src) {
  const box = document.getElementById('message-box');
  const text = document.getElementById('message-text');

  text.textContent = `Downloading ${src.split('/').pop()}...`;

  box.classList.remove('hidden', 'opacity-0');
  box.classList.add('opacity-100');

  setTimeout(() => {
    box.classList.add('opacity-0');
    box.classList.add('hidden');
  }, 3000);
};

// -------------------------------
// MOCK DATA
const mockWallpapers = [
  { src: 'assets/images/wallpapers/goku-blue.jpg', alt: 'Goku SS Blue', type: 'desktop' },
  { src: 'assets/images/wallpapers/luffy-one-piece.jpg', alt: 'Luffy Gear 5', type: 'mobile' },
  { src: 'assets/images/wallpapers/tanjiro-demon-slayer.jpg', alt: 'Tanjiro', type: 'desktop' },
  { src: 'assets/images/wallpapers/levi-attack-titan.jpg', alt: 'Levi Ackerman', type: 'mobile' }
];

// -------------------------------
// LOAD MAIN
function loadMainWallpapers() {
  if (wallpaperGrid) {
    renderWallpapers(mockWallpapers, wallpaperGrid);
  }
}

// -------------------------------
// LOAD LATEST
function loadLatestWallpapers() {
  if (latestWallpaperGrid) {
    renderWallpapers(mockWallpapers.slice(0, 3), latestWallpaperGrid);
  }
}

// -------------------------------
// CATEGORY FILTER
document.querySelectorAll('.category-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    const category = e.currentTarget.getAttribute('href').split('/')[1];

    const filtered = mockWallpapers.filter(wp =>
      wp.alt.toLowerCase().includes(category)
    );

    renderWallpapers(filtered.length ? filtered : mockWallpapers, wallpaperGrid);

    document.getElementById('wallpaper-section')
      .scrollIntoView({ behavior: 'smooth' });
  });
});

// -------------------------------
// INIT
window.addEventListener('load', () => {
  loadMainWallpapers();
  loadLatestWallpapers();
});
