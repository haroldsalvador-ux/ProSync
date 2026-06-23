package com.prosync.task;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prosync.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository repo;
    private final JdbcTemplate jdbc;
    private final NotificationService notifications;
    private final ObjectMapper mapper = new ObjectMapper();

    public TaskService(TaskRepository repo, JdbcTemplate jdbc, NotificationService notifications) {
        this.repo = repo;
        this.jdbc = jdbc;
        this.notifications = notifications;
    }

    public List<Task> findAllForUser(String userEmail) {
        List<UUID> workspaceIds = jdbc.queryForList(
                "SELECT workspace_id FROM workspace_members WHERE user_email = ?",
                UUID.class, userEmail);

        if (workspaceIds.isEmpty()) {
            return List.of();
        }
        return repo.findByWorkspaceIdIn(workspaceIds);
    }

    public List<Task> findByWorkspace(UUID workspaceId) {
        return repo.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId);
    }

    public Task create(TaskRequest req, String createdBy) {
        String status = req.status() != null ? req.status() : "pending";
        String priority = req.priority() != null ? req.priority() : "medium";
        String labels = req.labels() != null ? req.labels() : "";
        UUID id = Objects.requireNonNull(jdbc.queryForObject(
                "INSERT INTO tasks (workspace_id, title, description, status, priority, assignee, created_by, due_date, labels) "
                        +
                        "VALUES (?, ?, ?, ?::task_status_enum, ?::task_priority_enum, ?, ?, ?, ?) RETURNING id",
                UUID.class,
                req.workspaceId(), req.title(), req.description(),
                status, priority, req.assignee(), createdBy, req.dueDate(), labels));
        audit(createdBy, "TASK_CREATED", id, Map.of("title", req.title(), "status", status));

        // Avisar al responsable si se le asignó la tarea (y no es quien la creó)
        if (req.assignee() != null && !req.assignee().equals(createdBy)) {
            notifications.notifyUser(req.assignee(), "TASK_ASSIGNED",
                    "Te asignaron la tarea: " + req.title(), id);
        }
        return repo.findById(id).orElseThrow();
    }

    public Task updateStatus(UUID id, String newStatus, String userEmail) {
        Task task = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarea no encontrada"));
        jdbc.update("UPDATE tasks SET status = ?::task_status_enum WHERE id = ?", newStatus, id);
        audit(userEmail, "TASK_STATUS_CHANGED", id, Map.of("status", newStatus));

        // Avisar al responsable y al creador (menos a quien hizo el cambio)
        Set<String> recipients = new HashSet<>();
        recipients.add(task.getAssignee());
        recipients.add(task.getCreatedBy());
        notifications.notifyOthers(recipients, userEmail, "TASK_STATUS",
                "La tarea \"" + task.getTitle() + "\" cambió a " + statusLabel(newStatus), id);

        return repo.findById(id).orElseThrow();
    }

    private String statusLabel(String status) {
        return switch (status) {
            case "pending"     -> "Por Hacer";
            case "in_progress" -> "En Proceso";
            case "done"        -> "Completado";
            default            -> status;
        };
    }

    public void delete(UUID id, String userEmail) {
        repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarea no encontrada"));
        audit(userEmail, "TASK_DELETED", id, Map.of());
        repo.deleteById(id);
    }

    private void audit(String userEmail, String action, UUID entityId, Map<String, ?> details) {
        try {
            String json = mapper.writeValueAsString(details);
            jdbc.update(
                    "INSERT INTO audit_logs (user_email, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?::jsonb)",
                    userEmail, action, "task", entityId, json);
        } catch (Exception ignored) {
        }
    }
}
