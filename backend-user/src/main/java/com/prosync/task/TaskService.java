package com.prosync.task;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository repo;
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public TaskService(TaskRepository repo, JdbcTemplate jdbc) {
        this.repo = repo;
        this.jdbc = jdbc;
    }

    public List<Task> findByWorkspace(UUID workspaceId) {
        return repo.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId);
    }

    public Task create(TaskRequest req, String createdBy) {
        String status   = req.status()   != null ? req.status()   : "pending";
        String priority = req.priority() != null ? req.priority() : "medium";
        UUID id = Objects.requireNonNull(jdbc.queryForObject(
                "INSERT INTO tasks (workspace_id, title, description, status, priority, assignee, created_by) " +
                "VALUES (?, ?, ?, ?::task_status_enum, ?::task_priority_enum, ?, ?) RETURNING id",
                UUID.class,
                req.workspaceId(), req.title(), req.description(),
                status, priority, req.assignee(), createdBy));
        audit(createdBy, "TASK_CREATED", id, Map.of("title", req.title(), "status", status));
        return repo.findById(id).orElseThrow();
    }

    public Task updateStatus(UUID id, String newStatus, String userEmail) {
        repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarea no encontrada"));
        jdbc.update("UPDATE tasks SET status = ?::task_status_enum WHERE id = ?", newStatus, id);
        audit(userEmail, "TASK_STATUS_CHANGED", id, Map.of("status", newStatus));
        return repo.findById(id).orElseThrow();
    }

    public void delete(UUID id, String userEmail) {
        repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarea no encontrada"));
        audit(userEmail, "TASK_DELETED", id, Map.of());
        repo.deleteById(id);
    }

    private void audit(String userEmail, String action, UUID entityId, Map<String, ?> details) {
        try {
            String json = mapper.writeValueAsString(details);
            jdbc.update(
                    "INSERT INTO audit_logs (user_email, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?::jsonb)",
                    userEmail, action, "task", entityId, json);
        } catch (Exception ignored) {}
    }
}
