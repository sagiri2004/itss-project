package com.example.backend.dto.response;

import com.example.backend.model.enums.RescueEquipment;
import com.example.backend.model.enums.RescueVehicleStatus;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueVehicleResponse {
	private String id;
	private String name;
	private String licensePlate;
	private String model;
	private String make;
	private List<RescueEquipment> equipmentDetails;
	private RescueVehicleStatus status;
	private Double currentLatitude;
	private Double currentLongitude;
	private String assignedDriverName;
	private String companyId;
	private String companyName;
	private java.time.LocalDateTime lastMaintenanceDate;
	private java.time.LocalDateTime nextMaintenanceDate;
}
