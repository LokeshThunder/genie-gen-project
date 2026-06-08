# Job Genie Versioning Script
# This script commits changes to Git and creates a physical zip snapshot in the backups/ folder.

param (
    [string]$Message = "New Version",
    [string]$TagName = ""
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupDir = "backups"
$zipName = "JobGenie_$timestamp.zip"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

# 1. Git Commit
Write-Host "Saving to Git..." -ForegroundColor Blue
git add .
git commit -m $Message

# 2. Git Tag (Optional)
if ($TagName -ne "") {
    Write-Host "Tagging as $TagName..." -ForegroundColor Blue
    git tag $TagName
}

# 3. Physical Snapshot (Excluding heavy folders)
Write-Host "Creating physical snapshot: $zipName..." -ForegroundColor Green
$exclude = @("node_modules", ".git", "dist", ".gemini", "backups")
Compress-Archive -Path . -DestinationPath "$backupDir\$zipName" -Force

Write-Host "Successfully saved version: $Message" -ForegroundColor Cyan
Write-Host "Snapshot available at: $backupDir\$zipName" -ForegroundColor Cyan
