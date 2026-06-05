$root = Split-Path $PSScriptRoot -Parent
$ver = '20260611'

foreach ($dir in @('ko', 'en', 'zh', 'es')) {
  $path = Join-Path $root $dir
  if (-not (Test-Path $path)) { continue }
  Get-ChildItem $path -Filter '*.html' | ForEach-Object {
    $text = [System.IO.File]::ReadAllText($_.FullName)
    $next = $text -replace 'site-glass\.css\?v=[^"]+', "site-glass.css?v=$ver"
    $next = $next -replace 'site-motion\.css\?v=[^"]+', "site-motion.css?v=$ver"
    $next = $next -replace 'site-motion\.js\?v=[^"]+', "site-motion.js?v=$ver"
    if ($next -ne $text) {
      [System.IO.File]::WriteAllText($_.FullName, $next)
      Write-Host "bumped $($_.Name) in $dir"
    }
  }
}

Write-Host "Cache version: $ver"
