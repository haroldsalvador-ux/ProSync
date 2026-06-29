package com.prosync.android.data.models

import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.ServerTimestamp
import com.google.firebase.firestore.PropertyName

data class User(
    @DocumentId val uid: String = "",
    val email: String = "",
    val fullName: String = "",
    val role: String = "USER",
    @get:PropertyName("blocked")
    @set:PropertyName("blocked")
    var blocked: Boolean = false,
    val photoUrl: String = "",
    @ServerTimestamp val createdAt: Timestamp? = null
)

enum class WorkspaceRole(val key: String, val label: String) {
    MANAGER("manager", "Manager"),
    COLLABORATOR("collaborator", "Colaborador");

    companion object {
        fun fromKey(key: String) = values().find { it.key == key } ?: COLLABORATOR
    }
}

data class WorkspaceMember(
    val uid: String = "",
    val email: String = "",
    val fullName: String = "",
    val role: String = "collaborator"
)

data class Workspace(
    @DocumentId val id: String = "",
    val name: String = "",
    val description: String = "",
    val department: String = "",
    val ownerUid: String = "",
    val ownerEmail: String = "",
    val memberUids: List<String> = emptyList(),
    @ServerTimestamp val createdAt: Timestamp? = null
)

data class Task(
    @DocumentId val id: String = "",
    val workspaceId: String = "",
    val title: String = "",
    val description: String = "",
    val status: String = "pending",
    val priority: String = "medium",
    val assigneeUid: String = "",
    val assigneeEmail: String = "",
    val createdByUid: String = "",
    val createdByEmail: String = "",
    val dueDate: Timestamp? = null,
    val labels: List<String> = emptyList(),
    @ServerTimestamp val createdAt: Timestamp? = null,
    @ServerTimestamp val updatedAt: Timestamp? = null
)

data class TaskComment(
    @DocumentId val id: String = "",
    val taskId: String = "",
    val authorUid: String = "",
    val authorEmail: String = "",
    val authorName: String = "",
    val body: String = "",
    @ServerTimestamp val createdAt: Timestamp? = null
)

data class Notification(
    @DocumentId val id: String = "",
    val userUid: String = "",
    val type: String = "",
    val message: String = "",
    val taskId: String = "",
    val isRead: Boolean = false,
    @ServerTimestamp val createdAt: Timestamp? = null
)

enum class TaskStatus(val key: String, val label: String) {
    PENDING("pending", "Por Hacer"),
    IN_PROGRESS("in_progress", "En Proceso"),
    DONE("done", "Completado");

    companion object {
        fun fromKey(key: String) = values().find { it.key == key } ?: PENDING
    }
}

enum class TaskPriority(val key: String, val label: String) {
    LOW("low", "Baja"),
    MEDIUM("medium", "Media"),
    HIGH("high", "Alta");

    companion object {
        fun fromKey(key: String) = values().find { it.key == key } ?: MEDIUM
    }
}

val DEPARTMENTS = listOf(
    "Engineering", "Marketing", "Design", "Product",
    "Sales", "HR", "Finance", "Operations"
)

val LABEL_COLORS = mapOf(
    "frontend"  to "#4F46E5",
    "backend"   to "#0891B2",
    "urgente"   to "#DC2626",
    "bug"       to "#B91C1C",
    "feature"   to "#059669",
    "diseño"    to "#7C3AED",
    "testing"   to "#D97706",
    "docs"      to "#6B7280"
)

data class TaskHistory(
    @DocumentId val id: String = "",
    val taskId: String = "",
    val userUid: String = "",
    val userEmail: String = "",
    val action: String = "",      // STATUS_CHANGED | ASSIGNED | EDITED | COMMENTED
    val oldValue: String = "",
    val newValue: String = "",
    @ServerTimestamp val createdAt: Timestamp? = null
)
