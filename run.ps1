# Option Strategies Dashboard — Full Stack Launcher
# Run: .\run.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$env:PATH = "$(Join-Path $ProjectRoot 'tools\node');$env:PATH"
$PythonDir = Join-Path $ProjectRoot "backend\python"
$NodeDir = Join-Path $ProjectRoot "backend\node"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$ToolsNode = Join-Path $ProjectRoot "tools\node\node.exe"
$ToolsNpm = Join-Path $ProjectRoot "tools\node\npm.cmd"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Option Strategies Dashboard Launcher  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Find-Exe($Name, $Candidates) {
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($c in $Candidates) { if (Test-Path $c) { return $c } }
  return $null
}

$Python = Find-Exe "python" @(
  "$ProjectRoot\tools\python-embed\python.exe",
  "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
  "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe"
)
if (-not $Python) {
  Write-Host "[ERROR] Python 3.11+ required. Install from python.org or run:" -ForegroundColor Red
  Write-Host "  winget install Python.Python.3.12" -ForegroundColor Yellow
  exit 1
}
Write-Host "[OK] Python: $Python" -ForegroundColor Green

$Node = if (Test-Path $ToolsNode) { $ToolsNode } else { Find-Exe "node" @("C:\Program Files\nodejs\node.exe") }
$Npm = if (Test-Path $ToolsNpm) { $ToolsNpm } else { Find-Exe "npm" @("C:\Program Files\nodejs\npm.cmd") }
if (-not $Node -or -not $Npm) {
  Write-Host "[ERROR] Node.js required. Install from nodejs.org or run:" -ForegroundColor Red
  Write-Host "  winget install OpenJS.NodeJS.LTS" -ForegroundColor Yellow
  exit 1
}
Write-Host "[OK] Node: $Node" -ForegroundColor Green

Write-Host ""
Write-Host "[1/4] Python analytics (56 strategies)..." -ForegroundColor Yellow
$Venv = Join-Path $PythonDir "venv"
$VenvPython = Join-Path $Venv "Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
  Write-Host "      No venv found — run .\setup.ps1 first (or: python -m venv venv in backend\python)." -ForegroundColor Red
  exit 1
}
& $VenvPython -m pip install -r (Join-Path $PythonDir "requirements.txt") -q
Write-Host "      Done." -ForegroundColor Green

Write-Host "[2/4] Node API gateway..." -ForegroundColor Yellow
Push-Location $NodeDir
if (-not (Test-Path "node_modules")) { & $Npm install }
Pop-Location
Write-Host "      Done." -ForegroundColor Green

Write-Host "[3/4] React frontend..." -ForegroundColor Yellow
Push-Location $FrontendDir
if (-not (Test-Path "node_modules")) { & $Npm install }
Pop-Location
Write-Host "      Done." -ForegroundColor Green

Write-Host "[4/4] Starting services..." -ForegroundColor Yellow
$env:PATH = "$(Join-Path $ProjectRoot 'tools\node');$env:PATH"
Start-Process -FilePath $VenvPython -ArgumentList "-m","uvicorn","main:app","--host","127.0.0.1","--port","8000" -WorkingDirectory $PythonDir -WindowStyle Normal
Start-Sleep -Seconds 2
Start-Process -FilePath $Node -ArgumentList "src/index.js" -WorkingDirectory $NodeDir -WindowStyle Normal
Start-Sleep -Seconds 2
Start-Process -FilePath $Npm -ArgumentList "run","dev" -WorkingDirectory $FrontendDir -WindowStyle Normal
Start-Sleep -Seconds 4

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  System running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Dashboard:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Intro/Greeks: http://localhost:5173/intro" -ForegroundColor Cyan
Write-Host "  Strategies:   http://localhost:5173/strategies" -ForegroundColor Cyan
Write-Host "  Node API:     http://localhost:4000/api/health" -ForegroundColor Cyan
Write-Host "  Python API:   http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Start-Process "http://localhost:5173"
