#!/usr/bin/env python3
"""并行任务范围校验：按任务影响范围表检查分支改动是否越界。"""

from __future__ import annotations

import argparse
import fnmatch
import re
import subprocess
from pathlib import Path


def normalize_path(path_text: str) -> str:
    """标准化路径为 '/' 分隔，并去掉前缀 './'。"""
    normalized_text = path_text.strip().replace("\\", "/")
    while normalized_text.startswith("./"):
        normalized_text = normalized_text[2:]
    return normalized_text.strip("/")


def clean_cell(cell_text: str) -> str:
    """清理表格单元格中的空白和反引号。"""
    return cell_text.strip().strip("`").strip()


def split_items(cell_text: str) -> list[str]:
    """按常见分隔符拆分单元格内容。"""
    cleaned_text = clean_cell(cell_text)
    if not cleaned_text or cleaned_text == "-":
        return []
    parts = re.split(r"[;,，；]+", cleaned_text)
    return [clean_cell(item) for item in parts if clean_cell(item) and clean_cell(item) != "-"]


def run_git_command(command_args: list[str]) -> subprocess.CompletedProcess:
    """执行 git 命令。"""
    return subprocess.run(
        command_args,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
        check=False,
    )


def check_ref_exists(ref_text: str) -> bool:
    """检查 git ref 是否存在。"""
    result = run_git_command(["git", "rev-parse", "--verify", ref_text])
    return result.returncode == 0


def run_git_diff(base_ref: str, target_ref: str = "HEAD") -> list[str]:
    """读取 target_ref 相对 base_ref 的改动文件。"""
    if not check_ref_exists(base_ref):
        raise RuntimeError(f"base ref '{base_ref}' 不存在，请用 --base 指定正确主分支")
    if not check_ref_exists(target_ref):
        raise RuntimeError(f"target ref '{target_ref}' 不存在，请检查分支名或 ref")

    diff_result = run_git_command(["git", "diff", "--name-only", f"{base_ref}...{target_ref}"])
    if diff_result.returncode != 0:
        raise RuntimeError(diff_result.stderr.strip() or "git diff 执行失败")

    return [normalize_path(line) for line in diff_result.stdout.splitlines() if line.strip()]


def find_header_indexes(headers: list[str]) -> dict[str, int]:
    """定位任务表字段列号。"""
    lower_headers = [header.lower() for header in headers]

    def find_index(candidates: list[str]) -> int:
        for index_value, header_text in enumerate(lower_headers):
            for candidate in candidates:
                if candidate in header_text:
                    return index_value
        return -1

    index_map = {
        "task": find_index(["任务", "task"]),
        "allowed": find_index(["允许改动路径", "allowed", "scope"]),
        "shared": find_index(["共享文件", "shared"]),
        "owner": find_index(["owner", "负责人"]),
    }
    if any(value < 0 for value in index_map.values()):
        raise ValueError("未识别到完整表头，需包含：任务/允许改动路径/共享文件/owner")
    return index_map


def parse_scope_table(table_path: Path) -> list[dict[str, str]]:
    """解析 Markdown 影响范围表。"""
    table_lines = table_path.read_text(encoding="utf-8-sig").splitlines()
    header_indexes: dict[str, int] | None = None
    rows: list[dict[str, str]] = []
    in_target_table = False

    for line_text in table_lines:
        stripped_line = line_text.strip()
        if not stripped_line.startswith("|"):
            if in_target_table and rows:
                break
            continue

        cells = [clean_cell(cell) for cell in stripped_line.strip("|").split("|")]
        if len(cells) < 4:
            continue

        if header_indexes is None:
            try:
                header_indexes = find_header_indexes(cells)
                in_target_table = True
                continue
            except ValueError:
                continue

        if re.fullmatch(r"[-:\s]+", "".join(cells)):
            continue

        row = {
            "task": cells[header_indexes["task"]],
            "allowed": cells[header_indexes["allowed"]],
            "shared": cells[header_indexes["shared"]],
            "owner": cells[header_indexes["owner"]],
        }
        if row["task"]:
            rows.append(row)

    if not rows:
        raise ValueError("未在表格中解析到任何任务行")
    return rows


def expand_allowed_patterns(raw_patterns: list[str]) -> list[str]:
    """扩展允许路径规则。"""
    expanded_patterns: list[str] = []
    for pattern_text in raw_patterns:
        normalized_pattern = normalize_path(pattern_text)
        if not normalized_pattern:
            continue
        if any(symbol in normalized_pattern for symbol in ["*", "?", "["]):
            expanded_patterns.append(normalized_pattern)
            continue
        if normalized_pattern.endswith("/"):
            expanded_patterns.append(f"{normalized_pattern}**")
            continue
        last_part = normalized_pattern.split("/")[-1]
        if "." in last_part:
            expanded_patterns.append(normalized_pattern)
        else:
            expanded_patterns.append(f"{normalized_pattern}/**")
    return expanded_patterns


def matches_allowed(file_path: str, allowed_patterns: list[str], allowed_exact: set[str]) -> bool:
    """判断文件是否在允许范围。"""
    if file_path in allowed_exact:
        return True
    for pattern_text in allowed_patterns:
        if pattern_text.endswith("/**"):
            prefix_text = pattern_text[:-3]
            if file_path.startswith(prefix_text):
                return True
        elif any(symbol in pattern_text for symbol in ["*", "?", "["]):
            if fnmatch.fnmatch(file_path, pattern_text):
                return True
        elif file_path == pattern_text:
            return True
    return False


def validate_shared_owner_rules(rows: list[dict[str, str]]) -> dict[str, str]:
    """校验共享文件 owner 规则并返回共享文件 owner 映射。"""
    task_names = {clean_cell(row["task"]) for row in rows if clean_cell(row["task"])}
    shared_owner_map: dict[str, str] = {}

    for row in rows:
        task_name = clean_cell(row["task"])
        shared_files = [normalize_path(item) for item in split_items(row["shared"])]
        if not shared_files:
            continue

        owner_name = clean_cell(row["owner"])
        if not owner_name or owner_name == "-":
            shared_list = ", ".join(shared_files)
            raise ValueError(f"共享文件缺少 owner：task={task_name}, files={shared_list}")

        if owner_name not in task_names:
            raise ValueError(f"共享文件 owner '{owner_name}' 不在任务列表中")

        for shared_file in shared_files:
            existing_owner = shared_owner_map.get(shared_file)
            if existing_owner and existing_owner != owner_name:
                raise ValueError(
                    f"共享文件 owner 冲突：{shared_file} 同时属于 '{existing_owner}' 和 '{owner_name}'"
                )
            shared_owner_map[shared_file] = owner_name

    return shared_owner_map


def build_scope_policy(rows: list[dict[str, str]], task_name: str) -> tuple[list[str], set[str], set[str]]:
    """基于任务表构建允许与禁止规则。"""
    task_rows = [row for row in rows if clean_cell(row["task"]) == task_name]
    if not task_rows:
        available_tasks = ", ".join(sorted({clean_cell(row["task"]) for row in rows if clean_cell(row["task"])}))
        raise ValueError(f"任务 '{task_name}' 不在表中。可选任务：{available_tasks}")
    if len(task_rows) > 1:
        raise ValueError(f"任务 '{task_name}' 在表中出现多行，请保持每个任务仅一行")

    target_row = task_rows[0]
    allowed_patterns = expand_allowed_patterns(split_items(target_row["allowed"]))
    shared_owner_map = validate_shared_owner_rules(rows)

    allowed_exact: set[str] = set()
    forbidden_shared: set[str] = set()
    for shared_file, owner_name in shared_owner_map.items():
        if owner_name == task_name:
            allowed_exact.add(shared_file)
        else:
            forbidden_shared.add(shared_file)

    if not allowed_patterns and not allowed_exact:
        raise ValueError("任务未提供可用的允许改动路径")

    return allowed_patterns, allowed_exact, forbidden_shared


def verify_scope(
    changed_files: list[str],
    allowed_patterns: list[str],
    allowed_exact: set[str],
    forbidden_shared: set[str],
) -> tuple[list[str], list[str]]:
    """校验改动文件范围。"""
    forbidden_hits: list[str] = []
    out_of_scope: list[str] = []

    for file_path in changed_files:
        if file_path in forbidden_shared:
            forbidden_hits.append(file_path)
            continue
        if not matches_allowed(file_path, allowed_patterns, allowed_exact):
            out_of_scope.append(file_path)

    return forbidden_hits, out_of_scope


def main() -> int:
    """CLI 入口。"""
    parser = argparse.ArgumentParser(description="校验并行任务改动范围")
    parser.add_argument("--table", required=True, help="任务影响范围表 Markdown 路径")
    parser.add_argument("--task", required=True, help="当前任务名（与表格 task 列一致）")
    parser.add_argument("--base", default="main", help="对比分支，默认 main")
    parser.add_argument("--target", default="HEAD", help="要校验的目标 ref，默认 HEAD")
    args = parser.parse_args()

    table_path = Path(args.table)
    if not table_path.exists():
        print(f"[ERR] 表格文件不存在: {table_path}")
        return 2

    try:
        rows = parse_scope_table(table_path)
        allowed_patterns, allowed_exact, forbidden_shared = build_scope_policy(rows, args.task)
        changed_files = run_git_diff(args.base, args.target)
    except Exception as exc:
        print(f"[ERR] 校验失败: {exc}")
        return 2

    if not changed_files:
        print("[WARN] 目标分支相对 base 无改动文件")
        return 0

    forbidden_hits, out_of_scope = verify_scope(changed_files, allowed_patterns, allowed_exact, forbidden_shared)

    print(f"[INFO] 任务: {args.task}")
    print(f"[INFO] base: {args.base}")
    print(f"[INFO] target: {args.target}")
    print(f"[INFO] 改动文件数: {len(changed_files)}")

    if forbidden_hits:
        print("[ERR] 命中共享文件 owner 约束（非 owner 禁止修改）:")
        for file_path in forbidden_hits:
            print(f"  - {file_path}")
    if out_of_scope:
        print("[ERR] 命中范围外改动:")
        for file_path in out_of_scope:
            print(f"  - {file_path}")

    if forbidden_hits or out_of_scope:
        print("[FAIL] 范围校验不通过，请人工处理后再合并")
        return 1

    print("[OK] 范围校验通过")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
