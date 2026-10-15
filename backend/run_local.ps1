param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'

# Ensure local HTTP requests are not redirected to HTTPS, even if the parent
# terminal or IDE has set DEBUG to a non-Django value such as "release".
$env:DEBUG = 'True'
$env:DJANGO_SETTINGS_MODULE = 'legalconnect.settings'

Set-Location $PSScriptRoot
$python = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (-not (Test-Path $python)) {
    throw "Project virtual environment not found at $python. Create it with: py -3.13 -m venv .venv; then install requirements-local.txt."
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    throw "Port $Port is already occupied by process $($listener.OwningProcess). Stop that process or start this backend with -Port 8001 and set NEXT_PUBLIC_API_URL to http://localhost:8001."
}

& $python manage.py migrate
if ($LASTEXITCODE -ne 0) {
    throw 'Django migrations failed. Fix the database error above before starting the server.'
}

& $python manage.py runserver 0.0.0.0:$Port
