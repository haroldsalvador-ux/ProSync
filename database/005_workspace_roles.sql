-- ProSync — Sprint 4: Roles dentro de cada workspace

ALTER TABLE workspace_members
  ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'collaborator';

-- El creador de cada workspace existente debe quedar como manager
UPDATE workspace_members wm
SET role = 'manager'
FROM workspaces w
WHERE wm.workspace_id = w.id AND wm.user_email = w.owner;