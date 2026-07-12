package com.example.backend.service;

import com.example.backend.dto.mission.MissionRequest;
import com.example.backend.dto.mission.MissionResponse;
import com.example.backend.model.Mission;
import com.example.backend.model.enums.MissionStatus;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.DriverRepository;
import com.example.backend.repository.MissionRepository;
import com.example.backend.repository.VehicleRepository;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class MissionService {

    private final MissionRepository missionRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final AdminRepository adminRepository;

    public List<MissionResponse> getAll() {
        return missionRepository.findAll().stream()
                .filter(m -> m.getStatus() != MissionStatus.CANCELLED)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MissionResponse create(MissionRequest request) {
        Mission mission = new Mission();
        mission.setStartTime(request.getStart());
        mission.setEndTime(request.getEnd());
        mission.setStatus(request.getStatus() != null ? request.getStatus() : MissionStatus.ON_GOING);
        mission.setCity(request.getCity());
        mission.setDistrict(request.getDistrict());
        mission.setDescription(request.getDescription());
        mission.setPriority(request.getPriority());

        if (request.getDriverId() != null) {
            driverRepository.findById(request.getDriverId()).ifPresent(mission::setExecutedBy);
        }
        if (request.getVehicleId() != null) {
            vehicleRepository.findById(request.getVehicleId()).ifPresent(mission::setVehicle);
        }
        // Attach admin from JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        adminRepository.findByEmail(email).ifPresent(mission::setOrderedBy);

        return toResponse(missionRepository.save(mission));
    }

    public MissionResponse update(Long id, MissionRequest request) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mission not found: " + id));
        mission.setStartTime(request.getStart());
        mission.setEndTime(request.getEnd());
        if (request.getStatus() != null)
            mission.setStatus(request.getStatus());
        mission.setCity(request.getCity());
        mission.setDistrict(request.getDistrict());
        mission.setDescription(request.getDescription());
        mission.setPriority(request.getPriority());

        if (request.getDriverId() != null) {
            driverRepository.findById(request.getDriverId()).ifPresent(mission::setExecutedBy);
        }
        if (request.getVehicleId() != null) {
            vehicleRepository.findById(request.getVehicleId()).ifPresent(mission::setVehicle);
        }
        return toResponse(missionRepository.save(mission));
    }

    public void delete(Long id) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mission not found: " + id));
        mission.setStatus(MissionStatus.CANCELLED);
        missionRepository.save(mission);
    }

    private MissionResponse toResponse(Mission mission) {
        return MissionResponse.builder()
                .id(mission.getId())
                .start(mission.getStartTime())
                .end(mission.getEndTime())
                .status(mission.getStatus())
                .driverId(mission.getExecutedBy() != null ? mission.getExecutedBy().getId() : null)
                .driverFullName(mission.getExecutedBy() != null ? mission.getExecutedBy().getFirstName() +" "+ mission.getExecutedBy().getLastName() : null)
                .orderedById(mission.getOrderedBy() != null ? mission.getOrderedBy().getId() : null)
                .orderedByFullName(mission.getOrderedBy() != null ? mission.getOrderedBy().getFirstName() +" "+ mission.getOrderedBy().getLastName() : null)
                .vehicleId(mission.getVehicle() != null ? mission.getVehicle().getId() : null)
                .vehicleImmatriculation(mission.getVehicle() != null ? mission.getVehicle().getImmatriculation() : null)
                .city(mission.getCity())
                .district(mission.getDistrict())
                .description(mission.getDescription())
                .priority(mission.getPriority())
                .createdAt(mission.getCreatedAt())
                .build();
    }
}
