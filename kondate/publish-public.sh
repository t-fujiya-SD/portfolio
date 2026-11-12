#!/bin/sh
# 公開版（osakana.spicy-device.com）へ、家庭用と同じ index.html とアイコンを写す。
# 使い方: kondate/publish-public.sh <公開用リポジトリを clone したフォルダ>
#   1) 先に kondate/stamp.sh で BUILD を更新し、portfolio 側を commit しておく
#   2) このスクリプトで写す（CNAME が無ければ作る）
#   3) 写した先で内容を確かめてから commit・push する（このスクリプトは push しない）
# 動きはホスト名で切り替わるので、ファイルは家庭用とまったく同じものを置く。
set -e
SRC=$(cd "$(dirname "$0")" && pwd)
DST=${1:?公開用リポジトリのフォルダを指定してください}
[ -d "$DST/.git" ] || { echo "$DST は git のフォルダではありません" >&2; exit 1; }
cp "$SRC/index.html" "$SRC/icon-180.png" "$SRC/icon-512.png" "$DST/"
[ -f "$DST/CNAME" ] || echo "osakana.spicy-device.com" > "$DST/CNAME"
[ -f "$DST/.nojekyll" ] || : > "$DST/.nojekyll"
grep -n "^const BUILD" "$DST/index.html"
echo "写しました。$DST で git diff を確かめてから commit・push してください。"
