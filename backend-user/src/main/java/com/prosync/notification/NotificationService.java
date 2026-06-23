package com.prosync.notification;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Crea notificaciones in-app. Es tolerante a fallos: una notificación nunca
 * debe romper la operación principal (crear tarea, comentar, etc.).
 */
@Service
public class NotificationService {

    private final JdbcTemplate jdbc;

    public NotificationService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Crea una notificación para un solo usuario. */
    public void notifyUser(String userEmail, String type, String message, UUID taskId) {
        if (userEmail == null || userEmail.isBlank()) return;
        try {
            jdbc.update(
                "INSERT INTO notifications (user_email, type, message, task_id) VALUES (?, ?, ?, ?)",
                userEmail, type, message, taskId);
        } catch (Exception ignored) {
            // No interrumpir la operación principal
        }
    }

    /**
     * Notifica a varios destinatarios excluyendo al autor de la acción
     * (no tiene sentido notificarte de algo que tú mismo hiciste).
     */
    public void notifyOthers(Set<String> recipients, String actor, String type, String message, UUID taskId) {
        Set<String> unique = new LinkedHashSet<>(recipients);
        unique.remove(actor);
        unique.remove(null);
        for (String email : unique) {
            notifyUser(email, type, message, taskId);
        }
    }
}
