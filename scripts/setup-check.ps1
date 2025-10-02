# Setup Verification Script for Czech Clubs Logos API

Write-Host "🔍 Czech Clubs Logos API - Setup Verification" -ForegroundColor Cyan
Write-Host "=============================================`n" -ForegroundColor Cyan

$allGood = $true

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVersion = docker --version
    Write-Host "✓ Docker installed: $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Docker not found" -ForegroundColor Red
    Write-Host "  Install from: https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
    $allGood = $false
}

Write-Host ""

# Check Docker Compose
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose installed: $composeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Docker Compose not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check Go (optional)
Write-Host "Checking Go (optional for local dev)..." -ForegroundColor Yellow
if (Get-Command go -ErrorAction SilentlyContinue) {
    $goVersion = go version
    Write-Host "✓ Go installed: $goVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ Go not found (optional)" -ForegroundColor DarkYellow
    Write-Host "  Install from: https://go.dev/dl/" -ForegroundColor Gray
}

Write-Host ""

# Check Node.js (optional)
Write-Host "Checking Node.js (optional for local dev)..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ Node.js not found (optional)" -ForegroundColor DarkYellow
    Write-Host "  Install from: https://nodejs.org/" -ForegroundColor Gray
}

Write-Host ""

# Check project structure
Write-Host "Checking project structure..." -ForegroundColor Yellow
$requiredDirs = @("backend", "frontend")
$requiredFiles = @("docker-compose.yml", "README.md")

$structureGood = $true
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✓ Directory exists: $dir" -ForegroundColor Green
    } else {
        Write-Host "✗ Missing directory: $dir" -ForegroundColor Red
        $structureGood = $false
    }
}

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ File exists: $file" -ForegroundColor Green
    } else {
        Write-Host "✗ Missing file: $file" -ForegroundColor Red
        $structureGood = $false
    }
}

Write-Host ""

# Check ports
Write-Host "Checking if ports are available..." -ForegroundColor Yellow
$ports = @(3000, 8080)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "⚠ Port $port is in use" -ForegroundColor DarkYellow
        Write-Host "  You may need to stop the service using this port" -ForegroundColor Gray
    } else {
        Write-Host "✓ Port $port is available" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan

if ($allGood -and $structureGood) {
    Write-Host "✓ All checks passed! You're ready to start." -ForegroundColor Green
    Write-Host ""
    Write-Host "Run: docker-compose up" -ForegroundColor Cyan
} else {
    Write-Host "⚠ Some issues found. Please resolve them before starting." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "With Docker: docker-compose up" -ForegroundColor Cyan
    Write-Host "Without Docker: See QUICKSTART.md for manual setup" -ForegroundColor Cyan
}

Write-Host ""
