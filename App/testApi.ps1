# TURoad API Integration Test Script
$baseUrl = "http://localhost:3001/api"

Write-Host "`n🚀 TURoad API Integration Test" -ForegroundColor Cyan
Write-Host "Testing API at: $baseUrl`n" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Gray

# Test endpoints
$endpoints = @(
    @{Path="/public/categories"; Name="Categories"},
    @{Path="/public/routes"; Name="Routes"},
    @{Path="/public/cities"; Name="Cities"},
    @{Path="/public/events"; Name="Events"},
    @{Path="/public/locations/businesses"; Name="Businesses"},
    @{Path="/public/locations/historical"; Name="Historical Places"}
)

$results = @()

foreach ($endpoint in $endpoints) {
    Write-Host "Testing $($endpoint.Name)... " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$($endpoint.Path)" -Method Get -Headers @{
            "Accept-Language" = "pt"
            "Content-Type" = "application/json"
        } -ErrorAction Stop
        
        $itemCount = 0
        if ($response.data) {
            $itemCount = $response.data.Count
        }
        
        Write-Host "✓" -ForegroundColor Green -NoNewline
        Write-Host " ($itemCount items)"
        
        $results += @{
            Name = $endpoint.Name
            Success = $true
            ItemCount = $itemCount
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "✗" -ForegroundColor Red -NoNewline
        Write-Host " (Error $statusCode)"
        
        $results += @{
            Name = $endpoint.Name
            Success = $false
            Error = $statusCode
        }
    }
}

# Summary
Write-Host "`n========================================"
Write-Host "📊 TEST SUMMARY" -ForegroundColor Yellow
Write-Host "========================================`n"

$successCount = ($results | Where-Object { $_.Success }).Count
$failCount = ($results | Where-Object { -not $_.Success }).Count

Write-Host "✓ Successful: " -NoNewline -ForegroundColor Green
Write-Host "$successCount/$($results.Count)"

Write-Host "✗ Failed: " -NoNewline -ForegroundColor Red
Write-Host "$failCount/$($results.Count)"

if ($failCount -gt 0) {
    Write-Host "`n⚠️ Failed Endpoints:" -ForegroundColor Yellow
    $results | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "  - $($_.Name): Error $($_.Error)" -ForegroundColor Red
    }
}

Write-Host "`n========================================"
if ($successCount -eq $results.Count) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "The app is fully integrated with the backend."
} elseif ($successCount -gt 0) {
    Write-Host "⚠️ PARTIAL SUCCESS" -ForegroundColor Yellow
    Write-Host "Some endpoints are working, but others need attention."
} else {
    Write-Host "❌ CRITICAL FAILURE" -ForegroundColor Red
    Write-Host "No endpoints are working. Please check if the backend is running on port 3001."
}
Write-Host "========================================`n"
