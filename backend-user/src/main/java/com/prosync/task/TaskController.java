package com.prosync.task;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    public List<Task> list(@RequestParam UUID workspaceId) {
        return service.findByWorkspace(workspaceId);
    }

    @GetMapping("/all")
    public List<Task> listAll() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@RequestBody @Valid TaskRequest req, Authentication auth) {
        return service.create(req, auth.getName());
    }

    @PatchMapping("/{id}/status")
    public Task updateStatus(@PathVariable UUID id,
                             @RequestBody @Valid TaskStatusRequest req,
                             Authentication auth) {
        return service.updateStatus(id, req.status(), auth.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, Authentication auth) {
        service.delete(id, auth.getName());
    }
}
