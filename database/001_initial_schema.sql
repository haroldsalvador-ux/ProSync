-- ProSync — Sprint 1: Workspaces
-- Fuente de verdad del esquema. Ningún ORM debe alterar estas tablas.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE department_enum AS ENUM (
  'Engineering',
  'Marketing',
  'Design',
  'Product',
  'Sales',
  'HR',
  'Finance',
  'Operations'
);

CREATE TABLE workspaces (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  department  department_enum,
  owner       VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
