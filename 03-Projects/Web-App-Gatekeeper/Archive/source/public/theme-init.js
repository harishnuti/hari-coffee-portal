(function () {
  try {
    var t = localStorage.getItem('gk_theme') || 'dark';
    if (t === 'system') {
      t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#faf6ee' : '#0e0a06');
  } catch (e) { /* ignore — falls back to default dark CSS */ }
})();
