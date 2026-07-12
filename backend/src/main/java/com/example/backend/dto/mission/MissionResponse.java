package com.example.backend.dto.mission;

import com.example.backend.model.enums.MissionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MissionResponse {
    private Long id;
    private LocalDateTime start;
    private LocalDateTime end;
    private MissionStatus status;
    private UUID driverId;
    private String driverFullName;
    private UUID orderedById;
    private String orderedByFullName;
    private UUID vehicleId;
    private String vehicleImmatriculation;
    private String city;
    private String district;
    private String description;
    private String priority;
    private LocalDateTime createdAt;
}
