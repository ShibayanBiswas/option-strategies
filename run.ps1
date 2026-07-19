# Option Strategies Dashboard — Full Stack Launcher (Node API + Vite)
# Run: .\run.ps1
# Analytics are embedded in Node — no Python / Render service required.

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$env:PATH = "$(Join-Path $ProjectRoot 'tools\node');$env:PATH"
$NodeDir = Join-Path $ProjectRoot "backend\node"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$ToolsNode = Join-Path $ProjectRoot "tools\node\node.exe"
$ToolsNpm = Join-Path $ProjectRoot "tools\node\npm.cmd"

Write-Host ""
Write-Host "========================================" -ForegroundColor DarkYellow
Write-Host "  Option Strategies Dashboard Launcher  " -ForegroundColor DarkYellow
Write-Host "========================================" -ForegroundColor DarkYellow
Write-Host ""

function Find-Exe($Name, $Candidates) {
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($c in $Candidates) { if (Test-Path $c) { return $c } }
  return $null
}

$Node = if (Test-Path $ToolsNode) { $ToolsNode } else { Find-Exe "node" @("C:\Program Files\nodejs\node.exe") }
$Npm = if (Test-Path $ToolsNpm) { $ToolsNpm } else { Find-Exe "npm" @("C:\Program Files\nodejs\npm.cmd") }
if (-not $Node -or -not $Npm) {
  Write-Host "[ERROR] Node.js required. Install from nodejs.org or run:" -ForegroundColor Red
  Write-Host "  winget install OpenJS.NodeJS.LTS" -ForegroundColor Yellow
  exit 1
}
Write-Host "[OK] Node: $Node" -ForegroundColor Green

Write-Host ""
Write-Host "[1/3] Node API (embedded Black-Scholes engine)..." -ForegroundColor Yellow
Push-Location $NodeDir
if (-not (Test-Path "node_modules")) { & $Npm install }
Pop-Location
Write-Host "      Done." -ForegroundColor Green

Write-Host "[2/3] React frontend..." -ForegroundColor Yellow
Push-Location $FrontendDir
if (-not (Test-Path "node_modules")) { & $Npm install }
Pop-Location
Write-Host "      Done." -ForegroundColor Green

Write-Host "[3/3] Starting services..." -ForegroundColor Yellow
$env:PATH = "$(Join-Path $ProjectRoot 'tools\node');$env:PATH"
Start-Process -FilePath $Node -ArgumentList "src/index.js" -WorkingDirectory $NodeDir -WindowStyle Normal
Start-Sleep -Seconds 2
Start-Process -FilePath $Npm -ArgumentList "run","dev" -WorkingDirectory $FrontendDir -WindowStyle Normal
Start-Sleep -Seconds 4

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Dashboard:  http://localhost:5173" -ForegroundColor Green
Write-Host "  API health: http://localhost:4000/api/health" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Start-Process "http://localhost:5173"
