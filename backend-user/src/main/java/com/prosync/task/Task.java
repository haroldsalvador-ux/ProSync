package com.prosync.task;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    // Mapeado como String; inserts/updates usan cast explícito ::task_status_enum
    @Column
    private String status;

    // Mapeado como String; inserts usan cast ::task_priority_enum
    @Column
    private String priority;

    @Column
    private String assignee;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public UUID getId()                  { return id; }
    public UUID getWorkspaceId()         { return workspaceId; }
    public String getTitle()             { return title; }
    public String getDescription()       { return description; }
    public String getStatus()            { return status; }
    public String getPriority()          { return priority; }
    public String getAssignee()          { return assignee; }
    public String getCreatedBy()         { return createdBy; }
    public LocalDate getDueDate()        { return dueDate; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public void setId(UUID id)                          { this.id = id; }
    public void setWorkspaceId(UUID workspaceId)        { this.workspaceId = workspaceId; }
    public void setTitle(String title)                  { this.title = title; }
    public void setDescription(String description)      { this.description = description; }
    public void setStatus(String status)                { this.status = status; }
    public void setPriority(String priority)            { this.priority = priority; }
    public void setAssignee(String assignee)            { this.assignee = assignee; }
    public void setCreatedBy(String createdBy)          { this.createdBy = createdBy; }
    public void setDueDate(LocalDate dueDate)           { this.dueDate = dueDate; }
    public void setCreatedAt(OffsetDateTime v)          { this.createdAt = v; }
    public void setUpdatedAt(OffsetDateTime v)          { this.updatedAt = v; }
}
