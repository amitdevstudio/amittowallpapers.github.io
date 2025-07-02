document.addEventListener('DOMContentLoaded', () => {
    const likeButtons = document.querySelectorAll('#latest .likeBtn');

    likeButtons.forEach(btn => {
        const card = btn.closest('.wallpaper-card');
        const img = card.querySelector('img');
        const icon = btn.querySelector('.likeIcon');
        const countSpan = btn.querySelector('.likeCount');

        const imgUrl = img.getAttribute('src');
        const storageKey = `likes_${imgUrl}`;

        // If no like count yet, set random initial
        let likes = parseInt(localStorage.getItem(storageKey), 10);
        if (isNaN(likes) || likes < 20000) {
            likes = Math.floor(Math.random() * 20000) + 20000;
            localStorage.setItem(storageKey, likes);
        }
        countSpan.innerText = formatNumber(likes);

        let userLiked = false;

        btn.addEventListener('click', () => {
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
});

function formatNumber(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
}
