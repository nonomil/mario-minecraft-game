#!/usr/bin/env python3
"""审计活动文档中的工作流命名、角色边界与危险指令。"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def ensure_utf8_output() -> None:
    """固定脚本输出编码，减少 Windows 终端乱码。"""
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
WORKFLOW_DIR = REPO_ROOT / ".codex" / "workflows"

REQUIRED_WORKFLOW_FILES = [
    "codex-workflow-constants.md",
    "codex-workflow-complex.md",
    "codex-workflow-debug.md",
    "codex-workflow-init.md",
    "codex-workflow-largebase.md",
    "codex-workflow-parallel.md",
    "codex-workflow-research.md",
    "codex-workflow-review.md",
]

CORE_ACTIVE_DOCS = [
    "AGENTS.md",
    "CODEX.md",
    "CLAUDE.md",
    ".codex/README.md",
    ".codex/QUICKSTART.md",
    ".codex/项目迁移指南.md",
    ".codex/scripts/README.md",
    ".codex/skills/README.md",
    ".codex/templates/README.md",
    ".codex/templates/codex-config.sample.toml",
    ".codex/workflows/README.md",
]

LEGACY_REFERENCE_DIRS = [
    REPO_ROOT / ".claude" / "reference",
    REPO_ROOT / "AI开发-PLan-Program-Debug-Claude和Codex协作",
]

ROLE_BOUNDARY_DOCS = {
    "CODEX.md",
    "CLAUDE.md",
    ".codex/README.md",
    ".codex/项目迁移指南.md",
    ".codex/workflows/README.md",
    ".codex/workflows/codex-workflow-constants.md",
}

REQUIRED_ROLE_PHRASES = ["Codex 主导", "Claude Code 辅助"]

MCP_COMPAT_ALLOWED_FILES = {
    ".codex/workflows/codex-workflow-constants.md",
    ".codex/README.md",
    ".codex/项目迁移指南.md",
}

FORBIDDEN_ACTIVE_PATTERNS = [
    (re.compile(r"docs/plan/"), "活动文档仍使用旧计划目录 `docs/plan/`，应统一为 `docs/plans/`"),
    (re.compile(r"\bPlan Mode\b", re.IGNORECASE), "活动文档仍引用 `Plan Mode`，应改为 Codex 规划阶段/高推理规划"),
    (re.compile(r"Claude Code 自动读取"), "活动文档仍暗示 Claude Code 默认读取主流程"),
    (re.compile(r"Codex \+ Codex"), "活动文档存在错误角色组合 `Codex + Codex`"),
    (re.compile(r"mv\s+\.git\b", re.IGNORECASE), "活动文档包含自动移动 `.git` 的命令，违反当前仓库限制"),
    (re.compile(r"mv\s+\*\.py\b", re.IGNORECASE), "活动文档包含自动移动源码的命令，违反当前仓库限制"),
    (re.compile(r"archives/"), "活动文档仍引用 `archives/` 目录，应改为只输出建议或使用 `tmp/`"),
]

LEGACY_ROLE_PATTERNS = [
    (re.compile(r"Claude Code 主导"), "活动文档仍把 Claude Code 写成主导角色"),
    (re.compile(r"Claude 主导"), "活动文档仍把 Claude 写成主导角色"),
]


@dataclass
class Audit_issue:
    """审计问题。"""

    file_path: str
    message: str


def to_relative_path(file_path: Path) -> str:
    """返回仓库相对路径。"""
    return file_path.relative_to(REPO_ROOT).as_posix()


def list_active_docs() -> list[Path]:
    """收集活动文档集合。"""
    active_docs: list[Path] = []
    for rel_path in CORE_ACTIVE_DOCS:
        candidate_path = REPO_ROOT / rel_path
        if candidate_path.exists():
            active_docs.append(candidate_path)

    for workflow_path in sorted(WORKFLOW_DIR.glob("codex-workflow-*.md")):
        active_docs.append(workflow_path)

    unique_docs: dict[str, Path] = {}
    for doc_path in active_docs:
        unique_docs[to_relative_path(doc_path)] = doc_path
    return list(unique_docs.values())


def is_legacy_path(file_path: Path) -> bool:
    """判断文件是否属于历史参考目录。"""
    return any(parent_dir in file_path.parents for parent_dir in LEGACY_REFERENCE_DIRS)


def check_required_workflow_files(issues: list[Audit_issue]) -> None:
    """检查工作流关键文件是否存在。"""
    for file_name in REQUIRED_WORKFLOW_FILES:
        workflow_path = WORKFLOW_DIR / file_name
        if not workflow_path.exists():
            issues.append(Audit_issue(".codex/workflows", f"缺少必需工作流文件：{file_name}"))


def resolve_reference_path(current_file: Path, reference_name: str) -> Path | None:
    """解析工作流文件引用。"""
    normalized_reference = reference_name.replace("\\", "/")
    if "/" in normalized_reference:
        local_candidate = (current_file.parent / normalized_reference).resolve()
        if local_candidate.exists():
            return local_candidate

        repo_candidate = (REPO_ROOT / normalized_reference).resolve()
        if repo_candidate.exists():
            return repo_candidate
        return None

    same_dir_candidate = current_file.parent / normalized_reference
    if same_dir_candidate.exists():
        return same_dir_candidate

    workflow_candidate = WORKFLOW_DIR / normalized_reference
    if workflow_candidate.exists():
        return workflow_candidate
    return None


def contains_legacy_role(file_path: Path, file_text: str) -> list[str]:
    """检测是否仍含旧角色说法。"""
    relative_path = to_relative_path(file_path)
    if relative_path == ".codex/项目迁移指南.md":
        return []

    messages: list[str] = []
    for pattern, message in LEGACY_ROLE_PATTERNS:
        if pattern.search(file_text):
            messages.append(message)
    return messages


def audit_active_doc(file_path: Path, issues: list[Audit_issue]) -> None:
    """审计单个活动文档。"""
    if is_legacy_path(file_path):
        return

    relative_path = to_relative_path(file_path)
    file_text = file_path.read_text(encoding="utf-8")

    legacy_refs = re.findall(r"claude-workflow-[a-z0-9-]+\.md", file_text)
    if legacy_refs:
        issues.append(Audit_issue(relative_path, f"仍包含旧命名引用：{sorted(set(legacy_refs))}"))

    workflow_refs = set(re.findall(r"codex-workflow-[a-z0-9-]+\.md", file_text))
    for workflow_ref in sorted(workflow_refs):
        if resolve_reference_path(file_path, workflow_ref) is None:
            issues.append(Audit_issue(relative_path, f"引用不存在：{workflow_ref}"))

    for pattern, message in FORBIDDEN_ACTIVE_PATTERNS:
        if pattern.search(file_text):
            issues.append(Audit_issue(relative_path, message))

    for message in contains_legacy_role(file_path, file_text):
        issues.append(Audit_issue(relative_path, message))

    if relative_path in ROLE_BOUNDARY_DOCS:
        for phrase in REQUIRED_ROLE_PHRASES:
            if phrase not in file_text:
                issues.append(Audit_issue(relative_path, f"缺少角色边界关键短语：{phrase}"))

    has_mcp_call = re.search(r"mcp__codex__codex\s*\(", file_text) is not None
    if has_mcp_call and relative_path not in MCP_COMPAT_ALLOWED_FILES:
        issues.append(Audit_issue(relative_path, "发现兼容调用标记 `mcp__codex__codex`，位置不在允许列表"))


def run_audit() -> int:
    """执行审计并返回退出码。"""
    ensure_utf8_output()
    issues: list[Audit_issue] = []
    check_required_workflow_files(issues)

    active_docs = list_active_docs()
    for file_path in active_docs:
        audit_active_doc(file_path, issues)

    if issues:
        print("审计失败：发现以下问题")
        for index, issue in enumerate(issues, start=1):
            print(f"{index}. {issue.file_path} -> {issue.message}")
        print(f"已检查文件数：{len(active_docs)}")
        return 1

    print("审计通过：活动文档命名、角色边界、目录路径和兼容调用标记均符合预期。")
    print(f"已检查文件数：{len(active_docs)}")
    return 0


if __name__ == "__main__":
    sys.exit(run_audit())
