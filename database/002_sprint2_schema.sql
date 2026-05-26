-- ProSync — Sprint 2: Users, Tasks, Audit Logs
-- Ejecutar DESPUÉS de 001_initial_schema.sql (ya debe existir la función set_updated_at).

CREATE TYPE task_status_enum   AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE task_priority_enum AS ENUM ('low', 'medium', 'high');
CREATE TYPE user_role_enum     AS ENUM ('USER', 'ADMIN');

-- ─── Usuarios ────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  full_name     VARCHAR(255)  NOT NULL,
  role          user_role_enum NOT NULL DEFAULT 'USER',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Tareas ───────────────────────────────────────────────────────────────────
CREATE TABLE tasks (
  id           UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID               NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title        VARCHAR(255)       NOT NULL,
  description  TEXT,
  status       task_status_enum   NOT NULL DEFAULT 'pending',
  priority     task_priority_enum NOT NULL DEFAULT 'medium',
  assignee     VARCHAR(255),
  created_by   VARCHAR(255)       NOT NULL,
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_status    ON tasks(status);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Auditoría ────────────────────────────────────────────────────────────────
-- Escrita por Spring Boot; leída (managed=False) por Django admin.
CREATE TABLE audit_logs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email  VARCHAR(255) NOT NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50)  NOT NULL,
  entity_id   UUID,
  details     JSONB,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user    ON audit_logs(user_email);
CREATE INDEX idx_audit_action  ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
