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
	private String licensePlate;
	private String model;
	private String companyId;
	private String companyName;
	private List<RescueEquipment> equipmentDetails;
	private RescueVehicleStatus status;
}
