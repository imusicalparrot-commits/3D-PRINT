import json, time, random, os

ROOT = os.path.dirname(os.path.abspath(__file__))  # _dev folder
BATCH = 40

urls = [l.strip() for l in open(os.path.join(ROOT, "passed_links.txt"), encoding="utf-8") if l.strip()]
state_path = os.path.join(ROOT, "_fetch_state.json")
if os.path.exists(state_path):
    state = json.load(open(state_path, encoding="utf-8"))
else:
    state = {"results": {}, "cursor": 0}

def slug(u):
    return u.split("/product/")[1].rstrip("/")

BAD_WORDS = ("just a moment", "captcha", "access denied", "attention required", "blocked")

start = state["cursor"]
end = min(start + BATCH, len(urls))

if start < len(urls):
    u = urls[start]
    t = current_tab()
    if not t:
        new_tab(u)
    else:
        goto_url(u)
    wait_for_load()

ok = 0
for i in range(start, end):
    u = urls[i]
    s = slug(u)
    img, ttl = "", ""
    try:
        goto_url(u)
        wait_for_load()
        time.sleep(random.uniform(0.8, 1.6))
        img = js("(document.querySelector('meta[property=\"og:image\"]')||{}).content || ''") or ""
        ttl = js("(document.querySelector('meta[property=\"og:title\"]')||{}).content || ''") or ""
    except Exception as e:
        ttl = "ERR: " + str(e)[:80]
    low = ttl.lower()
    flagged = (not img) or any(w in low for w in BAD_WORDS)
    state["results"][s] = {"img": img, "title": ttl, "flag": 1 if flagged else 0}
    if not flagged:
        ok += 1
    print("%3d/%d %s %s" % (i + 1, len(urls), "OK " if not flagged else "WARN", s))

state["cursor"] = end
json.dump(state, open(state_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("BATCH DONE ok=%d warn=%d cursor=%d/%d" % (ok, (end - start) - ok, end, len(urls)))
