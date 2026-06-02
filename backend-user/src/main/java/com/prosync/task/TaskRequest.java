package com.prosync.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record TaskRequest(
        @NotNull UUID workspaceId,
        @NotBlank String title,
        String description,
        String status,
        String priority,
        String assignee,
        LocalDate dueDate
) {}
