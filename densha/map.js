/* ============================================================
   でんしゃすごろく — 全体マップ（すごろくの盤面）
   ・実際の緯度経度で並べる。方角は現実どおり
   ・都心は駅が密集して潰れるので、中心からの距離を ^0.62 で
     引き伸ばす（魚眼）。実際の路線図も同じことをしている
   ・同じ区間を複数の路線が走るところは、垂直方向にずらして並べる
   ・「いま乗っている路線」だけ濃く太く、ほかは薄く描く
   ============================================================ */

const MAP = (() => {
  const LAT0 = 35.6905, LON0 = 139.7385;      /* 山手線のだいたいの中心 */
  const KX = Math.cos(LAT0 * Math.PI / 180);
  const FISH = 0.55;                           /* 魚眼の強さ（1で無変形） */
  const SPREAD = 760;                          /* 世界座標の広さ */
  const GAP = 5.2;                             /* 並走する路線をずらす幅 */

  const W = {};            /* 駅ID -> 世界座標 {x,y} */
  let BB = null;           /* 全体の外接矩形 */
  let EDGES = [];          /* {a,b,lines[]} */
  const EIDX = new Map();  /* "a~b" -> edge */

  const ekey = (a, b) => a < b ? a + '~' + b : b + '~' + a;

  function build() {
    const rawp = {}; let rmax = 0;
    for (const sid in POS) {
      const p = { x: (POS[sid][1] - LON0) * KX, y: -(POS[sid][0] - LAT0) };
      rawp[sid] = p; rmax = Math.max(rmax, Math.hypot(p.x, p.y));
    }
    const sc = SPREAD / rmax;
    for (const sid in rawp) {
      const p = rawp[sid], r = Math.hypot(p.x, p.y);
      const k = r < 1e-9 ? 0 : (rmax * Math.pow(r / rmax, FISH)) / r;
      W[sid] = { x: p.x * k * sc, y: p.y * k * sc };
    }
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const sid in W) {
      x0 = Math.min(x0, W[sid].x); x1 = Math.max(x1, W[sid].x);
      y0 = Math.min(y0, W[sid].y); y1 = Math.max(y1, W[sid].y);
    }
    BB = { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };

    const m = new Map();
    for (const id in LINES) {
      const st = LINES[id].stations;
      const n = LINES[id].loop ? st.length : st.length - 1;
      for (let i = 0; i < n; i++) {
        const a = st[i], b = st[(i + 1) % st.length];
        const k = ekey(a, b);
        if (!m.has(k)) m.set(k, { a: a < b ? a : b, b: a < b ? b : a, lines: [] });
        const e = m.get(k);
        if (e.lines.indexOf(id) < 0) e.lines.push(id);
      }
    }
    EDGES = [...m.values()];
    EDGES.forEach(e => EIDX.set(ekey(e.a, e.b), e));
  }

  /* 路線 id の a→b 区間を、並走ぶんだけ垂直にずらした両端を返す */
  function seg(a, b, lineId) {
    const e = EIDX.get(ekey(a, b));
    const pa = W[e.a], pb = W[e.b];
    const dx = pb.x - pa.x, dy = pb.y - pa.y, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const i = e.lines.indexOf(lineId), n = e.lines.length;
    const off = (i - (n - 1) / 2) * GAP;
    return { x1: pa.x + nx * off, y1: pa.y + ny * off, x2: pb.x + nx * off, y2: pb.y + ny * off };
  }

  return { W, seg, build, get BB() { return BB; }, get EDGES() { return EDGES; } };
})();
MAP.build();

/* ============================================================
   表示（パン・ズーム・追従）
   ============================================================ */
const MapView = {
  k: 2.2, tx: 0, ty: 0, follow: true, vbh: 620, u: 2.4, el: null, ready: false,

  init(el) {
    this.el = el;
    el.innerHTML =
      '<g id="mp-geo"></g><g id="mp-trail"></g><g id="mp-prev"></g>' +
      '<g id="mp-lab"></g><g id="mp-mark"></g><g id="mp-train"></g>';
    this.geo = el.querySelector('#mp-geo');
    this.trail = el.querySelector('#mp-trail');
    this.prev = el.querySelector('#mp-prev');
    this.lab = el.querySelector('#mp-lab');
    this.mark = el.querySelector('#mp-mark');
    this.train = el.querySelector('#mp-train');
    this.drawGeometry();
    this.bindGestures();
    this.ready = true;
  },

  resize() {
    const r = this.el.getBoundingClientRect();
    if (!r.width) return;
    this.vbh = Math.round(1000 * r.height / r.width);
    /* u = 1px が view 座標で何単位か。文字やコマはこれを掛けて実寸を保つ */
    this.u = 1000 / r.width;
    this.el.setAttribute('viewBox', `0 0 1000 ${this.vbh}`);
  },

  /* 路線と駅を1回だけ描く。色の濃淡はあとからクラスで切り替える */
  drawGeometry() {
    let h = '';
    for (const e of MAP.EDGES) {
      for (const id of e.lines) {
        const s = MAP.seg(e.a, e.b, id);
        h += `<line class="ml" data-l="${id}" x1="${s.x1.toFixed(1)}" y1="${s.y1.toFixed(1)}"
          x2="${s.x2.toFixed(1)}" y2="${s.y2.toFixed(1)}" stroke="${LINES[id].color}"/>`;
      }
    }
    for (const sid in MAP.W) {
      const p = MAP.W[sid], n = S[sid].lines.length;
      h += `<circle class="ms${n > 1 ? ' hub' : ''}" data-s="${sid}"
        cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${n > 1 ? 5.6 : 3.4}"/>`;
    }
    this.geo.innerHTML = h;
    this.lines = {};
    this.geo.querySelectorAll('.ml').forEach(n => {
      (this.lines[n.dataset.l] || (this.lines[n.dataset.l] = [])).push(n);
    });
    this.dots = {};
    this.geo.querySelectorAll('.ms').forEach(n => { this.dots[n.dataset.s] = n; });
  },

  sx(w) { return w.x * this.k + this.tx; },
  sy(w) { return w.y * this.k + this.ty; },

  /* 上に「乗っている電車」のバーが重なるので、その分だけ中心を下げる */
  get midY() { return (200 + this.vbh) / 2; },

  centerOn(sid, k) {
    if (k) this.k = k;
    const p = MAP.W[sid];
    this.tx = 500 - p.x * this.k;
    this.ty = this.midY - p.y * this.k;
  },

  /* 現在地と目的地が両方入るように収める */
  frame(a, b) {
    const pa = MAP.W[a], pb = MAP.W[b] || pa;
    const cx = (pa.x + pb.x) / 2, cy = (pa.y + pb.y) / 2;
    const dx = Math.abs(pa.x - pb.x), dy = Math.abs(pa.y - pb.y);
    const kx = 700 / Math.max(dx, 150), ky = (this.vbh - 300) / Math.max(dy, 150);
    this.k = Math.max(0.9, Math.min(3.0, Math.min(kx, ky)));
    this.tx = 500 - cx * this.k;
    this.ty = this.midY - cy * this.k;
  },

  fitAll() {
    const b = MAP.BB;
    this.k = Math.min(870 / b.w, (this.vbh - 250) / b.h);
    this.tx = 500 - (b.x0 + b.w / 2) * this.k;
    this.ty = this.midY - (b.y0 + b.h / 2) * this.k;
    this.follow = false;
  },

  clampK() { this.k = Math.max(0.55, Math.min(7, this.k)); },

  apply() {
    this.geo.setAttribute('transform', `translate(${this.tx.toFixed(2)},${this.ty.toFixed(2)}) scale(${this.k.toFixed(4)})`);
    /* 線の太さと駅の大きさは、ズームしても見た目が一定になるようにする */
    const lw = (6.2 * this.u / this.k).toFixed(2), lwd = (4.4 * this.u / this.k).toFixed(2);
    this.el.classList.toggle('zl', this.k < 1.5);
    this.geo.style.setProperty('--lw', lw);
    this.geo.style.setProperty('--lwd', lwd);
    this.geo.style.setProperty('--dr', (this.u / this.k).toFixed(3));
    /* アニメーション中は毎フレーム文字を作り直すと重いので間引く */
    if (this._anim && (this._f = (this._f || 0) + 1) % 3) return;
    this.drawOverlay();
  },

  /* 文字とコマは、ズームしても大きさが変わらないように画面座標で描く。
     ラベルは重なると読めなくなるので、優先度の高い順に置いて、
     ぶつかるものは捨てる（ぶつからない位置を4方向ためす） */
  drawOverlay() {
    if (!G) return;
    const goals = G.m.goals.slice(G.goalIdx);
    const cur = G.at;
    const onLine = {};
    LINES[G.line].stations.forEach(s => onLine[s] = 1);
    const th = this.k < 1.15 ? 12 : this.k < 1.9 ? 6 : this.k < 3.2 ? 2.5 : 0;
    const U = this.u;

    const cands = [];
    let mk = '';
    for (const sid of Object.keys(MAP.W)) {
      const p = MAP.W[sid], x = this.sx(p), y = this.sy(p);
      if (x < -40 || x > 1040 || y < -30 || y > this.vbh + 30) continue;
      const gi = goals.indexOf(sid);
      const isCur = sid === cur, owned = !!G.stamps[sid];
      if (owned) mk += `<text class="stamp" font-size="${(11 * U).toFixed(1)}" x="${x.toFixed(1)}" y="${(y + 9 * U).toFixed(1)}">${stampOf(sid).emoji}</text>`;
      if (gi >= 0) {
        mk += `<circle class="gring${gi === 0 ? ' now' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}"
                 r="${(6.5 * U).toFixed(1)}" stroke-width="${(2 * U).toFixed(1)}"/>` +
              `<text class="gflag" font-size="${(13 * U).toFixed(1)}" x="${x.toFixed(1)}" y="${(y + 2.5 * U).toFixed(1)}">${gi === 0 ? '🚩' : '📍'}</text>`;
      }
      const prio = isCur ? 100 : gi === 0 ? 95 : gi > 0 ? 90 : owned ? 80
        : (S[sid].pax >= th || (this.k >= 2.2 && onLine[sid])) ? S[sid].pax : -1;
      if (prio >= 0) cands.push({ sid, x, y, prio, isCur, gi, owned,
        t: nmText(sid), fs: (isCur ? 14.5 : gi >= 0 ? 13 : 11.5) * U });
    }
    cands.sort((a, b) => b.prio - a.prio);

    /* 置ける場所を探す。現在地は下、それ以外は上→下→右→左 の順 */
    const boxes = [], MAXL = Math.round(20 * 2.4 / U);
    let lab = '', placed = 0;
    for (const c of cands) {
      if (placed >= MAXL) break;
      const w = c.t.length * c.fs * 1.02, h = c.fs;
      const tries = c.isCur
        ? [[0, h + 7 * U, 'middle'], [0, -7 * U, 'middle']]
        : [[0, -6 * U, 'middle'], [0, h + 5 * U, 'middle'], [6 * U, h * 0.34, 'start'], [-6 * U, h * 0.34, 'end']];
      for (const [dx, dy, an] of tries) {
        const bx = an === 'middle' ? c.x + dx - w / 2 : an === 'start' ? c.x + dx : c.x + dx - w;
        const box = { x0: bx - 2.5 * U, y0: c.y + dy - h * 0.92, x1: bx + w + 2.5 * U, y1: c.y + dy + h * 0.28 };
        if (box.x0 < -30 || box.x1 > 1030) continue;
        if (boxes.some(o => !(box.x1 < o.x0 || box.x0 > o.x1 || box.y1 < o.y0 || box.y0 > o.y1))) continue;
        const cls = c.isCur ? 'lb here' : c.gi >= 0 ? 'lb goal' : c.owned ? 'lb own' : 'lb';
        lab += `<text class="${cls}" text-anchor="${an}" font-size="${c.fs}"
          x="${(c.x + dx).toFixed(1)}" y="${(c.y + dy).toFixed(1)}">${esc(c.t)}</text>`;
        boxes.push(box); placed++;
        break;
      }
    }

    this.lab.innerHTML = lab;
    this.mark.innerHTML = mk;
    this.drawTrain();
    this.drawTrail();
    this.drawPreview();
  },

  /* 選んだ電車がどこまで行くかを、走る前に見せる。
     「これに乗ったらここまで行く」が先に分かると、子供が考えられる */
  preview(sids) {
    this._prev = sids && sids.length > 1 ? sids : null;
    this.drawPreview();
  },
  drawPreview() {
    if (!this._prev) { if (this.prev) this.prev.innerHTML = ''; return; }
    let h = '';
    for (let i = 0; i < this._prev.length - 1; i++) {
      const a = MAP.W[this._prev[i]], b = MAP.W[this._prev[i + 1]];
      if (!a || !b) continue;
      h += `<line class="pvl" x1="${this.sx(a).toFixed(1)}" y1="${this.sy(a).toFixed(1)}"
        x2="${this.sx(b).toFixed(1)}" y2="${this.sy(b).toFixed(1)}"
        stroke-width="${(7 * this.u).toFixed(1)}"/>`;
    }
    const e = MAP.W[this._prev[this._prev.length - 1]];
    if (e) h += `<circle class="pve" cx="${this.sx(e).toFixed(1)}" cy="${this.sy(e).toFixed(1)}"
      r="${(9 * this.u).toFixed(1)}" stroke-width="${(2.6 * this.u).toFixed(1)}"/>`;
    this.prev.innerHTML = h;
  },

  /* 走ったところを濃く残す。どこを通ってきたかが後から見える */
  drawTrail() {
    if (!G || !G.trail || !G.trail.size) { this.trail.innerHTML = ''; return; }
    let h = '';
    for (const k of G.trail) {
      const [a, b] = k.split('~');
      if (!MAP.W[a] || !MAP.W[b]) continue;
      const pa = MAP.W[a], pb = MAP.W[b];
      h += `<line class="trl" x1="${this.sx(pa).toFixed(1)}" y1="${this.sy(pa).toFixed(1)}"
        x2="${this.sx(pb).toFixed(1)}" y2="${this.sy(pb).toFixed(1)}"
        stroke-width="${(3.5 * this.u).toFixed(1)}"/>`;
    }
    this.trail.innerHTML = h;
  },

  /* コマだけを描く（走行中は毎フレームこれだけ呼ぶので軽い） */
  drawTrain(worldPos) {
    if (!G) return;
    const U = this.u;
    const p = worldPos || MAP.W[G.at];
    if (!p) return;
    const x = this.sx(p), y = this.sy(p);
    this.train.innerHTML =
      `<circle class="mering" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(5.5 * U).toFixed(1)}"
         fill="#fff" stroke="${LINES[G.line].color}" stroke-width="${(3 * U).toFixed(1)}"/>` +
      `<text class="me" font-size="${(19 * U).toFixed(1)}" x="${x.toFixed(1)}" y="${(y - 7 * U).toFixed(1)}">🚃</text>`;
  },

  /* 1区間ぶん、線路の上をなめらかに走らせる */
  runSegment(fromSid, toSid, ms, done) {
    const a = MAP.W[fromSid], b = MAP.W[toSid];
    if (!a || !b) { done && done(); return; }
    const t0 = performance.now();
    const tick = now => {
      const u = Math.min(1, (now - t0) / ms);
      const e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;   /* ゆっくり発車・ゆっくり停車 */
      this.drawTrain({ x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e });
      if (u < 1) requestAnimationFrame(tick); else done && done();
    };
    requestAnimationFrame(tick);
  },

  /* これから走る区間ぜんぶが画面に入るように寄せる */
  frameRun(sids) {
    if (!sids.length) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of sids) {
      const p = MAP.W[s]; if (!p) continue;
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
      y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    }
    const pad = 130 / Math.max(this.k, .001);
    const w = (x1 - x0) + pad * 2, h = (y1 - y0) + pad * 2;
    const need = Math.min(760 / Math.max(w, 1), (this.vbh - 300) / Math.max(h, 1));
    this.k = Math.max(0.8, Math.min(3.4, need));
    this.tx = 500 - ((x0 + x1) / 2) * this.k;
    this.ty = this.midY - ((y0 + y1) / 2) * this.k;
    this.apply();
  },

  /* 乗っている路線だけ濃く */
  highlight(lineId) {
    for (const id in this.lines) {
      const on = id === lineId;
      for (const n of this.lines[id]) n.classList.toggle('dim', !on);
    }
    for (const sid in this.dots) {
      this.dots[sid].classList.toggle('on', S[sid].lines.indexOf(lineId) >= 0);
    }
    /* 乗っている路線を最前面に */
    if (this.lines[lineId]) this.lines[lineId].forEach(n => this.geo.appendChild(n));
    this.geo.querySelectorAll('.ms').forEach(n => this.geo.appendChild(n));
  },

  render(animate) {
    if (!this.ready) return;
    this.resize();
    this.highlight(G.line);
    if (this.follow) {
      const target = { k: this.k, tx: 0, ty: 0 };
      const save = { k: this.k, tx: this.tx, ty: this.ty };
      this.frame(G.at, G.m.goals[G.goalIdx]);
      target.k = this.k; target.tx = this.tx; target.ty = this.ty;
      if (animate && (Math.abs(save.tx - target.tx) > 1 || Math.abs(save.ty - target.ty) > 1)) {
        this.k = save.k; this.tx = save.tx; this.ty = save.ty;
        this.animateTo(target);
        return;
      }
    }
    this.apply();
  },

  animateTo(t) {
    const s = { k: this.k, tx: this.tx, ty: this.ty }, t0 = performance.now(), D = 420;
    const ease = u => 1 - Math.pow(1 - u, 3);
    this._anim = true;
    const tick = now => {
      const u = Math.min(1, (now - t0) / D), e = ease(u);
      if (u >= 1) this._anim = false;
      this.k = s.k + (t.k - s.k) * e;
      this.tx = s.tx + (t.tx - s.tx) * e;
      this.ty = s.ty + (t.ty - s.ty) * e;
      this.apply();
      if (u < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  bindGestures() {
    const el = this.el;
    const pts = new Map();
    let start = null;
    const toVB = e => {
      const r = el.getBoundingClientRect();
      return { x: (e.clientX - r.left) * 1000 / r.width, y: (e.clientY - r.top) * 1000 / r.width };
    };
    el.addEventListener('pointerdown', e => {
      el.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, toVB(e));
      start = null;
    });
    el.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      const now = toVB(e);
      const all = [...pts.keys()];
      if (all.length === 1) {
        const prev = pts.get(e.pointerId);
        this.tx += now.x - prev.x; this.ty += now.y - prev.y;
        this.follow = false; pts.set(e.pointerId, now); this.apply();
      } else if (all.length >= 2) {
        const a = pts.get(all[0]), b = pts.get(all[1]);
        pts.set(e.pointerId, now);
        const a2 = pts.get(all[0]), b2 = pts.get(all[1]);
        const d0 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const d1 = Math.hypot(a2.x - b2.x, a2.y - b2.y) || 1;
        const mx = (a2.x + b2.x) / 2, my = (a2.y + b2.y) / 2;
        const f = d1 / d0, k0 = this.k;
        this.k *= f; this.clampK();
        const f2 = this.k / k0;
        this.tx = mx - (mx - this.tx) * f2;
        this.ty = my - (my - this.ty) * f2;
        this.follow = false; this.apply();
      }
    });
    const up = e => { pts.delete(e.pointerId); };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', e => {
      e.preventDefault();
      const m = toVB(e), k0 = this.k;
      this.k *= e.deltaY < 0 ? 1.12 : 1 / 1.12; this.clampK();
      const f = this.k / k0;
      this.tx = m.x - (m.x - this.tx) * f;
      this.ty = m.y - (m.y - this.ty) * f;
      this.follow = false; this.apply();
    }, { passive: false });
  },

  zoom(f) {
    const k0 = this.k; this.k *= f; this.clampK();
    const g = this.k / k0;
    this.tx = 500 - (500 - this.tx) * g;
    this.ty = this.vbh / 2 - (this.vbh / 2 - this.ty) * g;
    this.follow = false; this.apply();
  }
};
