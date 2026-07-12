package com.example.backend.model;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Enterprise extends Client {

    // Rien pour l'instant (extensible plus tard)
    private String name;
}
