package com.prosync.auth;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column
    private String role;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public UUID getId()                     { return id; }
    public String getEmail()                { return email; }
    public String getPasswordHash()         { return passwordHash; }
    public String getFullName()             { return fullName; }
    public String getRole()                 { return role; }
    public OffsetDateTime getCreatedAt()    { return createdAt; }
    public OffsetDateTime getUpdatedAt()    { return updatedAt; }

    public void setId(UUID id)                          { this.id = id; }
    public void setEmail(String email)                  { this.email = email; }
    public void setPasswordHash(String passwordHash)    { this.passwordHash = passwordHash; }
    public void setFullName(String fullName)            { this.fullName = fullName; }
    public void setRole(String role)                    { this.role = role; }
    public void setCreatedAt(OffsetDateTime v)          { this.createdAt = v; }
    public void setUpdatedAt(OffsetDateTime v)          { this.updatedAt = v; }
}
