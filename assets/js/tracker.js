/**
 * Recart Analytics Tracker
 * Lightweight privacy-friendly pageview tracker
 */
(function () {
  try {
    // Do not track admin panel visits
    if (window.location.pathname.startsWith('/nilay')) {
      return;
    }

    // Persistent visitor identification (anonymous random token)
    var storageKey = 'recart_vid';
    var vid = null;
    try {
      vid = localStorage.getItem(storageKey);
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
        localStorage.setItem(storageKey, vid);
      }
    } catch (e) {
      vid = 'v_guest_' + Math.random().toString(36).substring(2, 10);
    }

    // Extract metadata
    var getMeta = function (name) {
      var el = document.querySelector('meta[name="' + name + '"]');
      return el ? el.getAttribute('content') : '';
    };

    var pathname = window.location.pathname || '/';
    var title = document.title || '';
    var category = getMeta('article:category');
    if (!category && pathname.startsWith('/category/')) {
      var parts = pathname.split('/').filter(Boolean);
      if (parts.length > 1) category = parts[1];
    }
    var tags = getMeta('article:tags');
    var source = getMeta('article:source');
    var referrer = document.referrer || '';

    var payload = {
      path: pathname,
      title: title.replace(' — خبرگزاری ریکارت', '').trim(),
      category: category || '',
      tags: tags || '',
      source: source || '',
      referrer: referrer,
      visitor_id: vid
    };

    var endpoint = 'https://n8n.nilayteam.ir/webhook/recart-track';
    var jsonPayload = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      var blob = new Blob([jsonPayload], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonPayload,
        keepalive: true
      }).catch(function () {});
    }
  } catch (err) {
    // Fail silently without disrupting page render
  }
})();
