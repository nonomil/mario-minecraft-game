param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("M1", "M2", "M3", "M4")]
  [string]$scan_mode,

  [Parameter(Mandatory = $true)]
  [string]$scan_topic,

  [Parameter(Mandatory = $false)]
  [string[]]$scope_paths = @("."),

  [Parameter(Mandatory = $false)]
  [string[]]$reference_docs = @(),

  [Parameter(Mandatory = $false)]
  [string]$query_text = "hybrid_search"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-Scope-Paths {
  param([string[]]$paths)

  if (-not $paths -or $paths.Count -eq 0) {
    throw "scope_paths cannot be empty."
  }

  $forbidden_exact = @(".", ".git", "node_modules", ".venv", "docs/scan")
  foreach ($item in $paths) {
    $norm = ($item -replace "\\", "/").Trim().TrimEnd("/")
    if ($forbidden_exact -contains $norm) {
      throw "scope_paths contains forbidden entry: $item. Use explicit business paths such as src docs references."
    }
    if ($norm -match "(^|/)(\\.git|node_modules|\\.venv|docs/scan)(/|$)") {
      throw "scope_paths contains non-business directory: $item. Remove .git/node_modules/.venv/docs/scan."
    }
  }
}

function Resolve-Python-Command {
  $python_cmd = Get-Command python -ErrorAction SilentlyContinue
  if ($python_cmd) {
    return "python"
  }
  $py_cmd = Get-Command py -ErrorAction SilentlyContinue
  if ($py_cmd) {
    return "py"
  }
  throw "python runtime not found. Install python or py launcher."
}

function Write-Step {
  param([string]$step_text)
  Write-Host ""
  Write-Host ("[STEP] " + $step_text)
}

function Assert-Path-Exists {
  param(
    [string]$target_path,
    [string]$error_text
  )
  if (-not (Test-Path -LiteralPath $target_path)) {
    throw $error_text
  }
}

Assert-Scope-Paths -paths $scope_paths
$python_exec = Resolve-Python-Command

Write-Step "Run scan init"
$scan_args = @(
  ".claude/skills/largebase-structured-scan/scan.py",
  "scan",
  "--mode", $scan_mode,
  "--scope"
) + $scope_paths + @(
  "--topic", $scan_topic
)
if ($reference_docs.Count -gt 0) {
  $scan_args += @("--refs") + $reference_docs
}

& $python_exec $scan_args
if ($LASTEXITCODE -ne 0) {
  throw "scan init failed; flow stopped."
}

$scan_date = Get-Date -Format "yyyy-MM-dd"
$output_dir = Join-Path "docs/scan" ($scan_date + "-" + $scan_topic)
$db_path = Join-Path $output_dir "scan.db"
$scan_data_path = Join-Path $output_dir "scan-data.json"

Assert-Path-Exists -target_path $db_path -error_text "scan init did not create scan.db: $db_path"

Write-Host "[OK] Step 1 check passed: scan.db exists"
Write-Host ("      " + $db_path)

if (-not (Test-Path -LiteralPath $scan_data_path)) {
  Write-Host ""
  Write-Host "[STOP] scan-data.json not found; stopped by gate."
  Write-Host ("       Generate Step 2 output first: {0}" -f $scan_data_path)
  Write-Host "       Then rerun this script to continue load + query checks."
  exit 2
}

Write-Step "Run load into SQLite"
& $python_exec .claude/skills/largebase-structured-scan/scan.py load --load $scan_data_path --db $db_path
if ($LASTEXITCODE -ne 0) {
  throw "load failed; flow stopped."
}

Write-Step "Run query validation"
& $python_exec .claude/skills/largebase-structured-scan/scan.py query --query $query_text --type all --db $db_path
if ($LASTEXITCODE -ne 0) {
  throw "query failed; flow stopped."
}

Write-Host ""
Write-Host "[DONE] largebase scan loop verification finished"
Write-Host ("       output_dir: {0}" -f $output_dir)
Write-Host ("       db_path:    {0}" -f $db_path)
Write-Host ("       scan_data:  {0}" -f $scan_data_path)
