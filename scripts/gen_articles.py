import json, re, urllib.request, sys, html, os, time

# Published site identifiers (found in the site's HTML).
SITE = "6vdtmT9SMef8Mgl9tAHO4C"
INDEX_COLLECTION = "6IqdzyrmIapc"
BASE = "https://frenchmaison.co.uk"
INDEX_URL = f"https://framerusercontent.com/sites/{SITE}/searchIndex-{INDEX_COLLECTION}.json"

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JSON = os.path.join(REPO, "articles.json")
COMPONENT = os.path.join(REPO, "Main_Components", "BlogHub.tsx")

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")

idx = json.loads(fetch(INDEX_URL))
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
    # fetch page for og:image + nicer title.
    # Rapid sequential fetches can hit bot protection (a challenge page with no
    # og:image), which would silently blank covers — so retry with backoff until
    # we get a page that actually contains the cover, then fail loudly if not.
    cover_m = None
    page = ""
    for attempt in range(4):
        page = fetch(BASE + path)
        cover_m = og_img_re.search(page)
        if cover_m:
            break
        time.sleep(1.5 * (attempt + 1))
    if not cover_m:
        print(f"ERROR: no og:image for {path} after retries", file=sys.stderr)
        sys.exit(1)
    cover = cover_m.group(2).replace("&amp;", "&")
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
