/**
 * GiphyPanel.jsx - GIPHY GIF Integration
 * 
 * Features:
 * - Search for GIFs
 * - Display trending GIFs
 * - Add GIFs to Sticker track
 * - Lazy loading with infinite scroll
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Icon from './Icon';

// GIPHY API Configuration
// Using the public beta key for demo purposes
// For production, use your own API key from https://developers.giphy.com/
const GIPHY_API_KEY = 'dc6zaTOxFJmzC'; // Public beta key
const GIPHY_API_BASE = 'https://api.giphy.com/v1';

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

// Main GIPHY Panel Component
export default function GiphyPanel({ onAddSticker }) {
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
  
  // Fetch trending GIFs on mount
  useEffect(() => {
    fetchTrendingGifs();
  }, []);
  
  // Search when debounced query changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      setActiveTab('search');
      setOffset(0);
      setGifs([]);
      searchGifs(debouncedSearch, 0);
    } else {
      setActiveTab('trending');
      setGifs([]);
    }
  }, [debouncedSearch]);
  
  const fetchTrendingGifs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${GIPHY_API_BASE}/gifs/trending?api_key=${GIPHY_API_KEY}&limit=25&rating=pg`
      );
      
      if (!response.ok) throw new Error('Failed to fetch trending GIFs');
      
      const data = await response.json();
      setTrendingGifs(data.data || []);
    } catch (err) {
      console.error('GIPHY trending error:', err);
      setError('Fehler beim Laden der Trending GIFs');
    } finally {
      setLoading(false);
    }
  };
  
  const searchGifs = async (query, currentOffset = 0) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${GIPHY_API_BASE}/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=25&offset=${currentOffset}&rating=pg`
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
  
  const displayGifs = activeTab === 'trending' ? trendingGifs : gifs;
  
  return (
    <div className="h-full flex flex-col">
      {/* Header with GIPHY branding */}
      <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-2">
          <img 
            src="https://giphy.com/static/img/giphy-logo-square-180.png" 
            alt="GIPHY" 
            className="w-5 h-5 rounded"
          />
          <span className="text-sm font-medium text-[var(--text-primary)]">GIPHY</span>
          <span className="text-[9px] text-[var(--text-tertiary)] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded">Powered by GIPHY</span>
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
              {searchQuery ? 'Keine GIFs gefunden' : 'Suche nach GIFs oder wähle aus Trending'}
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
