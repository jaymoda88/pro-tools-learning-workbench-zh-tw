"""Create a reproducible, PDF-free website ZIP and its SHA-256 checksum."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import zipfile

from build_single_file import build_single_file

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version", help="Expected package version (used by tag-triggered releases).")
    args = parser.parse_args()
    version = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
    if args.version and args.version != version:
        raise SystemExit(f"Tag version {args.version} does not match package.json version {version}.")
    source = ROOT / "site-dist"
    required = ("index.html", "app.js", "data.js", "style.css", "responsive.css", "rights.js", "rights.css", "NOTICE.txt")
    if not all((source / name).is_file() for name in required):
        raise SystemExit("Missing generated website; run npm run build and npm run check first.")
    files = sorted(file for file in source.rglob("*") if file.is_file())
    if any(file.suffix.lower() == ".pdf" for file in files):
        raise SystemExit("Release aborted: source PDF files are not permitted in public website packages.")
    output = ROOT / "release"
    output.mkdir(exist_ok=True)
    archive = output / f"pro-tools-workbench-v{version}.zip"
    readme = (
        f"Pro Tools 工作台 v{version}\n"
        "整理與製作：許惟傑 Xue_hwcxx · GitHub @jaymoda88\n\n"
        "解壓後開啟 index.html。搜尋、教學筆記、Mac 快捷鍵與原創圖解已包含在網站包。\n"
        "原書查閱連結指向 Avid 官方 PDF，需要網路連線。\n"
        "原創部分未授權商用；第三方依各自附帶授權，詳見 LICENSE 與 NOTICE.txt。\n"
        "圖解含像素署名及來源指紋；網頁／列印含可見浮水印。\n"
        "若瀏覽器限制本機圖表，於此資料夾執行 python3 -m http.server 4173，\n"
        "再開啟 http://localhost:4173。收藏與閱讀進度可在設定中匯出／匯入。\n"
        "https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw\n"
        "官方 Release 來源驗證：gh attestation verify pro-tools-workbench-v" + version
        + ".zip -R jaymoda88/pro-tools-learning-workbench-zh-tw\n"
        "PROVENANCE.json 的 SHA-256 供完整性核對；雜湊不是加密，也不能阻止複製。\n"
    )
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
        entries = [(str(file.relative_to(source)).replace("\\", "/"), file.read_bytes()) for file in files]
        entries.append(("README.txt", readme.encode("utf-8")))
        entries.append(("LICENSE", (ROOT / "LICENSE").read_bytes()))
        entries.append(("CITATION.cff", (ROOT / "CITATION.cff").read_bytes()))
        manifest = {
            "schemaVersion": 1, "version": version,
            "owner": "許惟傑 Xue_hwcxx", "policy": "All rights reserved; commercial reuse requires written permission",
            "sourceRepository": "https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw",
            "hashAlgorithm": "SHA-256",
            "limits": "Integrity hashes are not encryption or proof of ownership. Official Release provenance is separately signed by GitHub Actions.",
            "files": [{"path": name, "size": len(payload), "sha256": hashlib.sha256(payload).hexdigest()}
                      for name, payload in sorted(entries)],
        }
        entries.append(("PROVENANCE.json", (json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")))
        for name, data in sorted(entries):
            info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            bundle.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    with zipfile.ZipFile(archive) as bundle:
        corrupt = bundle.testzip()
        if corrupt:
            raise SystemExit(f"Release ZIP verification failed: {corrupt}")
        manifest = json.loads(bundle.read("PROVENANCE.json"))
        for record in manifest["files"]:
            payload = bundle.read(record["path"])
            if len(payload) != record["size"] or hashlib.sha256(payload).hexdigest() != record["sha256"]:
                raise SystemExit("Release provenance manifest mismatch: " + record["path"])
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    single = build_single_file(source, output / f"pro-tools-workbench-v{version}.html", version)
    (output / "SHA256SUMS.txt").write_text(
        f"{digest}  {archive.name}\n{single['sha256']}  {single['path']}\n",
        encoding="utf-8", newline="\n",
    )
    print(f"Packaged {single['path']}: {single['size']:,} bytes; SHA256 {single['sha256']}")
    print(f"Packaged {archive.name}: {archive.stat().st_size:,} bytes; SHA256 {digest}")


if __name__ == "__main__":
    main()
