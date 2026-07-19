# Option Strategies — first-time setup (Node only)
# Run: .\setup.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$env:PATH = "$(Join-Path $ProjectRoot 'tools\node');$env:PATH"
$NodeDir = Join-Path $ProjectRoot "backend\node"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$ToolsNpm = Join-Path $ProjectRoot "tools\node\npm.cmd"

function Find-Exe($Name, $Candidates) {
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($c in $Candidates) { if (Test-Path $c) { return $c } }
  return $null
}

$Npm = if (Test-Path $ToolsNpm) { $ToolsNpm } else { Find-Exe "npm" @("C:\Program Files\nodejs\npm.cmd") }
if (-not $Npm) {
  Write-Host "[ERROR] Node.js / npm required." -ForegroundColor Red
  exit 1
}

Write-Host "[1/2] Installing Node API deps..." -ForegroundColor Yellow
Push-Location $NodeDir
& $Npm install
Pop-Location

Write-Host "[2/2] Installing frontend deps..." -ForegroundColor Yellow
Push-Location $FrontendDir
& $Npm install
Pop-Location

Write-Host ""
Write-Host "Setup complete. Run .\run.ps1 to start." -ForegroundColor Green
