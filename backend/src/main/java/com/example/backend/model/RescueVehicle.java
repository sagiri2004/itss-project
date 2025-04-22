package com.example.backend.model;

import com.example.backend.model.enums.RescueEquipment;
import com.example.backend.model.enums.RescueVehicleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueVehicle {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;

	private String licensePlate;

	private String model;

	@ElementCollection(targetClass = RescueEquipment.class)
	@Enumerated(EnumType.STRING)
	@CollectionTable(name = "vehicle_equipment", joinColumns = @JoinColumn(name = "vehicle_id"))
	@Column(name = "equipment")
	private List<RescueEquipment> equipmentDetails;

	@Enumerated(EnumType.STRING)
	private RescueVehicleStatus status;

	@ManyToOne
	@JoinColumn(name = "company_id")
	private RescueCompany company;
}
