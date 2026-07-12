package com.example.backend.service;

import com.example.backend.dto.client.ClientRequest;
import com.example.backend.dto.client.ClientResponse;
import com.example.backend.model.Client;
import com.example.backend.model.Enterprise;
import com.example.backend.model.IndividualClient;
import com.example.backend.repository.ClientRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    public List<ClientResponse> getAll() {
        return clientRepository.findAll().stream()
                .filter(c -> !"ARCHIVED".equals(c.getStatus()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ClientResponse getByEmail(String email) {
        Client client = clientRepository.findByEmail(email)
                .filter(c -> !"ARCHIVED".equals(c.getStatus()))
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        return toResponse(client);
    }

    public ClientResponse getById(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Client not found: " + id));
        return toResponse(client);
    }

    public ClientResponse update(UUID id, ClientRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Client not found: " + id));

        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setTown(request.getTown());
        client.setQuarter(request.getQuarter());
        if (request.getProfilePicture() != null) {
            client.setProfilePicture(request.getProfilePicture());
        }
        if (request.getType() != null) {
            client.setType(request.getType());
        }
        client.setUpdatedAt(LocalDateTime.now());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            client.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (client instanceof IndividualClient individual) {
            if (request.getFirstName() != null) {
                individual.setFirstName(request.getFirstName());
            }
            if (request.getLastName() != null) {
                individual.setLastName(request.getLastName());
            }
            if (request.getDateOfBirth() != null) {
                individual.setDateOfBirth(request.getDateOfBirth());
            }
        } else if (client instanceof Enterprise enterprise) {
            if (request.getName() != null) {
                enterprise.setName(request.getName());
            }
        }

        return toResponse(clientRepository.save(client));
    }

    public void archive(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Client not found: " + id));
        client.setStatus("ARCHIVED");
        client.setUpdatedAt(LocalDateTime.now());
        clientRepository.save(client);
    }

    private ClientResponse toResponse(Client client) {
        ClientResponse.ClientResponseBuilder builder = ClientResponse.builder()
                .id(client.getId())
                .email(client.getEmail())
                .phone(client.getPhone())
                .town(client.getTown())
                .quarter(client.getQuarter())
                .profilePicture(client.getProfilePicture())
                .type(client.getType())
                .status(client.getStatus())
                .createdAt(client.getCreatedAt());

        if (client instanceof IndividualClient individual) {
            builder.name(individual.getFirstName())
                    .surname(individual.getLastName())
                    .dateOfBirth(individual.getDateOfBirth());
        } else if (client instanceof Enterprise enterprise) {
            builder.name(enterprise.getName());
        }

        return builder.build();
    }
}
