from __future__ import annotations

from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]
SUMMARY_PATH = ROOT / "tmp" / "vocab_duplicates_summary.json"
COMPLEX_PATH = ROOT / "tmp" / "kindergarten_complex_words.json"
DOC_PATH = ROOT / "docs" / "plans" / "2026-03-15-words-vocab-content-audit.md"


def main() -> None:
    summary = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
    complex_words = json.loads(COMPLEX_PATH.read_text(encoding="utf-8"))

    top_dup = summary["top_duplicates"][:30]
    top_dup_lines = [f"- {item['term']} ({item['file_count']} files)" for item in top_dup]
    complex_lines = [f"- {item['word']}" for item in complex_words[:60]]

    folder_active = summary["folder_term_counts_active"]
    folder_archive = summary["folder_term_counts_archive"]

    lines = []
    lines.append("# Words 词库内容盘点与重复扫描报告")
    lines.append("")
    lines.append("## 数据总览")
    lines.append(f"- 扫描文件总数: {summary['files_total']}")
    lines.append(f"- 主词库文件: {summary['files_active']}")
    lines.append(f"- _archive 文件: {summary['files_archive']}")
    lines.append(f"- 提取的唯一词条总数: {summary['unique_terms_total']}")
    lines.append(f"- 重复词条总数: {summary['duplicate_terms_total']}")
    lines.append("")
    lines.append("## 目录层级词条提取量（基于 word/chinese/english 字段）")
    for key, value in folder_active.items():
        lines.append(f"- {key}: {value}")
    for key, value in folder_archive.items():
        lines.append(f"- {key}: {value}")
    lines.append("")
    lines.append("## _archive 覆盖情况")
    lines.append(f"- 仅在 _archive 出现的词条: {summary['unique_terms_archive_only']}")
    lines.append(f"- 仅在主词库出现的词条: {summary['unique_terms_active_only']}")
    lines.append(f"- 主词库与 _archive 同时出现: {summary['unique_terms_shared']}")
    lines.append("")
    lines.append("## 重复词条 Top 30（按覆盖文件数）")
    lines.extend(top_dup_lines)
    lines.append("")
    lines.append("## 幼儿园词库复杂词候选（规则: 多词短语 / 长度>=8）")
    lines.extend(complex_lines)
    lines.append("")
    lines.append("## 结论与建议")
    lines.append("- _archive 含有大量重复词条，但仍存在数千个仅在 _archive 出现的词条，后续重组前需要确认是否迁移。")
    lines.append("- 08_幼小衔接 词库当前为生成型结构，基于简单字段扫描可能低估数量，必要时需补充专用解析器。")
    lines.append("- 幼儿园复杂词候选可作为迁移到小学阶段的初筛清单，后续需结合年龄认知与教学目标再做人工筛选。")
    content = "\n".join(lines) + "\n"
    DOC_PATH.write_text(content, encoding="utf-8-sig")


if __name__ == "__main__":
    main()
