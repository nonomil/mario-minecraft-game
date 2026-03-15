from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[2]
VOCAB_ROOT = ROOT / "words" / "vocabs"
TMP_DIR = ROOT / "tmp"

TERM_RE = re.compile(r"(?:\"?)(?:word|chinese|english)(?:\"?)\s*:\s*['\"]([^'\"]+)['\"]")


def normalize(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"[^0-9a-zA-Z\u4e00-\u9fff]+", "", text).lower()


def collect_vocab_files() -> list[Path]:
    return [
        path
        for path in VOCAB_ROOT.rglob("*.js")
        if path.is_file() and path.name != "manifest.js"
    ]


def extract_terms(content: str) -> list[str]:
    raw = TERM_RE.findall(content)
    return [normalize(item) for item in raw if item and normalize(item)]


def main() -> None:
    files = collect_vocab_files()
    term_files: dict[str, set[str]] = defaultdict(set)
    term_sources: dict[str, set[str]] = defaultdict(set)
    folder_term_counts: dict[str, int] = defaultdict(int)
    archive_folder_term_counts: dict[str, int] = defaultdict(int)

    for path in files:
        rel = path.relative_to(ROOT).as_posix()
        is_archive = "_archive" in path.parts
        content = path.read_text(encoding="utf-8")
        terms = extract_terms(content)
        bucket = path.relative_to(VOCAB_ROOT).parts[0] if path.relative_to(VOCAB_ROOT).parts else "unknown"
        if is_archive:
            archive_folder_term_counts[bucket] += len(terms)
        else:
            folder_term_counts[bucket] += len(terms)
        for term in terms:
            term_files[term].add(rel)
            term_sources[term].add("archive" if is_archive else "active")

    unique_terms = set(term_files.keys())
    archive_only_terms = sorted([t for t, s in term_sources.items() if s == {"archive"}])
    active_only_terms = sorted([t for t, s in term_sources.items() if s == {"active"}])
    shared_terms = sorted([t for t, s in term_sources.items() if len(s) > 1])

    duplicates = {term: sorted(files) for term, files in term_files.items() if len(files) > 1}
    duplicate_sorted = sorted(
        duplicates.items(),
        key=lambda item: (-len(item[1]), item[0])
    )

    summary = {
        "files_total": len(files),
        "files_active": sum(1 for path in files if "_archive" not in path.parts),
        "files_archive": sum(1 for path in files if "_archive" in path.parts),
        "unique_terms_total": len(unique_terms),
        "unique_terms_active_only": len(active_only_terms),
        "unique_terms_archive_only": len(archive_only_terms),
        "unique_terms_shared": len(shared_terms),
        "duplicate_terms_total": len(duplicates),
        "folder_term_counts_active": dict(sorted(folder_term_counts.items())),
        "folder_term_counts_archive": dict(sorted(archive_folder_term_counts.items())),
        "top_duplicates": [
            {"term": term, "file_count": len(files), "files": files}
            for term, files in duplicate_sorted[:50]
        ]
    }

    TMP_DIR.mkdir(exist_ok=True)
    (TMP_DIR / "vocab_duplicates.json").write_text(
        json.dumps(duplicates, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    (TMP_DIR / "vocab_duplicates_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
