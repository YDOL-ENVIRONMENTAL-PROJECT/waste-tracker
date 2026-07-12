package com.example.backend.controller;

import com.example.backend.dto.driver.DriverRequest;
import com.example.backend.dto.driver.DriverResponse;
import com.example.backend.service.DriverService;
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
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@Tag(name = "Drivers", description = "Gestion des chauffeurs")
@SecurityRequirement(name = "bearerAuth")
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    @Operation(summary = "Liste des chauffeurs", description = "Liste tous les chauffeurs actifs")
    public ResponseEntity<List<DriverResponse>> getAll() {
        return ResponseEntity.ok(driverService.getAll());
    }

    @PostMapping
    @Operation(summary = "Ajouter un chauffeur", description = "Ajoute un nouveau chauffeur")
    public ResponseEntity<DriverResponse> create(@Valid @RequestBody DriverRequest request) {
        return ResponseEntity.status(201).body(driverService.create(request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archiver un chauffeur", description = "Archive un chauffeur")
    public ResponseEntity<Void> archive(@PathVariable UUID id) {
        driverService.archive(id);
        return ResponseEntity.noContent().build();
    }
}
