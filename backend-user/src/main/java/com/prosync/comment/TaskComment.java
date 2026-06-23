package com.prosync.comment;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_comments")
public class TaskComment {

    @Id
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID id;

    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @Column(name = "author_email", nullable = false)
    private String authorEmail;

    @Column(nullable = false)
    private String body;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public UUID getId()                  { return id; }
    public UUID getTaskId()              { return taskId; }
    public String getAuthorEmail()       { return authorEmail; }
    public String getBody()              { return body; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setId(UUID id)                 { this.id = id; }
    public void setTaskId(UUID v)              { this.taskId = v; }
    public void setAuthorEmail(String v)       { this.authorEmail = v; }
    public void setBody(String v)              { this.body = v; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
}
