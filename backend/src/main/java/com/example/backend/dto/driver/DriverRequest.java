package com.example.backend.dto.driver;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;


@Data
public class DriverRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank
    @Email
    private String email;
    private String password;
    private String phone;
    private String town;
    private String quarter;
    private String site;
    private String profilePicture;
    private LocalDate dateOfBirth;
}
