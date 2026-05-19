package com.prosync.workspace;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class WorkspaceService {

    private final WorkspaceRepository repo;
    private final JdbcTemplate jdbc;

    public WorkspaceService(WorkspaceRepository repo, JdbcTemplate jdbc) {
        this.repo = repo;
        this.jdbc = jdbc;
    }

    public List<Workspace> findAll() {
        return repo.findAll();
    }

    public Workspace create(WorkspaceRequest req) {
        // Cast explícito ::department_enum necesario porque PostgreSQL no hace cast implícito
        // de parámetros JDBC VARCHAR a tipos enum personalizados.
        UUID id = jdbc.queryForObject(
                "INSERT INTO workspaces (name, description, department, owner) " +
                "VALUES (?, ?, ?::department_enum, ?) RETURNING id",
                UUID.class,
                req.name(), req.description(), req.department(), req.owner()
        );
        return repo.findById(id).orElseThrow();
    }
}
