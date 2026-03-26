#!/usr/bin/env python3

from __future__ import annotations

import sys


def ensure_utf8_output() -> None:
    """固定脚本输出编码，减少 Windows 终端乱码。"""
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

import audit_active_docs_terms
import scan_codex_workflow_repo
import simulate_codex_workflows
import validate_doc_call_graph


ROLE_EXPECTATION = 'Codex'


def validate_routes() -> tuple[list[str], dict[str, object]]:
    failures: list[str] = []
    matrix_result = simulate_codex_workflows.build_keyword_matrix()

    for workflow_report in matrix_result['workflows']:
        workflow_name = workflow_report['workflow_name']
        spec = simulate_codex_workflows.WORKFLOW_SPECS[workflow_name]
        simulation_result = simulate_codex_workflows.build_simulation_output(spec, '')
        if simulation_result['lead_role'] != ROLE_EXPECTATION:
            failures.append(f"Workflow `{workflow_name}` does not lead with {ROLE_EXPECTATION}.")
        if not simulation_result['claude_role']:
            failures.append(f"Workflow `{workflow_name}` is missing a Claude Code reviewer role.")
        for case_result in workflow_report['misrouted_cases']:
            failures.append(
                f"Request `{case_result['request_text']}` expected `{case_result['expected_workflow']}` "
                f"but got `{case_result['actual_workflow']}`."
            )

    return failures, matrix_result


def print_matrix_summary(matrix_result: dict[str, object]) -> None:
    print(
        'Keyword matrix summary: '
        f"{matrix_result['workflow_count']} workflows, "
        f"{matrix_result['total_case_count']} samples, "
        f"{matrix_result['failure_count']} misroutes"
    )
    for workflow_report in matrix_result['workflows']:
        print(
            '- '
            f"{workflow_report['workflow_name']}: "
            f"{workflow_report['matched_count']}/{workflow_report['sample_count']} matched"
        )


def main() -> int:
    ensure_utf8_output()
    print('Step 1/4: validate document call graph')
    doc_exit_code = validate_doc_call_graph.main()

    print('Step 2/4: audit active docs')
    audit_exit_code = audit_active_docs_terms.run_audit()

    print('Step 3/4: scan repository')
    scan_exit_code = scan_codex_workflow_repo.run_scan(strict=True)

    print('Step 4/4: validate workflow routes')
    route_failures, matrix_result = validate_routes()
    print_matrix_summary(matrix_result)
    if route_failures:
        print('Route validation failed:')
        for failure in route_failures:
            print(f'- {failure}')

    if doc_exit_code or audit_exit_code or scan_exit_code or route_failures:
        return 1

    print('All validations passed for the Codex-led workflow.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
