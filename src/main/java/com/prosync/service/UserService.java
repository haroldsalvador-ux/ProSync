package com.prosync.service;

import com.prosync.entity.User;
import com.prosync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public User registrar(User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new RuntimeException("El nombre de usuario es obligatorio");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new RuntimeException("El email es obligatorio");
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new RuntimeException("La contraseña debe tener al menos 6 caracteres");
        }
        if (repository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Ya existe una cuenta con ese email");
        }
        if (repository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Ese nombre de usuario ya está en uso");
        }
        user.setPassword(hashPassword(user.getPassword()));
        return repository.save(user);
    }

    public Map<String, Object> login(String email, String password) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email o contraseña incorrectos"));

        if (!hashPassword(password).equals(user.getPassword())) {
            throw new RuntimeException("Email o contraseña incorrectos");
        }

        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail()
        );
    }

    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar la contraseña");
        }
    }
}