# install_gcloud.ps1
# This script downloads and silently installs Google Cloud CLI for the current user.

$url = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
$installerPath = Join-Path $env:TEMP "GoogleCloudSDKInstaller.exe"

Write-Host "Downloading Google Cloud CLI installer from $url..." -ForegroundColor Cyan
try {
    # Using WebClient for reliability
    (New-Object System.Net.WebClient).DownloadFile($url, $installerPath)
    Write-Host "Download completed successfully." -ForegroundColor Green
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Running silent installation for current user..." -ForegroundColor Cyan
Write-Host "This might take a couple of minutes. Please wait..." -ForegroundColor Yellow

# Start the installer silently
$process = Start-Process -FilePath $installerPath -ArgumentList "/S", "/singleuser" -PassThru -Wait

if ($process.ExitCode -ne 0) {
    Write-Host "Installation failed with exit code $($process.ExitCode)." -ForegroundColor Red
    exit 1
}

Write-Host "Installation command completed successfully." -ForegroundColor Green

# Locate gcloud.cmd
$possiblePaths = @(
    "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin",
    "$env:ProgramFiles\Google\Cloud SDK\google-cloud-sdk\bin",
    "$env:ProgramFiles(x86)\Google\Cloud SDK\google-cloud-sdk\bin",
    "$env:USERPROFILE\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"
)

$gcloudPath = $null
foreach ($path in $possiblePaths) {
    $cmdPath = Join-Path $path "gcloud.cmd"
    if (Test-Path $cmdPath) {
        $gcloudPath = $path
        break
    }
}

if ($gcloudPath) {
    Write-Host "Found Google Cloud CLI at: $gcloudPath" -ForegroundColor Green
    
    # Add to the current session's PATH
    $env:PATH += ";$gcloudPath"
    
    # Add to user's registry PATH permanently
    Write-Host "Adding to user PATH environment variable..." -ForegroundColor Cyan
    $userPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
    if ($userPath -notlike "*$gcloudPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$userPath;$gcloudPath", [EnvironmentVariableTarget]::User)
        Write-Host "Permanently added to user PATH." -ForegroundColor Green
    } else {
        Write-Host "Already in user PATH." -ForegroundColor Green
    }
    
    # Verify installation
    & gcloud --version
} else {
    Write-Host "Could not locate gcloud.cmd after installation. Please verify if it was installed successfully." -ForegroundColor Red
}
