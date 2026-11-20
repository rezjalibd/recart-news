/**
 * RECART NEWS - Instant Search Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const catFilter = document.getElementById('filter-category');
  const sourceFilter = document.getElementById('filter-source');
  const resultsContainer = document.getElementById('search-results');
  const resultsCount = document.getElementById('results-count');

  if (!searchInput || !resultsContainer) return;

  let searchIndex = [];

  // Fetch pre-built search index
  fetch('/search_index.json')
    .then(r => r.json())
    .then(data => {
      searchIndex = data;
      // Populate category and source filter options if empty
      populateFilters(searchIndex);
      // If there's an initial query in URL (?q=...), run it
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q');
      if (query) {
        searchInput.value = query;
        performSearch();
      } else {
        renderResults(searchIndex.slice(0, 24));
      }
    })
    .catch(err => {
      console.error('Error loading search index:', err);
      resultsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">خطا در دریافت شاخص جستجو</div>';
    });

  searchInput.addEventListener('input', debounce(performSearch, 150));
  if (catFilter) catFilter.addEventListener('change', performSearch);
  if (sourceFilter) sourceFilter.addEventListener('change', performSearch);

  function populateFilters(items) {
    if (catFilter && catFilter.options.length <= 1) {
      const cats = Array.from(new Set(items.map(i => i.category).filter(Boolean))).sort();
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        catFilter.appendChild(opt);
      });
    }
    if (sourceFilter && sourceFilter.options.length <= 1) {
      const sources = Array.from(new Set(items.map(i => i.source).filter(Boolean))).sort();
      sources.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        sourceFilter.appendChild(opt);
      });
    }
  }

  function performSearch() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const selCat = catFilter ? catFilter.value : '';
    const selSource = sourceFilter ? sourceFilter.value : '';

    const filtered = searchIndex.filter(item => {
      if (selCat && item.category !== selCat) return false;
      if (selSource && item.source !== selSource) return false;

      if (!q) return true;

      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const summaryMatch = (item.summary || '').toLowerCase().includes(q);
      const tagMatch = (item.tags || []).some(t => t.toLowerCase().includes(q));
      return titleMatch || summaryMatch || tagMatch;
    });

    renderResults(filtered);
  }

  function renderResults(items) {
    if (resultsCount) {
      resultsCount.textContent = `نمایش ${items.length} خبر`;
    }

    if (items.length === 0) {
      resultsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; stroke: var(--text-muted); opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style="font-family: var(--font-heading); margin-bottom: 0.5rem; color: var(--text-primary);">نتیجه‌ای یافت نشد</h3>
          <p style="font-size: 0.9rem;">کلمات کلیدی دیگری را جستجو کرده یا فیلترها را بازنشانی کنید.</p>
        </div>`;
      return;
    }

    resultsContainer.innerHTML = items.map(item => `
      <article class="news-card">
        <a href="${item.url}" class="news-card-thumb-wrap">
          <img src="${item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80'}" class="news-card-thumb" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80'">
        </a>
        <div class="news-card-body">
          <div class="meta-row">
            <span class="badge badge-tech">${escapeHtml(item.category || 'خبر')}</span>
            <span>${escapeHtml(item.date_fa || '')}</span>
          </div>
          <h3 class="news-card-title">
            <a href="${item.url}">${escapeHtml(item.title)}</a>
          </h3>
          <p class="news-card-snippet">${escapeHtml(item.summary || '')}</p>
          <div class="news-card-footer">
            <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(item.source || 'تحریریه')}</span>
            <a href="${item.url}" style="font-size: 0.82rem; font-weight: 600; color: var(--brand-primary);">مطالعه کامل ←</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  function debounce(fn, delay) {
    let t;
    return function(...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
