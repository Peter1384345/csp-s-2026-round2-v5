<#
  push-to-github.ps1 —— 推送前自动确保 Watt Toolkit（瓦特工具箱 / Steam++）在运行

  背景：本机 hosts 把 github.com 指向 127.0.0.1，直连 GitHub 会失败。
  Watt Toolkit 启动并开启「GitHub 加速」后会在本地代理 github.com，
  此时 git push 才能成功。所以推送前必须先把它拉起来。

  用法：
    pwsh -File tools/push-to-github.ps1              # 拉起来 + 推送 main
    pwsh -File tools/push-to-github.ps1 -Branch dev  # 推送指定分支
    pwsh -File tools/push-to-github.ps1 -WaitOnly    # 只等连通，不推送
#>
[CmdletBinding()]
param(
  [string]$Branch = 'main',
  [string]$Remote = 'origin',
  [switch]$WaitOnly,
  [int]$WaitSeconds = 90
)

$ErrorActionPreference = 'Continue'

# Watt Toolkit 的安装位置（已知路径，找不到时再按进程名探测）
$candidates = @(
  'D:\steam++\Steam++.exe',
  (Join-Path $env:ProgramFiles 'Watt Toolkit\Steam++.exe'),
  (Join-Path ${env:ProgramFiles(x86)} 'Watt Toolkit\Steam++.exe'),
  (Join-Path $env:LOCALAPPDATA 'Watt Toolkit\Steam++.exe')
) | Where-Object { $_ -and (Test-Path $_) }

function Test-WattRunning {
  [bool](Get-Process -Name 'Steam++', 'Steam++.Accelerator', 'WattToolkit' -ErrorAction SilentlyContinue)
}

function Test-GitHubReachable {
  # 用 git ls-remote 判定：它走的正是 push 的同一条链路，比 ping/TCP 更准
  # 经 cmd 重定向输出，避免 PowerShell 5.1 把 git 的 stderr 当成 ErrorRecord 抛错
  $tmp = [IO.Path]::GetTempFileName()
  try {
    & cmd /c "git ls-remote --heads $Remote > `"$tmp`" 2>&1" | Out-Null
    return ($LASTEXITCODE -eq 0)
  } finally {
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  }
}

Write-Host '=== 1. Watt Toolkit 状态 ===' -ForegroundColor Cyan
if (Test-WattRunning) {
  Write-Host '  ✅ Watt Toolkit 已在运行' -ForegroundColor Green
} else {
  if (-not $candidates) {
    Write-Warning '  找不到 Watt Toolkit 可执行文件，请手动打开后重试。'
  } else {
    $exe = $candidates[0]
    Write-Host "  ⏳ 未运行，正在启动：$exe"
    Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe) -ErrorAction SilentlyContinue
  }
  # 等它起来
  $t0 = Get-Date
  while (-not (Test-WattRunning) -and ((Get-Date) - $t0).TotalSeconds -lt 60) { Start-Sleep -Seconds 2 }
  if (Test-WattRunning) { Write-Host '  ✅ Watt Toolkit 已启动' -ForegroundColor Green }
  else { Write-Warning '  ⚠ Watt Toolkit 仍未检测到，继续尝试连接…' }
}

Write-Host "`n=== 2. 检查 GitHub 连通性（最多等 $WaitSeconds 秒）===" -ForegroundColor Cyan
$dns = (Resolve-DnsName github.com -Type A -ErrorAction SilentlyContinue |
        Where-Object { $_.IPAddress } | Select-Object -First 1 -ExpandProperty IPAddress)
Write-Host "  github.com 解析为: $dns"

$ok = $false
$deadline = (Get-Date).AddSeconds($WaitSeconds)
$try = 0
while ((Get-Date) -lt $deadline) {
  $try++
  Write-Host "  第 $try 次尝试 git ls-remote $Remote …" -NoNewline
  if (Test-GitHubReachable) { Write-Host ' 连上了' -ForegroundColor Green; $ok = $true; break }
  Write-Host ' 失败，5 秒后重试' -ForegroundColor DarkYellow
  Start-Sleep -Seconds 5
}

if (-not $ok) {
  Write-Host "`n❌ 仍无法访问 GitHub。" -ForegroundColor Red
  Write-Host '   请在 Watt Toolkit 界面里确认「网络加速 / GitHub」已开启（并已点过加速按钮），然后重跑本脚本。'
  exit 1
}

if ($WaitOnly) { Write-Host "`n✅ 已连通（-WaitOnly，不推送）" -ForegroundColor Green; exit 0 }

Write-Host "`n=== 3. 推送到 $Remote/$Branch ===" -ForegroundColor Cyan
$tmpOut = [IO.Path]::GetTempFileName()
& cmd /c "git push $Remote $Branch > `"$tmpOut`" 2>&1" | Out-Null
$pushCode = $LASTEXITCODE
Get-Content $tmpOut -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "  $_" }
Remove-Item $tmpOut -Force -ErrorAction SilentlyContinue

if ($pushCode -eq 0) {
  Write-Host "`n✅ 推送成功" -ForegroundColor Green
  git status -sb | Select-Object -First 1
  exit 0
} else {
  Write-Host "`n❌ 推送失败（连通性已确认，可能是权限或冲突）" -ForegroundColor Red
  exit 1
}
