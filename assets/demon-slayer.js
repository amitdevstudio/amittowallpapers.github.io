/**
 * Sorting utilities for wallpaper displays
 * Integrates with wallpaperStorage to provide real-time sorting
 */

class WallpaperSortHelper {
  constructor() {
    this.currentSort = 'random'; // random, likes, views, name, date
    this.currentOrder = 'desc';
  }

  /**
   * Sort wallpapers array based on current sort preference
   */
  sort(wallpapers) {
    if (!wallpapers) return [];
    
    const sorted = [...wallpapers];

    switch (this.currentSort) {
      case 'likes':
        sorted.sort((a, b) => {
          const likesA = window.wallpaperStorage.getWallpaper(a.character).likes;
          const likesB = window.wallpaperStorage.getWallpaper(b.character).likes;
          return this.currentOrder === 'desc' ? likesB - likesA : likesA - likesB;
        });
        break;

      case 'views':
        sorted.sort((a, b) => {
          const viewsA = window.wallpaperStorage.getWallpaper(a.character).views;
          const viewsB = window.wallpaperStorage.getWallpaper(b.character).views;
          return this.currentOrder === 'desc' ? viewsB - viewsA : viewsA - viewsB;
        });
        break;

      case 'name':
        sorted.sort((a, b) => {
          const nameA = (a.character || '').toLowerCase();
          const nameB = (b.character || '').toLowerCase();
          if (this.currentOrder === 'desc') {
            return nameB.localeCompare(nameA);
          } else {
            return nameA.localeCompare(nameB);
          }
        });
        break;

      case 'date':
        sorted.sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return this.currentOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        break;

      case 'random':
      default:
        // Shuffle array
        for (let i = sorted.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
        }
        break;
    }

    return sorted;
  }

  /**
   * Create sort UI buttons
   */
  createSortButtons(container) {
    container.innerHTML = `
      <div class="sort-controls flex gap-2 mb-4 flex-wrap">
        <button class="sort-btn sort-random bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white text-sm" data-sort="random">
          <i class="fa-solid fa-shuffle mr-1"></i>Random
        </button>
        <button class="sort-btn sort-likes bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm" data-sort="likes">
          <i class="fa-solid fa-thumbs-up mr-1"></i>Most Liked
        </button>
        <button class="sort-btn sort-views bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm" data-sort="views">
          <i class="fa-solid fa-eye mr-1"></i>Most Viewed
        </button>
        <button class="sort-btn sort-name bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white text-sm" data-sort="name">
          <i class="fa-solid fa-font mr-1"></i>A-Z
        </button>
        <button class="sort-btn sort-date bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm" data-sort="date">
          <i class="fa-solid fa-calendar mr-1"></i>Newest
        </button>
      </div>
    `;

    // Add click handlers
    const buttons = container.querySelectorAll('.sort-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sortType = e.currentTarget.dataset.sort;
        this.setSort(sortType);
        this.updateActiveButton(buttons, sortType);
        // Dispatch custom event for parent to handle re-render
        window.dispatchEvent(new CustomEvent('wallpaper-sort-changed', { detail: { sort: this.currentSort } }));
      });
    });

    // Mark first button as active
    this.updateActiveButton(buttons, this.currentSort);
  }

  /**
   * Update active button styling
   */
  updateActiveButton(buttons, activeSort) {
    buttons.forEach(btn => {
      if (btn.dataset.sort === activeSort) {
        btn.classList.add('ring-2', 'ring-white');
      } else {
        btn.classList.remove('ring-2', 'ring-white');
      }
    });
  }

  /**
   * Set sort type
   */
  setSort(sortType) {
    this.currentSort = sortType;
  }

  /**
   * Toggle sort order
   */
  toggleOrder() {
    this.currentOrder = this.currentOrder === 'desc' ? 'asc' : 'desc';
  }

  /**
   * Get current sort info as text
   */
  getSortLabel() {
    const sortLabels = {
      'random': 'Random Order',
      'likes': 'Most Liked',
      'views': 'Most Viewed',
      'name': 'A-Z',
      'date': 'Newest First'
    };
    return sortLabels[this.currentSort] || 'Random';
  }
}

// Export and create global instance
window.wallpaperSortHelper = new WallpaperSortHelper();
