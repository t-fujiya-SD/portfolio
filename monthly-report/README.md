# 飲食店 月次業績レポート（デモ）/ Restaurant Monthly Performance Report (Demo)

> POSレジ・予約媒体・SNS・収支データを自動集計し、1枚のダッシュボードに可視化する
> 月次レポート自動生成ツールの **公開用デモ版** です。
> 表示している店舗名・数値・顧客名・取引先名はすべて **架空のサンプルデータ** です。

🔗 **デモを開く / Live demo:** https://t-fujiya-sd.github.io/portfolio/monthly-report/

---

## 日本語

### これは何？
飲食店の1か月の業績を、複数のデータソースから自動で集計し、自己完結型のHTMLダッシュボード（＋PDF・会議用スライド）として出力するツールです。「フォルダに資料を置く → 1コマンド → レポート完成」を目指して作りました。

### レポートに含まれる内容
- **サマリー5ブロック**: ①店舗実績（売上・客数・客単価・1人あたりドリンク）②WEB（媒体別売上・PV・予約件数）③SNS（Instagram想定売上・リーチ・予約）④その他売上（優待媒体・法人掛売）⑤収益（原価率・人件費・営業利益）
- **グラフ**: 日別 売上×客数推移 / ランチ・ディナー別 / ドリンク内訳 / カテゴリ構成 / メニューABC分析
- **詳細セクション**（ハンバーガーメニュー）: PL明細・予約リスト・WEB媒体別詳細・食べログアクセス推移・SNSインサイト・口コミスコア

### 元データ（実運用時）
POSレジの商品別売上CSV、各予約媒体（食べログ・一休・ぐるなび・オズモール等）の管理画面CSV/スクリーンショット、Instagramインサイト、予約メール、月次収支一覧——これらを集約して1本のレポートに統合します。

### 技術スタック
- 集計: Python（pandas不使用・標準ライブラリ中心）
- レポート: 自己完結型HTML（Chart.js をインライン同梱・オフライン閲覧可）
- 媒体スクショの数値抽出: Claude Vision
- 出力: HTML ダッシュボード / PDF / 会議用スライド（PPTX）

### このデモについて
- すべて架空のサンプルデータで生成しています（実店舗・実顧客・実取引先のデータは含みません）。
- データ生成スクリプトは `_build/` に同梱（`gen_demo_metrics.py` → `report_demo.py` → `postprocess.py`）。

---

## English

### What is this?
A tool that automatically aggregates a restaurant's monthly performance from multiple data sources and outputs a self-contained HTML dashboard (plus PDF and a meeting slide deck). Built around the idea of "drop files in a folder → run one command → finished report."

### What the report covers
- **5 summary blocks**: ① in-store results (sales, covers, average spend, drink-per-customer) ② Web (sales/PV/reservations by channel) ③ SNS (Instagram estimated sales, reach, reservations) ④ other sales (invitation channels, corporate accounts) ⑤ P&L (cost ratio, labor, operating profit)
- **Charts**: daily sales × covers trend / lunch vs. dinner / drink breakdown / category mix / menu ABC analysis
- **Detail sections** (hamburger menu): P&L detail, reservation list, per-channel web detail, Tabelog access trend, SNS insights, review scores

### Source data (in production)
POS item-level sales CSVs, management-console CSVs/screenshots from booking platforms, Instagram insights, reservation emails, and the monthly ledger — all consolidated into one report.

### Tech stack
- Aggregation: Python (standard library, no pandas)
- Report: self-contained HTML with Chart.js inlined (works offline)
- Screenshot data extraction: Claude Vision
- Outputs: HTML dashboard / PDF / meeting slide deck (PPTX)

### About this demo
- Everything is generated from synthetic sample data — no real store, customer, or vendor data is included.
- The generator scripts ship in `_build/` (`gen_demo_metrics.py` → `report_demo.py` → `postprocess.py`).
