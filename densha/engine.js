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
function planFrom(sid, lineId, svId, dir, to, freeBoard, xw) {
  /* xw = のりかえ1回の重み。
     1 … ふつうの最短手数
     0 … 「あと何駅か」を測るとき（のりかえは駅数に数えない）
     XFARE … 運賃がいちばん安いルートを探すとき */
  const XW = xw == null ? 1 : xw;
  if (sid === to) return { pips: 0, first: null };
  const seen = new Set();
  /* 0-1 BFS。同じ層の中は FIFO で回す。
     LIFO にすると「同じ目数で着けるなら」無駄な無料のりかえ（種別変更）を
     先に選んでしまい、すすまずに のりかえを くりかえす無限ループになる。
     FIFO なら、先に積んだ「すすむ」が同点勝負に勝つ。 */
  let cur = [], ci = 0, pips = 0;
  const q = new Map();                       /* 層番号 -> 待ち行列（重みが2以上でも扱える） */
  const later = (n, s) => { const k = pips + n; if (!q.has(k)) q.set(k, []); q.get(k).push(s); };
  const next = { push: s => later(1, s) };
  const K = s => s.sid + '|' + s.lineId + '|' + s.svId + '|' + s.dir;
  const push = (arr, s) => { const k = K(s); if (!seen.has(k)) { seen.add(k); arr.push(s); } };

  /* 最初の一手の候補。「すすむ」を先に積む（同点なら すすむ を選ばせる） */
  if (lineId != null) {
    const n = step(lineId, svId, sid, dir);
    if (n) push(next, { sid: n, lineId, svId, dir, first: { kind: 'step' } });
  }
  for (const o of boardOptions(sid, lineId, svId, dir)) {
    const c = freeBoard ? 0 : o.cost * XW;
    const t = { sid, lineId: o.lineId, svId: o.svId, dir: o.dir, first: { kind: 'board', opt: o } };
    if (c === 0) push(cur, t); else { const k = K(t); if (!seen.has(k)) { seen.add(k); later(c, t); } }
  }

  while (ci < cur.length || q.size) {
    while (ci < cur.length) {
      const s = cur[ci++];
      if (s.sid === to) return { pips, first: s.first };
      const n = step(s.lineId, s.svId, s.sid, s.dir);
      if (n) push(next, { sid: n, lineId: s.lineId, svId: s.svId, dir: s.dir, first: s.first });
      for (const b of statesAt(s.sid)) {
        if (b.lineId === s.lineId && b.svId === s.svId && b.dir === s.dir) continue;
        const c = boardCost(s.sid, s.lineId, s.svId, s.dir, b.lineId, b.dir) * XW;
        const t = { sid: s.sid, lineId: b.lineId, svId: b.svId, dir: b.dir, first: s.first };
        if (c === 0) push(cur, t); else { const k = K(t); if (!seen.has(k)) { seen.add(k); later(c, t); } }
      }
    }
    /* つぎに中身がある層まで進む */
    let nx = Infinity;
    for (const k of q.keys()) if (k > pips && k < nx) nx = k;
    if (nx === Infinity) break;
    pips = nx; cur = q.get(pips) || []; q.delete(pips); ci = 0;
    if (pips > 900) break;
  }
  return { pips: Infinity, first: null };
}

/* ============================================================
   運賃と「考える」ための距離
   ・1駅すすむ = FARE_STEP コイン（通過した駅もかぞえる）
   ・のりかえ   = FARE_X コイン（直通は 0）
   遠回りすると、はっきり損をする。これが「よく考える」動機になる。
   ============================================================ */
const FARE_STEP = 1, FARE_X = 3;

/* 目的地まで あと何駅か（のりかえは駅数に数えない）。
   子供に見せるメーター。選んだ結果でこの数が増えたか減ったかが分かる */
function stationsLeft(sid, lineId, svId, dir, to) {
  return planFrom(sid, lineId, svId, dir, to, false, 0).pips;
}
/* いちばん運賃が安く行けるルートと、その最初の一手（ヒント用） */
function farePlan(sid, lineId, svId, dir, to, freeBoard) {
  return planFrom(sid, lineId, svId, dir, to, freeBoard, FARE_X);
}
/* どこからでも到達までの最小駅数 */
function shortestPips(from, to) { return planFrom(from, null, null, null, to, true, 0).pips; }
/* おだい全体の最小運賃（★の基準に使う） */
function missionFare(m) {
  /* 各区間の先頭は「ただで電車に乗れる」前提で計算する。
     ゲーム側も、出発時と目的地に着いた直後は のりかえ代を取らない */
  let total = 0, at = m.from;
  for (const g of m.goals) {
    const p = planFrom(at, null, null, null, g, true, FARE_X).pips;
    if (p === Infinity) return Infinity;
    total += p; at = g;
  }
  return total;
}

/* ============================================================
   判断駅 … 電車を止めて「どうする？」と聞く駅
   目的地・終点・ほかの路線に乗りかえられる駅。
   それ以外は通過して走り続ける（4歳を待たせないため）
   ============================================================ */
function isDecisionPoint(sid, lineId, svId, dir, goal) {
  if (sid === goal) return true;
  if (!step(lineId, svId, sid, dir)) return true;            /* 終点 */
  for (const b of statesAt(sid)) if (b.lineId !== lineId) return true;
  return false;
}
/* いまの電車で、つぎの判断駅まで通る駅を順に返す（最初の1駅目から） */
function runPath(sid, lineId, svId, dir, goal, cap) {
  const out = []; let cur = sid;
  for (let i = 0; i < (cap || 40); i++) {
    const n = step(lineId, svId, cur, dir);
    if (!n) break;
    out.push(n); cur = n;
    if (isDecisionPoint(n, lineId, svId, dir, goal)) break;
  }
  return out;
}

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

/* スタンプの値段と収入。
   決算は「目的地に着くたび」しか来ないので、1回の決算でも元が取れる値段にする。
   小さい駅は買えばほぼ確実に得。大きい駅は目的地をいくつも回る長いおだいでだけ得。
   ここが大人の判断どころになる。 */
function stampPrice(sid) { return Math.max(4, Math.round(S[sid].pax * 1.0)); }
function stampIncome(sid) { return Math.max(2, Math.round(S[sid].pax * 0.8)); }
const STAMP_END_BONUS = 15;   /* さいごに スタンプ1つにつき もらえる */
/* 駅ごとのスタンプ絵柄は固定（駅IDから決める） */
function stampOf(sid) {
  let h = 0; for (let i = 0; i < sid.length; i++) h = (h * 31 + sid.charCodeAt(i)) % 99991;
  return STAMPS[h % STAMPS.length];
}

/* 出発時の所持コインと、到着のごほうび */
const START_COINS = 120;
function goalReward(sid) { return 40 + Math.round(S[sid].pax); }

/* ★は「むだな運賃を使わずに、スタンプで稼げたか」で決まる。
   最短運賃どおりに走って、大きい駅のスタンプを買えていれば ★3 */
function starsFor(m, coins, fareUsed) {
  const best = missionFare(m);
  const waste = best === Infinity ? 0 : Math.max(0, fareUsed - best);
  /* 基準 = 最短で走って、スタンプを1つも買わなかったときの残高 */
  const plain = START_COINS + m.goals.reduce((a, g) => a + goalReward(g), 0) - best;
  if (waste === 0 && coins >= plain + 25) return 3;
  if (waste <= best * 0.4 && coins >= plain * 0.85) return 2;
  return 1;
}

/* 方角（8方位）。「しんじゅくは みなみ」のように、
   答えではなく“手がかり”だけを出すために使う */
const DIRS8 = [['きた','↑'],['きたひがし','↗'],['ひがし','→'],['みなみひがし','↘'],
               ['みなみ','↓'],['みなみにし','↙'],['にし','←'],['きたにし','↖']];
function bearing(a, b) {
  if (!POS[a] || !POS[b] || a === b) return null;
  const dy = POS[b][0] - POS[a][0];
  const dx = (POS[b][1] - POS[a][1]) * Math.cos(35.7 * Math.PI / 180);
  if (Math.hypot(dx, dy) < 1e-6) return null;
  const ang = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
  return DIRS8[Math.round(ang / 45) % 8];
}

/* 2駅の直線距離（km）。「ちかづいた／とおくなった」の判定に使う。
   駅数だと、速い路線がある方向へ遠回りしても数が減らないことがあり、
   子供へのフィードバックとして正しく働かないため。 */
function geoDist(a, b) {
  if (!POS[a] || !POS[b]) return 0;
  const dy = (POS[b][0] - POS[a][0]) * 111.0;
  const dx = (POS[b][1] - POS[a][1]) * 111.0 * Math.cos(35.7 * Math.PI / 180);
  return Math.hypot(dx, dy);
}
