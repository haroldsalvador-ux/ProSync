package com.prosync.controller;

import com.prosync.entity.User;
import com.prosync.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService service;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registrar(@RequestBody User user) {
        service.registrar(user);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario registrado correctamente"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        Map<String, Object> usuario = service.login(
                body.get("email"),
                body.get("password")
        );
        return ResponseEntity.ok(usuario);
    }
}