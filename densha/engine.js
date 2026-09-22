/* ============================================================
   でんしゃすごろく — ゲームエンジン（路線グラフと移動の計算）
   ・1 サイコロの目 = 「つぎの停車駅へ 1つ すすむ」 or 「のりかえ 1かい」
   ・快速や急行は通過駅を飛ばすので、同じ目でより遠くへ行ける
   ・直通運転どうしの のりかえは コスト 0
   ============================================================ */

const _stopCache = {};
function stopsOf(lineId, svId) {
  const k = lineId + '/' + svId;
  if (_stopCache[k]) return _stopCache[k];
  const L = LINES[lineId];
  const sv = L.services.find(s => s.id === svId);
  if (!sv) throw new Error('種別なし: ' + k);
  return (_stopCache[k] = L.stations.filter(s => sv.skip.indexOf(s) < 0));
}
function svOf(lineId, svId) {
  return LINES[lineId].services.find(s => s.id === svId);
}
function stopsHere(lineId, svId, sid) {
  return stopsOf(lineId, svId).indexOf(sid) >= 0;
}

/* 直通運転か（のりかえコスト 0） */
function isThrough(lineA, lineB, sid) {
  return THROUGH.some(t =>
    t.at === sid && ((t.a === lineA && t.b === lineB) || (t.a === lineB && t.b === lineA)));
}

/* その駅・その電車で進める向き。+1 = stations 配列の後ろ向き */
function dirsAt(lineId, svId, sid) {
  const stops = stopsOf(lineId, svId);
  const i = stops.indexOf(sid);
  if (i < 0) return [];
  if (LINES[lineId].loop) return [1, -1];
  const d = [];
  if (i < stops.length - 1) d.push(1);
  if (i > 0) d.push(-1);
  return d;
}

/* 1つ すすむ */
function step(lineId, svId, sid, dir) {
  const stops = stopsOf(lineId, svId);
  const i = stops.indexOf(sid);
  if (i < 0) return null;
  let j = i + dir;
  if (LINES[lineId].loop) j = (j + stops.length) % stops.length;
  else if (j < 0 || j >= stops.length) return null;
  return stops[j];
}

/* この電車の行先（LED表示用） */
function terminusOf(lineId, svId, dir) {
  const stops = stopsOf(lineId, svId);
  if (LINES[lineId].loop) return dir === 1 ? '内回り' : '外回り';
  return S[dir === 1 ? stops[stops.length - 1] : stops[0]].kanji;
}
function terminusKana(lineId, svId, dir) {
  const stops = stopsOf(lineId, svId);
  if (LINES[lineId].loop) return dir === 1 ? 'うちまわり' : 'そとまわり';
  return S[dir === 1 ? stops[stops.length - 1] : stops[0]].kana;
}

/* この駅で乗れる電車の一覧（駅ごとにキャッシュ） */
const _statesCache = {};
function statesAt(sid) {
  if (_statesCache[sid]) return _statesCache[sid];
  const out = [];
  for (const lineId of S[sid].lines) {
    for (const sv of LINES[lineId].services) {
      if (!stopsHere(lineId, sv.id, sid)) continue;
      for (const dir of dirsAt(lineId, sv.id, sid)) out.push({ lineId, svId: sv.id, dir });
    }
  }
  return (_statesCache[sid] = out);
}

/* のりかえに必要なサイコロの目
   0 = 同じ電車のまま（種別変更）／直通運転／出発時の乗車
   1 = ホームを移動する ふつうの のりかえ（向きを変えるのも 1） */
function boardCost(sid, curLine, curSv, curDir, lineId, dir) {
  if (curLine == null) return 0;
  if (lineId === curLine && dir === curDir) return 0;
  if (isThrough(curLine, lineId, sid)) return 0;
  return 1;
}

/* 画面に出す のりかえ候補（コストが安い順・速い種別が先） */
const SVRANK = { ltd: 0, exp: 1, rapid: 2, local: 3 };
function boardOptions(sid, curLine, curSv, curDir) {
  const out = [];
  for (const s of statesAt(sid)) {
    if (s.lineId === curLine && s.svId === curSv && s.dir === curDir) continue;
    const cost = boardCost(sid, curLine, curSv, curDir, s.lineId, s.dir);
    out.push({ lineId: s.lineId, svId: s.svId, dir: s.dir, cost,
      through: curLine != null && cost === 0 && s.lineId !== curLine });
  }
  out.sort((a, b) => a.cost - b.cost
    || a.lineId.localeCompare(b.lineId)
    || SVRANK[svOf(a.lineId, a.svId).cls] - SVRANK[svOf(b.lineId, b.svId).cls]
    || a.dir - b.dir);
  return out;
}

/* ============================================================
   経路探索（0-1 BFS を 1回だけ回す）
   いまの状態から to へ行くのに必要な最小の目と、その「最初の一手」を返す。
   ヒント・出発時の向き・難易度検証を すべてこれで計算する。
   ============================================================ */
function planFrom(sid, lineId, svId, dir, to, freeBoard) {
  if (sid === to) return { pips: 0, first: null };
  const seen = new Set();
  /* 0-1 BFS。同じ層の中は FIFO で回す。
     LIFO にすると「同じ目数で着けるなら」無駄な無料のりかえ（種別変更）を
     先に選んでしまい、すすまずに のりかえを くりかえす無限ループになる。
     FIFO なら、先に積んだ「すすむ」が同点勝負に勝つ。 */
  let cur = [], next = [], ci = 0, pips = 0;
  const K = s => s.sid + '|' + s.lineId + '|' + s.svId + '|' + s.dir;
  const push = (arr, s) => { const k = K(s); if (!seen.has(k)) { seen.add(k); arr.push(s); } };

  /* 最初の一手の候補。「すすむ」を先に積む（同点なら すすむ を選ばせる） */
  if (lineId != null) {
    const n = step(lineId, svId, sid, dir);
    if (n) push(next, { sid: n, lineId, svId, dir, first: { kind: 'step' } });
  }
  for (const o of boardOptions(sid, lineId, svId, dir)) {
    const c = freeBoard ? 0 : o.cost;
    push(c === 0 ? cur : next,
      { sid, lineId: o.lineId, svId: o.svId, dir: o.dir, first: { kind: 'board', opt: o } });
  }

  while (ci < cur.length || next.length) {
    while (ci < cur.length) {
      const s = cur[ci++];
      if (s.sid === to) return { pips, first: s.first };
      const n = step(s.lineId, s.svId, s.sid, s.dir);
      if (n) push(next, { sid: n, lineId: s.lineId, svId: s.svId, dir: s.dir, first: s.first });
      for (const b of statesAt(s.sid)) {
        if (b.lineId === s.lineId && b.svId === s.svId && b.dir === s.dir) continue;
        const c = boardCost(s.sid, s.lineId, s.svId, s.dir, b.lineId, b.dir);
        const t = { sid: s.sid, lineId: b.lineId, svId: b.svId, dir: b.dir, first: s.first };
        if (c === 0) push(cur, t); else push(next, t);
      }
    }
    cur = next; next = []; ci = 0; pips++;
    if (pips > 400) break;
  }
  return { pips: Infinity, first: null };
}

/* どこからでも（出発時と同じ条件で）到達までの最小の目 */
function shortestPips(from, to) { return planFrom(from, null, null, null, to, true).pips; }

/* 出発時に乗る電車 = 最初の目的地に いちばん近づく電車 */
function firstBoard(from, to) {
  let best = null, bestP = Infinity;
  for (const o of boardOptions(from, null, null, null)) {
    /* freeBoard=false で評価する。そうしないと「反対向きの電車に
       0で乗り換えられる」ことになって、向きの違いが同点になってしまう */
    const p = planFrom(from, o.lineId, o.svId, o.dir, to, false).pips;
    if (p < bestP) { bestP = p; best = o; }
  }
  return best || boardOptions(from, null, null, null)[0];
}

/* ミッション全体（スタート→目的地を順番に）に必要な最小の目 */
function missionPips(m) {
  let total = 0, at = m.from;
  for (const g of m.goals) { const p = shortestPips(at, g); if (p === Infinity) return Infinity; total += p; at = g; }
  return total;
}

/* スタンプの値段と決算収入 */
function stampPrice(sid) { return Math.max(3, Math.round(S[sid].pax * 1.5)); }
function stampIncome(sid) { return Math.round(S[sid].pax * 0.6) + 1; }
/* 駅ごとのスタンプ絵柄は固定（駅IDから決める） */
function stampOf(sid) {
  let h = 0; for (let i = 0; i < sid.length; i++) h = (h * 31 + sid.charCodeAt(i)) % 99991;
  return STAMPS[h % STAMPS.length];
}
function goalBonus(sid) { return 40 + Math.round(S[sid].pax); }

/* 早着ボーナスとスコア（大人が最適化する対象） */
const EARLY_BONUS = 8;
function finalScore(coins, turnsLeft) { return coins + turnsLeft * EARLY_BONUS; }
function starsFor(m, score) {
  const base = 60 + m.turns * 14;
  if (score >= base * 1.7) return 3;
  if (score >= base * 1.25) return 2;
  return 1;
}
