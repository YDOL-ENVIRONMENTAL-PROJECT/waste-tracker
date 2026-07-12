package com.example.backend.service;

import com.example.backend.dto.driver.DriverRequest;
import com.example.backend.dto.driver.DriverResponse;
import com.example.backend.model.Driver;
import com.example.backend.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    public DriverResponse create(DriverRequest request) {
        Driver driver = new Driver();
        driver.setName(request.getName());
        driver.setLastname(request.getLastname());
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
        driver.setName(request.getName());
        driver.setLastname(request.getLastname());
        driver.setEmail(request.getEmail());
        driver.setPhone(request.getPhone());
        driver.setTown(request.getTown());
        driver.setQuarter(request.getQuarter());
        driver.setSite(request.getSite());
        driver.setDateOfBirth(request.getDateOfBirth());
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
                .name(driver.getName())
                .lastname(driver.getLastname())
                .email(driver.getEmail())
                .phone(driver.getPhone())
                .town(driver.getTown())
                .quarter(driver.getQuarter())
                .site(driver.getSite())
                .dateOfBirth(driver.getDateOfBirth())
                .status(driver.getStatus())
                .createdAt(driver.getCreatedAt())
                .build();
    }
}
