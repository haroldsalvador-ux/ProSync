package com.prosync.workspace;

import com.prosync.auth.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService service;

    public WorkspaceController(WorkspaceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Workspace> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Workspace create(@RequestBody WorkspaceRequest req) {
        return service.create(req);
    }

    // ─── Miembros ────────────────────────────────────────────────────────────

    @GetMapping("/{id}/members")
    public List<UserResponse> getMembers(@PathVariable UUID id) {
        return service.getMembers(id);
    }

    @PostMapping("/{id}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse addMember(@PathVariable UUID id,
                                  @RequestBody @Valid WorkspaceMemberRequest req) {
        return service.addMember(id, req.email());
    }

    @DeleteMapping("/{id}/members/{email}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@PathVariable UUID id, @PathVariable String email) {
        service.removeMember(id, email);
    }
}
