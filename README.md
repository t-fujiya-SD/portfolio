# 飲食店向け オーダーメイドWebツール — ポートフォリオ

飲食店・食材業者の現場課題を解決するために制作したWebツールの実績ポートフォリオです。
すべてのデモは **架空のサンプルデータ** で動作し、実店舗・実顧客のデータは含みません。

🔗 **ポートフォリオ:** https://t-fujiya-sd.github.io/portfolio/

## 収録ツール（デモ）

| ツール | 概要 | デモ |
|---|---|---|
| 🍷 ドリンク売上トラッカー | レシート撮影→AI抽出でドリンク売上を記録・分析（シングルHTML / React / Claude Vision） | [/drink-tracker/](https://t-fujiya-sd.github.io/portfolio/drink-tracker/) |
| 📈 月次業績レポート | POS・予約媒体・SNS・収支を自動集計し1枚のダッシュボードに（Python / Chart.js） | [/monthly-report/](https://t-fujiya-sd.github.io/portfolio/monthly-report/) |
| 🔎 グルメ媒体 効果測定 | ぐるなび・食べログ等のPVを一元管理・可視化（Next.js / Recharts） | [/media-dashboard/](https://t-fujiya-sd.github.io/portfolio/media-dashboard/) |

各ツールの詳細は、それぞれのフォルダ内 `README.md` を参照してください。

## 構成

```
/                  ポートフォリオ トップページ（index.html）
/drink-tracker/    ドリンク売上トラッカー デモ（静的HTML）
/monthly-report/   月次業績レポート デモ（静的HTML。生成スクリプトは _build/）
/media-dashboard/  グルメ媒体 効果測定 デモ（Next.js 静的エクスポート。ソースは _src/）
```

## ローカルでの確認

各デモはルート相対パスでリンクしているため、`/portfolio/` 配下（GitHub Pages）と同じ構造で配信する必要があります。

```bash
# 例: 親ディレクトリに portfolio という名前で配置して配信
python3 -m http.server 8000
# → http://localhost:8000/portfolio/ で確認
```

## 公開（GitHub Pages）

このリポジトリを `main` ブランチで GitHub Pages（Source: `main` / root）として公開すると、
`https://<ユーザー名>.github.io/<リポジトリ名>/` で配信されます。

> media-dashboard は Next.js の静的エクスポートで、`_src/media-dashboard/next.config.ts` の
> `basePath: '/portfolio/media-dashboard'` を公開パスに合わせて再ビルドする必要があります。
