@echo off
setlocal

cd /d "%~dp0" || (
  echo No se pudo acceder al directorio del lanzador. No se iniciará el servidor.
  pause
  exit /b 1
)

py -3 -c "import sys; raise SystemExit(0 if sys.version_info[0] == 3 else 1)" >nul 2>&1
if not errorlevel 1 (
  set "PYTHON_EXE=py"
  set "PYTHON_ARGS=-3"
)

if not defined PYTHON_EXE (
  for /f "delims=" %%P in ('where python.exe 2^>nul ^| findstr /I /V /C:"WindowsApps"') do (
    if not defined PYTHON_EXE "%%P" -c "import sys; raise SystemExit(0 if sys.version_info[0] == 3 else 1)" >nul 2>&1 && set "PYTHON_EXE=%%P"
  )
)

if not defined PYTHON_EXE (
  echo No se encontró Python 3 ejecutable. Instalá Python 3 y volvé a abrir este archivo.
  echo El alias de Microsoft Store no se usa como reemplazo.
  pause
  exit /b 1
)

"%PYTHON_EXE%" %PYTHON_ARGS% -c "import http.server, webbrowser; server = http.server.ThreadingHTTPServer(('127.0.0.1', 8000), http.server.SimpleHTTPRequestHandler); webbrowser.open('http://127.0.0.1:8000/'); server.serve_forever()"
if errorlevel 1 (
  echo El servidor se detuvo o no pudo usar 127.0.0.1:8000. Verificá que el puerto esté libre.
  pause
  exit /b 1
)

endlocal
