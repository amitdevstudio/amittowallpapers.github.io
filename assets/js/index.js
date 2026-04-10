// --- UI TOGGLE LOGIC (From your provided snippet) ---

const toggleOpen = document.getElementById("toggleOpen");
const toggleClose = document.getElementById("toggleClose");
const collapseMenu = document.getElementById("collapseMenu");
const menuOverlay = document.getElementById("menuOverlay");

// Get the main grid container
const wallpaperGrid = document.getElementById('wallpaperGrid');
const latestWallpaperGrid = document.getElementById('latestwallpaperGrid');

function openMenu() {
    collapseMenu.classList.remove("max-lg:hidden");
    menuOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // lock scroll
}

function closeMenu() {
    collapseMenu.classList.add("max-lg:hidden");
    menuOverlay.classList.add("hidden");
    document.body.style.overflow = ""; // unlock scroll
}

if (toggleOpen && toggleClose && collapseMenu && menuOverlay) {
    toggleOpen.addEventListener("click", openMenu);
    toggleClose.addEventListener("click", closeMenu);
    menuOverlay.addEventListener("click", closeMenu);

    // Close menu when a link is clicked
    document.querySelectorAll("#collapseMenu a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });
}


// --- CATEGORY SHOW / LESS BUTTON LOGIC (From your provided snippet) ---

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


// --- BACK TO TOP BUTTON LOGIC (From your provided snippet) ---

const backToTopButton = document.getElementById('back-to-top');

if (backToTopButton) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { // Show button after scrolling down 300px
            backToTopButton.classList.remove('hidden');
        } else {
            backToTopButton.classList.add('hidden');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// --- CORE RENDERING LOGIC (Moved and completed from HTML) ---

/**
 * Creates the HTML string for a single wallpaper card for the Masonry Grid.
 * @param {string} src - The image source URL.
 * @param {string} alt - The alt text/title for the image.
 * @returns {string} The HTML string for the card.
 */
function createWallpaperCard(src, alt) {
    return `
        <div class="mb-4 break-inside-avoid">
            <div class="relative overflow-hidden rounded-xl shadow-lg group">
                <img src="${src}" alt="${alt}" loading="lazy" class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]" onerror="this.onerror=null;this.src='https://placehold.co/600x400/1e293b/cbd5e1?text=Image+Error';">
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 class="text-white text-base font-medium">${alt}</h3>
                    <div class="flex space-x-2 mt-2">
                        <button onclick="downloadImage('${src}')" aria-label="Download ${alt}" class="text-white bg-yellow-600/90 hover:bg-yellow-500 text-xs px-3 py-1 rounded-full shadow-md transition-all duration-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v7a1 1 0 11-2 0V3a1 1 0 011-1z" clip-rule="evenodd" />
                            </svg>
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders a list of wallpaper objects into a specified grid container.
 * @param {Array<{src: string, alt: string}>} list - Array of wallpaper objects.
 * @param {HTMLElement} container - The DOM element to render into (e.g., wallpaperGrid).
 */
function renderWallpapers(list, container) {
    container.innerHTML = '';

    if (!list || !list.length) {
        container.innerHTML = `
            <div class="col-span-full flex flex-col justify-center w-full items-center h-48 text-center mx-auto space-y-2 p-4 bg-gray-800/50 rounded-lg">
                <p class="text-white text-lg font-semibold">
                    No wallpapers found.<br>
                    <a href="#contact" class="text-yellow-500 font-semibold hover:underline">
                        Request your wallpaper!
                    </a>
                </p>
            </div>
        `;
        return;
    }

    list.forEach(wallpaper => {
        container.innerHTML += createWallpaperCard(wallpaper.src, wallpaper.alt);
    });
}

// Simple dummy download function (since alerts are forbidden)
window.downloadImage = function(src) {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');

    messageText.textContent = `Starting download for: ${src.split('/').pop()}... (In a real app, this would initiate the file transfer)`;
    messageBox.classList.remove('opacity-0', 'hidden');
    messageBox.classList.add('opacity-100');

    setTimeout(() => {
        messageBox.classList.remove('opacity-100');
        messageBox.classList.add('opacity-0', 'hidden');
    }, 3000);
};

// --- DATA FETCHING & INITIALIZATION LOGIC ---

// Mock Data Structure
const mockWallpapers = [
    { src: 'assets/images/wallpapers/goku-blue.jpg', alt: 'Goku Super Saiyan Blue Minimalist' },
    { src: 'assets/images/wallpapers/luffy-one-piece.jpg', alt: 'Luffy Gear 5 Full Power' },
    { src: 'assets/images/wallpapers/tanjiro-demon-slayer.jpg', alt: 'Tanjiro Water Breathing Form' },
    { src: 'assets/images/wallpapers/levi-attack-titan.jpg', alt: 'Levi Ackerman Cool Pose' },
    { src: 'assets/images/wallpapers/hero-images/heroimg.png', alt: 'Assortment of Anime Heroes' },
    { src: 'assets/images/wallpapers/goku-blue.jpg', alt: 'Goku Super Saiyan Blue Minimalist' },
    { src: 'assets/images/wallpapers/luffy-one-piece.jpg', alt: 'Luffy Gear 5 Full Power' },
    { src: 'assets/images/wallpapers/tanjiro-demon-slayer.jpg', alt: 'Tanjiro Water Breathing Form' },
    { src: 'assets/images/wallpapers/levi-attack-titan.jpg', alt: 'Levi Ackerman Cool Pose' },
    { src: 'assets/images/wallpapers/hero-images/heroimg.png', alt: 'Assortment of Anime Heroes' },
];

// 1. Initial Load for Main Grid
function loadMainWallpapers() {
    // In a real application, you would make an API call here:
    // fetch('/api/wallpapers?limit=20')
    // .then(res => res.json())
    // .then(data => renderWallpapers(data, wallpaperGrid))
    // .catch(error => console.error('Error fetching main wallpapers:', error));

    // Using mock data for immediate visibility:
    if (wallpaperGrid) {
        console.log('Rendering 10 wallpapers to the main grid...');
        renderWallpapers(mockWallpapers, wallpaperGrid);
    } else {
        console.warn('wallpaperGrid container not found');
    }
}

// 2. Initial Load for Latest Grid
function loadLatestWallpapers() {
    // Mock data for the smaller "Latest Wallpapers" section
    const latest = mockWallpapers.slice(0, 3).map(wp => ({
        ...wp,
        // Use a different placeholder image structure for the 3-column layout
        src: wp.src.replace('600x400', '800x600')
    }));

    if (latestWallpaperGrid) {
        renderWallpapers(latest, latestWallpaperGrid);
    } else {
        console.warn('latestWallpaperGrid container not found');
    }
}

// Attach listeners to Category Links for Filtering (Replaces search.js functionality)
document.querySelectorAll('.category-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.currentTarget.getAttribute('href').split('/')[1];
        console.log(`Filtering wallpapers by category: ${category}`);

        // Mock filtering - In a real app, you'd fetch /api/wallpapers?category=action
        const filteredList = mockWallpapers.filter(wp => wp.alt.toLowerCase().includes(category));

        // Use the same mock list if no filter matched to keep the grid populated
        const listToRender = filteredList.length > 0 ? filteredList : mockWallpapers.slice(0, 5);
        renderWallpapers(listToRender, wallpaperGrid);

        // Scroll to the grid section to show the results
        document.getElementById('wallpaper-section').scrollIntoView({ behavior: 'smooth' });
    });
});


// Run Initialization when the page is fully loaded
window.addEventListener('load', () => {
    loadMainWallpapers();
    loadLatestWallpapers();
    console.log('UI and initial content rendering complete.');
});