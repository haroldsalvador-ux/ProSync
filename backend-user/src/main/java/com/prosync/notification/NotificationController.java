package com.prosync.notification;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository repo;

    public NotificationController(NotificationRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Notification> list(Authentication auth) {
        return repo.findTop30ByUserEmailOrderByCreatedAtDesc(auth.getName());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication auth) {
        return Map.of("count", repo.countByUserEmailAndIsReadFalse(auth.getName()));
    }

    @PatchMapping("/{id}/read")
    public Notification markRead(@PathVariable UUID id, Authentication auth) {
        Notification n = repo.findById(id).orElseThrow();
        if (n.getUserEmail().equals(auth.getName())) {
            n.setRead(true);
            repo.save(n);
        }
        return n;
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(Authentication auth) {
        List<Notification> all = repo.findTop30ByUserEmailOrderByCreatedAtDesc(auth.getName());
        all.forEach(n -> n.setRead(true));
        repo.saveAll(all);
    }
}
