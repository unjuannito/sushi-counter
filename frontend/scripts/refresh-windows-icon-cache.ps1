<#
Rebuilds the Windows Explorer icon and thumbnail cache.

Run this only after closing Chrome and uninstalling/reinstalling the PWA.
It stops Explorer briefly, removes only cache databases in the current user's
Explorer cache folder, and starts Explorer again.
#>

$explorerCache = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Explorer"

if (-not (Test-Path -LiteralPath $explorerCache)) {
    throw "Windows Explorer cache folder was not found: $explorerCache"
}

$cacheFiles = Get-ChildItem -LiteralPath $explorerCache -File -Force |
    Where-Object { $_.Name -like "iconcache*.db" -or $_.Name -like "thumbcache*.db" }

Get-Process explorer -ErrorAction SilentlyContinue | Stop-Process -Force

foreach ($cacheFile in $cacheFiles) {
    Remove-Item -LiteralPath $cacheFile.FullName -Force
}

Start-Process explorer.exe
Write-Host "Windows icon cache rebuilt. Reinstall the Sushi Counter PWA now."
