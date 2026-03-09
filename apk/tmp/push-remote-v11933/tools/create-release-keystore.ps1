param(
  [string]$Alias = "release",
  [int]$ValidityDays = 36500,
  [string]$DName = "CN=release,O=mario-minecraft-game,C=CN",
  [string]$KeytoolPath = "",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$keytoolExe = $null
if ($KeytoolPath) {
  $keytoolExe = (Resolve-Path -LiteralPath $KeytoolPath).Path
} else {
  $cmd = Get-Command keytool -ErrorAction SilentlyContinue
  if ($cmd) {
    $keytoolExe = $cmd.Source
  } elseif ($env:JAVA_HOME) {
    $candidate = Join-Path $env:JAVA_HOME "bin\\keytool.exe"
    if (Test-Path -LiteralPath $candidate) { $keytoolExe = $candidate }
  }

  if (-not $keytoolExe) {
    $candidates = @(
      "C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\keytool.exe",
      "C:\\Program Files\\Android\\Android Studio\\jre\\bin\\keytool.exe",
      "C:\\Program Files\\Java\\jdk-21\\bin\\keytool.exe",
      "C:\\Program Files\\Java\\jdk-17\\bin\\keytool.exe",
      "C:\\Program Files\\Java\\jdk-11\\bin\\keytool.exe"
    )
    foreach ($c in $candidates) {
      if (Test-Path -LiteralPath $c) { $keytoolExe = $c; break }
    }
  }
}

if (-not $keytoolExe) {
  throw "keytool not found. Install JDK/Android Studio or set JAVA_HOME, or pass -KeytoolPath to this script."
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$outDir = Join-Path $repoRoot "apks"
$keystorePath = Join-Path $outDir "release.keystore"
$base64Path = Join-Path $outDir "release.keystore.base64.txt"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

if ((Test-Path -LiteralPath $keystorePath) -and (-not $Force)) {
  throw "Keystore already exists: $keystorePath. Re-run with -Force to overwrite."
}

if (Test-Path -LiteralPath $keystorePath) {
  Remove-Item -Force -LiteralPath $keystorePath
}

$storePassSecure = Read-Host "Store password" -AsSecureString
$keyPassSecure = Read-Host "Key password (enter same as store password is OK)" -AsSecureString

$storePass = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePassSecure))
$keyPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassSecure))

try {
  & $keytoolExe -genkeypair `
    -v `
    -storetype PKCS12 `
    -keystore $keystorePath `
    -alias $Alias `
    -keyalg RSA `
    -keysize 2048 `
    -validity $ValidityDays `
    -dname $DName `
    -storepass $storePass `
    -keypass $keyPass | Out-Null
} finally {
  $storePass = $null
  $keyPass = $null
}

$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($keystorePath))
Set-Content -NoNewline -Encoding ASCII -LiteralPath $base64Path -Value $b64

Write-Host "Created: $keystorePath"
Write-Host "Created: $base64Path"
Write-Host ""
Write-Host "GitHub Secrets:"
Write-Host "  ANDROID_KEYSTORE_BASE64 = (contents of $base64Path)"
Write-Host "  ANDROID_KEYSTORE_PASSWORD = (store password you typed)"
Write-Host "  ANDROID_KEY_ALIAS = $Alias"
Write-Host "  ANDROID_KEY_PASSWORD = (key password you typed)"
