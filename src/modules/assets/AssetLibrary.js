/**
 * Assets Module - Asset Library & Management
 * Media Browser, Templates, Stock Assets, Fonts
 */

import { v4 as uuidv4 } from 'uuid';

// === ASSET CATEGORIES ===
export const ASSET_CATEGORIES = {
  media: [
    { id: 'video', name: 'Videos', icon: 'video', extensions: ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'] },
    { id: 'audio', name: 'Audio', icon: 'audio', extensions: ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a'] },
    { id: 'image', name: 'Bilder', icon: 'image', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'] }
  ],
  templates: [
    { id: 'intro', name: 'Intros', icon: 'play' },
    { id: 'outro', name: 'Outros', icon: 'stop' },
    { id: 'lower-third', name: 'Lower Thirds', icon: 'text' },
    { id: 'title', name: 'Titel', icon: 'text' },
    { id: 'transition', name: 'Übergänge', icon: 'transitions' },
    { id: 'social', name: 'Social Media', icon: 'share' },
    { id: 'lyric', name: 'Lyrics', icon: 'audio' },
    { id: 'slideshow', name: 'Slideshows', icon: 'image' },
    { id: 'promo', name: 'Promo', icon: 'star' }
  ],
  stock: [
    { id: 'stock-video', name: 'Stock Videos', icon: 'video', premium: true },
    { id: 'stock-image', name: 'Stock Bilder', icon: 'image', premium: true },
    { id: 'stock-music', name: 'Musik', icon: 'audio', premium: false },
    { id: 'stock-sfx', name: 'Sound Effects', icon: 'audio', premium: false }
  ],
  elements: [
    { id: 'sticker', name: 'Sticker', icon: 'sticker' },
    { id: 'emoji', name: 'Emojis', icon: 'emoji' },
    { id: 'shape', name: 'Formen', icon: 'shape' },
    { id: 'overlay', name: 'Overlays', icon: 'layers' },
    { id: 'frame', name: 'Rahmen', icon: 'frame' },
    { id: 'particle', name: 'Partikel', icon: 'effects' },
    { id: 'light-leak', name: 'Lichteffekte', icon: 'light' }
  ],
  text: [
    { id: 'font', name: 'Schriftarten', icon: 'text' },
    { id: 'text-style', name: 'Textstile', icon: 'style' },
    { id: 'text-animation', name: 'Textanimationen', icon: 'animation' },
    { id: 'caption-style', name: 'Untertitelstile', icon: 'captions' }
  ]
};

// === BUILT-IN FONTS ===
export const BUILT_IN_FONTS = [
  { id: 'inter', name: 'Inter', family: 'Inter', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: 'roboto', name: 'Roboto', family: 'Roboto', weights: [100, 300, 400, 500, 700, 900] },
  { id: 'open-sans', name: 'Open Sans', family: 'Open Sans', weights: [300, 400, 500, 600, 700, 800] },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: 'poppins', name: 'Poppins', family: 'Poppins', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: 'lato', name: 'Lato', family: 'Lato', weights: [100, 300, 400, 700, 900] },
  { id: 'oswald', name: 'Oswald', family: 'Oswald', weights: [200, 300, 400, 500, 600, 700] },
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display', weights: [400, 500, 600, 700, 800, 900] },
  { id: 'bebas', name: 'Bebas Neue', family: 'Bebas Neue', weights: [400] },
  { id: 'anton', name: 'Anton', family: 'Anton', weights: [400] },
  { id: 'raleway', name: 'Raleway', family: 'Raleway', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather', weights: [300, 400, 700, 900] },
  { id: 'source-sans', name: 'Source Sans Pro', family: 'Source Sans Pro', weights: [200, 300, 400, 600, 700, 900] },
  { id: 'nunito', name: 'Nunito', family: 'Nunito', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { id: 'quicksand', name: 'Quicksand', family: 'Quicksand', weights: [300, 400, 500, 600, 700] }
];

// === TEMPLATE STRUCTURE ===
export function createTemplate(type, data = {}) {
  return {
    id: uuidv4(),
    type,
    name: data.name || 'Untitled Template',
    description: data.description || '',
    thumbnail: data.thumbnail || null,
    preview: data.preview || null,
    duration: data.duration || 5,
    
    // Template properties
    resolution: data.resolution || { width: 1920, height: 1080 },
    aspectRatio: data.aspectRatio || '16:9',
    
    // Editable parameters
    parameters: data.parameters || [],
    
    // Layers/Tracks
    layers: data.layers || [],
    
    // Tags & metadata
    tags: data.tags || [],
    category: data.category || 'general',
    premium: data.premium || false,
    
    // Usage
    downloads: 0,
    rating: 0,
    
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// === TEMPLATE PARAMETERS ===
export const TEMPLATE_PARAMETER_TYPES = [
  { id: 'text', name: 'Text', icon: 'text' },
  { id: 'image', name: 'Bild', icon: 'image' },
  { id: 'video', name: 'Video', icon: 'video' },
  { id: 'color', name: 'Farbe', icon: 'palette' },
  { id: 'font', name: 'Schriftart', icon: 'text' },
  { id: 'number', name: 'Zahl', icon: 'number' },
  { id: 'logo', name: 'Logo', icon: 'image' },
  { id: 'audio', name: 'Audio', icon: 'audio' }
];

// === STICKER CATEGORIES ===
export const STICKER_CATEGORIES = [
  { id: 'emoji', name: 'Emojis', icon: 'emoji' },
  { id: 'social', name: 'Social Media', icon: 'share' },
  { id: 'text', name: 'Text', icon: 'text' },
  { id: 'arrow', name: 'Pfeile', icon: 'arrow' },
  { id: 'shape', name: 'Formen', icon: 'shape' },
  { id: 'celebration', name: 'Feier', icon: 'party' },
  { id: 'love', name: 'Liebe', icon: 'heart' },
  { id: 'weather', name: 'Wetter', icon: 'weather' },
  { id: 'food', name: 'Essen', icon: 'food' },
  { id: 'gaming', name: 'Gaming', icon: 'game' },
  { id: 'business', name: 'Business', icon: 'briefcase' },
  { id: 'education', name: 'Bildung', icon: 'book' },
  { id: 'animated', name: 'Animiert', icon: 'animation' }
];

// === MUSIC LIBRARY CATEGORIES ===
export const MUSIC_CATEGORIES = [
  { id: 'trending', name: 'Trending', icon: 'trending' },
  { id: 'popular', name: 'Beliebt', icon: 'star' },
  { id: 'cinematic', name: 'Cinematic', icon: 'film' },
  { id: 'corporate', name: 'Corporate', icon: 'briefcase' },
  { id: 'upbeat', name: 'Upbeat', icon: 'happy' },
  { id: 'chill', name: 'Chill', icon: 'relax' },
  { id: 'dramatic', name: 'Dramatisch', icon: 'drama' },
  { id: 'happy', name: 'Fröhlich', icon: 'happy' },
  { id: 'sad', name: 'Traurig', icon: 'sad' },
  { id: 'inspiring', name: 'Inspirierend', icon: 'inspire' },
  { id: 'romantic', name: 'Romantisch', icon: 'heart' },
  { id: 'action', name: 'Action', icon: 'action' },
  { id: 'horror', name: 'Horror', icon: 'horror' },
  { id: 'comedy', name: 'Comedy', icon: 'comedy' }
];

// === SOUND EFFECTS CATEGORIES ===
export const SFX_CATEGORIES = [
  { id: 'whoosh', name: 'Whoosh', icon: 'wind' },
  { id: 'impact', name: 'Impact', icon: 'impact' },
  { id: 'transition', name: 'Übergang', icon: 'transition' },
  { id: 'notification', name: 'Notification', icon: 'bell' },
  { id: 'ui', name: 'UI Sounds', icon: 'ui' },
  { id: 'nature', name: 'Natur', icon: 'nature' },
  { id: 'ambient', name: 'Ambient', icon: 'ambient' },
  { id: 'foley', name: 'Foley', icon: 'foley' },
  { id: 'voice', name: 'Stimme', icon: 'voice' },
  { id: 'animal', name: 'Tiere', icon: 'animal' },
  { id: 'cartoon', name: 'Cartoon', icon: 'cartoon' },
  { id: 'game', name: 'Game', icon: 'game' }
];

// === ASSET MANAGER ===
export class AssetManager {
  constructor() {
    this.assets = new Map();
    this.favorites = new Set();
    this.recentlyUsed = [];
    this.maxRecent = 50;
  }
  
  addAsset(asset) {
    this.assets.set(asset.id, {
      ...asset,
      addedAt: Date.now()
    });
    return asset.id;
  }
  
  removeAsset(assetId) {
    this.assets.delete(assetId);
    this.favorites.delete(assetId);
    this.recentlyUsed = this.recentlyUsed.filter(id => id !== assetId);
  }
  
  getAsset(assetId) {
    return this.assets.get(assetId);
  }
  
  getAllAssets() {
    return Array.from(this.assets.values());
  }
  
  getAssetsByType(type) {
    return this.getAllAssets().filter(a => a.type === type);
  }
  
  searchAssets(query, options = {}) {
    const normalizedQuery = query.toLowerCase();
    
    return this.getAllAssets().filter(asset => {
      // Name match
      if (asset.name.toLowerCase().includes(normalizedQuery)) return true;
      
      // Tag match
      if (asset.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))) return true;
      
      // Type filter
      if (options.type && asset.type !== options.type) return false;
      
      // Category filter
      if (options.category && asset.category !== options.category) return false;
      
      return false;
    });
  }
  
  toggleFavorite(assetId) {
    if (this.favorites.has(assetId)) {
      this.favorites.delete(assetId);
    } else {
      this.favorites.add(assetId);
    }
  }
  
  isFavorite(assetId) {
    return this.favorites.has(assetId);
  }
  
  getFavorites() {
    return Array.from(this.favorites).map(id => this.getAsset(id)).filter(Boolean);
  }
  
  markAsUsed(assetId) {
    // Remove if already in list
    this.recentlyUsed = this.recentlyUsed.filter(id => id !== assetId);
    
    // Add to front
    this.recentlyUsed.unshift(assetId);
    
    // Trim to max
    if (this.recentlyUsed.length > this.maxRecent) {
      this.recentlyUsed = this.recentlyUsed.slice(0, this.maxRecent);
    }
    
    // Update asset
    const asset = this.getAsset(assetId);
    if (asset) {
      asset.usageCount = (asset.usageCount || 0) + 1;
      asset.lastUsed = Date.now();
    }
  }
  
  getRecentlyUsed() {
    return this.recentlyUsed.map(id => this.getAsset(id)).filter(Boolean);
  }
  
  importAsset(file) {
    return new Promise((resolve, reject) => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      
      // Determine type
      let type = 'unknown';
      for (const category of ASSET_CATEGORIES.media) {
        if (category.extensions.includes(extension)) {
          type = category.id;
          break;
        }
      }
      
      const asset = {
        id: uuidv4(),
        name: file.name,
        type,
        size: file.size,
        mimeType: file.type,
        extension,
        file,
        path: URL.createObjectURL(file),
        status: 'ready',
        tags: [],
        favorite: false,
        usageCount: 0
      };
      
      // For media files, get additional info
      if (type === 'video' || type === 'audio') {
        const mediaElement = document.createElement(type);
        mediaElement.src = asset.path;
        mediaElement.onloadedmetadata = () => {
          asset.duration = mediaElement.duration;
          if (type === 'video') {
            asset.width = mediaElement.videoWidth;
            asset.height = mediaElement.videoHeight;
          }
          this.addAsset(asset);
          resolve(asset);
        };
        mediaElement.onerror = reject;
      } else if (type === 'image') {
        const img = new Image();
        img.src = asset.path;
        img.onload = () => {
          asset.width = img.naturalWidth;
          asset.height = img.naturalHeight;
          this.addAsset(asset);
          resolve(asset);
        };
        img.onerror = reject;
      } else {
        this.addAsset(asset);
        resolve(asset);
      }
    });
  }
  
  async importMultiple(files) {
    const results = [];
    for (const file of files) {
      try {
        const asset = await this.importAsset(file);
        results.push({ success: true, asset });
      } catch (error) {
        results.push({ success: false, file, error });
      }
    }
    return results;
  }
  
  getStorageUsed() {
    return this.getAllAssets().reduce((total, asset) => total + (asset.size || 0), 0);
  }
  
  exportManifest() {
    return {
      assets: this.getAllAssets(),
      favorites: Array.from(this.favorites),
      recentlyUsed: this.recentlyUsed,
      exportedAt: Date.now()
    };
  }
  
  importManifest(manifest) {
    manifest.assets.forEach(asset => this.addAsset(asset));
    manifest.favorites.forEach(id => this.favorites.add(id));
    this.recentlyUsed = manifest.recentlyUsed;
  }
}

// Singleton
export const assetManager = new AssetManager();

export default {
  ASSET_CATEGORIES,
  BUILT_IN_FONTS,
  TEMPLATE_PARAMETER_TYPES,
  STICKER_CATEGORIES,
  MUSIC_CATEGORIES,
  SFX_CATEGORIES,
  createTemplate,
  AssetManager,
  assetManager
};
