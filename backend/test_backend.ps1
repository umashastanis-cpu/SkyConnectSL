# SkyConnect AI Backend - Quick Test Script
# Run this to test the AI chat functionality

$baseUrl = "http://localhost:8000"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "SkyConnect AI Backend Test Suite [DEMO]" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method Get
    Write-Host "✅ Server is online - Version: $($response.version)" -ForegroundColor Green
    Write-Host "   Warning: $($response.warning)" -ForegroundColor Red
} catch {
    Write-Host "❌ Server is not responding" -ForegroundColor Red
    exit 1
}

# Test 2: Production Status
Write-Host ""
Write-Host "Test 2: Production Status..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/api/production-status" -Method Get
    Write-Host "✅ Production Ready: $($status.production_ready)" -ForegroundColor Green
    Write-Host "   Readiness Score: $($status.readiness_score)" -ForegroundColor Yellow
    Write-Host "   Critical Missing Items:" -ForegroundColor Red
    foreach ($item in $status.critical_missing) {
        Write-Host "     - $item" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to get production status" -ForegroundColor Red
}

# Test 3: Firebase Connection
Write-Host ""
Write-Host "Test 3: Firebase Connection..." -ForegroundColor Yellow
try {
    $firebase = Invoke-RestMethod -Uri "$baseUrl/api/test/firebase" -Method Get
    Write-Host "✅ Firebase connected - $($firebase.listings_count) listings found" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase connection failed" -ForegroundColor Red
}

# Test 4: Get Listings
Write-Host ""
Write-Host "Test 4: Get All Listings..." -ForegroundColor Yellow
try {
    $listings = Invoke-RestMethod -Uri "$baseUrl/api/listings" -Method Get
    Write-Host "✅ Found $($listings.count) listings" -ForegroundColor Green
    if ($listings.count -gt 0) {
        Write-Host "   Sample: $($listings.listings[0].title)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Failed to get listings" -ForegroundColor Red
}

# Test 5: Semantic Search
Write-Host ""
Write-Host "Test 5: Semantic Search..." -ForegroundColor Yellow
try {
    $searchBody = @{
        query = "beach resorts with beautiful views"
        limit = 3
    } | ConvertTo-Json

    $searchResults = Invoke-RestMethod -Uri "$baseUrl/api/search/semantic" `
        -Method Post `
        -ContentType "application/json" `
        -Body $searchBody
    
    Write-Host "✅ Semantic search completed - Found $($searchResults.count) results" -ForegroundColor Green
    Write-Host "   Query: '$($searchResults.query)'" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Semantic search failed: $_" -ForegroundColor Red
}

# Test 6: AI Chat (Main Feature!)
Write-Host ""
Write-Host "Test 6: AI Chat Agent..." -ForegroundColor Yellow
Write-Host "   (This may take 10-30 seconds on first run)"
try {
    $chatBody = @{
        message = "Find me romantic beach resorts in Galle under $150 per night"
        user_id = "test_user_demo"
    } | ConvertTo-Json

    $chatResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat" `
        -Method Post `
        -ContentType "application/json" `
        -Body $chatBody `
        -TimeoutSec 60
    
    Write-Host "✅ AI Agent responded!" -ForegroundColor Green
    Write-Host "   Agent Type: $($chatResponse.agent_type)" -ForegroundColor Cyan
    Write-Host "   Response: " -ForegroundColor Cyan
    Write-Host "   $($chatResponse.response)" -ForegroundColor White
    
    if ($chatResponse.sources) {
        Write-Host ""
    Write-Host "   Sources Used: $($chatResponse.sources.Count)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ AI Chat failed: $_" -ForegroundColor Red
    Write-Host "   This usually means:" -ForegroundColor Yellow
    Write-Host "   1. Ollama is not installed/running (install from https://ollama.ai)" -ForegroundColor Yellow
    Write-Host "   2. Or run: ollama pull llama3.2" -ForegroundColor Yellow
    Write-Host "   3. Or set OPENAI_API_KEY environment variable" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Backend server is functional for DEMO purposes" -ForegroundColor Green
Write-Host "NOT production ready - see /api/production-status" -ForegroundColor Red
Write-Host ""
Write-Host "Available Endpoints:" -ForegroundColor Cyan
Write-Host "   API Docs:        http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Health Check:    http://localhost:8000/" -ForegroundColor White
Write-Host "   Chat Endpoint:   POST http://localhost:8000/api/chat" -ForegroundColor White
Write-Host "   Semantic Search: POST http://localhost:8000/api/search/semantic" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
