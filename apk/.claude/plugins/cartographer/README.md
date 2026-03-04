# Cartographer

<img width="640" height="360" alt="claudecartographer" src="https://github.com/user-attachments/assets/542818c6-fc2b-41a6-915d-cf196447f346" />


A Claude Code plugin that maps and documents codebases of any size using parallel AI subagents.

## Installation

**Step 1:** Add the marketplace to Claude Code:

```
/plugin marketplace add kingbootoshi/cartographer
```

**Step 2:** Install the plugin:

```
/plugin install cartographer
```

**Step 3:** Restart Claude Code (may be required for the skill to load)

**Step 4:** Use it:

```
/cartographer
```

Or just say "map this codebase" and it will trigger automatically.

## What it Does

Cartographer orchestrates multiple Sonnet subagents to analyze your entire codebase in parallel, then synthesizes their findings into:

- `docs/CODEBASE_MAP.md` - Detailed architecture map with file purposes, dependencies, data flows, and navigation guides
- Updates `CLAUDE.md` with a summary pointing to the map

## How it Works

1. Runs a scanner script to get file tree with token counts (respects .gitignore)
2. Plans how to split work across subagents based on token budgets
3. Spawns Sonnet subagents in parallel - each analyzes a portion of the codebase
4. Synthesizes all subagent reports into comprehensive documentation

## Update Mode

If `docs/CODEBASE_MAP.md` already exists, Cartographer will:

1. Check git history for changes since last mapping
2. Only re-analyze changed modules
3. Merge updates with existing documentation

Just run `/cartographer` again to update.

## Token Usage

⚠️ **NOTE:** This skill spawns Sonnet subagents for accurate, reliable analysis. Depending on codebase size, this can use significant tokens. Be mindful of your usage.

You can ask Claude to use Haiku subagents instead for a cheaper run, but accuracy may suffer on complex codebases.

## Requirements

- tiktoken (for token counting): `pip install tiktoken` or `uv pip install tiktoken`

## Full Documentation

See [plugins/cartographer/README.md](plugins/cartographer/README.md) for detailed documentation.

## License

MIT
