package com.example.backend.dto.client;

import com.example.backend.model.enums.ClientType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ClientResponse {
    private UUID id;
    private String name;
    private String surname;
    private String email;
    private String phone;
    private String town;
    private String quarter;
    private String profilePicture;
    private ClientType type;
    private LocalDate dateOfBirth;
    private String status;
    private LocalDateTime createdAt;
}
