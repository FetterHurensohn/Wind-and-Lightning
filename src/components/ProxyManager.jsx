/**
 * Proxy Workflow Manager
 * Verwaltung von Proxy-Dateien für große Medien
 */

import React, { useState, useCallback } from 'react';
import Icon from './editor/Icon';

export const PROXY_RESOLUTIONS = [
  { id: '360p', name: '360p', width: 640, height: 360 },
  { id: '480p', name: '480p', width: 854, height: 480 },
  { id: '540p', name: '540p', width: 960, height: 540 },
  { id: '720p', name: '720p', width: 1280, height: 720 }
];

export default function ProxyManager({ assets, onGenerateProxy, onClose }) {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [proxyResolution, setProxyResolution] = useState('360p');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({});
  
  const eligibleAssets = assets?.filter(a => 
    a.type === 'video' && 
    (a.width > 1920 || a.height > 1080)
  ) || [];
  
  const handleToggleAsset = useCallback((assetId) => {
    setSelectedAssets(prev => 
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  }, []);
  
  const handleSelectAll = useCallback(() => {
    if (selectedAssets.length === eligibleAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(eligibleAssets.map(a => a.id));
    }
  }, [selectedAssets, eligibleAssets]);
  
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    
    for (const assetId of selectedAssets) {
      setProgress(prev => ({ ...prev, [assetId]: 0 }));
      
      // Simulate proxy generation
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 200));
        setProgress(prev => ({ ...prev, [assetId]: i }));
      }
      
      onGenerateProxy?.(assetId, proxyResolution);
    }
    
    setGenerating(false);
    setSelectedAssets([]);
    setProgress({});
  }, [selectedAssets, proxyResolution, onGenerateProxy]);
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden w-[500px]">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="video" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Proxy-Verwaltung</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Info */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="info" size={14} className="text-blue-400 mt-0.5" />
            <div className="text-xs text-blue-300">
              Proxy-Dateien ermöglichen flüssigere Bearbeitung großer Videos. 
              Die Original-Dateien werden beim Export verwendet.
            </div>
          </div>
        </div>
        
        {/* Resolution Selection */}
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Proxy-Auflösung</label>
          <div className="flex gap-2">
            {PROXY_RESOLUTIONS.map(res => (
              <button
                key={res.id}
                onClick={() => setProxyResolution(res.id)}
                className={`flex-1 h-9 rounded text-xs font-medium transition-colors ${
                  proxyResolution === res.id
                    ? 'bg-[var(--accent-turquoise)] text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {res.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Asset List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-[var(--text-secondary)]">
              Hochauflösende Videos ({eligibleAssets.length})
            </label>
            <button
              onClick={handleSelectAll}
              className="text-xs text-[var(--accent-turquoise)] hover:underline"
            >
              {selectedAssets.length === eligibleAssets.length ? 'Alle abwählen' : 'Alle auswählen'}
            </button>
          </div>
          
          <div className="max-h-[200px] overflow-y-auto space-y-1">
            {eligibleAssets.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-tertiary)]">
                Keine hochauflösenden Videos gefunden
              </div>
            ) : (
              eligibleAssets.map(asset => (
                <label
                  key={asset.id}
                  className="flex items-center gap-3 p-2 bg-[var(--bg-surface)] rounded cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset.id)}
                    onChange={() => handleToggleAsset(asset.id)}
                    disabled={generating}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[var(--text-primary)] truncate">{asset.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {asset.width}x{asset.height} • {(asset.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                  
                  {/* Progress */}
                  {progress[asset.id] !== undefined && (
                    <div className="w-20">
                      <div className="h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--accent-turquoise)] transition-all"
                          style={{ width: `${progress[asset.id]}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Proxy Status */}
                  {asset.proxyStatus === 'ready' && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                      Proxy
                    </span>
                  )}
                </label>
              ))
            )}
          </div>
        </div>
        
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={selectedAssets.length === 0 || generating}
          className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generiere Proxies...
            </>
          ) : (
            <>
              <Icon name="video" size={16} />
              {selectedAssets.length} Proxy{selectedAssets.length !== 1 ? 's' : ''} generieren
            </>
          )}
        </button>
      </div>
    </div>
  );
}
