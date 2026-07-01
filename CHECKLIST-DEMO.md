# ✅ Checklist pre-demostración — ProSync

Revisa esto **antes** de presentar para que nada falle en vivo.

## 1. Arranque (1 comando)
- [ ] Ejecutar `start-prosync.ps1` (click derecho → Ejecutar con PowerShell).
- [ ] Confirmar que se abrieron **4 ventanas** (Spring Boot, Django, Frontend, Admin).

## 2. Verificar que todo está arriba (esperar ~30s)
- [ ] **PostgreSQL** corriendo: `Get-Service postgresql-x64-17` → *Running*.
      Si está detenido, abrir PowerShell **como administrador** y `Start-Service postgresql-x64-17`.
- [ ] **Spring Boot** (:8081): la ventana muestra "Started ProSyncApplication".
- [ ] **Django** (:8000): la ventana muestra "Starting development server at http://127.0.0.1:8000/".
- [ ] **Frontend** (:5173) y **Admin** (:5174): muestran "VITE ready".

## 3. Datos de demostración listos
- [ ] Entrar a http://localhost:5173 con **demo@prosync.com / demo1234**.
- [ ] Verificar que hay un workspace ("Lanzamiento App") con tareas.
- [ ] Entrar a http://localhost:5174 con **admin / admin1234**.

## 4. Guion sugerido de la demo (orden de features)
1. **Login** de usuario → dashboard.
2. **Tablero Kanban**: crear tarea con etiquetas → arrastrarla entre columnas.
3. **Comentarios**: abrir una tarea → comentar.
4. **Notificaciones**: mostrar la campana.
5. **Calendario**: ver tareas por fecha límite.
6. **Panel admin** (:5174): dashboard de velocidad, **bloquear una cuenta**, logs de auditoría.

## 5. Credenciales
| Servicio | Usuario | Contraseña |
|----------|---------|-----------|
| App usuarios | demo@prosync.com | demo1234 |
| Panel admin | admin | admin1234 |

> Si algo no carga: casi siempre es **PostgreSQL detenido** o un **servicio que no terminó de arrancar**. Espera unos segundos y recarga.
