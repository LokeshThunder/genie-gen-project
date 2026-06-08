$targetBase = "E:\c_drive_unwanted_backup"
$tempDir = [System.IO.Path]::GetTempPath()
$winLogs = "C:\Windows\Logs"

# Create target directories
$targetTemp = Join-Path $targetBase "UserTemp"
$targetLogs = Join-Path $targetBase "WindowsLogs"
$targetRecycle = Join-Path $targetBase "RecycleBin"

New-Item -ItemType Directory -Force -Path $targetTemp | Out-Null
New-Item -ItemType Directory -Force -Path $targetLogs | Out-Null
New-Item -ItemType Directory -Force -Path $targetRecycle | Out-Null

Write-Output "=== STARTING COPY OF UNWANTED FILES ==="
Write-Output "Target Folder: $targetBase"

# Function to copy files with error handling for locked files
function Copy-FilesSafe($sourcePath, $destinationPath, $label) {
    Write-Output "`nProcessing $label..."
    $copiedCount = 0
    $skippedCount = 0
    $copiedSize = 0

    if (Test-Path $sourcePath) {
        $files = Get-ChildItem -Path $sourcePath -File -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            # Compute relative path to maintain folder structure
            $relative = $file.FullName.Substring($sourcePath.Length)
            if ($relative.StartsWith("\")) { $relative = $relative.Substring(1) }
            $destFile = Join-Path $destinationPath $relative
            
            # Create subdirectories if needed
            $parentDir = Split-Path $destFile -Parent
            if (-not (Test-Path $parentDir)) {
                New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
            }

            try {
                Copy-Item -Path $file.FullName -Destination $destFile -Force -ErrorAction Stop
                $copiedCount++
                $copiedSize += $file.Length
            } catch {
                $skippedCount++
            }
        }
    }
    $sizeMB = [Math]::Round(($copiedSize / 1MB), 2)
    Write-Output "$label completed: Copied $copiedCount files ($sizeMB MB), Skipped $skippedCount (currently in-use/locked)."
    return [PSCustomObject]@{ CopiedCount = $copiedCount; SizeMB = $sizeMB; SkippedCount = $skippedCount }
}

# 1. Copy User Temp
$tempResult = Copy-FilesSafe $tempDir $targetTemp "User Temp Files"

# 2. Copy Windows Logs
$logsResult = Copy-FilesSafe $winLogs $targetLogs "Windows Logs"

# 3. Copy Recycle Bin Items using COM shell namespace
Write-Output "`nProcessing Recycle Bin..."
$rbCopied = 0
$rbSkipped = 0
$rbSize = 0
try {
    $recycleBin = New-Object -ComObject Shell.Application
    $binFolder = $recycleBin.NameSpace(0x0a)
    if ($binFolder) {
        $items = $binFolder.Items()
        foreach ($item in $items) {
            $src = $item.Path
            $name = $item.Name
            $size = $item.Size
            $dest = Join-Path $targetRecycle $name
            
            try {
                # In Recycle Bin, path could be virtual or physical shell link.
                # Copy via standard filesystem Copy-Item if path exists, otherwise use COM
                if (Test-Path $src) {
                    Copy-Item -Path $src -Destination $dest -Force -ErrorAction Stop
                } else {
                    # Shell COM copy
                    $targetFolderCOM = $recycleBin.NameSpace($targetRecycle)
                    $targetFolderCOM.CopyHere($item, 16) # 16 = Respond Yes to All
                }
                $rbCopied++
                $rbSize += $size
            } catch {
                $rbSkipped++
            }
        }
    }
} catch {
    Write-Output "Recycle Bin copy error: $_"
}
$rbSizeMB = [Math]::Round(($rbSize / 1MB), 2)
Write-Output "Recycle Bin completed: Copied $rbCopied items ($rbSizeMB MB), Skipped $rbSkipped."

# Grand Summary
Write-Output "`n=== COPY COMPLETED ==="
$totalMB = $tempResult.SizeMB + $logsResult.SizeMB + $rbSizeMB
Write-Output "Total saved to E drive: $totalMB MB"
