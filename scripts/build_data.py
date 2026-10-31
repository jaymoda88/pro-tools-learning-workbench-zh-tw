"""Build website data with Python's standard library and vendored markdown2.

Obsidian source files stay unchanged. Website documents use descriptive link
labels, browser routes, official source URLs, and no plugin-only queries.
"""

import argparse
import html
import json
import re
import sys
import unicodedata
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "vendor"))
import markdown2

PDF_BASE = "https://resources.avid.com/SupportFiles/PT/"
PDF_TITLES = {
    "Pro_Tools_Reference_Guide_2023.3.pdf": "Reference Guide 2023.3",
    "Pro_Tools_Shortcuts_2023.3.pdf": "Mac Shortcuts Guide 2023.3",
}
CATEGORIES = [
    ("setup", "入門與系統設定", "Setup", 1, 10),
    ("session", "Session 與素材", "Session", 11, 22),
    ("record", "錄音與播放", "Recording", 23, 27),
    ("edit", "Audio 剪輯", "Editing", 28, 34),
    ("midi", "MIDI 與編排", "MIDI", 35, 40),
    ("process", "聲音處理", "Processing", 41, 49),
    ("mix", "混音與交付", "Mixing", 50, 54),
    ("spatial", "空間音訊與影像", "Spatial", 55, 66),
]


def slug(text):
    """Use the same stable heading IDs for document routes and local anchors."""
    characters = (
        char
        for char in text.lower().strip()
        if char in " -_" or unicodedata.category(char)[0] in "LNM"
    )
    return "".join(characters).replace(" ", "-")


def visible_title(title):
    return re.sub(r"^Ch\d+[a-z]?\s*[—–-]\s*", "", title, flags=re.I)


def read_document(path):
    raw = path.read_text(encoding="utf-8")
    body = re.sub(r"^---\n.*?\n---\n", "", raw, count=1, flags=re.S)
    title_match = re.search(r"^# (.+)$", body, flags=re.M)
    if not title_match:
        raise ValueError(f"Missing document title: {path.name}")
    summary = re.search(r"^> (?!\[!)(.+)", body, flags=re.M)
    chapter = re.search(r"^chapter:\s*(\d+)", raw, flags=re.M)
    return {
        "id": path.stem,
        "title": title_match.group(1),
        "summary": summary.group(1).replace("**", "") if summary else "",
        "chapter": int(chapter.group(1)) if chapter else 0,
        "_body": body,
    }


def web_body(body):
    """Translate vault navigation instructions into the website's actual UI."""
    body = re.sub(r"%%.*?%%", "", body, flags=re.S)
    body = re.sub(r"^# .+\n", "", body, count=1, flags=re.M)
    body = re.sub(r"^\s*標籤[:：]\s*#[^\n]*$", "", body, flags=re.M)
    # These plugin queries cannot run in a standalone browser. The website
    # already creates a source-backed index and tracks reading state itself.
    body = re.sub(
        r"^## (?:自動列出教學筆記|待完成項目（Tasks）)\n.*?(?=^## |\Z)",
        "",
        body,
        flags=re.M | re.S,
    )
    body = body.replace("本機 PDF 的對應頁", "Avid 官方 PDF 的對應頁")
    body = body.replace("官方原文已另存本機：", "官方原文：")
    body = body.replace("開啟附件 PDF 的章首", "開啟 Avid 官方 PDF 的章首")
    body = body.replace("方便離線查詢", "方便核對原文（需網路連線）")
    body = re.sub(
        r"1\. `Cmd\+O`[^\n]*",
        "1. 使用本頁的段落目錄，或用 `Cmd+F` 搜「補錄」「人聲」「輸出」等需求。",
        body,
    )
    body = re.sub(
        r"3\. 用 Obsidian Search[^\n]*",
        "3. 使用上方全站搜尋列，輸入中文需求或英文功能，例如 `Elastic Audio`。",
        body,
    )
    body = re.sub(
        r"或用 Obsidian Search 限定 `[^`]+`。",
        "或用上方搜尋列找中文需求與英文功能。",
        body,
    )
    body = re.sub(
        r"用法：`Cmd\+F`[^\n]*Obsidian Search[^\n]*",
        "用法：`Cmd+F` 可查本頁；上方全站搜尋列可查教學內容，互動 Mac 快捷鍵頁另提供情境與按鍵篩選。",
        body,
    )
    return body


def render_documents(documents, notes):
    by_id = {document["id"]: document for document in documents}
    note_ids = {note["id"] for note in notes}
    chapter_titles = {}
    for note in notes:
        chapter_titles.setdefault(note["chapter"], visible_title(note["title"]))

    for document in documents:
        held = []

        def hold(markup):
            held.append(markup)
            return f"PTWEBTOKEN{len(held) - 1}END"

        def wiki(match):
            embed, value = match.groups()
            target, *aliases = value.replace("\\|", "|").split("|", 1)
            name, separator, anchor = target.partition("#")
            basename = Path(name).name
            explicit_label = aliases[0] if aliases else ""
            if basename in PDF_TITLES:
                url = PDF_BASE + urllib.parse.quote(basename, safe="")
                if separator:
                    url += "#" + anchor
                label = explicit_label or PDF_TITLES[basename]
                # Default filenames are identifiers, never reader-facing labels.
                if label == target or label == name:
                    label = PDF_TITLES[basename]
                page = re.fullmatch(r"page=(\d+)", anchor)
                if not explicit_label and page:
                    label += f"（PDF 第 {page.group(1)} 頁）"
                return hold(
                    '<a href="' + html.escape(url, quote=True)
                    + '" target="_blank" rel="noopener">'
                    + html.escape(label) + "</a>"
                )
            if basename.lower().endswith(".png"):
                url = "assets/" + urllib.parse.quote(basename, safe="")
                image_chapter = re.match(r"PT-Ch(\d+)", basename)
                number = int(image_chapter.group(1)) if image_chapter else document["chapter"]
                context = chapter_titles.get(number, visible_title(document["title"]))
                alt = explicit_label or f"第 {number:02d} 章教學圖解：{context}"
                return hold(
                    '<img alt="' + html.escape(alt, quote=True)
                    + '" src="' + url + '">'
                    if embed else '<a href="' + url + '">' + html.escape(alt) + "</a>"
                )
            if name in by_id:
                destination = "#/note/" if name in note_ids else "#/reference/"
                destination += urllib.parse.quote(name, safe="")
                label = explicit_label or visible_title(by_id[name]["title"])
                if label.startswith("PT-"):
                    label = visible_title(by_id[name]["title"])
            elif not name:
                destination = ""
                label = explicit_label or anchor
            else:
                label = explicit_label or re.sub(r"^[A-Za-z]+-\d+-", "", name)
                return hold(
                    '<span class="external-vault-link" title="另一本學習資料的參照">'
                    + html.escape(label) + "</span>"
                )
            if separator:
                destination += "#" + slug(anchor)
            return hold(
                '<a href="' + html.escape(destination, quote=True) + '">'
                + html.escape(label) + "</a>"
            )

        body = web_body(document.pop("_body"))
        document["summary"] = document["summary"].replace("本機 PDF", "Avid 官方 PDF")
        document["mermaidCount"] = len(re.findall(r"^```mermaid\s*$", body, flags=re.M))
        document["mathCount"] = len(re.findall(r"\$\$.*?\$\$|(?<!\$)\$[^$\n]+\$(?!\$)", body, flags=re.S))
        body = re.sub(r"(!?)\[\[([^\]]+)\]\]", wiki, body)
        # Hold math and Mermaid before Markdown so underscores and highlighting
        # cannot damage their content. Links use the same mechanism.
        body = re.sub(
            r"^```mermaid\s*\n(.*?)^```\s*$",
            lambda match: "\n\n" + hold(
                '<pre><code class="language-mermaid">'
                + html.escape(match.group(1)) + "</code></pre>"
            ) + "\n\n",
            body,
            flags=re.M | re.S,
        )
        body = re.sub(
            r"\$\$.*?\$\$|(?<!\$)\$[^$\n]+\$(?!\$)",
            lambda match: hold(html.escape(match.group(0))),
            body,
            flags=re.S,
        )
        callout_titles = {"tip": "實務連結", "warning": "注意", "important": "重點", "abstract": "Takeaway"}
        body = re.sub(
            r"^> \[!([a-z]+)\][+-]?\s*(.*)",
            lambda match: "> **" + (match.group(2) or callout_titles.get(match.group(1), "補充")) + "**",
            body,
            flags=re.M,
        )
        rendered = str(markdown2.markdown(
            body,
            extras=["tables", "fenced-code-blocks", "strike", "task_list", "footnotes"],
        ))
        for index, markup in enumerate(held):
            token = f"PTWEBTOKEN{index}END"
            # Mermaid is block content; inline wiki links stay inside paragraphs.
            if markup.startswith("<pre>"):
                rendered = rendered.replace("<p>" + token + "</p>", markup)
            rendered = rendered.replace(token, markup)
        headings = []
        seen = {}

        def heading(match):
            level, content = int(match.group(1)), match.group(2)
            text = html.unescape(re.sub(r"<[^>]+>", "", content))
            base = slug(text)
            occurrence = seen.get(base, 0)
            seen[base] = occurrence + 1
            identifier = base + (f"-{occurrence}" if occurrence else "")
            headings.append({"id": identifier, "text": text, "level": level})
            return f'<h{level} id="{html.escape(identifier, quote=True)}">{content}</h{level}>'

        rendered = re.sub(r"<h([1-6])>(.*?)</h\1>", heading, rendered, flags=re.S)
        document.update(
            html=rendered,
            headings=headings,
            plain=html.unescape(re.sub(r"<[^>]+>", " ", rendered)),
        )


def read_shortcuts(source):
    shortcuts = []
    group = ""
    for line in (source / "PT-00-Mac快捷鍵.md").read_text(encoding="utf-8").splitlines():
        if re.match(r"^## \d\d｜", line):
            group = line[3:]
        if not re.match(r"^\| K\d{3} ", line):
            continue
        cells = [cell.strip() for cell in re.split(r"(?<!\\)\|", line)[1:-1]]
        pdf_page = re.search(r"#page=(\d+)", cells[4])
        source_page = re.search(r"S(\d+)", cells[4])
        if not pdf_page or not source_page:
            raise ValueError(f"Shortcut source page missing: {cells[0]}")
        shortcuts.append({
            "id": cells[0], "action": cells[1], "key": cells[2].strip("`"),
            "context": cells[3], "sourcePage": int(source_page.group(1)),
            "pdfPage": int(pdf_page.group(1)), "group": group,
        })
    return shortcuts


def navigation(notes):
    def exact(prefix):
        matches = [note["id"] for note in notes if note["id"].startswith(prefix)]
        if len(matches) != 1:
            raise ValueError(f"Navigation prefix must identify one note: {prefix}")
        return matches[0]

    definitions = [
        ("開始第一個 Session", "從資料結構、建立 Session 到 Track 與 I/O 設定。", ["02a", "11a", "07a", "06a", "12a", "13a", "13b"]),
        ("錄好人聲與樂器", "先安排路由與監聽，再錄音、補錄和保留 Take。", ["06a", "24a", "24b", "25a", "25b", "27a", "33a"]),
        ("把鼓剪得準又自然", "選取、偵測、對拍，再處理接縫與時間修正。", ["29a", "29b", "30", "34a", "34b", "32a", "45b"]),
        ("整理人聲與 Comping", "挑選 Take、整理接縫，再處理 Clip Gain、音準與 Automation。", ["33a", "33b", "32a", "44a", "46", "53a"]),
        ("從混音到交付", "訊號流、Send、效果回送與 Automation，接著選擇 Commit、Freeze 或輸出。", ["50a", "50b", "50c", "51a", "53a", "47a", "47b", "54"]),
        ("排查沒有聲音與延遲", "依序查 Playback Engine、Hardware、I/O、Input Monitoring 和 Track 路由。", ["07a", "07b", "06a", "06b", "24b", "13c", "50d"]),
        ("MIDI 編曲與 Tempo", "先確認路由與錄音，再進入音符、量化與 Tempo 編排。", ["10", "26a", "35a", "36", "35c", "39a", "39b", "48a"]),
        ("空間音訊與影像", "從 Multichannel 路由進入 Atmos、同步、Video 與交付。", ["55", "56", "57", "58a", "58b", "58c", "60a", "63a"]),
    ]
    workflows = []
    for title, description, prefixes in definitions:
        note_ids = [exact("PT-Ch" + prefix + "-") for prefix in prefixes]
        chapter_by_id = {note["id"]: note["chapter"] for note in notes}
        workflows.append({
            "title": title, "description": description, "noteIds": note_ids,
            "chapters": list(dict.fromkeys(chapter_by_id[identifier] for identifier in note_ids)),
        })
    features = {
        "bus": "06b", "send": "50b", "source": "50a", "aux": "50c",
        "master": "50a", "output": "06a", "commit": "47a", "freeze": "47b",
        "bounce": "47b", "monitoring": "24b", "playbackEngine": "07a",
        "troubleshooting": "07b",
    }
    return workflows, {name: exact("PT-Ch" + prefix + "-") for name, prefix in features.items()}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=ROOT / "content")
    parser.add_argument("--output", type=Path, default=ROOT / "dist" / "data.js")
    args = parser.parse_args()
    notes = [read_document(path) for path in sorted(args.source.glob("PT-Ch*.md"))]
    pages = [read_document(path) for path in sorted(args.source.glob("PT-00-*.md"))]
    if not notes or not pages:
        raise ValueError("Chapter notes and reference source pages are required")
    for note in notes:
        note["category"] = next(category[0] for category in CATEGORIES if category[3] <= note["chapter"] <= category[4])
        note["type"] = "study-note"
    for page in pages:
        page.update(category="reference", type="reference")
    render_documents(notes + pages, notes)
    workflows, features = navigation(notes)
    shortcuts = read_shortcuts(args.source)
    data = {
        "notes": notes, "pages": pages, "shortcuts": shortcuts,
        "workflows": workflows, "featureNoteIds": features,
        "categories": [{"id": category[0], "name": category[1], "english": category[2]} for category in CATEGORIES],
        "sourceDocuments": {name: PDF_BASE + name for name in PDF_TITLES},
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        "window.PT_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"Built {len(notes)} notes, {len(pages)} references, {len(shortcuts)} shortcuts, {len(workflows)} workflows.")


if __name__ == "__main__":
    main()
