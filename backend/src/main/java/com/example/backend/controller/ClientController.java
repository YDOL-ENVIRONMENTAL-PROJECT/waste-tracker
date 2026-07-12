package com.example.backend.controller;

import com.example.backend.dto.client.ClientResponse;
import com.example.backend.service.ClientService;
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
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Tag(name = "Clients", description = "Gestion des clients")
@SecurityRequirement(name = "bearerAuth")
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @Operation(summary = "Liste des clients", description = "Retourne la liste des clients actifs")
    public ResponseEntity<List<ClientResponse>> getAll() {
        return ResponseEntity.ok(clientService.getAll());
    }

    @GetMapping("/count")
    @Operation(summary = "Nombre de clients", description = "Retourne le nombre de clients actifs")
    public ResponseEntity<Long> getCount() {
        long count = clientService.getAll().size();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détails d'un client", description = "Retourne les détails d'un client")
    public ResponseEntity<ClientResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.getById(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archiver un client", description = "Archive un client")
    public ResponseEntity<Void> archive(@PathVariable UUID id) {
        clientService.archive(id);
        return ResponseEntity.noContent().build();
    }
}
