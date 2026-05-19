package com.prosync.workspace;

public record WorkspaceRequest(
        String name,
        String description,
        String department,
        String owner
) {}
