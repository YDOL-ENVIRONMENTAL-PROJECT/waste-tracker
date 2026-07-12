package com.example.backend.controller;

import com.example.backend.dto.admin.AdminRequest;
import com.example.backend.dto.admin.AdminResponse;
import com.example.backend.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admins")
@RequiredArgsConstructor
@Tag(name = "Admins", description = "Gestion des administrateurs")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    @Operation(summary = "Liste des admins", description = "Retourne la liste de tous les administrateurs actifs")
    public ResponseEntity<List<AdminResponse>> getAll() {
        return ResponseEntity.ok(adminService.getAll());
    }

    @GetMapping("/count")
    @Operation(summary = "Nombre d'administrateurs", description = "Retourne le nombre d'administrateurs actifs")
    public ResponseEntity<Long> getCount() {
        long count = adminService.getAll().size();
        return ResponseEntity.ok(count);
    }

    @PostMapping
    @Operation(summary = "Créer un admin", description = "Permet au SUPER ADMIN de créer un nouvel administrateur")
    public ResponseEntity<AdminResponse> create(@Valid @RequestBody AdminRequest request) {
        return ResponseEntity.status(201).body(adminService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour son profil", description = "Met à jour le profil de l'administrateur authentifié")
    public ResponseEntity<AdminResponse> update(@PathVariable UUID id, @Valid @RequestBody AdminRequest request) {
        return ResponseEntity.ok(adminService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archiver un admin", description = "Archive un administrateur (soft delete)")
    public ResponseEntity<Void> archive(@PathVariable UUID id) {
        adminService.archive(id);
        return ResponseEntity.noContent().build();
    }
}
