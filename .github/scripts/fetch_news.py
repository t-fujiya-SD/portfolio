#!/usr/bin/env python3
# TOYO LINK 業界ニュース生成: Google ニュースRSSをカテゴリ別に取得し news.json を書き出す。
# 使い方: python3 fetch_news.py <出力パス>   （省略時 toyosu-relay/news.json）
import sys, json, html, datetime, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

CATS = [
    ("market",  "市況・相場",   "卸売市場 市況 OR 相場 OR せり OR 卸売価格 OR 入荷"),
    ("business","卸ビジネス",   "食品卸 OR 青果卸 OR 水産卸 (経営 OR 決算 OR 価格改定 OR 新会社 OR 提携 OR 物流)"),
    ("toyosu",  "豊洲・首都圏", "豊洲市場 OR 東京都中央卸売市場 OR 大田市場 OR 首都圏 卸売市場"),
]
PER_CAT = 8     # カテゴリあたり最大件数
TOTAL   = 24    # 全体の上限

def fetch(query):
    url = ("https://news.google.com/rss/search?q=" + urllib.parse.quote(query)
           + "&hl=ja&gl=JP&ceid=JP:ja")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return ET.fromstring(urllib.request.urlopen(req, timeout=25).read())

def parse_items(root, cat):
    out = []
    for it in root.findall(".//item"):
        title = html.unescape(it.findtext("title", "") or "").strip()
        link = it.findtext("link", "") or ""
        src_el = it.find("{*}source")
        source = (src_el.text if src_el is not None else "") or ""
        if source and title.endswith(" - " + source):
            title = title[: -(len(source) + 3)].strip()
        pub = it.findtext("pubDate", "") or ""
        try:
            date = datetime.datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S %Z").strftime("%Y-%m-%d")
        except Exception:
            date = ""
        if title and link:
            out.append({"title": title, "link": link, "source": source, "date": date, "cat": cat})
    return out

def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else "toyosu-relay/news.json"
    seen = set()
    items = []
    for key, label, q in CATS:
        try:
            got = parse_items(fetch(q), key)
        except Exception as e:
            print(f"[warn] {key}: {e}", file=sys.stderr)
            got = []
        n = 0
        for it in got:
            k = it["title"]
            if k in seen:
                continue
            seen.add(k)
            items.append(it)
            n += 1
            if n >= PER_CAT:
                break
    items.sort(key=lambda x: x["date"], reverse=True)
    items = items[:TOTAL]
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9)))
    data = {
        "updated": now.strftime("%Y-%m-%dT%H:%M:%S+09:00"),
        "source": "Google ニュース",
        "cats": [{"key": k, "label": l} for k, l, _ in CATS],
        "items": items,
    }
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False, indent=2))
    print(f"wrote {out_path}: {len(items)} items / updated {data['updated']}")

if __name__ == "__main__":
    main()
