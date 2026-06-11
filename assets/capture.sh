#!/usr/bin/env bash
# ポートフォリオ用のデモ画面スクリーンショットを再生成する。
# 事前に /portfolio/ 配下で配信するローカルサーバを起動しておくこと:
#   ln -sfn ~/Documents/portfolio-demos ~/Documents/.pf_preview/portfolio
#   python3 -m http.server 8132 --directory ~/Documents/.pf_preview
# その後このスクリプトを実行: bash assets/capture.sh
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://localhost:8132/portfolio"
DIR="$(cd "$(dirname "$0")" && pwd)"

shot(){ "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1280,840 --virtual-time-budget=6000 \
  --screenshot="$DIR/$2" "$1" >/dev/null 2>&1; echo "[OK] $2"; }

shot "$BASE/drink-tracker/index.html"      shot-drink.png
shot "$BASE/monthly-report/index.html"    shot-report.png
shot "$BASE/media-dashboard/"             shot-media.png
shot "$BASE/opening-simulator/index.html"   shot-opening.png
shot "$BASE/opening-checklist/index.html"  shot-checklist.png
shot "$BASE/instagram-analytics/index.html" shot-instagram.png
echo "done."
