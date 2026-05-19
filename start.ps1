Write-Host '🚀 Starting CodeCanvas...' -ForegroundColor Cyan

$envFile = '.\backend\.env'
if (-not (Test-Path $envFile))
{
    Write-Host '⚠️  No backend\.env found!' -ForegroundColor Yellow
}

if (-not (Test-Path '.\backend\venv'))
{
    Write-Host '📦 Creating Python venv...' -ForegroundColor Blue
    python -m venv .\backend\venv
}

Write-Host '📦 Installing backend dependencies...' -ForegroundColor Blue
.\backend\venv\Scripts\pip.exe install -r .\backend\requirements.txt -q

Write-Host '▶ Starting FastAPI backend on http://localhost:8000' -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '\backend'; ..\backend\venv\Scripts\uvicorn.exe main:app --reload --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2

Write-Host '▶ Starting Next.js frontend on http://localhost:3000' -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '\frontend'; npm run dev"
