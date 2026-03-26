#!/usr/bin/env python3
"""自动 checkpoint 提交脚本。"""

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


def is_git_repo(project_dir: Path) -> bool:
    """判断目录是否为 Git 仓库。"""
    result = run_command(["git", "rev-parse", "--is-inside-work-tree"], project_dir)
    return result.returncode == 0 and result.stdout.strip() == "true"


def has_staged_changes(project_dir: Path) -> bool:
    """判断暂存区是否有变更。"""
    result = run_command(["git", "diff", "--cached", "--quiet"], project_dir)
    return result.returncode == 1


def make_checkpoint_message() -> str:
    """生成 checkpoint 提交信息。"""
    now_text = datetime.now().strftime("%H:%M")
    return f"checkpoint: {now_text}"


def main() -> int:
    """脚本入口。"""
    parser = argparse.ArgumentParser(description="自动执行 checkpoint 提交")
    parser.add_argument("--dry-run", action="store_true", help="仅打印计划，不实际提交")
    args = parser.parse_args()

    project_dir = get_project_dir()
    if not project_dir.exists():
        print(f"[SKIP] 项目目录不存在: {project_dir}")
        return 0

    if not is_git_repo(project_dir):
        print(f"[SKIP] 非 Git 仓库: {project_dir}")
        return 0

    add_result = run_command(["git", "add", "-A"], project_dir)
    if add_result.returncode != 0:
        print(f"[WARN] git add 失败: {add_result.stderr.strip()}")
        return 0

    if not has_staged_changes(project_dir):
        print("[SKIP] 无暂存改动，不提交")
        return 0

    commit_message = make_checkpoint_message()
    if args.dry_run:
        print(f"[DRY-RUN] 将执行提交: {commit_message}")
        return 0

    commit_result = run_command(["git", "commit", "-m", commit_message], project_dir)
    if commit_result.returncode != 0:
        print(f"[WARN] 自动提交失败: {commit_result.stderr.strip()}")
        return 0

    print(commit_result.stdout.strip() or f"[OK] 已提交: {commit_message}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
