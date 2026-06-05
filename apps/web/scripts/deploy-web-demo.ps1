# Build D-GIG web app and copy into gigcareer.kr site folders (ko / en / zh)
$ErrorActionPreference = 'Stop'
$WebRoot = Split-Path $PSScriptRoot -Parent
$SiteRoot = Resolve-Path (Join-Path $WebRoot '..\..')

Set-Location -LiteralPath $WebRoot
npm run build

$dist = Join-Path $WebRoot 'dist'
if (-not (Test-Path $dist)) { throw "dist not found after build" }

$targets = @(
  (Join-Path $SiteRoot 'ko\dgig-app'),
  (Join-Path $SiteRoot 'en\dgig-app'),
  (Join-Path $SiteRoot 'zh\dgig-app'),
  (Join-Path $SiteRoot 'es\dgig-app')
)

foreach ($target in $targets) {
  $parent = Split-Path $target -Parent
  if (-not (Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
  if (Test-Path $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
  }
  Copy-Item -LiteralPath $dist -Destination $target -Recurse
  Write-Host "Copied demo -> $target"
}

Write-Host ''
Write-Host 'Deploy complete. Upload ko/, en/, zh/, es/ to gigcareer.kr hosting.'
Write-Host 'Demo URLs:'
Write-Host '  https://www.gigcareer.kr/ko/dgig-demo.html?view=match'
Write-Host '  https://www.gigcareer.kr/en/dgig-demo.html?view=crew'
Write-Host '  https://www.gigcareer.kr/zh/dgig-demo.html?view=workspace'
