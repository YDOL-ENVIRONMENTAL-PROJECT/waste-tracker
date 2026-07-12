package com.example.backend.model;

import com.example.backend.model.enums.AdminRole;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admin extends User {

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    private AdminRole role;

    private String site;
}
