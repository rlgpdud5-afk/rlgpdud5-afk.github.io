$ErrorActionPreference = 'Stop'

$target = "C:\Users\onmak\OneDrive\바탕 화면\D-GIG 프로그램"
$archiveUrl = "https://www.gigcareer.kr/downloads/D-GIG-Program-Windows-x64.tar.xz"
$archive = Join-Path $env:TEMP "D-GIG-Program-Windows-x64.tar.xz"
$extractRoot = Join-Path $env:TEMP "dgig-program-extract"
$extracted = Join-Path $extractRoot "D-GIG-Program-Windows-x64"

Write-Host "D-GIG 프로그램 최신 버전을 다운로드합니다..."
Remove-Item $archive -Force -ErrorAction SilentlyContinue
Remove-Item $extractRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $extractRoot -Force | Out-Null

Invoke-WebRequest -Uri $archiveUrl -OutFile $archive

Write-Host "압축을 해제합니다..."
tar -xf $archive -C $extractRoot

if (-not (Test-Path $extracted)) {
  throw "압축 해제된 프로그램 폴더를 찾을 수 없습니다: $extracted"
}

Write-Host "기존 D-GIG 프로그램 폴더를 교체합니다..."
if (Test-Path $target) {
  Remove-Item $target -Recurse -Force
}
New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
Move-Item $extracted $target

Write-Host ""
Write-Host "완료되었습니다."
Write-Host "실행 파일:"
Write-Host "$target\D-GIG 프로그램.exe"
