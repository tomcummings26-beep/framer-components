import json, re, urllib.request, sys, html

SITE = "6vdtmT9SMef8Mgl9tAHO4C"
IDX = "/tmp/idx_6IqdzyrmIapc.json"
BASE = "https://frenchmaison.co.uk"

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")

idx = json.load(open(IDX))
blog = {k: v for k, v in idx.items() if k.startswith("/blog/")}

date_re = re.compile(r"^\d{1,2} [A-Z][a-z]{2} \d{4}$")
og_img_re = re.compile(r'<meta[^>]+property=["\']og:image["\'][^>]+content=(["\'])(.*?)\1', re.I)
og_title_re = re.compile(r'<meta[^>]+property=["\']og:title["\'][^>]+content=(["\'])(.*?)\1', re.I)

articles = []
for path, data in blog.items():
    ps = data.get("p", [])
    # date
    date = next((p for p in ps if date_re.match(p.strip())), "")
    # read time: number immediately followed by "min read"
    read = ""
    for i, p in enumerate(ps):
        if p.strip() == "min read" and i > 0 and ps[i-1].strip().isdigit():
            read = f"{ps[i-1].strip()} min read"; break
    # author
    author = next((p for p in ps if "French Maison" in p), "")
    # fetch page for og:image + nicer title
    page = fetch(BASE + path)
    cover_m = og_img_re.search(page)
    cover = cover_m.group(2).replace("&amp;", "&") if cover_m else ""
    # strip framer width/height bloat from cover (we re-optimize via proxy anyway)
    cover = re.sub(r"\?width=\d+&height=\d+", "", cover)
    title_m = og_title_re.search(page)
    title = html.unescape((title_m.group(2) if title_m else data.get("title", "")).strip())
    articles.append({
        "title": title,
        "excerpt": html.unescape(data.get("description", "").strip()),
        "cover": cover,
        "date": date,
        "href": path,
        "author": author,
        "readTime": read,
    })
    print(f"OK  {path:55s} img={'Y' if cover else 'N'} date={date!r} read={read!r}", file=sys.stderr)

# sort newest first by parsed date
months = {m:i for i,m in enumerate(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],1)}
def keyf(a):
    m = re.match(r"(\d{1,2}) (\w{3}) (\d{4})", a["date"] or "")
    if not m: return (0,0,0)
    return (int(m.group(3)), months.get(m.group(2),0), int(m.group(1)))
articles.sort(key=keyf, reverse=True)

json.dump(articles, open("/tmp/articles.json","w"), indent=2, ensure_ascii=False)
print(f"\nWrote {len(articles)} articles", file=sys.stderr)
