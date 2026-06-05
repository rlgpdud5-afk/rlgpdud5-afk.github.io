$root = Split-Path $PSScriptRoot -Parent
$path = Join-Path $root 'assets\site-glass.css'
$lines = [System.IO.File]::ReadAllLines($path)
if ($lines.Length -gt 412) {
  [System.IO.File]::WriteAllLines($path, $lines[0..411])
  Write-Host "trimmed site-glass.css to 412 lines"
}
