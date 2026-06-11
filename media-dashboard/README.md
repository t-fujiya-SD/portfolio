# グルメ媒体 効果測定ダッシュボード（デモ）/ Gourmet Media Analytics (Demo)

> ぐるなび・食べログ・オズモール・一休 などグルメ媒体の月次PV（ページビュー）を一元管理し、
> 媒体別の推移・前月比・構成を可視化するダッシュボードの **公開用デモ版** です。
> 表示している店舗名・数値はすべて **架空のサンプルデータ** です。

🔗 **デモを開く / Live demo:** https://t-fujiya-sd.github.io/portfolio/media-dashboard/

---

## 日本語

### これは何？
複数のグルメ媒体（ぐるなび・食べログ・オズモール・一休・Retty・Googleマップ・ホットペッパー）に分散している
「自店のPV数」を1か所に集約し、推移と効果を見える化するツールです。
媒体ごとの管理画面を毎回見に行かなくても、月次の伸び・落ち込みが一目で分かります。

### 主な機能
- **ダッシュボード**: 今月の合計PV／媒体別PVと前月比、月別PV推移グラフ（媒体別の折れ線）、媒体別合計、月別データ一覧
- **データ追加**: CSVアップロード（フォーマット検証付き）／手動入力で、媒体・年月・PV数を登録

### 技術スタック
- Next.js 16（App Router・静的エクスポート）
- React 19 / TypeScript
- Recharts（グラフ）／Tailwind CSS v4 ／ shadcn系UI

### このデモについて
- サンプル店舗「中華ダイニング 鳳来（デモ）」の架空PVデータで動作します（実店舗データは含みません）。
- 静的サイトとして書き出しているため、データ追加画面の登録結果は保存されません（UIデモ）。

---

## English

### What is this?
A tool that consolidates a restaurant's page-view (PV) counts — scattered across multiple gourmet
platforms (Gurunavi, Tabelog, Retty, Google Maps, Hot Pepper) — into one place and visualizes the
trend and effectiveness. No need to log into each platform's console every time.

### Features
- **Dashboard**: this month's total PV and per-platform PV with month-over-month change, a monthly
  PV trend chart (line per platform), per-platform totals, and a monthly data table.
- **Add data**: register platform / month / PV via CSV upload (with format validation) or manual entry.

### Tech stack
- Next.js 16 (App Router, static export)
- React 19 / TypeScript
- Recharts (charts) / Tailwind CSS v4 / shadcn-style UI

### About this demo
- Runs on synthetic PV data for a sample store ("中華ダイニング 鳳来 (demo)") — no real store data.
- Exported as a static site, so submissions on the "add data" screen are not persisted (UI demo only).
