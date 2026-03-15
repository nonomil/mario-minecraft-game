from __future__ import annotations

from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[2]
VOCAB_ROOT = ROOT / "words" / "vocabs"
TARGET = VOCAB_ROOT / "01_幼儿园" / "幼儿园完整词库.js"
TMP_DIR = ROOT / "tmp"

TERM_RE = re.compile(r"(?:\"?)(?:word|english)(?:\"?)\s*:\s*['\"]([^'\"]+)['\"]")


def normalize(text: str) -> str:
    return re.sub(r"\\s+", " ", (text or "").strip())


def is_complex(word: str) -> list[str]:
    reasons = []
    if not word:
        return reasons
    if " " in word or "-" in word:
        reasons.append("multi-word")
    if len(word) >= 8:
        reasons.append("length>=8")
    if any(ch.isdigit() for ch in word):
        reasons.append("has-digit")
    return reasons


def main() -> None:
    if not TARGET.exists():
        print(f"Missing target vocab: {TARGET}")
        return
    content = TARGET.read_text(encoding="utf-8")
    words = [normalize(w) for w in TERM_RE.findall(content)]
    candidates = []
    for word in words:
        reasons = is_complex(word)
        if reasons:
            candidates.append({"word": word, "reasons": reasons})
    unique_map = {}
    for item in candidates:
        key = item["word"].lower()
        if key not in unique_map:
            unique_map[key] = item

    result = sorted(unique_map.values(), key=lambda item: item["word"])
    TMP_DIR.mkdir(exist_ok=True)
    (TMP_DIR / "kindergarten_complex_words.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(json.dumps({"count": len(result)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
