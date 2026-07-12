package com.example.backend.service;

import com.example.backend.dto.driver.DriverRequest;
import com.example.backend.dto.driver.DriverResponse;
import com.example.backend.model.Driver;
import com.example.backend.repository.DriverRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;

    public List<DriverResponse> getAll() {
        return driverRepository.findAll().stream()
                .filter(d -> !"ARCHIVED".equals(d.getStatus()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DriverResponse getByEmail(String email) {
        Driver driver = driverRepository.findByEmail(email)
                .filter(d -> !"ARCHIVED".equals(d.getStatus()))
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        return toResponse(driver);
    }

    public DriverResponse create(DriverRequest request) {
        Driver driver = new Driver();
        driver.setFirstName(request.getFirstName());
        driver.setLastName(request.getLastName());
        driver.setEmail(request.getEmail());
        driver.setPhone(request.getPhone());
        driver.setTown(request.getTown());
        driver.setQuarter(request.getQuarter());
        driver.setSite(request.getSite());
        driver.setDateOfBirth(request.getDateOfBirth());
        driver.setStatus("ACTIVE");
        driver.setCreatedAt(LocalDateTime.now());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            driver.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return toResponse(driverRepository.save(driver));
    }

    public DriverResponse update(UUID id, DriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found: " + id));
        driver.setFirstName(request.getFirstName());
        driver.setLastName(request.getLastName());
        driver.setEmail(request.getEmail());
        driver.setPhone(request.getPhone());
        driver.setTown(request.getTown());
        driver.setQuarter(request.getQuarter());
        driver.setSite(request.getSite());
        driver.setDateOfBirth(request.getDateOfBirth());
        if (request.getProfilePicture() != null) {
            driver.setProfilePicture(request.getProfilePicture());
        }
        driver.setUpdatedAt(LocalDateTime.now());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            driver.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return toResponse(driverRepository.save(driver));
    }

    public void archive(UUID id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found: " + id));
        driver.setStatus("ARCHIVED");
        driver.setUpdatedAt(LocalDateTime.now());
        driverRepository.save(driver);
    }

    private DriverResponse toResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .email(driver.getEmail())
                .phone(driver.getPhone())
                .town(driver.getTown())
                .quarter(driver.getQuarter())
                .site(driver.getSite())
                .profilePicture(driver.getProfilePicture())
                .dateOfBirth(driver.getDateOfBirth())
                .status(driver.getStatus())
                .createdAt(driver.getCreatedAt())
                .build();
    }
}
