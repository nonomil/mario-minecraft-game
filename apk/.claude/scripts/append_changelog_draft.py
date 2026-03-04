#!/usr/bin/env python3
"""在 commit 后追加 CHANGELOG 草稿。"""

from __future__ import annotations

import argparse
import os
import subprocess
from datetime import datetime
from pathlib import Path


def run_command(command_args: list[str], workdir: Path) -> subprocess.CompletedProcess:
    """执行命令并返回结果。"""
    return subprocess.run(
        command_args,
        cwd=str(workdir),
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
        check=False,
    )


def get_project_dir() -> Path:
    """获取项目目录，优先读取环境变量。"""
    project_dir_text = os.getenv("CLAUDE_PROJECT_DIR", "").strip()
    if project_dir_text:
        return Path(project_dir_text).resolve()
    return Path.cwd().resolve()


def get_last_commit(project_dir: Path) -> tuple[str, str] | tuple[None, None]:
    """读取最近一次提交 hash 与主题。"""
    hash_result = run_command(["git", "log", "-1", "--pretty=%H"], project_dir)
    subject_result = run_command(["git", "log", "-1", "--pretty=%s"], project_dir)
    if hash_result.returncode != 0 or subject_result.returncode != 0:
        return None, None
    commit_hash = hash_result.stdout.strip()
    commit_subject = subject_result.stdout.strip()
    if not commit_hash or not commit_subject:
        return None, None
    return commit_hash, commit_subject


def build_draft_line(commit_hash: str, commit_subject: str) -> str:
    """构建 changelog 草稿条目。"""
    time_text = datetime.now().strftime("%Y-%m-%d %H:%M")
    return f"- {time_text} [{commit_hash[:7]}] {commit_subject}"


def main() -> int:
    """脚本入口。"""
    parser = argparse.ArgumentParser(description="追加 changelog 草稿条目")
    parser.add_argument("--dry-run", action="store_true", help="仅打印条目，不写文件")
    args = parser.parse_args()

    project_dir = get_project_dir()
    if not project_dir.exists():
        print(f"[SKIP] 项目目录不存在: {project_dir}")
        return 0

    git_check = run_command(["git", "rev-parse", "--is-inside-work-tree"], project_dir)
    if git_check.returncode != 0:
        print(f"[SKIP] 非 Git 仓库: {project_dir}")
        return 0

    commit_hash, commit_subject = get_last_commit(project_dir)
    if not commit_hash or not commit_subject:
        print("[SKIP] 未读取到提交信息")
        return 0

    draft_line = build_draft_line(commit_hash, commit_subject)
    draft_path = project_dir / "docs" / "changelog-draft.md"
    draft_path.parent.mkdir(parents=True, exist_ok=True)

    if draft_path.exists():
        existing_lines = draft_path.read_text(encoding="utf-8").splitlines()
        if existing_lines and existing_lines[-1].strip() == draft_line.strip():
            print("[SKIP] 草稿已是最新，不重复追加")
            return 0
    else:
        existing_lines = ["# Changelog Draft", ""]

    if args.dry_run:
        print(f"[DRY-RUN] 将追加条目: {draft_line}")
        return 0

    new_lines = existing_lines + [draft_line]
    draft_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
    print(f"[OK] 已更新 {draft_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
