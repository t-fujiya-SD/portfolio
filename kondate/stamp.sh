#!/bin/sh
# kondate/index.html の BUILD を今の時刻に書き換える。
# 端末が「新しい版が出た」と気づく目印なので、kondate を直したら公開（push）の前に必ず実行する。
# macOS の sed（BSD）と Linux の sed（GNU）のどちらでも動くよう、-i に拡張子を付けてから消す。
cd "$(dirname "$0")" || exit 1
NEW=$(date -u +%Y%m%d-%H%M%S)
sed -i.bak "s/^const BUILD = '[0-9-]*';/const BUILD = '$NEW';/" index.html || exit 1
rm -f index.html.bak
if ! grep -q "^const BUILD = '$NEW';" index.html; then
  echo "BUILD を書き換えられませんでした" >&2
  exit 1
fi
grep -n "^const BUILD" index.html
