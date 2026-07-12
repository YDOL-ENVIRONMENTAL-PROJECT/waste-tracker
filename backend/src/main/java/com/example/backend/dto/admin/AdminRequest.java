package com.example.backend.dto.admin;

import com.example.backend.model.enums.AdminRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank
    @Email
    private String email;
    private String password;
    private String phone;
    private String site;
    private String profilePicture;
    private AdminRole role;
}
