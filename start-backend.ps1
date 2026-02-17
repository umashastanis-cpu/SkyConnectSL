# SkyConnect AI Backend Startup Script
# Automatically loads .env and starts the server with preflight checks

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🚀 SkyConnect AI Backend - Hybrid AI System" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\backend"

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "`n⚠️  WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "   Creating from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   ✓ .env file created" -ForegroundColor Green
        Write-Host "`n   📝 Please edit .env and add your API keys:" -ForegroundColor Yellow
        Write-Host "      - GROQ_API_KEY" -ForegroundColor Yellow
        Write-Host "      - GEMINI_API_KEY" -ForegroundColor Yellow
        Write-Host "`n   Press Enter to continue when ready..." -ForegroundColor Yellow
        Read-Host
    } else {
        Write-Host "   ✗ .env.example not found!" -ForegroundColor Red
        Write-Host "   Please create .env manually" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n📦 Checking environment configuration..."

# Load .env to check for required keys
$envContent = Get-Content ".env" -Raw
$hasGroqKey = $envContent -match "GROQ_API_KEY=.+"
$hasGeminiKey = $envContent -match "GEMINI_API_KEY=.+"

if (-Not $hasGroqKey) {
    Write-Host "   ⚠️  GROQ_API_KEY not configured in .env" -ForegroundColor Yellow
}
if (-Not $hasGeminiKey) {
    Write-Host "   ⚠️  GEMINI_API_KEY not configured in .env" -ForegroundColor Yellow
}

# Check for service account key
if (-Not (Test-Path "config\serviceAccountKey.json")) {
    Write-Host "   ⚠️  Firebase serviceAccountKey.json not found!" -ForegroundColor Yellow
    Write-Host "      Download from Firebase Console → Project Settings → Service Accounts" -ForegroundColor Yellow
}

Write-Host "   ✓ Configuration loaded" -ForegroundColor Green

Write-Host "`n🔧 Checking Python dependencies..."

# Check if uvicorn is installed
try {
    python -m uvicorn --version 2>&1 | Out-Null
    Write-Host "   ✓ Uvicorn installed" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Uvicorn not found. Installing dependencies..." -ForegroundColor Yellow
    python -m pip install -r requirements.txt
}

Write-Host "`n🤖 Starting Hybrid AI Backend..."
Write-Host "   Primary LLM: Groq (llama-3.3-70b-versatile)" -ForegroundColor Cyan
Write-Host "   Fallback LLM: Gemini (gemini-1.5-flash)" -ForegroundColor Cyan
Write-Host "   Database: Firestore + ChromaDB" -ForegroundColor Cyan
Write-Host "   Endpoint: http://localhost:8000" -ForegroundColor Green
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n"

# Start the server with uvicorn
python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
