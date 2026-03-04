#!/usr/bin/env python3
"""PreToolUse 合并门禁：在执行 git merge 前自动校验并行任务范围。"""

from __future__ import annotations

import argparse
import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path


def parse_json_text(raw_text: str) -> dict:
    """解析 JSON 文本，失败时回退为原始文本。"""
    if not raw_text:
        return {}
    try:
        payload = json.loads(raw_text)
        if isinstance(payload, dict):
            return payload
        return {"raw": raw_text}
    except json.JSONDecodeError:
        return {"raw": raw_text}


def read_input_payload() -> dict:
    """读取 Hook 输入，优先 stdin，回退 CLAUDE_TOOL_INPUT。"""
    stdin_text = sys.stdin.read().strip()
    if stdin_text:
        return parse_json_text(stdin_text)

    env_text = os.getenv("CLAUDE_TOOL_INPUT", "").strip()
    if env_text:
        return parse_json_text(env_text)

    return {}


def deep_find_command(payload: object) -> str:
    """递归提取命令文本。"""
    if isinstance(payload, dict):
        for key_name in ("command", "cmd", "raw", "input", "tool_input"):
            value = payload.get(key_name)
            command_text = deep_find_command(value)
            if command_text:
                return command_text
        for value in payload.values():
            command_text = deep_find_command(value)
            if command_text:
                return command_text
    elif isinstance(payload, list):
        for item in payload:
            command_text = deep_find_command(item)
            if command_text:
                return command_text
    elif isinstance(payload, str):
        if payload.strip():
            return payload
    return ""


def extract_command_text(payload: dict) -> str:
    """提取命令文本。"""
    command_text = deep_find_command(payload)
    if command_text:
        return command_text
    return json.dumps(payload, ensure_ascii=False)


def output_decision(decision: str, reason_text: str) -> int:
    """输出 Hook 决策。"""
    print(json.dumps({"decision": decision, "reason": reason_text}, ensure_ascii=False))
    return 0


def is_merge_command(command_text: str) -> bool:
    """判断是否 git merge 命令。"""
    return bool(re.search(r"\bgit\s+merge\b", command_text, flags=re.IGNORECASE))


def split_command_tokens(command_text: str) -> list[str]:
    """拆分命令为 token。"""
    try:
        return shlex.split(command_text, posix=False)
    except ValueError:
        return command_text.strip().split()


def extract_merge_source_branch(command_text: str) -> str:
    """提取 git merge 的来源分支。"""
    tokens = split_command_tokens(command_text)
    merge_index = -1
    for index_value in range(len(tokens) - 1):
        if tokens[index_value].lower() == "git" and tokens[index_value + 1].lower() == "merge":
            merge_index = index_value + 2
            break
    if merge_index < 0:
        return ""

    options_with_value = {
        "-m",
        "--message",
        "-s",
        "--strategy",
        "-X",
        "--strategy-option",
        "--log",
        "--file",
    }
    index_value = merge_index
    while index_value < len(tokens):
        token_text = tokens[index_value]
        token_lower = token_text.lower()
        if token_text.startswith("-"):
            if token_lower in options_with_value and index_value + 1 < len(tokens):
                index_value += 2
            else:
                index_value += 1
            continue
        if token_text == "--":
            index_value += 1
            continue
        return token_text.strip().strip("\"'")
    return ""


def infer_task_name_from_branch(source_branch: str) -> str:
    """从分支名推断 task 名。"""
    normalized_branch = source_branch.replace("\\", "/").strip().lower()
    task_match = re.search(r"(task[-_][a-z0-9][a-z0-9_-]*)", normalized_branch)
    if not task_match:
        return ""
    task_name = task_match.group(1).replace("_", "-")
    return task_name


def infer_feature_name_from_branch(source_branch: str) -> str:
    """从分支名推断 feature 名，用于定位 impact scope 表。"""
    normalized_branch = source_branch.replace("\\", "/").strip().lower()
    branch_leaf = normalized_branch.split("/")[-1]

    task_markers = ["-task-", "_task_", "-task_", "_task-"]
    for marker_text in task_markers:
        if marker_text in branch_leaf:
            feature_name = branch_leaf.split(marker_text, 1)[0].strip("-_")
            if feature_name:
                return feature_name

    task_tail_match = re.match(r"(.+)-task[-_][a-z0-9][a-z0-9_-]*$", branch_leaf)
    if task_tail_match:
        feature_name = task_tail_match.group(1).strip("-_")
        if feature_name:
            return feature_name

    return ""


def resolve_table_path(project_dir: Path, source_branch: str, explicit_table: str) -> Path:
    """解析 impact scope 表路径。"""
    env_table = os.getenv("PARALLEL_SCOPE_TABLE", "").strip()
    table_text = explicit_table.strip() if explicit_table.strip() else env_table
    if table_text:
        table_path = Path(table_text)
        if not table_path.is_absolute():
            table_path = project_dir / table_path
        return table_path.resolve()

    feature_name = infer_feature_name_from_branch(source_branch)
    if feature_name:
        feature_table = (project_dir / "docs" / "development" / f"{feature_name}-impact-scope.md").resolve()
        if feature_table.exists():
            return feature_table

    all_tables = sorted((project_dir / "docs" / "development").glob("*-impact-scope.md"))
    if len(all_tables) == 1:
        return all_tables[0].resolve()
    if len(all_tables) == 0:
        raise ValueError("未找到 impact scope 表，请先创建 docs/development/[feature]-impact-scope.md")
    raise ValueError("检测到多个 impact scope 表，请设置 PARALLEL_SCOPE_TABLE 或通过 --table 指定")


def load_tasks_from_table(table_path: Path) -> list[str]:
    """读取 scope 表中的任务列表。"""
    from verify_parallel_scope import clean_cell, parse_scope_table

    rows = parse_scope_table(table_path)
    task_names = sorted({clean_cell(row["task"]) for row in rows if clean_cell(row["task"])})
    return task_names


def resolve_task_name(table_path: Path, source_branch: str, explicit_task: str) -> str:
    """解析任务名。"""
    env_task = os.getenv("PARALLEL_SCOPE_TASK", "").strip()
    task_text = explicit_task.strip() if explicit_task.strip() else env_task
    if task_text:
        return task_text

    inferred_task = infer_task_name_from_branch(source_branch)
    if inferred_task:
        return inferred_task

    task_names = load_tasks_from_table(table_path)
    if len(task_names) == 1:
        return task_names[0]
    raise ValueError("无法推断任务名，请在分支名包含 task-xxx，或设置 PARALLEL_SCOPE_TASK")


def check_ref_exists(ref_text: str) -> bool:
    """检查 git ref 是否存在。"""
    result = subprocess.run(
        ["git", "rev-parse", "--verify", ref_text],
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
        check=False,
    )
    return result.returncode == 0


def resolve_base_ref(base_ref: str) -> str:
    """解析可用 base 分支。"""
    env_base = os.getenv("PARALLEL_SCOPE_BASE", "").strip()
    preferred_base = env_base if env_base else base_ref
    candidates = [preferred_base, "main", "master", "develop", "dev"]

    seen_refs: set[str] = set()
    for candidate in candidates:
        candidate_text = candidate.strip()
        if not candidate_text or candidate_text in seen_refs:
            continue
        seen_refs.add(candidate_text)
        if check_ref_exists(candidate_text):
            return candidate_text

    raise ValueError("未找到可用主分支，请设置 PARALLEL_SCOPE_BASE（如 main/master/develop）")


def run_scope_verify(
    project_dir: Path,
    table_path: Path,
    task_name: str,
    base_ref: str,
    target_ref: str,
) -> tuple[int, str]:
    """执行范围校验脚本。"""
    verify_script = (project_dir / ".claude" / "scripts" / "verify_parallel_scope.py").resolve()
    if not verify_script.exists():
        return 2, f"缺少脚本: {verify_script}"

    command_args = [
        sys.executable,
        str(verify_script),
        "--table",
        str(table_path),
        "--task",
        task_name,
        "--base",
        base_ref,
        "--target",
        target_ref,
    ]
    result = subprocess.run(
        command_args,
        cwd=str(project_dir),
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
        check=False,
    )
    output_text = (result.stdout or "") + (("\n" + result.stderr) if result.stderr else "")
    return result.returncode, output_text.strip()


def main() -> int:
    """Hook 入口。"""
    parser = argparse.ArgumentParser(description="git merge 前自动执行范围门禁")
    parser.add_argument("--table", default="", help="impact scope 表路径，可选")
    parser.add_argument("--task", default="", help="任务名，可选")
    parser.add_argument("--base", default="main", help="主分支，默认 main")
    args = parser.parse_args()

    payload = read_input_payload()
    command_text = extract_command_text(payload)
    if not is_merge_command(command_text):
        return output_decision("approve", "非 git merge 命令，跳过范围门禁")

    source_branch = extract_merge_source_branch(command_text)
    if not source_branch:
        return output_decision("block", "无法解析 git merge 来源分支，请改用 'git merge <branch>' 形式")

    project_dir_text = os.getenv("CLAUDE_PROJECT_DIR", "").strip()
    project_dir = Path(project_dir_text).resolve() if project_dir_text else Path.cwd().resolve()

    try:
        table_path = resolve_table_path(project_dir, source_branch, args.table)
        if not table_path.exists():
            raise ValueError(f"impact scope 表不存在: {table_path}")

        task_name = resolve_task_name(table_path, source_branch, args.task)
        base_ref = resolve_base_ref(args.base)
        verify_code, verify_output = run_scope_verify(project_dir, table_path, task_name, base_ref, source_branch)
    except Exception as exc:
        return output_decision("block", f"范围门禁未通过: {exc}")

    if verify_code != 0:
        brief_output = verify_output[-600:] if verify_output else "无详细输出"
        return output_decision("block", f"范围门禁未通过: source={source_branch}, task={task_name}\n{brief_output}")

    return output_decision(
        "approve",
        f"范围门禁通过: source={source_branch}, task={task_name}, table={table_path}, base={base_ref}",
    )


if __name__ == "__main__":
    raise SystemExit(main())
