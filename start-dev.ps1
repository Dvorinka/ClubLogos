# Development startup script for Windows PowerShell

Write-Host "🇨🇿 Starting Czech Clubs Logos API Development Environment" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerInstalled) {
    Write-Host "🐳 Docker detected! Starting with Docker Compose..." -ForegroundColor Green
    docker-compose up
} else {
    Write-Host "⚠️  Docker not found. Starting services manually..." -ForegroundColor Yellow
    Write-Host ""
    
    # Start backend in new window
    Write-Host "🚀 Starting Backend..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; go run ."
    
    # Wait a bit for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend in new window
    Write-Host "🎨 Starting Frontend..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
    
    Write-Host ""
    Write-Host "✓ Services starting in separate windows..." -ForegroundColor Green
    Write-Host "  Backend: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
}
