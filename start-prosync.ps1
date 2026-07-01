# ============================================================================
#  ProSync - Script de arranque de todos los servicios (Windows / PowerShell)
#  Uso:  click derecho -> "Ejecutar con PowerShell"   o   .\start-prosync.ps1
# ============================================================================

# --- Configuracion (ajusta si tu instalacion difiere) -----------------------
$Root       = $PSScriptRoot
$MavenCmd   = "C:\apache-maven-3.9.16\bin\mvn.cmd"   # ruta a Maven
$PgService  = "postgresql-x64-17"                     # nombre del servicio PostgreSQL

Write-Host "==== ProSync :: arranque de servicios ====" -ForegroundColor Cyan

# --- 1. Verificar PostgreSQL ------------------------------------------------
$pg = Get-Service -Name $PgService -ErrorAction SilentlyContinue
if ($null -eq $pg) {
    Write-Host "[!] No se encontro el servicio $PgService. Revisa el nombre." -ForegroundColor Yellow
} elseif ($pg.Status -ne "Running") {
    Write-Host "[..] PostgreSQL esta detenido. Intentando iniciarlo..." -ForegroundColor Yellow
    try {
        Start-Service $PgService -ErrorAction Stop
        Write-Host "[OK] PostgreSQL iniciado." -ForegroundColor Green
    } catch {
        Write-Host "[X] No se pudo iniciar PostgreSQL (requiere PowerShell como Administrador)." -ForegroundColor Red
        Write-Host "    Abre PowerShell como admin y ejecuta:  Start-Service $PgService" -ForegroundColor Red
    }
} else {
    Write-Host "[OK] PostgreSQL ya esta corriendo." -ForegroundColor Green
}

# --- 2. Lanzar cada servicio en su propia ventana ---------------------------
function Start-Servicio($titulo, $comando) {
    Write-Host "[..] Lanzando: $titulo" -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle='$titulo'; $comando"
}

Start-Servicio "ProSync - Spring Boot (8081)" "cd '$Root\backend-user'; & '$MavenCmd' spring-boot:run"
Start-Servicio "ProSync - Django (8000)"      "cd '$Root\backend-admin'; .\.venv\Scripts\Activate.ps1; python manage.py runserver 8000"
Start-Servicio "ProSync - Frontend (5173)"    "cd '$Root\frontend'; pnpm dev"
Start-Servicio "ProSync - Admin (5174)"       "cd '$Root\frontend-admin'; pnpm dev"

Write-Host ""
Write-Host "==== Listo. Se abrieron 4 ventanas. Espera ~30s a que arranquen. ====" -ForegroundColor Green
Write-Host "  App usuarios : http://localhost:5173   (demo@prosync.com / demo1234)" -ForegroundColor White
Write-Host "  Panel admin  : http://localhost:5174   (admin / admin1234)" -ForegroundColor White
