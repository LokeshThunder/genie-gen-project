
$sdk = "C:\Users\my pc\AppData\Local\Android\Sdk"
$emulator = Join-Path $sdk "emulator\emulator.exe"
$avdName = "Genie_API35"

Write-Host "=== Launching $avdName (Android 15 / API 35) ===" -ForegroundColor Cyan
Write-Host "This matches your project's targetSdkVersion." -ForegroundColor Gray

if (Test-Path $emulator) {
    Write-Host "Starting emulator process..." -ForegroundColor Yellow
    Start-Process -FilePath $emulator -ArgumentList @("-avd", $avdName, "-gpu", "host", "-no-snapshot-load")
    Write-Host "Launched! Please wait for the Android window to appear." -ForegroundColor Green
} else {
    Write-Host "Error: Emulator.exe not found at $emulator" -ForegroundColor Red
}
