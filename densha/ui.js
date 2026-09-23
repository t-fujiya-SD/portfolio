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
  ng() { tone(330, 0, .16, 'sawtooth', .1); tone(247, .14, .26, 'sawtooth', .1); },
  pass() { tone(392, 0, .06, 'sine', .07); },
  near() { tone(659, 0, .1); tone(880, .09, .2); },
  far() { tone(440, 0, .12, 'sine', .12); tone(349, .1, .22, 'sine', .12); },
  tap() { tone(740, 0, .05, 'sine', .1); }
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

/* 走行アニメーションの1駅あたりの時間。長く走るときは速くする */
const segMs = n => n > 6 ? 200 : n > 3 ? 280 : 400;

function startMission(m) {
  /* 出発駅では、目的地のほうを向いた電車に乗った状態から始める */
  const first = firstBoard(m.from, m.goals[0]);
  G = {
    m, at: m.from, line: first.lineId, sv: first.svId, dir: first.dir,
    coins: START_COINS, fare: 0, stamps: {}, goalIdx: 0,
    moves: 0, transfers: 0, gotCards: [], trail: new Set(), freeBoard: true,
    dist0: geoDist(m.from, m.goals[0]),
    busy: false, over: false, lastLeft: null, showAllX: false
  };
  MapView.follow = true;
  show('screen-game');
  renderGame();
  const d = bearing(m.from, m.goals[0]);
  speak(S[m.from].kana + 'から しゅっぱつ。' + S[m.goals[0]].kana + 'は、' +
    (d ? d[0] + 'の ほうだよ。' : '') + 'どの でんしゃに のる？');
}

const curGoal = () => G.m.goals[G.goalIdx];
/* 目的地まで あと何駅か。選んだ結果でこの数が増えたか減ったかが「考える」手がかりになる */
const leftNow = () => stationsLeft(G.at, G.line, G.sv, G.dir, curGoal());

/* 走行中と演出中は操作を受け付けない（4歳は必ず連打する） */
function lock(ms, fn) {
  G.busy = true; renderDock();
  setTimeout(() => { if (!G) return; G.busy = false; fn(); }, ms);
}
const blocked = () => !G || G.busy || G.over || modalOpen;

/* ---------------- 描画 ---------------- */
function renderGame() {
  const L = LINES[G.line], sv = svOf(G.line, G.sv);
  const left = leftNow();

  $('g-goal').innerHTML = nm(curGoal());
  const d = bearing(G.at, curGoal());
  $('g-goaldir').textContent = d ? d[1] + ' ' + d[0] : '';
  $('g-left').textContent = left === Infinity ? '?' : left;
  $('g-coin').textContent = G.coins;
  $('g-chips').innerHTML = G.m.goals.map((g, i) =>
    `<div class="gchip ${i < G.goalIdx ? 'done' : i === G.goalIdx ? 'now' : ''}"></div>`).join('');
  renderProgress();

  const t = trainForLine(G.line, sv.cls);
  $('g-tsvg').outerHTML = `<svg class="tsvg" viewBox="0 0 200 120" id="g-tsvg">${trainSVG(t).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
  $('g-lcolor').style.background = L.color;
  $('g-lname').textContent = lnText(G.line);
  $('g-led').innerHTML = `<span class="svbadge sv-${sv.cls}">${esc(svText(G.line, G.sv))}</span>` +
    esc((save.adult ? terminusOf(G.line, G.sv, G.dir) : terminusKana(G.line, G.sv, G.dir)) + ' ゆき');
  $('g-here').innerHTML = 'いま ' + nm(G.at);

  renderStrip();
  renderBuy();
  renderTransfers();
  renderDock();
  if (G.scrollToChoices) {
    G.scrollToChoices = false;
    const sc = $('g-scroll');
    if (sc) sc.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!MapView.ready) MapView.init($('g-map'));
  MapView.render(true);
  $('m-me').classList.toggle('on', MapView.follow);
}

/* 目的地までの進み具合。電車が旗に近づいていくのが見える */
function renderProgress() {
  const bar = $('g-prog');
  if (!bar || G.goalIdx >= G.m.goals.length) { if (bar) bar.innerHTML = ''; return; }
  const d = geoDist(G.at, curGoal());
  const pct = G.dist0 > 0 ? Math.max(0, Math.min(1, 1 - d / G.dist0)) : 1;
  bar.innerHTML = `<div class="pfill" style="width:${(pct * 100).toFixed(1)}%"></div>
    <span class="pme" style="left:${(pct * 100).toFixed(1)}%">🚃</span>
    <span class="pgoal">🚩</span>`;
}

function updateHUD() {
  renderProgress();
  $('g-coin').textContent = G.coins;
  const l = leftNow();
  $('g-left').textContent = l === Infinity ? '?' : l;
  const d = bearing(G.at, curGoal());
  $('g-goaldir').textContent = d ? d[1] + ' ' + d[0] : '';
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
  const idx = stripIndices(stops.length, i, G.dir, 4, 13, L.loop);
  const track = $('g-track');
  track.style.setProperty('--c', L.color);
  /* つぎの判断駅まで（＝この電車で行ける範囲）を強調する */
  const runTo = runPath(G.at, G.line, G.sv, G.dir, curGoal());
  const inRun = {}; runTo.forEach(s => inRun[s] = 1);

  let html = '';
  idx.forEach((j, k) => {
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
    if (inRun[sid]) cls.push('inrun');
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

  const here = track.querySelector('.here');
  const strip = $('g-strip');
  if (here) strip.scrollLeft = Math.max(0, here.offsetLeft - strip.clientWidth * .28);
  track.querySelectorAll('.node').forEach(n => { n.onclick = () => stationInfo(n.dataset.sid); });
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

/* ---------------- ヒント ---------------- */
function plan() {
  if (!G || G.goalIdx >= G.m.goals.length) return null;
  const k = [G.at, G.line, G.sv, G.dir, curGoal(), G.freeBoard].join('|');
  if (G._pk === k) return G._plan;
  G._pk = k; G._plan = farePlan(G.at, G.line, G.sv, G.dir, curGoal(), !!G.freeBoard);
  return G._plan;
}
function sameOpt(a, b) {
  return a && b && a.lineId === b.lineId && a.svId === b.svId && a.dir === b.dir;
}
function hintText(p) {
  const d = bearing(G.at, curGoal());
  const where = d ? `${S[curGoal()].kana}は ${d[1]} ${d[0]}の ほう。` : '';
  if (!p || !p.first) return 'もう ついてるよ！';
  if (p.pips === Infinity) return where + 'この でんしゃでは いけないよ。のりかえてみよう';
  const rest = save.adult ? `あと ${leftNow()}駅です。` : `あと ${leftNow()}えき。`;
  if (p.first.kind === 'step') {
    const nx = runPath(G.at, G.line, G.sv, G.dir, curGoal());
    const last = nx.length ? nmText(nx[nx.length - 1]) : '';
    return where + (save.adult ? `この電車のまま ${last} へ進もう。` : `この でんしゃの まま ${last} へ すすもう。`) + rest;
  }
  const o = p.first.opt;
  const dd = save.adult ? terminusOf(o.lineId, o.svId, o.dir) : terminusKana(o.lineId, o.svId, o.dir);
  return where + `${lnText(o.lineId)} の ${svText(o.lineId, o.svId)}、${dd}ゆきに のりかえよう。` + rest;
}
function showHint() {
  const t = hintText(plan());
  speak(t);
  modal(`<div class="em">💡</div><h3>${save.adult ? 'ヒント' : 'どうすれば いい？'}</h3><p>${esc(t)}</p>` +
    (G.m.hint ? `<div class="ledger"><div class="lr"><span>${save.adult ? 'このおでかけのコツ' : 'コツ'}</span></div><div class="lr"><b style="font-weight:700">${esc(G.m.hint)}</b></div></div>` : ''),
    [{ label: 'わかった', pri: true }]);
}

/* ---------------- スタンプ（大人の経営要素） ---------------- */
function renderBuy() {
  const sid = G.at, box = $('g-buy');
  if (G.stamps[sid]) {
    const st = stampOf(sid);
    box.innerHTML = `<div class="buyrow owned">${st.emoji} ${esc(nmText(sid))}の ${esc(st.name)}は もってるよ
      <b>＋${stampIncome(sid)}／かい</b></div>`;
    return;
  }
  const price = stampPrice(sid);
  const st = stampOf(sid);
  if (G.coins < price) {
    box.innerHTML = `<div class="buyrow poor">${st.emoji} ${esc(nmText(sid))}の ${esc(st.name)} ${price}コイン
      <b>コインが たりない</b></div>`;
    return;
  }
  box.innerHTML = `<button class="buyrow buy" id="a-buy">
    <span class="be">${st.emoji}</span>
    <span class="bt"><b>${esc(nmText(sid))}の ${esc(st.name)}を かう</b>
      <small>${price}コイン はらうと、もくてきちに つくたび ＋${stampIncome(sid)}コイン</small></span>
    <span class="bp">${price}</span></button>`;
  $('a-buy').onclick = () => {
    if (blocked()) return;
    G.coins -= price; G.stamps[sid] = st.id; sfx.coin();
    speak(S[sid].kana + 'の ' + st.kana + 'の スタンプを かいました');
    renderGame();
  };
}

/* ---------------- のりかえの選択肢 ----------------
   「このまま すすむ」も ほかの電車と同じ1行にして、ぜんぶ横一線に並べる。
   大きなボタンが最初から用意されていると 4歳はそれを押すだけになり、
   考える機会が消えてしまうため。選んでから「しゅっぱつ！」で確定する。 */
function allChoices() {
  const out = [];
  for (const b of statesAt(G.at)) {
    const isCur = b.lineId === G.line && b.svId === G.sv && b.dir === G.dir;
    const cost = (isCur || G.freeBoard) ? 0 : boardCost(G.at, G.line, G.sv, G.dir, b.lineId, b.dir);
    out.push({ lineId: b.lineId, svId: b.svId, dir: b.dir, cost, isCur,
      through: !isCur && cost === 0 && b.lineId !== G.line });
  }
  return out;
}
function selOf() {
  return G.sel || null;
}
function isSel(o) {
  const s = selOf();
  return s && s.lineId === o.lineId && s.svId === o.svId && s.dir === o.dir;
}

function renderTransfers() {
  const opts = allChoices();
  const p = save.hint ? plan() : null;
  const bestOpt = p && p.first
    ? (p.first.kind === 'step' ? { lineId: G.line, svId: G.sv, dir: G.dir } : p.first.opt)
    : null;
  const box = $('g-xlist');
  $('g-xlabel').textContent = save.adult ? 'どの電車に乗る？' : 'どの でんしゃに のる？';

  const gm = new Map();
  opts.forEach((o, i) => {
    const k = o.lineId + '|' + o.dir;
    if (!gm.has(k)) gm.set(k, { lineId: o.lineId, dir: o.dir, cost: o.cost, through: o.through, isCur: false, svs: [] });
    const g = gm.get(k);
    g.svs.push({ o, i });
    g.cost = Math.min(g.cost, o.cost);
    if (o.isCur) { g.isCur = true; g.through = false; }
  });
  const groups = [...gm.values()];
  groups.forEach(g => {
    g.svs.sort((x, y) => SVRANK[svOf(x.o.lineId, x.o.svId).cls] - SVRANK[svOf(y.o.lineId, y.o.svId).cls]);
    const bi = g.svs.findIndex(x => sameOpt(x.o, bestOpt));
    g.best = bi >= 0;
    if (bi > 0) g.svs.unshift(g.svs.splice(bi, 1)[0]);
    const si = g.svs.findIndex(x => isSel(x.o));
    g.sel = si >= 0;
    if (si > 0) g.svs.unshift(g.svs.splice(si, 1)[0]);
    const head = g.svs[0].o;
    const rp = runPath(G.at, head.lineId, head.svId, head.dir, curGoal());
    g.to = rp.length ? rp[rp.length - 1] : null;
    g.hops = rp.length;
    g.dir8 = g.to ? bearing(G.at, g.to) : null;
  });
  groups.sort((a, b) => (b.isCur - a.isCur) || (b.best - a.best) || (a.cost - b.cost)
    || a.lineId.localeCompare(b.lineId) || a.dir - b.dir);

  const LIMIT = 6;
  const shown = G.showAllX ? groups : groups.slice(0, LIMIT);

  box.innerHTML = shown.map(g => {
    const L = LINES[g.lineId], head = g.svs[0];
    const fare = g.cost * FARE_X;
    const dest = save.adult ? terminusOf(g.lineId, head.o.svId, g.dir) : terminusKana(g.lineId, head.o.svId, g.dir);
    return `<div class="xgroup${g.sel ? ' sel' : ''}${g.best ? ' best' : ''}" style="--c:${L.color}">
      <button class="xrow" data-o="${head.i}">
        <div class="xi">
          <div class="xl">${g.best ? '💡 ' : ''}${esc(lnText(g.lineId))}
            ${g.isCur ? '<span class="curtag">いまの でんしゃ</span>' : ''}
            ${g.dir8 ? `<span class="dirtag">${g.dir8[1]} ${esc(g.dir8[0])}</span>` : ''}</div>
          <div class="xd">${esc(dest)} ゆき ・ ${g.to ? esc(nmText(g.to)) + ' まで ' + g.hops + 'えき' : 'いきどまり'}</div>
        </div>
        <span class="xc ${fare === 0 ? 'free' : ''}">${fare === 0 ? (g.through ? 'ちょくつう 0' : '0') : fare + 'コイン'}</span>
      </button>
      <div class="xchips">${g.svs.map(x => {
        const sv = svOf(x.o.lineId, x.o.svId);
        return `<button class="xchip ${isSel(x.o) ? 'on sv-' + sv.cls : ''}" data-o="${x.i}">
          ${sameOpt(x.o, bestOpt) ? '<span class="hi">💡</span>' : ''}${esc(save.adult ? sv.name : sv.kana)}</button>`;
      }).join('')}</div>
    </div>`;
  }).join('') + (groups.length > LIMIT
    ? `<button class="xmore" id="x-more">${G.showAllX
        ? '▴ すこしだけ みる' : `▾ ほかの でんしゃも みる（のこり ${groups.length - LIMIT}）`}</button>`
    : '');

  box.querySelectorAll('[data-o]').forEach(b => { b.onclick = () => selectChoice(opts[+b.dataset.o]); });
  const more = $('x-more');
  if (more) more.onclick = () => { G.showAllX = !G.showAllX; renderTransfers(); };
}

/* 選ぶ＝まだ動かない。どこまで行くかを地図に薄く描いて見せる */
function selectChoice(o) {
  if (blocked()) return;
  G.sel = { lineId: o.lineId, svId: o.svId, dir: o.dir, cost: o.cost, through: o.through, isCur: o.isCur };
  const rp = runPath(G.at, o.lineId, o.svId, o.dir, curGoal());
  MapView.preview([G.at].concat(rp));
  sfx.tap();
  const sv = svOf(o.lineId, o.svId);
  speak(lnText(o.lineId) + ' ' + sv.kana + '、' + terminusKana(o.lineId, o.svId, o.dir) + 'ゆき');
  renderTransfers();
  renderDock();
}

/* ---------------- 下の操作バー ---------------- */
function renderDock() {
  const acts = $('g-actions'), info = $('g-runinfo');
  if (G.busy) {
    info.innerHTML = '<span class="lb">はしってるよ…</span>';
    acts.innerHTML = `<button class="btn big" disabled>🚃 …</button>`;
    return;
  }
  const s = selOf();
  if (!s) {
    info.innerHTML = `<span class="lb">${save.adult ? '↑ 乗る電車を選ぼう' : '↑ うえから でんしゃを えらんでね'}</span>`;
    acts.innerHTML = `<button class="btn big" disabled>🚃 えらんでね</button>` +
      `<button class="btn" id="a-hint3" style="flex:0 0 92px">💡 ヒント</button>`;
    $('a-hint3').onclick = showHint;
    return;
  }
  const rp = runPath(G.at, s.lineId, s.svId, s.dir, curGoal());
  if (!rp.length) {
    info.innerHTML = `<span class="lb">その でんしゃは ここが しゅうてん</span>`;
    acts.innerHTML = `<button class="btn big" disabled>▶ すすめない</button>` +
      `<button class="btn" id="a-hint3" style="flex:0 0 92px">💡 ヒント</button>`;
    $('a-hint3').onclick = showHint;
    return;
  }
  const to = rp[rp.length - 1];
  const d = bearing(G.at, to);
  const same = s.lineId === G.line && s.svId === G.sv && s.dir === G.dir;
  const xf = (same || G.freeBoard) ? 0 : boardCost(G.at, G.line, G.sv, G.dir, s.lineId, s.dir) * FARE_X;
  const fare = xf + rp.length * FARE_STEP;
  info.innerHTML = `<span class="lb">${esc(nmText(to))} まで ${rp.length}えき` +
    `${xf ? '（のりかえ ' + xf + '）' : ''} ・ ${fare}コイン${d ? ' ・ ' + d[1] + d[0] : ''}</span>`;
  acts.innerHTML = `<button class="btn pri big" id="a-go">▶ しゅっぱつ！ ${esc(nmText(to))} へ</button>`;
  $('a-go').onclick = doDepart;
}

/* ---------------- 走る ---------------- */
function doDepart() {
  if (blocked()) return;
  const s = selOf();
  if (!s) return;
  /* 選んだ電車がいまと違うなら、ここで のりかえ代を払う。
     料金は選択肢に書いてある値ではなく、ここで計算し直す
     （選択肢の側の値を信じると、ただのはずの のりかえに課金してしまう） */
  if (!(s.lineId === G.line && s.svId === G.sv && s.dir === G.dir)) {
    const fare = G.freeBoard ? 0 : boardCost(G.at, G.line, G.sv, G.dir, s.lineId, s.dir) * FARE_X;
    if (fare > 0) { G.transfers++; G.coins = Math.max(0, G.coins - fare); G.fare += fare; }
    G.line = s.lineId; G.sv = s.svId; G.dir = s.dir; G._pk = null;
    if (s.through) {
      const thr = THROUGH.find(t => t.at === G.at && (t.a === s.lineId || t.b === s.lineId));
      if (thr) G._throughNote = thr.note;
    }
  }
  G.sel = null; G.freeBoard = false;
  MapView.preview(null);
  const path = runPath(G.at, G.line, G.sv, G.dir, curGoal());
  if (!path.length) { renderGame(); return; }
  G.lastLeft = leftNow();
  G.lastDist = geoDist(G.at, curGoal());
  G.busy = true; renderDock();
  MapView.frameRun([G.at].concat(path));
  sfx.depart();
  const seq = [G.at].concat(path);
  const ms = segMs(path.length);
  let i = 0;
  const hop = () => {
    if (!G || i >= seq.length - 1) { if (G) { G.busy = false; afterRun(); } return; }
    const a = seq[i], b = seq[i + 1];
    G.trail.add(a < b ? a + '~' + b : b + '~' + a);
    MapView.runSegment(a, b, ms, () => {
      if (!G) return;
      i++; G.at = b; G.moves++;
      G.fare += FARE_STEP; G.coins = Math.max(0, G.coins - FARE_STEP);
      updateHUD();
      if (i < seq.length - 1) { sfx.pass(); speak(S[b].kana); }
      hop();
    });
  };
  hop();
}

/* 走り終わったところ。近づいたか遠ざかったかを はっきり見せる */
function afterRun() {
  const sid = G.at;
  G._pk = null; G.sel = null; G.showAllX = false; G.scrollToChoices = true;
  MapView.preview(null);
  sfx.arrive();
  if (sid === curGoal()) { renderGame(); speak('とうちゃく！ ' + S[sid].kana); return lock(340, reachGoal); }
  renderGame();
  const now = leftNow();
  const nowD = geoDist(sid, curGoal());
  const wasD = G.lastDist;
  const el = $('g-left').closest('.stat');
  const bar = $('g-prog');
  el.classList.remove('up', 'down'); bar.classList.remove('up', 'down');
  void el.offsetWidth;
  if (wasD != null && Math.abs(nowD - wasD) > 0.3) {
    const closer = nowD < wasD;
    el.classList.add(closer ? 'down' : 'up');
    bar.classList.add(closer ? 'down' : 'up');
    if (closer) { sfx.near(); speak(S[sid].kana + '。ちかづいたよ。あと ' + now + 'えき'); }
    else { sfx.far(); speak(S[sid].kana + '。あれ、とおくなっちゃった。もどろうか'); }
  } else {
    speak(S[sid].kana + '。あと ' + now + 'えき');
  }
  if (G._throughNote) {
    const note = G._throughNote; G._throughNote = null;
    lock(260, () => modal(
      `<div class="em">🔗</div><h3>ちょくつう うんてん！</h3>
       <p>${esc(note)}<br>${save.adult ? '電車を降りないので、のりかえ代がかかりません。'
         : 'でんしゃを おりないから、のりかえ代は 0コイン。'}</p>`,
      [{ label: 'わかった', pri: true }]));
  }
}

/* ---------------- 目的地に着いた ---------------- */
function reachGoal() {
  const sid = curGoal();
  const reward = goalReward(sid);
  G.coins += reward;
  sfx.goal();
  const wantLtd = svOf(G.line, G.sv).cls === 'ltd';
  const all = TRAINS.filter(t => t.lines.indexOf(G.line) >= 0);
  const matched = all.filter(t => !!t.ltd === wantLtd);
  const pool = matched.length ? matched : all;
  const fresh = pool.filter(t => save.cards.indexOf(t.id) < 0);
  const src = fresh.length ? fresh : pool;
  const card = src[Math.floor(Math.random() * src.length)];
  const isNew = card && save.cards.indexOf(card.id) < 0;
  if (card && isNew) { save.cards.push(card.id); persist(); }
  if (card) G.gotCards.push(card.id);

  G.goalIdx++;
  G.freeBoard = true;      /* 目的地で ひとやすみ。つぎの のりかえは ただ */
  if (G.goalIdx < G.m.goals.length) G.dist0 = geoDist(sid, G.m.goals[G.goalIdx]);
  const last = G.goalIdx >= G.m.goals.length;
  const joy = GOAL_JOY[sid] || 'とうちゃく！';
  speak(S[sid].kana + 'に とうちゃく。' + joy);

  modal(
    `<div class="em">🎉</div><h3>${nm(sid)} に とうちゃく！</h3>
     <p>${esc(joy)}</p>
     <div class="bignum">＋${reward} <span style="font-size:20px">コイン</span></div>
     ${card ? `<div class="tcard" style="margin-top:14px">
        ${isNew ? '<div class="pill" style="background:#ffeec9;color:#a06a08;margin-bottom:6px">✨ あたらしい カード</div>' : ''}
        <div class="tsvg">${trainSVG(card)}</div>
        <div class="tn">${esc(save.adult ? card.name : card.kana)}</div>
        <div class="tk">${esc(save.adult ? card.kana : card.name)}</div>
        <div class="tnote">${esc(card.note)}</div>
      </div>` : ''}
     ${last ? '' : `<p style="margin-top:12px">${save.adult ? 'つぎは ' + S[curGoal()].kanji + '。' : 'つぎは ' + S[curGoal()].kana + '！'}</p>`}`,
    [{ label: last ? '🏁 けっか' : '▶ つぎへ', pri: true, fn: () => settlement(last) }]);
}

/* 決算は「おだいを1つ達成するごと」。ターンの代わりの時間軸 */
function settlement(last) {
  const owned = Object.keys(G.stamps);
  let total = owned.reduce((a, sid) => a + stampIncome(sid), 0);
  const endBonus = last ? owned.length * STAMP_END_BONUS : 0;
  total += endBonus;
  if (!total) { if (last) finish(); else { G._pk = null; renderGame(); } return; }
  G.coins += total;
  sfx.coin();
  speak('おこづかいの日。' + total + 'コイン もらえました。');
  const rows = owned.map(sid =>
    `<div class="lr"><span>${stampOf(sid).emoji} ${esc(nmText(sid))}</span><b>＋${stampIncome(sid)}</b></div>`).join('');
  modal(
    `<div class="em">💰</div><h3>${save.adult ? '決算' : 'おこづかいの日！'}</h3>
     <p>${save.adult ? '持っているスタンプ（駅ナカのお店）からの収入です。' : 'もっている スタンプから コインが もらえるよ'}</p>
     <div class="ledger">${rows}
       ${endBonus ? `<div class="lr"><span>🎖 スタンプ ${owned.length}こ あつめた ボーナス</span><b>＋${endBonus}</b></div>` : ''}
       <div class="lr tot"><span>ごうけい</span><b style="color:var(--coin)">＋${total}</b></div></div>
     <div class="bignum">${G.coins} <span style="font-size:20px">コイン</span></div>`,
    [{ label: last ? '🏁 けっか' : '▶ つぎへ', pri: true,
       fn: () => { if (last) finish(); else { G._pk = null; renderGame(); } } }]);
}

/* ---------------- おわり（負けはない） ---------------- */
function finish() {
  /* 二重に呼ばれても、結果画面だけは必ず出す。
     ここで黙って return すると、操作できる UI が何も残らず詰んでしまう */
  const first = !G.over;
  G.over = true;
  const best = missionFare(G.m);
  const waste = Math.max(0, G.fare - best);
  const stars = starsFor(G.m, G.coins, G.fare);
  if (first) {
    const prev = save.best[G.m.id] || 0;
    if (G.coins > prev) save.best[G.m.id] = G.coins;
    save.best[G.m.id + ':stars'] = Math.max(save.best[G.m.id + ':stars'] || 0, stars);
    persist();
    sfx.goal();
    speak('ぜんぶ まわれた！ ' + '★'.repeat(stars));
  }

  modal(
    `<div class="em">🏁</div><h3>ぜんぶ まわれた！</h3>
     <div class="stars" style="font-size:30px">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
     <div class="ledger">
       <div class="lr"><span>${save.adult ? 'すすんだ駅数 / 乗り換え' : 'すすんだ えき / のりかえ'}</span><b>${G.moves} / ${G.transfers}</b></div>
       <div class="lr"><span>${save.adult ? '使った運賃' : 'つかった コイン'}</span><b>${G.fare}</b></div>
       <div class="lr"><span>${save.adult ? 'いちばん安く行けた場合' : 'いちばん やすい ばあい'}</span><b>${best}</b></div>
       <div class="lr"><span>${save.adult ? 'むだづかい' : 'とおまわりで そんした ぶん'}</span>
         <b style="color:${waste ? 'var(--danger)' : 'var(--sub)'}">${waste ? '＋' + waste : 'なし'}</b></div>
       <div class="lr tot"><span>${save.adult ? '手持ちコイン' : 'のこった コイン'}</span><b style="color:var(--coin)">${G.coins}</b></div>
       <div class="lr"><span>${save.adult ? 'これまでの最高' : 'いちばん おおく のこせた'}</span><b>${save.best[G.m.id]}</b></div>
     </div>
     <p>${waste ? (save.adult ? 'もっと短いルートがあります。次は最短をねらってみよう。' : 'もっと ちかい みちが あったよ。つぎは さがしてみよう！')
        : (save.adult ? '最短ルートで行けました。' : 'いちばん ちかい みちで いけた！すごい！')}</p>`,
    [
      { label: '🔄 もういっかい', pri: true, fn: () => startMission(G.m) },
      { label: '🗺 べつの おでかけ', fn: () => { renderSelect(); show('screen-select'); } }
    ]);
}

function renderSelect() {
  $('mlist').innerHTML = MISSIONS.map((m, i) => {
    const s = save.best[m.id + ':stars'] || 0;
    const best = save.best[m.id];
    return `<button class="mrow card" data-i="${i}">
      <span class="no lv${m.level}">${i + 1}</span>
      <span class="tt">
        <b>${esc(m.title)}</b>
        <small>${esc(save.adult ? S[m.from].kanji : S[m.from].kana)} から ・ ${esc(m.goals.map(g => nmText(g)).join('→'))}
        ${best ? ' ・ さいこう ' + best + 'コイン' : ''}</small>
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
$('m-in').onclick  = () => { MapView.zoom(1.5);   $('m-me').classList.remove('on'); };
$('m-out').onclick = () => { MapView.zoom(1 / 1.5); $('m-me').classList.remove('on'); };
$('m-me').onclick  = () => { MapView.follow = true; MapView.render(true); $('m-me').classList.add('on'); };
$('m-all').onclick = () => { MapView.fitAll(); MapView.apply(); $('m-me').classList.remove('on'); };
addEventListener('resize', () => { if (G && MapView.ready && !$('screen-game').classList.contains('hide')) MapView.render(false); });

/* マップの駅をタップしたら その駅の説明を出す */
$('g-map').addEventListener('click', e => {
  const t = e.target.closest('.ms');
  if (t && t.dataset.s) stationInfo(t.dataset.s);
});
applyAdult();
