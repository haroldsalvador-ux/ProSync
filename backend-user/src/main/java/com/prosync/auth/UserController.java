package com.prosync.auth;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<UserResponse> list() {
        return repo.findAll().stream()
                .map(u -> new UserResponse(u.getEmail(), u.getFullName()))
                .toList();
    }
}
