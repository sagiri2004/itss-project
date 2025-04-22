package com.example.backend.model;

import com.example.backend.model.enums.RescueVehicleDispatchStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueVehicleDispatch {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;

	@ManyToOne
	@JoinColumn(name = "request_id")
	private RescueRequest rescueRequest;

	@ManyToOne
	@JoinColumn(name = "vehicle_id")
	private RescueVehicle rescueVehicle;

	@CreationTimestamp
	private LocalDateTime dispatchedAt;

	private LocalDateTime arrivedAt;

	private LocalDateTime completedAt;

	private String dispatchNotes;

	@Enumerated(EnumType.STRING)
	private RescueVehicleDispatchStatus status;
}