package com.prosync.service;

import com.prosync.entity.Workspace;
import com.prosync.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WorkspaceService {

    @Autowired
    private WorkspaceRepository repository;

    public Workspace crear(Workspace workspace) {
        if (workspace.getName() == null || workspace.getName().trim().isEmpty()) {
            throw new RuntimeException("El nombre no puede estar vacío");
        }
        if (workspace.getName().trim().length() < 3) {
            throw new RuntimeException("El nombre debe tener al menos 3 caracteres");
        }
        if (repository.existsByName(workspace.getName().trim())) {
            throw new RuntimeException("Ya existe un espacio con ese nombre");
        }
        workspace.setName(workspace.getName().trim());
        return repository.save(workspace);
    }

    public List<Workspace> listarTodos() {
        return repository.findAll();
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}