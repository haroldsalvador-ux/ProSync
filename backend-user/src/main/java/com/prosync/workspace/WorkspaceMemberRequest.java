package com.prosync.workspace;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record WorkspaceMemberRequest(@NotBlank @Email String email) {}
