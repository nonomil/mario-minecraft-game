#!/usr/bin/env python3
"""扫描整个仓库中的工作流命名、分类与残留问题。"""

from __future__ import annotations

import argparse
import re
import sys


def ensure_utf8_output() -> None:
    """固定脚本输出编码，减少 Windows 终端乱码。"""
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from audit_active_docs_terms import (
    FORBIDDEN_ACTIVE_PATTERNS,
    LEGACY_REFERENCE_DIRS,
    REPO_ROOT,
    list_active_docs,
    to_relative_path,
)


TEXT_SUFFIXES = {
    ".md",
    ".py",
    ".ps1",
    ".json",
    ".jsonc",
    ".toml",
    ".yaml",
    ".yml",
    ".txt",
    ".sql",
    ".schema",
}

BINARY_SUFFIXES = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".ico",
    ".pyc",
    ".zip",
    ".rar",
    ".db",
}

LEGACY_NAME_PATTERNS = [
    re.compile(r"claude-workflow", re.IGNORECASE),
    re.compile(r"claudecode\+codex", re.IGNORECASE),
    re.compile(r"Claude和Codex协作", re.IGNORECASE),
]

LEGACY_CONTENT_PATTERNS = [
    re.compile(r"Claude Code 主导"),
    re.compile(r"Claude 主导"),
    re.compile(r"Claude Code 自动读取"),
    re.compile(r"Plan Mode", re.IGNORECASE),
    re.compile(r"docs/plan/"),
]


@dataclass
class Scan_issue:
    """扫描问题。"""

    severity: str
    category: str
    file_path: str
    message: str


def is_legacy_path(file_path: Path) -> bool:
    """判断文件是否位于历史目录。"""
    return any(parent_dir in file_path.parents for parent_dir in LEGACY_REFERENCE_DIRS)


def classify_file(file_path: Path, active_docs: set[str]) -> str:
    """给文件分类。"""
    relative_path = to_relative_path(file_path)
    if "__pycache__" in file_path.parts:
        return "cache"
    if relative_path in active_docs:
        return "active_doc"
    if is_legacy_path(file_path):
        return "legacy_doc"
    if file_path.suffix.lower() in BINARY_SUFFIXES:
        return "binary_or_asset"
    if file_path.suffix.lower() in TEXT_SUFFIXES:
        return "text_artifact"
    return "other"


def scan_name_issues(file_path: Path) -> list[Scan_issue]:
    """扫描目录名和文件名中的旧命名。"""
    relative_path = to_relative_path(file_path)
    issues: list[Scan_issue] = []
    legacy_path = is_legacy_path(file_path)
    for pattern in LEGACY_NAME_PATTERNS:
        if pattern.search(relative_path):
            severity = "info" if legacy_path else "error"
            message = "路径名仍含旧协作语义"
            category = "name"
            if legacy_path:
                category = "legacy_name"
                message = "历史资料保留旧命名，仅作兼容与追溯，不作为默认入口"
            issues.append(Scan_issue(severity, category, relative_path, message))
            break
    return issues


def read_text_if_possible(file_path: Path) -> str | None:
    """尝试按 UTF-8 读取文本。"""
    if file_path.suffix.lower() not in TEXT_SUFFIXES and file_path.name.lower() not in {
        "readme.md",
        "agents.md",
        "codex.md",
        "claude.md",
    }:
        return None
    try:
        return file_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return None


def scan_content_issues(file_path: Path, file_text: str, active_docs: set[str]) -> list[Scan_issue]:
    """扫描文本内容问题。"""
    relative_path = to_relative_path(file_path)
    issues: list[Scan_issue] = []

    if relative_path in active_docs:
        for pattern, message in FORBIDDEN_ACTIVE_PATTERNS:
            if pattern.search(file_text):
                issues.append(Scan_issue("error", "content", relative_path, message))

    if is_legacy_path(file_path):
        for pattern in LEGACY_CONTENT_PATTERNS:
            if pattern.search(file_text):
                issues.append(
                    Scan_issue(
                        "info",
                        "legacy_content",
                        relative_path,
                        "历史资料仍保留旧工作流表述，仅作参考",
                    )
                )
                break
    return issues


def collect_repository_issues() -> tuple[list[Path], Counter, list[Scan_issue]]:
    """收集仓库扫描结果。"""
    active_docs = {to_relative_path(path) for path in list_active_docs()}
    file_paths = sorted(path for path in REPO_ROOT.rglob("*") if path.is_file())
    category_counter: Counter = Counter()
    issues: list[Scan_issue] = []

    for file_path in file_paths:
        category = classify_file(file_path, active_docs)
        category_counter[category] += 1
        issues.extend(scan_name_issues(file_path))

        file_text = read_text_if_possible(file_path)
        if file_text is not None:
            issues.extend(scan_content_issues(file_path, file_text, active_docs))

    return file_paths, category_counter, issues


def print_scan_report(file_paths: list[Path], category_counter: Counter, issues: list[Scan_issue]) -> None:
    """输出文本报告。"""
    print("扫描完成：Codex 工作流仓库全量检查")
    print(f"已检查文件数：{len(file_paths)}")
    print("文件分类统计：")
    for category, count in sorted(category_counter.items()):
        print(f"- {category}: {count}")

    grouped_counter = Counter(issue.severity for issue in issues)
    print("问题统计：")
    for severity in ["error", "warn", "info"]:
        print(f"- {severity}: {grouped_counter.get(severity, 0)}")

    if not issues:
        print("未发现任何问题。")
        return

    print("问题明细：")
    for issue in issues[:80]:
        print(f"- [{issue.severity}] {issue.category} {issue.file_path} -> {issue.message}")
    if len(issues) > 80:
        print(f"- ... 其余 {len(issues) - 80} 条问题已省略")


def run_scan(strict: bool = False) -> int:
    """执行扫描并返回退出码。"""
    ensure_utf8_output()
    file_paths, category_counter, issues = collect_repository_issues()
    print_scan_report(file_paths, category_counter, issues)
    if strict and any(issue.severity == "error" for issue in issues):
        return 1
    return 0


def parse_args() -> argparse.Namespace:
    """解析命令行参数。"""
    parser = argparse.ArgumentParser(description="扫描 Codex 主导工作流仓库的一致性。")
    parser.add_argument("--strict", action="store_true", help="发现 error 级问题时返回非 0 退出码。")
    return parser.parse_args()


if __name__ == "__main__":
    sys.exit(run_scan(strict=parse_args().strict))
