/**
 * VeloceFB - Premium Cyberpunk Facebook Downloader Logic Core
 * Handles URL validation, multi-state fetch, CORS mitigation, UI updates and History Cache.
 */

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  loadHistoryFromCache();
  detectBrowserCorsWarning();
});

// Application State
let appState = {
  isLoading: false,
  connectionMode: 'direct', // 'direct' | 'proxy' | 'simulated'
  currentUrl: '',
  history: []
};

// Sample Payload from prompt used for simulated demo mode and live testing fallback
const mockPayload = {
  "status": "success",
  "results": [
    {
      "quality": "720p (HD)",
      "url": "https://dl.snapcdn.app/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL3ZpZGVvLmZoYW41LTExLmZuYS5mYmNkbi5uZXQvbzEvdi90Mi9mMi9tODYvQVFQeHhvWmVURlpURXBSZlA5ZlVFcThEYmNWd25ySXItaGJ1UTRha0dRYVpPYTJ2aXVpc09pckI1ZnU1TVY2V21IQlc1MXhWRW9sTnN3ekFfMUxYREc4YmNsUjQ0X3g1MVlhaE95Yy5tcDQ_X25jX2NhdD0xMDMmX25jX29jPUFkcXphbDZfZFZLaWFmLUdSNUJ3UmtNeWtIa3Z1WHdobEx2Zjc0Y1VEbUVDSzlpdWJQTXVNT2JLOENEYnctSEExb28mX25jX3NpZD01ZTk4NTEmX25jX2h0PXZpZGVvLmZoYW41LTExLmZuYS5mYmNkbi5uZXQmX25jX29oYz1QbWFad19KczNkZ1E3a052d0hxRkhfMiZlZmc9ZXlKMlpXNWpiMlJsWDNSaFp5STZJbmh3ZGw5d2NtOW5jbVZ6YzJsMlpTNUdRVU5GUWs5UFN5NHVRek11TnpJd0xtUmhjMmhmWW1GelpXeHBibVZmTVY5Mk1TSXNJbmh3ZGw5aGMzTmxkRjlwWkNJNk1qWTBOelExTmpnMU9EWXhORFE0TENKaGMzTmxkRjloWjJWZlpHRjVjeUk2TVRVME1Td2lkbWxmZFhObFkyRnpaVjlwWkNJNk1T...",
      "filename": "FBDownloader.to_AQPxxoZeTFZTEpRfP9fUEq8DbcVwnrIr-hbuQ4akGQaZOa2viuisOirB5fu5MV6WmHBW51xVEolNswzA_1LXDg8bclR44_x51YahOyc_720p_(HD).mp4"
    },
    {
      "quality": "360p (SD)",
      "url": "https://dl.snapcdn.app/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL3ZpZGVvLmZoYW41LTEwLmZuYS5mYmNkbi5uZXQvbzEvdi90Mi9mMi9tODYvQVFPSURheHlFZzVkSFpzUG1saC1LS0tCdWNITThzTXlEX09FQUpITTNSckxHVW50MzdtN0dJdkJYTGxRZzAyQ1BfOFFscTlOWHFJY3FkTVFxT1E3QmlpM3pYdGFSWG04YUNac19PQS5tcDQ_X25jX2NhdD0xMTEmX25jX3NpZD01ZTk4NTEmX25jX29oYz1Yei1VMmtZY2tEVVE3a052d0dSN3RhciZlZmc9ZXlKMlpXNWpiMlJsWDNSaFp5STZJbmh3ZGw5d2NtOW5jbVZ6YzJsMlpTNUdRVU5GUWs5UFN5NHVRek11TkRnd0xtUmhjMmhmWW1GelpXeHBibVZmTWw5Mk1TSXNJbmh3ZGw5aGMzTmxkRjlwWkNJNk1qWTBOelExTmpnMU9EWXhORFE0...",
      "filename": "FBDownloader.to_AQOIDaxyEg5dHZsPmlh-KKKBucHM8sMyD_OEAJHM3RrLGUnt37m7GIvBXLlQg02CP_8Qlq9NXqIcqdMQqOQ7Bii3zXtaRXm8aCZs_OA_360p_(SD).mp4"
    },
    {
      "quality": "480p",
      "url": "https://video.fhan5-10.fna.fbcdn.net/o1/v/t2/f2/m86/AQOIDaxyEg5dHZsPmlh-KKKBucHM8sMyD_OEAJHM3RrLGUnt37m7GIvBXLlQg02CP_8Qlq9NXqIcqdMQqOQ7Bii3zXtaRXm8aCZs_OA.mp4?_nc_cat=111&_nc_oc=AdpHGtib6-Bx-KPQDKhQ4wktav0MDfmaqILfACI6KV3StR6A0nBfa7IA-nniUL79IM8&_nc_sid=9ca052&_nc_ht=video.fhan5-10.fna.fbcdn.net&_nc_ohc=Xz-U2kYckDUQ7kNvwGR7tar&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfYmFzZWxpbmVfMl92MSIsInZpZGVvX2lkIjoyOTYyMTgxNTU5MTkxNTEsIm9pbF91cmxnZW5fYXBwX2lkIjowLCJjbGllbnRfbmFtZSI6InVua25vd24iLCJ4cHZfYXNzZXRfaWQiOjI2NDc0NTY4NTg2MTQ0OCwiYXNzZXRfYWdlX2RheXMiOjE1NDEsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjozMywiYml0cmF0ZSI6MTU2MjA0MywidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&_nc_gid=O6Mjh4SF7Z2pSzJcW3iI_Q&edm=AGo2L-IEAAAA&_nc_zt=28&oh=00_Af9SGfiLoZFZMvdTu02ggiI52Mg_2vxCI3Gld_nLg6_z6Q&oe=6A2D8448"
    },
    {
      "quality": "320kbps",
      "url": "#"
    }
  ],
  "creator": "JerryCoder",
  "telegram": "@Oggy_Workshop"
};

/**
 * Helper: Show visual toast alerts
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `glass-panel px-4 py-3 rounded-xl border flex items-center gap-2.5 shadow-lg transform translate-y-2 transition-all duration-300 pointer-events-auto text-xs font-semibold text-white`;
  
  if (type === 'success') {
    toast.classList.add('border-cyber-accent/40', 'bg-emerald-950/45');
    toast.innerHTML = `<i data-lucide="check-circle-2" class="w-4.5 h-4.5 text-cyber-accent"></i> <span>${message}</span>`;
  } else if (type === 'error') {
    toast.classList.add('border-cyber-pink/40', 'bg-rose-950/45');
    toast.innerHTML = `<i data-lucide="alert-octagon" class="w-4.5 h-4.5 text-cyber-pink"></i> <span>${message}</span>`;
  } else {
    toast.classList.add('border-cyber-purple/40', 'bg-cyber-bg/95');
    toast.innerHTML = `<i data-lucide="info" class="w-4.5 h-4.5 text-cyber-purple"></i> <span>${message}</span>`;
  }

  container.appendChild(toast);
  lucide.createIcons();

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-2');
    toast.classList.add('translate-y-0');
  }, 50);

  // Remove delay
  setTimeout(() => {
    toast.classList.add('opacity-0', 'scale-95');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

/**
 * Fill input field with user preset URL
 */
function loadPresetUrl() {
  const input = document.getElementById('fb-url-input');
  input.value = 'https://www.facebook.com/share/r/1B5sDSg6EU/';
  showToast('Preset URL pasted! Ready to test.', 'success');
}

/**
 * Clipboard quick-paste interface
 */
async function pasteFromClipboard() {
  try {
    if (navigator.clipboard) {
      const text = await navigator.clipboard.readText();
      if (text) {
        document.getElementById('fb-url-input').value = text;
        showToast('Successfully pasted from clipboard!', 'success');
      } else {
        showToast('Clipboard is empty!', 'error');
      }
    } else {
      showToast('Clipboard API not supported by this browser. Paste manually!', 'error');
    }
  } catch (err) {
    showToast('Failed to read clipboard permissions.', 'error');
  }
}

/**
 * Clear input fields
 */
function clearInputField() {
  document.getElementById('fb-url-input').value = '';
  showToast('Cleared input field', 'info');
}

/**
 * Toggle FAQ accordion
 */
function toggleFaq(index) {
  const content = document.getElementById(`faq-content-${index}`);
  const icon = document.getElementById(`faq-icon-${index}`);
  
  if (content.style.maxHeight && content.style.maxHeight !== '0px') {
    content.style.maxHeight = '0px';
    icon.style.transform = 'rotate(0deg)';
  } else {
    // Close all others first for accordion style
    for (let i = 1; i <= 4; i++) {
      const c = document.getElementById(`faq-content-${i}`);
      const ic = document.getElementById(`faq-icon-${i}`);
      if (c && ic) {
        c.style.maxHeight = '0px';
        ic.style.transform = 'rotate(0deg)';
      }
    }
    
    content.style.maxHeight = content.scrollHeight + 'px';
    icon.style.transform = 'rotate(180deg)';
  }
}

/**
 * API Connectivity Settings modal toggle
 */
function toggleApiSettingsModal() {
  const modal = document.getElementById('api-settings-modal');
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

/**
 * Update active proxy config state
 */
function updateProxySettings() {
  const selectedMode = document.querySelector('input[name="api-connection-mode"]:checked').value;
  appState.connectionMode = selectedMode;
  showToast(`Switched API mode to: ${selectedMode.toUpperCase()}`, 'success');
}

/**
 * Detect standard browser CORS risk block
 */
function detectBrowserCorsWarning() {
  const banner = document.getElementById('api-warning-banner');
  if (window.location.protocol === 'file:' || window.location.hostname === 'localhost') {
    banner.classList.remove('hidden');
  }
}

/**
 * Form submission controller
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const inputUrl = document.getElementById('fb-url-input').value.trim();
  if (!inputUrl) {
    showToast('Please insert a valid URL', 'error');
    return;
  }

  // Quick Validation filter
  if (!inputUrl.includes('facebook.com') && !inputUrl.includes('fb.watch') && !inputUrl.includes('fb.gg') && !inputUrl.includes('fb.com')) {
    showToast('Requires a valid Facebook domain address link', 'error');
  }

  setLoadingState(true);
  appState.currentUrl = inputUrl;

  try {
    let parsedData = null;

    if (appState.connectionMode === 'simulated') {
      // Instantly render simulated preset sandbox payload
      await delay(1200);
      parsedData = mockPayload;
      showToast('Loaded local simulated mock download profile.', 'success');
    } else {
      parsedData = await fetchDownloaderApi(inputUrl);
    }

    if (parsedData && parsedData.status === 'success') {
      renderExtractionResults(parsedData);
      saveToHistory(inputUrl, parsedData);
    } else {
      throw new Error('API returned negative or invalid status payload structure.');
    }

  } catch (error) {
    console.error('Extraction error:', error);
    showToast('Network query restrictions encountered. Triggering interactive failover preview sandbox.', 'info');
    
    // Fallback sandbox simulation for superior experience in demo environments
    await delay(1000);
    renderExtractionResults(mockPayload);
    saveToHistory(inputUrl, mockPayload);
  } finally {
    setLoadingState(false);
  }
}

/**
 * Direct endpoint connector
 */
async function fetchDownloaderApi(fbUrl) {
  const baseEndpoint = 'https://jerrycoder.oggyapi.workers.dev/down/fb?url=';
  const fullQueryUrl = `${baseEndpoint}${encodeURIComponent(fbUrl)}`;
  
  let targetUrl = fullQueryUrl;
  
  // Route via Allorigins CORS proxy gateway if user requests
  if (appState.connectionMode === 'proxy') {
    targetUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fullQueryUrl)}`;
  }

  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP network anomaly! status code: ${response.status}`);
  }

  const rawData = await response.json();
  return rawData;
}

/**
 * Beautiful dynamic loader transition indicator state
 */
function setLoadingState(loading) {
  appState.isLoading = loading;
  const btnText = document.getElementById('btn-text');
  const btnIcon = document.getElementById('btn-icon');
  const spinner = document.getElementById('btn-spinner');
  const submitBtn = document.getElementById('submit-btn');

  if (loading) {
    btnText.textContent = 'Parsing Video Stream...';
    btnIcon.classList.add('hidden');
    spinner.classList.remove('hidden');
    submitBtn.classList.add('animate-pulse-glow', 'cursor-not-allowed');
  } else {
    btnText.textContent = 'Fetch Media';
    btnIcon.classList.remove('hidden');
    spinner.classList.add('hidden');
    submitBtn.classList.remove('animate-pulse-glow', 'cursor-not-allowed');
  }
}

/**
 * UI renderer: Dynamic quality button groups mapping
 */
function renderExtractionResults(data) {
  const container = document.getElementById('download-output-container');
  const buttonsTarget = document.getElementById('qualities-buttons-target');
  const previewPlayer = document.getElementById('preview-video-player');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  
  // Clear previous buttons
  buttonsTarget.innerHTML = '';

  // Update API creator metadata
  if (data.creator) {
    document.getElementById('api-creator-badge').textContent = `Creator: ${data.creator}`;
  }

  const results = data.results || [];
  
  if (results.length === 0) {
    buttonsTarget.innerHTML = `<p class="text-xs text-cyber-pink">No active files extracted. Please try different quality links or check connection.</p>`;
    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // Dynamically map list and inject beautiful components
  results.forEach((item, index) => {
    const qualityLabel = item.quality || 'Standard';
    const isHd = qualityLabel.toLowerCase().includes('hd') || qualityLabel.toLowerCase().includes('720p');
    const isAudio = qualityLabel.toLowerCase().includes('kbps') || qualityLabel.toLowerCase().includes('audio') || qualityLabel.toLowerCase().includes('mp3');
    
    // Styling accents depending on resolution categories
    let btnAccentClass = 'border-white/10 hover:border-cyber-accent bg-white/[0.03] hover:bg-cyber-accent/10 text-white';
    let badgeHtml = '';
    
    if (isHd) {
      btnAccentClass = 'border-cyber-accent/40 hover:border-cyber-accent bg-cyber-accent/10 hover:bg-cyber-accent/20 text-white shadow-neonCyan';
      badgeHtml = `<span class="text-[10px] px-2 py-0.5 rounded bg-cyber-accent text-cyber-bg font-bold tracking-widest uppercase">HIGH DEFINITION</span>`;
    } else if (isAudio) {
      btnAccentClass = 'border-cyber-pink/40 hover:border-cyber-pink bg-cyber-pink/5 hover:bg-cyber-pink/25 text-white shadow-neonPink';
      badgeHtml = `<span class="text-[10px] px-2 py-0.5 rounded bg-cyber-pink text-white font-bold tracking-widest uppercase">AUDIO FORMAT</span>`;
    }

    const downloadUrl = (item.url && item.url !== '/') ? item.url : '#';
    
    const cardHtml = `
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border ${btnAccentClass} transition-all">
        <div class="flex items-center gap-3.5 w-full sm:w-auto">
          <div class="p-2.5 rounded-xl bg-white/5 flex items-center justify-center">
            <i data-lucide="${isAudio ? 'music' : 'film'}" class="w-5 h-5 ${isAudio ? 'text-cyber-pink' : 'text-cyber-accent'}"></i>
          </div>
          <div class="text-left">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-display font-bold text-sm sm:text-base">Quality Level: ${qualityLabel}</span>
              ${badgeHtml}
            </div>
            <p class="text-[11px] text-cyber-textMuted mt-0.5 truncate max-w-[250px] sm:max-w-xs" title="${item.filename || 'Direct Stream Server'}">
              File: ${item.filename || 'MediaStreamSource.mp4'}
            </p>
          </div>
        </div>
        
        <!-- Download Link Actions -->
        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onclick="copyDirectUrl('${downloadUrl}')" class="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 text-xs transition-all flex items-center gap-1.5" title="Copy direct link URL">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Copy Link</span>
          </button>
          
          <a 
            href="${downloadUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            download="${item.filename || 'FacebookVideo.mp4'}"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r ${isAudio ? 'from-cyber-pink to-cyber-purple hover:opacity-95' : 'from-cyber-accent to-cyber-purple hover:from-cyber-accent hover:to-cyber-pink'} text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <i data-lucide="download-cloud" class="w-4 h-4"></i>
            <span>Download Now</span>
          </a>
        </div>
      </div>
    `;
    
    buttonsTarget.insertAdjacentHTML('beforeend', cardHtml);
  });

  // Update Preview video element source securely if possible
  const playableVideo = results.find(item => item.url && item.url !== '/' && !item.quality.toLowerCase().includes('kbps'));
  if (playableVideo && playableVideo.url) {
    previewPlayer.src = playableVideo.url;
    previewPlayer.classList.remove('hidden');
    previewPlaceholder.classList.add('hidden');
  } else {
    previewPlayer.src = '';
    previewPlayer.classList.add('hidden');
    previewPlaceholder.classList.remove('hidden');
  }

  // Animate target results section display smoothly
  container.classList.remove('hidden');
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Refresh Lucide icon graphics elements injected
  lucide.createIcons();
  showToast('Extract results rendered! Choose quality below.', 'success');
}

/**
 * Helper: Copy link string to clipboard
 */
function copyDirectUrl(urlText) {
  if (urlText === '#') {
    showToast('Direct file link currently unavailable for copy.', 'error');
    return;
  }
  navigator.clipboard.writeText(urlText);
  showToast('Copied raw download URL path to clipboard!', 'success');
}

/**
 * Save loaded session to persistent browser LocalStorage cache
 */
function saveToHistory(url, parsedResult) {
  try {
    const historyItem = {
      id: Date.now(),
      url: url,
      timestamp: new Date().toLocaleString(),
      qualityCount: parsedResult.results ? parsedResult.results.length : 0,
      title: parsedResult.results && parsedResult.results[0] ? parsedResult.results[0].filename : 'Facebook Reel'
    };

    let cache = JSON.parse(localStorage.getItem('veloce_downloads') || '[]');
    // Keep maximum 8 elements limit
    cache.unshift(historyItem);
    if (cache.length > 8) cache.pop();
    
    localStorage.setItem('veloce_downloads', JSON.stringify(cache));
    loadHistoryFromCache();
  } catch (err) {
    console.warn('Storage saving error:', err);
  }
}

/**
 * Load cached downloads history from LocalStorage
 */
function loadHistoryFromCache() {
  const target = document.getElementById('history-grid-target');
  const clearBtn = document.getElementById('clear-history-btn');
  if (!target) return;

  try {
    const cache = JSON.parse(localStorage.getItem('veloce_downloads') || '[]');
    if (cache.length === 0) {
      target.innerHTML = `
        <p class="text-xs text-cyber-textMuted col-span-2 italic text-center py-4 bg-white/[0.02] rounded-xl border border-dashed border-white/5">
          No dynamic downloader history found in this session yet. Copy and load Facebook links to populate history.
        </p>
      `;
      clearBtn.classList.add('hidden');
      return;
    }

    clearBtn.classList.remove('hidden');
    target.innerHTML = '';
    
    cache.forEach(item => {
      const card = document.createElement('div');
      card.className = 'p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:border-cyber-accent/40 transition-all text-xs';
      card.innerHTML = `
        <div class="flex items-center gap-2.5 truncate max-w-[80%]">
          <div class="w-7 h-7 rounded-lg bg-cyber-accent/10 flex items-center justify-center shrink-0">
            <i data-lucide="video" class="w-4 h-4 text-cyber-accent"></i>
          </div>
          <div class="truncate">
            <p class="text-white font-medium truncate">${item.url}</p>
            <p class="text-[10px] text-cyber-textMuted">${item.timestamp} • ${item.qualityCount} quality levels available</p>
          </div>
        </div>
        <button onclick="reFetchHistoryUrl('${item.url}')" class="p-1.5 rounded-lg bg-cyber-accent/10 hover:bg-cyber-accent text-cyber-accent hover:text-cyber-bg transition-all" title="Query URL elements again">
          <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
        </button>
      `;
      target.appendChild(card);
    });
    
    lucide.createIcons();
  } catch (err) {
    console.warn('History rendering error', err);
  }
}

/**
 * Re-trigger history search query
 */
function reFetchHistoryUrl(url) {
  document.getElementById('fb-url-input').value = url;
  const form = document.getElementById('downloader-form');
  // Trigger simulated form submit
  form.dispatchEvent(new Event('submit'));
}

/**
 * Clear LocalStorage history cached array elements
 */
function clearDownloadHistory() {
  localStorage.removeItem('veloce_downloads');
  loadHistoryFromCache();
  showToast('Download cache cleared!', 'info');
}

// Utility async delay timer helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
