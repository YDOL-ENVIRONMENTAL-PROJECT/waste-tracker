package com.example.backend.dto.auth;

import com.example.backend.model.enums.AdminRole;
import com.example.backend.model.enums.ClientType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ProfileResponse {
    private UUID id;
    private String userRole;
    private String accountType;
    private String firstName;
    private String lastName;
    private String name;
    private String email;
    private String phone;
    private String town;
    private String quarter;
    private String site;
    private String profilePicture;
    private ClientType type;
    private AdminRole role;
}
