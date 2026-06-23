# ProSync — Plataforma Colaborativa de Gestión de Proyectos

ProSync es una plataforma estilo Trello con funciones que la diferencian: tablero
Kanban con drag & drop, **etiquetas**, **comentarios en tareas**, **notificaciones
in-app**, **vista de calendario**, dashboard de velocidad, roles por workspace,
bloqueo de cuentas y un panel de administración dedicado.

## Arquitectura

| Componente | Tecnología | Puerto |
|------------|-----------|--------|
| **frontend** (app de usuarios) | React + Vite + Tailwind | 5173 |
| **frontend-admin** (panel admin) | React + Vite + Tailwind | 5174 |
| **backend-user** | Spring Boot (Java 21) + JWT | 8081 |
| **backend-admin** | Django 5.2 + DRF | 8000 |
| **base de datos** | PostgreSQL 14+ | 5432 |

## Prerrequisitos

| Herramienta | Versión |
|-------------|---------|
| PostgreSQL  | 14+     |
| Java / Maven | 21 / 3.9+ |
| Python      | 3.11+   |
| Node.js + pnpm | 20+ / 9+ |

---

## 1. Base de datos

Crea la BD `prosync_db` y aplica los scripts de `database/` **en orden** (con psql o pgAdmin):

```bash
# Ejemplo con psql (ajusta la ruta de psql según tu instalación)
createdb -U postgres prosync_db
psql -U postgres -d prosync_db -f database/001_initial_schema.sql
psql -U postgres -d prosync_db -f database/002_sprint2_schema.sql
psql -U postgres -d prosync_db -f database/002_users_tasks.sql
psql -U postgres -d prosync_db -f database/003_sprint3_schema.sql
psql -U postgres -d prosync_db -f database/004_sprint3b_schema.sql
psql -U postgres -d prosync_db -f database/005_workspace_roles.sql
psql -U postgres -d prosync_db -f database/006_user_blocking.sql
psql -U postgres -d prosync_db -f database/007_sprint5_features.sql
```

> Los scripts son idempotentes (`IF NOT EXISTS` / `DO` blocks), se pueden re-ejecutar sin romper nada.

La conexión por defecto está en `backend-admin/prosync_admin/settings.py` y
`backend-user/src/main/resources/application.properties` (usuario `postgres`).
Ajusta usuario/contraseña según tu entorno.

---

## 2. Backend User — Spring Boot (:8081)

```bash
cd backend-user
mvn spring-boot:run
```

---

## 3. Backend Admin — Django (:8000)

```bash
cd backend-admin

# Primera vez: crear entorno virtual e instalar dependencias
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/Mac
pip install -r requirements.txt

# Migraciones internas de Django (auth, sessions, admin, authtoken)
python manage.py migrate

# Crear un administrador (staff) para el panel admin
python manage.py createsuperuser

python manage.py runserver 8000
```

---

## 4. Frontends — React (:5173 y :5174)

```bash
# App de usuarios
cd frontend
pnpm install
pnpm dev            # http://localhost:5173

# Panel de administración (en otra terminal)
cd frontend-admin
pnpm install
pnpm dev            # http://localhost:5174
```

---

## Credenciales de demostración

| Servicio | Usuario | Contraseña |
|----------|---------|-----------|
| App de usuarios (`:5173`) | `demo@prosync.com` | `demo1234` |
| Panel admin (`:5174`) | `admin` | `admin1234` |

> Estas credenciales son solo para desarrollo. El panel admin requiere un usuario
> Django con permisos de **staff**.

---

## Funcionalidades destacadas

- **Tablero Kanban** con drag & drop (Por Hacer / En Proceso / Completado).
- **Etiquetas** de colores en tareas, con barra de filtro en el tablero.
- **Comentarios** en cada tarea (clic en la tarjeta abre el detalle).
- **Notificaciones in-app**: al asignarte una tarea, agregarte a un workspace,
  cambiar el estado de una tarea tuya o comentarla.
- **Vista de calendario** por fecha límite, con navegación de meses.
- **Búsqueda** por título, responsable, descripción o etiqueta.
- **Roles por workspace** (manager / collaborator); el creador es manager.
- **Aislamiento de datos**: cada usuario solo ve sus propios workspaces y tareas.
- **Dashboard de velocidad** (Django): velocidad semanal, por miembro, tasa de
  completado, tareas en riesgo.
- **Panel de administración**: gestión de usuarios, **bloqueo de cuentas**,
  workspaces, logs de auditoría y métricas globales.

---

## Notas de desarrollo

- Los frontends usan **pnpm**. No mezclar con npm.
- `node_modules/`, `target/`, `.venv/` y archivos `.env` están en `.gitignore` y
  **no deben commitearse** (son específicos de cada máquina).
- Cambia `SECRET_KEY` (Django) y `jwt.secret` (Spring Boot) antes de producción.
