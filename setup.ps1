# Option Strategies Dashboard - one-time dependency setup
# Run from project root:  .\setup.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$PythonDir = Join-Path $ProjectRoot "backend\python"
$NodeDir = Join-Path $ProjectRoot "backend\node"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$ToolsNode = Join-Path $ProjectRoot "tools\node"
$NodeExe = Join-Path $ToolsNode "node.exe"
$NpmCmd = Join-Path $ToolsNode "npm.cmd"
$VenvPython = Join-Path $PythonDir "venv\Scripts\python.exe"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Option Strategies - Setup              " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Node: use absolute path (relative .\tools\node breaks after cd)
if (-not (Test-Path $NpmCmd)) {
  Write-Host ('[ERROR] Bundled Node not found at: ' + $ToolsNode) -ForegroundColor Red
  Write-Host "        Install Node.js LTS: winget install OpenJS.NodeJS.LTS" -ForegroundColor Yellow
  exit 1
}
$env:PATH = $ToolsNode + ';' + $env:PATH
Write-Host ('[OK] Node: ' + $NodeExe) -ForegroundColor Green

# Python venv: create only if missing
Write-Host ""
Write-Host "[1/3] Python venv + pip packages..." -ForegroundColor Yellow
if (-not (Test-Path $VenvPython)) {
  $Python = Get-Command python -ErrorAction SilentlyContinue
  if (-not $Python) {
    Write-Host '[ERROR] Python 3.11+ required. Run: winget install Python.Python.3.12' -ForegroundColor Red
    exit 1
  }
  Write-Host "      Creating venv (first time only)..." -ForegroundColor Gray
  Push-Location $PythonDir
  & $Python.Source -m venv venv
  Pop-Location
  if (-not (Test-Path $VenvPython)) {
    Write-Host '[ERROR] venv creation failed. Delete backend\python\venv and retry.' -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "      Using existing venv (skip python -m venv)." -ForegroundColor Gray
}
& $VenvPython -m pip install -r (Join-Path $PythonDir "requirements.txt") -q
Write-Host "      Done." -ForegroundColor Green

Write-Host "[2/3] Node API (backend\node)..." -ForegroundColor Yellow
Push-Location $NodeDir
& $NpmCmd install
Pop-Location
Write-Host "      Done." -ForegroundColor Green

Write-Host "[3/3] Frontend (frontend)..." -ForegroundColor Yellow
Push-Location $FrontendDir
& $NpmCmd install
Pop-Location
Write-Host "      Done." -ForegroundColor Green

Write-Host ""
Write-Host "Setup complete. Start the app with:" -ForegroundColor Green
Write-Host "  .\run.ps1" -ForegroundColor Cyan
Write-Host ""
