# BPMN POC Startup Script
# Checks Docker → starts Flowable → starts backend + frontend

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  BPMN POC - Flowable Approval Flow" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check Docker ─────────────────────────────────────────────────────────
Write-Host "[1/4] Checking Docker..." -ForegroundColor Yellow
try {
    docker info 2>&1 | Out-Null
    Write-Host "      Docker is running." -ForegroundColor Green
} catch {
    Write-Host "      ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# ── 2. Start Flowable ────────────────────────────────────────────────────────
Write-Host "[2/4] Checking Flowable container..." -ForegroundColor Yellow

$running = docker ps --filter "name=flowable-engine" --filter "status=running" --format "{{.Names}}" 2>&1
if ($running -match "flowable-engine") {
    Write-Host "      Flowable already running." -ForegroundColor Green
} else {
    Write-Host "      Starting Flowable (flowable/flowable-ui)..." -ForegroundColor Yellow
    Set-Location $root
    docker-compose up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "      ERROR: docker-compose failed." -ForegroundColor Red
        exit 1
    }

    Write-Host "      Waiting for Flowable to be ready (this takes ~60s on first run)..." -ForegroundColor Yellow
    $maxWait = 90
    $waited = 0
    $ready = $false
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 5
        $waited += 5
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:9000/flowable-ui/process-api/repository/deployments" `
                -Credential (New-Object System.Management.Automation.PSCredential("admin", (ConvertTo-SecureString "test" -AsPlainText -Force))) `
                -UseBasicParsing -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                $ready = $true
                break
            }
        } catch {
            Write-Host "      Still waiting... ($waited/$maxWait s)" -ForegroundColor DarkGray
        }
    }

    if (-not $ready) {
        Write-Host "      WARNING: Flowable may not be ready yet. Backend will retry automatically." -ForegroundColor Yellow
    } else {
        Write-Host "      Flowable is ready!" -ForegroundColor Green
    }
}

# ── 3. Install dependencies ──────────────────────────────────────────────────
Write-Host "[3/4] Installing dependencies..." -ForegroundColor Yellow

Push-Location "$root\backend"
if (-not (Test-Path "node_modules")) {
    Write-Host "      npm install (backend)..." -ForegroundColor DarkGray
    npm install --silent
}
Pop-Location

Push-Location "$root\frontend"
if (-not (Test-Path "node_modules")) {
    Write-Host "      npm install (frontend)..." -ForegroundColor DarkGray
    npm install --silent
}
Pop-Location

Write-Host "      Dependencies ready." -ForegroundColor Green

# ── 4. Launch services ───────────────────────────────────────────────────────
Write-Host "[4/4] Starting backend and frontend..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\backend'; Write-Host 'Backend starting...' -ForegroundColor Cyan; node server.js"
) -WindowStyle Normal

Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\frontend'; Write-Host 'Frontend starting...' -ForegroundColor Cyan; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Services starting up:" -ForegroundColor Green
Write-Host "    Frontend  ->  http://localhost:5173" -ForegroundColor Green
Write-Host "    Backend   ->  http://localhost:3001" -ForegroundColor Green
Write-Host "    Flowable  ->  http://localhost:9000/flowable-ui" -ForegroundColor Green
Write-Host "               (admin / test)" -ForegroundColor DarkGray
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Opening browser in 5 seconds..." -ForegroundColor DarkGray

Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"
