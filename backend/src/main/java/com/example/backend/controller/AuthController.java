package com.example.backend.controller;

import com.example.backend.dto.auth.*;
import com.example.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Endpoints d'authentification (login, register, mot de passe)")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Connexion", description = "Authentifie un utilisateur et retourne un token JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Inscription client", description = "Crée un compte client dans le système")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Mot de passe oublié", description = "Envoie un lien de réinitialisation par email")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Réinitialiser le mot de passe", description = "Définit un nouveau mot de passe à l'aide du token reçu par email")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    @Operation(summary = "Profil connecté", description = "Retourne le profil de l'utilisateur authentifié")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(authService.getCurrentProfile());
    }

    @PutMapping("/profile")
    @Operation(summary = "Mettre à jour le profil", description = "Met à jour le profil du client ou chauffeur authentifié")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(authService.updateCurrentProfile(request));
    }
}
