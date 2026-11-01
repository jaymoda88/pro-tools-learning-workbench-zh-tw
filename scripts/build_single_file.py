"""Assemble a portable HTML edition from the validated multi-file website.

No remote resources are downloaded. Published PDFs and course/video links stay
external; only runtime assets already distributed with the website are embedded.
"""
from __future__ import annotations

import base64
import hashlib
import html
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ("vendor/mermaid.min.js", "vendor/katex/katex.min.js", "vendor/katex/contrib/auto-render.min.js")
STYLES = ("style.css", "responsive.css", "rights.css")
FONT_MIMES = {".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf"}
BOOTSTRAP = """(() => {
  'use strict';
  window.PT_OFFLINE = JSON.parse(document.getElementById('pt-single-file-assets').textContent);
  document.addEventListener('click', event => {
    if (!event.target.closest('a[href="#pt-offline-notices"]')) return;
    event.preventDefault();
    event.stopPropagation();
    const notices = document.getElementById('pt-offline-notices');
    notices.open = true;
    notices.querySelector('summary').focus();
    notices.scrollIntoView({ block: 'start' });
  }, true);
})();"""


def inline_script(source: str, name: str) -> str:
    """Escape HTML raw-text end tags while preserving JavaScript string values."""
    safe = re.sub(r"</script", lambda match: match[0].replace("</", "<\\/"), source, flags=re.I)
    return f'<script data-pt-source="{html.escape(name, quote=True)}">{safe}</script>'


def data_url(path: Path, mime: str) -> str:
    return "data:" + mime + ";base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def build_single_file(source: Path, destination: Path, version: str) -> dict:
    assets = {}
    for path in sorted((source / "assets").glob("*.png")):
        assets[path.relative_to(source).as_posix()] = data_url(path, "image/png")
    css_name = "vendor/katex/katex.min.css"
    css = (source / css_name).read_text(encoding="utf-8")
    font_urls = sorted(set(re.findall(r'url\([\'"]?([^\'"\)]+)[\'"]?\)', css)))
    for url in font_urls:
        font = (source / "vendor/katex" / url).resolve()
        if not font.is_relative_to((source / "vendor/katex/fonts").resolve()) or font.suffix not in FONT_MIMES:
            raise ValueError("Unexpected bundled font URL: " + url)
        key = font.relative_to(source.resolve()).as_posix()
        assets[key] = data_url(font, FONT_MIMES[font.suffix])
    css = re.sub(r'url\([\'"]?([^\'"\)]+)[\'"]?\)', lambda match: match[0].replace(match[1], assets["vendor/katex/" + match[1]]), css)
    notices = [{"path": name, "text": (base / name).read_text(encoding="utf-8")} for base, name in (
        (ROOT, "LICENSE"), (source, "NOTICE.txt"), (ROOT, "CITATION.cff"),
        (source, "vendor/MERMAID-LICENSE.txt"), (source, "vendor/KATEX-LICENSE.txt"),
    )]
    payload = {
        "schemaVersion": 1, "version": version, "assets": assets,
        "scripts": {name: (source / name).read_text(encoding="utf-8") for name in SCRIPTS},
        "styles": {css_name: css}, "notices": notices,
    }
    # Escaping every '<' prevents script termination even inside vendor source.
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    page = (source / "index.html").read_text(encoding="utf-8")
    for name in STYLES:
        text = (source / name).read_text(encoding="utf-8")
        if re.search(r"</style", text, flags=re.I):
            raise ValueError("Unexpected style end tag in " + name)
        link = f'<link rel="stylesheet" href="{name}">'
        if page.count(link) != 1:
            raise ValueError("Expected exactly one stylesheet: " + name)
        page = page.replace(link, f'<style data-pt-source="{name}">{text}</style>')
    inline = '<script type="application/json" id="pt-single-file-assets">' + encoded + '</script>'
    inline += inline_script(BOOTSTRAP, "bootstrap.js")
    for name in ("rights.js", "data.js", "app.js"):
        inline += inline_script((source / name).read_text(encoding="utf-8"), name)
        tag = f'<script src="{name}"></script>'
        if page.count(tag) != 1:
            raise ValueError("Expected exactly one entry script: " + name)
        page = page.replace(tag, "")
    notice_markup = '<details id="pt-offline-notices" class="offline-notices"><summary>署名、使用範圍與第三方授權</summary>'
    for notice in notices:
        notice_markup += '<section><h2>' + html.escape(notice["path"]) + '</h2><pre>' + html.escape(notice["text"]) + '</pre></section>'
    notice_markup += '</details>'
    page = page.replace('href="NOTICE.txt"', 'href="#pt-offline-notices"')
    page = page.replace('<footer class="footer">', notice_markup + '<footer class="footer">')
    page = page.replace('</head>', '<style>.offline-notices{margin:24px clamp(16px,4vw,48px);font-size:14px;overflow-wrap:anywhere}.offline-notices>summary{cursor:pointer;min-height:44px;padding:12px 0}.offline-notices pre{white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.6}.offline-notices h2{font-size:16px}</style></head>')
    page = page.replace('</body>', inline + '</body>')
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(page, encoding="utf-8", newline="\n")
    content = destination.read_bytes()
    return {"path": destination.name, "size": len(content), "sha256": hashlib.sha256(content).hexdigest()}
