package com.example.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class User {

    @Id
    @GeneratedValue
    private UUID id;

    private String phone;
    private String email;
    private String password;

    @Column(columnDefinition = "TEXT")
    private String profilePicture;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String status;
}
