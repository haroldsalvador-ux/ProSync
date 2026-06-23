package com.prosync.notification;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String message;

    @Column(name = "task_id")
    private UUID taskId;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public UUID getId()                  { return id; }
    public String getUserEmail()         { return userEmail; }
    public String getType()              { return type; }
    public String getMessage()           { return message; }
    public UUID getTaskId()              { return taskId; }
    public boolean isRead()              { return isRead; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setId(UUID id)                  { this.id = id; }
    public void setUserEmail(String v)          { this.userEmail = v; }
    public void setType(String v)               { this.type = v; }
    public void setMessage(String v)            { this.message = v; }
    public void setTaskId(UUID v)               { this.taskId = v; }
    public void setRead(boolean v)              { this.isRead = v; }
    public void setCreatedAt(OffsetDateTime v)  { this.createdAt = v; }
}
