package com.example.backend.dto.response;

import com.example.backend.model.enums.RescueEquipment;
import com.example.backend.model.enums.RescueRequestStatus;
import com.example.backend.model.enums.RescueVehicleStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RescueRequestResponse {
	private String id;
	private String userId;
	private String serviceId;
	private String serviceName;
	private String companyId;
	private String companyName;
	private Double latitude;
	private Double longitude;
	private String description;
	private Double estimatedPrice;
	private Double finalPrice;
	private RescueRequestStatus status;
	private LocalDateTime createdAt;
	private String notes;

	// Thông tin bổ sung từ RescueService
	private RescueServiceResponse rescueServiceDetails;

	// Thông tin bổ sung từ RescueVehicle (nếu có)
	private String vehicleLicensePlate;
	private String vehicleModel;
	private List<RescueEquipment> vehicleEquipmentDetails;
	private RescueVehicleStatus vehicleStatus;
}
