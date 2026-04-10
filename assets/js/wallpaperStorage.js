/**
 * Centralized Wallpaper Storage Manager
 * Handles all likes, views, and user preferences in a single location
 * Provides sorting and sync capabilities
 */

class WallpaperStorageManager {
  constructor() {
    this.storageKey = 'wallpaperData';
    // Clear old storage format on first initialization
    this.clearOldStorageFormat();
    this.data = this.loadData();
  }

  /**
   * Clear old storage format (likes_, views_, liked_ keys)
   */
  clearOldStorageFormat() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('likes_') || key.startsWith('views_') || key.startsWith('liked_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Load data from localStorage or initialize new structure
   */
  loadData() {
    const stored = localStorage.getItem(this.storageKey);

    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.wallpapers && Array.isArray(data.wallpapers)) {
          return data;
        }
      } catch (e) {
        console.error('Failed to parse wallpaper storage:', e);
      }
    }

    // Start fresh with empty wallpapers
    const data = { wallpapers: [] };
    this.saveData(data);
    return data;
  }

  /**
   * Save data to localStorage
   */
  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save wallpaper storage:', e);
    }
  }

  /**
   * Get or create wallpaper entry
   * @param {string} uniqueId - URL or unique identifier for the wallpaper
   * @param {string} character - Character name for display
   */
  getWallpaper(uniqueId, character) {
    // Use uniqueId (URL) as the true key for storage
    const id = String(uniqueId || character || 'Unknown').trim();
    const charName = String(character || 'Unknown').trim();
    
    let wallpaper = this.data.wallpapers.find(w => w.id === id);

    if (!wallpaper) {
      const today = new Date().toISOString().split('T')[0];
      // Generate completely random and independent values for each unique wallpaper
      const likes = this.randomRange(1500, 8500);
      let views = this.randomRange(5000, 10000);
      
      // Ensure views > likes
      if (views <= likes) {
        views = likes + this.randomRange(1000, 5000);
      }
      
      wallpaper = {
        id,  // Unique URL or identifier
        character: charName,
        likes,
        views,
        userLiked: false,
        dateAdded: today,
        lastUpdated: today
      };
      this.data.wallpapers.push(wallpaper);
      this.saveData(this.data);
    }

    return wallpaper;
  }

  /**
   * Update likes for a wallpaper
   */
  updateLikes(uniqueId, increment = 1) {
    const wallpaper = this.getWallpaper(uniqueId);
    wallpaper.likes += increment;
    wallpaper.lastUpdated = new Date().toISOString().split('T')[0];
    this.saveData(this.data);
    return wallpaper.likes;
  }

  /**
   * Update views for a wallpaper
   */
  updateViews(uniqueId) {
    const wallpaper = this.getWallpaper(uniqueId);
    wallpaper.views++;
    wallpaper.lastUpdated = new Date().toISOString().split('T')[0];
    this.saveData(this.data);
    return wallpaper.views;
  }

  /**
   * Set user liked status
   */
  setUserLiked(uniqueId, liked) {
    const wallpaper = this.getWallpaper(uniqueId);
    wallpaper.userLiked = liked;
    wallpaper.lastUpdated = new Date().toISOString().split('T')[0];
    this.saveData(this.data);
  }

  /**
   * Get user liked status
   */
  getUserLiked(uniqueId) {
    const wallpaper = this.getWallpaper(uniqueId);
    return wallpaper.userLiked;
  }

  /**
   * Get all wallpapers as sorted array
   */
  getAllWallpapers(sortBy = 'likes', order = 'desc') {
    const wallpapers = [...this.data.wallpapers];

    wallpapers.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'likes':
          aValue = a.likes;
          bValue = b.likes;
          break;
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'name':
        case 'character':
          aValue = a.character.toLowerCase();
          bValue = b.character.toLowerCase();
          break;
        case 'date':
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated);
          bValue = new Date(b.lastUpdated);
          break;
        default:
          aValue = a.likes;
          bValue = b.likes;
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return wallpapers;
  }

  /**
   * Get wallpapers sorted by likes (descending)
   */
  getTopByLikes(limit = null) {
    const sorted = this.getAllWallpapers('likes', 'desc');
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get wallpapers sorted by views (descending)
   */
  getTopByViews(limit = null) {
    const sorted = this.getAllWallpapers('views', 'desc');
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get recently updated wallpapers
   */
  getLatest(limit = null) {
    const sorted = this.getAllWallpapers('lastUpdated', 'desc');
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get wallpapers by character name (partial match)
   */
  searchByCharacter(query) {
    const lowerQuery = query.toLowerCase();
    return this.data.wallpapers.filter(w =>
      (w.character && w.character.toLowerCase().includes(lowerQuery)) ||
      (w.id && w.id.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get statistics
   */
  getStats() {
    const total = this.data.wallpapers.length;
    const totalLikes = this.data.wallpapers.reduce((sum, w) => sum + w.likes, 0);
    const totalViews = this.data.wallpapers.reduce((sum, w) => sum + w.views, 0);
    const averageLikes = total > 0 ? Math.round(totalLikes / total) : 0;
    const averageViews = total > 0 ? Math.round(totalViews / total) : 0;

    return {
      total,
      totalLikes,
      totalViews,
      averageLikes,
      averageViews
    };
  }

  /**
   * Clear all data (use with caution)
   */
  clearAll() {
    this.data = { wallpapers: [] };
    localStorage.removeItem(this.storageKey);
    // Also clear old storage format
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('likes_') || key.startsWith('views_') || key.startsWith('liked_')) {
        localStorage.removeItem(key);
      }
    });
    this.saveData(this.data);
  }

  /**
   * Regenerate all likes/views with new random values
   * Keeps character data but resets likes/views
   */
  regenerateValues() {
    const today = new Date().toISOString().split('T')[0];
    this.data.wallpapers.forEach(wp => {
      wp.likes = this.randomRange(1000, 5000);
      wp.views = this.randomRange(wp.likes + 1000, 8000);
      wp.lastUpdated = today;
    });
    this.saveData(this.data);
  }

  /**
   * Generate random number within range
   */
  randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WallpaperStorageManager;
}

// Global instance
window.wallpaperStorage = new WallpaperStorageManager();

