package com.prosync.auth;

import jakarta.validation.Valid;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository repo;
    private final JdbcTemplate   jdbc;

    public UserController(UserRepository repo, JdbcTemplate jdbc) {
        this.repo = repo;
        this.jdbc = jdbc;
    }

    @GetMapping
    public List<UserResponse> list() {
        return repo.findAll().stream()
                .map(u -> new UserResponse(u.getEmail(), u.getFullName()))
                .toList();
    }

    @PatchMapping("/me")
    public UserResponse updateMe(@RequestBody @Valid UpdateProfileRequest req, Authentication auth) {
        jdbc.update("UPDATE users SET full_name = ? WHERE email = ?", req.fullName(), auth.getName());
        return new UserResponse(auth.getName(), req.fullName());
    }
}
