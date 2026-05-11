package com.prosync.controller;

import com.prosync.entity.Workspace;
import com.prosync.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    @Autowired
    private WorkspaceService service;

    @PostMapping
    public ResponseEntity<Workspace> crear(@RequestBody Workspace workspace) {
        return ResponseEntity.ok(service.crear(workspace));
    }

    @GetMapping
    public ResponseEntity<List<Workspace>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.ok().build();
    }
}