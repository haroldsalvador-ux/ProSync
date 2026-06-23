-- ProSync — Sprint 5: Etiquetas, comentarios y notificaciones

-- ── 1. Etiquetas en tareas ───────────────────────────────────────────────────
-- Se guardan como texto separado por comas (etiquetas cortas, sin comas internas).
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS labels VARCHAR(500) NOT NULL DEFAULT '';

-- ── 2. Comentarios en tareas ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_comments (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      UUID         NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_email VARCHAR(255) NOT NULL,
  body         TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id, created_at);

-- ── 3. Notificaciones in-app ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  type       VARCHAR(50)  NOT NULL,          -- TASK_ASSIGNED | TASK_STATUS | WORKSPACE_ADDED | TASK_COMMENT
  message    TEXT         NOT NULL,
  task_id    UUID         REFERENCES tasks(id) ON DELETE CASCADE,
  is_read    BOOLEAN      NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_email, is_read, created_at DESC);
