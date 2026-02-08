# Quick test script for Groq AI

Write-Host "`nTesting Groq AI Backend..." -ForegroundColor Cyan
Write-Host "============================================================`n"

# Test 1: Server health
Write-Host "Test 1: Checking if server is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/" -Method Get
    Write-Host "✅ Server is online - Version: $($health.version)" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not responding!" -ForegroundColor Red
    Write-Host "Make sure the backend is running." -ForegroundColor Yellow
    exit 1
}

# Test 2: AI Chat with Groq
Write-Host "`nTest 2: Testing Groq AI Chat..." -ForegroundColor Yellow
Write-Host "(This may take 5-10 seconds for first request)" -ForegroundColor Gray

$chatBody = @{
    message = "Hello! Can you find me beach resorts in Galle?"
    user_id = "test_groq_user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/chat" `
        -Method Post `
        -ContentType "application/json" `
        -Body $chatBody `
        -TimeoutSec 30
    
    Write-Host "✅ Groq AI responded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agent Type: $($response.agent_type)" -ForegroundColor Cyan
    Write-Host "LLM Provider: $($response.llm_provider)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host $response.response -ForegroundColor White
    Write-Host ""
    
    if ($response.llm_provider -eq "groq") {
        Write-Host "🎉 SUCCESS! Groq is working perfectly!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Using $($response.llm_provider) instead of Groq" -ForegroundColor Yellow
        Write-Host "Check if GROQ_API_KEY is set correctly" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Chat test failed: $_" -ForegroundColor Red
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Test complete!" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan
