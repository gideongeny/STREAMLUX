param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$OWNER = "gideongeny"
$REPO  = "STREAMLUX"
$TAG   = "v1.4.1" # Using v1.4.1 for the fix
$TITLE = "StreamLux v1.4.1 (Hotfix)"
$NOTES = @"
## StreamLux v1.4.1 - Hotfix

### Fixed Launch Crash
- Reverted package namespace to `com.gideongeny.streamlux` to fix the "MainActivity class does not exist" error.
- Ensured all internal Android paths match the source code structure.

### Features (Carried over from v1.4.0)
- **Google Sign-In Fixed**: Native SDK now correctly authorized with the registered SHA-1 fingerprint.
- **Music Universe**: 20 lazy-loaded genre categories for a massive discovery experience.
- **Optimized Size**: ~31.5MB APK and ~28.9MB AAB.

### Deployment
- Firebase Hosting (Web): https://streamlux-67a84.web.app
"@

$headers = @{
    Authorization = "Bearer $Token"
    Accept        = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

# Step 0: Check if release exists and handle it (optional, simplifying to v1.4.1)

# Step 1: Create the release
Write-Host "Creating GitHub release $TAG..." -ForegroundColor Cyan
$body = @{
    tag_name   = $TAG
    name       = $TITLE
    body       = $NOTES
    draft      = $false
    prerelease = $false
} | ConvertTo-Json

try {
    $release = Invoke-RestMethod `
        -Uri "https://api.github.com/repos/$OWNER/$REPO/releases" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json"
} catch {
    Write-Host "Failed to create release. It might already exist." -ForegroundColor Red
    $release = Invoke-RestMethod `
        -Uri "https://api.github.com/repos/$OWNER/$REPO/releases/tags/$TAG" `
        -Method Get `
        -Headers $headers
}

Write-Host "Release available at: $($release.html_url)" -ForegroundColor Green
$uploadUrl = $release.upload_url -replace '\{.*\}', ''

# Step 2: Upload APK
$apkPath = "android\app\build\outputs\apk\debug\app-arm64-v8a-debug.apk"
Write-Host "Uploading APK..." -ForegroundColor Cyan
$apkBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $apkPath))
Invoke-RestMethod `
    -Uri "${uploadUrl}?name=StreamLux-v1.4.1-arm64.apk&label=StreamLux-v1.4.1-arm64.apk" `
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
    -Uri "${uploadUrl}?name=StreamLux-v1.4.1-release.aab&label=StreamLux-v1.4.1-release.aab" `
    -Method Post `
    -Headers $headers `
    -Body $aabBytes `
    -ContentType "application/octet-stream" | Out-Null
Write-Host "AAB uploaded!" -ForegroundColor Green

Write-Host ""
Write-Host "Successfully deployed Hotfix Release v1.4.1!" -ForegroundColor Yellow
Write-Host $release.html_url -ForegroundColor Yellow
