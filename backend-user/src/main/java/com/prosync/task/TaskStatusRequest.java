package com.prosync.task;

import jakarta.validation.constraints.NotBlank;

public record TaskStatusRequest(@NotBlank String status) {}
