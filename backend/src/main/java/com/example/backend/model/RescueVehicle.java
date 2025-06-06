package com.example.backend.model;

import com.example.backend.model.enums.RescueEquipment;
import com.example.backend.model.enums.RescueVehicleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
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

	private String name;

	private String licensePlate;

	private String model;

	private String make; // Hãng xe

	@ElementCollection(targetClass = RescueEquipment.class)
	@Enumerated(EnumType.STRING)
	@CollectionTable(name = "vehicle_equipment", joinColumns = @JoinColumn(name = "vehicle_id"))
	@Column(name = "equipment")
	private List<RescueEquipment> equipmentDetails;

	@Enumerated(EnumType.STRING)
	private RescueVehicleStatus status;

	// Vị trí hiện tại
	private Double currentLatitude;
	private Double currentLongitude;

	// Thông tin lái xe
	private String assignedDriverName;

	// Thông tin bảo trì
	private LocalDateTime lastMaintenanceDate;
	private LocalDateTime nextMaintenanceDate;

	@Column(length = 1000)
	private String maintenanceNote;

	@Column(length = 500)
	private String maintenanceReason;

	@ManyToOne
	@JoinColumn(name = "company_id")
	private RescueCompany company;

	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}
}
