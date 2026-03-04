#!/usr/bin/env python3
"""
largebase-structured-scan: 结构化代码库扫描辅助工具

用法示例:
  python scan.py scan --mode M4 --scope src docs --topic refactor-core
  python scan.py load --load docs/scan/2026-02-28-refactor-core/scan-data.json --db docs/scan/2026-02-28-refactor-core/scan.db
  python scan.py query --query hybrid_search --type all --db docs/scan/2026-02-28-refactor-core/scan.db
  python scan.py query --query run_pipeline --type impact-chain --db docs/scan/2026-02-28-refactor-core/scan.db
"""

import argparse
import json
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

SCAN_MODES = {
    "M1": "快速架构扫描",
    "M2": "数据流扫描",
    "M3": "API 表面扫描",
    "M4": "全量深度扫描",
}

# 各模式必须包含的顶层字段
REQUIRED_FIELDS: dict[str, list[str]] = {
    "M1": ["scan_meta", "modules", "entry_points"],
    "M2": ["scan_meta", "modules", "data_structures", "data_flows", "reference_constraints", "impact_matrix"],
    "M3": ["scan_meta", "modules", "api_surface", "entry_points", "reference_constraints", "impact_matrix"],
    "M4": ["scan_meta", "modules", "entry_points", "data_structures", "data_flows",
           "api_surface", "reference_constraints", "impact_matrix"],
}

# impact_matrix 每条记录必须包含的字段
IMPACT_REQUIRED = {"change_point", "direct_impact", "indirect_impact", "validation_point", "risk_level"}


def setup_stdio_encoding():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")


def get_mode_template_hint(mode: str) -> str:
    skill_root = Path(__file__).resolve().parent
    tpl = skill_root / "templates" / f"codex-prompt-{mode}.txt"
    if tpl.exists():
        return str(tpl).replace("\\", "/")
    fallback = skill_root / "references" / "prompt-pack.md"
    return f"{str(fallback).replace(chr(92), '/')}（查找 {mode} 段）"


def normalize_list(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value if str(v).strip()]
    if isinstance(value, str):
        if not value.strip():
            return []
        if "," in value:
            return [v.strip() for v in value.split(",") if v.strip()]
        return [value.strip()]
    return [str(value)]


def normalize_scope_paths(raw: list[str]) -> list[str]:
    paths: list[str] = []
    for item in raw:
        if item is None:
            continue
        for part in str(item).split(","):
            p = part.strip()
            if p:
                paths.append(p)
    return paths


def list_to_text(value) -> str:
    return ",".join(normalize_list(value))


def parse_file_line(s: str) -> tuple[str, int | None]:
    if not s:
        return "", None
    parts = s.rsplit(":", 1)
    if len(parts) == 2 and parts[1].isdigit():
        return parts[0], int(parts[1])
    return s, None


def make_id(prefix: str, value: str, idx: int) -> str:
    base = value.strip().replace("\\", "/").replace(" ", "_")
    if not base:
        base = f"item_{idx}"
    return f"{prefix}:{base}"


# ---------------------------------------------------------------------------
# Schema 校验
# ---------------------------------------------------------------------------

def validate_schema(data: dict, mode: str) -> list[str]:
    """返回所有校验错误信息列表，空列表表示通过。"""
    errors: list[str] = []
    required = REQUIRED_FIELDS.get(mode, REQUIRED_FIELDS["M4"])

    for field in required:
        if field not in data:
            errors.append(f"缺少必须字段: '{field}'")
        elif not isinstance(data[field], (list, dict)):
            errors.append(f"字段 '{field}' 应为 list 或 dict，实际为 {type(data[field]).__name__}")

    # 检查 scan_meta 子字段
    meta = data.get("scan_meta", {})
    if isinstance(meta, dict):
        for sub in ("topic", "mode", "generated_at"):
            if sub not in meta:
                errors.append(f"scan_meta 缺少子字段: '{sub}'")

    # 检查 impact_matrix 每条记录
    for i, item in enumerate(data.get("impact_matrix", [])):
        missing = IMPACT_REQUIRED - set(item.keys())
        if missing:
            errors.append(f"impact_matrix[{i}] 缺少字段: {sorted(missing)}")

    # M2/M3/M4 必须有 reference_constraints
    if mode in ("M2", "M3", "M4"):
        constraints = data.get("reference_constraints", [])
        if not constraints:
            errors.append("reference_constraints 为空，M2/M3/M4 必须至少包含一条约束或说明信息缺口")

    return errors


# ---------------------------------------------------------------------------
# 数据库初始化
# ---------------------------------------------------------------------------

def init_db(db_path: str) -> sqlite3.Connection:
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS scan_meta (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS modules (
            id               TEXT PRIMARY KEY,
            path             TEXT NOT NULL,
            name             TEXT NOT NULL,
            responsibility   TEXT,
            exported_symbols TEXT,
            dependencies     TEXT,
            file_count       INTEGER,
            loc              INTEGER
        );
        CREATE TABLE IF NOT EXISTS entry_points (
            id             TEXT PRIMARY KEY,
            name           TEXT NOT NULL,
            type           TEXT,
            file_path      TEXT,
            line_number    INTEGER,
            trigger        TEXT,
            call_chain     TEXT
        );
        CREATE TABLE IF NOT EXISTS functions (
            id          TEXT PRIMARY KEY,
            module_id   TEXT NOT NULL,
            name        TEXT NOT NULL,
            signature   TEXT,
            file_path   TEXT,
            line_number INTEGER,
            called_by   TEXT,
            calls       TEXT,
            is_public   BOOLEAN
        );
        CREATE TABLE IF NOT EXISTS dataflows (
            id               TEXT PRIMARY KEY,
            name             TEXT NOT NULL,
            input_format     TEXT,
            output_format    TEXT,
            steps            TEXT,
            side_effects     TEXT,
            related_functions TEXT
        );
        CREATE TABLE IF NOT EXISTS data_structures (
            id            TEXT PRIMARY KEY,
            name          TEXT NOT NULL,
            fields        TEXT,
            used_by       TEXT,
            storage_layer TEXT
        );
        CREATE TABLE IF NOT EXISTS constraints (
            id              TEXT PRIMARY KEY,
            source_doc      TEXT,
            constraint_type TEXT,
            content         TEXT,
            impact_scope    TEXT,
            priority        TEXT
        );
        CREATE TABLE IF NOT EXISTS impact_items (
            id                  TEXT PRIMARY KEY,
            change_point        TEXT,
            direct_impact       TEXT,
            indirect_impact     TEXT,
            verification_points TEXT,
            risk_level          TEXT
        );
        CREATE TABLE IF NOT EXISTS reference_docs (
            id            TEXT PRIMARY KEY,
            path          TEXT NOT NULL,
            purpose       TEXT,
            key_sections  TEXT,
            conflicts_with TEXT
        );
    """)
    conn.executescript("""
        CREATE INDEX IF NOT EXISTS idx_modules_path     ON modules(path);
        CREATE INDEX IF NOT EXISTS idx_functions_module ON functions(module_id);
        CREATE INDEX IF NOT EXISTS idx_functions_name   ON functions(name);
        CREATE INDEX IF NOT EXISTS idx_constraints_type ON constraints(constraint_type);
        CREATE INDEX IF NOT EXISTS idx_impact_risk      ON impact_items(risk_level);
        CREATE INDEX IF NOT EXISTS idx_impact_change    ON impact_items(change_point);
        CREATE INDEX IF NOT EXISTS idx_entry_name       ON entry_points(name);
    """)
    conn.commit()
    return conn


# ---------------------------------------------------------------------------
# 字段兼容层
# ---------------------------------------------------------------------------

def get_module_rows(d: dict) -> list[dict]:
    return d.get("module_inventory") or d.get("modules", [])

def get_entry_point_rows(d: dict) -> list[dict]:
    return d.get("entry_points", [])

def get_function_rows(d: dict) -> list[dict]:
    rows = list(d.get("functions", []))
    rows += d.get("api_surface", [])
    return rows

def get_dataflow_rows(d: dict) -> list[dict]:
    return d.get("data_flows") or d.get("dataflows", [])

def get_datastructure_rows(d: dict) -> list[dict]:
    return d.get("data_structures", [])

def get_constraint_rows(d: dict) -> list[dict]:
    return d.get("reference_constraints") or d.get("constraints", [])

def get_impact_rows(d: dict) -> list[dict]:
    return d.get("impact_matrix") or d.get("impact_items", [])

def get_reference_doc_rows(d: dict) -> list[dict]:
    return d.get("reference_docs", [])

def infer_module_id(file_path: str, mods: list[dict], idx: int) -> str:
    if not file_path:
        return f"mod:unknown_{idx}"
    fp = file_path.replace("\\", "/")
    for i, m in enumerate(mods, 1):
        mp = (m.get("path") or "").replace("\\", "/").rstrip("/")
        mid = m.get("id") or make_id("mod", mp or m.get("name", ""), i)
        if mp and fp.startswith(mp):
            return mid
    return make_id("mod", Path(fp).parent.as_posix(), idx)


# ---------------------------------------------------------------------------
# 子命令
# ---------------------------------------------------------------------------

def cmd_scan(args):
    mode = args.mode
    scope_paths = normalize_scope_paths(args.scope)
    if not scope_paths:
        print("[ERR] --scope 不能为空")
        return
    topic = args.topic.strip().replace(" ", "-")
    refs = args.refs or []

    ts = datetime.now().strftime("%Y-%m-%d")
    out_dir = Path(f"docs/scan/{ts}-{topic}")
    out_dir.mkdir(parents=True, exist_ok=True)

    db_path = out_dir / "scan.db"
    conn = init_db(str(db_path))
    meta = {
        "scan_date": datetime.now().isoformat(),
        "scan_mode": mode,
        "scan_scope": json.dumps(scope_paths, ensure_ascii=False),
        "scan_topic": topic,
        "reference_docs": ",".join(refs),
    }
    for k, v in meta.items():
        conn.execute("INSERT OR REPLACE INTO scan_meta(key,value) VALUES(?,?)", (k, str(v)))
    conn.commit()
    conn.close()

    tpl = get_mode_template_hint(mode)
    missing = [p for p in scope_paths if not Path(p).exists()]

    print("[OK] 扫描初始化完成")
    print(f"  模式: {SCAN_MODES.get(mode, mode)}")
    print("  范围路径:")
    for p in scope_paths:
        print(f"    - {p}")
    print(f"  输出: {out_dir}")
    print(f"  数据库: {db_path}")
    if missing:
        print("[WARN] 以下路径不存在，请在生成 scan-data.json 前确认：")
        for p in missing:
            print(f"    - {p}")
    print()
    print("下一步：")
    print(f"  1) 调用 Codex 执行扫描（参考 {tpl}）")
    print(f"  2) 将 JSON 保存到 {out_dir / 'scan-data.json'}")
    print(f"  3) 运行 load 子命令写入 SQLite")


def cmd_load(args):
    json_path = Path(args.load)
    db_path = Path(args.db)

    if not json_path.exists():
        print(f"[ERR] 文件不存在: {json_path}")
        return

    with json_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    # --- Schema 校验 ---
    mode = data.get("scan_meta", {}).get("mode", "M4")
    errors = validate_schema(data, mode)
    if errors:
        print(f"[FAIL] Schema 校验失败（模式 {mode}），共 {len(errors)} 个问题：")
        for e in errors:
            print(f"  ✗ {e}")
        print("请修正 scan-data.json 后重新运行 load。")
        return
    print(f"[OK] Schema 校验通过（模式 {mode}）")

    conn = init_db(str(db_path))

    # scan_meta
    for k, v in data.get("scan_meta", {}).items():
        conn.execute("INSERT OR REPLACE INTO scan_meta(key,value) VALUES(?,?)",
                     (str(k), json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else str(v)))

    mod_rows = get_module_rows(data)
    ep_rows = get_entry_point_rows(data)
    fn_rows = get_function_rows(data)
    df_rows = get_dataflow_rows(data)
    ds_rows = get_datastructure_rows(data)
    ct_rows = get_constraint_rows(data)
    im_rows = get_impact_rows(data)
    rd_rows = get_reference_doc_rows(data)

    # modules
    for i, m in enumerate(mod_rows, 1):
        mp = m.get("path", "")
        mn = m.get("name") or Path(mp).name or f"module_{i}"
        mid = m.get("id") or make_id("mod", mp or mn, i)
        conn.execute(
            "INSERT OR REPLACE INTO modules(id,path,name,responsibility,exported_symbols,dependencies,file_count,loc)"
            " VALUES(?,?,?,?,?,?,?,?)",
            (mid, mp, mn, m.get("responsibility"),
             list_to_text(m.get("exported_symbols") or m.get("public_symbols")),
             list_to_text(m.get("dependencies")),
             m.get("file_count"), m.get("loc")))

    # entry_points
    for i, ep in enumerate(ep_rows, 1):
        name = ep.get("name", f"ep_{i}")
        eid = ep.get("id") or make_id("ep", name, i)
        fp = ep.get("file_path", "")
        conn.execute(
            "INSERT OR REPLACE INTO entry_points(id,name,type,file_path,line_number,trigger,call_chain)"
            " VALUES(?,?,?,?,?,?,?)",
            (eid, name, ep.get("type"), fp, ep.get("line_number"),
             ep.get("trigger"), list_to_text(ep.get("call_chain") or ep.get("call_chain_top3"))))

    # functions / api_surface
    for i, fn in enumerate(fn_rows, 1):
        fname = fn.get("name", f"func_{i}")
        fp = fn.get("file_path", "")
        ln = fn.get("line_number")
        if not fp and fn.get("file_line"):
            fp, parsed = parse_file_line(fn["file_line"])
            ln = ln or parsed
        mid = fn.get("module_id") or infer_module_id(fp, mod_rows, i)
        fid = fn.get("id") or make_id("func", f"{fname}_{fp}_{ln}", i)
        conn.execute(
            "INSERT OR REPLACE INTO functions(id,module_id,name,signature,file_path,line_number,called_by,calls,is_public)"
            " VALUES(?,?,?,?,?,?,?,?,?)",
            (fid, mid, fname, fn.get("signature"), fp, ln,
             list_to_text(fn.get("called_by") or fn.get("callers")),
             list_to_text(fn.get("calls")),
             bool(fn.get("is_public", True))))

    # dataflows
    for i, fl in enumerate(df_rows, 1):
        fn2 = fl.get("name", f"flow_{i}")
        fid = fl.get("id") or make_id("flow", fn2, i)
        conn.execute(
            "INSERT OR REPLACE INTO dataflows(id,name,input_format,output_format,steps,side_effects,related_functions)"
            " VALUES(?,?,?,?,?,?,?)",
            (fid, fn2,
             fl.get("input") or fl.get("input_format"),
             fl.get("output") or fl.get("output_format"),
             list_to_text(fl.get("stages") or fl.get("steps")),
             list_to_text(fl.get("side_effects")),
             list_to_text(fl.get("related_functions"))))

    # data_structures
    for i, ds in enumerate(ds_rows, 1):
        dn = ds.get("name", f"ds_{i}")
        did = ds.get("id") or make_id("ds", dn, i)
        conn.execute(
            "INSERT OR REPLACE INTO data_structures(id,name,fields,used_by,storage_layer)"
            " VALUES(?,?,?,?,?)",
            (did, dn,
             json.dumps(ds.get("fields", []), ensure_ascii=False),
             list_to_text(ds.get("used_by")),
             ds.get("storage_layer") or ds.get("source")))

    # constraints
    for i, ct in enumerate(ct_rows, 1):
        cid = ct.get("id") or make_id("cons", ct.get("constraint", "") or ct.get("content", ""), i)
        conn.execute(
            "INSERT OR REPLACE INTO constraints(id,source_doc,constraint_type,content,impact_scope,priority)"
            " VALUES(?,?,?,?,?,?)",
            (cid,
             ct.get("source") or ct.get("source_doc"),
             ct.get("constraint_type", "general"),
             ct.get("constraint") or ct.get("content"),
             ct.get("impact") or ct.get("impact_scope"),
             ct.get("priority", "medium")))

    # impact_items
    for i, im in enumerate(im_rows, 1):
        iid = im.get("id") or make_id("impact", im.get("change_point", ""), i)
        conn.execute(
            "INSERT OR REPLACE INTO impact_items(id,change_point,direct_impact,indirect_impact,verification_points,risk_level)"
            " VALUES(?,?,?,?,?,?)",
            (iid,
             im.get("change_point"),
             list_to_text(im.get("direct_impact")),
             list_to_text(im.get("indirect_impact")),
             list_to_text(im.get("verification_points") or im.get("validation_point")),
             str(im.get("risk_level", "medium")).lower()))

    # reference_docs
    for i, rd in enumerate(rd_rows, 1):
        rp = rd.get("path", "")
        rid = rd.get("id") or make_id("ref", rp, i)
        conn.execute(
            "INSERT OR REPLACE INTO reference_docs(id,path,purpose,key_sections,conflicts_with)"
            " VALUES(?,?,?,?,?)",
            (rid, rp, rd.get("purpose"),
             list_to_text(rd.get("key_sections")),
             list_to_text(rd.get("conflicts_with"))))

    stats = {
        "module_count": len(mod_rows),
        "entry_point_count": len(ep_rows),
        "function_count": len(fn_rows),
        "dataflow_count": len(df_rows),
        "data_structure_count": len(ds_rows),
        "constraint_count": len(ct_rows),
        "impact_item_count": len(im_rows),
        "reference_doc_count": len(rd_rows),
        "load_validated": "true",
    }
    for k, v in stats.items():
        conn.execute("INSERT OR REPLACE INTO scan_meta(key,value) VALUES(?,?)", (k, str(v)))

    conn.commit()
    conn.close()

    print("[OK] 数据加载完成")
    for k, v in stats.items():
        if k != "load_validated":
            label = k.replace("_count", "").replace("_", " ")
            print(f"  {label}: {v}")


# ---------------------------------------------------------------------------
# 查询
# ---------------------------------------------------------------------------

def print_rows(title: str, rows, fmt) -> int:
    if not rows:
        return 0
    print(f"\n[{title}] {len(rows)} 条")
    for r in rows:
        print(fmt(r))
    return len(rows)


def cmd_query(args):
    db_path = Path(args.db)
    if not db_path.exists():
        print(f"[ERR] 数据库不存在: {db_path}")
        return

    conn = sqlite3.connect(str(db_path))
    q = args.query
    qt = args.type
    like = f"%{q}%"
    total = 0

    # --- 特殊联查：impact-chain ---
    if qt == "impact-chain":
        rows = conn.execute("""
            SELECT
                i.change_point,
                i.risk_level,
                i.direct_impact,
                i.indirect_impact,
                i.verification_points,
                f.file_path,
                f.line_number,
                m.path AS module_path
            FROM impact_items i
            LEFT JOIN functions f ON f.name LIKE ?
            LEFT JOIN modules m  ON m.id = f.module_id
            WHERE i.change_point LIKE ?
               OR i.direct_impact LIKE ?
               OR i.indirect_impact LIKE ?
            ORDER BY i.risk_level DESC
            LIMIT 20
        """, (like, like, like, like)).fetchall()
        total += print_rows("影响链路", rows, lambda r: (
            f"  变更点: {r[0]} | 风险: {r[1]}\n"
            f"    直接影响: {r[2]}\n"
            f"    间接影响: {r[3]}\n"
            f"    验证点:   {r[4]}\n"
            f"    函数位置: {r[5]}:{r[6]} (模块: {r[7]})"
        ))
        if total == 0:
            print(f"[WARN] 未找到与 '{q}' 相关的影响链路")
        conn.close()
        return

    if qt in ("all", "function"):
        rows = conn.execute("""
            SELECT name, signature, file_path, line_number
            FROM functions
            WHERE name LIKE ? OR signature LIKE ? OR file_path LIKE ?
            ORDER BY name LIMIT 20
        """, (like, like, like)).fetchall()
        total += print_rows("函数/API", rows,
            lambda r: f"  - {r[0]} ({r[2]}:{r[3] or '?'}) | {r[1] or '无签名'}")

    if qt in ("all", "module"):
        rows = conn.execute("""
            SELECT name, path, responsibility, dependencies
            FROM modules
            WHERE name LIKE ? OR path LIKE ? OR responsibility LIKE ? OR dependencies LIKE ?
            ORDER BY name LIMIT 20
        """, (like, like, like, like)).fetchall()
        total += print_rows("模块", rows,
            lambda r: f"  - {r[0]} ({r[1]}) | 职责: {r[2] or '未填写'}")

    if qt in ("all", "entry"):
        rows = conn.execute("""
            SELECT name, type, file_path, line_number, trigger, call_chain
            FROM entry_points
            WHERE name LIKE ? OR trigger LIKE ? OR call_chain LIKE ?
            ORDER BY name LIMIT 20
        """, (like, like, like)).fetchall()
        total += print_rows("入口点", rows,
            lambda r: f"  - {r[0]} [{r[1]}] {r[2]}:{r[3] or '?'} | 触发: {r[4] or '-'} | 调用链: {r[5] or '-'}")

    if qt in ("all", "constraint"):
        rows = conn.execute("""
            SELECT source_doc, content, impact_scope, priority
            FROM constraints
            WHERE source_doc LIKE ? OR content LIKE ? OR impact_scope LIKE ?
            ORDER BY priority DESC LIMIT 20
        """, (like, like, like)).fetchall()
        total += print_rows("约束", rows,
            lambda r: f"  - 来源: {r[0]} | 约束: {r[1]} | 影响: {r[2] or '-'} | 优先级: {r[3]}")

    if qt in ("all", "impact"):
        rows = conn.execute("""
            SELECT change_point, direct_impact, indirect_impact, verification_points, risk_level
            FROM impact_items
            WHERE change_point LIKE ? OR direct_impact LIKE ?
               OR indirect_impact LIKE ? OR verification_points LIKE ?
            ORDER BY risk_level DESC LIMIT 20
        """, (like, like, like, like)).fetchall()
        total += print_rows("影响矩阵", rows,
            lambda r: f"  - 变更点: {r[0]} | 风险: {r[4]} | 验证: {r[3] or '-'}")

    if qt in ("all", "dataflow"):
        rows = conn.execute("""
            SELECT name, input_format, output_format, side_effects
            FROM dataflows
            WHERE name LIKE ? OR input_format LIKE ? OR output_format LIKE ? OR steps LIKE ?
            ORDER BY name LIMIT 20
        """, (like, like, like, like)).fetchall()
        total += print_rows("数据流", rows,
            lambda r: f"  - {r[0]} | 输入: {r[1] or '-'} | 输出: {r[2] or '-'}")

    conn.close()
    if total == 0:
        print(f"[WARN] 未找到匹配 '{q}' 的结果")


# ---------------------------------------------------------------------------
# CLI 入口
# ---------------------------------------------------------------------------

def main():
    setup_stdio_encoding()
    parser = argparse.ArgumentParser(
        description="largebase-structured-scan",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command")

    p_scan = sub.add_parser("scan", help="初始化扫描目录和数据库")
    p_scan.add_argument("--mode", required=True, choices=list(SCAN_MODES))
    p_scan.add_argument("--scope", required=True, nargs="+")
    p_scan.add_argument("--topic", required=True)
    p_scan.add_argument("--refs", nargs="*")

    p_load = sub.add_parser("load", help="从 scan-data.json 加载到 SQLite")
    p_load.add_argument("--load", required=True)
    p_load.add_argument("--db", required=True)

    p_query = sub.add_parser("query", help="查询 SQLite 扫描结果")
    p_query.add_argument("--query", required=True)
    p_query.add_argument("--db", required=True)
    p_query.add_argument("--type", default="all",
        choices=["all", "function", "module", "entry", "constraint", "impact", "dataflow", "impact-chain"])

    args = parser.parse_args()
    {
        "scan": cmd_scan,
        "load": cmd_load,
        "query": cmd_query,
    }.get(args.command, lambda _: parser.print_help())(args)


if __name__ == "__main__":
    main()
