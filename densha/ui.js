/* ============================================================
   でんしゃすごろく — UI と ゲーム進行
   ============================================================ */
'use strict';

/* ---------------- 保存 ---------------- */
const LS = 'densha-sugoroku-v1';
const save = Object.assign(
  { cards: [], best: {}, adult: false, voice: true, sound: true, hint: true },
  (() => { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } })()
);
function persist() { try { localStorage.setItem(LS, JSON.stringify(save)); } catch (e) {} }
function applyAdult() { document.body.classList.toggle('adult', !!save.adult); }

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/* 漢字とかなを併記して、おとなモードで切り替える */
const nm = sid => `<span class="kj">${esc(S[sid].kanji)}</span><span class="kn">${esc(S[sid].kana)}</span>`;
const nmText = sid => save.adult ? S[sid].kanji : S[sid].kana;
const lnText = l => save.adult ? LINES[l].name : LINES[l].kana;
const svText = (l, v) => { const s = svOf(l, v); return save.adult ? s.name : s.kana; };

/* ---------------- 音 ---------------- */
let AC = null;
function ac() {
  if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (C) AC = new C(); }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f, t0, dur, type, vol) {
  if (!save.sound) return;
  const c = ac(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type || 'triangle'; o.frequency.value = f;
  const t = c.currentTime + t0;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol == null ? .18 : vol, t + .012);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .02);
}
const sfx = {
  dice() { [0, .07, .14, .21].forEach((d, i) => tone(520 + i * 130, d, .09, 'square', .1)); },
  depart() { tone(784, 0, .16, 'triangle'); tone(1046, .13, .3, 'triangle'); },
  arrive() { tone(880, 0, .12); tone(659, .1, .22); },
  transfer() { tone(587, 0, .1, 'sine', .14); tone(880, .08, .16, 'sine', .14); },
  coin() { tone(1318, 0, .07, 'square', .1); tone(1760, .06, .14, 'square', .1); },
  goal() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * .1, .34, 'triangle', .16)); },
  ng() { tone(330, 0, .16, 'sawtooth', .1); tone(247, .14, .26, 'sawtooth', .1); }
};

/* ---------------- 読み上げ ---------------- */
let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) {} }
if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function speak(text) {
  if (!save.voice || !window.speechSynthesis || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = .95; u.pitch = 1.05;
    const v = voices.find(v => /ja/i.test(v.lang)); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------------- 車両の絵（正面） ---------------- */
let svgSeq = 0;
function trainSVG(t) {
  const id = 'clp' + (++svgSeq);
  const b = t.band || [];
  let bands = '';
  if (b[0]) bands += `<rect x="34" y="79" width="132" height="10" fill="${b[0]}"/>`;
  if (b[1]) bands += `<rect x="34" y="91" width="132" height="6" fill="${b[1]}"/>`;
  return `<svg viewBox="0 0 200 120" role="img" aria-label="${esc(t.name)}">
  <defs><clipPath id="${id}"><rect x="34" y="8" width="132" height="104" rx="20"/></clipPath></defs>
  <rect x="48" y="103" width="104" height="9" rx="3" fill="#2a323c"/>
  <rect x="34" y="8" width="132" height="104" rx="20" fill="${t.body}"/>
  <g clip-path="url(#${id})">${bands}</g>
  <rect x="34" y="8" width="132" height="104" rx="20" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="2"/>
  <rect x="72" y="13" width="56" height="12" rx="3" fill="#101720"/>
  <rect x="76" y="16" width="48" height="6" rx="2" fill="#ffc23a" opacity=".82"/>
  <rect x="46" y="30" width="108" height="45" rx="12" fill="${t.face}"/>
  <rect x="54" y="36" width="44" height="33" rx="7" fill="#bfe0f2"/>
  <rect x="102" y="36" width="44" height="33" rx="7" fill="#bfe0f2"/>
  <circle cx="58" cy="99" r="6.5" fill="#ffd640"/><circle cx="142" cy="99" r="6.5" fill="#ffd640"/>
  <rect x="94" y="100" width="12" height="8" rx="2" fill="#39414c"/>
</svg>`;
}
function trainForLine(lineId, svCls) {
  const pool = TRAINS.filter(t => t.lines.indexOf(lineId) >= 0);
  /* 特急のときは 特急用の車両（ロマンスカーなど）を出す */
  const want = svCls === 'ltd';
  const m = pool.filter(t => !!t.ltd === want);
  return (m.length ? m : pool)[0] || TRAINS[0];
}

/* ---------------- 画面切り替え ---------------- */
const SCREENS = ['screen-title', 'screen-select', 'screen-game', 'screen-book'];
function show(id) {
  SCREENS.forEach(s => $(s).classList.toggle('hide', s !== id));
  window.scrollTo(0, 0);
}

/* ---------------- モーダル ---------------- */
let modalOpen = false;
function modal(html, acts) {
  closeModal();
  modalOpen = true;
  const mask = document.createElement('div');
  mask.className = 'mask';
  mask.innerHTML = `<div class="sheet">${html}<div id="m-acts"></div></div>`;
  $('modal-root').appendChild(mask);
  const box = mask.querySelector('#m-acts');
  (acts || []).forEach(a => {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.pri ? 'pri' : '');
    b.innerHTML = a.label;
    b.onclick = () => { closeModal(); if (a.fn) a.fn(); };
    box.appendChild(b);
  });
  return mask;
}
function closeModal() { $('modal-root').innerHTML = ''; modalOpen = false; }

/* ============================================================
   ゲーム状態
   ============================================================ */
let G = null;

function startMission(m) {
  /* スタート駅では「最初の目的地に いちばん近づく向き」の電車に乗る */
  const first = firstBoard(m.from, m.goals[0]);
  G = {
    m, at: m.from, line: first.lineId, sv: first.svId, dir: first.dir,
    turn: 1, pips: null, rolled: false, coins: 60, stamps: {}, goalIdx: 0,
    freeBoard: true, moves: 0, transfers: 0, gotCards: [], busy: false, over: false
  };
  show('screen-game');
  renderGame();
  speak('しゅっぱつ。' + S[m.from].kana + 'えきから、' + S[m.goals[0]].kana + 'を めざそう。');
}

const curGoal = () => G.m.goals[G.goalIdx];
/* 遷移のあいだは操作を受け付けない。4歳は必ず連打するので、
   ここを開けておくと 1回のサイコロで二重に動いてしまう */
function lock(ms, fn) {
  G.busy = true; renderDock();
  setTimeout(() => { if (!G) return; G.busy = false; fn(); }, ms);
}
const blocked = () => !G || G.busy || G.over || modalOpen;
const turnsLeft = () => G.m.turns - G.turn + 1;

/* ---------------- 描画 ---------------- */
function renderGame() {
  const L = LINES[G.line], sv = svOf(G.line, G.sv);

  $('g-goal').innerHTML = nm(curGoal());
  $('g-turn').textContent = turnsLeft();
  $('g-coin').textContent = G.coins;
  $('g-chips').innerHTML = G.m.goals.map((g, i) =>
    `<div class="gchip ${i < G.goalIdx ? 'done' : i === G.goalIdx ? 'now' : ''}"></div>`).join('');

  /* 乗っている電車 */
  const t = trainForLine(G.line, sv.cls);
  $('g-tsvg').outerHTML = `<svg class="tsvg" viewBox="0 0 200 120" id="g-tsvg">${trainSVG(t).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
  $('g-lcolor').style.background = L.color;
  $('g-lname').textContent = lnText(G.line);
  $('g-led').innerHTML = `<span class="svbadge sv-${sv.cls}">${esc(svText(G.line, G.sv))}</span>` +
    esc((save.adult ? terminusOf(G.line, G.sv, G.dir) : terminusKana(G.line, G.sv, G.dir)) + ' ゆき');
  $('g-here').innerHTML = 'いま ' + nm(G.at) + (step(G.line, G.sv, G.at, G.dir) ? '' : ' ・しゅうてん');

  renderStrip();
  renderTransfers();
  renderDock();
}

function stripIndices(len, i, dir, back, fwd, loop) {
  const out = [];
  for (let k = -back; k <= fwd; k++) {
    let j = i + k * dir;
    if (loop) j = ((j % len) + len) % len;
    else if (j < 0 || j >= len) continue;
    out.push(j);
  }
  return out;
}

function renderStrip() {
  const L = LINES[G.line], sv = svOf(G.line, G.sv);
  const stops = stopsOf(G.line, G.sv);
  const i = stops.indexOf(G.at);
  const idx = stripIndices(stops.length, i, G.dir, 6, 15, L.loop);
  const track = $('g-track');
  track.style.setProperty('--c', L.color);

  let html = '';
  idx.forEach((j, k) => {
    /* 前の停車駅との間の通過駅を描く */
    if (k > 0) {
      const p = L.stations.indexOf(stops[idx[k - 1]]), q = L.stations.indexOf(stops[j]);
      const d = Math.abs(p - q);
      if (d > 1 && (!L.loop || d < L.stations.length / 2)) {
        const seg = L.stations.slice(Math.min(p, q) + 1, Math.max(p, q));
        (p < q ? seg : seg.slice().reverse()).forEach(sid => {
          html += `<div class="node skip"><i class="dot"></i><span class="nm">${nm(sid)}</span></div>`;
        });
      }
    }
    const sid = stops[j];
    const cls = ['node', 'stop'];
    if (sid === G.at) cls.push('here');
    if (G.m.goals.indexOf(sid) >= 0 && G.m.goals.indexOf(sid) >= G.goalIdx) cls.push('goal');
    if (G.stamps[sid]) cls.push('owned');
    const xf = S[sid].lines.filter(x => x !== G.line)
      .map(x => `<i style="background:${LINES[x].color}" title="${esc(LINES[x].name)}"></i>`).join('');
    html += `<div class="node ${cls.join(' ')}" data-sid="${sid}">` +
      (sid === G.at ? '<span class="me">🚃</span>' : '') +
      `<i class="dot"></i><span class="nm">${nm(sid)}</span><div class="xf">${xf}</div></div>`;
  });
  track.innerHTML = html;
  $('g-striplbl').innerHTML = save.adult
    ? `${esc(sv.name)}の停車駅（小さい点＝通過）`
    : 'この でんしゃが とまる えき（ちいさい てん＝とおる だけ）';

  /* 現在地が左から 32% くらいに来るようにスクロール */
  const here = track.querySelector('.here');
  const strip = $('g-strip');
  if (here) strip.scrollLeft = Math.max(0, here.offsetLeft - strip.clientWidth * .32);

  /* 駅をタップしたら、その駅の説明を出す */
  track.querySelectorAll('.node').forEach(n => {
    n.onclick = () => stationInfo(n.dataset.sid || n.querySelector('.nm').textContent);
  });
}

function stationInfo(sid) {
  if (!S[sid]) return;
  const s = S[sid];
  speak(s.kana + 'えき');
  const lines = s.lines.map(l =>
    `<div class="lr"><span><i style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${LINES[l].color};vertical-align:-1px;margin-right:6px"></i>${esc(lnText(l))}</span>
     <b>${LINES[l].services.map(v => esc(save.adult ? v.name : v.kana)).join(' / ')}</b></div>`).join('');
  modal(
    `<div class="em">🚉</div><h3>${nm(sid)}</h3>
     <p>${esc(s.fun || 'この えきに とまる でんしゃ')}</p>
     <div class="ledger">${lines}
       <div class="lr tot"><span>${save.adult ? 'スタンプ代 / 決算' : 'スタンプの ねだん'}</span>
       <b>${stampPrice(sid)} <span style="font-weight:700;color:var(--sub)">→ ${stampIncome(sid)}／かい</span></b></div>
       ${save.adult ? `<div class="lr"><span>1日の乗車人員（概算）</span><b>約${s.pax}万人</b></div>` : ''}
     </div>`,
    [{ label: 'とじる', pri: true }]);
}

/* いまの状態から つぎの目的地への最適な一手 */
function plan() {
  if (!G || G.goalIdx >= G.m.goals.length) return null;
  const k = [G.at, G.line, G.sv, G.dir, curGoal(), G.freeBoard].join('|');
  if (G._pk === k) return G._plan;
  G._pk = k; G._plan = planFrom(G.at, G.line, G.sv, G.dir, curGoal(), G.freeBoard);
  return G._plan;
}
function sameOpt(a, b) {
  return a && b && a.lineId === b.lineId && a.svId === b.svId && a.dir === b.dir;
}
function hintText(p) {
  if (!p || !p.first) return save.adult ? 'もう着いています。' : 'もう ついてるよ！';
  if (p.pips === Infinity) return save.adult ? 'この電車からは行けません。乗り換えてみて。' : 'この でんしゃでは いけないよ。のりかえてみよう';
  const rest = save.adult ? `あと ${p.pips} 目で ${S[curGoal()].kanji} に着きます。` : `あと ${p.pips}かいで ${S[curGoal()].kana} に つくよ。`;
  if (p.first.kind === 'step') {
    const nx = step(G.line, G.sv, G.at, G.dir);
    return (save.adult ? `この電車のまま ${S[nx].kanji} へ進もう。` : `この でんしゃの まま ${S[nx].kana} へ すすもう。`) + rest;
  }
  const o = p.first.opt;
  const d = save.adult ? terminusOf(o.lineId, o.svId, o.dir) : terminusKana(o.lineId, o.svId, o.dir);
  return (save.adult ? `${LINES[o.lineId].name} の ${svOf(o.lineId, o.svId).name}（${d}ゆき）に乗り換えよう。` :
    `${lnText(o.lineId)} の ${svText(o.lineId, o.svId)}、${d}ゆきに のりかえよう。`) + rest;
}
function showHint() {
  const p = plan();
  const t = hintText(p);
  speak(t);
  modal(`<div class="em">💡</div><h3>${save.adult ? 'ヒント' : 'どうすれば いい？'}</h3><p>${esc(t)}</p>` +
    (G.m.hint ? `<div class="ledger"><div class="lr"><span>${save.adult ? 'このおでかけのコツ' : 'コツ'}</span></div><div class="lr"><b style="font-weight:700">${esc(G.m.hint)}</b></div></div>` : ''),
    [{ label: 'わかった', pri: true }]);
}

function renderTransfers() {
  const opts = boardOptions(G.at, G.line, G.sv, G.dir);
  const p = save.hint ? plan() : null;
  const bestOpt = p && p.first && p.first.kind === 'board' ? p.first.opt : null;
  const box = $('g-xlist');
  const usable = G.pips != null && G.pips > 0;
  $('g-xhead').innerHTML = usable
    ? (save.adult ? 'この駅で乗り換えられる電車' : 'ここで のりかえられる でんしゃ')
    : (save.adult ? 'この駅で乗り換えられる電車（サイコロを振ってから）' : 'サイコロを ふったら のりかえできる');
  if (!opts.length) {
    box.innerHTML = `<div class="card" style="color:var(--sub);font-size:14px">${save.adult
      ? 'この駅で乗り換えられる電車はありません。' : 'この えきで のりかえられる でんしゃは ないよ'}</div>`;
    return;
  }

  /* 同じ路線・同じ向きは 1つにまとめ、種別はチップで選ばせる。
     赤羽のような駅では候補が20件を超えるので、まとめないと子供には読めない */
  const gm = new Map();
  opts.forEach((o, i) => {
    const k = o.lineId + '|' + o.dir;
    if (!gm.has(k)) gm.set(k, { lineId: o.lineId, dir: o.dir, cost: o.cost, through: o.through, svs: [] });
    const g = gm.get(k);
    g.svs.push({ o, i });
    g.cost = Math.min(g.cost, o.cost);
  });
  const groups = [...gm.values()];
  groups.forEach(g => {
    g.svs.sort((x, y) => SVRANK[svOf(x.o.lineId, x.o.svId).cls] - SVRANK[svOf(y.o.lineId, y.o.svId).cls]);
    const bi = g.svs.findIndex(x => sameOpt(x.o, bestOpt));
    g.best = bi >= 0;
    if (bi > 0) g.svs.unshift(g.svs.splice(bi, 1)[0]);   /* 💡 の種別を代表にする */
  });
  groups.sort((a, b) => (b.best - a.best) || (a.cost - b.cost)
    || ((a.lineId === G.line) - (b.lineId === G.line))
    || a.lineId.localeCompare(b.lineId) || a.dir - b.dir);

  const LIMIT = 6;
  const shown = G.showAllX ? groups : groups.slice(0, LIMIT);
  const cost = g => (G.freeBoard ? 0 : g.cost);
  const ok = g => usable && (cost(g) === 0 || G.pips >= cost(g));

  box.innerHTML = shown.map(g => {
    const L = LINES[g.lineId], head = g.svs[0];
    const dest = save.adult ? terminusOf(g.lineId, head.o.svId, g.dir) : terminusKana(g.lineId, head.o.svId, g.dir);
    const nx = step(g.lineId, head.o.svId, G.at, g.dir);
    const c = cost(g);
    return `<div class="xgroup${g.best ? ' best' : ''}" style="--c:${L.color}">
      <button class="xrow" data-o="${head.i}" ${ok(g) ? '' : 'disabled'}>
        <div class="xi">
          <div class="xl">${g.best ? '💡 ' : ''}${esc(lnText(g.lineId))}</div>
          <div class="xd">${esc(dest)} ゆき ・ つぎは ${nx ? esc(nmText(nx)) : '—'}</div>
        </div>
        <span class="xc ${c === 0 ? 'free' : ''}">${c === 0 ? (g.through ? 'ちょくつう 0' : '0') : 'サイコロ ' + c}</span>
      </button>
      <div class="xchips">${g.svs.map((x, k) => {
        const sv = svOf(x.o.lineId, x.o.svId);
        return `<button class="xchip ${k === 0 ? 'on sv-' + sv.cls : ''}" data-o="${x.i}" ${ok(g) ? '' : 'disabled'}>
          ${sameOpt(x.o, bestOpt) ? '<span class="hi">💡</span>' : ''}${esc(save.adult ? sv.name : sv.kana)}</button>`;
      }).join('')}</div>
    </div>`;
  }).join('') + (groups.length > LIMIT
    ? `<button class="xmore" id="x-more">${G.showAllX
        ? '▴ すこしだけ みる' : `▾ ほかの でんしゃも みる（のこり ${groups.length - LIMIT}）`}</button>`
    : '');

  box.querySelectorAll('[data-o]').forEach(b => { b.onclick = () => doBoard(opts[+b.dataset.o]); });
  const more = $('x-more');
  if (more) more.onclick = () => { G.showAllX = !G.showAllX; renderTransfers(); };
}

function renderDock() {
  const pipsBox = $('g-pips'), acts = $('g-actions');
  if (G.busy) {
    acts.innerHTML = `<button class="btn big" disabled>… はっしゃ！</button>`;
    return;
  }
  if (G.pips == null) {
    pipsBox.innerHTML = `<span class="lb">${save.adult ? `${G.m.turns - G.turn + 1} ターンのこり` : 'のこり ' + turnsLeft() + 'かい'}</span>`;
    acts.innerHTML = `<button class="btn pri big" id="a-roll"><span class="dice">🎲</span> サイコロを ふる</button>`;
    $('a-roll').onclick = roll;
    return;
  }
  let p = `<span class="lb">のこり</span>`;
  for (let k = 0; k < G.total; k++) p += `<i class="p ${k >= G.pips ? 'used' : ''}"></i>`;
  pipsBox.innerHTML = p;
  const nx = step(G.line, G.sv, G.at, G.dir);
  const stopBtn = `<button class="btn" id="a-stop" style="flex:0 0 116px">ここで<br>とまる</button>`;
  if (nx) {
    const p = save.hint ? plan() : null;
    const best = p && p.first && p.first.kind === 'step' ? ' best-step' : '';
    acts.innerHTML = `<button class="btn pri big${best}" id="a-step">▸ ${esc(nmText(nx))}</button>` + stopBtn;
    $('a-step').onclick = doStep;
  } else {
    /* 終点。ここから先は のりかえるしかないので、反対向きの電車を出す */
    const rev = boardOptions(G.at, G.line, G.sv, G.dir)
      .find(o => o.lineId === G.line && o.svId === G.sv && o.dir === -G.dir);
    if (rev && G.pips >= (G.freeBoard ? 0 : rev.cost)) {
      acts.innerHTML = `<button class="btn pri big" id="a-rev">🔄 はんたいむきの<br>でんしゃに のる</button>` + stopBtn;
      $('a-rev').onclick = () => doBoard(rev);
    } else {
      acts.innerHTML = `<button class="btn pri big" id="a-hint2">💡 どうすれば いい？</button>` + stopBtn;
      $('a-hint2').onclick = showHint;
    }
  }
  $('a-stop').onclick = () => { if (blocked()) return; G.pips = 0; endTurn(); };
}

/* ---------------- 操作 ---------------- */
function roll() {
  if (blocked() || G.pips != null) return;
  G.busy = true;
  const btn = $('a-roll'); const d = btn.querySelector('.dice');
  d.classList.add('rolling'); btn.disabled = true; sfx.dice();
  const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  let n = 0, tick = 0;
  const iv = setInterval(() => {
    n = 1 + Math.floor(Math.random() * 6);
    d.textContent = faces[n - 1];
    if (++tick > 9) {
      clearInterval(iv); d.classList.remove('rolling');
      G.busy = false; G.pips = n; G.total = n; G.rolled = true;
      speak(n + '');
      renderGame();
    }
  }, 70);
}

function doStep() {
  if (blocked() || G.pips == null || G.pips <= 0) return;
  const nx = step(G.line, G.sv, G.at, G.dir);
  if (!nx) return;
  G.pips--; G.moves++; G.at = nx; G.freeBoard = false;
  sfx.depart();
  renderGame();
  const isGoal = nx === curGoal();
  speak((isGoal ? 'とうちゃく。' : 'つぎは ') + S[nx].kana);
  if (isGoal) { lock(380, reachGoal); return; }
  if (G.pips === 0) lock(420, endTurn);
}

function doBoard(o) {
  if (blocked()) return;
  const cost = G.freeBoard ? 0 : o.cost;
  if (G.pips == null || (cost > 0 && G.pips < cost)) return;
  /* 直通の説明文は「いまの駅」で先に確定させる。あとで参照すると駅が変わっている */
  const thr = o.through
    ? THROUGH.find(t => t.at === G.at && (t.a === o.lineId || t.b === o.lineId)) : null;
  G.pips -= cost; if (cost > 0) G.transfers++;
  G.freeBoard = false;
  G.line = o.lineId; G.sv = o.svId; G.dir = o.dir; G.showAllX = false;
  sfx.transfer();
  renderGame();
  const sv = svOf(o.lineId, o.svId);
  speak(sv.kana + '、' + terminusKana(o.lineId, o.svId, o.dir) + 'ゆきに のりました');
  if (thr) {
    lock(260, () => modal(
      `<div class="em">🔗</div><h3>ちょくつう うんてん！</h3>
       <p>${esc(thr.note)}<br>
       ${save.adult ? '電車を降りないので、サイコロを使いません。' : 'でんしゃを おりないから サイコロは つかわないよ。'}</p>`,
      [{ label: 'わかった', pri: true, fn: () => { if (G.pips === 0) endTurn(); else renderGame(); } }]));
    return;
  }
  if (G.pips === 0) lock(420, endTurn);
}

/* ---------------- 目的地に着いた ---------------- */
function reachGoal() {
  const sid = curGoal();
  const bonus = goalBonus(sid);
  G.coins += bonus;
  sfx.goal();
  /* 到着した路線の車両カードをもらう（まだ持っていないものを優先） */
  const wantLtd = svOf(G.line, G.sv).cls === 'ltd';
  const all = TRAINS.filter(t => t.lines.indexOf(G.line) >= 0);
  const matched = all.filter(t => !!t.ltd === wantLtd);
  const pool = matched.length ? matched : all;
  const fresh = pool.filter(t => save.cards.indexOf(t.id) < 0);
  const card = (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length ? fresh.length : pool.length))];
  const isNew = card && save.cards.indexOf(card.id) < 0;
  if (card && isNew) { save.cards.push(card.id); persist(); }
  if (card) G.gotCards.push(card.id);

  G.goalIdx++;
  G.freeBoard = true;   /* 目的地で ひとやすみ → つぎの のりかえは 0 */
  const last = G.goalIdx >= G.m.goals.length;
  const joy = GOAL_JOY[sid] || 'とうちゃく！';
  speak(S[sid].kana + 'に とうちゃく。' + joy);

  modal(
    `<div class="em">🎉</div><h3>${nm(sid)} に とうちゃく！</h3>
     <p>${esc(joy)}</p>
     <div class="bignum">＋${bonus} <span style="font-size:20px">コイン</span></div>
     ${card ? `<div class="tcard" style="margin-top:14px">
        ${isNew ? '<div class="pill" style="background:#ffeec9;color:#a06a08;margin-bottom:6px">✨ あたらしい カード</div>' : ''}
        <div class="tsvg">${trainSVG(card)}</div>
        <div class="tn">${esc(save.adult ? card.name : card.kana)}</div>
        <div class="tk">${esc(save.adult ? card.kana : card.name)}</div>
        <div class="tnote">${esc(card.note)}</div>
      </div>` : ''}
     <p style="margin-top:12px">${last ? (save.adult ? '全部まわった！' : 'ぜんぶ まわれた！')
        : (save.adult ? 'つぎは ' + S[curGoal()].kanji + '。ここからは乗り換え 0 で乗れます。' : 'つぎは ' + S[curGoal()].kana + '。ここからの のりかえは ただ！')}</p>`,
    [{ label: last ? '🏁 けっか' : '▶ つぎへ', pri: true, fn: () => {
      if (last) finish(true);
      else if (G.pips === 0 || G.pips == null) endTurn();
      else renderGame();
    } }]);
}

/* ---------------- ターンおわり ---------------- */
function endTurn() {
  if (G.over) return;
  if (G.goalIdx >= G.m.goals.length) return finish(true);
  G.pips = null; G.rolled = false;
  const sid = G.at;
  const price = stampPrice(sid);
  const canBuy = !G.stamps[sid] && G.coins >= price;
  const after = () => {
    if (G.turn % 3 === 0) return settlement();
    nextTurn();
  };
  if (canBuy) return buyPrompt(sid, price, after);
  after();
}

function buyPrompt(sid, price, next) {
  const st = stampOf(sid), inc = stampIncome(sid);
  modal(
    `<div class="em">${st.emoji}</div>
     <h3>${nm(sid)} の ${esc(st.name)}</h3>
     <p>${save.adult
        ? `${price} コインで購入。決算ごとに ${inc} コイン入る（1日の乗車人員 約${S[sid].pax}万人）。`
        : `スタンプを かうと、おこづかいの日に ${inc} コイン もらえるよ`}</p>
     <div class="ledger">
       <div class="lr"><span>${save.adult ? 'いま持っているコイン' : 'いまの コイン'}</span><b>${G.coins}</b></div>
       <div class="lr"><span>${save.adult ? 'スタンプ代' : 'ねだん'}</span><b>−${price}</b></div>
       <div class="lr tot"><span>${save.adult ? '毎回もらえる' : 'まいかい もらえる'}</span><b style="color:var(--coin)">＋${inc}</b></div>
     </div>`,
    [
      { label: `🖐 ${st.emoji} スタンプを かう`, pri: true, fn: () => {
        G.coins -= price; G.stamps[sid] = st.id; sfx.coin();
        speak(S[sid].kana + 'の ' + st.kana + 'の スタンプを かいました');
        next();
      } },
      { label: 'やめておく', fn: next }
    ]);
}

function settlement() {
  const owned = Object.keys(G.stamps);
  const rows = owned.map(sid =>
    `<div class="lr"><span>${stampOf(sid).emoji} ${nmText(sid)}</span><b>＋${stampIncome(sid)}</b></div>`).join('');
  const total = owned.reduce((a, sid) => a + stampIncome(sid), 0);
  G.coins += total;
  if (total > 0) sfx.coin();
  speak(owned.length ? 'おこづかいの日。' + total + 'コイン もらえました。' : 'おこづかいの日。スタンプが ないので 0コインです。');
  modal(
    `<div class="em">💰</div><h3>${save.adult ? '決算の日' : 'おこづかいの日！'}</h3>
     <p>${owned.length ? (save.adult ? 'スタンプ（駅ナカのお店）からの収入です。' : 'もっている スタンプから コインが もらえるよ')
        : (save.adult ? 'スタンプが 1つもないので収入はありません。' : 'スタンプが ないから 0コイン。えきで かってみよう')}</p>
     ${owned.length ? `<div class="ledger">${rows}<div class="lr tot"><span>ごうけい</span><b style="color:var(--coin)">＋${total}</b></div></div>` : ''}
     <div class="bignum">${G.coins} <span style="font-size:20px">コイン</span></div>`,
    [{ label: '▶ つぎの ターンへ', pri: true, fn: nextTurn }]);
}

function nextTurn() {
  if (G.over) return;
  G.turn++;
  if (G.turn > G.m.turns) return finish(false);
  renderGame();
}

/* ---------------- おわり ---------------- */
function finish(win) {
  if (G.over) return;
  G.over = true;
  const left = win ? Math.max(0, G.m.turns - G.turn + 1) : 0;
  const score = win ? finalScore(G.coins, left) : 0;
  const stars = win ? starsFor(G.m, score) : 0;
  if (win) {
    const b = save.best[G.m.id] || 0;
    if (score > b) { save.best[G.m.id] = score; }
    save.best[G.m.id + ':stars'] = Math.max(save.best[G.m.id + ':stars'] || 0, stars);
    persist();
    sfx.goal();
    speak('クリア！ ' + '★'.repeat(stars) + ' スコアは ' + score + 'です');
  } else { sfx.ng(); speak('でんしゃが おくれちゃった。もういっかい やってみよう'); }

  const body = win
    ? `<div class="em">🏁</div><h3>クリア！</h3>
       <div class="stars" style="font-size:30px">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
       <div class="ledger">
         <div class="lr"><span>${save.adult ? '手持ちコイン' : 'もっている コイン'}</span><b>${G.coins}</b></div>
         <div class="lr"><span>${save.adult ? `早着ボーナス（残り ${left} ターン × ${EARLY_BONUS}）` : 'はやく ついた ボーナス'}</span><b>＋${left * EARLY_BONUS}</b></div>
         <div class="lr"><span>${save.adult ? 'すすんだ駅数 / 乗り換え' : 'すすんだ えき / のりかえ'}</span><b>${G.moves} / ${G.transfers}</b></div>
         <div class="lr tot"><span>スコア</span><b style="color:var(--coin)">${score}</b></div>
         <div class="lr"><span>${save.adult ? 'これまでの最高' : 'いちばん いい スコア'}</span><b>${save.best[G.m.id]}</b></div>
       </div>`
    : `<div class="em">🕒</div><h3>${save.adult ? 'ターン切れ' : 'でんしゃが おくれちゃった'}</h3>
       <p>${esc(G.m.hint)}</p>`;

  modal(body, [
    { label: '🔄 もういっかい', pri: true, fn: () => startMission(G.m) },
    { label: '🗺 べつの おでかけ', fn: () => { renderSelect(); show('screen-select'); } }
  ]);
}

/* ============================================================
   ミッション選択・図鑑・設定
   ============================================================ */
function renderSelect() {
  $('mlist').innerHTML = MISSIONS.map((m, i) => {
    const s = save.best[m.id + ':stars'] || 0;
    const best = save.best[m.id];
    return `<button class="mrow card" data-i="${i}">
      <span class="no lv${m.level}">${i + 1}</span>
      <span class="tt">
        <b>${esc(m.title)}</b>
        <small>${esc(save.adult ? S[m.from].kanji : S[m.from].kana)} から ・ ${m.turns}ターン
        ${best ? ' ・ さいこう ' + best : ''}</small>
      </span>
      <span class="stars">${'★'.repeat(s)}${'☆'.repeat(3 - s)}</span>
    </button>`;
  }).join('');
  $('mlist').querySelectorAll('.mrow').forEach(b => {
    b.onclick = () => { ac(); startMission(MISSIONS[+b.dataset.i]); };
  });
}

function renderBook() {
  const got = TRAINS.filter(t => save.cards.indexOf(t.id) >= 0).length;
  $('book-count').textContent = `${got} / ${TRAINS.length} りょう あつめた`;
  $('bookgrid').innerHTML = TRAINS.map(t => {
    const have = save.cards.indexOf(t.id) >= 0;
    return `<div class="tcard ${have ? '' : 'locked'}" data-id="${t.id}">
      <div class="tsvg">${have ? trainSVG(t) : trainSVG({ body: '#c8cfd7', face: '#9aa4ae', band: ['#b6bfc8'] })}</div>
      <div class="tn">${have ? esc(save.adult ? t.name : t.kana) : '？？？'}</div>
      <div class="tk">${have ? esc(t.lines.map(l => lnText(l)).join(' / ')) : 'まだ もっていない'}</div>
      ${have ? `<span class="rare r${t.rarity}">${['', 'よく みる', 'ときどき', 'レア'][t.rarity]}</span>` : ''}
    </div>`;
  }).join('');
  $('bookgrid').querySelectorAll('.tcard').forEach(c => {
    c.onclick = () => {
      const t = TRAINS.find(x => x.id === c.dataset.id);
      if (save.cards.indexOf(t.id) < 0) return;
      speak(t.kana);
      modal(`<div class="tcard">
          <div class="tsvg">${trainSVG(t)}</div>
          <div class="tn">${esc(t.name)}</div>
          <div class="tk">${esc(t.kana)}</div>
          <div class="tnote">${esc(t.note)}</div>
          <div class="tnote"><b>はしる ろせん：</b>${esc(t.lines.map(l => LINES[l].name).join('、'))}</div>
        </div>`, [{ label: 'とじる', pri: true }]);
    };
  });
}

function settings(inGame) {
  const row = (k, title, desc) =>
    `<button class="setrow" data-k="${k}"><span class="si"><b>${title}</b><small>${desc}</small></span>
     <span class="sw ${save[k] ? 'on' : ''}"></span></button>`;
  const mask = modal(
    `<h3>せってい</h3>
     <div style="text-align:left">
       ${row('adult', 'おとなモード', '漢字・正式な形式名・乗車人員を表示します')}
       ${row('voice', 'こえで よみあげ', '駅名や種別を 音声で 読み上げます')}
       ${row('sound', 'おと', '発車・到着・コインの 音を 鳴らします')}
       ${row('hint', 'ヒントを だす', '最短ルートの 一手に 💡 を つけます。オフにすると 大人向けの 難易度に なります')}
     </div>`,
    (inGame ? [{ label: '🗺 べつの おでかけを えらぶ', fn: () => { renderSelect(); show('screen-select'); } }] : [])
      .concat([{ label: 'とじる', pri: true }]));
  mask.querySelectorAll('.setrow').forEach(b => {
    b.onclick = () => {
      const k = b.dataset.k;
      save[k] = !save[k]; persist();
      b.querySelector('.sw').classList.toggle('on', !!save[k]);
      applyAdult();
      if (k === 'voice' && save[k]) speak('よみあげを おんに しました');
      if (k === 'sound' && save[k]) sfx.coin();
      if (G && !$('screen-game').classList.contains('hide')) renderGame();
      if (!$('screen-book').classList.contains('hide')) renderBook();
      if (!$('screen-select').classList.contains('hide')) renderSelect();
    };
  });
}

/* ---------------- 起動 ---------------- */
$('screen-title').querySelector('.title-train').outerHTML =
  `<svg class="title-train" viewBox="0 0 200 120">${trainSVG(TRAINS[1]).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
$('btn-start').onclick = () => { ac(); renderSelect(); show('screen-select'); };
$('btn-book-t').onclick = () => { renderBook(); show('screen-book'); };
$('btn-set-t').onclick = () => { ac(); settings(false); };
$('sel-back').onclick = () => show('screen-title');
$('sel-book').onclick = () => { renderBook(); show('screen-book'); };
$('book-back').onclick = () => show(G ? 'screen-select' : 'screen-title');
$('g-menu').onclick = () => settings(true);
$('g-hint').onclick = showHint;
applyAdult();
