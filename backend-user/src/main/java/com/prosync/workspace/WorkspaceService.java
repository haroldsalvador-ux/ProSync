package com.prosync.workspace;

import com.prosync.auth.UserRepository;
import com.prosync.auth.UserResponse;
import com.prosync.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class WorkspaceService {

    private final WorkspaceRepository repo;
    private final UserRepository userRepo;
    private final JdbcTemplate jdbc;
    private final NotificationService notifications;

    public WorkspaceService(WorkspaceRepository repo, UserRepository userRepo, JdbcTemplate jdbc,
                            NotificationService notifications) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.jdbc = jdbc;
        this.notifications = notifications;
    }

    public List<Workspace> findAllForUser(String userEmail) {
        return jdbc.query(
                "SELECT w.* FROM workspaces w " +
                        "JOIN workspace_members wm ON wm.workspace_id = w.id " +
                        "WHERE wm.user_email = ?",
                (rs, row) -> {
                    Workspace w = new Workspace();
                    w.setId((UUID) rs.getObject("id"));
                    w.setName(rs.getString("name"));
                    w.setDescription(rs.getString("description"));
                    w.setDepartment(rs.getString("department"));
                    w.setOwner(rs.getString("owner"));
                    return w;
                },
                userEmail);
    }

    public Workspace create(WorkspaceRequest req) {
        UUID id = jdbc.queryForObject(
                "INSERT INTO workspaces (name, description, department, owner) " +
                        "VALUES (?, ?, ?::department_enum, ?) RETURNING id",
                UUID.class,
                req.name(), req.description(), req.department(), req.owner());

        // El creador queda automáticamente como manager de su propio workspace
        jdbc.update(
                "INSERT INTO workspace_members (workspace_id, user_email, role) VALUES (?, ?, 'manager')",
                id, req.owner());

        return repo.findById(id).orElseThrow();
    }

    // ─── Miembros ────────────────────────────────────────────────────────────

    public List<UserResponse> getMembers(UUID workspaceId) {
        return jdbc.query(
                "SELECT u.email, u.full_name FROM workspace_members wm " +
                        "JOIN users u ON u.email = wm.user_email " +
                        "WHERE wm.workspace_id = ? ORDER BY wm.added_at ASC",
                (rs, row) -> new UserResponse(rs.getString("email"), rs.getString("full_name")),
                workspaceId);
    }

    public UserResponse addMember(UUID workspaceId, String email) {
        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe ningún usuario registrado con ese correo"));

        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM workspace_members WHERE workspace_id = ? AND user_email = ?",
                Integer.class, workspaceId, email);
        if (count != null && count > 0)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El usuario ya es miembro");

        jdbc.update("INSERT INTO workspace_members (workspace_id, user_email, role) VALUES (?, ?, 'collaborator')",
                workspaceId, email);

        // Avisar al usuario que fue agregado al workspace
        Workspace ws = repo.findById(workspaceId).orElse(null);
        String wsName = ws != null ? ws.getName() : "un workspace";
        notifications.notifyUser(email, "WORKSPACE_ADDED",
                "Te agregaron al workspace: " + wsName, null);

        return new UserResponse(user.getEmail(), user.getFullName());
    }

    public void removeMember(UUID workspaceId, String email) {
        jdbc.update("DELETE FROM workspace_members WHERE workspace_id = ? AND user_email = ?",
                workspaceId, email);
    }
}
