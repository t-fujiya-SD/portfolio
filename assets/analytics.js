// Cookieレスのアクセス解析（GoatCounter）＋サイト内の行動計測。
// SITE_CONFIG.goatcounter が未設定の間は何も送信しない（イベントはconsoleにのみ出る）。
(function () {
  var cfg = window.SITE_CONFIG || {};
  var enabled = !!cfg.goatcounter;

  if (enabled) {
    var s = document.createElement('script');
    s.async = true;
    s.src = '//gc.zgo.at/count.js';
    s.dataset.goatcounter = 'https://' + cfg.goatcounter + '.goatcounter.com/count';
    document.head.appendChild(s);
  }

  // イベント送信（例: sdTrack('cta-click')）。閲覧ページとは別に集計される
  window.sdTrack = function (name) {
    if (enabled && window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: name, title: name, event: true });
    } else if (!enabled && window.console) {
      console.debug('[track]', name);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    // クリック計測（セレクタ → イベント名）
    var MAP = [
      ['.dlink', function (el) { return 'demo-detail-' + (new URL(el.href, location.href).searchParams.get('t') || 'x'); }],
      ['a[href="#cta"]', function () { return 'cta-jump'; }],
      ['a[href^="mailto:"]', function () { return 'mail-click'; }],
      ['a[href^="tel:"]', function () { return 'tel-click'; }],
      ['#lineBtn', function () { return 'line-click'; }],
      ['#pdfDl, a[href$="company-profile.pdf"]', function () { return 'pdf-download'; }],
      ['.share-demo, .sbtn', function () { return 'share-click'; }],
      ['.fav', function (el) { return 'fav-' + el.dataset.id; }]
    ];
    document.addEventListener('click', function (e) {
      for (var i = 0; i < MAP.length; i++) {
        var el = e.target.closest(MAP[i][0]);
        if (el) { window.sdTrack(MAP[i][1](el)); return; }
      }
    }, { passive: true });

    // スクロール深度（25/50/75/100% 各1回）
    var marks = [25, 50, 75, 100], fired = {};
    var onScroll = function () {
      var h = document.documentElement;
      var pct = Math.round((h.scrollTop + h.clientHeight) / h.scrollHeight * 100);
      marks.forEach(function (m) {
        if (pct >= m && !fired[m]) { fired[m] = 1; window.sdTrack('scroll-' + m); }
      });
      if (fired[100]) window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  });
})();
