package com.prosync.workspace;

import com.prosync.auth.UserRepository;
import com.prosync.auth.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class WorkspaceService {

    private final WorkspaceRepository repo;
    private final UserRepository       userRepo;
    private final JdbcTemplate         jdbc;

    public WorkspaceService(WorkspaceRepository repo, UserRepository userRepo, JdbcTemplate jdbc) {
        this.repo     = repo;
        this.userRepo = userRepo;
        this.jdbc     = jdbc;
    }

    public List<Workspace> findAll() {
        return repo.findAll();
    }

    public Workspace create(WorkspaceRequest req) {
        UUID id = jdbc.queryForObject(
                "INSERT INTO workspaces (name, description, department, owner) " +
                "VALUES (?, ?, ?::department_enum, ?) RETURNING id",
                UUID.class,
                req.name(), req.description(), req.department(), req.owner());
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

        jdbc.update("INSERT INTO workspace_members (workspace_id, user_email) VALUES (?, ?)",
                workspaceId, email);

        return new UserResponse(user.getEmail(), user.getFullName());
    }

    public void removeMember(UUID workspaceId, String email) {
        jdbc.update("DELETE FROM workspace_members WHERE workspace_id = ? AND user_email = ?",
                workspaceId, email);
    }
}
