$root = Split-Path $PSScriptRoot -Parent
$build = '20260612'
$locales = @{
  ko = 'ko'
  en = 'en'
  zh = 'zh'
  es = 'es'
}

$legacyMarker = '폐쇄망 — 외부 전송 금지'

foreach ($dir in $locales.Keys) {
  $file = Join-Path $root "$dir\dgig-demo.html"
  if (-not (Test-Path $file)) { continue }
  $text = [System.IO.File]::ReadAllText($file)
  $locale = $locales[$dir]

  $inject = @"
      var BUILD = '$build';
      var LOCALE = '$locale';
      try {
        localStorage.setItem('dgig-locale', LOCALE);
        if (LOCALE !== 'ko') {
          var vfsRaw = localStorage.getItem('dgig-code-vfs-st2');
          if (vfsRaw && vfsRaw.indexOf('$legacyMarker') !== -1) {
            localStorage.removeItem('dgig-code-vfs-st2');
          }
        }
      } catch (e) {}
"@

  $next = $text -replace "var BUILD = '[^']+';", $inject.Trim()
  if ($next -ne $text) {
    [System.IO.File]::WriteAllText($file, $next)
    Write-Host "patched $dir/dgig-demo.html"
  }
}
