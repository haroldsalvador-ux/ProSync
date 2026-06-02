-- ProSync — Sprint 3: Due Date + índice de responsable
-- Ejecutar DESPUÉS de 002_sprint2_schema.sql

ALTER TABLE tasks ADD COLUMN due_date DATE;

CREATE INDEX idx_tasks_assignee  ON tasks(assignee);
CREATE INDEX idx_tasks_due_date  ON tasks(due_date);
