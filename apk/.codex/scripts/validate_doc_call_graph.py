#!/usr/bin/env python3
"""验证主入口、工作流索引、兼容层桥接与历史资料页头。"""

from __future__ import annotations

import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
LEGACY_HEADER = '> 历史参考资料'


def ensure_utf8_output() -> None:
    """固定脚本输出编码，减少 Windows 终端乱码。"""
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')


def detect_codex_migration_doc() -> str:
    """检测 .codex 下的迁移说明文档。"""
    for path in (REPO_ROOT / '.codex').iterdir():
        if not path.is_file() or path.suffix.lower() != '.md':
            continue
        if path.name in {'README.md', 'QUICKSTART.md', 'path-migration-map.md'}:
            continue
        return path.name
    raise FileNotFoundError('未找到 .codex 迁移说明文档')


def detect_claude_migration_doc() -> str:
    """检测 .claude 下的兼容迁移文档。"""
    for path in (REPO_ROOT / '.claude').iterdir():
        if not path.is_file() or path.suffix.lower() != '.md':
            continue
        if path.name in {'README.md', 'QUICKSTART.md', '安装插件和技能.md'}:
            continue
        text = path.read_text(encoding='utf-8')
        if '.codex/' in text:
            return path.name
    raise FileNotFoundError('未找到 .claude 兼容迁移文档')


CODEX_MIGRATION_DOC = detect_codex_migration_doc()
CLAUDE_MIGRATION_DOC = detect_claude_migration_doc()

DOC_GRAPH = [
    ('CODEX.md', '.codex/README.md'),
    ('CODEX.md', '.codex/workflows/README.md'),
    ('CODEX.md', 'docs/verification/2026-03-07-workflow-verification-overview.md'),
    ('CLAUDE.md', '.codex/workflows/codex-workflow-init.md'),
    ('CLAUDE.md', '.codex/workflows/codex-workflow-constants.md'),
    ('.codex/README.md', '.codex/QUICKSTART.md'),
    ('.codex/README.md', f'.codex/{CODEX_MIGRATION_DOC}'),
    ('.codex/README.md', '.codex/workflows/README.md'),
    ('.codex/README.md', '.codex/scripts/README.md'),
    ('.codex/README.md', '.codex/path-migration-map.md'),
    ('.codex/QUICKSTART.md', '.codex/scripts/validate_codex_workflow_modes.py'),
    ('.codex/workflows/README.md', '.codex/workflows/codex-workflow-init.md'),
    ('.codex/workflows/README.md', '.codex/workflows/codex-workflow-review.md'),
]

COMPAT_DOCS = [
    '.claude/README.md',
    '.claude/QUICKSTART.md',
    f'.claude/{CLAUDE_MIGRATION_DOC}',
    '.claude/workflows/README.md',
]


def read_text(rel_path: str) -> str:
    """读取仓库内 UTF-8 文本。"""
    return (REPO_ROOT / rel_path).read_text(encoding='utf-8')


def validate_legacy_headers() -> list[str]:
    """验证历史资料是否带有统一页头。"""
    failures: list[str] = []
    legacy_program_dir = next(
        path for path in REPO_ROOT.iterdir()
        if path.is_dir() and 'Program' in path.name and 'Codex' in path.name
    )
    legacy_roots = [REPO_ROOT / '.claude' / 'reference', legacy_program_dir]
    for root in legacy_roots:
        iterator = sorted(root.rglob('*.md')) if root.name == 'reference' else sorted(root.iterdir())
        for path in iterator:
            if path.is_dir() or path.suffix.lower() != '.md':
                continue
            text = path.read_text(encoding='utf-8')
            if not text.startswith(LEGACY_HEADER):
                failures.append(f'缺少历史参考资料页头：{path.relative_to(REPO_ROOT).as_posix()}')
    return failures


def main() -> int:
    """程序入口。"""
    ensure_utf8_output()
    failures: list[str] = []

    for source, target in DOC_GRAPH:
        source_path = REPO_ROOT / source
        target_path = REPO_ROOT / target
        if not source_path.exists():
            failures.append(f'缺少源文档：{source}')
            continue
        if not target_path.exists():
            failures.append(f'缺少目标文档：{target}')
            continue
        if target not in read_text(source):
            failures.append(f'在 `{source}` 中找不到 `{target}` 的引用')

    for rel_path in COMPAT_DOCS:
        if '.codex/' not in read_text(rel_path):
            failures.append(f'兼容文档 `{rel_path}` 未桥接到 `.codex/`')

    failures.extend(validate_legacy_headers())

    if failures:
        print('文档调用关系验证失败：')
        for item in failures:
            print(f'- {item}')
        return 1

    print('文档调用关系验证通过：主入口、工作流索引、兼容层桥接和历史资料页头均有效。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
