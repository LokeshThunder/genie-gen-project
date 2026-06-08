
# Force correct SDK path to avoid "E:\AndroidSDK" conflicts
$env:ANDROID_SDK_ROOT = "C:\Users\my pc\AppData\Local\Android\Sdk"
$env:ANDROID_HOME = "C:\Users\my pc\AppData\Local\Android\Sdk"
$sdk = "C:\Users\my pc\AppData\Local\Android\Sdk"
$emulator = Join-Path $sdk "emulator\emulator.exe"

# Try Genie_API35 (Android 15) first, then fallback to Genie_Latest (Android 16 preview)
$avdName = "Genie_API35"
$checkAvd = & "C:\Users\my pc\AppData\Local\Android\Sdk\cmdline-tools\latest\bin\avdmanager.bat" list avd
if ($checkAvd -notmatch $avdName) {
    $avdName = "Genie_Latest"
}

Write-Host "=== Launching $avdName ===" -ForegroundColor Cyan
Write-Host "SDK Path: $env:ANDROID_SDK_ROOT" -ForegroundColor Gray

if (Test-Path $emulator) {
    Write-Host "Starting emulator process..." -ForegroundColor Yellow
    Start-Process -FilePath $emulator -ArgumentList @("-avd", $avdName, "-gpu", "host", "-no-snapshot-load")
    Write-Host "Launched! Please wait for the Android window to appear." -ForegroundColor Green
} else {
    Write-Host "Error: Emulator.exe not found at $emulator" -ForegroundColor Red
}
