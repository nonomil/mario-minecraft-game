$ErrorActionPreference = "Stop"

function Run-Cmd([string]$commandLine) {
  $outFile = Join-Path $env:TEMP "pushbat.out"
  $errFile = Join-Path $env:TEMP "pushbat.err"

  if (Test-Path $outFile) { Remove-Item $outFile -Force }
  if (Test-Path $errFile) { Remove-Item $errFile -Force }

  # Use /u so builtin echo output is UTF-16LE for stable decoding on Windows PowerShell 5.1.
  $p = Start-Process -FilePath "cmd.exe" -ArgumentList "/u", "/c", $commandLine -NoNewWindow -Wait -PassThru -RedirectStandardOutput $outFile -RedirectStandardError $errFile
  $out = ""
  if (Test-Path $outFile) { $out = Get-Content -Raw -Encoding Unicode $outFile }
  $err = ""
  if (Test-Path $errFile) { $err = Get-Content -Raw -Encoding Unicode $errFile }
  return @{ ExitCode = $p.ExitCode; Out = $out; Err = $err }
}

$pushBatPath = Join-Path $PSScriptRoot "..\\push.bat"
$pushBatText = Get-Content -Raw -Encoding UTF8 $pushBatPath

# Fast-fail until the script supports deterministic dry-run.
if ($pushBatText -notmatch "--dry-run") { throw "expected apk/push.bat to support --dry-run" }
if ($pushBatText -notmatch "--mode") { throw "expected apk/push.bat to support --mode" }

$r = Run-Cmd "apk\\push.bat --mode auto --dry-run"

if ($r.ExitCode -ne 0) {
  throw "expected exit code 0, got $($r.ExitCode)`nOUT:`n$($r.Out)`nERR:`n$($r.Err)"
}

$autoDetectText = [string][char]0x81EA + [char]0x52A8 + [char]0x68C0 + [char]0x6D4B
if ($r.Out -notmatch $autoDetectText) { throw "expected Chinese mode output (自动检测) but got:`n$($r.Out)" }
if ($r.Out.IndexOf("127.0.0.1:1080") -lt 0) { throw "expected proxy address mention but got:`n$($r.Out)" }
