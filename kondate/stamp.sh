#!/bin/sh
# kondate/index.html の BUILD を今の時刻に書き換える。
# 端末が「新しい版が出た」と気づく目印なので、kondate を直したら公開（push）の前に必ず実行する。
cd "$(dirname "$0")" || exit 1
sed -i "s/^const BUILD = '[0-9-]*';/const BUILD = '$(date -u +%Y%m%d-%H%M%S)';/" index.html
grep -n "^const BUILD" index.html
