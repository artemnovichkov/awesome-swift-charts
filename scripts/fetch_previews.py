#!/usr/bin/env python3
"""Collects og:image previews for every link in src/contents/index.md.

Writes src/assets/js/previews.js, which the site uses for thumbnails.
Images are hotlinked from their sources, never stored in the repo.
"""
import html
import json
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src/contents/index.md"
OUTPUT = ROOT / "src/assets/js/previews.js"

# Generic or expiring images that say nothing about the resource
SKIP = (
    "developer-og.jpg",
    "chatgpt.com/backend-api",
    "opengraph.githubassets.com",
    "swiftwithmajid.com/public",
)

META = re.compile(r"<meta[^>]+>", re.I)
PROP = re.compile(r'(?:property|name)\s*=\s*["\'](?:og:image|twitter:image)["\']', re.I)
CONTENT_ATTR = re.compile(r'content\s*=\s*["\']([^"\']+)["\']', re.I)


def preview(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            page = response.read(400_000).decode("utf-8", "ignore")
    except Exception as error:
        print(f"skip {url}: {error}")
        return url, None
    for tag in META.findall(page):
        if PROP.search(tag):
            match = CONTENT_ATTR.search(tag)
            if match:
                image = html.unescape(match.group(1))
                if any(s in image for s in SKIP):
                    return url, None
                if "i.ytimg.com" in image:
                    image = image.replace("maxresdefault", "hqdefault")
                return url, image
    return url, None


def main():
    content = CONTENT.read_text()
    body = content.split("\n## ", 1)[1]
    urls = list(dict.fromkeys(re.findall(r"^- \[[^\]]+\]\(([^)]+)\)", body, re.M)))
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = dict(pool.map(preview, urls))
    previews = {url: image for url, image in results.items() if image}
    OUTPUT.write_text("window.PREVIEWS = " + json.dumps(previews, indent=2) + ";\n")
    print(f"{len(previews)}/{len(urls)} previews -> {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
