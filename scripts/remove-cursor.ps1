$root = Split-Path $PSScriptRoot -Parent
$pattern = '(?m)^\s*<script src="\.\./assets/site-cursor\.js[^"]*" defer></script>\r?\n?'

foreach ($dir in @('ko', 'en', 'zh', 'es')) {
  $path = Join-Path $root $dir
  if (-not (Test-Path $path)) { continue }
  Get-ChildItem $path -Filter '*.html' | ForEach-Object {
    $text = [System.IO.File]::ReadAllText($_.FullName)
    $next = [regex]::Replace($text, $pattern, '')
    if ($next -ne $text) {
      [System.IO.File]::WriteAllText($_.FullName, $next)
      Write-Host "updated $($_.Name) in $dir"
    }
  }
}
