param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$OWNER = "gideongeny"
$REPO  = "STREAMLUX"
$TAG   = "v1.4.4" # Firebase Init & Identity Fix
$TITLE = "StreamLux v1.4.4 (Stability & Init Fix)"
$NOTES = @"
## StreamLux v1.4.4 - Stabilization Release 🚀

This release hardens the application against the "FirebaseApp not initialized" and "Missing AdMob ID" crashes observed in recent logs.

### Key Fixes
- **Explicit Firebase Initialization**: Added native boilerplate to `MainActivity.java` to ensure Firebase is ready before any plugins are registered.
- **Identity Migration Enforcement**: v1.4.4 is the definitive version for the `com.streamlux.app` transition.
- **AdMob Validation**: Verified the `APPLICATION_ID` presence in the Android Manifest.

### ⚠️ IMPORTANT INSTALLATION NOTE
You **MUST** uninstall any previous version of StreamLux (especially if it was named `com.gideongeny.streamlux`) before installing this APK. The change in package identity requires a clean install.
"@

### Features
- **Music Universe**: 20 lazy-loaded genre categories.
- **Optimized Size**: ~31.5MB APK and ~28.9MB AAB.

### Deployment
- Firebase Hosting (Web): https://streamlux-67a84.web.app
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
    -Uri "${uploadUrl}?name=StreamLux-v1.4.3-arm64.apk&label=StreamLux-v1.4.3-arm64.apk" `
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
    -Uri "${uploadUrl}?name=StreamLux-v1.4.3-release.aab&label=StreamLux-v1.4.3-release.aab" `
    -Method Post `
    -Headers $headers `
    -Body $aabBytes `
    -ContentType "application/octet-stream" | Out-Null
Write-Host "AAB uploaded!" -ForegroundColor Green

Write-Host ""
Write-Host "Successfully deployed Final Release v1.4.3!" -ForegroundColor Yellow
Write-Host $release.html_url -ForegroundColor Yellow
