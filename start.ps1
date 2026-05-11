# LPU CodeViz — Start Script
# Launches both FastAPI backend and Next.js frontend

Write-Host "🚀 Starting LPU CodeViz..." -ForegroundColor Cyan
Write-Host ""

# Check if backend .env exists
$envFile = ".\backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  No backend\.env found!" -ForegroundColor Yellow
    Write-Host "   Copy backend\.env.example to backend\.env and add your GROQ_API_KEY" -ForegroundColor Yellow
    Write-Host ""
}

# Install backend deps if needed
if (-not (Test-Path ".\backend\venv")) {
    Write-Host "📦 Creating Python venv..." -ForegroundColor Blue
    python -m venv .\backend\venv
}

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
.\backend\venv\Scripts\pip.exe install -r .\backend\requirements.txt -q

Write-Host ""
Write-Host "▶ Starting FastAPI backend on http://localhost:8000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\backend'; ..\backend\venv\Scripts\uvicorn.exe main:app --reload --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2

Write-Host "▶ Starting Next.js frontend on http://localhost:3000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "✅ Both servers starting!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
