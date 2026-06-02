package com.prosync.auth;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(@NotBlank String fullName) {}
