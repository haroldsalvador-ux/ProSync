package com.prosync.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       JdbcTemplate jdbc) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil         = jwtUtil;
        this.jdbc            = jdbc;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole() != null ? user.getRole() : "USER")
                .build();
    }

    public AuthResponse register(RegisterRequest req) {
        String email = req.email().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
        String hash = passwordEncoder.encode(req.password());
        UUID id = jdbc.queryForObject(
                "INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?) RETURNING id",
                UUID.class, email, hash, req.fullName().trim());
        audit(email, "USER_REGISTERED", "user", id, Map.of("email", email));
        return new AuthResponse(jwtUtil.generateToken(email), email, req.fullName().trim());
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }
        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu cuenta ha sido bloqueada por el administrador");
        }
        audit(email, "USER_LOGIN", "user", user.getId(), Map.of());
        return new AuthResponse(jwtUtil.generateToken(email), email, user.getFullName());
    }

    public void audit(String userEmail, String action, String entityType, UUID entityId, Map<String, ?> details) {
        try {
            String json = mapper.writeValueAsString(details);
            jdbc.update(
                    "INSERT INTO audit_logs (user_email, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?::jsonb)",
                    userEmail, action, entityType, entityId, json);
        } catch (Exception ignored) {}
    }
}
