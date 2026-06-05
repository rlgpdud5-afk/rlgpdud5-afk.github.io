$root = Split-Path $PSScriptRoot -Parent
$cacheVer = '20260609'

foreach ($dir in @('ko', 'en', 'zh', 'es')) {
  $path = Join-Path $root $dir
  if (-not (Test-Path $path)) { continue }
  Get-ChildItem $path -Filter '*.html' | ForEach-Object {
    $text = [System.IO.File]::ReadAllText($_.FullName)
    $next = $text
    $next = [regex]::Replace($next, '(?m)^\s*<script src="\.\./assets/site-cursor\.js[^"]*" defer></script>\r?\n?', '')
    $next = $next -replace 'site-glass\.css\?v=[^"]+', "site-glass.css?v=$cacheVer"
    $next = $next -replace '\sclass="hero-light"', ''
    $next = $next -replace ' class="hero-light"', ''
    if ($next -ne $text) {
      [System.IO.File]::WriteAllText($_.FullName, $next)
      Write-Host "updated $($_.Name) in $dir"
    }
  }
}

Write-Host "Done. Cache version: $cacheVer"
