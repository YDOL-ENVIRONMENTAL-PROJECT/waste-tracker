package com.example.backend.dto.driver;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DriverResponse {
    private UUID id;
    private String name;
    private String lastname;
    private String email;
    private String phone;
    private String town;
    private String quarter;
    private String site;
    private LocalDate dateOfBirth;
    private String status;
    private LocalDateTime createdAt;
}
