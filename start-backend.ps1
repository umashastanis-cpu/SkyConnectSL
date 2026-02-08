# SkyConnect AI Backend Startup Script
# Automatically loads .env and starts the server

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🚀 SkyConnect AI Backend" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\backend"

Write-Host "`n📦 Loading environment variables from .env..."

# The Python script will load .env automatically via python-dotenv
# No need to manually set environment variables

Write-Host "✅ Environment loaded"
Write-Host "`n🤖 Starting AI Backend with Groq LLM..."
Write-Host "   Model: llama-3.3-70b-versatile"
Write-Host "   Endpoint: http://localhost:8000"
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n"

# Start the server
& "..\\.venv\Scripts\python.exe" main.py
