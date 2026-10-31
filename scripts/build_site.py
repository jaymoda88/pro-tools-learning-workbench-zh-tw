"""Build identical public-safe website editions from authored sources and generated data."""
from __future__ import annotations

import argparse
from pathlib import Path
import shutil
import tempfile

ROOT = Path(__file__).resolve().parents[1]
AUTHORED_FILES = ("index.html", "app.js", "style.css", "responsive.css")
PDF_NAMES = (
    "Pro_Tools_Reference_Guide_2023.3.pdf",
    "Pro_Tools_Shortcuts_2023.3.pdf",
)
AVID_BASE = "https://resources.avid.com/SupportFiles/PT/"


def copy_public(source: Path, destination: Path) -> None:
    """Copy runtime assets, excluding source books and local filesystem metadata."""
    if not source.is_dir():
        raise SystemExit(f"Missing runtime asset directory: {source.relative_to(ROOT)}")
    shutil.copytree(
        source,
        destination,
        ignore=shutil.ignore_patterns("*.pdf", "*.PDF", ".DS_Store", "._*", "__pycache__", "*.pyc"),
    )


def folder_files(folder: Path) -> dict[str, bytes]:
    return {str(file.relative_to(folder)): file.read_bytes() for file in folder.rglob("*") if file.is_file()}


def prepare(staging: Path) -> None:
    authored = ROOT / "src"
    static = ROOT / "public"
    for name in AUTHORED_FILES:
        source = authored / name
        if not source.is_file():
            raise SystemExit(f"Missing authored file: {source.relative_to(ROOT)}")
        shutil.copyfile(source, staging / name)
    data = ROOT / "dist" / "data.js"
    if not data.is_file():
        raise SystemExit("Missing dist/data.js; run npm run build:data first.")
    shutil.copyfile(data, staging / "data.js")
    for directory in ("assets", "vendor"):
        copy_public(static / directory, staging / directory)
    for file in staging.rglob("*"):
        if file.suffix.lower() in (".html", ".js", ".css"):
            text = file.read_text(encoding="utf-8")
            for name in PDF_NAMES:
                text = text.replace("assets/" + name, AVID_BASE + name)
            file.write_text(text, encoding="utf-8", newline="\n")
    if any(file.suffix.lower() == ".pdf" for file in staging.rglob("*")):
        raise SystemExit("Public output must not contain PDF files.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Compare generated editions without changing them.")
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix=".site-build-", dir=ROOT) as temporary:
        staging = Path(temporary)
        prepare(staging)
        expected = folder_files(staging)
        for name in ("dist", "site-dist"):
            output = ROOT / name
            if args.check:
                actual = folder_files(output) if output.is_dir() else {}
                if actual != expected:
                    changed = sorted(key for key in set(actual) | set(expected) if actual.get(key) != expected.get(key))
                    raise SystemExit(f"{name}/ is stale: " + ", ".join(changed[:12]))
            else:
                if output.exists():
                    shutil.rmtree(output)
                shutil.copytree(staging, output)
        verb = "Verified" if args.check else "Built"
        print(f"{verb} dist/ and site-dist/: {len(expected)} files each; source PDF links use Avid official URLs.")


if __name__ == "__main__":
    main()
