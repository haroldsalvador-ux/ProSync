package com.prosync.auth;

public record AuthResponse(
        String token,
        String email,
        String fullName
) {}
