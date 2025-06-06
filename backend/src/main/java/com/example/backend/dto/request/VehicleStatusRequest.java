package com.example.backend.dto.request;

import com.example.backend.model.enums.RescueVehicleStatus;
import lombok.Data;

@Data
public class VehicleStatusRequest {
    private RescueVehicleStatus status;
    private String maintenanceNote;
    private String maintenanceReason;
} 