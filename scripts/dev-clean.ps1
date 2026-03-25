$ErrorActionPreference = "Continue"

$ports = @(3000, 3001, 3002)
$projectRoot = Split-Path -Parent $PSScriptRoot
$lockFiles = @(
  (Join-Path $projectRoot "frontend\.next\dev\lock"),
  (Join-Path $projectRoot "backend\.next\dev\lock")
)

Write-Host "Cleaning stale Next.js dev processes..."
$pids = @()

try {
  $connections = Get-NetTCPConnection -State Listen | Where-Object { $ports -contains $_.LocalPort }
  $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
} catch {
  Write-Host "Get-NetTCPConnection unavailable, using netstat fallback..."
}

if (-not $pids -or $pids.Count -eq 0) {
  $netstatLines = netstat -ano | Select-String "LISTENING"
  foreach ($line in $netstatLines) {
    $parts = ($line.ToString() -replace "\s+", " ").Trim().Split(" ")
    if ($parts.Length -lt 5) { continue }
    $localAddress = $parts[1]
    $pidFromNetstat = $parts[4]

    foreach ($port in $ports) {
      if ($localAddress.EndsWith(":$port")) {
        $pids += [int]$pidFromNetstat
      }
    }
  }
  $pids = $pids | Select-Object -Unique
}

foreach ($procId in $pids) {
  if ($procId -and $procId -ne $PID) {
    try {
      Stop-Process -Id $procId -Force -ErrorAction Stop
      Write-Host "Stopped PID $procId"
    } catch {
      taskkill /PID $procId /F | Out-Null
      if ($LASTEXITCODE -eq 0) {
        Write-Host "Stopped PID $procId via taskkill"
      } else {
        Write-Host "Could not stop PID $procId"
      }
    }
  }
}

Write-Host "Cleaning stale lock files..."
foreach ($lockPath in $lockFiles) {
  if (Test-Path $lockPath) {
    Remove-Item $lockPath -Force
    Write-Host "Removed $lockPath"
  }
}

Write-Host "Dev cleanup complete."
