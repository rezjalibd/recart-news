/**
 * RECART NEWS - Core Interactive Engine v2.0
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Reading Progress Indicator
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scrollPercent = (totalScroll / windowHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
      }
    }, { passive: true });
  }

  // 2. Theme Toggle (Dark / Light) - Default is LIGHT
  const themeBtn = document.getElementById('theme-toggle-btn');
  const mobileThemeBtn = document.getElementById('mobile-theme-toggle-btn');
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem('recart-theme') || 'light';
  htmlRoot.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  function toggleTheme() {
    const current = htmlRoot.getAttribute('data-theme') || 'light';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    htmlRoot.setAttribute('data-theme', nextTheme);
    localStorage.setItem('recart-theme', nextTheme);
    updateThemeIcons(nextTheme);
  }

  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', toggleTheme);

  function updateThemeIcons(theme) {
    const btns = [themeBtn, mobileThemeBtn].filter(Boolean);
    btns.forEach(btn => {
      if (theme === 'dark') {
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>`;
        btn.setAttribute('title', 'حالت روشن');
      } else {
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>`;
        btn.setAttribute('title', 'حالت تیره');
      }
    });
  }

  // 3. Mobile Navigation Drawer
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileCloseBtn = document.getElementById('mobile-drawer-close');

  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileDrawer);

  // 4. Hero Carousel / Slider Engine
  const carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    let currentIndex = 0;
    let timer = null;

    function goToSlide(idx) {
      if (idx < 0) idx = slides.length - 1;
      if (idx >= slides.length) idx = 0;
      currentIndex = idx;

      slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    function startAutoPlay() {
      stopAutoPlay();
      timer = setInterval(nextSlide, 5000);
    }
    function stopAutoPlay() {
      if (timer) clearInterval(timer);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goToSlide(i);
        startAutoPlay();
      });
    });

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  // 5. Ajax Search Modal (In-page Instant Search)
  const searchModal = document.getElementById('search-modal');
  const searchModalInput = document.getElementById('search-modal-input');
  const searchModalResults = document.getElementById('search-modal-results');
  const searchModalClose = document.getElementById('search-modal-close');
  const searchTriggers = document.querySelectorAll('.trigger-search-modal');
  let searchIndex = null;

  function openSearchModal() {
    if (!searchModal) return;
    searchModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (searchModalInput) {
      setTimeout(() => searchModalInput.focus(), 100);
    }
    if (!searchIndex) {
      fetch('/search_index.json')
        .then(r => r.json())
        .then(data => {
          searchIndex = data;
          if (searchModalInput && searchModalInput.value.trim()) {
            performModalSearch();
          }
        })
        .catch(console.error);
    }
  }

  function closeSearchModal() {
    if (!searchModal) return;
    searchModal.classList.remove('open');
    document.body.style.overflow = '';
    if (searchModalInput) searchModalInput.value = '';
    if (searchModalResults) searchModalResults.innerHTML = '';
  }

  searchTriggers.forEach(t => t.addEventListener('click', (e) => {
    e.preventDefault();
    openSearchModal();
  }));

  if (searchModalClose) searchModalClose.addEventListener('click', closeSearchModal);
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearchModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearchModal();
      closeMobileDrawer();
    }
  });

  if (searchModalInput) {
    searchModalInput.addEventListener('input', () => {
      performModalSearch();
    });
  }

  function performModalSearch() {
    if (!searchModalInput || !searchModalResults) return;
    const q = (searchModalInput.value || '').trim().toLowerCase();
    if (!q) {
      searchModalResults.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.9rem;">عبارت مورد نظر خود را تایپ کنید...</div>';
      return;
    }
    if (!searchIndex) {
      searchModalResults.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">در حال بارگذاری شاخص جستجو...</div>';
      return;
    }

    const matches = searchIndex.filter(item => {
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const summaryMatch = (item.summary || '').toLowerCase().includes(q);
      const catMatch = (item.category || '').toLowerCase().includes(q);
      return titleMatch || summaryMatch || catMatch;
    }).slice(0, 8);

    if (matches.length === 0) {
      searchModalResults.innerHTML = '<div style="text-align: center; padding: 2.5rem; color: var(--text-muted); font-size: 0.95rem;">مطلبی متناسب با جستجوی شما یافت نشد.</div>';
      return;
    }

    searchModalResults.innerHTML = matches.map(item => `
      <a href="${item.url}" class="search-result-item">
        <img src="${item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&auto=format&fit=crop&q=80'}" class="search-result-thumb" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&auto=format&fit=crop&q=80'">
        <div class="search-result-info">
          <div class="search-result-title">${item.title}</div>
          <div class="search-result-meta">${item.category || 'خبر'} • ${item.date_fa || ''}</div>
        </div>
      </a>
    `).join('');
  }

  // 6. Font Size Controls on Single Article
  const contentEl = document.getElementById('article-content');
  const sizeBtns = document.querySelectorAll('[data-font-size]');
  if (contentEl && sizeBtns.length > 0) {
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-font-size');
        contentEl.setAttribute('data-size', size);
        localStorage.setItem('recart-font-size', size);
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const savedSize = localStorage.getItem('recart-font-size') || 'md';
    contentEl.setAttribute('data-size', savedSize);
    const activeBtn = document.querySelector(`[data-font-size="${savedSize}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  // 7. Social Sharing Triggers
  window.shareOnTelegram = function(url, title) {
    const targetUrl = encodeURIComponent(url || window.location.href);
    const targetTitle = encodeURIComponent(title || document.title);
    window.open(`https://t.me/share/url?url=${targetUrl}&text=${targetTitle}`, '_blank');
  };

  window.shareOnWhatsApp = function(url, title) {
    const targetUrl = encodeURIComponent(url || window.location.href);
    const targetTitle = encodeURIComponent(title || document.title);
    window.open(`https://api.whatsapp.com/send?text=${targetTitle}%20${targetUrl}`, '_blank');
  };

  window.shareOnX = function(url, title) {
    const targetUrl = encodeURIComponent(url || window.location.href);
    const targetTitle = encodeURIComponent(title || document.title);
    window.open(`https://twitter.com/intent/tweet?url=${targetUrl}&text=${targetTitle}`, '_blank');
  };

  window.shareOnFacebook = function(url) {
    const targetUrl = encodeURIComponent(url || window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${targetUrl}`, '_blank');
  };

  window.copyArticleLink = function(url) {
    const targetUrl = url || window.location.href;
    navigator.clipboard.writeText(targetUrl).then(() => {
      showToast('لینک مطلب در حافظه کپی شد');
    }).catch(() => {
      prompt('لینک مطلب را کپی کنید:', targetUrl);
    });
  };

  function showToast(msg) {
    let toast = document.getElementById('recart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'recart-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: #1d4ed8;
        color: #fff;
        padding: 0.65rem 1.6rem;
        border-radius: 9999px;
        font-size: 0.9rem;
        font-family: var(--font-heading);
        font-weight: 700;
        box-shadow: 0 10px 25px -3px rgba(0,0,0,0.3);
        z-index: 10000;
        transition: opacity 0.3s ease, transform 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 2500);
  }

  // 8. Progressive Archive Pagination (30 initial + 20 per click, stays on item)
  const archiveContainer = document.querySelector('.archive-items-grid');
  const loadMoreBtn = document.getElementById('btn-load-more');
  if (archiveContainer && loadMoreBtn) {
    const allCards = Array.from(archiveContainer.querySelectorAll('.news-card'));
    const initialCount = 30;
    const stepCount = 20;
    let currentlyVisible = initialCount;

    // Initially hide cards beyond 30
    allCards.forEach((card, idx) => {
      if (idx >= initialCount) {
        card.style.display = 'none';
      }
    });

    if (allCards.length <= initialCount) {
      loadMoreBtn.style.display = 'none';
    }

    loadMoreBtn.addEventListener('click', () => {
      const prevVisible = currentlyVisible;
      const nextLimit = Math.min(currentlyVisible + stepCount, allCards.length);
      
      // Reveal the next batch
      for (let i = currentlyVisible; i < nextLimit; i++) {
        if (allCards[i]) {
          allCards[i].style.display = 'flex';
        }
      }

      currentlyVisible = nextLimit;

      // Keep focus/scroll on the first newly revealed item (do not scroll to the bottom!)
      const firstNewCard = allCards[prevVisible];
      if (firstNewCard) {
        firstNewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Hide button when all items are displayed
      if (currentlyVisible >= allCards.length) {
        loadMoreBtn.style.display = 'none';
      }
    });
  }
});
