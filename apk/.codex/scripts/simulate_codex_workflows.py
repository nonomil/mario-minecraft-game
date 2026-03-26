#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def ensure_utf8_output() -> None:
    """固定脚本输出编码，减少 Windows 终端乱码。"""
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
WORKFLOW_TRIGGER_ORDER = ['init', 'review', 'debug', 'research', 'largebase', 'parallel', 'complex']


@dataclass(frozen=True)
class WorkflowSpec:
    workflow_name: str
    display_name: str
    doc_path: str
    trigger_hint: str
    phases: list[str]
    lead_role: str
    claude_role: str
    recommended_skill: str
    gate_summary: list[str]


WORKFLOW_SPECS: dict[str, WorkflowSpec] = {
    'init': WorkflowSpec(
        workflow_name='init',
        display_name='Project Init',
        doc_path='.codex/workflows/codex-workflow-init.md',
        trigger_hint='First-time project setup or workflow constants update',
        phases=[
            'Read repository status',
            'Collect branch and worktree constants',
            'Write workflow constants',
            'Print next-step entry points',
        ],
        lead_role='Codex',
        claude_role='Only joins when extra review or external capability is needed',
        recommended_skill='superpowers:writing-plans',
        gate_summary=['Never rename or move existing files automatically', 'Only write constants and docs'],
    ),
    'complex': WorkflowSpec(
        workflow_name='complex',
        display_name='Complex Delivery',
        doc_path='.codex/workflows/codex-workflow-complex.md',
        trigger_hint='More than 3 files, diff over 200 lines, cross-module, or ambiguous task',
        phases=[
            'Restate the request and ambiguity list',
            'Decide workflow route',
            'Write an execution plan',
            'Implement and validate',
            'Summarize risks and delivery',
        ],
        lead_role='Codex',
        claude_role='Acts as a second reviewer and feasibility checker',
        recommended_skill='superpowers:writing-plans',
        gate_summary=['Get user confirmation before coding when needed', 'Validate before delivery'],
    ),
    'debug': WorkflowSpec(
        workflow_name='debug',
        display_name='Debug',
        doc_path='.codex/workflows/codex-workflow-debug.md',
        trigger_hint='Bug report, error, exception, or failing test',
        phases=[
            'Reproduce the failure',
            'Find and verify the root cause',
            'Apply the smallest safe fix',
            'Run regression checks',
        ],
        lead_role='Codex',
        claude_role='Optional cross-check only',
        recommended_skill='superpowers:systematic-debugging',
        gate_summary=['Reproduce before fixing', 'Run regression checks'],
    ),
    'research': WorkflowSpec(
        workflow_name='research',
        display_name='Research',
        doc_path='.codex/workflows/codex-workflow-research.md',
        trigger_hint='Research, compare, evaluate, or search primary sources',
        phases=[
            'Clarify goals and constraints',
            'Collect primary sources',
            'Compare options',
            'Recommend a path',
        ],
        lead_role='Codex',
        claude_role='Optional cross-check without taking the lead',
        recommended_skill='superpowers:brainstorming',
        gate_summary=['Prefer primary sources', 'Always include migration advice'],
    ),
    'parallel': WorkflowSpec(
        workflow_name='parallel',
        display_name='Parallel Delivery',
        doc_path='.codex/workflows/codex-workflow-parallel.md',
        trigger_hint='Two or more independent tasks can move in parallel',
        phases=[
            'Split work by scope',
            'Create parallel execution units',
            'Validate boundaries mid-flight',
            'Run merge guards and regression checks',
        ],
        lead_role='Codex',
        claude_role='May review one branch, but does not own dispatch',
        recommended_skill='superpowers:dispatching-parallel-agents',
        gate_summary=['Scopes must not overlap', 'Pass merge guards before integration'],
    ),
    'largebase': WorkflowSpec(
        workflow_name='largebase',
        display_name='Large Codebase Scan',
        doc_path='.codex/workflows/codex-workflow-largebase.md',
        trigger_hint='Large repository, cross-module impact, or scan-first request',
        phases=[
            'Generate structured scan output',
            'Extract architecture and dataflow findings',
            'Build an impact matrix',
            'Route into the next workflow',
        ],
        lead_role='Codex',
        claude_role='Secondary validation only',
        recommended_skill='largebase-structured-scan',
        gate_summary=['Scan before editing', 'Do not start coding with incomplete scan output'],
    ),
    'review': WorkflowSpec(
        workflow_name='review',
        display_name='Review',
        doc_path='.codex/workflows/codex-workflow-review.md',
        trigger_hint='Code review, quality gate, or merge readiness',
        phases=[
            'Confirm review scope',
            'Run Codex first-pass review',
            'Run Claude Code second-pass review',
            'Let Codex arbitrate and summarize',
        ],
        lead_role='Codex',
        claude_role='Independent second reviewer',
        recommended_skill='superpowers:requesting-code-review',
        gate_summary=['P0 and P1 findings block progress', 'Final decision stays with Codex'],
    ),
}

ROUTING_PRIORITY = ['init', 'review', 'debug', 'research', 'largebase', 'parallel', 'complex']

ROUTING_KEYWORDS = {
    'init': ['initialize', 'init', 'bootstrap', 'project setup', 'workflow constants', 'setup worktree', 'worktree rules', 'project constants', '初始化', '接入项目', '工作流常量', '配置 worktree', '初始化项目'],
    'review': ['review', 'code review', 'quality gate', 'merge check', 'p0', 'p1', 'p2', 'p3', 'audit', '代码审查', '代码评审', '评审', '审查', '质量检查', '合并前风险'],
    'debug': ['bug', 'error', 'exception', 'failure', 'test fail', 'traceback', 'crash', 'regression', '报错', '错误', '异常', '失败', '测试失败', '崩溃', '定位 bug'],
    'research': ['research', 'compare', 'evaluation', 'evaluate', 'search docs', 'search primary docs', 'benchmark', 'investigate options', 'migration approach', '调研', '对比', '选型', '搜索', '研究', '官方文档', '资料'],
    'largebase': ['large codebase', 'large repo', 'scan first', 'impact analysis', 'cross-module scan', 'repository scan', 'structured scan', '大型代码库', '大仓库', '先扫描', '结构化扫描', '全库扫描', '影响分析', '跨模块扫描'],
    'parallel': ['parallel', 'split into two tasks', 'split into 2 tasks', 'independent tasks', 'work in parallel', 'multiple branches', '并行', '并行开发', '拆成两个', '互不重叠', '多任务', '同时推进', '并行处理'],
    'complex': ['complex feature', 'cross-module feature', 'many files', 'ambiguous requirement', 'multi-module change', '复杂功能', '跨模块', '多个文件改动', '需求有歧义', '多模块', '先写计划', '先写 plan'],
}

WORKFLOW_TRIGGER_CASES = {
    'init': [
        'initialize this project and write workflow constants',
        'bootstrap the repo before any implementation work',
        'set up worktree rules and project constants',
        'do the initial project setup first',
        '请先初始化项目并写入工作流常量',
        '先接入项目，再配置 worktree 规则',
    ],
    'review': [
        'review this change and report findings by p0-p3',
        'run a code review before merge',
        'do a quality gate pass on this patch',
        'audit the change for review findings',
        '请做代码审查，按 P0-P3 输出问题',
        '请做 code review，重点看合并前风险',
    ],
    'debug': [
        'the api test fails, find the bug and fix it',
        'there is a traceback in production, debug it',
        'we hit an exception, please diagnose the failure',
        'this regression needs root-cause analysis',
        '这个接口测试失败了，帮我定位 bug 并修复',
        '线上报错了，请排查异常根因',
    ],
    'research': [
        'research the latest Codex and Claude Code workflow patterns',
        'compare implementation options and recommend one',
        'search primary docs and summarize the result',
        'evaluate the migration approach before coding',
        '请调研 Codex 与 Claude Code 的最新协作方式',
        '搜索官方文档，再给我迁移建议',
    ],
    'largebase': [
        'this is a large codebase, scan first and do impact analysis',
        'run a repository scan before touching code',
        'we need a structured scan for this large repo',
        'do a cross-module scan before planning changes',
        '这是个大型代码库，先扫描并做影响分析',
        '请先做全库结构化扫描，再开始规划',
    ],
    'parallel': [
        'split this into two tasks and work in parallel',
        'create independent tasks for parallel delivery',
        'use multiple branches for non-overlapping work',
        'dispatch this as parallel workstreams',
        '把这个需求拆成两个互不重叠的任务并行开发',
        '请拆成多任务并行处理，同时推进',
    ],
    'complex': [
        'deliver a complex cross-module feature',
        'this is an ambiguous requirement touching many files',
        'plan a multi-module change before coding',
        'handle this complex feature end to end',
        '新增一个跨多个模块的复杂功能并落地',
        '先写 plan，再开始编码，这个需求跨模块而且还有歧义',
    ],
}



def normalize_text(input_text: str) -> str:
    return ' '.join(input_text.strip().lower().split())


def pick_workflow_from_request(request_text: str) -> str:
    normalized_text = normalize_text(request_text)
    if not normalized_text:
        return 'complex'

    best_workflow = 'complex'
    best_score = 0
    for workflow_name in ROUTING_PRIORITY:
        keywords = ROUTING_KEYWORDS.get(workflow_name, [])
        score = sum(1 for keyword in keywords if keyword in normalized_text)
        if score > best_score:
            best_workflow = workflow_name
            best_score = score

    if best_score == 0:
        return 'complex'
    return best_workflow


def build_simulation_output(spec: WorkflowSpec, request_text: str) -> dict[str, object]:
    phase_logs = [
        {
            'phase_index': phase_index,
            'phase_name': phase_name,
            'result': 'pass',
        }
        for phase_index, phase_name in enumerate(spec.phases, start=1)
    ]
    return {
        'workflow_name': spec.workflow_name,
        'display_name': spec.display_name,
        'doc_path': spec.doc_path,
        'request_text': request_text,
        'lead_role': spec.lead_role,
        'claude_role': spec.claude_role,
        'recommended_skill': spec.recommended_skill,
        'gate_summary': spec.gate_summary,
        'phase_logs': phase_logs,
        'summary': f"{spec.display_name} simulated {len(spec.phases)} passing phases.",
    }


def build_keyword_matrix() -> dict[str, object]:
    workflow_reports: list[dict[str, object]] = []
    failures: list[dict[str, str]] = []
    total_case_count = 0

    for workflow_name in WORKFLOW_TRIGGER_ORDER:
        request_texts = WORKFLOW_TRIGGER_CASES[workflow_name]
        matched_cases: list[dict[str, str]] = []
        misrouted_cases: list[dict[str, str]] = []
        total_case_count += len(request_texts)

        for request_text in request_texts:
            actual_workflow = pick_workflow_from_request(request_text)
            case_result = {
                'request_text': request_text,
                'expected_workflow': workflow_name,
                'actual_workflow': actual_workflow,
            }
            if actual_workflow == workflow_name:
                matched_cases.append(case_result)
            else:
                misrouted_cases.append(case_result)
                failures.append(case_result)

        workflow_reports.append(
            {
                'workflow_name': workflow_name,
                'display_name': WORKFLOW_SPECS[workflow_name].display_name,
                'sample_count': len(request_texts),
                'matched_count': len(matched_cases),
                'misrouted_count': len(misrouted_cases),
                'matched_cases': matched_cases,
                'misrouted_cases': misrouted_cases,
            }
        )

    return {
        'workflow_count': len(workflow_reports),
        'total_case_count': total_case_count,
        'failure_count': len(failures),
        'workflows': workflow_reports,
        'failures': failures,
    }


def verify_workflow_docs() -> list[str]:
    missing_docs: list[str] = []
    for spec in WORKFLOW_SPECS.values():
        workflow_doc_path = REPO_ROOT / spec.doc_path
        if not workflow_doc_path.exists():
            missing_docs.append(spec.doc_path)
    return missing_docs


def print_text_result(simulation_result: dict[str, object]) -> None:
    print(f"Workflow: {simulation_result['workflow_name']} ({simulation_result['display_name']})")
    print(f"Doc: {simulation_result['doc_path']}")
    print(f"Request: {simulation_result['request_text'] or '(empty)'}")
    print(f"Lead role: {simulation_result['lead_role']}")
    print(f"Claude Code role: {simulation_result['claude_role']}")
    print(f"Recommended skill: {simulation_result['recommended_skill']}")
    print('Gate summary:')
    for gate_item in simulation_result['gate_summary']:
        print(f'  - {gate_item}')
    print('Phases:')
    for phase_log in simulation_result['phase_logs']:
        print(f"  - Phase {phase_log['phase_index']}: {phase_log['phase_name']} -> {phase_log['result']}")
    print(f"Summary: {simulation_result['summary']}")


def print_keyword_matrix(matrix_result: dict[str, object]) -> None:
    print('Keyword routing matrix')
    print(f"Workflow count: {matrix_result['workflow_count']}")
    print(f"Sample count: {matrix_result['total_case_count']}")
    print(f"Misroutes: {matrix_result['failure_count']}")
    for workflow_report in matrix_result['workflows']:
        print('-' * 72)
        print(f"Workflow: {workflow_report['workflow_name']} ({workflow_report['display_name']})")
        print(
            'Stats: '
            f"{workflow_report['matched_count']}/{workflow_report['sample_count']} matched, "
            f"misroutes={workflow_report['misrouted_count']}"
        )
        if workflow_report['misrouted_cases']:
            print('Misrouted cases:')
            for case_result in workflow_report['misrouted_cases']:
                print(
                    f"  - request `{case_result['request_text']}` expected `{case_result['expected_workflow']}` "
                    f"but got `{case_result['actual_workflow']}`"
                )
        else:
            print('Status: pass')


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Simulate Codex workflow routing and phase execution.')
    parser.add_argument('--workflow', choices=['all', *WORKFLOW_SPECS.keys()], default='all')
    parser.add_argument('--request', default='')
    parser.add_argument('--auto-route', action='store_true')
    parser.add_argument('--keyword-matrix', action='store_true')
    parser.add_argument('--format', choices=['text', 'json'], default='text')
    parser.add_argument('--skip-verify', action='store_true')
    return parser.parse_args()


def main() -> int:
    ensure_utf8_output()
    args = parse_args()

    if not args.skip_verify:
        missing_docs = verify_workflow_docs()
        if missing_docs:
            print('Missing workflow docs:', file=sys.stderr)
            for doc_path in missing_docs:
                print(f'  - {doc_path}', file=sys.stderr)
            return 2

    if args.keyword_matrix:
        matrix_result = build_keyword_matrix()
        if args.format == 'json':
            print(json.dumps(matrix_result, ensure_ascii=False, indent=2))
        else:
            print_keyword_matrix(matrix_result)
        return 1 if matrix_result['failure_count'] else 0

    if args.auto_route:
        workflow_names = [pick_workflow_from_request(args.request)]
    elif args.workflow == 'all':
        workflow_names = list(WORKFLOW_SPECS.keys())
    else:
        workflow_names = [args.workflow]

    simulation_results = [
        build_simulation_output(WORKFLOW_SPECS[workflow_name], args.request)
        for workflow_name in workflow_names
    ]

    if args.format == 'json':
        output_payload = {
            'workflow_count': len(simulation_results),
            'workflows': simulation_results,
            'available_workflows': [asdict(spec) for spec in WORKFLOW_SPECS.values()],
        }
        print(json.dumps(output_payload, ensure_ascii=False, indent=2))
    else:
        print(f'Simulated workflows: {len(simulation_results)}')
        for result in simulation_results:
            print('-' * 72)
            print_text_result(result)
        if args.auto_route:
            print('-' * 72)
            print(f'Auto-routed workflow: {workflow_names[0]}')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
