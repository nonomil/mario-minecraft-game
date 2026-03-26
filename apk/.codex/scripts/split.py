#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description='Split one source document into two output documents.')
    parser.add_argument('--source', required=True, help='Source file path.')
    parser.add_argument('--primary-output', required=True, help='Primary output file path.')
    parser.add_argument('--secondary-output', required=True, help='Secondary output file path.')
    parser.add_argument('--primary-start', type=int, required=True, help='Primary section start line, 1-based.')
    parser.add_argument('--primary-end', type=int, required=True, help='Primary section end line, inclusive.')
    parser.add_argument('--secondary-prefix-end', type=int, default=0, help='Keep lines 1..N in the secondary output before the suffix.')
    parser.add_argument('--secondary-suffix-start', type=int, required=True, help='Keep lines N..end in the secondary output from this 1-based line.')
    parser.add_argument('--primary-title', default='', help='Optional title inserted at the top of the primary output.')
    return parser


def validate_ranges(line_count: int, args: argparse.Namespace) -> None:
    if args.primary_start < 1 or args.primary_end < args.primary_start:
        raise ValueError('Invalid primary line range.')
    if args.primary_end > line_count:
        raise ValueError('Primary line range exceeds the source length.')
    if args.secondary_prefix_end < 0 or args.secondary_prefix_end > line_count:
        raise ValueError('Invalid secondary prefix range.')
    if args.secondary_suffix_start < 1 or args.secondary_suffix_start > line_count + 1:
        raise ValueError('Invalid secondary suffix start line.')


def split_document(args: argparse.Namespace) -> tuple[Path, Path]:
    source_path = Path(args.source)
    primary_output_path = Path(args.primary_output)
    secondary_output_path = Path(args.secondary_output)

    source_lines = source_path.read_text(encoding='utf-8').splitlines(keepends=True)
    validate_ranges(len(source_lines), args)

    primary_lines = source_lines[args.primary_start - 1 : args.primary_end]
    if args.primary_title:
        primary_lines = [f'{args.primary_title}\n\n'] + primary_lines
    secondary_lines = source_lines[: args.secondary_prefix_end] + source_lines[args.secondary_suffix_start - 1 :]

    primary_output_path.parent.mkdir(parents=True, exist_ok=True)
    secondary_output_path.parent.mkdir(parents=True, exist_ok=True)
    primary_output_path.write_text(''.join(primary_lines), encoding='utf-8')
    secondary_output_path.write_text(''.join(secondary_lines), encoding='utf-8')
    return primary_output_path, secondary_output_path


def main() -> int:
    parser = build_argument_parser()
    args = parser.parse_args()
    primary_output_path, secondary_output_path = split_document(args)
    print('Split completed:')
    print(f'- Primary output: {primary_output_path}')
    print(f'- Secondary output: {secondary_output_path}')
    print('- Source file kept unchanged')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
