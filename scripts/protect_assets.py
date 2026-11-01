"""Add a readable ownership footer and provenance metadata to original PNG diagrams.

This marks ownership and reuse policy; it is not DRM and does not prevent copying.
No diagram pixels are covered: the footer is added below the original content.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import shutil

SCHEMA_VERSION = 1
OWNER = "許惟傑 Xue_hwcxx"
POLICY = "non-commercial-v1"
METADATA_KEY = "pt_provenance"
PROTECTION_VERSION = "footer-v1"


def _digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _current_metadata(info: dict) -> dict | None:
    """Recognize only our complete current metadata, avoiding accidental re-marking."""
    try:
        value = json.loads(info.get(METADATA_KEY, ""))
    except (TypeError, ValueError):
        return None
    if not isinstance(value, dict):
        return None
    if (
        value.get("schemaVersion") != SCHEMA_VERSION
        or value.get("owner") != OWNER
        or value.get("policy") != POLICY
        or value.get("protectionVersion") != PROTECTION_VERSION
    ):
        return None
    source_hash = value.get("sourceSha256")
    if not isinstance(source_hash, str) or len(source_hash) != 64:
        return None
    try:
        int(source_hash, 16)
    except ValueError:
        return None
    for field in ("sourceSize", "protectedSize"):
        size = value.get(field)
        if not isinstance(size, list) or len(size) != 2 or not all(isinstance(n, int) and n > 0 for n in size):
            return None
    return value


def protect_png(source: Path | str, destination: Path | str) -> dict:
    """Protect one original PNG; byte-copy already-current protected images."""
    from PIL import Image, ImageDraw, ImageFont, PngImagePlugin

    source = Path(source)
    destination = Path(destination)
    if source.suffix.lower() != ".png":
        raise ValueError("Only original PNG diagrams may be protected.")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        if original.format != "PNG":
            raise ValueError(f"Expected PNG content: {source.name}")
        original.load()
        current = _current_metadata(original.info)
        if current and list(original.size) == current["protectedSize"]:
            if source.resolve() != destination.resolve():
                shutil.copyfile(source, destination)
            return {
                "path": destination.name,
                "sourceSha256": current["sourceSha256"],
                "protectedSha256": _digest(destination),
                "sourceSize": current["sourceSize"],
                "protectedSize": current["protectedSize"],
                "alreadyProtected": True,
            }
        width, height = original.size
        # RGB/RGBA preserve original plot pixel values; palette/greyscale images
        # are expanded losslessly into RGBA before the external footer is added.
        mode = original.mode if original.mode in ("RGB", "RGBA") else "RGBA"
        content = original.copy() if original.mode == mode else original.convert(mode)
        source_hash = _digest(source)
        font_size = max(10, min(18, round(width / 82)))
        font = ImageFont.load_default(size=font_size)
        small_font = ImageFont.load_default(size=max(9, font_size - 2))
        padding = max(10, font_size)
        labels = [
            "Xue_hwcxx | NON-COMMERCIAL | github.com/jaymoda88",
            f"Source SHA-256: {source_hash[:20]} | Pro Tools Learning Workbench",
        ]
        # Fit long footer lines on small diagrams instead of extending width.
        probe = ImageDraw.Draw(content)
        available = max(1, width - 2 * padding)
        while font_size > 7 and any(probe.textlength(label, font=font if index == 0 else small_font) > available for index, label in enumerate(labels)):
            font_size -= 1
            font = ImageFont.load_default(size=font_size)
            small_font = ImageFont.load_default(size=max(7, font_size - 1))
        line_height = max(font_size + 5, 14)
        footer_height = 2 * padding + 2 * line_height
        background = (247, 249, 252, 255) if mode == "RGBA" else (247, 249, 252)
        protected = Image.new(mode, (width, height + footer_height), background)
        protected.paste(content, (0, 0))
        draw = ImageDraw.Draw(protected)
        draw.line((0, height, width, height), fill="#dfe5ee", width=1)
        draw.text((padding, height + padding), labels[0], font=font, fill="#2b2b2b")
        draw.text((padding, height + padding + line_height), labels[1], font=small_font, fill="#596274")
        provenance = {
            "schemaVersion": SCHEMA_VERSION,
            "owner": OWNER,
            "policy": POLICY,
            "protectionVersion": PROTECTION_VERSION,
            "sourceSha256": source_hash,
            "sourceSize": [width, height],
            "protectedSize": list(protected.size),
            "asset": source.name,
        }
        png_info = PngImagePlugin.PngInfo()
        # Write only controlled text metadata; original arbitrary text chunks
        # can contain local filesystem paths and are not copied to public output.
        png_info.add_itxt(METADATA_KEY, json.dumps(provenance, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
        png_info.add_itxt("WorkbenchOwner", OWNER)
        png_info.add_itxt("Policy", POLICY)
        png_info.add_itxt("SourceSHA256", source_hash)
        png_info.add_itxt("ProtectionVersion", PROTECTION_VERSION)
        save_options = {"pnginfo": png_info, "compress_level": 9}
        if isinstance(original.info.get("icc_profile"), bytes):
            save_options["icc_profile"] = original.info["icc_profile"]
        if "dpi" in original.info:
            save_options["dpi"] = original.info["dpi"]
        protected.save(destination, format="PNG", **save_options)
    return {
        "path": destination.name,
        "sourceSha256": source_hash,
        "protectedSha256": _digest(destination),
        "sourceSize": [width, height],
        "protectedSize": list(protected.size),
        "alreadyProtected": False,
    }


def protect_assets(source_dir: Path | str, destination_dir: Path | str) -> dict:
    """Protect PNGs recursively and return a deterministic provenance manifest.

    Only PNGs under source_dir are processed. The caller must point this at its
    original-diagram asset directory, never the third-party vendor directory.
    """
    source_dir = Path(source_dir)
    destination_dir = Path(destination_dir)
    if not source_dir.is_dir():
        raise ValueError("Source asset directory does not exist.")
    files = sorted(path for path in source_dir.rglob("*") if path.is_file() and path.suffix.lower() == ".png")
    assets = []
    for source in files:
        relative = source.relative_to(source_dir)
        record = protect_png(source, destination_dir / relative)
        record["path"] = relative.as_posix()
        assets.append(record)
    return {
        "schemaVersion": SCHEMA_VERSION,
        "owner": OWNER,
        "policy": POLICY,
        "protectionVersion": PROTECTION_VERSION,
        "count": len(assets),
        "assets": assets,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--manifest", type=Path)
    args = parser.parse_args()
    manifest = protect_assets(args.source, args.destination)
    if args.manifest:
        args.manifest.parent.mkdir(parents=True, exist_ok=True)
        args.manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"Protected {manifest['count']} original PNG diagrams with {POLICY} ownership footers.")


if __name__ == "__main__":
    main()
