package com.prosync.comment;

import com.prosync.notification.NotificationService;
import com.prosync.task.Task;
import com.prosync.task.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks/{taskId}/comments")
public class CommentController {

    private final TaskCommentRepository repo;
    private final TaskRepository taskRepo;
    private final NotificationService notifications;
    private final JdbcTemplate jdbc;

    public CommentController(TaskCommentRepository repo, TaskRepository taskRepo,
                            NotificationService notifications, JdbcTemplate jdbc) {
        this.repo = repo;
        this.taskRepo = taskRepo;
        this.notifications = notifications;
        this.jdbc = jdbc;
    }

    @GetMapping
    public List<TaskComment> list(@PathVariable UUID taskId) {
        return repo.findByTaskIdOrderByCreatedAtAsc(taskId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskComment create(@PathVariable UUID taskId,
                              @RequestBody @Valid CommentRequest req,
                              Authentication auth) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarea no encontrada"));

        String author = auth.getName();
        UUID id = jdbc.queryForObject(
                "INSERT INTO task_comments (task_id, author_email, body) VALUES (?, ?, ?) RETURNING id",
                UUID.class, taskId, author, req.body());

        // Notificar al asignado y al creador de la tarea (menos al propio autor)
        Set<String> recipients = new HashSet<>();
        recipients.add(task.getAssignee());
        recipients.add(task.getCreatedBy());
        notifications.notifyOthers(recipients, author,
                "TASK_COMMENT", "Nuevo comentario en: " + task.getTitle(), taskId);

        return repo.findById(id).orElseThrow();
    }
}
