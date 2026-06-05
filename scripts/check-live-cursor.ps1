$urls = @(
  'https://www.gigcareer.kr/ko/index.html',
  'https://www.gigcareer.kr/en/index.html',
  'https://www.gigcareer.kr/zh/index.html',
  'https://www.gigcareer.kr/es/index.html'
)
foreach ($u in $urls) {
  $c = (Invoke-WebRequest -Uri $u -UseBasicParsing).Content
  $hasCursor = $c -match 'site-cursor'
  $ver = if ($c -match 'site-glass\.css\?v=([^"]+)') { $Matches[1] } else { 'none' }
  Write-Host "$u cursor=$hasCursor glassVer=$ver"
}
