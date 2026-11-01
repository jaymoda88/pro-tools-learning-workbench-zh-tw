"""Load and validate the user-research resource catalogue without fetching URLs.

build_data.py can import load_catalogue(note_ids=...) and serialize resources,
learningPaths, and the provenance metadata alongside the chapter documents.
The supplied source Markdown/PDF collection stays outside the repository.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "content" / "resources.json"
LANGUAGES = {"zh-Hant", "zh-Hans", "en", "multi"}
COSTS = {"free", "paid", "mixed", "unknown"}
LEVELS = {"beginner", "intermediate", "advanced"}
FORMATS = {
    "article", "book", "community", "course", "document", "index",
    "practice", "standard", "tool", "video", "website",
}
VERIFICATION_STATES = {"source-reviewed", "limited", "unverified", "unavailable"}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def validate_url(value: str, context: str) -> None:
    parts = urlsplit(value)
    require(parts.scheme in {"https", "http"} and bool(parts.netloc), f"Invalid resource URL: {context}")
    require(parts.username is None and parts.password is None, f"URL credentials are not permitted: {context}")


def load_catalogue(source: Path = DEFAULT_SOURCE, note_ids: set[str] | None = None) -> dict:
    """Return the source-backed catalogue after checking its stable relationships."""
    data = json.loads(Path(source).read_text(encoding="utf-8"))
    require(data.get("schemaVersion") == 1, "Unsupported resource catalogue schema")
    resources = data.get("resources", [])
    paths = data.get("learningPaths", [])
    require(bool(resources) and bool(paths), "Resources and learning paths are required")
    require(data.get("resourceCount") == len(resources), "Catalogue count must match actual resource rows")
    require(data.get("sourceRecordCount", 0) >= len(resources), "Source row count cannot be smaller than unique resources")
    require(data.get("provenance", {}).get("kind") == "user-research", "Catalogue provenance must retain the user-research scope")
    require(data.get("provenance", {}).get("liveAvailabilityChecked") is False, "Do not imply a fresh audit of every resource")
    if note_ids is None:
        note_ids = {path.stem for path in (ROOT / "content").glob("PT-Ch*.md")}
    resource_ids: set[str] = set()
    canonical_urls: set[str] = set()
    for resource in resources:
        identifier = resource.get("id", "")
        require(bool(re.fullmatch(r"[a-z0-9-]+", identifier)), "Resource IDs must be stable URL-safe identifiers")
        require(identifier not in resource_ids, f"Duplicate resource ID: {identifier}")
        resource_ids.add(identifier)
        for name in ("title", "url", "provider", "summary", "rights", "languageLabel", "costLabel"):
            require(bool(resource.get(name)), f"Missing {name} in {identifier}")
        validate_url(resource["url"], identifier)
        canonical = resource["url"].rstrip("/")
        require(canonical not in canonical_urls, f"Duplicate canonical resource URL: {identifier}")
        canonical_urls.add(canonical)
        for link in resource.get("links", []):
            validate_url(link["url"], identifier)
        require(resource.get("language") in LANGUAGES, f"Unknown language: {identifier}")
        require(resource.get("cost") in COSTS, f"Unknown cost type: {identifier}")
        require(resource.get("format") in FORMATS, f"Unknown format: {identifier}")
        require(set(resource.get("levels", [])).issubset(LEVELS), f"Unknown level: {identifier}")
        verification = resource.get("verification", {})
        require(verification.get("status") in VERIFICATION_STATES, f"Missing verification state: {identifier}")
        require(verification.get("scope") == "user-research", f"Do not silently upgrade the evidence scope: {identifier}")
        require(bool(resource.get("sourceRefs")), f"Missing research source: {identifier}")
        require(bool(resource.get("topics")), f"Missing topic tags: {identifier}")
        require(set(resource.get("relatedNoteIds", [])).issubset(note_ids), f"Broken related reading: {identifier}")
    path_ids: set[str] = set()
    for learning_path in paths:
        identifier = learning_path.get("id", "")
        require(identifier and identifier not in path_ids, f"Duplicate learning path: {identifier}")
        path_ids.add(identifier)
        require(learning_path.get("level") in LEVELS, f"Invalid path level: {identifier}")
        require(bool(learning_path.get("steps")), f"No actionable steps: {identifier}")
        for step in learning_path["steps"]:
            require(step.get("title") and step.get("checkpoint"), f"Every step needs an objective and checkpoint: {identifier}")
            require(bool(step.get("noteIds")) and set(step["noteIds"]).issubset(note_ids), f"Broken step reading: {identifier}")
            require(bool(step.get("resourceIds")) and set(step["resourceIds"]).issubset(resource_ids), f"Broken step resource: {identifier}")
    serialized = json.dumps(data, ensure_ascii=False)
    require(not any(value in serialized for value in ("/Users/", "/Volumes/", "file://")), "Local filesystem paths must not be published")
    require(not re.search(r"NT\$|US\$|\$\s*\d", serialized), "Keep volatile monetary amounts out of the resource catalogue")
    return data


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    args = parser.parse_args()
    data = load_catalogue(args.source)
    print(f"Validated {len(data['resources'])} unique resources and {len(data['learningPaths'])} learning paths; source research dated {data['researchDate']}.")


if __name__ == "__main__":
    main()
