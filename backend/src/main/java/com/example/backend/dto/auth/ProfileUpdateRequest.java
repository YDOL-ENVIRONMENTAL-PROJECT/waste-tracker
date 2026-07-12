package com.example.backend.dto.auth;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String name;
    @Email
    private String email;
    private String phone;
    private String town;
    private String quarter;
    private String site;
    private String profilePicture;
}
