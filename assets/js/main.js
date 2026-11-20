/**
 * RECART NEWS - Core Interactive Engine
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

  // 2. Theme Toggle (Dark / Light)
  const themeBtn = document.getElementById('theme-toggle-btn');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or prefer dark by default
  const savedTheme = localStorage.getItem('recart-theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', nextTheme);
      localStorage.setItem('recart-theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeBtn) return;
    if (theme === 'dark') {
      themeBtn.innerHTML = `
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
      themeBtn.setAttribute('title', 'حالت روشن');
    } else {
      themeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>`;
      themeBtn.setAttribute('title', 'حالت تیره');
    }
  }

  // 3. Font Size Controls on Single Article
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

  // 4. Share Actions & Copy Link
  window.copyArticleLink = function(url) {
    const targetUrl = url || window.location.href;
    navigator.clipboard.writeText(targetUrl).then(() => {
      showToast('لینک مطلب کپی شد');
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
        background: #0284c7;
        color: #fff;
        padding: 0.6rem 1.5rem;
        border-radius: 9999px;
        font-size: 0.9rem;
        font-weight: 600;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
        z-index: 10000;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2500);
  }
});
