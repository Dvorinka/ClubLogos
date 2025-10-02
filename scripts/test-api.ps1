# API Testing Script for Czech Clubs Logos API

param(
    [string]$BaseUrl = "http://localhost:8080"
)

Write-Host "🧪 Czech Clubs Logos API - Testing Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Testing against: $BaseUrl`n" -ForegroundColor Gray

$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET"
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri $Url -Method $Method -TimeoutSec 10
        Write-Host "  ✓ PASS" -ForegroundColor Green
        $script:testsPassed++
        return $response
    } catch {
        Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

# Test 1: Health Check
Write-Host "1. Health Check" -ForegroundColor Cyan
$health = Test-Endpoint -Name "GET /health" -Url "$BaseUrl/health"
if ($health) {
    Write-Host "  Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
}
Write-Host ""

# Test 2: Search Clubs
Write-Host "2. Club Search" -ForegroundColor Cyan
$searchResult = Test-Endpoint -Name "GET /clubs/search?q=sparta" -Url "$BaseUrl/clubs/search?q=sparta"
if ($searchResult) {
    Write-Host "  Found: $($searchResult.Count) clubs" -ForegroundColor Gray
    if ($searchResult.Count -gt 0) {
        Write-Host "  First club: $($searchResult[0].name)" -ForegroundColor Gray
    }
}
Write-Host ""

# Test 3: Search Different Query
Write-Host "3. Club Search (Slavia)" -ForegroundColor Cyan
$slaviaResult = Test-Endpoint -Name "GET /clubs/search?q=slavia" -Url "$BaseUrl/clubs/search?q=slavia"
if ($slaviaResult) {
    Write-Host "  Found: $($slaviaResult.Count) clubs" -ForegroundColor Gray
}
Write-Host ""

# Test 4: Get Club by ID (using demo UUID)
Write-Host "4. Get Club Details" -ForegroundColor Cyan
$demoUuid = "22222222-3333-4444-5555-666666666666"
Test-Endpoint -Name "GET /clubs/$demoUuid" -Url "$BaseUrl/clubs/$demoUuid" | Out-Null
Write-Host ""

# Test 5: Logo Metadata (may fail if no logo uploaded)
Write-Host "5. Logo Metadata (may fail if no logos uploaded)" -ForegroundColor Cyan
Test-Endpoint -Name "GET /logos/$demoUuid/json" -Url "$BaseUrl/logos/$demoUuid/json" | Out-Null
Write-Host ""

# Test 6: Invalid UUID (should fail gracefully)
Write-Host "6. Invalid UUID Test (expected to fail)" -ForegroundColor Cyan
Write-Host "Testing: GET /clubs/invalid-uuid" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BaseUrl/clubs/invalid-uuid" -Method GET -TimeoutSec 5
    Write-Host "  ✗ Should have failed but didn't" -ForegroundColor Red
    $testsFailed++
} catch {
    Write-Host "  ✓ Correctly rejected invalid UUID" -ForegroundColor Green
    $testsPassed++
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Results:" -ForegroundColor White
Write-Host "  Passed: $testsPassed" -ForegroundColor Green
Write-Host "  Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "✓ All tests passed! API is working correctly." -ForegroundColor Green
} else {
    Write-Host "⚠ Some tests failed. Check the API server." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Note: Logo upload tests require manual testing with files." -ForegroundColor Gray
Write-Host "Use the frontend or curl for upload testing." -ForegroundColor Gray
