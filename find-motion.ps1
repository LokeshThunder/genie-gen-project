Get-ChildItem -Path "E:\genie gen\src" -Recurse -Filter *.jsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $hasMotion = ($content -like "*<motion.*") -or ($content -like "*AnimatePresence*") -or ($content -like "*useMotionValue*")
    $hasImport = ($content -like "*from 'framer-motion'*") -or ($content -like "*from `"framer-motion`"*")
    if ($hasMotion -and -not $hasImport) {
        Write-Output "MISSING IMPORT: $($_.FullName)"
    }
}
Write-Output "Search finished."
