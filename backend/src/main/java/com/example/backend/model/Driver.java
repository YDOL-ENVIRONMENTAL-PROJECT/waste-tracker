package com.example.backend.model;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Driver extends User {

    private String firstName;
    private String lastName;

    private String town;
    private String quarter;

    private String site;

    private LocalDate dateOfBirth;
}
