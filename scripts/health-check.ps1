# Health Check Script for Czech Clubs Logos API

Write-Host "🏥 Czech Clubs Logos API - Health Check" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Backend Health Check
Write-Host "Checking Backend..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 5
    Write-Host "✓ Backend is running" -ForegroundColor Green
    Write-Host "  Status: $($backendResponse.status)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend is not responding" -ForegroundColor Red
    Write-Host "  Make sure the backend is running on port 8080" -ForegroundColor Gray
}

Write-Host ""

# Frontend Health Check
Write-Host "Checking Frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✓ Frontend is running" -ForegroundColor Green
        Write-Host "  Status Code: $($frontendResponse.StatusCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Frontend is not responding" -ForegroundColor Red
    Write-Host "  Make sure the frontend is running on port 3000" -ForegroundColor Gray
}

Write-Host ""

# Test API Endpoint
Write-Host "Testing API Endpoints..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "http://localhost:8080/clubs/search?q=sparta" -Method Get -TimeoutSec 5
    $clubCount = $searchResponse.Count
    Write-Host "✓ API search endpoint working" -ForegroundColor Green
    Write-Host "  Found $clubCount clubs" -ForegroundColor Gray
} catch {
    Write-Host "✗ API search endpoint failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Health check complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Health:   http://localhost:8080/health" -ForegroundColor Cyan
