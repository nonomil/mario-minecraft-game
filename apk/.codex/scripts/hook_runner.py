#!/usr/bin/env python3
"""统一 Hook 启动器：基于项目根目录定位并执行目标脚本。"""

from __future__ import annotations

import argparse
import os
import runpy
import sys
from pathlib import Path


def resolve_project_dir(project_dir_text: str | None) -> Path:
    """解析项目根目录，优先参数，其次环境变量，最后当前目录。"""
    if project_dir_text and project_dir_text.strip():
        return Path(project_dir_text).resolve()
    env_project_dir = os.getenv("CLAUDE_PROJECT_DIR", "").strip()
    if env_project_dir:
        return Path(env_project_dir).resolve()
    return Path.cwd().resolve()


def resolve_script_path(project_dir: Path, script_text: str) -> Path:
    """解析目标脚本绝对路径。"""
    script_path = Path(script_text)
    if script_path.is_absolute():
        return script_path.resolve()
    return (project_dir / script_path).resolve()


def parse_args() -> argparse.Namespace:
    """解析命令行参数。"""
    parser = argparse.ArgumentParser(description="运行项目内 Hook 脚本")
    parser.add_argument("--script", required=True, help="目标脚本路径（可相对项目根目录）")
    parser.add_argument("--project-dir", default="", help="项目根目录，可选")
    parser.add_argument("script_args", nargs=argparse.REMAINDER, help="传递给目标脚本的参数")
    return parser.parse_args()


def main() -> int:
    """程序入口。"""
    args = parse_args()
    project_dir = resolve_project_dir(args.project_dir)
    script_path = resolve_script_path(project_dir, args.script)
    if not script_path.exists():
        print(f"[hook_runner] 脚本不存在: {script_path}", file=sys.stderr)
        return 2
    if not script_path.is_file():
        print(f"[hook_runner] 路径不是文件: {script_path}", file=sys.stderr)
        return 2
    if not os.access(script_path, os.R_OK):
        print(f"[hook_runner] 脚本不可读: {script_path}", file=sys.stderr)
        return 2

    script_args = list(args.script_args)
    if script_args and script_args[0] == "--":
        script_args = script_args[1:]

    try:
        sys.argv = [str(script_path), *script_args]
        runpy.run_path(str(script_path), run_name="__main__")
        return 0
    except SystemExit as exc:
        code_value = exc.code if isinstance(exc.code, int) else 1
        return code_value
    except Exception as exc:
        print(f"[hook_runner] 执行异常: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
