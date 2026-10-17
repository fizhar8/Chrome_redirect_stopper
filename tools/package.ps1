$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content (Join-Path $root "manifest.json") -Raw | ConvertFrom-Json
$files = @("manifest.json", "redirect-guard.js", "icon-128.png")

foreach ($file in $files) {
    if (-not (Test-Path (Join-Path $root $file))) {
        throw "Required extension file is missing: $file"
    }
}

$outputDirectory = Join-Path $root "dist"
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$archive = Join-Path $outputDirectory "redirect-stopper-$($manifest.version).zip"
Compress-Archive -Path ($files | ForEach-Object { Join-Path $root $_ }) -DestinationPath $archive -Force
Write-Output $archive
