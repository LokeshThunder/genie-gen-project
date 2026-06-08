$tempDir = [System.IO.Path]::GetTempPath()
$winTemp = "C:\Windows\Temp"
$winLogs = "C:\Windows\Logs"
$downloads = "$Home\Downloads"

function Get-FolderSize($path) {
    if (Test-Path $path) {
        try {
            $files = Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue
            $size = ($files | Measure-Object -Property Length -Sum).Sum
            if ($size -eq $null) { $size = 0 }
            $count = $files.Count
            if ($count -eq $null) { $count = 0 }
            return [PSCustomObject]@{ Path = $path; SizeMB = [Math]::Round(($size / 1MB), 2); FileCount = $count }
        } catch {
            return [PSCustomObject]@{ Path = $path; SizeMB = 0; FileCount = 0 }
        }
    }
    return $null
}

# Recycle Bin Stats
$binSizeMB = 0
$binCount = 0
try {
    $recycleBin = New-Object -ComObject Shell.Application
    $binFolder = $recycleBin.NameSpace(0x0a) # ShellSpecialFolderConstants.ssfBITBUCKET
    if ($binFolder) {
        $items = $binFolder.Items()
        $binCount = $items.Count
        foreach ($item in $items) {
            $binSizeMB += $item.Size / 1MB
        }
        $binSizeMB = [Math]::Round($binSizeMB, 2)
    }
} catch {
    # Fallback/ignore if COM object fails
}

$userTempStats = Get-FolderSize $tempDir
$winTempStats = Get-FolderSize $winTemp
$winLogsStats = Get-FolderSize $winLogs
$downloadStats = Get-FolderSize $downloads

Write-Output "=== COMMON DISK CLUTTER LOCATIONS ==="
if ($userTempStats) { Write-Output ("User Temp Directory:      " + $userTempStats.SizeMB + " MB (" + $userTempStats.FileCount + " files)") }
if ($winTempStats)  { Write-Output ("System Temp Directory:    " + $winTempStats.SizeMB + " MB (" + $winTempStats.FileCount + " files)") }
if ($winLogsStats)  { Write-Output ("Windows Logs Directory:   " + $winLogsStats.SizeMB + " MB (" + $winLogsStats.FileCount + " files)") }
if ($downloadStats) { Write-Output ("Downloads Directory:      " + $downloadStats.SizeMB + " MB (" + $downloadStats.FileCount + " files) [Review before deleting]") }
Write-Output ("System Recycle Bin:       " + $binSizeMB + " MB (" + $binCount + " items)")

Write-Output "`n=== LARGEST TEMPORARY FILES (Top 10) ==="
$allTempFiles = @()
if (Test-Path $tempDir) { $allTempFiles += Get-ChildItem -Path $tempDir -File -Recurse -ErrorAction SilentlyContinue }
if (Test-Path $winTemp) { $allTempFiles += Get-ChildItem -Path $winTemp -File -Recurse -ErrorAction SilentlyContinue }

if ($allTempFiles.Count -gt 0) {
    $allTempFiles | Sort-Object Length -Descending | Select-Object -First 10 | ForEach-Object {
        [PSCustomObject]@{
            Name       = $_.Name
            SizeMB     = [Math]::Round(($_.Length / 1MB), 2)
            LastAccess = $_.LastAccessTime
            Folder     = $_.DirectoryName
        }
    } | Format-Table -AutoSize
} else {
    Write-Output "No temporary files found."
}
