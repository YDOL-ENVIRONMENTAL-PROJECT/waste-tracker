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
public class IndividualClient extends Client {

    private String firstName;
    private String lastName;

    private LocalDate dateOfBirth;
}
