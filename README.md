# ProSync — Guía de Ejecución (Sprint 1)

## Prerrequisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| PostgreSQL  | 14+            |
| Java / Maven | 21 / 3.9+     |
| Python      | 3.11+          |
| Node.js     | 20+            |

---

## 1. Base de Datos

```sql
-- En psql o pgAdmin, conectado como superusuario:
CREATE DATABASE prosync_db;
\c prosync_db
\i database/001_initial_schema.sql
```

---

## 2. Backend User — Spring Boot (:8081)

```bash
cd backend-user
mvn spring-boot:run
```

Endpoints disponibles:
- `GET  http://localhost:8081/api/workspaces`
- `POST http://localhost:8081/api/workspaces`

---

## 3. Backend Admin — Django (:8000)

```bash
cd backend-admin

# Crear entorno virtual (primera vez)
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/Mac

pip install -r requirements.txt

# Crear las tablas internas de Django (auth, sessions, admin)
python manage.py migrate

# Crear superusuario para acceder a /admin/
python manage.py createsuperuser

# Levantar servidor
python manage.py runserver 8000
```

Panel de administración: `http://localhost:8000/admin/`

---

## 4. Frontend — React + Vite (:5173)

```bash
cd frontend
npm install
npm run dev
```

Abre: `http://localhost:5173`

---

## Credenciales por defecto (desarrollo)

| Servicio    | Usuario  | Contraseña |
|-------------|----------|------------|
| PostgreSQL  | postgres | postgres   |
| Django Admin | (el que creaste con createsuperuser) | — |

> **Importante:** Cambia `SECRET_KEY` en `backend-admin/prosync_admin/settings.py` antes de desplegar a producción.
