package com.example.backend.dto.request;

import com.example.backend.model.enums.RescueEquipment;
import com.example.backend.model.enums.RescueVehicleStatus;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueVehicleRequest {
	private String licensePlate;
	private String model;
	private String companyId;
	private List<RescueEquipment> equipmentDetails;
	private RescueVehicleStatus status; // optional khi tạo mới
}