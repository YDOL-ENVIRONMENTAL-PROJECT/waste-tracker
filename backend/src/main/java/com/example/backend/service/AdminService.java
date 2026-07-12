package com.example.backend.service;

import com.example.backend.dto.admin.AdminRequest;
import com.example.backend.dto.admin.AdminResponse;
import com.example.backend.model.Admin;
import com.example.backend.repository.AdminRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AdminResponse> getAll() {
        return adminRepository.findAll().stream()
                .filter(a -> !"ARCHIVED".equals(a.getStatus()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AdminResponse getByEmail(String email) {
        Admin admin = adminRepository.findByEmail(email)
                .filter(a -> !"ARCHIVED".equals(a.getStatus()))
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        return toResponse(admin);
    }

    public AdminResponse create(AdminRequest request) {
        Admin admin = new Admin();
        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        admin.setEmail(request.getEmail());
        admin.setPhone(request.getPhone());
        admin.setSite(request.getSite());
        admin.setRole(request.getRole());
        admin.setStatus("ACTIVE");
        admin.setCreatedAt(LocalDateTime.now());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return toResponse(adminRepository.save(admin));
    }

    public AdminResponse update(UUID id, AdminRequest request) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + id));

        String authenticatedEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!admin.getEmail().equals(authenticatedEmail)) {
            throw new AccessDeniedException("You can only update your own profile");
        }

        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        admin.setEmail(request.getEmail());
        admin.setPhone(request.getPhone());
        admin.setSite(request.getSite());
        if (request.getProfilePicture() != null) {
            admin.setProfilePicture(request.getProfilePicture());
        }
        admin.setUpdatedAt(LocalDateTime.now());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return toResponse(adminRepository.save(admin));
    }

    public void archive(UUID id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + id));
        admin.setStatus("ARCHIVED");
        admin.setUpdatedAt(LocalDateTime.now());
        adminRepository.save(admin);
    }

    private AdminResponse toResponse(Admin admin) {
        return AdminResponse.builder()
                .id(admin.getId())
                .firstName(admin.getFirstName())
                .lastName(admin.getLastName())
                .email(admin.getEmail())
                .phone(admin.getPhone())
                .site(admin.getSite())
                .profilePicture(admin.getProfilePicture())
                .role(admin.getRole())
                .status(admin.getStatus())
                .createdAt(admin.getCreatedAt())
                .build();
    }
}
