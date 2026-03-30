param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$OWNER = "gideongeny"
$REPO  = "STREAMLUX"
$TAG   = "v1.4.0"
$TITLE = "StreamLux v1.4.0"
$NOTES = @"
## What's New in v1.4.0

### Google Sign-In Fixed
- Restored native Google Auth SDK with correct Firebase app ID (com.streamlux.app)
- Registered SHA-1 fingerprint now fully matched in google-services.json - no more 400/403 errors

### Music Universe - 20 Genre Categories
- Replaced static 2-section layout with 20 lazy-loaded genre carousels
- Genres: Hip Hop, Afrobeats, K-Pop, Chill Lo-Fi, Latin Reggaeton, Jazz, Classical, Bollywood, Heavy Metal and more
- Intelligent lazy loading - each genre fetches only when scrolled into view (no API quota overuse)
- Removed broken Spotify artist images

### Build & Deploy
- Firebase Hosting live: https://streamlux-67a84.web.app
- APK: arm64-v8a debug build (~31.5MB)
- AAB: Release bundle for Google Play (~28.9MB)
"@

$headers = @{
    Authorization = "Bearer $Token"
    Accept        = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

# Step 1: Create the release
Write-Host "Creating GitHub release $TAG..." -ForegroundColor Cyan
$body = @{
    tag_name   = $TAG
    name       = $TITLE
    body       = $NOTES
    draft      = $false
    prerelease = $false
} | ConvertTo-Json

$release = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$OWNER/$REPO/releases" `
    -Method Post `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"

Write-Host "Release created: $($release.html_url)" -ForegroundColor Green
$uploadUrl = $release.upload_url -replace '\{.*\}', ''

# Step 2: Upload APK
$apkPath = "android\app\build\outputs\apk\debug\app-arm64-v8a-debug.apk"
Write-Host "Uploading APK..." -ForegroundColor Cyan
$apkBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $apkPath))
Invoke-RestMethod `
    -Uri "${uploadUrl}?name=StreamLux-v1.4.0-arm64.apk&label=StreamLux-v1.4.0-arm64.apk" `
    -Method Post `
    -Headers $headers `
    -Body $apkBytes `
    -ContentType "application/vnd.android.package-archive" | Out-Null
Write-Host "APK uploaded!" -ForegroundColor Green

# Step 3: Upload AAB
$aabPath = "android\app\build\outputs\bundle\release\app-release.aab"
Write-Host "Uploading AAB..." -ForegroundColor Cyan
$aabBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $aabPath))
Invoke-RestMethod `
    -Uri "${uploadUrl}?name=StreamLux-v1.4.0-release.aab&label=StreamLux-v1.4.0-release.aab" `
    -Method Post `
    -Headers $headers `
    -Body $aabBytes `
    -ContentType "application/octet-stream" | Out-Null
Write-Host "AAB uploaded!" -ForegroundColor Green

Write-Host ""
Write-Host "All done! View your release at:" -ForegroundColor Yellow
Write-Host $release.html_url -ForegroundColor Yellow
