$root = Split-Path $PSScriptRoot -Parent
$ver = '20260610'
$cssLine = "  <link rel=`"stylesheet`" href=`"../assets/site-motion.css?v=$ver`">"
$jsLine = "  <script src=`"../assets/site-motion.js?v=$ver`" defer></script>"

foreach ($dir in @('ko', 'en', 'zh', 'es')) {
  $path = Join-Path $root $dir
  if (-not (Test-Path $path)) { continue }
  Get-ChildItem $path -Filter '*.html' | ForEach-Object {
    $text = [System.IO.File]::ReadAllText($_.FullName)
    $next = $text
    $next = $next -replace 'site-glass\.css\?v=[^"]+', "site-glass.css?v=$ver"
    if ($next -notmatch 'site-motion\.css') {
      $next = $next -replace '(<link rel="stylesheet" href="\.\./assets/site-glass\.css\?v=[^"]+">)', "`$1`r`n$cssLine"
    }
    if ($next -notmatch 'site-motion\.js') {
      $next = $next -replace '</body>', "$jsLine`r`n</body>"
    }
    if ($next -ne $text) {
      [System.IO.File]::WriteAllText($_.FullName, $next)
      Write-Host "updated $($_.Name) in $dir"
    }
  }
}

Write-Host "Motion assets linked. Version: $ver"
