package com.example.backend.dto.request;

import com.example.backend.model.enums.RescueEquipment;
import com.example.backend.model.enums.RescueVehicleStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueVehicleRequest {
	private String name;
	private String licensePlate;
	private String model;
	private String make;
	private List<RescueEquipment> equipmentDetails;
	private RescueVehicleStatus status; // optional khi tạo mới
	private Double currentLatitude;
	private Double currentLongitude;
	private String assignedDriverName;
	private String companyId;
	private LocalDateTime lastMaintenanceDate;
	private LocalDateTime nextMaintenanceDate;
}