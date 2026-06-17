import json, re, urllib.request, sys, html, os, time

# Everything is read from the PUBLISHED domain (sitemap + page OpenGraph tags),
# which is built to be crawled. We deliberately avoid framerusercontent.com
# (Framer's asset host) because its Cloudflare bot protection 403s datacenter
# IPs such as GitHub Actions runners.
BASE = "https://frenchmaison.co.uk"
SITEMAP_URL = f"{BASE}/sitemap.xml"

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JSON = os.path.join(REPO, "articles.json")
COMPONENT = os.path.join(REPO, "Main_Components", "BlogHub.tsx")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
}

def fetch(url, tries=4):
    last = None
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
        except Exception as e:  # noqa: BLE001 — retry transient blocks/timeouts
            last = e
            time.sleep(1.5 * (attempt + 1))
    raise last

def og(page, prop):
    m = re.search(
        rf'<meta[^>]+property=["\']og:{prop}["\'][^>]+content=(["\'])(.*?)\1',
        page, re.I,
    )
    return html.unescape(m.group(2).replace("&amp;", "&")) if m else ""

# 1) Collect all /blog/ post URLs from the sitemap.
sitemap = fetch(SITEMAP_URL)
paths = sorted(set(re.findall(r"/blog/[a-z0-9-]+", sitemap)))

date_re = re.compile(r"\b\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20\d{2}\b")
read_re = re.compile(r"\b(\d+)\s*min read\b")

articles = []
for path in paths:
    page = fetch(BASE + path)
    text = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", page)))

    cover = re.sub(r"\?width=\d+&height=\d+", "", og(page, "image"))
    title = og(page, "title").strip()
    excerpt = og(page, "description").strip()
    dm = date_re.search(text)
    rm = read_re.search(text)
    date = dm.group(0) if dm else ""
    read = f"{rm.group(1)} min read" if rm else ""
    author = "The French Maison Team" if "The French Maison Team" in text else ""

    if not (cover and title):
        print(f"ERROR: missing cover/title for {path}", file=sys.stderr)
        sys.exit(1)

    articles.append({
        "title": title,
        "excerpt": excerpt,
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

json.dump(articles, open(OUT_JSON, "w"), indent=2, ensure_ascii=False)
print(f"\nWrote {len(articles)} articles -> {OUT_JSON}", file=sys.stderr)

# --- Bake the same data into BlogHub.tsx between the ARTICLES markers, so the
#     posts are present in Framer's statically-rendered HTML (crawlable links).
def ts(v):
    return json.dumps(v, ensure_ascii=False)

rows = []
for x in articles:
    rows += [
        "    {",
        f"        title: {ts(x['title'])},",
        f"        excerpt: {ts(x['excerpt'])},",
        f"        cover: {ts(x['cover'])},",
        f"        date: {ts(x['date'])},",
        f"        href: {ts(x['href'])},",
        f"        author: {ts(x.get('author',''))},",
        f"        readTime: {ts(x.get('readTime',''))},",
        "    },",
    ]
block = "\n".join(rows)

src = open(COMPONENT).read()
new, n = re.subn(
    r"(// ARTICLES:START[^\n]*\n).*?(    // ARTICLES:END)",
    lambda m: m.group(1) + block + "\n" + m.group(2),
    src,
    flags=re.S,
)
if n != 1:
    print("WARNING: ARTICLES markers not found in BlogHub.tsx — baked array NOT updated", file=sys.stderr)
else:
    open(COMPONENT, "w").write(new)
    print(f"Baked {len(articles)} articles into {COMPONENT}", file=sys.stderr)
