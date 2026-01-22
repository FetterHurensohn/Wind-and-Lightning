/**
 * GiphyPanel.jsx - GIPHY GIF Integration
 * 
 * Features:
 * - Search for GIFs
 * - Display trending GIFs
 * - Add GIFs to Sticker track
 * - Lazy loading with infinite scroll
 * - User can provide their own GIPHY API key
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Icon from './Icon';

// GIPHY API Configuration
const GIPHY_API_BASE = 'https://api.giphy.com/v1';

// Local storage key for persisting the API key
const GIPHY_KEY_STORAGE = 'giphy_api_key';

// Debounce hook for search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};

// GIF Tile Component
const GifTile = ({ gif, onSelect, isLoading }) => {
  const [loaded, setLoaded] = useState(false);
  
  // Use fixed_width_small for grid display (smaller file size)
  const previewUrl = gif.images?.fixed_width_small?.url || gif.images?.fixed_width?.url;
  const fullUrl = gif.images?.fixed_height?.url || gif.images?.original?.url;
  
  return (
    <div 
      className="relative aspect-square bg-[var(--bg-surface)] rounded-lg overflow-hidden cursor-pointer group"
      onClick={() => onSelect(gif)}
    >
      {/* Loading skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-[var(--bg-surface)] animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--text-tertiary)]/30 border-t-[var(--accent-turquoise)] rounded-full animate-spin" />
        </div>
      )}
      
      {/* GIF Preview */}
      <img
        src={previewUrl}
        alt={gif.title || 'GIF'}
        className={`w-full h-full object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
      
      {/* Hover overlay with add button */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button className="w-10 h-10 bg-[var(--accent-turquoise)] rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
          <Icon name="plus" size={20} className="text-white" />
        </button>
      </div>
      
      {/* GIPHY Attribution */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
        <span className="text-[8px] text-white/70 truncate block">{gif.title || 'GIF'}</span>
      </div>
    </div>
  );
};

// API Key Setup Component
const ApiKeySetup = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  
  const testAndSaveKey = async () => {
    if (!apiKey.trim()) return;
    
    setTesting(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${GIPHY_API_BASE}/gifs/trending?api_key=${apiKey.trim()}&limit=1&rating=pg`
      );
      const data = await response.json();
      
      if (data.meta?.status === 200 || (data.data && Array.isArray(data.data))) {
        // Save to localStorage
        localStorage.setItem(GIPHY_KEY_STORAGE, apiKey.trim());
        onApiKeySet(apiKey.trim());
      } else {
        setError(data.meta?.msg || 'Ungültiger API Key');
      }
    } catch (err) {
      setError('Verbindungsfehler. Bitte erneut versuchen.');
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 bg-[var(--bg-surface)] rounded-xl flex items-center justify-center">
          <span className="text-3xl">🎬</span>
        </div>
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">GIPHY API Key benötigt</h3>
        <p className="text-[10px] text-[var(--text-tertiary)]">
          Um GIFs von GIPHY zu laden, benötigst du einen kostenlosen API Key.
        </p>
      </div>
      
      <div className="space-y-2">
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Dein GIPHY API Key"
          className="w-full h-9 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-turquoise)] focus:outline-none"
        />
        
        {error && (
          <p className="text-[10px] text-red-400">{error}</p>
        )}
        
        <button
          onClick={testAndSaveKey}
          disabled={!apiKey.trim() || testing}
          className="w-full h-8 bg-[var(--accent-turquoise)] text-white rounded text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Prüfe...
            </>
          ) : (
            'API Key speichern'
          )}
        </button>
      </div>
      
      <div className="text-center space-y-2">
        <a
          href="https://developers.giphy.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-[var(--accent-turquoise)] hover:underline"
        >
          <Icon name="external" size={10} />
          Kostenlosen Key erstellen
        </a>
        <p className="text-[9px] text-[var(--text-tertiary)]">
          1. Account erstellen → 2. "Create an App" → 3. API Key kopieren
        </p>
      </div>
    </div>
  );
};

// Main GIPHY Panel Component
export default function GiphyPanel({ onAddSticker }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(GIPHY_KEY_STORAGE) || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [trendingGifs, setTrendingGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('trending'); // 'trending' | 'search'
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const containerRef = useRef(null);
  
  // Fetch trending GIFs when API key is set
  useEffect(() => {
    if (apiKey) {
      fetchTrendingGifs();
    }
  }, [apiKey]);
  
  // Search when debounced query changes
  useEffect(() => {
    if (!apiKey) return;
    
    if (debouncedSearch.trim()) {
      setActiveTab('search');
      setOffset(0);
      setGifs([]);
      searchGifs(debouncedSearch, 0);
    } else {
      setActiveTab('trending');
      setGifs([]);
    }
  }, [debouncedSearch, apiKey]);
  
  const fetchTrendingGifs = async () => {
    if (!apiKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${GIPHY_API_BASE}/gifs/trending?api_key=${apiKey}&limit=25&rating=pg`
      );
      
      if (!response.ok) throw new Error('Failed to fetch trending GIFs');
      
      const data = await response.json();
      
      if (data.meta?.status === 403) {
        // API key is invalid
        localStorage.removeItem(GIPHY_KEY_STORAGE);
        setApiKey('');
        return;
      }
      
      setTrendingGifs(data.data || []);
    } catch (err) {
      console.error('GIPHY trending error:', err);
      setError('Fehler beim Laden der Trending GIFs');
    } finally {
      setLoading(false);
    }
  };
  
  const searchGifs = async (query, currentOffset = 0) => {
    if (!query.trim() || !apiKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${GIPHY_API_BASE}/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=25&offset=${currentOffset}&rating=pg`
      );
      
      if (!response.ok) throw new Error('Failed to search GIFs');
      
      const data = await response.json();
      const newGifs = data.data || [];
      
      if (currentOffset === 0) {
        setGifs(newGifs);
      } else {
        setGifs(prev => [...prev, ...newGifs]);
      }
      
      setHasMore(newGifs.length === 25);
      setOffset(currentOffset + 25);
    } catch (err) {
      console.error('GIPHY search error:', err);
      setError('Fehler beim Suchen');
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    
    if (activeTab === 'search' && debouncedSearch.trim()) {
      searchGifs(debouncedSearch, offset);
    }
  }, [loading, hasMore, activeTab, debouncedSearch, offset]);
  
  // Infinite scroll handler
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      loadMore();
    }
  }, [loadMore]);
  
  // Handle GIF selection - add to sticker track
  const handleGifSelect = (gif) => {
    const stickerData = {
      id: `giphy_${gif.id}_${Date.now()}`,
      type: 'sticker',
      title: gif.title || 'GIPHY Sticker',
      thumbnail: gif.images?.fixed_width_small?.url,
      url: gif.images?.fixed_height?.url || gif.images?.original?.url,
      width: parseInt(gif.images?.fixed_height?.width) || 200,
      height: parseInt(gif.images?.fixed_height?.height) || 200,
      isGiphy: true,
      giphyId: gif.id,
      source: 'giphy'
    };
    
    onAddSticker?.(stickerData);
  };
  
  // Handle clearing API key
  const handleClearApiKey = () => {
    localStorage.removeItem(GIPHY_KEY_STORAGE);
    setApiKey('');
    setGifs([]);
    setTrendingGifs([]);
  };
  
  // If no API key, show setup
  if (!apiKey) {
    return <ApiKeySetup onApiKeySet={setApiKey} />;
  }
  
  const displayGifs = activeTab === 'trending' ? trendingGifs : gifs;
  
  return (
    <div className="h-full flex flex-col">
      {/* Header with GIPHY branding */}
      <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img 
              src="https://giphy.com/static/img/giphy-logo-square-180.png" 
              alt="GIPHY" 
              className="w-5 h-5 rounded"
            />
            <span className="text-sm font-medium text-[var(--text-primary)]">GIPHY</span>
          </div>
          <button
            onClick={handleClearApiKey}
            className="text-[9px] text-[var(--text-tertiary)] hover:text-red-400"
            title="API Key ändern"
          >
            <Icon name="settings" size={12} />
          </button>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="GIFs suchen..."
            className="w-full h-8 pl-8 pr-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-turquoise)] focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <Icon name="close" size={12} />
            </button>
          )}
        </div>
      </div>
      
      {/* Tab indicator */}
      <div className="px-3 py-1.5 flex gap-2 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => { setActiveTab('trending'); setSearchQuery(''); }}
          className={`text-[10px] px-2 py-1 rounded transition-colors ${
            activeTab === 'trending' 
              ? 'bg-[var(--accent-turquoise)]/20 text-[var(--accent-turquoise)]' 
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          🔥 Trending
        </button>
        {searchQuery && (
          <button
            className="text-[10px] px-2 py-1 rounded bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]"
          >
            🔍 "{searchQuery}"
          </button>
        )}
      </div>
      
      {/* GIF Grid */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2"
        onScroll={handleScroll}
      >
        {error && (
          <div className="text-center py-8">
            <Icon name="warning" size={24} className="text-red-400 mx-auto mb-2" />
            <p className="text-xs text-[var(--text-tertiary)]">{error}</p>
            <button 
              onClick={fetchTrendingGifs}
              className="mt-2 text-xs text-[var(--accent-turquoise)] hover:underline"
            >
              Erneut versuchen
            </button>
          </div>
        )}
        
        {!error && displayGifs.length === 0 && !loading && (
          <div className="text-center py-8">
            <span className="text-3xl mb-2 block">🎬</span>
            <p className="text-xs text-[var(--text-tertiary)]">
              {searchQuery ? 'Keine GIFs gefunden' : 'Lade Trending GIFs...'}
            </p>
          </div>
        )}
        
        {!error && (
          <div className="grid grid-cols-3 gap-1.5">
            {displayGifs.map((gif) => (
              <GifTile
                key={gif.id}
                gif={gif}
                onSelect={handleGifSelect}
                isLoading={loading}
              />
            ))}
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="py-4 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <div className="w-4 h-4 border-2 border-[var(--text-tertiary)]/30 border-t-[var(--accent-turquoise)] rounded-full animate-spin" />
              Lade GIFs...
            </div>
          </div>
        )}
        
        {/* Load more button (fallback) */}
        {!loading && hasMore && displayGifs.length > 0 && activeTab === 'search' && (
          <button
            onClick={loadMore}
            className="w-full mt-3 py-2 text-xs text-[var(--accent-turquoise)] hover:bg-[var(--bg-hover)] rounded transition-colors"
          >
            Mehr laden...
          </button>
        )}
      </div>
      
      {/* GIPHY Attribution Footer */}
      <div className="px-3 py-1.5 border-t border-[var(--border-subtle)] flex items-center justify-center gap-1">
        <span className="text-[8px] text-[var(--text-tertiary)]">Powered by</span>
        <img 
          src="https://giphy.com/static/img/giphy_logo_square_social.png" 
          alt="GIPHY" 
          className="h-3"
        />
      </div>
    </div>
  );
}
