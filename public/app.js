document.addEventListener('DOMContentLoaded', () => {
  const downloaderForm = document.getElementById('downloader-form');
  const videoUrlInput = document.getElementById('video-url-input');
  const btnPaste = document.getElementById('btn-paste');
  const btnSubmit = document.getElementById('btn-submit');
  const validationWarning = document.getElementById('validation-warning');

  // Application State Blocks
  const loadingState = document.getElementById('loading-state');
  const loadingSubtext = document.getElementById('loading-subtext');
  const resultsState = document.getElementById('results-state');
  const errorState = document.getElementById('error-state');
  const errorMessageText = document.getElementById('error-message-text');
  const downloadButtonsContainer = document.getElementById('download-buttons-container');
  
  // Utility buttons
  const btnReset = document.getElementById('btn-reset');
  const btnShareResults = document.getElementById('btn-share-results');
  const btnErrorClose = document.getElementById('btn-error-close');

  // Sequence steps to keep user engaged while server fetches download packages
  const progressPhrases = [
    'Initiating secure connection bypass node...',
    'Parsing FB metadata algorithms...',
    'Unlocking streaming direct formats...',
    'Packaging quality links securely...',
    'Finalizing dynamic tokens...' 
  ];
  let loadingInterval = null;

  // Paste clipboard trigger
  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        videoUrlInput.value = text.trim();
        validateUrl(videoUrlInput.value);
      }
    } catch (err) {
      // Fallback if clipboard permission is denied or unsupported
      alert('Could not auto-read from clipboard. Please manually paste with Ctrl+V or long-tap.');
    }
  });

  // URL Validator
  function validateUrl(url) {
    if (!url) return false;
    const parsedUrl = url.toLowerCase();
    
    // Check if it looks like a FB url
    const isFb = parsedUrl.includes('facebook.com') || 
                 parsedUrl.includes('fb.watch') || 
                 parsedUrl.includes('fb.gg') || 
                 parsedUrl.includes('facebook.co') || 
                 parsedUrl.includes('fb.com');
                 
    if (!isFb) {
      validationWarning.classList.remove('hidden');
      return false;
    } else {
      validationWarning.classList.add('hidden');
      return true;
    }
  }

  // URL input keystroke auto-clears warnings
  videoUrlInput.addEventListener('input', () => {
    if (videoUrlInput.value.trim() === '') {
      validationWarning.classList.add('hidden');
    }
  });

  // Form Submit Execution
  downloaderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetUrl = videoUrlInput.value.trim();

    if (!validateUrl(targetUrl)) {
      return;
    }

    // Hide alternate states
    resultsState.classList.add('hidden');
    errorState.classList.add('hidden');
    
    // Enable loading states
    loadingState.classList.remove('hidden');
    btnSubmit.disabled = true;
    btnSubmit.classList.add('opacity-75', 'cursor-not-allowed');

    // Cycle subtext feedback messages dynamically
    let phraseIndex = 0;
    loadingSubtext.innerText = progressPhrases[phraseIndex];
    loadingInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % progressPhrases.length;
      loadingSubtext.innerText = progressPhrases[phraseIndex];
    }, 2500);

    try {
      const requestUrl = `/api/download?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetch(requestUrl);
      const data = await response.json();

      clearInterval(loadingInterval);
      loadingState.classList.add('hidden');
      btnSubmit.disabled = false;
      btnSubmit.classList.remove('opacity-75', 'cursor-not-allowed');

      if (data && data.status === 'success' && Array.isArray(data.results)) {
        renderQualityButtons(data.results);
      } else {
        showError(data.message || 'The extractor was unable to find public download formats for this URL.');
      }
    } catch (err) {
      clearInterval(loadingInterval);
      loadingState.classList.add('hidden');
      btnSubmit.disabled = false;
      btnSubmit.classList.remove('opacity-75', 'cursor-not-allowed');
      showError('Connection timeout or network failure. Please verify your internet connection and try again.');
    }
  });

  // Render Quality Buttons in Neon Cards
  function renderQualityButtons(results) {
    downloadButtonsContainer.innerHTML = '';
    
    // Filter duplicate qualities or filter dead urls if any exist
    const validResults = results.filter(item => item.url && item.url !== '/');

    if (validResults.length === 0) {
      showError('No downloadable streams discovered for this URL. Ensure the post visibility is public.');
      return;
    }

    validResults.forEach((result) => {
      const isHD = result.quality.toLowerCase().includes('hd') || result.quality.toLowerCase().includes('720p') || result.quality.toLowerCase().includes('1080p');
      const isAudioOnly = result.quality.toLowerCase().includes('kbps') || result.quality.toLowerCase().includes('audio');
      
      let badgeHtml = '';
      let btnClass = '';
      let icon = '';

      if (isHD) {
        badgeHtml = `<span class="text-[10px] uppercase bg-neonPink/20 text-neonPink px-2.5 py-0.5 rounded-full font-bold border border-neonPink/30 shadow-[0_0_8px_rgba(255,0,127,0.2)]">HD Quality</span>`;
        btnClass = 'from-neonPink to-neonPurple hover:shadow-[0_0_15px_rgba(255,0,127,0.4)]';
        icon = '<i class="fa-solid fa-circle-play text-neonPink text-xl"></i>';
      } else if (isAudioOnly) {
        badgeHtml = `<span class="text-[10px] uppercase bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">Audio MP3</span>`;
        btnClass = 'from-amber-600 to-amber-700 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]';
        icon = '<i class="fa-solid fa-music text-amber-400 text-xl"></i>';
      } else {
        badgeHtml = `<span class="text-[10px] uppercase bg-neonCyan/20 text-neonCyan px-2.5 py-0.5 rounded-full font-bold border border-neonCyan/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]">SD Stream</span>`;
        btnClass = 'from-neonCyan to-blue-600 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]';
        icon = '<i class="fa-solid fa-video text-neonCyan text-xl"></i>';
      }

      const card = document.createElement('div');
      card.className = 'quality-card bg-cyberDark/80 rounded-2xl p-4 border border-gray-800 flex items-center justify-between gap-4 transition-all hover:border-gray-700';
      
      card.innerHTML = `
        <div class="flex items-center space-x-3.5">
          ${icon}
          <div>
            <div class="font-cyber font-bold text-sm text-gray-100">${result.quality}</div>
            <div class="mt-1 flex items-center space-x-2">
              ${badgeHtml}
              <span class="text-[10px] text-gray-500 font-mono">MP4</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            onclick="navigator.clipboard.writeText('${result.url}'); alert('Direct stream link copied to clipboard!');"
            class="p-2.5 bg-gray-800/80 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-white border border-gray-700 transition-all text-xs flex items-center justify-center"
            title="Copy Stream Address"
          >
            <i class="fa-solid fa-link"></i>
          </button>
          <a 
            href="${result.url}" 
            target="_blank"
            rel="noopener noreferrer"
            download="FBLightning_Video.mp4"
            class="px-4 py-2.5 bg-gradient-to-r ${btnClass} rounded-xl text-white text-xs font-cyber font-bold tracking-wider hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center gap-1.5 shadow-md"
          >
            <span>DOWNLOAD</span>
            <i class="fa-solid fa-arrow-down-long"></i>
          </a>
        </div>
      `;
      
      downloadButtonsContainer.appendChild(card);
    });

    resultsState.classList.remove('hidden');
    // Scroll smoothly to results state
    resultsState.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Utility display Error State
  function showError(msg) {
    errorMessageText.innerText = msg;
    errorState.classList.remove('hidden');
    errorState.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Form Clear Resets
  function resetApp() {
    videoUrlInput.value = '';
    resultsState.classList.add('hidden');
    errorState.classList.add('hidden');
    validationWarning.classList.add('hidden');
    downloadButtonsContainer.innerHTML = '';
  }

  btnReset.addEventListener('click', resetApp);
  btnErrorClose.addEventListener('click', resetApp);

  // Share results to Web Share API or copy current URL to Clipboard
  btnShareResults.addEventListener('click', () => {
    const pageUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'FBLightning Facebook Downloader',
        text: 'Instantly download Facebook videos and reels in high resolution online!',
        url: pageUrl
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(pageUrl);
      alert('FBLightning portal URL copied to clipboard! Share it with your friends.');
    }
  });

  // Accordion Expand/Collapse logic for professional QA cards
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  
  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const card = trigger.parentElement;
      const content = trigger.nextElementSibling;
      const isOpen = card.classList.contains('active');
      
      // Close other active FAQ cards first for professional clean interaction
      document.querySelectorAll('.faq-card').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-content').style.maxHeight = null;
      });

      if (!isOpen) {
        card.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
});