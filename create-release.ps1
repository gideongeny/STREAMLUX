param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$OWNER = "gideongeny"
$REPO  = "STREAMLUX"
$TAG   = "v1.4.5" # Maintenance & UI Sync
$TITLE = "StreamLux v1.4.5 (Maintenance Build)"
$NOTES = @"
## StreamLux v1.4.5 - Maintenance Build 🚀

This release synchronizes the latest UI and logic changes into the native build and ensures all assets are up to date.

### Changes
- **UI Synchronization**: Updated layouts and components for Sports and Home.
- **Native Stability**: Consistent with the v1.4.4 identity migration and Firebase initialization fixes.
- **AdMob Validation**: Verified the `APPLICATION_ID` presence in the Android Manifest.

### Features
- **Sports Watch Page**: Enhanced streaming interface.
- **Cinematic Moments**: Improved home screen experience.

### ⚠️ IMPORTANT INSTALLATION NOTE
If you are coming from a version older than v1.4.4, you **MUST** uninstall the app first due to the package identity change (`com.streamlux.app`).
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
    -Uri "${uploadUrl}?name=StreamLux-v1.4.4-arm64.apk&label=StreamLux-v1.4.4-arm64.apk" `
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
    -Uri "${uploadUrl}?name=StreamLux-v1.4.4-release.aab&label=StreamLux-v1.4.4-release.aab" `
    -Method Post `
    -Headers $headers `
    -Body $aabBytes `
    -ContentType "application/octet-stream" | Out-Null
Write-Host "AAB uploaded!" -ForegroundColor Green

Write-Host ""
Write-Host "Successfully deployed Final Release v1.4.4!" -ForegroundColor Yellow
Write-Host $release.html_url -ForegroundColor Yellow
