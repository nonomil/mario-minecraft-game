from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


@dataclass(frozen=True)
class VersionTarget:
    version_name: str
    version_code: int


def _utc_build_date() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _write_text(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8")


def bump_version(repo_root: Path, target: VersionTarget) -> None:
    now = _utc_build_date()

    version_json = repo_root / "version.json"
    version_obj = json.loads(_read_text(version_json))
    version_obj["versionCode"] = target.version_code
    version_obj["buildNumber"] = target.version_code
    version_obj["versionName"] = target.version_name
    version_obj["lastBuildDate"] = now
    _write_text(version_json, json.dumps(version_obj, ensure_ascii=False, indent=2) + "\n")

    for rel in ["package.json", "android-app/package.json"]:
        path = repo_root / rel
        text = _read_text(path)
        text = re.sub(
            r'(\"version\"\s*:\s*\")[^\"]+(\")',
            r"\g<1>" + target.version_name + r"\g<2>",
            text,
            count=1,
        )
        _write_text(path, text)

    build_info = repo_root / "android-app/web/build-info.json"
    build_obj = json.loads(_read_text(build_info))
    build_obj["version"] = target.version_name
    build_obj["versionCode"] = target.version_code
    build_obj["buildNumber"] = target.version_code
    build_obj["buildDate"] = now
    build_obj["buildId"] = f"local-{datetime.now(timezone.utc).strftime('%Y%m%d')}-v{target.version_name}"
    _write_text(build_info, json.dumps(build_obj, ensure_ascii=False, indent=2) + "\n")

    gradle = repo_root / "android-app/android/app/build.gradle"
    text = _read_text(gradle)
    text = re.sub(r"\bversionCode\s+\d+", f"versionCode {target.version_code}", text, count=1)
    text = re.sub(
        r'\bversionName\s+\"[^\"]+\"',
        f'versionName "{target.version_name}"',
        text,
        count=1,
    )
    _write_text(gradle, text)

    service_worker = repo_root / "service-worker.js"
    text = _read_text(service_worker)
    text = re.sub(
        r'(CACHE_NAME\s*=\s*\"mmwg-v)([^\"]+)(\";)',
        r"\g<1>" + target.version_name + r"\g<3>",
        text,
        count=1,
    )
    _write_text(service_worker, text)

    game_html = repo_root / "Game.html"
    text = _read_text(game_html)
    text = re.sub(r"\?v=\d+\.\d+\.\d+", f"?v={target.version_name}", text)
    _write_text(game_html, text)


if __name__ == "__main__":
    bump_version(Path(__file__).resolve().parents[1], VersionTarget("1.19.38", 90))
