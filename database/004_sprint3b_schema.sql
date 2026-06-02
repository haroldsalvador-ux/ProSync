-- ProSync — Sprint 3b: Miembros de workspace
-- Ejecutar DESPUÉS de 003_sprint3_schema.sql

CREATE TABLE workspace_members (
  workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_email   VARCHAR(255) NOT NULL,
  added_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY  (workspace_id, user_email)
);

CREATE INDEX idx_workspace_members_email ON workspace_members(user_email);
