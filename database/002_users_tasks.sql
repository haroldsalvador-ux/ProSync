-- ProSync — Sprint 3: Users and Tasks

DO $$ BEGIN
  CREATE TYPE task_status_enum AS ENUM ('todo', 'in_progress', 'review', 'done');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority_enum AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'member',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS tasks (
  id           UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID               NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title        VARCHAR(255)       NOT NULL,
  description  TEXT,
  status       task_status_enum   NOT NULL DEFAULT 'todo',
  priority     task_priority_enum          DEFAULT 'medium',
  assignee     VARCHAR(255),
  created_by   VARCHAR(255)       NOT NULL,
  due_date     DATE,
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
