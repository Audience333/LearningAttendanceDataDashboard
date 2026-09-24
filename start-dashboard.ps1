param(
  [int]$Port = 8765
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $projectRoot

$python = Get-Command python.exe -ErrorAction SilentlyContinue
$pythonArgs = @()
if ($null -eq $python) {
  $python = Get-Command py.exe -ErrorAction SilentlyContinue
  $pythonArgs = @("-3")
}
if ($null -eq $python) {
  throw "未找到 Python。请安装 Python 3 后重试。"
}

$url = "http://127.0.0.1:$Port/"
$serverArgs = $pythonArgs + @("-m", "http.server", "$Port", "--bind", "127.0.0.1")
$server = Start-Process -FilePath $python.Source -ArgumentList $serverArgs -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru

try {
  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    if ($server.HasExited) { throw "本地服务启动失败，进程已退出。" }
    try {
      Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 | Out-Null
      $ready = $true
      break
    } catch {
      Start-Sleep -Milliseconds 250
    }
  }
  if (-not $ready) { throw "等待本地页面超时：$url" }

  Start-Process $url
  Write-Host "学习打卡数据看板已启动：$url" -ForegroundColor Green
  Write-Host "关闭此窗口将停止本地服务。" -ForegroundColor DarkGray
  while (-not $server.HasExited) { Start-Sleep -Seconds 1 }
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
  }
}
