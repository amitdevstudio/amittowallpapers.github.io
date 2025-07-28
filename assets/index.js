const toggleOpen = document.getElementById("toggleOpen");
const toggleClose = document.getElementById("toggleClose");
const collapseMenu = document.getElementById("collapseMenu");
const menuOverlay = document.getElementById("menuOverlay");

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

toggleOpen.addEventListener("click", openMenu);
toggleClose.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

// Close menu when a link is clicked
document.querySelectorAll("#collapseMenu a").forEach(link => {
    link.addEventListener("click", closeMenu);
});

// Category Section Show / Less button
const showMoreBtn = document.getElementById("showMoreCategories");
const showLessBtn = document.getElementById("showLessCategories");
const moreCategories = document.querySelectorAll(".more-category");

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

// Back to Top Button Logic
const backToTopButton = document.getElementById('back-to-top');

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